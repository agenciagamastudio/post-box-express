"""MCP Server entry point."""

import asyncio
import json
import logging
import os
from typing import Any

from mcp.server import Server
from mcp.types import Tool, TextContent

from .token_store import TokenStore
from .graph_client import GraphClient
from .tools import accounts, insights, comments, limits, publish

# Setup logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Global instances (initialized at startup)
token_store: TokenStore = None
graph_client: GraphClient = None
server: Server = None


async def initialize():
    """Initialize token store and graph client."""
    global token_store, graph_client

    logger.info("Initializing MCP server...")

    token_store = TokenStore()
    graph_client = GraphClient()

    logger.info("Token store and graph client initialized")


async def list_connected_accounts_impl():
    """Implementation of list_connected_accounts tool."""
    result = await accounts.list_connected_accounts(token_store)
    return {
        "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
        "is_error": not result.get("ok", False),
    }


async def get_account_impl(client_id: str):
    """Implementation of get_account tool."""
    result = await accounts.get_account(client_id, token_store)
    return {
        "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
        "is_error": not result.get("ok", False),
    }


async def get_ig_insights_impl(
    client_id: str,
    ig_user_id: str = None,
    metrics: str = None,
):
    """Implementation of get_ig_insights tool."""
    metrics_list = None
    if metrics:
        try:
            metrics_list = json.loads(metrics) if isinstance(metrics, str) else metrics
        except (json.JSONDecodeError, TypeError):
            metrics_list = None

    result = await insights.get_ig_insights(
        client_id=client_id,
        ig_user_id=ig_user_id,
        metrics=metrics_list,
        token_store=token_store,
        graph_client=graph_client,
    )
    return {
        "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
        "is_error": not result.get("ok", False),
    }


async def get_comments_impl(
    client_id: str,
    ig_user_id: str = None,
    limit: int = 25,
):
    """Implementation of get_comments tool."""
    result = await comments.get_comments(
        client_id=client_id,
        ig_user_id=ig_user_id,
        limit=limit,
        token_store=token_store,
        graph_client=graph_client,
    )
    return {
        "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
        "is_error": not result.get("ok", False),
    }


async def get_publish_limit_impl(
    client_id: str,
    ig_user_id: str = None,
):
    """Implementation of get_publish_limit tool."""
    result = await limits.get_publish_limit(
        client_id=client_id,
        ig_user_id=ig_user_id,
        token_store=token_store,
        graph_client=graph_client,
    )
    return {
        "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
        "is_error": not result.get("ok", False),
    }


async def publish_ig_image_impl(
    client_id: str,
    ig_user_id: str,
    image_url: str,
    caption: str = "",
):
    """Implementation of publish_ig_image tool."""
    result = await publish.publish_ig_image(
        client_id=client_id,
        ig_user_id=ig_user_id,
        image_url=image_url,
        caption=caption,
        token_store=token_store,
        graph_client=graph_client,
    )
    return {
        "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
        "is_error": not result.get("ok", False),
    }


async def publish_ig_reel_impl(
    client_id: str,
    ig_user_id: str,
    video_url: str,
    thumbnail_url: str = None,
    caption: str = "",
):
    """Implementation of publish_ig_reel tool."""
    result = await publish.publish_ig_reel(
        client_id=client_id,
        ig_user_id=ig_user_id,
        video_url=video_url,
        thumbnail_url=thumbnail_url,
        caption=caption,
        token_store=token_store,
        graph_client=graph_client,
    )
    return {
        "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
        "is_error": not result.get("ok", False),
    }


async def publish_ig_carousel_impl(
    client_id: str,
    ig_user_id: str,
    media_urls: list,
    caption: str = "",
):
    """Implementation of publish_ig_carousel tool."""
    result = await publish.publish_ig_carousel(
        client_id=client_id,
        ig_user_id=ig_user_id,
        media_urls=media_urls,
        caption=caption,
        token_store=token_store,
        graph_client=graph_client,
    )
    return {
        "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
        "is_error": not result.get("ok", False),
    }


