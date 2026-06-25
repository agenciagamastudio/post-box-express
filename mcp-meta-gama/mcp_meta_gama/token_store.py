"""Token store: read Instagram accounts from Supabase (instagram_connections table)."""

import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class TokenStore:
    """Read tokens from Supabase instagram_connections table."""

    def __init__(self, supabase_url: Optional[str] = None, supabase_key: Optional[str] = None):
        """Initialize token store.

        Args:
            supabase_url: Supabase project URL. If None, read from SUPABASE_URL env.
            supabase_key: Supabase service_role key. If None, read from SUPABASE_SERVICE_KEY env.
        """
        self.supabase_url = supabase_url or os.getenv("SUPABASE_URL")
        self.supabase_key = supabase_key or os.getenv("SUPABASE_SERVICE_KEY")
        self.is_mock = str(os.getenv("SUPABASE_MOCK", "false")).lower() == "true"

        self._client = None

        if not self.is_mock:
            if not self.supabase_url or not self.supabase_key:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_SERVICE_KEY required (or set SUPABASE_MOCK=true)"
                )
            self._init_client()

    def _init_client(self):
        """Initialize Supabase client (lazy load)."""
        if self._client is not None:
            return

        try:
            from supabase import create_client
            self._client = create_client(self.supabase_url, self.supabase_key)
            logger.info("Supabase client initialized")
        except ImportError:
            raise ImportError("supabase library required: pip install supabase")

    def get_account(self, client_id: str) -> Optional[Dict[str, Any]]:
        """Get Instagram account by client_id.

        Args:
            client_id: The client ID (from instagram_connections.client_id).

        Returns:
            Account dict with keys: {ig_user_id, ig_username, page_id, page_name,
                                     access_token, token_expires_at, status, ...}
            Or None if not found.
        """
        if self.is_mock:
            return self._get_account_mock(client_id)

        self._init_client()
        try:
            response = self._client.table("instagram_connections").select("*").eq(
                "client_id", client_id
            ).execute()

            if response.data and len(response.data) > 0:
                account = response.data[0]
                logger.info(f"Retrieved account for client_id={client_id}")
                return account
            else:
                logger.warning(f"No account found for client_id={client_id}")
                return None
        except Exception as e:
            logger.error(f"Error reading account from Supabase: {type(e).__name__}")
            raise

    def list_accounts(self) -> list[Dict[str, Any]]:
        """List all active Instagram accounts.

        Returns:
            List of account dicts, filtered by status='active'.
        """
        if self.is_mock:
            return self._list_accounts_mock()

        self._init_client()
        try:
            response = self._client.table("instagram_connections").select("*").eq(
                "status", "active"
            ).execute()

            accounts = response.data if response.data else []
            logger.info(f"Retrieved {len(accounts)} active accounts")
            return accounts
        except Exception as e:
            logger.error(f"Error listing accounts from Supabase: {e}")
            raise


    # Mock data for testing without real Supabase
    def _get_account_mock(self, client_id: str) -> Optional[Dict[str, Any]]:
        """Return mock account data for testing."""
        mock_accounts = {
            "test-client-1": {
                "client_id": "test-client-1",
                "ig_user_id": "17841400663280001",
                "ig_username": "test_account",
                "page_id": None,
                "page_name": None,
                "access_token": "IGBBaccesstoken123456789",
                "token_expires_at": "2026-08-25T00:00:00",
                "status": "active",
                "created_at": "2026-06-25T00:00:00",
                "updated_at": "2026-06-25T00:00:00",
            },
            "test-client-2": {
                "client_id": "test-client-2",
                "ig_user_id": "17841400663280002",
                "ig_username": "another_test",
                "page_id": None,
                "page_name": None,
                "access_token": "IGBBaccesstoken987654321",
                "token_expires_at": "2026-08-25T00:00:00",
                "status": "active",
                "created_at": "2026-06-25T00:00:00",
                "updated_at": "2026-06-25T00:00:00",
            },
        }
        return mock_accounts.get(client_id)

    def _list_accounts_mock(self) -> list[Dict[str, Any]]:
        """Return mock accounts list for testing."""
        return [
            {
                "client_id": "test-client-1",
                "ig_user_id": "17841400663280001",
                "ig_username": "test_account",
                "page_id": None,
                "page_name": None,
                "access_token": "IGBBaccesstoken123456789",
                "token_expires_at": "2026-08-25T00:00:00",
                "status": "active",
                "created_at": "2026-06-25T00:00:00",
                "updated_at": "2026-06-25T00:00:00",
            },
            {
                "client_id": "test-client-2",
                "ig_user_id": "17841400663280002",
                "ig_username": "another_test",
                "page_id": None,
                "page_name": None,
                "access_token": "IGBBaccesstoken987654321",
                "token_expires_at": "2026-08-25T00:00:00",
                "status": "active",
                "created_at": "2026-06-25T00:00:00",
                "updated_at": "2026-06-25T00:00:00",
            },
        ]
