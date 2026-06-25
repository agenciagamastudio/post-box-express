"""Tests for publish tools (mock mode)."""

import os
import pytest
from mcp_meta_gama.token_store import TokenStore
from mcp_meta_gama.graph_client import GraphClient
from mcp_meta_gama.tools import publish


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
async def test_publish_ig_image(token_store_mock, graph_client_mock):
    """Test publish_ig_image tool."""
    result = await publish.publish_ig_image(
        client_id="test-client-1",
        ig_user_id="17841400663280001",
        image_url="https://example.com/image.jpg",
        caption="Test image",
        token_store=token_store_mock,
        graph_client=graph_client_mock,
    )
    assert result["ok"] is True
    assert "media_id" in result["data"]
    assert result["data"]["status"] == "published"


@pytest.mark.asyncio
async def test_publish_ig_image_missing_token(token_store_mock, graph_client_mock):
    """Test publish_ig_image with missing token."""
    result = await publish.publish_ig_image(
        client_id="non-existent",
        ig_user_id="17841400663280001",
        image_url="https://example.com/image.jpg",
        token_store=token_store_mock,
        graph_client=graph_client_mock,
    )
    assert result["ok"] is False
    assert "error" in result and result["error"]


@pytest.mark.asyncio
async def test_publish_ig_reel(token_store_mock, graph_client_mock):
    """Test publish_ig_reel tool (with polling)."""
    result = await publish.publish_ig_reel(
        client_id="test-client-1",
        ig_user_id="17841400663280001",
        video_url="https://example.com/video.mp4",
        caption="Test reel",
        token_store=token_store_mock,
        graph_client=graph_client_mock,
    )
    assert result["ok"] is True
    assert "media_id" in result["data"]
    assert result["data"]["status"] == "published"


@pytest.mark.asyncio
async def test_publish_ig_carousel(token_store_mock, graph_client_mock):
    """Test publish_ig_carousel tool."""
    result = await publish.publish_ig_carousel(
        client_id="test-client-1",
        ig_user_id="17841400663280001",
        media_urls=[
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
            "https://example.com/video.mp4",
        ],
        caption="Test carousel",
        token_store=token_store_mock,
        graph_client=graph_client_mock,
    )
    assert result["ok"] is True
    assert "media_id" in result["data"]
    assert result["data"]["status"] == "published"
    assert result["data"]["items_count"] == 3


@pytest.mark.asyncio
async def test_publish_ig_carousel_min_items(token_store_mock, graph_client_mock):
    """Test carousel with less than 2 items (should fail)."""
    result = await publish.publish_ig_carousel(
        client_id="test-client-1",
        ig_user_id="17841400663280001",
        media_urls=["https://example.com/image.jpg"],
        caption="Test",
        token_store=token_store_mock,
        graph_client=graph_client_mock,
    )
    assert result["ok"] is False
    assert "at least 2 media" in result["error"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
