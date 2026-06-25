"""Tools for managing publish limits and token refresh."""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


async def get_publish_limit(
    client_id: str,
    ig_user_id: Optional[str] = None,
    token_store=None,
    graph_client=None,
) -> Dict[str, Any]:
    """Get content publishing limit for an Instagram Business account.

    Args:
        client_id: Client ID (to look up token).
        ig_user_id: Instagram user ID (if not provided, will look up).

    Returns:
        {
            "ok": true/false,
            "data": {limit info},
            "error": null or error message
        }
    """
    try:
        # Get token from store
        account = token_store.get_account(client_id)
        if not account:
            return {
                "ok": False,
                "data": None,
                "error": f"Account not found: {client_id}",
            }

        token = account.get("access_token")
        if not token:
            return {
                "ok": False,
                "data": None,
                "error": f"No access token for {client_id}",
            }

        ig_user_id = ig_user_id or account.get("ig_user_id")
        if not ig_user_id:
            return {
                "ok": False,
                "data": None,
                "error": f"No IG user ID for {client_id}",
            }

        # Call Graph API
        result = await graph_client.get_publish_limit(
            ig_user_id=ig_user_id,
            token=token,
        )

        if "error" in result:
            logger.error(f"Graph API error for {ig_user_id}: {result['error']}")
            return {
                "ok": False,
                "data": None,
                "error": result.get("error"),
            }

        logger.info(f"Retrieved publish limit for {ig_user_id}")
        return {
            "ok": True,
            "data": result,
            "error": None,
        }
    except Exception as e:
        logger.error(f"Error getting publish limit: {e}")
        return {
            "ok": False,
            "data": None,
            "error": str(e),
        }


async def refresh_tokens(
    client_id: str,
    token_store=None,
    graph_client=None,
) -> Dict[str, Any]:
    """Refresh access token for an account (v1: read-only, delegates to backend).

    Args:
        client_id: Client ID.

    Returns:
        {
            "ok": false (not implemented in MCP),
            "data": null,
            "error": "Token refresh must be done via backend OAuth flow"
        }
    """
    # v1: Token refresh is Node.js scheduler responsibility, not MCP
    logger.info(f"refresh_tokens called for {client_id} — delegate to Node.js scheduler")
    return {
        "ok": False,
        "data": None,
        "error": "Token refresh must be handled by backend OAuth scheduler (scheduler.js)",
    }
