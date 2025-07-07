# Demo Scenarios & Test Cases

## Demo Scenario 1: Complete Workflow
**Goal**: Demonstrate end-to-end workflow from Jira to merged PR

### Setup
- Jira issue: SCRUM-12 (Create Feature Branch from Jira Command)
- Clean git repository on main branch
- VS Code extension configured

### Steps
1. **Open Command Palette** → "Generate Code from Jira Story"
2. **Enter Issue Key**: SCRUM-12
3. **Review Generated Code** (branch creation logic)
4. **Create Branch**: "Create Feature Branch from Jira" 
5. **Commit Code**: "Commit Generated Code with Jira Link"
6. **Create PR**: "Create Pull Request with Jira Integration"
7. **Verify in BitBucket**: PR created with proper linking
8. **Verify in Jira**: Issue moved to "In Review"

### Expected Results
- Branch: `feature/SCRUM-12-create-feature-branch-from-jira-command`
- Commit: `feat(SCRUM-12): Add branch creation functionality`
- PR: Auto-linked to Jira with generated code context
- Jira: Status updated automatically

## Demo Scenario 2: Error Handling
**Goal**: Show graceful error handling and recovery

### Test Cases
- Invalid Jira issue key
- Network connectivity issues
- BitBucket authentication failure
- Branch name conflicts
- Repository permission errors

## Performance Test Cases
- Large repository handling
- Multiple concurrent operations
- API rate limiting scenarios
- Extension startup time impact