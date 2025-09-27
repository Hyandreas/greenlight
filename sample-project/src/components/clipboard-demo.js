// Clipboard API and Web Share API demonstrations

export class ClipboardManager {
  constructor() {
    this.fallbackTextarea = null;
  }

  async copyToClipboard(text) {
    try {
      // Clipboard API - write access has limited support
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
      return true;
    } catch (error) {
      console.warn('Clipboard API failed, using fallback:', error);
      return this.fallbackCopy(text);
    }
  }

  async readFromClipboard() {
    try {
      // Clipboard API - read access even more limited
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      console.warn('Clipboard read failed:', error);
      return null;
    }
  }

  async shareContent(data) {
    // Web Share API - limited to secure contexts and mobile browsers
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url
        });
        console.log('Content shared successfully');
        return true;
      } catch (error) {
        console.warn('Web Share API failed:', error);
      }
    }
    
    // Fallback to copy URL
    return this.copyToClipboard(data.url || data.text);
  }

  fallbackCopy(text) {
    try {
      // Create temporary textarea for fallback copy
      this.fallbackTextarea = document.createElement('textarea');
      this.fallbackTextarea.value = text;
      this.fallbackTextarea.style.position = 'fixed';
      this.fallbackTextarea.style.opacity = '0';
      
      document.body.appendChild(this.fallbackTextarea);
      this.fallbackTextarea.select();
      this.fallbackTextarea.setSelectionRange(0, 99999);
      
      const success = document.execCommand('copy');
      document.body.removeChild(this.fallbackTextarea);
      
      return success;
    } catch (error) {
      console.error('All copy methods failed:', error);
      return false;
    }
  }
}

// Intersection Observer v2 - limited support for enhanced features
export class AdvancedIntersectionObserver {
  constructor(callback, options = {}) {
    // v2 features like box and trackVisibility have limited support
    const observerOptions = {
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
      threshold: options.threshold || 0,
      // These v2 features have limited support:
      trackVisibility: options.trackVisibility || false,
      delay: options.delay || 0
    };

    this.observer = new IntersectionObserver(callback, observerOptions);
  }

  observe(element) {
    this.observer.observe(element);
  }

  unobserve(element) {
    this.observer.unobserve(element);
  }

  disconnect() {
    this.observer.disconnect();
  }
}