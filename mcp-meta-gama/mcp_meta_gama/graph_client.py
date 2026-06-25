"""Graph API client with retry, polling, and rate-limit handling."""

import os
import logging
import asyncio
import random
from typing import Optional, Dict, Any
from datetime import datetime

try:
    import httpx
except ImportError:
    raise ImportError("httpx library required: pip install httpx")

logger = logging.getLogger(__name__)

# Base URLs
IG_GRAPH_BASE = "https://graph.instagram.com"
FB_GRAPH_BASE = "https://graph.facebook.com"


class GraphClient:
    """HTTP client for Meta Graph API with retry, polling, and rate-limit handling."""

    def __init__(
        self,
        app_id: Optional[str] = None,
        app_secret: Optional[str] = None,
        mock: bool = False,
    ):
        """Initialize Graph client.

        Args:
            app_id: Meta App ID. If None, read from META_APP_ID env.
            app_secret: Meta App Secret. If None, read from META_APP_SECRET env.
            mock: If True, all calls return mock data without hitting real API.
        """
        self.app_id = app_id or os.getenv("META_APP_ID")
        self.app_secret = app_secret or os.getenv("META_APP_SECRET")
        self.is_mock = mock or str(os.getenv("PUBLISH_MOCK", "false")).lower() == "true"

        self._client = None
        self._init_client()

    def _init_client(self):
        """Initialize httpx async client."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=30,
                headers={"User-Agent": "mcp-meta-gama/0.1.0"},
            )

    async def _get(self, url: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make GET request with retry."""
        return await self._with_retry(lambda: self._client.get(url, params=params))

    async def _post(
        self, url: str, json: Optional[Dict[str, Any]] = None, data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make POST request with retry."""
        if self.is_mock and "/media" in url:
            if "media_publish" in url:
                return self._post_media_publish_mock()
            else:
                return self._post_create_media_mock()

        return await self._with_retry(
            lambda: self._client.post(url, json=json, data=data)
        )

    async def _with_retry(
        self,
        fn,
        max_retries: int = 3,
        base_delay: float = 1.0,
    ) -> Dict[str, Any]:
        """Execute function with exponential backoff + jitter on transient errors.

        Args:
            fn: Async function that returns httpx.Response.
            max_retries: Max retry attempts.
            base_delay: Base delay in seconds for exponential backoff.

        Returns:
            Response body as dict (or error dict with 'error' key).
        """
        for attempt in range(max_retries + 1):
            try:
                response = await fn()

                if self._is_rate_limited(response):
                    if attempt < max_retries:
                        delay = base_delay * (2 ** attempt) + random.uniform(0, 0.1)
                        logger.warning(
                            f"Rate limited (attempt {attempt + 1}/{max_retries}). "
                            f"Retrying in {delay:.2f}s"
                        )
                        await asyncio.sleep(delay)
                        continue
                    else:
                        return {
                            "error": f"Rate limit exceeded after {max_retries} retries"
                        }

                self._check_rate_limit_headers(response)
                data = response.json()
                if "error" in data:
                    return data

                return data

            except (
                httpx.TimeoutException,
                httpx.ConnectError,
                httpx.NetworkError,
            ) as e:
                if attempt < max_retries:
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 0.1)
                    logger.warning(
                        f"Transient error (attempt {attempt + 1}/{max_retries}): {e}. "
                        f"Retrying in {delay:.2f}s"
                    )
                    await asyncio.sleep(delay)
                    continue
                else:
                    return {"error": f"Connection failed after {max_retries} retries: {e}"}
            except Exception as e:
                logger.error(f"Unexpected error: {type(e).__name__}")
                return {"error": "Internal error (check logs)"}

        return {"error": "Max retries exceeded"}

    def _is_rate_limited(self, response: httpx.Response) -> bool:
        """Check if response indicates rate limiting."""
        if response.status_code == 429:
            return True
        if response.status_code >= 500:
            return True
        try:
            data = response.json()
            error = data.get("error", {})
            if isinstance(error, dict):
                error_code = error.get("code")
                return error_code in (4, 17, 32, 613)
        except Exception:
            pass
        return False

    def _check_rate_limit_headers(self, response: httpx.Response):
        """Log rate-limit info from response headers."""
        app_usage = response.headers.get("x-app-usage")
        biz_usage = response.headers.get("x-business-use-case-usage")
        if app_usage:
            logger.debug(f"App usage: {app_usage}")
        if biz_usage:
            logger.debug(f"Business usage: {biz_usage}")

    async def get_account_insights(
        self, ig_user_id: str, token: str, metrics: Optional[list[str]] = None
    ) -> Dict[str, Any]:
        """Get insights for an IG Business account.

        Args:
            ig_user_id: Instagram user ID.
            token: Access token for this account.
            metrics: List of metric names (e.g., ['reach', 'profile_views']).

        Returns:
            Insights dict or error.
        """
        if self.is_mock:
            return self._get_account_insights_mock(ig_user_id)

        metrics = metrics or ["reach", "profile_views"]
        params = {
            "fields": ",".join(metrics),
            "access_token": token,
        }
        url = f"{IG_GRAPH_BASE}/{ig_user_id}/insights"
        return await self._get(url, params)

    async def get_media_insights(
        self, media_id: str, token: str, metrics: Optional[list[str]] = None
    ) -> Dict[str, Any]:
        """Get insights for a specific media item.

        Args:
            media_id: Instagram media ID.
            token: Access token.
            metrics: List of metric names.

        Returns:
            Insights dict or error.
        """
        if self.is_mock:
            return self._get_media_insights_mock(media_id)

        metrics = metrics or ["engagement", "impressions", "reach"]
        params = {
            "fields": ",".join(metrics),
            "access_token": token,
        }
        url = f"{IG_GRAPH_BASE}/{media_id}/insights"
        return await self._get(url, params)

    async def get_comments(
        self, ig_user_id: str, token: str, limit: int = 25
    ) -> Dict[str, Any]:
        """Get recent comments on an IG Business account.

        Args:
            ig_user_id: Instagram user ID.
            token: Access token.
            limit: Max number of comments to return.

        Returns:
            Comments list or error.
        """
        if self.is_mock:
            return self._get_comments_mock(ig_user_id, limit)

        params = {
            "fields": "id,text,username,timestamp",
            "limit": limit,
            "access_token": token,
        }
        url = f"{IG_GRAPH_BASE}/{ig_user_id}/comments"
        return await self._get(url, params)

    async def get_publish_limit(self, ig_user_id: str, token: str) -> Dict[str, Any]:
        """Get content publishing limit for an IG Business account.

        Args:
            ig_user_id: Instagram user ID.
            token: Access token.

        Returns:
            Publishing limit info or error.
        """
        if self.is_mock:
            return self._get_publish_limit_mock(ig_user_id)

        params = {
            "fields": "config,quota_usage",
            "access_token": token,
        }
        url = f"{IG_GRAPH_BASE}/{ig_user_id}/content_publishing_limit"
        return await self._get(url, params)

    async def poll_container(
        self,
        container_id: str,
        token: str,
        max_attempts: int = 10,
        delay_sec: float = 2.0,
    ) -> Dict[str, Any]:
        """Poll media container until it's ready to publish.

        Args:
            container_id: Media container ID from creation.
            token: Access token.
            max_attempts: Max polling attempts.
            delay_sec: Delay between polls (seconds).

        Returns:
            Container status dict or error.
        """
        if self.is_mock:
            logger.info(f"MOCK: poll_container(container_id={container_id})")
            return {"status_code": "FINISHED", "id": container_id}

        for attempt in range(max_attempts):
            params = {
                "fields": "id,status_code",
                "access_token": token,
            }
            url = f"{IG_GRAPH_BASE}/{container_id}"
            response = await self._get(url, params)

            if "error" in response:
                return response

            status = response.get("status_code")
            if status == "FINISHED":
                logger.info(f"Container {container_id} ready after {attempt + 1} attempts")
                return response
            elif status == "ERROR" or status == "EXPIRED":
                return {"error": f"Container status: {status}"}

            if attempt < max_attempts - 1:
                logger.debug(f"Container polling attempt {attempt + 1}/{max_attempts}")
                await asyncio.sleep(delay_sec)

        return {"error": f"Container not ready after {max_attempts} attempts"}

    async def close(self):
        """Close HTTP client."""
        if self._client:
            await self._client.aclose()

    # Mock data for testing
    def _get_account_insights_mock(self, ig_user_id: str) -> Dict[str, Any]:
        """Return mock account insights."""
        return {
            "data": [
                {"name": "reach", "period": "day", "values": [{"value": 1234}]},
                {"name": "profile_views", "period": "day", "values": [{"value": 567}]},
            ],
            "paging": {},
        }

    def _get_media_insights_mock(self, media_id: str) -> Dict[str, Any]:
        """Return mock media insights."""
        return {
            "data": [
                {"name": "engagement", "period": "lifetime", "values": [{"value": 89}]},
                {"name": "impressions", "period": "lifetime", "values": [{"value": 234}]},
                {"name": "reach", "period": "lifetime", "values": [{"value": 156}]},
            ],
            "paging": {},
        }

    def _get_comments_mock(self, ig_user_id: str, limit: int) -> Dict[str, Any]:
        """Return mock comments."""
        return {
            "data": [
                {
                    "id": "comment-1",
                    "text": "Great post!",
                    "username": "test_user",
                    "timestamp": "2026-06-25T12:00:00+0000",
                },
                {
                    "id": "comment-2",
                    "text": "Love this!",
                    "username": "another_user",
                    "timestamp": "2026-06-25T11:00:00+0000",
                },
            ],
            "paging": {},
        }

    def _get_publish_limit_mock(self, ig_user_id: str) -> Dict[str, Any]:
        """Return mock publish limit."""
        return {
            "config": {"post_ql": 50},
            "quota_usage": {"post_ql": [{"calls": 10, "total_cputime": 0, "total_time": 0}]},
        }

    def _post_create_media_mock(self) -> Dict[str, Any]:
        """Return mock media creation response."""
        import uuid
        return {"id": str(uuid.uuid4())}

    def _post_media_publish_mock(self) -> Dict[str, Any]:
        """Return mock media publish response."""
        import uuid
        return {"id": str(uuid.uuid4())}
