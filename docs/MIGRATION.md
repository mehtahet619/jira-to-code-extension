# Migration Guide

## Upgrading from Jira-only to Multi-Platform Support

This guide helps existing users migrate to the new multi-platform integration system.

### What's Changed

1. **Extension Name**: "Jira-to-Code" → "Ticket-to-Code"
2. **Command Title**: "Jira to Code AI" → "Ticket to Code AI"
3. **Supported Platforms**: Now supports Jira, Trello, Linear, and GitHub Issues
4. **Architecture**: Refactored to use adapter pattern for extensibility

### Breaking Changes

#### Environment Variables
No breaking changes to existing Jira environment variables. Your existing setup will continue to work:
- `ATLASSIAN_EMAIL` ✅ Still supported
- `ATLASSIAN_API_TOKEN` ✅ Still supported
- `ATLASSIAN_CLIENT_ID` ✅ Still supported
- `ATLASSIAN_REDIRECT_URI` ✅ Still supported

#### API Changes
If you were using any internal APIs (not recommended), some service methods have been refactored:
- `fetchJiraAndExtract()` → Use `IntegrationService.fetchTicketAndExtract()`
- Direct Jira service imports → Use the new `IntegrationService`

### New Features

#### Multi-Platform Support
You can now paste URLs from any supported platform:
```
✅ https://company.atlassian.net/browse/PROJ-123
✅ https://trello.com/c/abc123/card-name
✅ https://linear.app/team/issue/TEAM-123
✅ https://github.com/owner/repo/issues/123
```

#### Enhanced Error Messages
Better error messages that specify which platform authentication is needed.

#### Extensible Architecture
Community can now easily add support for new platforms.

### Migration Steps

1. **Update Extension**: The extension will auto-update through VS Code
2. **No Configuration Changes**: Your existing Jira setup continues to work
3. **Optional**: Add environment variables for other platforms you want to use
4. **Test**: Try pasting a Jira URL to ensure everything still works

### Adding New Platforms

To use additional platforms, add their environment variables to your `.env` file:

```bash
# Trello (optional)
TRELLO_API_KEY=your_api_key
TRELLO_TOKEN=your_token

# Linear (optional)
LINEAR_API_KEY=your_api_key

# GitHub (optional)
GITHUB_TOKEN=your_personal_access_token
```

### Troubleshooting

#### "No adapter found for URL"
- Ensure the URL format is correct for the platform
- Check that the platform is supported (Jira, Trello, Linear, GitHub Issues)

#### Authentication Issues
- Each platform requires separate authentication
- Check the [Integration Guide](./INTEGRATIONS.md) for platform-specific setup

#### Extension Not Working
1. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
2. Check the Output panel for error messages
3. Verify your `.env` file configuration

### Support

If you encounter issues during migration:
1. Check the [Integration Guide](./INTEGRATIONS.md)
2. Review the [Troubleshooting section](./INTEGRATIONS.md#error-handling)
3. Open an issue on GitHub with details about your setup

### Rollback (if needed)

If you need to rollback to the Jira-only version:
1. Go to VS Code Extensions
2. Find "Ticket-to-Code" extension
3. Click the gear icon → "Install Another Version"
4. Select the last Jira-only version

Note: We recommend using the new version as it's backward compatible and includes bug fixes.