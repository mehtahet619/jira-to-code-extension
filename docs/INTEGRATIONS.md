# Integration Adapters

This extension supports multiple project management platforms through a flexible adapter system. Each adapter handles authentication, URL parsing, and data fetching for its respective platform.

## Supported Platforms

### 1. Jira (Atlassian)
- **URL Format**: `https://your-domain.atlassian.net/browse/TICKET-123`
- **Authentication**: OAuth 2.0 or API Token + Email
- **Required Environment Variables**:
  ```
  ATLASSIAN_EMAIL=your_email@example.com
  ATLASSIAN_API_TOKEN=your_api_token
  # OR for OAuth:
  ATLASSIAN_CLIENT_ID=your_client_id
  ATLASSIAN_REDIRECT_URI=vscode://publisher.extension/auth/callback
  ```

### 2. Trello
- **URL Format**: `https://trello.com/c/cardId/card-name`
- **Authentication**: API Key + Token
- **Required Environment Variables**:
  ```
  TRELLO_API_KEY=your_api_key
  TRELLO_TOKEN=your_token
  ```

### 3. Linear
- **URL Format**: `https://linear.app/team/issue/TEAM-123`
- **Authentication**: API Key or OAuth 2.0
- **Required Environment Variables**:
  ```
  LINEAR_API_KEY=your_api_key
  # OR for OAuth:
  LINEAR_CLIENT_ID=your_client_id
  LINEAR_REDIRECT_URI=vscode://publisher.extension/auth/linear/callback
  ```

### 4. GitHub Issues
- **URL Format**: `https://github.com/owner/repo/issues/123`
- **Authentication**: Personal Access Token or OAuth
- **Required Environment Variables**:
  ```
  GITHUB_TOKEN=your_personal_access_token
  # OR for OAuth:
  GITHUB_CLIENT_ID=your_client_id
  GITHUB_CLIENT_SECRET=your_client_secret
  ```

## How It Works

1. **URL Detection**: When you paste a ticket URL, the extension automatically detects which platform it belongs to
2. **Adapter Selection**: The appropriate adapter is selected based on the URL pattern
3. **Authentication Check**: The adapter verifies if you're authenticated with that platform
4. **Data Fetching**: The adapter fetches the ticket data using the platform's API
5. **Normalization**: All ticket data is converted to a common format for AI processing

## Adding New Adapters

To add support for a new platform:

1. Create a new adapter class extending `BaseAdapter`
2. Implement the required methods:
   - `initiateAuth()`: Handle authentication flow
   - `isAuthenticated()`: Check authentication status
   - `isValidUrl()`: Validate URL format
   - `extractTicketId()`: Extract ticket ID from URL
   - `fetchTicket()`: Fetch ticket data from API
3. Register the adapter in `AdapterRegistry`

Example:
```typescript
export class NewPlatformAdapter extends BaseAdapter {
    platform = IntegrationPlatform.NEW_PLATFORM;
    name = 'New Platform';

    // Implement required methods...
}
```

## Authentication Setup

### Jira (Atlassian)
1. **API Token Method** (Recommended):
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Create a new API token
   - Set `ATLASSIAN_EMAIL` and `ATLASSIAN_API_TOKEN`

2. **OAuth Method**:
   - Create an OAuth app in Atlassian Developer Console
   - Set redirect URI to `vscode://publisher.extension/auth/callback`
   - Set `ATLASSIAN_CLIENT_ID` and `ATLASSIAN_REDIRECT_URI`

### Trello
1. Get API Key: https://trello.com/app-key
2. Generate Token: Use the link provided on the API key page
3. Set `TRELLO_API_KEY` and `TRELLO_TOKEN`

### Linear
1. **API Key Method**:
   - Go to Linear Settings > API
   - Create a new personal API key
   - Set `LINEAR_API_KEY`

2. **OAuth Method**:
   - Create an OAuth application in Linear
   - Set `LINEAR_CLIENT_ID` and `LINEAR_REDIRECT_URI`

### GitHub
1. **Personal Access Token**:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Create token with `repo` and `read:user` scopes
   - Set `GITHUB_TOKEN`

2. **OAuth App**:
   - Create OAuth app in GitHub Developer settings
   - Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

## Error Handling

Each adapter includes comprehensive error handling for:
- Authentication failures
- Invalid URLs
- Network errors
- API rate limits
- Missing permissions

## Community Contributions

We welcome community contributions for additional platform adapters! Please see our [Contributing Guide](../CONTRIBUTING.md) for details on how to add support for new platforms.

### Requested Platforms
- Azure DevOps
- Asana
- Monday.com
- ClickUp
- Notion
- YouTrack

If you'd like to see support for a specific platform, please open an issue or contribute an adapter!