"""
Shared AgentService dependency for all routers.
Lazy initialization to avoid startup failures.
"""

from typing import Optional

from app.services.agents import AgentService

_agent_service: Optional[AgentService] = None


def get_agent_service() -> AgentService:
    """Get or create the shared AgentService instance."""
    global _agent_service
    if _agent_service is None:
        _agent_service = AgentService()
    return _agent_service

