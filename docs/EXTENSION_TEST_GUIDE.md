# VS Code Extension Testing Guide

## How to Test the Atlassian AI Assistant Extension

### 1. Launch Extension Development Host
1. Open the extension project in VS Code: `c:\Repo\MyPersonalAssistant\personal\InterviewPrep\Atlassian\AI_Prototype_Project\future-ai-atlassian\atlassian-ai-assistant`
2. Press **F5** (or Run > Start Debugging)
3. This will launch a new VS Code window with your extension loaded

### 2. Test the Extension Commands

#### Test Command 1: Show Demo Info
1. In the Extension Development Host window, press **Ctrl+Shift+P** to open Command Palette
2. Type "Atlassian AI: Show Demo" and select it
3. **Expected Result**: Information message with links to Jira and Confluence
4. Click the buttons to verify they open the correct URLs:
   - Jira Board: https://future-ai-atlassian.atlassian.net/jira/software/projects/SCRUM/boards/1
   - Confluence Docs: https://future-ai-atlassian.atlassian.net/wiki/spaces/SD/overview

#### Test Command 2: Generate Code from Jira Story
1. Create a new TypeScript file in the Extension Development Host (File > New File, save as test.ts)
2. Press **Ctrl+Shift+P** to open Command Palette
3. Type "Atlassian AI: Generate Code from Jira Story" and select it
4. Enter a Jira issue key when prompted (try: **SCRUM-1**)
5. **Expected Result**: 
   - Loading message appears
   - Generated TypeScript code is inserted at cursor position
   - Success message confirms completion

### 3. Expected Generated Code Structure
The extension should generate code that includes:
- Proper TypeScript interfaces
- Error handling patterns
- Team coding standards compliance
- TODO comments for review points
- Comments referencing the Jira story

### 4. Troubleshooting
If you encounter issues:
1. Check the Debug Console in VS Code for error messages
2. Verify API tokens are still valid
3. Ensure internet connection for Atlassian API calls
4. Try different Jira issue keys (SCRUM-1, SCRUM-2, SCRUM-3, etc.)

### 5. Demo Ready Checklist
- ✅ Extension compiles without errors
- ✅ Extension loads in Development Host (F5)
- ✅ "Show Demo" command works and opens correct URLs
- ✅ "Generate Code" command accepts input and shows loading message
- ✅ Generated code appears in editor with proper formatting
- ✅ Success messages appear for both commands

## Next Steps
Once testing is complete, you're ready to:
1. Practice the 5-minute demo script
2. Record a backup demo video (optional)
3. Prepare for the live interview demonstration

## Demo Tips
- Have the Jira board and Confluence space open in separate tabs
- Pre-position VS Code windows for smooth demonstration
- Practice the command sequence to appear natural
- Emphasize the integration between Jira context, Confluence standards, and AI code generation
