// CureRise Global JavaScript Functions

// Utility Functions
const CureRise = {
  // DOM Helper Functions
  dom: {
    select: (selector) => document.querySelector(selector),
    selectAll: (selector) => document.querySelectorAll(selector),
    create: (tag, className = '', content = '') => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (content) element.textContent = content;
      return element;
    },
    hide: (element) => element.style.display = 'none',
    show: (element) => element.style.display = 'block',
    toggle: (element) => {
      element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
  },

  // Animation Functions
  animation: {
    fadeIn: (element, duration = 300) => {
      element.style.opacity = '0';
      element.style.display = 'block';
      
      const start = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = progress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    },

    slideDown: (element, duration = 300) => {
      element.style.height = '0';
      element.style.overflow = 'hidden';
      element.style.display = 'block';
      
      const targetHeight = element.scrollHeight;
      const start = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.height = (targetHeight * progress) + 'px';
        
        if (progress >= 1) {
          element.style.height = 'auto';
          element.style.overflow = 'visible';
        } else {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  },

  // Toast Notification System
  toast: {
    container: null,
    
    init: () => {
      if (!CureRise.toast.container) {
        CureRise.toast.container = CureRise.dom.create('div', 'toast-container');
        CureRise.toast.container.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        `;
        document.body.appendChild(CureRise.toast.container);
      }
    },

    show: (message, type = 'success', duration = 4000) => {
      CureRise.toast.init();
      
      const toast = CureRise.dom.create('div', `toast toast-${type}`);
      toast.style.cssText = `
        background: ${type === 'success' ? 'var(--success-600)' : type === 'error' ? 'var(--error-600)' : 'var(--primary-600)'};
        color: white;
        padding: 12px 20px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
      `;
      toast.textContent = message;
      
      CureRise.toast.container.appendChild(toast);
      
      // Trigger animation
      setTimeout(() => {
        toast.style.transform = 'translateX(0)';
      }, 10);
      
      // Auto remove
      setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, duration);
      
      return toast;
    }
  },

  // Modal System
  modal: {
    create: (content, options = {}) => {
      const overlay = CureRise.dom.create('div', 'modal-overlay');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      
      const modal = CureRise.dom.create('div', 'modal');
      modal.style.cssText = `
        background: white;
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        max-width: ${options.maxWidth || '500px'};
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
      `;
      
      if (typeof content === 'string') {
        modal.innerHTML = content;
      } else {
        modal.appendChild(content);
      }
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      // Trigger animation
      setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
      }, 10);
      
      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          CureRise.modal.close(overlay);
        }
      });
      
      return overlay;
    },

    close: (modal) => {
      const overlay = modal.querySelector ? modal : modal.closest('.modal-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.querySelector('.modal').style.transform = 'scale(0.9)';
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        }, 300);
      }
    }
  },

  // Form Validation
  validation: {
    email: (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    phone: (phone) => {
      const re = /^[\+]?[1-9][\d]{0,15}$/;
      return re.test(phone.replace(/\s/g, ''));
    },

    required: (value) => {
      return value && value.trim().length > 0;
    },

    minLength: (value, min) => {
      return value && value.length >= min;
    },

    validateForm: (formElement) => {
      const errors = [];
      const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
      
      inputs.forEach(input => {
        const value = input.value.trim();
        const fieldName = input.name || input.id || 'Field';
        
        if (!CureRise.validation.required(value)) {
          errors.push(`${fieldName} is required`);
          input.classList.add('error');
        } else {
          input.classList.remove('error');
          
          // Specific validations
          if (input.type === 'email' && !CureRise.validation.email(value)) {
            errors.push(`Please enter a valid email address`);
            input.classList.add('error');
          }
          
          if (input.type === 'tel' && !CureRise.validation.phone(value)) {
            errors.push(`Please enter a valid phone number`);
            input.classList.add('error');
          }
          
          if (input.type === 'password' && !CureRise.validation.minLength(value, 6)) {
            errors.push(`Password must be at least 6 characters long`);
            input.classList.add('error');
          }
        }
      });
      
      return errors;
    }
  },

  // API Helper Functions
  api: {
    request: async (url, options = {}) => {
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const config = { ...defaultOptions, ...options };
      
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },

    get: (url) => CureRise.api.request(url),
    
    post: (url, data) => CureRise.api.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    put: (url, data) => CureRise.api.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    delete: (url) => CureRise.api.request(url, {
      method: 'DELETE',
    }),
  },

  // Local Storage Helper
  storage: {
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    },

    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('Failed to read from localStorage:', error);
        return defaultValue;
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove from localStorage:', error);
      }
    }
  },

  // Utility Functions
  utils: {
    formatCurrency: (amount, currency = 'INR') => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    },

    formatDate: (date) => {
      return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(date));
    },

    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    throttle: (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  }
};

// Initialize global functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add error styles to CSS
  const style = document.createElement('style');
  style.textContent = `
    .form-input.error {
      border-color: var(--error-500);
      box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
    }
  `;
  document.head.appendChild(style);
  
  // Initialize smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// Export for use in other scripts
window.CureRise = CureRise;
