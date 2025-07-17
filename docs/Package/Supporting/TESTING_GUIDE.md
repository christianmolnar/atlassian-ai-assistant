# Sprint Documentation Testing Guide

## Quick Iteration Workflow

You now have a streamlined workflow for testing and iterating on sprint documentation generation:

### 🚀 One-Command Rebuild
```bash
npm run dev-rebuild
```
This single command:
1. ✅ Compiles TypeScript → JavaScript
2. ✅ Packages extension into VSIX
3. ✅ Uninstalls old version from VS Code
4. ✅ Installs new version in VS Code
5. ✅ Ready to test immediately!

### 📝 Test Documentation Generation

#### Method 1: Command Palette (Enhanced Workflow)
1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Run**: "📚 Generate Sprint Documentation in Confluence"
3. **Follow the enhanced workflow**:
   - Select active sprint
   - Multi-select Jira issues
   - Include planning documents (test with `sample-planning-doc.md`)
   - Choose "Test Documentation" mode (adds [TEST] prefix)
   - Select Confluence space

#### Method 2: Dashboard Interface
1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Run**: "🎯 Open Sprint Planning Dashboard"
3. **Use the visual interface**:
   - Click on sprint cards
   - Check/uncheck issues
   - Generate documentation with selected items

### 🧹 Cleanup Between Tests

#### Clean Test Files
```bash
npm run clean-test-data
```
Removes all files from `test-output/` directory.

#### Clean Confluence Test Pages
- Test pages have `[TEST]` prefix for easy identification
- Manually delete from Confluence or ask me to add a cleanup command

### 📊 Test Scenarios

#### Scenario 1: Basic Functionality
- **Sprint**: Any active sprint with 2-3 issues
- **Planning Docs**: Include `sample-planning-doc.md`
- **Expected**: Clean documentation with all elements

#### Scenario 2: Edge Cases
- **Empty Sprint**: Sprint with no issues
- **Large Sprint**: Sprint with 10+ issues
- **No Planning Docs**: Generate without markdown files
- **Multiple Planning Docs**: Include 2-3 markdown files

#### Scenario 3: Error Handling
- **Invalid Sprint**: Try with non-existent sprint
- **Network Issues**: Test with network disconnected
- **Permission Issues**: Test with read-only Confluence space

### 🔍 What to Look For

#### In Generated Confluence Page
- [ ] Clean HTML formatting
- [ ] All selected issues present
- [ ] Planning document content included
- [ ] Proper links to Jira issues
- [ ] Professional formatting with panels and tables
- [ ] Test prefix `[TEST]` in title

#### In Local Markdown File
- [ ] Readable markdown format
- [ ] All content sections present
- [ ] Proper link formatting
- [ ] Timestamp and metadata included
- [ ] Development notes section

#### In VS Code Extension
- [ ] No error messages in console
- [ ] Smooth user experience with progress indicators
- [ ] Proper validation of user inputs
- [ ] Clean success/error messaging

### 🎯 Current Iteration Focus

Based on your feedback, here are areas to focus testing and improvement:

#### 1. **Content Quality**
- Is the generated documentation comprehensive enough?
- Are the technical sections useful for your team?
- Does the planning document integration add value?

#### 2. **Workflow Efficiency**
- Is the multi-step process intuitive?
- Are there too many prompts or too few?
- Does the dashboard interface feel natural?

#### 3. **Team Collaboration**
- Would this documentation be useful in team meetings?
- Is the format suitable for stakeholder reviews?
- Does it capture the right level of detail?

#### 4. **Integration Points**
- Are the Jira links working correctly?
- Is the Confluence formatting appropriate?
- Should we add more external integrations?

### 🔄 Quick Iteration Loop

For the fastest testing cycle:

1. **Make code change** in `src/extension.ts`
2. **Run**: `npm run dev-rebuild` (rebuilds and installs)
3. **Test**: `Ctrl+Shift+P` → "📚 Generate Sprint Documentation"
4. **Choose**: "Test Documentation" mode
5. **Include**: `sample-planning-doc.md` for consistent testing
6. **Review**: Generated Confluence page and local markdown
7. **Save**: Test copy to `test-output/` for comparison
8. **Repeat**: Make improvements and test again

### 📝 Notes for Your Testing

- **Sample Data**: Use the `sample-planning-doc.md` for consistent testing
- **Test Mode**: Always choose "Test Documentation" to avoid cluttering production Confluence
- **Local Copies**: Save test copies to compare iterations
- **Feedback**: Note what works well and what needs improvement

This setup lets you rapidly iterate on the documentation generation while maintaining a clean development environment. What aspect would you like to focus on first?
