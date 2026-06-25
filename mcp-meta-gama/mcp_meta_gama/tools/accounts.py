"""Tools for managing connected accounts."""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


async def list_connected_accounts(token_store) -> Dict[str, Any]:
    """List all connected Instagram accounts.

    Returns:
        {
            "ok": true/false,
            "data": [
                {
                    "client_id": "...",
                    "ig_user_id": "...",
                    "ig_username": "...",
                    "page_id": null,
                    "page_name": null,
                    "status": "active",
                    "token_expires_at": "2026-08-25T00:00:00"
                },
                ...
            ],
            "error": null or error message
        }
    """
    try:
        accounts = token_store.list_accounts()
        if not accounts:
            logger.info("No active accounts found")
            return {
                "ok": True,
                "data": [],
                "error": None,
            }

        result = []
        for account in accounts:
            result.append({
                "client_id": account.get("client_id"),
                "ig_user_id": account.get("ig_user_id"),
                "ig_username": account.get("ig_username"),
                "page_id": account.get("page_id"),
                "page_name": account.get("page_name"),
                "status": account.get("status"),
                "token_expires_at": account.get("token_expires_at"),
            })

        logger.info(f"Listed {len(result)} active accounts")
        return {
            "ok": True,
            "data": result,
            "error": None,
        }
    except Exception as e:
        logger.error(f"Error listing accounts: {e}")
        return {
            "ok": False,
            "data": None,
            "error": str(e),
        }


async def get_account(client_id: str, token_store) -> Dict[str, Any]:
    """Get a specific account by client_id.

    Args:
        client_id: The client ID.

    Returns:
        {
            "ok": true/false,
            "data": {...account details...},
            "error": null or error message
        }
    """
    try:
        account = token_store.get_account(client_id)
        if not account:
            logger.warning(f"Account not found: {client_id}")
            return {
                "ok": False,
                "data": None,
                "error": f"Account not found: {client_id}",
            }

        logger.info(f"Retrieved account: {client_id}")
        return {
            "ok": True,
            "data": account,
            "error": None,
        }
    except Exception as e:
        logger.error(f"Error getting account: {e}")
        return {
            "ok": False,
            "data": None,
            "error": str(e),
        }
