// Import Tailwind CSS styles
import '../styles/globals.css';
import { createButton } from '../components/ui/button';

// Webview initialization code
console.log('Webview scripts loaded with shadcn/ui styles');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Create action buttons using shadcn/ui components
  const actionButtonsContainer = document.getElementById('action-buttons');
  
  if (actionButtonsContainer) {
    // Generate Documentation button
    const generateDocsBtn = createButton('📚 Generate Documentation in Confluence', {
      variant: 'default',
      size: 'default',
      disabled: true,
      onClick: () => {
        const selectedIssues = Array.from(document.querySelectorAll('.issue-checkbox:checked'))
          .map(checkbox => (checkbox as HTMLInputElement).value);
        
        if (selectedIssues.length > 0) {
          // Send message to VS Code extension
          (window as any).vscode?.postMessage({
            command: 'generateDocs',
            issues: selectedIssues
          });
        }
      }
    });
    generateDocsBtn.id = 'generate-docs-btn';

    // Select All button
    const selectAllBtn = createButton('✅ Select All Issues', {
      variant: 'outline',
      size: 'default',
      disabled: true,
      onClick: () => {
        const checkboxes = document.querySelectorAll('.issue-checkbox') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(checkbox => {
          checkbox.checked = true;
        });
        
        // Update button states
        updateButtonStates();
      }
    });
    selectAllBtn.id = 'select-all-btn';

    // Clear Selection button
    const clearSelectionBtn = createButton('❌ Clear Selection', {
      variant: 'ghost',
      size: 'default',
      disabled: true,
      onClick: () => {
        const checkboxes = document.querySelectorAll('.issue-checkbox') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
        
        // Update button states
        updateButtonStates();
      }
    });
    clearSelectionBtn.id = 'clear-selection-btn';

    // Add buttons to container
    actionButtonsContainer.appendChild(generateDocsBtn);
    actionButtonsContainer.appendChild(selectAllBtn);
    actionButtonsContainer.appendChild(clearSelectionBtn);
  }
});

// Helper function to update button states based on selections
function updateButtonStates() {
  const checkboxes = document.querySelectorAll('.issue-checkbox') as NodeListOf<HTMLInputElement>;
  const selectedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
  const totalCount = checkboxes.length;

  const generateBtn = document.getElementById('generate-docs-btn') as HTMLButtonElement;
  const selectAllBtn = document.getElementById('select-all-btn') as HTMLButtonElement;
  const clearBtn = document.getElementById('clear-selection-btn') as HTMLButtonElement;

  if (generateBtn) {
    generateBtn.disabled = selectedCount === 0;
  }
  
  if (selectAllBtn) {
    selectAllBtn.disabled = totalCount === 0 || selectedCount === totalCount;
  }
  
  if (clearBtn) {
    clearBtn.disabled = selectedCount === 0;
  }
}

// Export for use in other scripts
(window as any).updateButtonStates = updateButtonStates;
