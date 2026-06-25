"""Tests for graph_client.py (mock mode only)."""

import os
import asyncio
import pytest
from mcp_meta_gama.graph_client import GraphClient


@pytest.fixture
def graph_client_mock():
    """Create graph client in mock mode."""
    os.environ["PUBLISH_MOCK"] = "true"
    return GraphClient(mock=True)


@pytest.mark.asyncio
async def test_get_account_insights_mock(graph_client_mock):
    """Test getting mock account insights."""
    result = await graph_client_mock.get_account_insights(
        ig_user_id="17841400663280001",
        token="test-token",
    )
    assert "data" in result
    assert len(result["data"]) > 0


@pytest.mark.asyncio
async def test_get_comments_mock(graph_client_mock):
    """Test getting mock comments."""
    result = await graph_client_mock.get_comments(
        ig_user_id="17841400663280001",
        token="test-token",
    )
    assert "data" in result
    assert len(result["data"]) > 0


@pytest.mark.asyncio
async def test_poll_container_mock(graph_client_mock):
    """Test polling a mock container."""
    result = await graph_client_mock.poll_container(
        container_id="123456789",
        token="test-token",
    )
    assert result["status_code"] == "FINISHED"
    assert result["id"] == "123456789"


@pytest.mark.asyncio
async def test_get_publish_limit_mock(graph_client_mock):
    """Test getting mock publish limit."""
    result = await graph_client_mock.get_publish_limit(
        ig_user_id="17841400663280001",
        token="test-token",
    )
    assert "config" in result
    assert "quota_usage" in result


@pytest.mark.asyncio
async def test_close(graph_client_mock):
    """Test closing the client."""
    await graph_client_mock.close()
    # Should not raise


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
