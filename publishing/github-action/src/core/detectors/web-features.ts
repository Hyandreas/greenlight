import { WebFeature } from '../types';
import { webFeaturesData } from '../data/web-features-data';

export function detectWebFeatures(apiCall: string): WebFeature | null {
  // Enhanced mapping system for web APIs and JavaScript features
  const apiMappings: Record<string, string> = {
    // Clipboard API
    'navigator.clipboard.write': 'clipboard-api',
    'navigator.clipboard.writeText': 'clipboard-api',
    'navigator.clipboard.read': 'clipboard-api', 
    'navigator.clipboard.readText': 'clipboard-api',
    
    // File System Access API
    'window.showOpenFilePicker': 'file-system-access',
    'window.showSaveFilePicker': 'file-system-access',
    'window.showDirectoryPicker': 'file-system-access',
    
    // Modern Web APIs
    'document.startViewTransition': 'view-transitions',
    'navigator.share': 'web-share',
    'dialog.showModal': 'dialog-element',
    
    // Observer APIs
    'new IntersectionObserver': 'intersection-observer',
    'new ResizeObserver': 'resize-observer',
    'new BroadcastChannel': 'broadcast-channel',
    
    // Modern JavaScript Methods
    'Array.prototype.flat': 'array-flat',
    'Array.prototype.flatMap': 'array-flatmap',
    'Array.prototype.at': 'array-at',
    'Object.fromEntries': 'object-fromentries',
    'String.prototype.matchAll': 'string-matchall',
    
    // Global objects and primitives
    'BigInt': 'bigint',
    'globalThis': 'globalthis',
    
    // Shortened forms for common patterns
    'flat': 'array-flat',
    'flatMap': 'array-flatmap',
    'at': 'array-at',
    'fromEntries': 'object-fromentries',
    'matchAll': 'string-matchall'
  };

  // Direct lookup first
  let featureId = apiMappings[apiCall];
  
  // Pattern-based detection for method calls
  if (!featureId) {
    if (apiCall.includes('.flat(') || apiCall.endsWith('.flat')) {
      featureId = 'array-flat';
    } else if (apiCall.includes('.flatMap(') || apiCall.endsWith('.flatMap')) {
      featureId = 'array-flatmap';
    } else if (apiCall.includes('.at(') || apiCall.endsWith('.at')) {
      featureId = 'array-at';
    } else if (apiCall.includes('.matchAll(') || apiCall.endsWith('.matchAll')) {
      featureId = 'string-matchall';
    } else if (apiCall.includes('fromEntries(') || apiCall.endsWith('fromEntries')) {
      featureId = 'object-fromentries';
    } else if (apiCall.includes('BigInt(') || apiCall === 'BigInt') {
      featureId = 'bigint';
    }
  }

  if (featureId && webFeaturesData[featureId]) {
    return webFeaturesData[featureId];
  }

  return null;
}