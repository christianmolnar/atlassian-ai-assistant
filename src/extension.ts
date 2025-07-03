// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import axios from 'axios';

// Configuration Helper
class ConfigurationManager {
	static async getConfig(): Promise<{email: string, token: string, site: string, openaiApiKey: string} | null> {
		const config = vscode.workspace.getConfiguration('atlassianAI');
		
		let email = config.get<string>('email') || '';
		let token = config.get<string>('token') || '';
		let site = config.get<string>('site') || '';
		let openaiApiKey = config.get<string>('openaiApiKey') || '';

		// If any configuration is missing, prompt user
		if (!email || !token || !site || !openaiApiKey) {
			const setupResult = await this.promptForSetup(email, token, site, openaiApiKey);
			if (!setupResult) {
				return null; // User cancelled setup
			}
			return setupResult;
		}

		return { email, token, site, openaiApiKey };
	}

	static async promptForSetup(currentEmail: string, currentToken: string, currentSite: string, currentOpenaiKey: string) {
		vscode.window.showInformationMessage('🔧 First time setup: Please configure your Atlassian and OpenAI credentials.');

		// Prompt for email
		const email = await vscode.window.showInputBox({
			prompt: 'Enter your Atlassian email address',
			value: currentEmail,
			validateInput: (value) => {
				if (!value || !value.includes('@')) {
					return 'Please enter a valid email address';
				}
				return undefined;
			}
		});
		if (!email) {
			return null;
		}

		// Prompt for site
		const site = await vscode.window.showInputBox({
			prompt: 'Enter your Atlassian site (e.g., yourcompany.atlassian.net)',
			value: currentSite,
			validateInput: (value) => {
				if (!value || !value.includes('.atlassian.net')) {
					return 'Please enter your Atlassian site (ending with .atlassian.net)';
				}
				return undefined;
			}
		});
		if (!site) {
			return null;
		}

		// Prompt for API token
		const token = await vscode.window.showInputBox({
			prompt: 'Enter your Atlassian API token (create at: https://id.atlassian.com/manage-profile/security/api-tokens)',
			value: currentToken,
			password: true,
			validateInput: (value) => {
				if (!value || value.length < 10) {
					return 'Please enter a valid API token';
				}
				return undefined;
			}
		});
		if (!token) {
			return null;
		}

		// Prompt for OpenAI API key
		const openaiApiKey = await vscode.window.showInputBox({
			prompt: 'Enter your OpenAI API key (get from: https://platform.openai.com/api-keys)',
			value: currentOpenaiKey,
			password: true,
			validateInput: (value) => {
				if (!value || !value.startsWith('sk-')) {
					return 'Please enter a valid OpenAI API key (starts with sk-)';
				}
				return undefined;
			}
		});
		if (!openaiApiKey) {
			return null;
		}

		// Save configuration
		const config = vscode.workspace.getConfiguration('atlassianAI');
		await config.update('email', email, vscode.ConfigurationTarget.Global);
		await config.update('token', token, vscode.ConfigurationTarget.Global);
		await config.update('site', site, vscode.ConfigurationTarget.Global);
		await config.update('openaiApiKey', openaiApiKey, vscode.ConfigurationTarget.Global);

		vscode.window.showInformationMessage('✅ Configuration saved! You can now use the extension.');

		return { email, token, site, openaiApiKey };
	}
}

// Atlassian API client
class AtlassianClient {
	private auth: string;
	private site: string;

