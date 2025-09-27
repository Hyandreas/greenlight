// Comprehensive baseline compatibility data for common web features
// Based on https://web.dev/baseline and browser support data

export interface BaselineData {
  status: 'widely' | 'newly' | 'limited';
  since?: string;
  description: string;
}

export const baselineFeatures: Record<string, BaselineData> = {
  // JavaScript APIs - Widely Supported (Baseline 2020+)
  'fetch': {
    status: 'widely',
    since: '2017-03',
    description: 'Fetch API for network requests'
  },
  'promises': {
    status: 'widely', 
    since: '2016-03',
    description: 'JavaScript Promises'
  },
  'arrow-functions': {
    status: 'widely',
    since: '2016-03', 
    description: 'ES6 Arrow Functions'
  },
  'let-const': {
    status: 'widely',
    since: '2016-03',
    description: 'ES6 let and const declarations'
  },
  'template-literals': {
    status: 'widely', 
    since: '2016-03',
    description: 'ES6 Template Literals'
  },

  // JavaScript APIs - Newly Supported (Baseline 2022-2024)
  'optional-chaining': {
    status: 'newly',
    since: '2022-03',
    description: 'Optional chaining operator (?.)'
  },
  'nullish-coalescing': {
    status: 'newly',
    since: '2022-03', 
    description: 'Nullish coalescing operator (??)'
  },
  'array-flat': {
    status: 'newly',
    since: '2022-03',
    description: 'Array.prototype.flat() method'
  },
  'array-flatmap': {
    status: 'newly',
    since: '2022-03',
    description: 'Array.prototype.flatMap() method'
  },
  'object-fromentries': {
    status: 'newly',
    since: '2022-03',
    description: 'Object.fromEntries() method'
  },
  'string-matchall': {
    status: 'newly',
    since: '2022-03', 
    description: 'String.prototype.matchAll() method'
  },
  'intersection-observer': {
    status: 'newly',
    since: '2022-03',
    description: 'Intersection Observer API'
  },
  'resize-observer': {
    status: 'newly',
    since: '2023-03',
    description: 'Resize Observer API'
  },

  // JavaScript APIs - Limited Support
  'clipboard-api': {
    status: 'limited',
    description: 'Clipboard API for reading/writing clipboard'
  },
  'file-system-access': {
    status: 'limited',
    description: 'File System Access API'
  },
  'web-share': {
    status: 'limited', 
    description: 'Web Share API'
  },
  'view-transitions': {
    status: 'limited',
    description: 'View Transitions API'
  },
  'web-locks': {
    status: 'limited',
    description: 'Web Locks API'
  },
  'broadcast-channel': {
    status: 'newly',
    since: '2022-03',
    description: 'Broadcast Channel API'
  },

  // CSS Features - Widely Supported
  'css-grid': {
    status: 'widely',
    since: '2020-03',
    description: 'CSS Grid Layout'
  },
  'css-flexbox': {
    status: 'widely', 
    since: '2017-03',
    description: 'CSS Flexible Box Layout'
  },
  'css-variables': {
    status: 'widely',
    since: '2020-03',
    description: 'CSS Custom Properties (Variables)'
  },

  // CSS Features - Newly Supported
  'css-has-selector': {
    status: 'newly',
    since: '2023-12',
    description: 'CSS :has() pseudo-class'
  },
  'css-focus-visible': {
    status: 'newly',
    since: '2023-03',
    description: 'CSS :focus-visible pseudo-class'
  },
  'css-focus-within': {
    status: 'newly',
    since: '2022-03',
    description: 'CSS :focus-within pseudo-class'
  },
  'css-is-selector': {
    status: 'newly',
    since: '2023-03',
    description: 'CSS :is() pseudo-class'
  },
  'css-where-selector': {
    status: 'newly',
    since: '2023-03', 
    description: 'CSS :where() pseudo-class'
  },
  'css-container-queries': {
    status: 'newly',
    since: '2023-02',
    description: 'CSS Container Queries'
  },
  'css-aspect-ratio': {
    status: 'newly',
    since: '2022-03',
    description: 'CSS aspect-ratio property'
  },
  'css-gap': {
    status: 'newly',
    since: '2022-03',
    description: 'CSS gap property for flexbox'
  },
  'css-backdrop-filter': {
    status: 'newly',
    since: '2022-03',
    description: 'CSS backdrop-filter property'
  },
  'css-scroll-behavior': {
    status: 'newly',
    since: '2022-03',
    description: 'CSS scroll-behavior property'
  },
  'css-accent-color': {
    status: 'newly',
    since: '2022-03',
    description: 'CSS accent-color property'
  },

  // CSS Features - Limited Support  
  'css-oklch-color': {
    status: 'limited',
    description: 'CSS oklch() color function'
  },
  'css-oklab-color': {
    status: 'limited',
    description: 'CSS oklab() color function'
  },
  'css-color-mix': {
    status: 'limited',
    description: 'CSS color-mix() function'
  },
  'css-relative-colors': {
    status: 'limited',
    description: 'CSS relative color syntax'
  },
  'css-subgrid': {
    status: 'limited',
    description: 'CSS subgrid value'
  },
  'css-cascade-layers': {
    status: 'limited',
    description: 'CSS Cascade Layers (@layer)'
  },

  // HTML Features - Newly Supported
  'dialog-element': {
    status: 'newly',
    since: '2022-03',
    description: 'HTML <dialog> element'
  },
  'details-element': {
    status: 'widely',
    since: '2020-03',
    description: 'HTML <details> and <summary> elements'
  },

  // Modern JavaScript features that need checking
  'bigint': {
    status: 'newly',
    since: '2022-03',
    description: 'BigInt primitive type'
  },
  'dynamic-import': {
    status: 'newly',
    since: '2022-03',
    description: 'Dynamic import() expressions'
  },
  'top-level-await': {
    status: 'newly',
    since: '2023-03',
    description: 'Top-level await in modules'
  },
  'private-fields': {
    status: 'newly',
    since: '2022-03',
    description: 'Private class fields (#field)'
  },
  'array-at': {
    status: 'newly',
    since: '2022-03',
    description: 'Array.prototype.at() method'
  }
};