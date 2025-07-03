# Extension Launch Troubleshooting Guide

## Step-by-Step Launch Process

### 1. Verify You're in the Right Location
**Current Directory Should Be:**
```
c:\Repo\MyPersonalAssistant\personal\InterviewPrep\Atlassian\AI_Prototype_Project\future-ai-atlassian\atlassian-ai-assistant
```

### 2. Open the Extension Project in VS Code
1. **File** → **Open Folder**
2. Navigate to and select: `atlassian-ai-assistant` folder
3. **Important**: Make sure you open the `atlassian-ai-assistant` folder directly, not a parent folder

### 3. Launch Extension Development Host
1. Press **F5** (or **Run** → **Start Debugging**)
2. **Expected Result**: A new VS Code window should open with title ending in `[Extension Development Host]`

### 4. If No New Window Opens
Try these steps:

#### Option A: Use Run and Debug View
1. Click the **Run and Debug** icon in the sidebar (▷ icon)
2. Click the green **▷ Run Extension** button at the top
3. A new window should open

#### Option B: Check Launch Configuration
1. Check if `.vscode/launch.json` exists in the extension folder
2. If missing, VS Code should auto-create it when you press F5

#### Option C: Manual Launch
1. Press **Ctrl+Shift+P** in your main VS Code window
2. Type "Developer: Reload Window" and run it
3. Try F5 again

### 5. Verify Extension is Loaded
Once the Extension Development Host opens:

1. Press **Ctrl+Shift+P** to open Command Palette
2. Type "Atlassian" - you should see:
   - 🤖 **Generate Code from Jira Story**
   - 🚀 **Show Demo Info** (or "Show Atlassian AI Demo")

### 6. Test the Extension
1. Try the **Show Demo Info** command first (safer test)
2. Should show a popup with Jira and Confluence links
3. Then try **Generate Code from Jira Story**
4. Enter "SCRUM-1" when prompted

## Common Issues & Solutions

### Issue: "Extension Host terminated unexpectedly"
**Solution**: Check the Debug Console for error messages
1. **View** → **Debug Console**
2. Look for red error messages
3. Common fix: Restart VS Code and try again

### Issue: Commands don't appear in Command Palette
**Solution**: Extension might not be activating
1. Check the Debug Console for activation errors
2. Verify package.json has correct command definitions
3. Try reloading the Extension Development Host window

### Issue: Extension loads but commands fail
**Solution**: API connectivity issue
1. Check internet connection
2. Verify Atlassian API tokens are still valid
3. Check Debug Console for specific error messages

### Issue: Multiple VS Code windows are confusing
**Solution**: Window management
1. Main window: Where you edit the extension code
2. Extension Development Host: Where you test the extension
3. Use **Window** → **Switch Window** if you lose track

## Success Indicators
✅ New VS Code window opens with "[Extension Development Host]" in title  
✅ Command Palette shows "Atlassian AI" commands when you type "Atlassian"  
✅ "Show Demo Info" command displays popup with working links  
✅ "Generate Code" command prompts for Jira issue key  
✅ Generated code appears in editor after entering "SCRUM-1"  

## Next Steps After Success
1. Practice the demo flow: Show Demo → Generate Code → Explain the magic
2. Test with different Jira issue keys (SCRUM-1, SCRUM-2, SCRUM-3)
3. Prepare your 5-minute interview demonstration
