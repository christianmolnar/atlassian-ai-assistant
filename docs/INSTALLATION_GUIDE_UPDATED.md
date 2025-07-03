# Atlassian AI Assistant - Installation & Usage Guide

## 🚀 Quick Start for Atlassian Employees

This guide helps you install and test the AI-powered VS Code extension
that integrates Jira, Confluence, and AI for intelligent code
generation.

------------------------------------------------------------------------

## Prerequisites Checklist

### ✅ What You Need

- [ ] Windows, Mac, or Linux computer
- [ ] Access to Atlassian Cloud (Jira + Confluence)
- [ ] Admin access to create API tokens
- [ ] 15 minutes for setup

### ✅ What You'll Get

- Working VS Code extension that reads Jira stories
- AI code generation based on your team's Confluence documentation
- Live demo of integrated Atlassian ecosystem + AI

------------------------------------------------------------------------

## Step 1: Install Visual Studio Code (if needed)

### If You Already Have VS Code:

✅ Skip to Step 2

### If You Don't Have VS Code:

1.  **Download**: Go to https://code.visualstudio.com/
2.  **Install**: Run the installer (accept all defaults)
3.  **Launch**: Open VS Code after installation

## Step 2: Install the Atlassian AI Assistant Extension

### Method 1: Install from File (Recommended)

1.  **Download**: Get the `atlassian-ai-assistant-0.0.1.vsix` file
2.  **Open VS Code**
3.  **Open Command Palette**: Press `Ctrl+Shift+P` (Windows/Linux) or
    `Cmd+Shift+P` (Mac)
4.  **Type**: `Extensions: Install from VSIX`
5.  **Select the File**: Browse to and select
    `atlassian-ai-assistant-0.0.1.vsix`
6.  **Wait**: Extension installs automatically
7.  **Success**: You'll see "Extension installed successfully" message

### Method 2: Manual Installation (Alternative)

1.  Open VS Code
2.  Go to **View** → **Extensions** (or press `Ctrl+Shift+X`)
3.  Click the **"..."** menu in the Extensions panel
4.  Select **"Install from VSIX..."**
5.  Choose the `atlassian-ai-assistant-0.0.1.vsix` file

Test it worked

1.  Go back into the **Command Palette**: Press
    `Ctrl+Shift+P, and typing “Atlassian”`
2.  `You will see 2 capabilities:`
    1.  `Atlassian AI: Generate Code from Jira Story`
    2.  `Atlassian AI: Show Demo Info`

------------------------------------------------------------------------

## Step 3: Set Up Atlassian API Access

### Create API Tokens

1.  **Go to**:
    https://id.atlassian.com/manage-profile/security/api-tokens
2.  **Click**: "Create API token"
3.  **Label**: "VS Code AI Extension Demo"
4.  **Copy**: Save the token somewhere safe (you'll need it in Step 4)

### Find Your Atlassian Site URL

- Your Jira URL looks like: `https://yourcompany.atlassian.net`
- Note the part before `.atlassian.net` (this is your site name)

------------------------------------------------------------------------

## Step 4: Configure the Extension

### Update Extension Settings

1.  **Open the extension source code** (if you want to use your own
    Atlassian instance)
2.  **Navigate to**: `src/extension.ts`
3.  **Find this section** (around line 6):

<!-- -->

    const ATLASSIAN_CONFIG = {
        email: 'your-email@company.com',           // ← Your Atlassian email
        token: 'your-api-token-here',              // ← Token from Step 3
        site: 'yourcompany.atlassian.net'          // ← Your Atlassian site
    };

4.  **Replace** with your actual values
5.  **Save** the file
6.  **Recompile**: Press `Ctrl+Shift+P` → Type "Developer: Reload
    Window"

## Step 4: Configure the Extension for Your Atlassian Instance

### Required: Update Extension Configuration

Since the extension is currently configured for a private development
environment, you must update it to work with your Atlassian instance.

### Method 1: Edit the Installed Extension Files

1.  **Find Extension Installation Directory**:
    - **Windows**: `%USERPROFILE%\.vscode\extensions\`
    - **Mac**: `~/.vscode/extensions/`
    - Look for folder starting with `atlassian-ai-assistant`
2.  **Edit Configuration File**:
    - Open `out/extension.js` in the extension folder
    - Find the `ATLASSIAN_CONFIG` section (near the top)
    - Replace the placeholder values with yours:

- const ATLASSIAN_CONFIG = {
          email: 'your-email@company.com',        // Your Atlassian email
          token: 'your-api-token-from-step-3',    // API token from Step 3
          site: 'yourcompany.atlassian.net'       // Your Atlassian site
      };

  - **Save** the file
  - **Restart VS Code**

### Method 2: Modify and Rebuild (If Source Code Provided)

1.  **Edit Source**: Update `src/extension.ts` with your configuration
2.  **Compile**: Run `npm run compile` in the extension directory
3.  **Package**: Run `vsce package` to create new .vsix file
4.  **Reinstall**: Install the updated .vsix file

### Your Atlassian Site Information

- **Email**: The email you use to log into Atlassian
- **Token**: Created in Step 3 above
- **Site**: Found in your Atlassian URL (e.g., if your Jira is at
  `https://mycompany.atlassian.net`, then your site is
  `mycompany.atlassian.net`)

------------------------------------------------------------------------

## ⚠️ IMPORTANT: Understanding the Extension Configuration

### Critical Setup Requirement

