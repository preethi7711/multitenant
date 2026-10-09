from dataclasses import dataclass
from threading import Lock


@dataclass
class ApiMetrics:
    requests: int = 0
    failed_requests: int = 0
    total_latency_ms: float = 0


_metrics = ApiMetrics()
_lock = Lock()


def record_request(*, status_code: int, latency_ms: float) -> None:
    with _lock:
        _metrics.requests += 1
        _metrics.total_latency_ms += latency_ms
        if status_code >= 400:
            _metrics.failed_requests += 1


def snapshot() -> dict:
    with _lock:
        average_latency = (
            _metrics.total_latency_ms / _metrics.requests
            if _metrics.requests
            else 0
        )
        return {
            "requests": _metrics.requests,
            "failed_requests": _metrics.failed_requests,
            "average_latency_ms": round(average_latency, 2),
            "scope": "current API instance",
        }
