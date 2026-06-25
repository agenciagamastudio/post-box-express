"""Tests for token_store.py (mock mode only)."""

import os
import pytest
from mcp_meta_gama.token_store import TokenStore


@pytest.fixture
def token_store_mock():
    """Create token store in mock mode."""
    os.environ["SUPABASE_MOCK"] = "true"
    return TokenStore()


def test_get_account_mock(token_store_mock):
    """Test getting a mock account."""
    account = token_store_mock.get_account("test-client-1")
    assert account is not None
    assert account["client_id"] == "test-client-1"
    assert account["ig_user_id"] == "17841400663280001"
    assert account["ig_username"] == "test_account"
    assert account["access_token"] == "IGBBaccesstoken123456789"


def test_get_account_not_found_mock(token_store_mock):
    """Test getting non-existent account."""
    account = token_store_mock.get_account("non-existent")
    assert account is None


def test_list_accounts_mock(token_store_mock):
    """Test listing mock accounts."""
    accounts = token_store_mock.list_accounts()
    assert len(accounts) == 2
    assert accounts[0]["client_id"] == "test-client-1"
    assert accounts[1]["client_id"] == "test-client-2"
    for account in accounts:
        assert account["status"] == "active"




if __name__ == "__main__":
    pytest.main([__file__, "-v"])
