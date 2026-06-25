"""Tools for getting insights (read-only)."""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


async def get_ig_insights(
    client_id: str,
    ig_user_id: Optional[str] = None,
    metrics: Optional[list[str]] = None,
    token_store=None,
    graph_client=None,
) -> Dict[str, Any]:
    """Get Instagram account or media insights.

    Args:
        client_id: Client ID (to look up token).
        ig_user_id: Instagram user ID (if not provided, will look up from client_id).
        metrics: List of metrics (e.g., ['reach', 'profile_views']).

    Returns:
        {
            "ok": true/false,
            "data": {insights data},
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

        metrics = metrics or ["reach", "profile_views"]

        # Call Graph API
        result = await graph_client.get_account_insights(
            ig_user_id=ig_user_id,
            token=token,
            metrics=metrics,
        )

        if "error" in result:
            logger.error(f"Graph API error for {ig_user_id}: {result['error']}")
            return {
                "ok": False,
                "data": None,
                "error": result.get("error"),
            }

        logger.info(f"Retrieved insights for {ig_user_id}")
        return {
            "ok": True,
            "data": result,
            "error": None,
        }
    except Exception as e:
        logger.error(f"Error getting insights: {e}")
        return {
            "ok": False,
            "data": None,
            "error": str(e),
        }


async def get_page_insights(
    client_id: str,
    page_id: Optional[str] = None,
    metrics: Optional[list[str]] = None,
    token_store=None,
    graph_client=None,
) -> Dict[str, Any]:
    """Get Facebook Page insights (currently not fully implemented).

    Args:
        client_id: Client ID (to look up token).
        page_id: Page ID (if not provided, will look up from client_id).
        metrics: List of metrics.

    Returns:
        {
            "ok": true/false,
            "data": {insights data},
            "error": null or error message
        }
    """
    # Placeholder: v1 does not fully support FB Pages yet
    return {
        "ok": False,
        "data": None,
        "error": "Facebook Pages insights not yet fully implemented",
    }
