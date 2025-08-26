# Setup Guide

This guide walks you through setting up the Ticket-to-Code extension with your preferred project management platforms.

## Quick Start

1. **Install Extension**: Search for "Ticket-to-Code" in VS Code Extensions
2. **Copy Environment Template**: Copy `.env.example` to `.env` in your project root
3. **Configure Platforms**: Follow the platform-specific setup below
4. **Test**: Open Command Palette (`Ctrl+Shift+P`) → "Ticket to Code AI"

## Platform Setup

### 🔷 Jira (Atlassian)

#### Option 1: API Token (Recommended)
1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Copy the token and add to `.env`:
   ```bash
   ATLASSIAN_EMAIL=your-email@company.com
   ATLASSIAN_API_TOKEN=your_api_token_here
   ```

#### Option 2: OAuth2
1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Create a new OAuth 2.0 app
3. Set redirect URI: `vscode://umangdalvadi.jira-to-code/auth/callback`
4. Add to `.env`:
   ```bash
   ATLASSIAN_CLIENT_ID=your_client_id
   ATLASSIAN_REDIRECT_URI=vscode://umangdalvadi.jira-to-code/auth/callback
   ```

### 🔷 Trello

1. Get your API key from [Trello Developer Portal](https://trello.com/app-key)
2. Generate a token using the link on that page
3. Add to `.env`:
   ```bash
   TRELLO_API_KEY=your_api_key
   TRELLO_TOKEN=your_token
   ```

### 🔷 Linear

#### Option 1: API Key (Recommended)
1. Go to Linear Settings → API
2. Create a new personal API key
3. Add to `.env`:
   ```bash
   LINEAR_API_KEY=your_api_key
   ```

#### Option 2: OAuth2
1. Create an OAuth application in Linear settings
2. Set redirect URI: `vscode://umangdalvadi.jira-to-code/auth/linear/callback`
3. Add to `.env`:
   ```bash
   LINEAR_CLIENT_ID=your_client_id
   LINEAR_REDIRECT_URI=vscode://umangdalvadi.jira-to-code/auth/linear/callback
   ```

### 🔷 GitHub Issues

#### Option 1: Personal Access Token (Recommended)
1. Go to GitHub Settings → Developer settings → [Personal access tokens](https://github.com/settings/tokens)
2. Generate new token with scopes: `repo`, `read:user`
3. Add to `.env`:
   ```bash
   GITHUB_TOKEN=your_personal_access_token
   ```

#### Option 2: OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth app
3. Set Authorization callback URL: `vscode://umangdalvadi.jira-to-code/auth/github/callback`
4. Add to `.env`:
   ```bash
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

## AI Configuration

### Google Gemini (Default)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`:
   ```bash
   GOOGLE_API_KEY=your_google_api_key
   ```

## Complete .env Example

```bash
# AI Configuration
GOOGLE_API_KEY=your_google_gemini_api_key

# Jira (choose one method)
ATLASSIAN_EMAIL=your-email@company.com
ATLASSIAN_API_TOKEN=your_api_token
# OR
# ATLASSIAN_CLIENT_ID=your_oauth_client_id
# ATLASSIAN_REDIRECT_URI=vscode://umangdalvadi.jira-to-code/auth/callback

# Trello (optional)
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token

# Linear (optional)
LINEAR_API_KEY=your_linear_api_key
# OR
# LINEAR_CLIENT_ID=your_oauth_client_id
# LINEAR_REDIRECT_URI=vscode://umangdalvadi.jira-to-code/auth/linear/callback

# GitHub (optional)
GITHUB_TOKEN=your_github_token
# OR
# GITHUB_CLIENT_ID=your_oauth_client_id
# GITHUB_CLIENT_SECRET=your_oauth_client_secret
```

## Testing Your Setup

1. **Open Extension**: `Ctrl+Shift+P` → "Ticket to Code AI"
2. **Test URL**: Paste a ticket URL from any configured platform
3. **Verify Authentication**: Extension will prompt if authentication is needed
4. **Check Output**: Look for success messages in VS Code Output panel

## Troubleshooting

### "No adapter found for URL"
- Verify URL format matches supported patterns
- Check that you're using a supported platform

### Authentication Errors
- Verify API keys/tokens are correct
- Check that tokens have required permissions
- For OAuth: ensure redirect URIs match exactly

### Extension Not Loading
1. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Check for errors in Developer Console: `Help` → `Toggle Developer Tools`
3. Verify `.env` file is in workspace root

### API Rate Limits
- Jira: 300 requests per minute
- Trello: 300 requests per 10 seconds
- Linear: 2000 requests per hour
- GitHub: 5000 requests per hour (authenticated)

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use minimal permissions** - Only grant required scopes
3. **Rotate tokens regularly** - Set up token rotation schedule
4. **Use OAuth when possible** - More secure than API tokens
5. **Monitor usage** - Check API usage in platform dashboards

## Getting Help

- 📖 [Integration Guide](./INTEGRATIONS.md) - Detailed platform information
- 🔄 [Migration Guide](./MIGRATION.md) - Upgrading from Jira-only version
- 🐛 [GitHub Issues](https://github.com/UmangDalvadi/jira-to-code/issues) - Report bugs
- 💬 [Discussions](https://github.com/UmangDalvadi/jira-to-code/discussions) - Ask questions