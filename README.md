# Atlassian AI Assistant

🤖 **AI-powered code generation using Jira stories and Confluence documentation**

Transform your development workflow by connecting Jira requirements with Confluence team standards to generate intelligent, context-aware code.

## ✨ Features

### 🚀 **AI Code Generation from Jira Stories**
- Connect to your Jira instance and pull story details
- Generate TypeScript code based on story requirements
- Context-aware generation that follows your team's coding standards

### 📚 **Confluence Integration**
- Automatically retrieves team coding standards from Confluence
- Incorporates API guidelines and architecture patterns
- Ensures generated code follows established team practices

### 🎯 **Smart Context Combination**
- Combines Jira story requirements with Confluence documentation
- Produces code that is both functionally correct and style-compliant
- Includes TODO comments for human review points

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| `Atlassian AI: Generate Code from Jira Story` | Generate code based on a Jira issue key |
| `Atlassian AI: Show Demo` | Display demo information and quick links |

## 📋 Requirements (End Users)

- **VS Code** 1.101.0 or higher
- **Internet connection** for Atlassian API access
- **Atlassian Cloud account** with:
  - Jira project access
  - Confluence space access
  - Valid API token

## ⚙️ Quick Setup (End Users)

1. **Install the extension** from VS Code Marketplace or load the .vsix file
2. **Get your API tokens:**
   - **Atlassian API Token**: Visit [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - **OpenAI API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
3. **First run setup**: The extension will prompt you for credentials on first use
4. **Configure your Atlassian instance** (site, email, API token)
5. **Add your OpenAI API key** for AI code generation

### 🔐 Security Note
Your API keys are stored securely in VS Code's settings and never shared or transmitted anywhere except to make authenticated requests to Atlassian and OpenAI APIs.

## 🚀 Usage

1. **Open Command Palette** (Ctrl+Shift+P)
2. **Type "Atlassian"** to see available commands
3. **Select "Generate Code from Jira Story"**
4. **Enter a Jira issue key** (e.g., "SCRUM-1")
5. **Watch the AI generate contextual code** based on your story and team standards

## �‍💻 Development Setup

### 🛠️ Prerequisites (REQUIRED)

#### Software Requirements:
- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Visual Studio Code** (v1.101.0 or higher) - [Download here](https://code.visualstudio.com/)
- **Git** - [Download here](https://git-scm.com/)

#### VS Code Extensions (REQUIRED for development):
- **Extension Test Runner** (`ms-vscode.extension-test-runner`) - Install from VS Code Marketplace

#### API Keys & External Services (REQUIRED):
1. **Atlassian Cloud Account** with:
   - Jira project access
   - Confluence space access
   - **API Token**: Get from [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)

### 🚀 Complete Setup Steps

#### 1. Clone Repository
```bash
git clone https://github.com/christianmolnar/atlassian-ai-assistant.git
cd atlassian-ai-assistant
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Verify Installation
Check that all dependencies installed correctly:
```bash
npm list
```

#### 4. Environment Setup (Optional but Recommended)
Create a `.env` file in the project root for development convenience:
```bash
# .env file (create in project root - DO NOT COMMIT TO GIT)
ATLASSIAN_EMAIL=your-email@company.com
ATLASSIAN_SITE=yourcompany.atlassian.net
ATLASSIAN_TOKEN=your-api-token
OPENAI_API_KEY=sk-your-openai-key
```

#### 5. Build the Extension
```bash
npm run compile
```

#### 6. Test in Development Mode
1. Open the project in VS Code
2. Press **F5** to launch Extension Development Host
3. A new VS Code window opens with your extension loaded
4. Test commands via Command Palette (`Ctrl+Shift+P`)

### 📦 Development Dependencies

All dependencies are automatically installed with `npm install`. Here's what gets installed:

#### Build & Compilation:
- `typescript: ^5.8.3` - TypeScript compiler
- `webpack: ^5.99.9` - Module bundler
- `webpack-cli: ^6.0.1` - Webpack command line
- `ts-loader: ^9.5.2` - TypeScript loader for Webpack

#### VS Code Extension Framework:
- `@types/vscode: ^1.101.0` - VS Code API type definitions
- `@types/node: 20.x` - Node.js type definitions

#### Testing Framework:
- `@types/mocha: ^10.0.10` - Mocha test framework types
- `@vscode/test-cli: ^0.0.10` - VS Code extension test CLI
- `@vscode/test-electron: ^2.5.2` - VS Code extension test runner

#### Code Quality:
- `@typescript-eslint/eslint-plugin: ^8.31.1` - TypeScript ESLint plugin
- `@typescript-eslint/parser: ^8.31.1` - TypeScript ESLint parser
- `eslint: ^9.25.1` - JavaScript/TypeScript linter

#### Runtime Dependencies:
- `axios: ^1.10.0` - HTTP client for API requests
- `dotenv: ^17.0.1` - Environment variable loader
- `openai: ^5.8.2` - OpenAI API client
- `rimraf: ^5.0.10` - Cross-platform file deletion utility

### 🔧 Development Commands

```bash
# Build extension
npm run compile

# Watch mode (auto-rebuild on changes)
npm run watch

# Package extension (.vsix file)
npm run package

# Run linter
npm run lint

# Run tests
npm run test

# Development workflow commands
npm run dev-rebuild    # Quick rebuild and reinstall
npm run dev-cycle      # Full development cycle
npm run clean-test-data # Clean up test output files
```

### 🧪 Testing & Debugging

#### Running Tests:
1. Install Extension Test Runner in VS Code
2. Run watch task: `npm run watch`
3. Open Testing view in VS Code
4. Click "Run Tests" or use `Ctrl/Cmd + ; A`

#### Debugging:
1. Set breakpoints in `src/extension.ts`
2. Press **F5** to launch debug session
3. Debug console shows extension output
4. Use **Developer: Reload Window** after code changes

#### Manual Testing Workflow:
1. Make changes in `src/extension.ts`
2. Run `npm run dev-rebuild`
3. Test in Extension Development Host
4. Check output in `./test-output/` directory

### 🌐 Live Demo Environment

For testing, you can use the demo Atlassian instance:
- **Jira**: https://future-ai-atlassian.atlassian.net/jira/software/projects/SCRUM/boards/1
- **Confluence**: https://future-ai-atlassian.atlassian.net/wiki/spaces/SD/overview

### 🔧 Troubleshooting Development Issues

#### Common Issues:

**Build Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Extension Not Loading:**
```bash
# Reload VS Code window
Developer: Reload Window (Ctrl+Shift+P)
```

**API Authentication Issues:**
- Verify API tokens in VS Code settings
- Check Atlassian site URL format (no https://)
- Ensure sufficient permissions in Atlassian

**Webpack Build Issues:**
```bash
# Clean build
npm run clean-test-data
npm run compile
```

### 📂 Project Structure

```
atlassian-ai-assistant/
├── src/
│   ├── extension.ts          # Main extension logic
│   └── test/
│       └── extension.test.ts # Test files
├── dist/                     # Compiled output
├── test-output/             # Generated test files
├── docs/                    # Documentation
├── package.json             # Dependencies & scripts
├── tsconfig.json           # TypeScript config
├── webpack.config.js       # Build configuration
└── README.md               # This file
```

### 🚢 Building for Distribution

```bash
# Create installable .vsix package
npm run package

# Install packaged extension
code --install-extension atlassian-ai-assistant-0.0.1.vsix
```

### 📚 Additional Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Development Guide](https://code.visualstudio.com/api/get-started/your-first-extension)
- [Atlassian REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

## 📦 Installation (Pre-built Extension)

### For Testing/Demo:
```bash
# Install from .vsix file
code --install-extension atlassian-ai-assistant-0.0.1.vsix
```

## 🎬 Demo Scenario

This extension demonstrates a complete **Jira → Confluence → AI → Code** workflow:

1. **Jira Story**: "Implement OAuth authentication" (SCRUM-1)
2. **Confluence Standards**: Team coding patterns and API guidelines
3. **AI Generation**: TypeScript authentication service following team standards
4. **Result**: Production-ready code with proper error handling and documentation

## 🏗️ Architecture

- **Atlassian API Integration**: Direct REST API calls to Jira and Confluence
- **AI Context Building**: Combines multiple data sources for intelligent generation
- **VS Code Extension Framework**: Professional extension development patterns
- **TypeScript Implementation**: Type-safe development with modern patterns

## 🔒 Security Notes

- API tokens are currently stored in source code for demo purposes
- Production implementation would use secure credential storage
- All API calls use HTTPS and proper authentication

## 🎯 Use Cases

- **Rapid Prototyping**: Generate code scaffolding from requirements
- **Standards Compliance**: Ensure new code follows team patterns
- **Knowledge Integration**: Combine scattered documentation into actionable code
- **Developer Productivity**: Reduce time from story to implementation

## 🔮 Future Enhancements

- OpenAI integration for production-grade AI generation
- Secure credential management
- Multiple programming language support
- Custom team template integration
- Automated code review suggestions

## 📈 Strategic Value

This extension demonstrates how **organized knowledge architecture** enables superior AI experiences:

- **Atlassian's integrated ecosystem** provides context that scattered tools cannot
- **Confluence documentation** becomes immediately actionable through AI
- **Jira requirements** are automatically translated into compliant code
- **Team productivity** increases through intelligent automation

## 📝 Release Notes

### 0.0.1 - Demo Release

- Initial implementation with Jira and Confluence integration
- AI-powered TypeScript code generation
- Demo scenario with authentication service generation
- Professional VS Code extension architecture

---

**Built for demonstrating the power of integrated knowledge platforms in AI-driven development workflows.**

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the development setup guide above
4. Make your changes
5. Run tests: `npm run test`
6. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in this repository
- Check the troubleshooting section above
- Review the documentation in `docs/` folder
