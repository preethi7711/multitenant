# -*- coding: utf-8 -*-
"""
End-to-end API smoke test for Task Management System.
Tests: register -> login -> get profile -> list tasks -> create -> update -> refresh
"""
import sys
import io
import requests
import random
import string

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE = "http://localhost:8000/api/v1"
rand_suffix = "".join(random.choices(string.ascii_lowercase, k=6))
EMAIL = f"smoketest_{rand_suffix}@example.com"
PASSWORD = "TestPass123!"
ORG_NAME = f"TestOrg_{rand_suffix}"

results = []

SEP = "=" * 50

def test(name, condition, detail=""):
    icon = "PASS" if condition else "FAIL"
    detail_str = f" -- {detail}" if detail else ""
    print(f"  [{icon}]  {name}{detail_str}")
    results.append((name, condition))

print(f"\n{SEP}")
print("  Task Management System -- E2E Smoke Test")
print(f"{SEP}\n")
print(f"  User  : {EMAIL}")
print(f"  Org   : {ORG_NAME}")
print()

# ── 1. Health ────────────────────────────────────────────────────────
print("[ 1. Health Check ]")
try:
    r = requests.get("http://localhost:8000/health", timeout=5)
    test("Health endpoint returns 200", r.status_code == 200)
    test("Status is healthy", r.json().get("status") == "healthy",
         str(r.json()))
except Exception as e:
    test("Health endpoint reachable", False, str(e))

# ── 2. Register ──────────────────────────────────────────────────────
print("\n[ 2. Register ]")
try:
    r = requests.post(f"{BASE}/auth/register", json={
        "email": EMAIL,
        "password": PASSWORD,
        "full_name": "Smoke Tester",
        "organization_name": ORG_NAME
    }, timeout=10)
    test("Register returns 201", r.status_code == 201,
         f"Got {r.status_code}: {r.text[:300]}")
    data = r.json() if r.ok else {}
    test("success=True in response", data.get("success") is True)
    tokens = data.get("data", {})
    test("access_token in response", "access_token" in tokens)
    test("refresh_token in response", "refresh_token" in tokens)
    access_token = tokens.get("access_token", "")
    refresh_token = tokens.get("refresh_token", "")
except Exception as e:
    test("Register request succeeded", False, str(e))
    access_token = ""
    refresh_token = ""

headers = {"Authorization": f"Bearer {access_token}"}

