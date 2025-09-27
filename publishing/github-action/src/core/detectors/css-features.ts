import { WebFeature } from '../types';
import { webFeaturesData } from '../data/web-features-data';

export function detectCSSFeatures(cssFeature: string): WebFeature | null {
  // Map CSS features to web features data
  const cssMappings: Record<string, string> = {
    'pseudo::has': 'css-has-selector',
    'pseudo::focus-visible': 'css-focus-visible',
    'pseudo::focus-within': 'css-focus-within',
    'pseudo::is': 'css-is-selector',
    'pseudo::where': 'css-where-selector',
    'property:container-type': 'css-container-queries',
    'property:container-name': 'css-container-queries',
    'property:container': 'css-container-queries',
    'property:aspect-ratio': 'css-aspect-ratio',
    'property:gap': 'css-gap',
    'property:inset': 'css-inset',
    'property:scroll-behavior': 'css-scroll-behavior',
    'property:scroll-snap-type': 'css-scroll-snap',
    'property:overscroll-behavior': 'css-overscroll-behavior',
    'property:color-scheme': 'css-color-scheme',
    'property:accent-color': 'css-accent-color',
    'property:backdrop-filter': 'css-backdrop-filter'
  };

  // Enhanced value detection for colors and grid features
  if (cssFeature.startsWith('value:')) {
    const value = cssFeature.substring(6);
    if (value.includes('oklch(')) return webFeaturesData['css-oklch-color'] || null;
    if (value.includes('oklab(')) return webFeaturesData['css-oklab-color'] || null;
    if (value.includes('hwb(')) return webFeaturesData['css-hwb-color'] || null;
    if (value.includes('color-mix(')) return webFeaturesData['css-color-mix'] || null;
    if (value === 'subgrid') return webFeaturesData['css-subgrid'] || null;
    if (value === 'masonry') return webFeaturesData['css-masonry'] || null;
  }

  const featureId = cssMappings[cssFeature];
  if (featureId && webFeaturesData[featureId]) {
    return webFeaturesData[featureId];
  }

  return null;
}