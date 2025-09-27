// HTML Dialog element and related APIs demonstration

export class DialogManager {
  constructor() {
    this.activeDialogs = new Set();
    this.initializeDialogs();
  }

  initializeDialogs() {
    // HTML Dialog element - recently baseline but may need polyfills
    const dialogs = document.querySelectorAll('dialog');
    
    dialogs.forEach(dialog => {
      // Check if dialog is supported
      if (typeof dialog.showModal !== 'function') {
        console.warn('Dialog element not supported, loading polyfill...');
        this.loadDialogPolyfill();
        return;
      }

      // Add close button functionality
      const closeButtons = dialog.querySelectorAll('[data-close-dialog]');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => this.closeDialog(dialog));
      });

      // Close on backdrop click
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          this.closeDialog(dialog);
        }
      });

      // Handle escape key
      dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeDialog(dialog);
        }
      });
    });
  }

  openModal(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (!dialog) {
      console.error(`Dialog ${dialogId} not found`);
      return;
    }

    try {
      // Use native showModal() method
      dialog.showModal();
      this.activeDialogs.add(dialog);
      
      // Focus management for accessibility
      this.focusFirstElement(dialog);
      
    } catch (error) {
      console.error('Failed to open modal:', error);
      // Fallback to non-modal dialog
      this.openNonModal(dialog);
    }
  }

  openNonModal(dialogOrId) {
    const dialog = typeof dialogOrId === 'string' 
      ? document.getElementById(dialogOrId) 
      : dialogOrId;
      
    if (!dialog) return;

    try {
      // Use show() for non-modal dialogs
      dialog.show();
      this.activeDialogs.add(dialog);
    } catch (error) {
      console.error('Failed to open dialog:', error);
      // Ultimate fallback - just make visible
      dialog.style.display = 'block';
      dialog.setAttribute('open', '');
    }
  }

  closeDialog(dialogOrId) {
    const dialog = typeof dialogOrId === 'string' 
      ? document.getElementById(dialogOrId) 
      : dialogOrId;
      
    if (!dialog) return;

    try {
      dialog.close();
      this.activeDialogs.delete(dialog);
    } catch (error) {
      console.error('Failed to close dialog:', error);
      // Fallback close
      dialog.style.display = 'none';
      dialog.removeAttribute('open');
    }
  }

  closeAllDialogs() {
    this.activeDialogs.forEach(dialog => {
      this.closeDialog(dialog);
    });
  }

  focusFirstElement(dialog) {
    // Focus first focusable element in dialog
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  loadDialogPolyfill() {
    // Simulate polyfill loading for older browsers
    console.log('Loading dialog polyfill for better compatibility...');
    
    // In a real implementation, you would load a polyfill like:
    // import 'dialog-polyfill/dialog-polyfill.js';
    // import 'dialog-polyfill/dialog-polyfill.css';
  }
}

// CSS Typed OM usage - limited support
export class CSSTypedOMDemo {
  constructor(element) {
    this.element = element;
  }

  setModernStyles() {
    try {
      // CSS Typed OM - limited browser support
      if (this.element.attributeStyleMap) {
        this.element.attributeStyleMap.set('transform', 
          new CSSTransformValue([
            new CSSTranslate(CSS.px(10), CSS.px(20)),
            new CSSRotate(CSS.deg(45))
          ])
        );

        this.element.attributeStyleMap.set('width', CSS.px(200));
        this.element.attributeStyleMap.set('opacity', new CSSUnitValue(0.8, 'number'));
      } else {
        // Fallback to regular style setting
        this.element.style.transform = 'translate(10px, 20px) rotate(45deg)';
        this.element.style.width = '200px';
        this.element.style.opacity = '0.8';
      }
    } catch (error) {
      console.warn('CSS Typed OM not supported, using fallback:', error);
      this.element.style.transform = 'translate(10px, 20px) rotate(45deg)';
      this.element.style.width = '200px';
      this.element.style.opacity = '0.8';
    }
  }
}