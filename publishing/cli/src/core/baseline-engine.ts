import { baselineFeatures } from './data/baseline-features';
import { webFeaturesData } from './data/web-features-data';
import { CompatibilityResult } from './types';
import browserslist from 'browserslist';

export interface BaselineTarget {
  year: '2024' | '2025' | 'custom';
  customBrowserslist?: string[];
}

export class BaselineEngine {
  private target: BaselineTarget;

  constructor(target: BaselineTarget = { year: '2024' }) {
    this.target = target;
  }

  /**
   * Check if a feature meets the current baseline target
   */
  isFeatureBaseline(featureId: string): boolean {
    const baselineData = baselineFeatures[featureId];
    const webFeature = webFeaturesData[featureId];
    
    if (!baselineData && !webFeature) {
      return false; // Unknown feature, assume non-baseline
    }

    const feature = baselineData || webFeature?.baseline;
    if (!feature) return false;

    // Features that are widely supported are always baseline
    if (feature.status === 'widely') {
      return true;
    }

    // For custom browserslist targets, use real browser coverage analysis
    if (this.target.year === 'custom' && this.target.customBrowserslist) {
      return this.calculateBrowserslistCoverage(featureId, this.target.customBrowserslist);
    }

    // For year-based targets, use the existing logic as fallback
    // but also check actual browser support if available
    if (feature.status === 'newly' && feature.since) {
      const featureYear = parseInt(feature.since.split('-')[0]);
      const targetYear = parseInt(this.target.year);
      
      // For year-based targets, also verify with default browserslist
      const yearBaseline = featureYear <= targetYear;
      if (yearBaseline && webFeature?.browser_support && this.target.year !== 'custom') {
        const defaultBrowserslist = this.getDefaultBrowserslistForYear(this.target.year);
        return this.calculateBrowserslistCoverage(featureId, defaultBrowserslist);
      }
      return yearBaseline;
    }

    // Limited support features are not baseline
    if (feature.status === 'limited') {
      return false;
    }

    return false;
  }

  /**
   * Get severity level for a non-baseline feature
   */
  getSeverityForFeature(featureId: string): 'error' | 'warning' | 'info' {
    const baselineData = baselineFeatures[featureId];
    const webFeature = webFeaturesData[featureId];
    
    const feature = baselineData || webFeature?.baseline;
    if (!feature) return 'warning';

    switch (feature.status) {
      case 'limited':
        return 'error'; // Limited support is a serious compatibility issue
      case 'newly':
        return 'warning'; // Newly supported might be acceptable depending on target
      case 'widely':
        return 'info'; // Should not happen if calling this for non-baseline
      default:
        return 'warning';
    }
  }

  /**
   * Get baseline status message for a feature
   */
  getBaselineMessage(featureId: string): string {
    const baselineData = baselineFeatures[featureId];
    const webFeature = webFeaturesData[featureId];
    
    const feature = baselineData || webFeature?.baseline;
    if (!feature) return 'Unknown baseline status';

    switch (feature.status) {
      case 'limited':
        return 'Limited browser support - use with caution or provide fallbacks';
      case 'newly':
        return feature.since 
          ? `Newly supported since ${feature.since} - consider your browser targets`
          : 'Newly supported - consider your browser targets';
      case 'widely':
        return 'Widely supported across browsers';
      default:
        return 'Unknown baseline status';
    }
  }

  /**
   * Filter compatibility results based on baseline target
   */
  filterResults(results: CompatibilityResult[]): CompatibilityResult[] {
    return results.filter(result => !this.isFeatureBaseline(result.feature));
  }

  /**
   * Enhance results with baseline-aware messaging (preserving severity)
   */
  enhanceResults(results: CompatibilityResult[]): CompatibilityResult[] {
    return results.map(result => ({
      ...result,
      // Preserve existing severity from configuration, don't overwrite it
      message: `${result.message} - ${this.getBaselineMessage(result.feature)}`
    }));
  }

  /**
   * Calculate if a feature has sufficient browser coverage for the given browserslist
   */
  private calculateBrowserslistCoverage(featureId: string, browserslistQuery: string[]): boolean {
    const webFeature = webFeaturesData[featureId];
    if (!webFeature?.browser_support) {
      return false;
    }

    try {
      // Get the list of browsers from browserslist
      const browsers = browserslist(browserslistQuery);
      
      let supportedBrowsers = 0;
      let totalBrowsers = browsers.length;
      
      // Check support for each browser in the list
      for (const browser of browsers) {
        const [browserName, version] = browser.split(' ');
        const requiredVersion = parseFloat(version);
        
        // Map browserslist browser names to our data format
        const normalizedBrowserName = this.normalizeBrowserName(browserName);
        const featureSupportVersion = webFeature.browser_support[normalizedBrowserName];
        
        if (featureSupportVersion) {
          const supportVersion = parseFloat(featureSupportVersion);
          if (supportVersion <= requiredVersion) {
            supportedBrowsers++;
          }
        }
        // If feature is not supported in this browser at all, don't count it as supported
      }
      
      // Consider baseline if 95% or more of targeted browsers support it
      const coverage = supportedBrowsers / totalBrowsers;
      return coverage >= 0.95;
      
    } catch (error) {
      console.warn(`Failed to evaluate browserslist for feature ${featureId}:`, error);
      return false;
    }
  }

  /**
   * Get default browserslist query for year-based targets
   */
  private getDefaultBrowserslistForYear(year: '2024' | '2025'): string[] {
    switch (year) {
      case '2025':
        return [
          'chrome >= 109',
          'firefox >= 109', 
          'safari >= 16.4',
          'edge >= 109'
        ];
      case '2024':
      default:
        return [
          'chrome >= 105',
          'firefox >= 105',
          'safari >= 15.4', 
          'edge >= 105'
        ];
    }
  }

  /**
   * Normalize browser names from browserslist format to our data format
   */
  private normalizeBrowserName(browserName: string): string {
    const browserMap: Record<string, string> = {
      'chrome': 'chrome',
      'firefox': 'firefox', 
      'safari': 'safari',
      'edge': 'edge',
      'and_chr': 'chrome', // Android Chrome
      'and_ff': 'firefox', // Android Firefox
      'ios_saf': 'safari', // iOS Safari
      'ie': 'ie'
    };
    
    return browserMap[browserName] || browserName;
  }
}