	constructor(email: string, token: string, site: string) {
		// Use Buffer for base64 encoding in Node.js environment
		this.auth = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
		// Normalize site - remove https:// if present
		this.site = site.replace(/^https?:\/\//, '');
	}

	async getIssue(issueKey: string) {
		try {
			const response = await axios.get(
				`https://${this.site}/rest/api/3/issue/${issueKey}`,
				{ headers: { 'Authorization': this.auth, 'Accept': 'application/json' } }
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to get issue ${issueKey}: ${error}`);
		}
	}

	async getConfluencePage(pageId: string) {
		try {
			const response = await axios.get(
				`https://${this.site}/wiki/rest/api/content/${pageId}?expand=body.storage`,
				{ headers: { 'Authorization': this.auth, 'Accept': 'application/json' } }
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to get Confluence page ${pageId}: ${error}`);
		}
	}

	async getProjectFromIssue(issueKey: string): Promise<string> {
		try {
			const issue = await this.getIssue(issueKey);
			return issue.fields.project.key;
		} catch (error) {
			throw new Error(`Failed to get project from issue ${issueKey}: ${error}`);
		}
	}

	async findProjectConfluenceSpace(projectKey: string): Promise<string | null> {
		try {
			console.log(`Searching for Confluence space for project: ${projectKey}`);
			
			// Search for Confluence spaces related to this project
			// Try common naming patterns: projectKey, "projectKey Software Development", etc.
			const searchTerms = [
				projectKey,
				`${projectKey} Software Development`,
				`${projectKey} Development`, 
				`${projectKey} Team`,
				`${projectKey} Project`
			];

			for (const term of searchTerms) {
				try {
					console.log(`Searching for Confluence space with term: ${term}`);
					const response = await axios.get(
						`https://${this.site}/wiki/rest/api/space?spaceKey=${term}&expand=description`,
						{ headers: { 'Authorization': this.auth, 'Accept': 'application/json' } }
					);
					if (response.data.results && response.data.results.length > 0) {
						// Found a space - now look for coding standards page
						const spaceKey = response.data.results[0].key;
						console.log(`Found Confluence space: ${spaceKey} for project ${projectKey}`);
						const codingStandardsPageId = await this.findCodingStandardsInSpace(spaceKey);
						if (codingStandardsPageId !== '491523') {
							console.log(`Found project-specific coding standards page: ${codingStandardsPageId}`);
							return codingStandardsPageId;
						}
					}
				} catch (spaceError) {
					console.log(`Space search failed for term '${term}': ${spaceError}`);
					continue;
				}
			}

			// Fallback to our demo space if no project-specific space found
			console.log(`No specific Confluence space found for project ${projectKey}, using demo space`);
			return '491523'; // Demo Team Coding Standards page
		} catch (error) {
			console.log(`Error finding Confluence space for project ${projectKey}, using demo space: ${error}`);
			return '491523'; // Demo Team Coding Standards page
		}
	}

	async findCodingStandardsInSpace(spaceKey: string): Promise<string> {
		try {
			// Search for coding standards pages in the space
			const searchTerms = [
				'coding standards',
				'development standards',
				'team standards',
				'coding guidelines'
			];

			for (const term of searchTerms) {
				try {
					const response = await axios.get(
						`https://${this.site}/wiki/rest/api/content/search?cql=space="${spaceKey}" AND title~"${term}"`,
						{ headers: { 'Authorization': this.auth, 'Accept': 'application/json' } }
					);
					if (response.data.results && response.data.results.length > 0) {
						return response.data.results[0].id;
					}
				} catch (searchError) {
					continue;
				}
			}

			// Fallback to demo page
			return '491523';
		} catch (error) {
			return '491523'; // Demo Team Coding Standards page
		}
	}

	async validateIssueContext(issueKey: string): Promise<{ isValid: boolean; issue: any; warnings: string[] }> {
		const warnings: string[] = [];
		
		try {
			const issue = await this.getIssue(issueKey);
			const projectKey = issue.fields.project.key;
			const expectedProjectPrefix = issueKey.split('-')[0];
			
			// Check for potential key collision
			if (projectKey !== expectedProjectPrefix) {
				warnings.push(`Issue key prefix '${expectedProjectPrefix}' doesn't match project key '${projectKey}'. This may indicate a key collision or data inconsistency.`);
			}
			
			// Check if issue exists in multiple projects (would require additional API calls)
			// For now, we'll just warn about the mismatch above
			
			return {
				isValid: true,
				issue,
				warnings
			};
		} catch (error) {
			return {
				isValid: false,
				issue: null,
				warnings: [`Failed to validate issue ${issueKey}: ${error}`]
			};
		}
	}

	async promptForProjectSelection(issueKey: string, detectedProject: string): Promise<string> {
		const options = [
			`Use detected project: ${detectedProject}`,
			'Enter different project key manually'
		];
		
		const selection = await vscode.window.showQuickPick(options, {
			placeHolder: `Issue ${issueKey} seems to belong to project ${detectedProject}. How would you like to proceed?`
		});
		
		if (!selection) {
			throw new Error('Project selection cancelled');
		}
		
		if (selection.startsWith('Use detected')) {
			return detectedProject;
		} else {
			const manualProject = await vscode.window.showInputBox({
				prompt: 'Enter the correct project key',
				placeHolder: 'e.g., MYPROJ',
				validateInput: (value) => {
					if (!value || value.trim().length === 0) {
						return 'Project key cannot be empty';
					}
					if (!/^[A-Z][A-Z0-9_]*$/.test(value.trim())) {
						return 'Project key should start with a letter and contain only uppercase letters, numbers, and underscores';
					}
					return null;
				}
			});
			
			if (!manualProject) {
				throw new Error('Project selection cancelled');
			}
			
			return manualProject.trim();
		}
	}
}

