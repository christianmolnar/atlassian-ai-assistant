# VS Code Settings for Agent Features

To enable the full agent capabilities mentioned in the setup instructions, please add these settings to your VS Code configuration:

## Method 1: Via Settings UI
1. Open VS Code Settings (Cmd/Ctrl + ,)
2. Search for each setting and enable it:
   - `chat.tools.autoApprove` → Set to `true`
   - `chat.agent.maxRequests` → Set to `100`
   - `chat.agent.enabled` → Set to `true`

## Method 2: Via settings.json
Add these to your VS Code `settings.json` file:

```json
{
  "chat.tools.autoApprove": true,
  "chat.agent.maxRequests": 100,
  "chat.agent.enabled": true
}
```

## How to Edit settings.json
1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Type "Preferences: Open Settings (JSON)"
3. Add the settings above to your configuration

These settings will:
- **chat.tools.autoApprove**: Allow the agent to run tools without asking for permission each time
- **chat.agent.maxRequests**: Increase the limit for agent requests per session
- **chat.agent.enabled**: Enable the agent functionality in VS Code

## Note
These settings are user-specific and cannot be set automatically by the extension. They need to be configured manually in your VS Code settings.
