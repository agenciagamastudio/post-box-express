"""Tests for tools (all mock mode)."""

import os
import pytest
from mcp_meta_gama.token_store import TokenStore
from mcp_meta_gama.graph_client import GraphClient
from mcp_meta_gama.tools import accounts, insights, comments, limits


@pytest.fixture
def token_store_mock():
    """Create token store in mock mode."""
    os.environ["SUPABASE_MOCK"] = "true"
    return TokenStore()


@pytest.fixture
def graph_client_mock():
    """Create graph client in mock mode."""
    os.environ["PUBLISH_MOCK"] = "true"
    return GraphClient(mock=True)


@pytest.mark.asyncio
async def test_list_connected_accounts(token_store_mock):
    """Test list_connected_accounts tool."""
    result = await accounts.list_connected_accounts(token_store_mock)
    assert result["ok"] is True
    assert len(result["data"]) == 2
    assert result["data"][0]["client_id"] == "test-client-1"


@pytest.mark.asyncio
async def test_get_account(token_store_mock):
    """Test get_account tool."""
    result = await accounts.get_account("test-client-1", token_store_mock)
    assert result["ok"] is True
    assert result["data"]["client_id"] == "test-client-1"
    assert result["data"]["ig_username"] == "test_account"


@pytest.mark.asyncio
async def test_get_account_not_found(token_store_mock):
    """Test get_account with non-existent client."""
    result = await accounts.get_account("non-existent", token_store_mock)
    assert result["ok"] is False
    assert "error" in result and result["error"]


@pytest.mark.asyncio
async def test_get_ig_insights(token_store_mock, graph_client_mock):
    """Test get_ig_insights tool."""
    result = await insights.get_ig_insights(
        client_id="test-client-1",
        token_store=token_store_mock,
        graph_client=graph_client_mock,
    )
    assert result["ok"] is True
    assert "data" in result


@pytest.mark.asyncio
async def test_get_ig_insights_not_found(token_store_mock, graph_client_mock):
    """Test get_ig_insights with non-existent account."""
    result = await insights.get_ig_insights(
        client_id="non-existent",
        token_store=token_store_mock,
        graph_client=graph_client_mock,
    )
    assert result["ok"] is False


@pytest.mark.asyncio
async def test_get_comments(token_store_mock, graph_client_mock):
    """Test get_comments tool."""
    result = await comments.get_comments(
        client_id="test-client-1",
        token_store=token_store_mock,
        graph_client=graph_client_mock,
    )
    assert result["ok"] is True
    assert "data" in result


@pytest.mark.asyncio
async def test_get_publish_limit(token_store_mock, graph_client_mock):
    """Test get_publish_limit tool."""
    result = await limits.get_publish_limit(
        client_id="test-client-1",
        token_store=token_store_mock,
        graph_client=graph_client_mock,
    )
    assert result["ok"] is True
    assert "data" in result


@pytest.mark.asyncio
async def test_refresh_tokens(token_store_mock, graph_client_mock):
    """Test refresh_tokens tool (v1: delegated to backend)."""
    result = await limits.refresh_tokens(
        client_id="test-client-1",
        token_store=token_store_mock,
        graph_client=graph_client_mock,
    )
    assert result["ok"] is False  # v1: delegated to Node.js scheduler


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
