"""Tools for managing comments (read-only in v1)."""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


async def get_comments(
    client_id: str,
    ig_user_id: Optional[str] = None,
    limit: int = 25,
    token_store=None,
    graph_client=None,
) -> Dict[str, Any]:
    """Get recent comments on an Instagram Business account.

    Args:
        client_id: Client ID (to look up token).
        ig_user_id: Instagram user ID (if not provided, will look up).
        limit: Max number of comments to return (default 25).

    Returns:
        {
            "ok": true/false,
            "data": {comments list},
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
        result = await graph_client.get_comments(
            ig_user_id=ig_user_id,
            token=token,
            limit=limit,
        )

        if "error" in result:
            logger.error(f"Graph API error for {ig_user_id}: {result['error']}")
            return {
                "ok": False,
                "data": None,
                "error": result.get("error"),
            }

        logger.info(f"Retrieved {len(result.get('data', []))} comments for {ig_user_id}")
        return {
            "ok": True,
            "data": result,
            "error": None,
        }
    except Exception as e:
        logger.error(f"Error getting comments: {e}")
        return {
            "ok": False,
            "data": None,
            "error": str(e),
        }


async def reply_comment(
    client_id: str,
    comment_id: str,
    text: str,
    token_store=None,
    graph_client=None,
) -> Dict[str, Any]:
    """Reply to a comment (v1: not implemented, requires publish permission).

    Returns:
        Error indicating feature not yet available.
    """
    return {
        "ok": False,
        "data": None,
        "error": "Replying to comments not yet implemented (v1)",
    }


async def hide_comment(
    client_id: str,
    comment_id: str,
    token_store=None,
    graph_client=None,
) -> Dict[str, Any]:
    """Hide a comment (v1: not implemented, requires manage permission).

    Returns:
        Error indicating feature not yet available.
    """
    return {
        "ok": False,
        "data": None,
        "error": "Hiding comments not yet implemented (v1)",
    }