async def run_mcp_server():
    """Main MCP server entry point."""
    global server

    logger.info("Starting MCP server...")

    server = Server("mcp-meta-gama")

    # Initialize clients
    await initialize()

    # Register tools
    tools = [
        Tool(
            name="list_connected_accounts",
            description="List all connected Instagram Business accounts",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
        Tool(
            name="get_account",
            description="Get details of a specific account by client_id",
            inputSchema={
                "type": "object",
                "properties": {
                    "client_id": {"type": "string", "description": "Client ID"},
                },
                "required": ["client_id"],
            },
        ),
        Tool(
            name="get_ig_insights",
            description="Get Instagram Business account insights (reach, profile views, etc)",
            inputSchema={
                "type": "object",
                "properties": {
                    "client_id": {"type": "string", "description": "Client ID"},
                    "ig_user_id": {
                        "type": "string",
                        "description": "Instagram user ID (optional, looks up if not provided)",
                    },
                    "metrics": {
                        "type": "string",
                        "description": 'JSON array of metric names, e.g. ["reach", "profile_views"]',
                    },
                },
                "required": ["client_id"],
            },
        ),
        Tool(
            name="get_comments",
            description="Get recent comments on an Instagram Business account",
            inputSchema={
                "type": "object",
                "properties": {
                    "client_id": {"type": "string", "description": "Client ID"},
                    "ig_user_id": {
                        "type": "string",
                        "description": "Instagram user ID (optional)",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Max number of comments to return (default 25)",
                        "default": 25,
                    },
                },
                "required": ["client_id"],
            },
        ),
        Tool(
            name="get_publish_limit",
            description="Get content publishing limit for an Instagram Business account",
            inputSchema={
                "type": "object",
                "properties": {
                    "client_id": {"type": "string", "description": "Client ID"},
                    "ig_user_id": {
                        "type": "string",
                        "description": "Instagram user ID (optional)",
                    },
                },
                "required": ["client_id"],
            },
        ),
        Tool(
            name="publish_ig_image",
            description="Publish an image to Instagram Business account",
            inputSchema={
                "type": "object",
                "properties": {
                    "client_id": {"type": "string", "description": "Client ID"},
                    "ig_user_id": {"type": "string", "description": "Instagram user ID"},
                    "image_url": {"type": "string", "description": "URL of the image"},
                    "caption": {
                        "type": "string",
                        "description": "Caption for the post (optional)",
                    },
                },
                "required": ["client_id", "ig_user_id", "image_url"],
            },
        ),
        Tool(
            name="publish_ig_reel",
            description="Publish a reel to Instagram Business account (with polling)",
            inputSchema={
                "type": "object",
                "properties": {
                    "client_id": {"type": "string", "description": "Client ID"},
                    "ig_user_id": {"type": "string", "description": "Instagram user ID"},
                    "video_url": {"type": "string", "description": "URL of the video"},
                    "thumbnail_url": {
                        "type": "string",
                        "description": "URL of the thumbnail (optional)",
                    },
                    "caption": {
                        "type": "string",
                        "description": "Caption for the reel (optional)",
                    },
                },
                "required": ["client_id", "ig_user_id", "video_url"],
            },
        ),
        Tool(
            name="publish_ig_carousel",
            description="Publish a carousel (multiple media) to Instagram Business account",
            inputSchema={
                "type": "object",
                "properties": {
                    "client_id": {"type": "string", "description": "Client ID"},
                    "ig_user_id": {"type": "string", "description": "Instagram user ID"},
                    "media_urls": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "URLs of media (at least 2)",
                    },
                    "caption": {
                        "type": "string",
                        "description": "Caption for the carousel (optional)",
                    },
                },
                "required": ["client_id", "ig_user_id", "media_urls"],
            },
        ),
    ]

    for tool in tools:
        server.add_tool(tool)

    # Register tool handlers
    @server.call_tool
    async def handle_tool_call(name: str, arguments: dict[str, Any]) -> Any:
        logger.info(f"Tool called: {name}")

        if name == "list_connected_accounts":
            return await list_connected_accounts_impl()
        elif name == "get_account":
            return await get_account_impl(arguments.get("client_id"))
        elif name == "get_ig_insights":
            return await get_ig_insights_impl(
                client_id=arguments.get("client_id"),
                ig_user_id=arguments.get("ig_user_id"),
                metrics=arguments.get("metrics"),
            )
        elif name == "get_comments":
            return await get_comments_impl(
                client_id=arguments.get("client_id"),
                ig_user_id=arguments.get("ig_user_id"),
                limit=arguments.get("limit", 25),
            )
        elif name == "get_publish_limit":
            return await get_publish_limit_impl(
                client_id=arguments.get("client_id"),
                ig_user_id=arguments.get("ig_user_id"),
            )
        elif name == "publish_ig_image":
            return await publish_ig_image_impl(
                client_id=arguments.get("client_id"),
                ig_user_id=arguments.get("ig_user_id"),
                image_url=arguments.get("image_url"),
                caption=arguments.get("caption", ""),
            )
        elif name == "publish_ig_reel":
            return await publish_ig_reel_impl(
                client_id=arguments.get("client_id"),
                ig_user_id=arguments.get("ig_user_id"),
                video_url=arguments.get("video_url"),
                thumbnail_url=arguments.get("thumbnail_url"),
                caption=arguments.get("caption", ""),
            )
        elif name == "publish_ig_carousel":
            return await publish_ig_carousel_impl(
                client_id=arguments.get("client_id"),
                ig_user_id=arguments.get("ig_user_id"),
                media_urls=arguments.get("media_urls", []),
                caption=arguments.get("caption", ""),
            )
        else:
            logger.error(f"Unknown tool: {name}")
            return {
                "content": [{"type": "text", "text": f"Unknown tool: {name}"}],
                "is_error": True,
            }

    logger.info("MCP server initialized, starting...")
    async with server:
        logger.info("MCP server running (stdio transport)")
        await server.wait_for_shutdown()


def main():
    """Entry point for `python -m mcp_meta_gama`."""
    try:
        asyncio.run(run_mcp_server())
    except KeyboardInterrupt:
        logger.info("Server interrupted")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    main()