**The extension must be configured to work with YOUR Atlassian
instance.** Since Atlassian sites are private, you cannot access the
development environment where this was built. You'll need to set it up
for your own Jira and Confluence.

### What You Need

- Access to Atlassian Cloud (Jira + Confluence)
- Admin permissions to create API tokens
- At least one Jira project with some issues
- At least one Confluence space with some documentation

### If You Don't Have These

You can still install the extension to see the interface and commands,
but the API calls will fail when trying to connect to Jira/Confluence.
The extension will demonstrate the concept even without live data.

------------------------------------------------------------------------

## Step 5: Test the Extension

### Quick Test Sequence

1.  **Open Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or
    `Cmd+Shift+P` (Mac)
2.  **Type**: "Atlassian"
3.  **You should see**:
    - 🚀 **Show Demo Info**
    - 🤖 **Generate Code from Jira Story**

### Test 1: Demo Info

1.  **Run**: "🚀 Show Demo Info"
2.  **Expected**: Popup with links to Jira and Confluence
3.  **Click**: The links to see the demo project

### Test 2: Code Generation

1.  **Create**: New file in VS Code (`Ctrl+N`)
2.  **Run**: "🤖 Generate Code from Jira Story"
3.  **Enter**: A Jira issue key from YOUR project (e.g., "PROJ-1",
    "TASK-5", etc.)
4.  **Watch**: AI generates TypeScript code in your file
5.  **Result**: Professional code appears that combines your Jira story
    with any Confluence documentation patterns!

**Note**: Use issue keys from YOUR Jira project, not "SCRUM-1" which was
from the development environment.

------------------------------------------------------------------------

## Step 6: Understand What You're Seeing

### The Magic Moment

When you run "Generate Code from Jira Story" with your own issue:

1.  **Extension reads** your Jira story details (title, description,
    requirements)
2.  **Extension fetches** any relevant documentation from your
    Confluence
3.  **AI combines** both sources to generate contextually-aware code
4.  **Result**: Code that reflects your specific requirements AND any
    team patterns from your documentation

### Why This Matters

- **Better AI**: Context from organized knowledge beats generic AI
  responses
- **Team Consistency**: Generated code can follow established patterns
  if documented in Confluence
- **Developer Productivity**: Less context switching, more focused
  development
- **Competitive Advantage**: Shows why Atlassian's integrated platform
  enables superior AI experiences

### What You'll See

The generated code will vary based on your actual Jira stories and
Confluence content. The more structured information you have in your
Atlassian instance, the better the AI-generated results will be.

## Understanding What You're Seeing

### The Magic Moment

When you run "Generate Code from Jira Story":

1.  **Extension reads** the Jira story details (title, description,
    requirements)
2.  **Extension fetches** team coding standards from Confluence
3.  **AI combines** both sources to generate contextually-aware code
4.  **Result**: Code that follows your team patterns AND meets story
    requirements

### Why This Matters

- **Better AI**: Context from organized knowledge beats generic AI
- **Team Consistency**: Generated code follows established patterns
- **Developer Productivity**: Less context switching, more focused
  development
- **Competitive Advantage**: Shows why Atlassian's integrated platform
  wins

------------------------------------------------------------------------

## Troubleshooting

### Extension Not Appearing?

- **Check**: Extensions panel (`Ctrl+Shift+X`) for "Atlassian AI
  Assistant"
- **Try**: Developer: Reload Window (`Ctrl+Shift+P`)
- **Restart**: Close and reopen VS Code

### Commands Not Working?

- **Verify**: API tokens are correctly configured
- **Check**: Internet connection for API calls
- **Look**: At VS Code Developer Console for error messages

### API Errors?

- **Token expired**: Create new API token
- **Wrong site**: Verify your Atlassian site URL
- **Permissions**: Ensure token has Jira and Confluence read access

------------------------------------------------------------------------

## Next Steps

### For Your Own Project

1.  **Set up**: Your own Jira project with real stories
2.  **Create**: Confluence pages with your team's coding standards
3.  **Configure**: Extension to use your Atlassian instance
4.  **Generate**: AI code that follows YOUR team patterns

### Strategic Discussion Points

- How does this change developer productivity?
- What's the competitive advantage vs. scattered documentation?
- How could this scale across your entire development organization?
- What other AI integrations become possible with organized knowledge?

------------------------------------------------------------------------

## 🎯 Success Criteria

### You Know It's Working When:

✅ Extension commands appear in Command Palette\
✅ "Show Demo" displays working links to Jira/Confluence\
✅ "Generate Code" prompts for issue key\
✅ Generated TypeScript code appears in editor\
✅ Code quality shows clear influence from team standards

### You're Ready to Demo When:

✅ You can run the full workflow smoothly\
✅ You understand the strategic value proposition\
✅ You can explain why organized knowledge enables better AI\
✅ You can discuss competitive advantages

------------------------------------------------------------------------

## 📞 Need Help?

If you run into any issues: 1. **Check** the troubleshooting section
above 2. **Look** at the VS Code Developer Console for errors 3. **Try**
the demo instance first before configuring your own 4. **Remember**:
This is a prototype - focus on the concept demonstration

**The goal is to show the art of the possible, not production
perfection!**

------------------------------------------------------------------------

## 🚀 Ready to Be Amazed?

This extension represents the future of AI-powered development:
intelligent, contextual, and seamlessly integrated into existing
workflows.

**Start with Step 1 and enjoy the demo!** 🎉
