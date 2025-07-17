# Development and Testing Workflow

## Quick Iteration Setup

This guide helps you quickly iterate on sprint documentation generation with the Atlassian AI Assistant.

### Development Scripts

```bash
# 1. Quick rebuild and reinstall (after code changes)
npm run dev-rebuild

# 2. Test documentation generation
npm run test-docs

# 3. Clean up test data
npm run clean-test-data

# 4. Full development cycle
npm run dev-cycle
```

### Manual Testing Workflow

1. **Make code changes** in `src/extension.ts`
2. **Quick rebuild**: `npm run dev-rebuild`
3. **Test documentation**: Open Command Palette → "📚 Generate Sprint Documentation"
4. **Review output** in Confluence and local markdown
5. **Iterate**: Repeat steps 1-4

### Test Data Management

#### Confluence Test Pages
- Test pages are created with prefix `[TEST]` for easy identification
- Use the cleanup script to remove test pages when done

#### Local Test Files
- Generated markdown files go to `./test-output/` directory
- Automatically cleaned up with `npm run clean-test-data`

### Debugging Tips

#### Extension Logs
- Open **Developer: Reload Window** after code changes
- Check **Developer: Toggle Developer Tools** for console logs
- Use `console.log()` in extension code for debugging

#### API Testing
- Test Jira connection: Command Palette → "📋 Check Current Sprints"
- Test Confluence connection: Command Palette → "🚀 Open Your Atlassian Projects"

#### Quick Configuration Reset
If you need to reset your Atlassian credentials:
1. Open Settings (`Ctrl+,`)
2. Search for "Atlassian AI"
3. Clear the fields
4. Run any command to trigger setup again

### Common Issues and Solutions

#### Authentication Issues
```
❌ Error: 401 Unauthorized
✅ Solution: Check API token and site URL in settings
```

#### Sprint Not Found
```
❌ Error: No active sprints found
✅ Solution: Create an active sprint in Jira first
```

#### Confluence Permission Issues
```
❌ Error: 403 Forbidden
✅ Solution: Ensure your account has space creation permissions
```

### Development Environment Variables

For development convenience, you can set environment variables:

```bash
# .env file (create in project root)
ATLASSIAN_EMAIL=your-email@company.com
ATLASSIAN_SITE=yourcompany.atlassian.net
ATLASSIAN_TOKEN=your-api-token
OPENAI_API_KEY=sk-your-openai-key
```

### Performance Testing

#### Test with Different Data Sizes
- Small sprint: 1-3 issues
- Medium sprint: 5-10 issues  
- Large sprint: 15+ issues
- Include planning docs: 0, 1, 3+ markdown files

#### Timing Benchmarks
- Documentation generation should complete in < 30 seconds
- API calls should respond in < 5 seconds each
- Local file operations should be instant

### Quality Checklist

Before considering a change "done":

- [ ] Documentation generates without errors
- [ ] Confluence page is properly formatted
- [ ] Local markdown is readable and complete
- [ ] All selected issues are included
- [ ] Planning documents are properly integrated
- [ ] Links to Jira issues work correctly
- [ ] No sensitive data in logs or output
- [ ] Extension doesn't crash on edge cases

### Iteration Ideas to Test

1. **Content Improvements**
   - Add more technical detail sections
   - Include code snippets from planning docs
   - Add sprint metrics and estimates

2. **UX Enhancements**
   - Better progress indicators
   - Preview before publishing
   - Template customization

3. **Integration Features**
   - Pull in BitBucket repository context
   - Include recent commits for context
   - Link to related Confluence pages

4. **AI Enhancements**
   - Smarter content generation based on issue types
   - Automatic technical specification extraction
   - Code review recommendations

### Next Testing Session Plan

1. **Test current implementation** with real sprint data
2. **Identify pain points** in the workflow
3. **Make targeted improvements** to specific areas
4. **Test edge cases** (empty sprints, missing data, etc.)
5. **Refine documentation format** based on team needs
