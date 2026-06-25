# mcp-meta-gama

MCP Server for Meta Graph API (Instagram Business + Facebook Pages)

## Overview

Standalone Python MCP server that wraps the Meta Graph API for:
- Instagram Business account insights
- Comments management
- Content publishing limits
- Facebook Pages integration (v1: basic support)

Integrates with existing `GAMA_CRONOGRAMAS` Supabase infrastructure — reads tokens from `instagram_connections` table.

## Installation

```bash
pip install -r requirements.txt
```

## Configuration

Create `.env` file (copy from `.env.example`):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
META_APP_ID=your-app-id
META_APP_SECRET=your-app-secret
PUBLISH_MOCK=false
LOG_LEVEL=INFO
```

For testing without real API calls, set `PUBLISH_MOCK=true`.

## Running the Server

### As MCP in Claude Code

```bash
# Add to ~/.claude.json or via `claude mcp add`:
{
  "mcpServers": {
    "meta-gama": {
      "command": "python",
      "args": ["-m", "mcp_meta_gama"],
      "cwd": "path/to/mcp-meta-gama",
      "env": {
        "SUPABASE_URL": "...",
        "SUPABASE_SERVICE_KEY": "...",
        "META_APP_ID": "...",
        "META_APP_SECRET": "..."
      }
    }
  }
}
```

### Direct (for testing)

```bash
python -m mcp_meta_gama
```

## Tools Available (v1)

### Read-only

- **list_connected_accounts** — List all active accounts
- **get_account** — Get account details by client_id
- **get_ig_insights** — Get Instagram account insights (reach, profile_views)
- **get_comments** — Get recent comments on an account
- **get_publish_limit** — Get publishing limit status

## Testing

Run tests with mock mode (no real API calls):

```bash
SUPABASE_MOCK=true PUBLISH_MOCK=true pytest
```

## Scope

### v1 (Current)

- ✅ Account management (read-only)
- ✅ Insights (read-only)
- ✅ Comments (read-only)
- ✅ Publishing limits (read-only)
- ✅ Token refresh (placeholder)

### v2 (Future)

- Publishing (image, reel, carousel)
- Facebook Pages
- Marketing/Ads API
- DM automation
- System User / Business Manager integration

## Security Notes

- Tokens stored in Supabase (currently plaintext — crypt encryption planned)
- `META_APP_SECRET` and `SUPABASE_SERVICE_KEY` must be protected (never commit)
- Use `.env` file, never version control secrets
- All errors sanitized to avoid token leakage

## Development

```bash
# Install dev dependencies
pip install -r requirements.txt

# Run tests
pytest -v

# Type checking
mypy mcp_meta_gama/

# Linting
flake8 mcp_meta_gama/
```

## Troubleshooting

### "No accounts found"
- Verify `instagram_connections` table has entries with `status='active'`
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct

### "Rate limit exceeded"
- Graph API limits vary; see rate limit headers in logs
- Backoff strategy: exponential + jitter (auto-implemented)

### "Token expired"
- Run `refresh_tokens` tool to refresh long-lived token
- Automatic refresh via scheduler (backend Node.js)

## References

- [Instagram Graph API](https://developers.facebook.com/docs/instagram-graph-api)
- [Meta App Review](https://developers.facebook.com/docs/apps/review)
- [Graph API Rate Limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting)
