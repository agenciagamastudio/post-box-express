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
from .tools import accounts, insights, comments, limits

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
        else:
            logger.error(f"Unknown tool: {name}")
            return ToolResponse(
                content=[TextContent(type="text", text=f"Unknown tool: {name}")],
                is_error=True,
            )

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
