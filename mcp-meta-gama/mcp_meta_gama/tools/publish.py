"""Publicação de conteúdo em Instagram (v2 — gated)."""

import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


async def publish_ig_image(
    client_id: str,
    ig_user_id: str,
    image_url: str,
    caption: str = "",
    token_store=None,
    graph_client=None,
) -> Dict[str, Any]:
    """Publicar imagem em Instagram Business.

    Args:
        client_id: Client ID.
        ig_user_id: Instagram user ID.
        image_url: URL da imagem.
        caption: Legenda da postagem.
        token_store: TokenStore instance.
        graph_client: GraphClient instance.

    Returns:
        {
            "ok": true/false,
            "data": {"media_id": "...", "status": "published"},
            "error": null or error message
        }
    """
    if not token_store or not graph_client:
        return {"ok": False, "data": None, "error": "Missing token_store or graph_client"}

    account = token_store.get_account(client_id)
    if not account:
        return {"ok": False, "data": None, "error": f"Account not found: {client_id}"}

    token = account.get("access_token")
    if not token:
        return {"ok": False, "data": None, "error": f"No access token for {client_id}"}

    try:
        # Step 1: Create media container
        container_response = await graph_client._post(
            f"https://graph.instagram.com/{ig_user_id}/media",
            json={
                "image_url": image_url,
                "caption": caption,
                "access_token": token,
            },
        )

        if "error" in container_response:
            return {"ok": False, "data": None, "error": container_response.get("error")}

        container_id = container_response.get("id")
        if not container_id:
            return {
                "ok": False,
                "data": None,
                "error": "No container_id returned from API",
            }

        # Step 2: Publish container
        publish_response = await graph_client._post(
            f"https://graph.instagram.com/{ig_user_id}/media_publish",
            json={
                "creation_id": container_id,
                "access_token": token,
            },
        )

        if "error" in publish_response:
            return {"ok": False, "data": None, "error": publish_response.get("error")}

        media_id = publish_response.get("id")
        return {
            "ok": True,
            "data": {
                "media_id": media_id,
                "status": "published",
                "container_id": container_id,
            },
            "error": None,
        }

    except Exception as e:
        logger.error(f"Error publishing image: {type(e).__name__}")
        return {
            "ok": False,
            "data": None,
            "error": "Internal error (check logs)",
        }


async def publish_ig_reel(
    client_id: str,
    ig_user_id: str,
    video_url: str,
    thumbnail_url: str = None,
    caption: str = "",
    token_store=None,
    graph_client=None,
) -> Dict[str, Any]:
    """Publicar reel em Instagram Business (com polling).

    Args:
        client_id: Client ID.
        ig_user_id: Instagram user ID.
        video_url: URL do vídeo.
        thumbnail_url: URL da thumbnail (opcional).
        caption: Legenda da postagem.
        token_store: TokenStore instance.
        graph_client: GraphClient instance.

    Returns:
        {
            "ok": true/false,
            "data": {"media_id": "...", "status": "published"},
            "error": null or error message
        }
    """
    if not token_store or not graph_client:
        return {"ok": False, "data": None, "error": "Missing token_store or graph_client"}

    account = token_store.get_account(client_id)
    if not account:
        return {"ok": False, "data": None, "error": f"Account not found: {client_id}"}

    token = account.get("access_token")
    if not token:
        return {"ok": False, "data": None, "error": f"No access token for {client_id}"}

    try:
        # Step 1: Create video container
        container_data = {
            "video_url": video_url,
            "media_type": "REELS",
            "caption": caption,
            "access_token": token,
        }
        if thumbnail_url:
            container_data["thumbnail_url"] = thumbnail_url

        container_response = await graph_client._post(
            f"https://graph.instagram.com/{ig_user_id}/media",
            json=container_data,
        )

        if "error" in container_response:
            return {"ok": False, "data": None, "error": container_response.get("error")}

        container_id = container_response.get("id")
        if not container_id:
            return {
                "ok": False,
                "data": None,
                "error": "No container_id returned from API",
            }

        # Step 2: Poll container until ready
        poll_response = await graph_client.poll_container(
            container_id, token, max_attempts=10, delay_sec=2.0
        )

        if "error" in poll_response:
            return {"ok": False, "data": None, "error": poll_response.get("error")}

        # Step 3: Publish container
        publish_response = await graph_client._post(
            f"https://graph.instagram.com/{ig_user_id}/media_publish",
            json={
                "creation_id": container_id,
                "access_token": token,
            },
        )

        if "error" in publish_response:
            return {"ok": False, "data": None, "error": publish_response.get("error")}

        media_id = publish_response.get("id")
        return {
            "ok": True,
            "data": {
                "media_id": media_id,
                "status": "published",
                "container_id": container_id,
            },
            "error": None,
        }

    except Exception as e:
        logger.error(f"Error publishing reel: {type(e).__name__}")
        return {
            "ok": False,
            "data": None,
            "error": "Internal error (check logs)",
        }


