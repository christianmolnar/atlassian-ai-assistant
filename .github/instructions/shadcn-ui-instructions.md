---
applyTo: '**'
---

# shadcn/ui Best Practices for VS Code Extensions

## Overview

shadcn/ui provides beautifully-designed, accessible components with an "Open Code" approach. Unlike traditional component libraries, shadcn/ui gives you the actual component code for full customization control.

## Key Principles

### 1. Open Code
- You own the component code completely
- Full transparency - see exactly how each component is built
- Easy customization without overrides or wrappers
- AI-friendly for LLMs to read, understand, and improve

### 2. Composition
- All components share a common, composable interface
- Predictable API across all components
- Easy to learn and use consistently

### 3. VS Code Extension Adaptation

Since this is a VS Code extension using webviews, we've adapted shadcn/ui for vanilla TypeScript:

- Components are built as utility functions that return HTML elements
- CSS classes use Tailwind utility classes with shadcn/ui design tokens
- JavaScript event handling instead of React props

## Setup Complete

✅ TailwindCSS configured with shadcn/ui design tokens
✅ CSS build pipeline with PostCSS
✅ TypeScript path aliases (@/* imports)
✅ Base component utilities (button.ts)
✅ Webpack configured for both extension and webview builds

## Usage in VS Code Webviews

### Button Component Example
```typescript
import { createButton } from '@/components/ui/button';

// Create a primary button
const saveButton = createButton('Save Changes', {
  variant: 'default',
  size: 'default',
  onClick: () => {
    // Handle save action
    vscode.postMessage({ command: 'save' });
  }
});

// Create a destructive button
const deleteButton = createButton('Delete Item', {
  variant: 'destructive',
  size: 'sm',
  onClick: () => {
    // Handle delete action
    vscode.postMessage({ command: 'delete' });
  }
});

// Add to DOM
document.getElementById('actions')?.appendChild(saveButton);
document.getElementById('actions')?.appendChild(deleteButton);
```

### Available Button Variants
- `default` - Primary blue button
- `destructive` - Red button for dangerous actions
- `outline` - Outlined button
- `secondary` - Muted button
- `ghost` - No background button
- `link` - Link-styled button

### Available Button Sizes
- `default` - Standard height (36px)
- `sm` - Small height (32px)
- `lg` - Large height (40px)
- `icon` - Square button for icons (36x36px)

## Building New Components

When creating new components:

1. Follow the utility function pattern from `button.ts`
2. Use Tailwind classes with shadcn/ui design tokens
3. Maintain consistent API with variant/size patterns
4. Add TypeScript types for better developer experience
5. Include event handlers for VS Code integration

## Design Tokens Available

The CSS includes design tokens for:
- Colors (primary, secondary, accent, destructive, etc.)
- Border radius (--radius variable)
- Typography scales
- Spacing and sizing
- Dark mode variants

## AI Integration

The open code approach makes it easy for AI to:
- Read and understand component structure
- Generate new components following patterns
- Suggest improvements and customizations
- Adapt components for specific use cases

## Latest Documentation

Always refer to https://ui.shadcn.com/docs/components for the latest component examples and patterns when creating new components.