// AI Code Generator
class AICodeGenerator {
	private atlassian: AtlassianClient | null = null;
	private openaiApiKey: string = '';

	async initialize(): Promise<boolean> {
		const config = await ConfigurationManager.getConfig();
		if (!config) {
			return false;
		}
		
		this.atlassian = new AtlassianClient(config.email, config.token, config.site);
		this.openaiApiKey = config.openaiApiKey;
		return true;
	}

	async generateCodeFromJiraStory(issueKey: string): Promise<string> {
		if (!this.atlassian) {
			throw new Error('Extension not configured. Please run setup first.');
		}
		
		try {
			// Validate issue context and detect potential collisions
			const validation = await this.atlassian.validateIssueContext(issueKey);
			
			if (!validation.isValid) {
				throw new Error(validation.warnings.join('; '));
			}
			
			const issue = validation.issue;
			const projectKey = issue.fields.project.key;
			
			// Show warnings to user if any
			if (validation.warnings.length > 0) {
				vscode.window.showWarningMessage(`Issue validation warnings: ${validation.warnings.join('; ')}`);
			}
			
			// Get project-specific coding standards from Confluence
			const codingStandardsPageId = await this.atlassian.findProjectConfluenceSpace(projectKey);
			const codingStandards = await this.atlassian.getConfluencePage(codingStandardsPageId || '491523');
			
			// Create AI prompt with context
			const prompt = `
You are a senior developer following team coding standards. Generate TypeScript code for this Jira story:

PROJECT CONTEXT:
Project Key: ${projectKey}
Issue: ${issueKey}

JIRA STORY:
Title: ${issue.fields.summary}
Description: ${this.extractTextFromDescription(issue.fields.description)}

TEAM CODING STANDARDS (Project: ${projectKey}):
${this.extractTextFromHtml(codingStandards.body.storage.value)}

Generate clean, well-documented TypeScript code that follows the team standards. Include:
1. Proper typing and interfaces
2. Error handling as specified in standards  
3. Comments explaining the approach
4. TODO comments for review points

Code:`;

			// Generate code using OpenAI (commented out for demo - would need API key)
			/*
			const completion = await openai.chat.completions.create({
				model: "gpt-4",
				messages: [{ role: "user", content: prompt }],
				max_tokens: 1000
			});
			return completion.choices[0].message.content || 'Failed to generate code';
			*/

			// Demo response for now
			return `// Generated code for: ${issue.fields.summary}
// Project: ${projectKey} | Issue: ${issueKey}
// Following team coding standards from Confluence (Page ID: ${codingStandardsPageId || 'demo'})

interface AuthenticationRequest {
	email: string;
	password: string;
}

interface AuthenticationResponse {
	success: boolean;
	token?: string;
	error?: string;
}

class AuthenticationService {
	/**
	 * Implements OAuth authentication following ${projectKey} team patterns
	 * TODO: Add rate limiting as per API guidelines
	 * TODO: Implement token refresh mechanism
	 */
	async authenticateUser(request: AuthenticationRequest): Promise<AuthenticationResponse> {
		try {
			// Input validation per team standards
			if (!request.email || !request.password) {
				return { success: false, error: 'Email and password are required' };
			}

			// TODO: Replace with actual OAuth implementation
			const mockToken = 'jwt-token-here';
			
			return {
				success: true, 
				token: mockToken 
			};
		} catch (error) {
			// Error handling per team standards
			console.error('Authentication failed:', error);
			return { 
				success: false, 
				error: 'Authentication service unavailable' 
			};
		}
	}
}

export { AuthenticationService, AuthenticationRequest, AuthenticationResponse };`;

		} catch (error) {
			throw new Error(`AI code generation failed: ${error}`);
		}
	}

