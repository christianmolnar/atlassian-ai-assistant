// Utility for creating styled buttons in VS Code webviews
// Adapted from shadcn/ui button component for vanilla TypeScript usage

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function createButton(text: string, options: ButtonOptions = {}): HTMLButtonElement {
  const {
    variant = 'default',
    size = 'default',
    className = '',
    onClick,
    disabled = false
  } = options;

  const button = document.createElement('button');
  button.textContent = text;
  button.disabled = disabled;

  // Base classes
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'whitespace-nowrap',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-colors',
    'focus-visible:outline-none',
    'focus-visible:ring-1',
    'focus-visible:ring-ring',
    'disabled:pointer-events-none',
    'disabled:opacity-50'
  ];

  // Variant classes
  const variantClasses: Record<ButtonVariant, string[]> = {
    default: ['bg-primary', 'text-primary-foreground', 'shadow', 'hover:bg-primary/90'],
    destructive: ['bg-destructive', 'text-destructive-foreground', 'shadow-sm', 'hover:bg-destructive/90'],
    outline: ['border', 'border-input', 'bg-background', 'shadow-sm', 'hover:bg-accent', 'hover:text-accent-foreground'],
    secondary: ['bg-secondary', 'text-secondary-foreground', 'shadow-sm', 'hover:bg-secondary/80'],
    ghost: ['hover:bg-accent', 'hover:text-accent-foreground'],
    link: ['text-primary', 'underline-offset-4', 'hover:underline']
  };

  // Size classes
  const sizeClasses: Record<ButtonSize, string[]> = {
    default: ['h-9', 'px-4', 'py-2'],
    sm: ['h-8', 'rounded-md', 'px-3', 'text-xs'],
    lg: ['h-10', 'rounded-md', 'px-8'],
    icon: ['h-9', 'w-9']
  };

  // Combine all classes
  const allClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size]
  ];

  if (className) {
    allClasses.push(...className.split(' '));
  }

  button.className = allClasses.join(' ');

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

// Helper function to create icon buttons
export function createIconButton(icon: string, options: ButtonOptions = {}): HTMLButtonElement {
  const button = createButton('', { ...options, size: options.size || 'icon' });
  button.innerHTML = icon;
  return button;
}
