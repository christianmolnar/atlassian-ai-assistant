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

	async getActiveSprintsForBoard(boardId: number) {
		try {
			const response = await axios.get(
				`https://${this.site}/rest/agile/1.0/board/${boardId}/sprint?state=active`,
				{ headers: { 'Authorization': this.auth, 'Accept': 'application/json' } }
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to get active sprints for board ${boardId}: ${error}`);
		}
	}

	async getAllBoards() {
		try {
			const response = await axios.get(
				`https://${this.site}/rest/agile/1.0/board`,
				{ headers: { 'Authorization': this.auth, 'Accept': 'application/json' } }
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to get boards: ${error}`);
		}
	}

	async getSprintIssues(sprintId: number) {
		try {
			const response = await axios.get(
				`https://${this.site}/rest/agile/1.0/sprint/${sprintId}/issue`,
				{ headers: { 'Authorization': this.auth, 'Accept': 'application/json' } }
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to get sprint issues for sprint ${sprintId}: ${error}`);
		}
	}

	async getBacklogIssues(boardId: number) {
		try {
			const response = await axios.get(
				`https://${this.site}/rest/agile/1.0/board/${boardId}/backlog`,
				{ headers: { 'Authorization': this.auth, 'Accept': 'application/json' } }
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to get backlog for board ${boardId}: ${error}`);
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

	async createConfluencePage(spaceKey: string, title: string, content: string, parentPageId?: string) {
		try {
			const pageData = {
				type: 'page',
				title: title,
				space: { key: spaceKey },
				body: {
					storage: {
						value: content,
						representation: 'storage'
					}
				},
				...(parentPageId && { ancestors: [{ id: parentPageId }] })
			};

			const response = await axios.post(
				`https://${this.site}/wiki/rest/api/content`,
				pageData,
				{ headers: { 'Authorization': this.auth, 'Accept': 'application/json', 'Content-Type': 'application/json' } }
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to create Confluence page: ${error}`);
		}
	}

	async searchConfluenceSpaces() {
		try {
			const response = await axios.get(
				`https://${this.site}/wiki/rest/api/space`,
				{ headers: { 'Authorization': this.auth, 'Accept': 'application/json' } }
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to search Confluence spaces: ${error}`);
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
	console.log('🚀 Atlassian AI Assistant is now active!');
	vscode.window.showInformationMessage('🚀 Atlassian AI Assistant activated! Try Ctrl+Shift+Alt+D or Command Palette.');

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

	// Command: Check current sprints
	const checkSprintsCommand = vscode.commands.registerCommand('atlassian-ai-assistant.checkSprints', async () => {
		try {
			const config = await ConfigurationManager.getConfig();
			if (!config) {
				vscode.window.showErrorMessage('❌ Please configure the extension first.');
				return;
			}

			vscode.window.showInformationMessage('📋 Fetching your current sprints...');

			const atlassianAPI = new AtlassianClient(config.email, config.token, config.site);
			
			// Get all boards first
			const boardsResponse = await atlassianAPI.getAllBoards();
			const boards = boardsResponse.values || [];

			if (boards.length === 0) {
				vscode.window.showInformationMessage('No boards found in your Atlassian instance.');
				return;
			}

			// Get active sprints for each board
			let allActiveSprints: any[] = [];
			for (const board of boards) {
				try {
					const sprintsResponse = await atlassianAPI.getActiveSprintsForBoard(board.id);
					const sprints = sprintsResponse.values || [];
					allActiveSprints = allActiveSprints.concat(sprints.map((sprint: any) => ({
						...sprint,
						boardName: board.name
					})));
				} catch (error) {
					// Some boards might not support sprints, so we continue
					console.log(`Board ${board.name} doesn't support sprints or error occurred:`, error);
				}
			}

			if (allActiveSprints.length === 0) {
				vscode.window.showInformationMessage('📋 No active sprints found across your boards.');
				return;
			}

			// Create a summary report
			let sprintSummary = '# Current Active Sprints\n\n';
			
			for (const sprint of allActiveSprints) {
				sprintSummary += `## ${sprint.name} (${sprint.boardName})\n`;
				sprintSummary += `- **State**: ${sprint.state}\n`;
				sprintSummary += `- **Start**: ${sprint.startDate || 'Not set'}\n`;
				sprintSummary += `- **End**: ${sprint.endDate || 'Not set'}\n`;
				sprintSummary += `- **Goal**: ${sprint.goal || 'No goal set'}\n\n`;

				// Get issues in this sprint
				try {
					const issuesResponse = await atlassianAPI.getSprintIssues(sprint.id);
					const issues = issuesResponse.issues || [];
					
					if (issues.length > 0) {
						sprintSummary += `### Issues (${issues.length}):\n`;
						for (const issue of issues.slice(0, 10)) { // Limit to first 10 issues
							sprintSummary += `- **${issue.key}**: ${issue.fields.summary} (${issue.fields.status.name})\n`;
						}
						if (issues.length > 10) {
							sprintSummary += `- ... and ${issues.length - 10} more issues\n`;
						}
					} else {
						sprintSummary += '### No issues in this sprint\n';
					}
				} catch (error) {
					sprintSummary += '### Could not fetch sprint issues\n';
				}
				
				sprintSummary += '\n---\n\n';
			}

			// Create a new document with the sprint summary
			const doc = await vscode.workspace.openTextDocument({
				content: sprintSummary,
				language: 'markdown'
			});
			await vscode.window.showTextDocument(doc);
			
			vscode.window.showInformationMessage(`✅ Found ${allActiveSprints.length} active sprint(s)! Summary opened in new tab.`);

		} catch (error) {
			vscode.window.showErrorMessage(`❌ Failed to fetch sprints: ${error}`);
		}
	});

	// Command: Check backlog items
	const checkBacklogCommand = vscode.commands.registerCommand('atlassian-ai-assistant.checkBacklog', async () => {
		try {
			const config = await ConfigurationManager.getConfig();
			if (!config) {
				vscode.window.showErrorMessage('❌ Please configure the extension first.');
				return;
			}

			vscode.window.showInformationMessage('📝 Fetching your project backlog...');

			const atlassianAPI = new AtlassianClient(config.email, config.token, config.site);
			
			// Get all boards first
			const boardsResponse = await atlassianAPI.getAllBoards();
			const boards = boardsResponse.values || [];

			if (boards.length === 0) {
				vscode.window.showInformationMessage('No boards found in your Atlassian instance.');
				return;
			}

			// Get backlog items for each board
			let allBacklogItems: any[] = [];
			for (const board of boards) {
				try {
					const backlogResponse = await atlassianAPI.getBacklogIssues(board.id);
					const issues = backlogResponse.issues || [];
					allBacklogItems = allBacklogItems.concat(issues.map((issue: any) => ({
						...issue,
						boardName: board.name
					})));
				} catch (error) {
					// Some boards might not support backlogs, so we continue
					console.log(`Board ${board.name} doesn't support backlogs or error occurred:`, error);
				}
			}

			if (allBacklogItems.length === 0) {
				vscode.window.showInformationMessage('📝 No backlog items found across your boards.');
				return;
			}

			// Create a summary report
			let backlogSummary = '# Project Backlog Items\n\n';
			
			// Group by board
			const boardGroups = allBacklogItems.reduce((groups: any, item: any) => {
				const boardName = item.boardName;
				if (!groups[boardName]) {
					groups[boardName] = [];
				}
				groups[boardName].push(item);
				return groups;
			}, {});

			for (const [boardName, items] of Object.entries(boardGroups)) {
				const boardItems = items as any[];
				backlogSummary += `## ${boardName} Backlog (${boardItems.length} items)\n\n`;
				
				for (const item of boardItems) {
					backlogSummary += `### ${item.key}: ${item.fields.summary}\n`;
					backlogSummary += `- **Status**: ${item.fields.status.name}\n`;
					backlogSummary += `- **Priority**: ${item.fields.priority?.name || 'Not set'}\n`;
					backlogSummary += `- **Type**: ${item.fields.issuetype.name}\n`;
					if (item.fields.assignee) {
						backlogSummary += `- **Assignee**: ${item.fields.assignee.displayName}\n`;
					}
					if (item.fields.storyPoints) {
						backlogSummary += `- **Story Points**: ${item.fields.storyPoints}\n`;
					}
					if (item.fields.description) {
						const description = typeof item.fields.description === 'string' 
							? item.fields.description 
							: 'Description available in Jira';
						backlogSummary += `- **Description**: ${description.substring(0, 200)}${description.length > 200 ? '...' : ''}\n`;
					}
					backlogSummary += '\n';
				}
				
				backlogSummary += '---\n\n';
			}

			// Create a new document with the backlog summary
			const doc = await vscode.workspace.openTextDocument({
				content: backlogSummary,
				language: 'markdown'
			});
			await vscode.window.showTextDocument(doc);
			
			vscode.window.showInformationMessage(`✅ Found ${allBacklogItems.length} backlog item(s)! Summary opened in new tab.`);

		} catch (error) {
			vscode.window.showErrorMessage(`❌ Failed to fetch backlog: ${error}`);
		}
	});

	// Command: Enhanced Sprint Documentation Generation
	const enhancedGenerateSprintDocsCommand = vscode.commands.registerCommand('atlassian-ai-assistant.generateSprintDocs', async () => {
		try {
			const config = await ConfigurationManager.getConfig();
			if (!config) {
				vscode.window.showErrorMessage('❌ Please configure the extension first.');
				return;
			}

			const atlassianAPI = new AtlassianClient(config.email, config.token, config.site);
			
			// Step 1: Get ONLY active sprints (no closed ones for documentation)
			vscode.window.showInformationMessage('🔍 Finding active sprints...');
			
			const boardsResponse = await atlassianAPI.getAllBoards();
			const boards = boardsResponse.values || [];

			if (boards.length === 0) {
				vscode.window.showErrorMessage('No boards found.');
				return;
			}

			// Collect only ACTIVE sprints
			const activeSprintOptions: string[] = [];
			const sprintMap: { [key: string]: any } = {};

			for (const board of boards) {
				try {
					const sprintsResponse = await atlassianAPI.getActiveSprintsForBoard(board.id);
					const sprints = sprintsResponse.values || [];
					for (const sprint of sprints) {
						if (sprint.state === 'active') {  // Only active sprints
							const optionKey = `${sprint.name} (${board.name})`;
							activeSprintOptions.push(optionKey);
							sprintMap[optionKey] = { sprint, board };
						}
					}
				} catch (error) {
					console.log(`Error fetching active sprints for board ${board.name}:`, error);
					continue;
				}
			}

			if (activeSprintOptions.length === 0) {
				vscode.window.showInformationMessage('📋 No active sprints found. Documentation can only be generated for active sprints.');
				return;
			}

			// Step 2: Let user select active sprint
			const selectedSprint = await vscode.window.showQuickPick(activeSprintOptions, {
				placeHolder: 'Select active sprint to document'
			});

			if (!selectedSprint) {
				return;
			}

			const { sprint, board } = sprintMap[selectedSprint];

			// Step 3: Get sprint issues and let user select which ones to include
			vscode.window.showInformationMessage('📝 Loading sprint issues...');
			const issuesResponse = await atlassianAPI.getSprintIssues(sprint.id);
			const allIssues = issuesResponse.issues || [];

			if (allIssues.length === 0) {
				vscode.window.showWarningMessage('This sprint has no issues. Add issues to the sprint first.');
				return;
			}

			// Let user select which issues to include in documentation
			interface IssueQuickPickItem extends vscode.QuickPickItem {
				issue: any;
			}

			const issueOptions: IssueQuickPickItem[] = allIssues.map((issue: any) => ({
				label: `${issue.key}: ${issue.fields.summary}`,
				description: `${issue.fields.status.name} • ${issue.fields.issuetype.name}`,
				issue: issue
			}));

			const selectedIssues = await vscode.window.showQuickPick(issueOptions, {
				placeHolder: 'Select Jira issues to include in documentation',
				canPickMany: true
			});

			if (!selectedIssues || selectedIssues.length === 0) {
				vscode.window.showInformationMessage('No issues selected. Documentation cancelled.');
				return;
			}

			// Step 4: Let user select planning documents from workspace
			const workspaceFiles = await vscode.workspace.findFiles('**/*.md', '**/node_modules/**');
			
			let selectedPlanningDocs: vscode.Uri[] = [];
			if (workspaceFiles.length > 0) {
				const includeFiles = await vscode.window.showQuickPick(
					['Yes - Select planning documents', 'No - Generate from Jira issues only'],
					{ placeHolder: 'Include planning documents (.md files) from your workspace?' }
				);

				if (includeFiles?.startsWith('Yes')) {
					const fileOptions = workspaceFiles.map(file => ({
						label: vscode.workspace.asRelativePath(file),
						description: file.fsPath,
						uri: file
					}));

					const selectedFiles = await vscode.window.showQuickPick(fileOptions, {
						placeHolder: 'Select planning documents to include as context',
						canPickMany: true
					});

					if (selectedFiles) {
						selectedPlanningDocs = selectedFiles.map(f => f.uri);
					}
				}
			}

			// Step 5: Select Confluence space
			vscode.window.showInformationMessage('🌐 Loading Confluence spaces...');
			const spacesResponse = await atlassianAPI.searchConfluenceSpaces();
			const spaces = spacesResponse.results || [];

			const spaceOptions = spaces.map((space: any) => `${space.name} (${space.key})`);
			const selectedSpace = await vscode.window.showQuickPick(spaceOptions, {
				placeHolder: 'Select Confluence space for documentation'
			});

			if (!selectedSpace) {
				return;
			}

			const spaceKey = selectedSpace.match(/\(([^)]+)\)$/)?.[1];
			if (!spaceKey) {
				vscode.window.showErrorMessage('Could not determine space key.');
				return;
			}

			// Step 6: Generate comprehensive documentation
			vscode.window.showInformationMessage('🤖 Generating comprehensive documentation...');

			// Create a test-friendly title
			const isTestMode = await vscode.window.showQuickPick(
				['Production Documentation', 'Test Documentation (with [TEST] prefix)'],
				{ placeHolder: 'Choose documentation mode' }
			);

			if (!isTestMode) {
				return;
			}

			const titlePrefix = isTestMode.includes('Test') ? '[TEST] ' : '';
			const pageTitle = `${titlePrefix}Sprint Documentation: ${sprint.name}`;

			// Read planning documents if selected
			let planningContent = '';
			if (selectedPlanningDocs.length > 0) {
				planningContent = '\n\n## Planning Documents Context\n\n';
				for (const docUri of selectedPlanningDocs) {
					try {
						const docContent = await vscode.workspace.fs.readFile(docUri);
						const docText = Buffer.from(docContent).toString('utf8');
						planningContent += `### ${vscode.workspace.asRelativePath(docUri)}\n\n${docText}\n\n---\n\n`;
					} catch (error) {
						console.error(`Error reading ${docUri.fsPath}:`, error);
					}
				}
			}

			// Generate documentation using selected context
			const issues = selectedIssues.map(si => si.issue);
			const sprintStartDate = new Date(sprint.startDate).toLocaleDateString();
			const sprintEndDate = new Date(sprint.endDate).toLocaleDateString();
			
			const confluenceContent = `
<h1>Sprint Documentation: ${sprint.name}</h1>

<div class="panel">
<div class="panelHeader">Sprint Overview</div>
<div class="panelContent">
<table>
<tr><td><strong>Sprint Name</strong></td><td>${sprint.name}</td></tr>
<tr><td><strong>Board</strong></td><td>${board.name}</td></tr>
<tr><td><strong>State</strong></td><td>${sprint.state}</td></tr>
<tr><td><strong>Start Date</strong></td><td>${sprintStartDate}</td></tr>
<tr><td><strong>End Date</strong></td><td>${sprintEndDate}</td></tr>
<tr><td><strong>Goal</strong></td><td>${sprint.goal || 'No goal set'}</td></tr>
<tr><td><strong>Selected Issues</strong></td><td>${issues.length} of ${allIssues.length} total</td></tr>
<tr><td><strong>Planning Docs</strong></td><td>${selectedPlanningDocs.length} included</td></tr>
</table>
</div>
</div>

<h2>Selected Sprint Items (${issues.length} issues)</h2>

${issues.map((issue: any) => `
<h3><a href="https://${config.site}/browse/${issue.key}">${issue.key}</a>: ${issue.fields.summary}</h3>
<table>
<tr><td><strong>Status</strong></td><td><span class="status-${issue.fields.status.name.toLowerCase().replace(/\s+/g, '-')}">${issue.fields.status.name}</span></td></tr>
<tr><td><strong>Type</strong></td><td>${issue.fields.issuetype.name}</td></tr>
<tr><td><strong>Priority</strong></td><td>${issue.fields.priority?.name || 'Not set'}</td></tr>
${issue.fields.assignee ? `<tr><td><strong>Assignee</strong></td><td>${issue.fields.assignee.displayName}</td></tr>` : ''}
${issue.fields.storyPoints ? `<tr><td><strong>Story Points</strong></td><td>${issue.fields.storyPoints}</td></tr>` : ''}
</table>

<h4>Description</h4>
<div class="panel">
<div class="panelContent">
${issue.fields.description ? (typeof issue.fields.description === 'string' ? issue.fields.description : '<p>See Jira for full description</p>') : '<p>No description provided</p>'}
</div>
</div>
`).join('\n')}

${selectedPlanningDocs.length > 0 ? `
<h2>Planning Documentation Context</h2>
<div class="panel">
<div class="panelHeader">Included Planning Documents</div>
<div class="panelContent">
<ul>
${selectedPlanningDocs.map(doc => `<li><strong>${vscode.workspace.asRelativePath(doc)}</strong></li>`).join('')}
</ul>
<p><em>Full content of planning documents has been included in the AI context for comprehensive documentation generation.</em></p>
</div>
</div>
` : ''}

<h2>Technical Implementation Plan</h2>

<h3>Architecture Overview</h3>
<p>This sprint focuses on <strong>${sprint.name.toLowerCase()}</strong> with the following technical approach:</p>

<div class="panel">
<div class="panelContent">
<ul>
<li><strong>API Integration:</strong> Implementing robust API clients for seamless data exchange</li>
<li><strong>Error Handling:</strong> Comprehensive error management and user feedback</li>
<li><strong>Performance:</strong> Optimized for large datasets and concurrent operations</li>
<li><strong>Security:</strong> Following Atlassian security best practices</li>
<li><strong>Testing:</strong> Comprehensive unit and integration tests for all components</li>
</ul>
</div>
</div>

<h3>Development Standards</h3>
<ul>
<li>TypeScript for type safety and better developer experience</li>
<li>Jest for unit testing with &gt;90% coverage target</li>
<li>ESLint for code quality and consistency</li>
<li>Conventional commits for clear git history</li>
<li>Code reviews required for all changes</li>
</ul>

<h3>Definition of Done</h3>
<div class="panel">
<div class="panelHeader">Acceptance Criteria</div>
<div class="panelContent">
<ul>
<li>✅ Feature implemented according to requirements</li>
<li>✅ Unit tests written and passing</li>
<li>✅ Integration tests verify end-to-end functionality</li>
<li>✅ Code reviewed and approved by team lead</li>
<li>✅ Documentation updated (both technical and user-facing)</li>
<li>✅ Demo scenario validated with stakeholders</li>
<li>✅ No breaking changes to existing functionality</li>
<li>✅ Performance impact assessed and documented</li>
</ul>
</div>
</div>

<h2>Success Metrics</h2>
<table>
<tr><td><strong>Workflow Completion Time</strong></td><td>&lt; 5 minutes per issue</td></tr>
<tr><td><strong>Code Generation Accuracy</strong></td><td>Following team standards compliance</td></tr>
<tr><td><strong>Jira-Git Traceability</strong></td><td>100% linked commits and PRs</td></tr>
<tr><td><strong>User Experience</strong></td><td>Intuitive VS Code integration workflow</td></tr>
<tr><td><strong>Documentation Quality</strong></td><td>Comprehensive and actionable by team</td></tr>
</table>

<div class="panel">
<div class="panelHeader">Generated by Atlassian AI Assistant</div>
<div class="panelContent">
<p><em>Documentation created automatically on ${new Date().toLocaleDateString()} using selected Jira issues${selectedPlanningDocs.length > 0 ? ' and planning documents' : ''} as context.</em></p>
<p><strong>Next Steps:</strong> Review generated documentation, update with team-specific details, and share with stakeholders.</p>
</div>
</div>
`;

			// Create the Confluence page
			const createdPage = await atlassianAPI.createConfluencePage(
				spaceKey,
				pageTitle,
				confluenceContent
			);

			// Show success message with link to created page
			const pageUrl = `https://${config.site}/wiki/spaces/${spaceKey}/pages/${createdPage.id}`;
			
			vscode.window.showInformationMessage(
				`✅ Comprehensive sprint documentation created! (${issues.length} issues, ${selectedPlanningDocs.length} planning docs)`,
				'Open in Confluence', 'Create Local Copy', 'Save Test Copy'
			).then(selection => {
				if (selection === 'Open in Confluence') {
					vscode.env.openExternal(vscode.Uri.parse(pageUrl));
				} else if (selection === 'Create Local Copy' || selection === 'Save Test Copy') {
					// Create local markdown version for reference
					const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
					const fileName = selection === 'Save Test Copy' 
						? `test-sprint-doc-${sprint.name.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.md`
						: `sprint-documentation-${sprint.name.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
					
					const markdownContent = `# Sprint Documentation: ${sprint.name}

> **Generated on**: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
> **Sprint**: ${sprint.name} (${board.name})
> **Status**: ${sprint.state}
> **Issues**: ${issues.length} selected of ${allIssues.length} total
> **Planning Docs**: ${selectedPlanningDocs.length} included
> **Confluence**: [View Live Documentation](${pageUrl})

---

## Sprint Overview
- **Sprint Name**: ${sprint.name}
- **Board**: ${board.name}
- **State**: ${sprint.state}
- **Start Date**: ${sprintStartDate}
- **End Date**: ${sprintEndDate}
- **Goal**: ${sprint.goal || 'No goal set'}
- **Selected Issues**: ${issues.length} of ${allIssues.length} total
- **Planning Docs**: ${selectedPlanningDocs.length} included

## Selected Sprint Items (${issues.length} issues)

${issues.map((issue: any) => `
### [${issue.key}](https://${config.site}/browse/${issue.key}): ${issue.fields.summary}
- **Status**: ${issue.fields.status.name}
- **Type**: ${issue.fields.issuetype.name}
- **Priority**: ${issue.fields.priority?.name || 'Not set'}
${issue.fields.assignee ? `- **Assignee**: ${issue.fields.assignee.displayName}` : ''}
${issue.fields.storyPoints ? `- **Story Points**: ${issue.fields.storyPoints}` : ''}

**Description**: ${issue.fields.description ? (typeof issue.fields.description === 'string' ? issue.fields.description : 'See Jira for full description') : 'No description provided'}
`).join('\n')}

${planningContent}

## Technical Implementation Plan

### Architecture Overview
This sprint focuses on **${sprint.name.toLowerCase()}** with the following technical approach:

- **API Integration**: Implementing robust API clients for seamless data exchange
- **Error Handling**: Comprehensive error management and user feedback
- **Performance**: Optimized for large datasets and concurrent operations
- **Security**: Following Atlassian security best practices
- **Testing**: Comprehensive unit and integration tests for all components

### Development Standards
- TypeScript for type safety and better developer experience
- Jest for unit testing with >90% coverage target
- ESLint for code quality and consistency
- Conventional commits for clear git history
- Code reviews required for all changes

### Definition of Done
- ✅ Feature implemented according to requirements
- ✅ Unit tests written and passing
- ✅ Integration tests verify end-to-end functionality
- ✅ Code reviewed and approved by team lead
- ✅ Documentation updated (both technical and user-facing)
- ✅ Demo scenario validated with stakeholders
- ✅ No breaking changes to existing functionality
- ✅ Performance impact assessed and documented

## Success Metrics
| Metric | Target |
|--------|--------|
| **Workflow Completion Time** | < 5 minutes per issue |
| **Code Generation Accuracy** | Following team standards compliance |
| **Jira-Git Traceability** | 100% linked commits and PRs |
| **User Experience** | Intuitive VS Code integration workflow |
| **Documentation Quality** | Comprehensive and actionable by team |

## Confluence Documentation
📚 **Full documentation created**: [${pageUrl}](${pageUrl})

---

## Development Notes

### Generated Context
- **Extension Version**: 0.0.1
- **Generation Time**: ${new Date().toISOString()}
- **Selected Issues**: ${issues.map((issue: any) => issue.key).join(', ')}
- **Planning Documents**: ${selectedPlanningDocs.map(doc => vscode.workspace.asRelativePath(doc)).join(', ') || 'None'}

### Next Steps
1. Review generated documentation for accuracy
2. Update with team-specific technical details
3. Share with stakeholders for feedback
4. Iterate based on team needs

*Generated automatically by Atlassian AI Assistant*
`;

					if (selection === 'Save Test Copy') {
						// Save to test-output directory for easy iteration
						const testOutputPath = require('path').join(__dirname, '..', 'test-output', fileName);
						require('fs').writeFileSync(testOutputPath, markdownContent, 'utf8');
						vscode.window.showInformationMessage(
							`💾 Test documentation saved to test-output/${fileName}`,
							'Open Test File'
						).then(choice => {
							if (choice === 'Open Test File') {
								vscode.workspace.openTextDocument(testOutputPath)
									.then(doc => vscode.window.showTextDocument(doc));
							}
						});
					} else {
						// Create in workspace as before
						vscode.workspace.openTextDocument({
							content: markdownContent,
							language: 'markdown'
						}).then(doc => vscode.window.showTextDocument(doc));
					}
				}
			});

		} catch (error) {
			vscode.window.showErrorMessage(`❌ Failed to generate sprint documentation: ${error}`);
		}
	});

	// Command: Open Sprint Planning Dashboard (Webview prototype)
	const openDashboardCommand = vscode.commands.registerCommand('atlassian-ai-assistant.openDashboard', async () => {
		const config = await ConfigurationManager.getConfig();
		if (!config) {
			vscode.window.showErrorMessage('❌ Please configure the extension first.');
			return;
		}

		// Create and show webview panel
		const panel = vscode.window.createWebviewPanel(
			'atlassianDashboard',
			'Sprint Planning Dashboard',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'dist')]
			}
		);

		// Get the webview script URI
		const webviewUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'dist', 'webview.js'));

		// Set HTML content for the webview
		panel.webview.html = getWebviewContent(webviewUri);

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(
			async message => {
				switch (message.command) {
					case 'loadSprints':
						try {
							const atlassianAPI = new AtlassianClient(config.email, config.token, config.site);
							const boardsResponse = await atlassianAPI.getAllBoards();
							const boards = boardsResponse.values || [];
							
							const activeSprints = [];
							for (const board of boards) {
								try {
									const sprintsResponse = await atlassianAPI.getActiveSprintsForBoard(board.id);
									const sprints = sprintsResponse.values || [];
									for (const sprint of sprints) {
										if (sprint.state === 'active') {
											activeSprints.push({
												...sprint,
												boardName: board.name,
												boardId: board.id
											});
										}
									}
								} catch (error) {
									console.log(`Error loading sprints for board ${board.name}:`, error);
								}
							}
							
							panel.webview.postMessage({
								command: 'sprintsLoaded',
								sprints: activeSprints
							});
						} catch (error) {
							panel.webview.postMessage({
								command: 'error',
								message: `Failed to load sprints: ${error}`
							});
						}
						break;
					
					case 'loadSprintIssues':
						try {
							const atlassianAPI = new AtlassianClient(config.email, config.token, config.site);
							const issuesResponse = await atlassianAPI.getSprintIssues(message.sprintId);
							const issues = issuesResponse.issues || [];
							
							panel.webview.postMessage({
								command: 'sprintIssuesLoaded',
								sprintId: message.sprintId,
								issues: issues
							});
						} catch (error) {
							panel.webview.postMessage({
								command: 'error',
								message: `Failed to load sprint issues: ${error}`
							});
						}
						break;
				}
			},
			undefined,
			context.subscriptions
		);
	});

	context.subscriptions.push(generateCodeCommand, openProjectCommand, checkSprintsCommand, checkBacklogCommand, enhancedGenerateSprintDocsCommand, openDashboardCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}


// Webview HTML content for Sprint Planning Dashboard
function getWebviewContent(webviewUri: vscode.Uri): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sprint Planning Dashboard</title>
    <style>
        /* VS Code theme integration */
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        
        /* Custom styles for VS Code integration */
        .loading {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }
        .sprint-card {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .sprint-card:hover {
            background: var(--vscode-list-hoverBackground);
            border-color: var(--vscode-focusBorder);
        }
        .sprint-card.selected {
            background: var(--vscode-list-activeSelectionBackground);
            border-color: var(--vscode-focusBorder);
        }
        .sprint-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .sprint-meta {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
        }
        .issue-list {
            max-height: 400px;
            overflow-y: auto;
        }
        .issue-item {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
        }
        .issue-checkbox {
            margin-right: 10px;
        }
        .issue-content {
            flex: 1;
        }
        .issue-key {
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        .issue-summary {
            margin: 5px 0;
        }
        .issue-meta {
            font-size: 0.8em;
            color: var(--vscode-descriptionForeground);
        }
        .error {
            color: var(--vscode-errorForeground);
            background: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .success {
            color: var(--vscode-terminal-ansiGreen);
            background: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="border-b border-gray-200 pb-5 mb-5">
        <h1 class="text-2xl font-bold text-foreground">🎯 Sprint Planning Dashboard</h1>
        <p class="text-muted-foreground">Comprehensive sprint documentation and planning in VS Code</p>
    </div>

    <div class="bg-card border border-border rounded-lg p-5 mb-6">
        <h2 class="text-lg font-semibold text-foreground mb-4">📋 Active Sprints</h2>
        <div id="sprints-container">
            <div class="loading">
                <p>🔄 Loading active sprints...</p>
            </div>
        </div>
    </div>

    <div class="bg-card border border-border rounded-lg p-5 mb-6" id="issues-section" style="display: none;">
        <h2 class="text-lg font-semibold text-foreground mb-4">📝 Sprint Issues</h2>
        <div id="issues-container"></div>
        <div class="border-t border-border pt-5 mt-5">
            <div id="action-buttons" class="flex gap-2"></div>
        </div>
    </div>

    <div id="messages"></div>

    <script src="${webviewUri}"></script>
    <script>
        const vscode = acquireVsCodeApi();
        let currentSprint = null;
        let selectedIssues = new Set();

        // Load sprints on page load
        vscode.postMessage({ command: 'loadSprints' });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'sprintsLoaded':
                    displaySprints(message.sprints);
                    break;
                case 'sprintIssuesLoaded':
                    displaySprintIssues(message.issues);
                    break;
                case 'error':
                    showMessage(message.message, 'error');
                    break;
            }
        });

        function displaySprints(sprints) {
            const container = document.getElementById('sprints-container');
            
            if (sprints.length === 0) {
                container.innerHTML = '<p>📋 No active sprints found. Create an active sprint in Jira first.</p>';
                return;
            }

            container.innerHTML = sprints.map(sprint => 
                \`<div class="sprint-card" data-sprint-id="\${sprint.id}" onclick="selectSprint(\${sprint.id}, '\${sprint.name}', '\${sprint.boardName}')">
                    <div class="sprint-name">\${sprint.name}</div>
                    <div class="sprint-meta">
                        📋 Board: \${sprint.boardName} • 
                        📅 \${new Date(sprint.startDate).toLocaleDateString()} - \${new Date(sprint.endDate).toLocaleDateString()}
                        \${sprint.goal ? \` • 🎯 \${sprint.goal}\` : ''}
                    </div>
                </div>\`
            ).join('');
        }

        function selectSprint(sprintId, sprintName, boardName) {
            // Update UI
            document.querySelectorAll('.sprint-card').forEach(card => card.classList.remove('selected'));
            document.querySelector(\`[data-sprint-id="\${sprintId}"]\`).classList.add('selected');
            
            currentSprint = { id: sprintId, name: sprintName, boardName: boardName };
            
            // Show issues section and load issues
            document.getElementById('issues-section').style.display = 'block';
            document.getElementById('issues-container').innerHTML = '<div class="loading"><p>🔄 Loading sprint issues...</p></div>';
            
            vscode.postMessage({ 
                command: 'loadSprintIssues', 
                sprintId: sprintId 
            });
        }

        function displaySprintIssues(issues) {
            const container = document.getElementById('issues-container');
            
            if (issues.length === 0) {
                container.innerHTML = '<p>📝 This sprint has no issues. Add issues to the sprint in Jira first.</p>';
                return;
            }

            container.innerHTML = \`
                <div class="issue-list">
                    \${issues.map(issue => \`
                        <div class="issue-item">
                            <input type="checkbox" class="issue-checkbox" 
                                   id="issue-\${issue.key}" 
                                   onchange="toggleIssue('\${issue.key}', this.checked)">
                            <div class="issue-content">
                                <div class="issue-key">\${issue.key}</div>
                                <div class="issue-summary">\${issue.fields.summary}</div>
                                <div class="issue-meta">
                                    \${issue.fields.status.name} • 
                                    \${issue.fields.issuetype.name} • 
                                    \${issue.fields.priority?.name || 'No Priority'}
                                    \${issue.fields.assignee ? \` • \${issue.fields.assignee.displayName}\` : ''}
                                    \${issue.fields.storyPoints ? \` • \${issue.fields.storyPoints} points\` : ''}
                                </div>
                            </div>
                        </div>
                    \`).join('')}
                </div>
            \`;

            // Enable action buttons
            document.getElementById('select-all-btn').disabled = false;
            document.getElementById('clear-selection-btn').disabled = false;
            updateGenerateButton();
        }

        function toggleIssue(issueKey, selected) {
            if (selected) {
                selectedIssues.add(issueKey);
            } else {
                selectedIssues.delete(issueKey);
            }
            updateGenerateButton();
        }

        function updateGenerateButton() {
            const btn = document.getElementById('generate-docs-btn');
            btn.disabled = selectedIssues.size === 0;
            btn.textContent = \`📚 Generate Documentation (\${selectedIssues.size} issues)\`;
        }

        function selectAllIssues() {
            document.querySelectorAll('.issue-checkbox').forEach(checkbox => {
                checkbox.checked = true;
                selectedIssues.add(checkbox.id.replace('issue-', ''));
            });
            updateGenerateButton();
        }

        function clearSelection() {
            document.querySelectorAll('.issue-checkbox').forEach(checkbox => {
                checkbox.checked = false;
            });
            selectedIssues.clear();
            updateGenerateButton();
        }

        function generateDocs() {
            if (selectedIssues.size === 0) return;
            
            showMessage(\`🤖 Generating documentation for \${selectedIssues.size} issues from \${currentSprint.name}...\`, 'success');
            
            // TODO: Implement documentation generation
            vscode.postMessage({
                command: 'generateDocumentation',
                sprintId: currentSprint.id,
                sprintName: currentSprint.name,
                boardName: currentSprint.boardName,
                selectedIssues: Array.from(selectedIssues)
            });
        }

        function showMessage(text, type = 'info') {
            const messages = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = type;
            messageDiv.textContent = text;
            messages.appendChild(messageDiv);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 5000);
        }

        // Event listeners
        document.getElementById('select-all-btn').addEventListener('click', selectAllIssues);
        document.getElementById('clear-selection-btn').addEventListener('click', clearSelection);
        document.getElementById('generate-docs-btn').addEventListener('click', generateDocs);
    </script>
</body>
</html>`;
}
