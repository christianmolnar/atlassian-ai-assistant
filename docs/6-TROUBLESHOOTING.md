# Quick Troubleshooting Guide

## Issue 1: Keyboard Shortcut Not Working

### Possible Causes:
1. **VS Code needs a restart** after extension update
2. **Keyboard shortcut conflict** with another extension
3. **Extension not properly activated**

### Quick Fixes:
1. **Restart VS Code** completely (`Ctrl+Shift+P` → "Developer: Reload Window")
2. **Try Command Palette instead**: `Ctrl+Shift+P` → "📚 Generate Sprint Documentation"
3. **Check for conflicts**: `Ctrl+Shift+P` → "Preferences: Open Keyboard Shortcuts" → Search for "ctrl+alt+d"

## Issue 2: No Active Sprints Found

### This means one of these:
1. **No sprints are currently active** in your Jira boards
2. **Configuration issue** with Atlassian credentials
3. **Permission issue** accessing Jira boards

### Quick Test Steps:

#### Step 1: Test Basic Connection
1. `Ctrl+Shift+P` → "🚀 Open Your Atlassian Projects"
2. Should open your Atlassian site in browser
3. If this fails, configuration issue

#### Step 2: Test Jira Access
1. `Ctrl+Shift+P` → "📋 Check Current Sprints"
2. Should show sprint information (even if no active sprints)
3. If this fails, Jira access issue

#### Step 3: Create a Test Sprint (if needed)
If you have no active sprints:
1. Go to your Jira board in browser
2. Create a new sprint
3. Add 1-2 issues to the sprint
4. **Start the sprint** (make it active)
5. Try the extension again

## Quick Fix Commands

```bash
# Restart extension (in terminal)
cd "c:\Repo\atlassian-ai-assistant"
npm run dev-rebuild

# Or just reload VS Code window:
# Ctrl+Shift+P → "Developer: Reload Window"
```

## Test This First:

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Type**: "📋 Check Current Sprints"
3. **Run it** - this will tell us if Jira connection works
4. **Look for error messages** in the notification area

Let me know what happens with "Check Current Sprints" - that will tell us if it's a connection issue or truly no active sprints!