async def publish_ig_carousel(
    client_id: str,
    ig_user_id: str,
    media_urls: list[str],
    caption: str = "",
    token_store=None,
    graph_client=None,
) -> Dict[str, Any]:
    """Publicar carousel (múltiplas mídias) em Instagram Business.

    Args:
        client_id: Client ID.
        ig_user_id: Instagram user ID.
        media_urls: Lista de URLs (imagens/vídeos).
        caption: Legenda da postagem.
        token_store: TokenStore instance.
        graph_client: GraphClient instance.

    Returns:
        {
            "ok": true/false,
            "data": {"media_id": "...", "status": "published", "items_count": N},
            "error": null or error message
        }
    """
    if not token_store or not graph_client:
        return {"ok": False, "data": None, "error": "Missing token_store or graph_client"}

    if not media_urls or len(media_urls) < 2:
        return {
            "ok": False,
            "data": None,
            "error": "Carousel requires at least 2 media URLs",
        }

    account = token_store.get_account(client_id)
    if not account:
        return {"ok": False, "data": None, "error": f"Account not found: {client_id}"}

    token = account.get("access_token")
    if not token:
        return {"ok": False, "data": None, "error": f"No access token for {client_id}"}

    try:
        # Step 1: Create child containers for each media
        child_containers = []
        for media_url in media_urls:
            child_response = await graph_client._post(
                f"https://graph.instagram.com/{ig_user_id}/media",
                json={
                    "image_url": media_url,  # Accept both image and video URLs
                    "is_carousel_item": True,
                    "access_token": token,
                },
            )

            if "error" in child_response:
                return {
                    "ok": False,
                    "data": None,
                    "error": f"Failed to create child container: {child_response.get('error')}",
                }

            child_id = child_response.get("id")
            if child_id:
                child_containers.append(child_id)

        if not child_containers:
            return {
                "ok": False,
                "data": None,
                "error": "Failed to create any child containers",
            }

        # Step 2: Create carousel container
        container_response = await graph_client._post(
            f"https://graph.instagram.com/{ig_user_id}/media",
            json={
                "media_type": "CAROUSEL",
                "children": child_containers,
                "caption": caption,
                "access_token": token,
            },
        )

        if "error" in container_response:
            return {"ok": False, "data": None, "error": container_response.get("error")}

        container_id = container_response.get("id")
        if not container_id:
            return {
                "ok": False,
                "data": None,
                "error": "No container_id returned from API",
            }

        # Step 3: Poll container until ready
        poll_response = await graph_client.poll_container(
            container_id, token, max_attempts=10, delay_sec=2.0
        )

        if "error" in poll_response:
            return {"ok": False, "data": None, "error": poll_response.get("error")}

        # Step 4: Publish container
        publish_response = await graph_client._post(
            f"https://graph.instagram.com/{ig_user_id}/media_publish",
            json={
                "creation_id": container_id,
                "access_token": token,
            },
        )

        if "error" in publish_response:
            return {"ok": False, "data": None, "error": publish_response.get("error")}

        media_id = publish_response.get("id")
        return {
            "ok": True,
            "data": {
                "media_id": media_id,
                "status": "published",
                "container_id": container_id,
                "items_count": len(child_containers),
            },
            "error": None,
        }

    except Exception as e:
        logger.error(f"Error publishing carousel: {type(e).__name__}")
        return {
            "ok": False,
            "data": None,
            "error": "Internal error (check logs)",
        }
