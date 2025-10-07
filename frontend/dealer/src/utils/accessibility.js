// Accessibility utilities and helpers

// Focus management
export const focusManager = {
  // Store the last focused element
  lastFocusedElement: null,

  // Save current focus
  saveFocus() {
    this.lastFocusedElement = document.activeElement
  },

  // Restore previous focus
  restoreFocus() {
    if (this.lastFocusedElement && this.lastFocusedElement.focus) {
      this.lastFocusedElement.focus()
      this.lastFocusedElement = null
    }
  },

  // Focus first focusable element in container
  focusFirst(container) {
    const focusableElements = this.getFocusableElements(container)
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  },

  // Get all focusable elements
  getFocusableElements(container = document) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => {
        return element.offsetWidth > 0 && 
               element.offsetHeight > 0 && 
               !element.hasAttribute('hidden')
      })
  },

  // Trap focus within container
  trapFocus(container, event) {
    const focusableElements = this.getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
  }
}

// Screen reader utilities
export const screenReader = {
  // Announce message to screen readers
  announce(message, priority = 'polite') {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message

    document.body.appendChild(announcer)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  },

  // Create visually hidden but screen reader accessible text
  createSROnlyText(text) {
    const span = document.createElement('span')
    span.className = 'sr-only'
    span.textContent = text
    return span
  }
}

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Handle arrow key navigation for lists
  handleArrowKeys(event, items, currentIndex, onIndexChange) {
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowUp':
        event.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break
      default:
        return
    }

    onIndexChange(newIndex)
    if (items[newIndex] && items[newIndex].focus) {
      items[newIndex].focus()
    }
  },

  // Handle escape key
  handleEscape(event, callback) {
    if (event.key === 'Escape') {
      event.preventDefault()
      callback()
    }
  },

  // Handle enter and space for custom buttons
  handleActivation(event, callback) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  }
}

// Color contrast checker
export const colorContrast = {
  // Calculate relative luminance
  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  // Calculate contrast ratio
  getContrastRatio(color1, color2) {
    const lum1 = this.getLuminance(...color1)
    const lum2 = this.getLuminance(...color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
  },

  // Check if contrast meets WCAG standards
  meetsWCAG(color1, color2, level = 'AA', size = 'normal') {
    const ratio = this.getContrastRatio(color1, color2)
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5
    }
  },

  // Convert hex to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null
  }
}

// ARIA helpers
export const aria = {
  // Generate unique IDs for ARIA relationships
  generateId(prefix = 'aria') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Set ARIA attributes
  setAttributes(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        element.setAttribute(key, value)
      }
    })
  },

  // Create ARIA live region
  createLiveRegion(priority = 'polite') {
    const region = document.createElement('div')
    region.setAttribute('aria-live', priority)
    region.setAttribute('aria-atomic', 'true')
    region.className = 'sr-only'
    document.body.appendChild(region)
    return region
  }
}

// Accessibility testing helpers
export const a11yTesting = {
  // Check for missing alt text
  checkImages() {
    const images = document.querySelectorAll('img')
    const issues = []

    images.forEach((img) => {
      if (!img.alt && img.alt !== '') {
        issues.push({
          element: img,
          issue: 'Missing alt attribute',
          severity: 'error'
        })
      } else if (img.alt === '') {
        // Empty alt is OK for decorative images
        // Image marked as decorative
      }
    })

    return issues
  },

  // Check for proper heading structure
  checkHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const issues = []
    let previousLevel = 0

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1))
      
      if (index === 0 && level !== 1) {
        issues.push({
          element: heading,
          issue: 'First heading should be h1',
          severity: 'error'
        })
      }

      if (level > previousLevel + 1) {
        issues.push({
          element: heading,
          issue: `Heading level jumps from h${previousLevel} to h${level}`,
          severity: 'warning'
        })
      }

      previousLevel = level
    })

    return issues
  },

  // Check for keyboard accessibility
  checkKeyboardAccess() {
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
    )
    const issues = []

    interactiveElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex')
      
      if (tabIndex === '-1' && !element.hasAttribute('aria-hidden')) {
        issues.push({
          element,
          issue: 'Interactive element not keyboard accessible',
          severity: 'error'
        })
      }

      // Check for click handlers without keyboard handlers
      if (element.onclick && !element.onkeydown && !element.onkeypress) {
        issues.push({
          element,
          issue: 'Click handler without keyboard equivalent',
          severity: 'warning'
        })
      }
    })

    return issues
  },

  // Check color contrast
  checkColorContrast() {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button')
    const issues = []

    textElements.forEach(element => {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // This is a simplified check - in practice, you'd need more sophisticated color parsing
      if (color && backgroundColor && color !== backgroundColor) {
        // You would implement actual contrast checking here
        // Checking contrast
      }
    })

    return issues
  },

  // Run all accessibility checks
  runAllChecks() {
    const results = {
      images: this.checkImages(),
      headings: this.checkHeadings(),
      keyboard: this.checkKeyboardAccess(),
      contrast: this.checkColorContrast()
    }

    // const totalIssues = Object.values(results).reduce((sum, issues) => sum + issues.length, 0)
    
    // Accessibility results compiled
    // Total issues: ${totalIssues}

    return results
  }
}

// Initialize accessibility features
export const initAccessibility = () => {
  // Add skip link if not present
  if (!document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-500 text-white px-4 py-2 rounded z-50'
    skipLink.textContent = 'Chuyển đến nội dung chính'
    document.body.insertBefore(skipLink, document.body.firstChild)
  }

  // Add main landmark if not present
  if (!document.querySelector('main')) {
    const main = document.createElement('main')
    main.id = 'main-content'
    const content = document.querySelector('#root')
    if (content) {
      content.appendChild(main)
    }
  }

  // Set up global keyboard event listeners
  document.addEventListener('keydown', (event) => {
    // Handle escape key globally
    if (event.key === 'Escape') {
      // Close any open modals, dropdowns, etc.
      const openModals = document.querySelectorAll('[role="dialog"][aria-hidden="false"]')
      openModals.forEach(modal => {
        const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="đóng"]')
        if (closeButton) {
          closeButton.click()
        }
      })
    }
  })

  // Announce page changes for SPA
  let currentPath = window.location.pathname
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname
      screenReader.announce(`Đã chuyển đến trang ${document.title}`)
    }
  })

  observer.observe(document.querySelector('title'), { childList: true })
}