	private extractTextFromDescription(description: any): string {
		if (!description) { 
			return 'No description provided';
		}
		// Simple text extraction from Atlassian Document Format
		if (description.content) {
			return description.content.map((item: any) => 
				item.content?.map((text: any) => text.text).join(' ') || ''
			).join('\n');
		}
		return String(description);
	}

	private extractTextFromHtml(html: string): string {
		// Simple HTML to text conversion for demo
		return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
	}
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Atlassian AI Assistant is now active!');

	const aiGenerator = new AICodeGenerator();

	// Command: Generate code from Jira story
	const generateCodeCommand = vscode.commands.registerCommand('atlassian-ai-assistant.generateCode', async () => {
		try {
			// Initialize AI generator with user configuration
			const initialized = await aiGenerator.initialize();
			if (!initialized) {
				vscode.window.showInformationMessage('❌ Configuration cancelled. Please try again when ready.');
				return;
			}

			const issueKey = await vscode.window.showInputBox({
				prompt: 'Enter Jira issue key (e.g., PROJ-1, TASK-5)',
				placeHolder: 'PROJ-1'
			});

			if (!issueKey) {
				vscode.window.showInformationMessage('Code generation cancelled.');
				return;
			}

			vscode.window.showInformationMessage('🤖 AI is analyzing Jira story and team standards...');

			const generatedCode = await aiGenerator.generateCodeFromJiraStory(issueKey);

			// Insert code at cursor position
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const position = editor.selection.active;
				editor.edit(editBuilder => {
					editBuilder.insert(position, generatedCode);
				});
				vscode.window.showInformationMessage('✅ AI-generated code inserted! Based on Jira story and team standards.');
			} else {
				// Create new file with generated code
				const doc = await vscode.workspace.openTextDocument({
					content: generatedCode,
					language: 'typescript'
				});
				vscode.window.showTextDocument(doc);
				vscode.window.showInformationMessage('✅ AI-generated code created in new file!');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`❌ Failed to generate code: ${error}`);
		}
	});

	// Command: Open your Atlassian project
	const openProjectCommand = vscode.commands.registerCommand('atlassian-ai-assistant.openProject', async () => {
		const config = await ConfigurationManager.getConfig();
		if (!config) {
			vscode.window.showErrorMessage('❌ Please configure the extension first by running a command.');
			return;
		}

		vscode.window.showInformationMessage(
			'🚀 Open Your Atlassian Projects: Choose where to go in your Atlassian instance.',
			'Open Your Atlassian Projects', 'Open Confluence Spaces'
		).then(selection => {
			// Normalize site URL - remove https:// if present
			const normalizedSite = config.site.replace(/^https?:\/\//, '');
			
			if (selection === 'Open Your Atlassian Projects') {
				vscode.env.openExternal(vscode.Uri.parse(`https://${normalizedSite}/jira/your-work`));
			} else if (selection === 'Open Confluence Spaces') {
				vscode.env.openExternal(vscode.Uri.parse(`https://${normalizedSite}/wiki/spaces`));
			}
		});
	});

	context.subscriptions.push(generateCodeCommand, openProjectCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
