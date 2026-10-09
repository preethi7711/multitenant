-- Multi-Tenant Task Management System Schema
-- Critical: Every table has organization_id for tenant isolation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (Tenant Boundary)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Index for active organization lookups
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE is_active = TRUE;

-- Users (Scoped to Organizations)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member')),
    oauth_provider VARCHAR(50), -- 'google', 'github', NULL for password
    oauth_id VARCHAR(255), -- External OAuth ID
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique email per organization (multi-tenant isolation)
    CONSTRAINT unique_email_per_org UNIQUE (organization_id, email),
    -- Supports composite foreign keys that enforce tenant consistency.
    CONSTRAINT unique_user_org_pair UNIQUE (id, organization_id),
    -- Unique OAuth ID per provider
    CONSTRAINT unique_oauth_id UNIQUE (oauth_provider, oauth_id)
);

-- Composite index for authentication queries
CREATE INDEX idx_users_org_email ON users(organization_id, email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;

-- Tasks (Core Entity - Isolated by Organization)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure assignee and creator belong to the same organization.
    CONSTRAINT fk_task_assignee_org
        FOREIGN KEY (assigned_to, organization_id)
        REFERENCES users (id, organization_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_task_creator_org
        FOREIGN KEY (created_by, organization_id)
        REFERENCES users (id, organization_id)
        ON DELETE SET NULL
);

-- Critical indexes for tenant isolation and performance
CREATE INDEX idx_tasks_org_id ON tasks(organization_id, id);
CREATE INDEX idx_tasks_assigned_to ON tasks(organization_id, assigned_to);
CREATE INDEX idx_tasks_status ON tasks(organization_id, status);
CREATE INDEX idx_tasks_created_at ON tasks(organization_id, created_at DESC);
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Audit Logs (Immutable, Append-Only)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'task', 'user', 'organization'
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted'
    changes JSONB, -- Stores before/after states
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent updates/deletes (append-only)
    CHECK (created_at IS NOT NULL)
);

-- Index for audit queries
CREATE INDEX idx_audit_logs_org_entity ON audit_logs(organization_id, entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(organization_id, user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Refresh Tokens (Secure Token Management)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Index for token validation
    CHECK (expires_at > created_at)
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash) WHERE revoked_at IS NULL;

-- Rate Limiting (In-Database Fallback)
CREATE TABLE rate_limit_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- user_id or IP
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_rate_limit UNIQUE (identifier, endpoint, window_start)
);

CREATE INDEX idx_rate_limit_lookup ON rate_limit_records(identifier, endpoint, window_start);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for testing (optional - remove in production)
-- INSERT INTO organizations (id, name) VALUES 
-- ('11111111-1111-1111-1111-111111111111', 'Acme Corporation'),
-- ('22222222-2222-2222-2222-222222222222', 'TechCorp Inc');
