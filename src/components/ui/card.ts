// Card component utility for VS Code webviews
// Adapted from shadcn/ui card component for vanilla TypeScript usage

export interface CardOptions {
  className?: string;
  onClick?: () => void;
}

export function createCard(options: CardOptions = {}): HTMLDivElement {
  const { className = '', onClick } = options;

  const card = document.createElement('div');
  
  // Base card classes from shadcn/ui
  const baseClasses = [
    'rounded-lg',
    'border',
    'bg-card',
    'text-card-foreground',
    'shadow-sm'
  ];

  if (className) {
    baseClasses.push(...className.split(' '));
  }

  card.className = baseClasses.join(' ');

  if (onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', onClick);
  }

  return card;
}

export function createCardHeader(options: CardOptions = {}): HTMLDivElement {
  const { className = '' } = options;

  const header = document.createElement('div');
  
  const baseClasses = ['flex', 'flex-col', 'space-y-1.5', 'p-6'];

  if (className) {
    baseClasses.push(...className.split(' '));
  }

  header.className = baseClasses.join(' ');
  
  return header;
}

export function createCardTitle(text: string, options: CardOptions = {}): HTMLHeadingElement {
  const { className = '' } = options;

  const title = document.createElement('h3');
  title.textContent = text;
  
  const baseClasses = ['text-2xl', 'font-semibold', 'leading-none', 'tracking-tight'];

  if (className) {
    baseClasses.push(...className.split(' '));
  }

  title.className = baseClasses.join(' ');
  
  return title;
}

export function createCardDescription(text: string, options: CardOptions = {}): HTMLParagraphElement {
  const { className = '' } = options;

  const description = document.createElement('p');
  description.textContent = text;
  
  const baseClasses = ['text-sm', 'text-muted-foreground'];

  if (className) {
    baseClasses.push(...className.split(' '));
  }

  description.className = baseClasses.join(' ');
  
  return description;
}

export function createCardContent(options: CardOptions = {}): HTMLDivElement {
  const { className = '' } = options;

  const content = document.createElement('div');
  
  const baseClasses = ['p-6', 'pt-0'];

  if (className) {
    baseClasses.push(...className.split(' '));
  }

  content.className = baseClasses.join(' ');
  
  return content;
}

export function createCardFooter(options: CardOptions = {}): HTMLDivElement {
  const { className = '' } = options;

  const footer = document.createElement('div');
  
  const baseClasses = ['flex', 'items-center', 'p-6', 'pt-0'];

  if (className) {
    baseClasses.push(...className.split(' '));
  }

  footer.className = baseClasses.join(' ');
  
  return footer;
}
