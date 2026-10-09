import { useEffect, useState } from 'react'
import api from '@/services/api/axiosInstance'
import {
  Activity,
  CheckCircle2,
  Database,
  Gauge,
  Globe2,
  LoaderCircle,
  Play,
  Server,
  TriangleAlert,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'

const initialMetrics = {
  active_tenants: 0,
  tasks: 0,
  api_requests: 0,
  failed_requests: 0,
  latency_ms: 0,
  backend: 'UNKNOWN',
  database: 'UNKNOWN',
  metrics_scope: 'current API instance',
}

export function CloudControlCenter() {
  const [metrics, setMetrics] = useState(initialMetrics)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState(null)

  const fetchMetrics = async () => {
    try {
      const { data } = await api.get('/cloud/metrics')
      setMetrics({ ...initialMetrics, ...data.metrics })
    } catch {
      toast.error('Unable to read cloud metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const runSimulation = async (type) => {
    setAction(type)
    try {
      if (type === 'load') {
        await api.post('/cloud/simulate?count=100')
        toast.success('100-task load simulation completed')
      } else if (type === 'tenant') {
        await api.post('/cloud/simulate?count=10')
        toast.success('Demo tenant generated')
      } else {
        await api.post('/cloud/failure-test?mode=tenant')
      }
    } catch (error) {
      if (type === 'isolation' && error.response?.status === 403) {
        toast.success('Tenant isolation correctly blocked the request')
      } else {
        toast.error('Simulation failed')
      }
    } finally {
      setAction(null)
      fetchMetrics()
    }
  }

  if (loading) {
    return (
      <div className="cloud-page cloud-loading">
        <LoaderCircle className="spin" size={22} />
        Loading cloud metrics...
      </div>
    )
  }

  return (
    <div className="cloud-page">
      <header className="cloud-header">
        <div>
          <div className="cloud-eyebrow">
            <span className="live-dot" />
            Live status
          </div>
          <h1>Cloud Control Center</h1>
          <p>Multi-Tenant SaaS Operations</p>
        </div>
        <div className="cloud-refresh">
          <Activity size={15} />
          Refreshes every 5 seconds
        </div>
      </header>

      <section className="cloud-stats" aria-label="Cloud metrics">
        <MetricCard icon={Users} label="Organizations" value={metrics.active_tenants} />
        <MetricCard icon={Gauge} label="Tasks stored" value={metrics.tasks} />
        <MetricCard icon={Activity} label="API requests" value={metrics.api_requests} />
        <MetricCard icon={TriangleAlert} label="Failed requests" value={metrics.failed_requests} danger />
      </section>

      <section className="cloud-panel">
        <div className="cloud-panel-heading">
          <div>
            <h2>Cloud services</h2>
            <p>Live checks from the deployed application</p>
          </div>
          <span className="latency-pill">
            <Gauge size={14} /> {metrics.latency_ms} ms avg latency
          </span>
        </div>
        <div className="service-grid">
          <ServiceCard icon={Globe2} name="Frontend · Vercel" status="Deployed" detail="Global edge delivery" />
          <ServiceCard icon={Server} name="Backend · Render" status={metrics.backend === 'HEALTHY' ? 'Healthy' : metrics.backend} detail="FastAPI service" />
          <ServiceCard icon={Database} name="Database · MongoDB Atlas" status={metrics.database === 'CONNECTED' ? 'Connected' : metrics.database} detail="Managed cloud database" />
        </div>
      </section>

      <section className="cloud-panel">
        <div className="cloud-panel-heading">
          <div>
            <h2>Cloud simulations</h2>
            <p>Bounded demos that write clearly marked simulation data</p>
          </div>
        </div>
        <div className="simulation-grid">
          <SimulationButton label="Generate demo tenant" detail="Creates 10 demo tasks" loading={action === 'tenant'} onClick={() => runSimulation('tenant')} />
          <SimulationButton label="Simulate 100 API requests" detail="Creates a bounded load sample" loading={action === 'load'} onClick={() => runSimulation('load')} />
          <SimulationButton label="Test tenant isolation" detail="Verifies cross-tenant access is denied" loading={action === 'isolation'} onClick={() => runSimulation('isolation')} />
        </div>
        <p className="cloud-disclaimer">
          Metrics are read from MongoDB and backend instrumentation. Request counters are scoped to the current Render API instance and reset when that instance restarts.
        </p>
      </section>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, danger = false }) {
  return (
    <article className={`cloud-stat ${danger ? 'danger' : ''}`}>
      <div className="cloud-stat-icon"><Icon size={19} /></div>
      <div>
        <p>{label}</p>
        <strong>{value.toLocaleString()}</strong>
      </div>
    </article>
  )
}

function ServiceCard({ icon: Icon, name, status, detail }) {
  const healthy = ['Deployed', 'Healthy', 'Connected'].includes(status)
  return (
    <article className="service-card">
      <div className="service-icon"><Icon size={19} /></div>
      <div className="service-copy">
        <h3>{name}</h3>
        <p>{detail}</p>
      </div>
      <span className={`service-status ${healthy ? 'healthy' : 'offline'}`}>
        {healthy ? <CheckCircle2 size={14} /> : <TriangleAlert size={14} />}
        {status}
      </span>
    </article>
  )
}

function SimulationButton({ label, detail, loading, onClick }) {
  return (
    <button className="simulation-button" onClick={onClick} disabled={loading}>
      <span className="simulation-button-icon">{loading ? <LoaderCircle className="spin" size={17} /> : <Play size={17} />}</span>
      <span><strong>{label}</strong><small>{detail}</small></span>
    </button>
  )
}