# ── 3. Login ─────────────────────────────────────────────────────────
print("\n[ 3. Login ]")
try:
    r = requests.post(f"{BASE}/auth/login", json={
        "email": EMAIL,
        "password": PASSWORD
    }, timeout=10)
    test("Login returns 200", r.status_code == 200,
         f"Got {r.status_code}: {r.text[:300]}")
    login_data = r.json() if r.ok else {}
    test("access_token in login response", "access_token" in login_data.get("data", {}))
    if login_data.get("data", {}).get("access_token"):
        access_token = login_data["data"]["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
except Exception as e:
    test("Login request succeeded", False, str(e))

# ── 4. Get Profile ───────────────────────────────────────────────────
print("\n[ 4. Get Profile (/auth/me) ]")
try:
    r = requests.get(f"{BASE}/auth/me", headers=headers, timeout=10)
    test("GET /auth/me returns 200", r.status_code == 200,
         f"Got {r.status_code}: {r.text[:300]}")
    me_data = r.json() if r.ok else {}
    profile = me_data.get("data", {})
    test("Email matches registered email", profile.get("email") == EMAIL)
    test("Organization ID is present", bool(profile.get("organization_id")))
    test("Role is present", bool(profile.get("role")))
except Exception as e:
    test("Profile request succeeded", False, str(e))

# ── 5. List Tasks ────────────────────────────────────────────────────
print("\n[ 5. List Tasks (GET /tasks) ]")
try:
    r = requests.get(f"{BASE}/tasks", headers=headers, timeout=10)
    test("GET /tasks returns 200", r.status_code == 200,
         f"Got {r.status_code}: {r.text[:300]}")
    task_list_data = r.json() if r.ok else {}
    # Handle both {data: []} and {data: {tasks: []}} shapes
    inner = task_list_data.get("data", [])
    items = inner if isinstance(inner, list) else inner.get("tasks", inner.get("items", []))
    test("Tasks response is a list", isinstance(items, list), type(items).__name__)
except Exception as e:
    test("Tasks list request succeeded", False, str(e))

# ── 6. Create Task ────────────────────────────────────────────────────
print("\n[ 6. Create Task (POST /tasks) ]")
task_id = None
try:
    r = requests.post(f"{BASE}/tasks", headers=headers, json={
        "title": "Smoke Test Task",
        "description": "Created by automated E2E test",
        "priority": "high",
        "status": "todo"
    }, timeout=10)
    test("POST /tasks returns 201", r.status_code == 201,
         f"Got {r.status_code}: {r.text[:300]}")
    created = r.json() if r.ok else {}
    task = created.get("data", {})
    task_id = task.get("id")
    test("Created task has an ID", bool(task_id))
    test("Title matches", task.get("title") == "Smoke Test Task")
    test("Priority is 'high'", task.get("priority") == "high")
    test("Status is 'todo'", task.get("status") == "todo")
except Exception as e:
    test("Create task request succeeded", False, str(e))

# ── 7. Get Single Task ────────────────────────────────────────────────
if task_id:
    print(f"\n[ 7. Get Single Task (GET /tasks/{task_id}) ]")
    try:
        r = requests.get(f"{BASE}/tasks/{task_id}", headers=headers, timeout=10)
        test("GET /tasks/{id} returns 200", r.status_code == 200,
             f"Got {r.status_code}: {r.text[:300]}")
        single = r.json() if r.ok else {}
        test("Returned task ID matches", single.get("data", {}).get("id") == task_id)
    except Exception as e:
        test("Get single task request succeeded", False, str(e))

    # ── 8. Update Task ────────────────────────────────────────────────
    print(f"\n[ 8. Update Task (PATCH /tasks/{task_id}) ]")
    try:
        r = requests.patch(f"{BASE}/tasks/{task_id}", headers=headers, json={
            "status": "in_progress",
            "title": "Smoke Test Task (Updated)"
        }, timeout=10)
        test("PATCH /tasks/{id} returns 200", r.status_code == 200,
             f"Got {r.status_code}: {r.text[:300]}")
        updated = r.json() if r.ok else {}
        task_upd = updated.get("data", {})
        test("Status updated to 'in_progress'", task_upd.get("status") == "in_progress")
        test("Title updated correctly", task_upd.get("title") == "Smoke Test Task (Updated)")
    except Exception as e:
        test("Update task request succeeded", False, str(e))

# ── 9. Refresh Token ──────────────────────────────────────────────────
print("\n[ 9. Refresh Token (POST /auth/refresh) ]")
if refresh_token:
    try:
        r = requests.post(f"{BASE}/auth/refresh",
                          json={"refresh_token": refresh_token}, timeout=10)
        test("POST /auth/refresh returns 200", r.status_code == 200,
             f"Got {r.status_code}: {r.text[:300]}")
        refreshed = r.json() if r.ok else {}
        test("New access_token received", bool(refreshed.get("data", {}).get("access_token")))
    except Exception as e:
        test("Refresh token request succeeded", False, str(e))
else:
    test("Refresh token was available to test", False, "no token from register step")

# ── Summary ───────────────────────────────────────────────────────────
passed = sum(1 for _, ok in results if ok)
failed = sum(1 for _, ok in results if not ok)
total  = len(results)

print(f"\n{SEP}")
print(f"  RESULTS: {passed}/{total} passed  |  {failed} failed")
print(SEP)

if failed:
    print("\n  Failed tests:")
    for name, ok in results:
        if not ok:
            print(f"    - {name}")

if failed == 0:
    print("\n  ALL TESTS PASSED -- System is fully functional!")
else:
    print(f"\n  {failed} test(s) need attention (see above).")
print()
