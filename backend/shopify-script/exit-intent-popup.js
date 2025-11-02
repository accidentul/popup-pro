/**
 * ExitIntent Pro - Exit-Intent Popup Script
 * Detects when users are about to leave and shows targeted popups
 */

(function() {
  'use strict';

  const API_BASE_URL = '{{API_BASE_URL}}';
  const SHOP_ID = '{{SHOP_ID}}';
  const STORAGE_KEY = 'exitIntentPopupShown';
  const SESSION_KEY = 'exitIntentSessionId';

  // Configuration
  const config = {
    exitIntentSensitivity: 20, // pixels from top before triggering
    mobileScrollThreshold: 40, // percentage of page scrolled
    checkInterval: 1000, // ms between checks
    cookieDuration: 24 * 60 * 60 * 1000, // 24 hours
  };

  let activePopup = null;
  let popupShown = false;
  let sessionId = getOrCreateSessionId();

  /**
   * Initialize the exit-intent script
   */
  async function init() {
    try {
      // Load active popups for this shop
      const popups = await loadActivePopups();

      if (!popups || popups.length === 0) {
        console.log('ExitIntent Pro: No active popups found');
        return;
      }

      // Get the first active popup (you can add logic to select based on targeting rules)
      activePopup = popups[0];

      // Check if popup was already shown recently
      if (wasRecentlyShown(activePopup.id)) {
        console.log('ExitIntent Pro: Popup already shown recently');
        return;
      }

      // Set up triggers based on popup type
      setupTriggers(activePopup);

    } catch (error) {
      console.error('ExitIntent Pro: Initialization error:', error);
    }
  }

  /**
   * Load active popups from the API
   */
  async function loadActivePopups() {
    try {
      const response = await fetch(`${API_BASE_URL}/popups/active?shopId=${SHOP_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('ExitIntent Pro: Failed to load popups:', error);
      return [];
    }
  }

  /**
   * Set up triggers based on popup configuration
   */
  function setupTriggers(popup) {
    const triggerType = popup.triggerType || 'exit_intent';

    switch (triggerType) {
      case 'exit_intent':
        setupExitIntentTrigger(popup);
        break;
      case 'mobile_scroll':
        setupMobileScrollTrigger(popup);
        break;
      case 'time_delay':
        setupTimeDelayTrigger(popup);
        break;
      case 'scroll_percentage':
        setupScrollPercentageTrigger(popup);
        break;
      default:
        setupExitIntentTrigger(popup);
    }
  }

  /**
   * Exit intent trigger for desktop
   */
  function setupExitIntentTrigger(popup) {
    if (isMobile()) {
      // Fall back to scroll trigger on mobile
      setupMobileScrollTrigger(popup);
      return;
    }

    document.addEventListener('mouseout', function(e) {
      if (popupShown) return;

      // Check if mouse is leaving from the top
      if (e.clientY < config.exitIntentSensitivity && e.relatedTarget == null) {
        showPopup(popup);
      }
    });
  }

  /**
   * Mobile scroll trigger
   */
  function setupMobileScrollTrigger(popup) {
    let triggered = false;

    window.addEventListener('scroll', function() {
      if (triggered || popupShown) return;

      const scrollPercentage = getScrollPercentage();
      if (scrollPercentage >= config.mobileScrollThreshold) {
        triggered = true;
        showPopup(popup);
      }
    });
  }

  /**
   * Time delay trigger
   */
  function setupTimeDelayTrigger(popup) {
    const delay = popup.targeting?.timeDelay || 5000; // default 5 seconds

    setTimeout(function() {
      if (!popupShown) {
        showPopup(popup);
      }
    }, delay);
  }

  /**
   * Scroll percentage trigger
   */
  function setupScrollPercentageTrigger(popup) {
    const targetPercentage = popup.targeting?.scrollPercentage || 50;
    let triggered = false;

    window.addEventListener('scroll', function() {
      if (triggered || popupShown) return;

      const scrollPercentage = getScrollPercentage();
      if (scrollPercentage >= targetPercentage) {
        triggered = true;
        showPopup(popup);
      }
    });
  }

  /**
   * Show the popup
   */
  function showPopup(popup) {
    if (popupShown) return;

    popupShown = true;
    trackView(popup.id);

    // Create popup HTML
    const popupHTML = createPopupHTML(popup);

    // Insert into page
    const container = document.createElement('div');
    container.id = 'exitintent-popup-overlay';
    container.innerHTML = popupHTML;
    document.body.appendChild(container);

    // Add event listeners
    setupPopupEventListeners(popup);

    // Mark as shown
    markAsShown(popup.id);

    // Add animation class
    setTimeout(() => {
      const popupElement = document.getElementById('exitintent-popup');
      if (popupElement) {
        popupElement.classList.add('show');
      }
    }, 50);
  }

  /**
   * Create popup HTML
   */
  function createPopupHTML(popup) {
    const design = popup.design || {};
    const offer = popup.offer || {};

    return `
      <div class="exitintent-overlay" id="exitintent-overlay">
        <div class="exitintent-popup" id="exitintent-popup" style="
          background-color: ${design.backgroundColor || '#ffffff'};
          color: ${design.textColor || '#1e293b'};
          max-width: ${design.width || 500}px;
          border-radius: ${design.borderRadius || 12}px;
          padding: ${design.padding || 32}px;
          text-align: ${design.layout === 'centered' ? 'center' : design.layout || 'center'};
        ">
          <button class="exitintent-close" id="exitintent-close">&times;</button>

          ${design.imageUrl ? `<img src="${design.imageUrl}" alt="" class="exitintent-image" />` : ''}

          <h2 class="exitintent-heading" style="color: ${design.textColor || '#1e293b'};">
            ${design.heading || 'Special Offer!'}
          </h2>

          <p class="exitintent-subheading" style="color: ${design.textColor || '#1e293b'};">
            ${design.subheading || 'Get 20% off your order'}
          </p>

          ${offer.type === 'email_capture' || offer.type === 'newsletter' ? `
            <form class="exitintent-form" id="exitintent-form">
              <input
                type="email"
                placeholder="Enter your email"
                required
                class="exitintent-email-input"
                id="exitintent-email"
              />
              <button
                type="submit"
                class="exitintent-button"
                style="background-color: ${design.buttonColor || '#6366f1'};"
              >
                ${design.buttonText || 'Claim Offer'}
              </button>
            </form>
          ` : `
            <button
              class="exitintent-button"
              id="exitintent-cta"
              style="background-color: ${design.buttonColor || '#6366f1'};"
            >
              ${design.buttonText || 'Claim Offer'}
            </button>
          `}
        </div>
      </div>
    `;
  }

  /**
   * Set up popup event listeners
   */
  function setupPopupEventListeners(popup) {
    // Close button
    const closeBtn = document.getElementById('exitintent-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closePopup);
    }

    // Overlay click to close
    const overlay = document.getElementById('exitintent-overlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target.id === 'exitintent-overlay') {
          closePopup();
        }
      });
    }

    // Form submission (for email capture)
    const form = document.getElementById('exitintent-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit(popup);
      });
    }

    // CTA button
    const ctaBtn = document.getElementById('exitintent-cta');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', function() {
        handleCTAClick(popup);
      });
    }

    // ESC key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closePopup();
      }
    });
  }

  /**
   * Handle form submission
   */
  async function handleFormSubmit(popup) {
    const emailInput = document.getElementById('exitintent-email');
    const email = emailInput ? emailInput.value : '';

    if (!email) return;

    try {
      // Save email to database
      await fetch(`${API_BASE_URL}/email-subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: SHOP_ID,
          email: email,
          popupId: popup.id,
        }),
      });

      // Track conversion
      trackConversion(popup.id, 'email_capture');

      // Show success message
      showSuccessMessage(popup);

    } catch (error) {
      console.error('ExitIntent Pro: Failed to save email:', error);
      alert('Something went wrong. Please try again.');
    }
  }

  /**
   * Handle CTA click
   */
  function handleCTAClick(popup) {
    trackConversion(popup.id, 'click');

    // If there's a discount code, show it
    if (popup.offer?.type === 'discount' && popup.offer.discountCodeId) {
      showDiscountCode(popup);
    } else {
      closePopup();
    }
  }

  /**
   * Show success message
   */
  function showSuccessMessage(popup) {
    const popupElement = document.getElementById('exitintent-popup');
    if (popupElement) {
      popupElement.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 48px; color: #10b981; margin-bottom: 20px;">✓</div>
          <h2 style="color: #10b981; margin-bottom: 10px;">Thank You!</h2>
          <p style="color: #64748b; margin-bottom: 20px;">Check your email for your special offer.</p>
          <button
            class="exitintent-button"
            onclick="document.getElementById('exitintent-popup-overlay').remove()"
            style="background-color: #10b981;"
          >
            Close
          </button>
        </div>
      `;
    }
  }

  /**
   * Show discount code
   */
  async function showDiscountCode(popup) {
    // Fetch discount code details
    // For now, show a generic message
    const popupElement = document.getElementById('exitintent-popup');
    if (popupElement) {
      popupElement.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <h2 style="margin-bottom: 20px;">Your Discount Code</h2>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <code style="font-size: 24px; font-weight: bold;">SAVE${popup.offer.discountAmount || 20}</code>
          </div>
          <p style="color: #64748b; margin-bottom: 20px;">Copy this code and apply it at checkout!</p>
          <button
            class="exitintent-button"
            onclick="document.getElementById('exitintent-popup-overlay').remove()"
            style="background-color: #6366f1;"
          >
            Continue Shopping
          </button>
        </div>
      `;
    }
  }

  /**
   * Close popup
   */
  function closePopup() {
    const overlay = document.getElementById('exitintent-popup-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Track popup view
   */
  async function trackView(popupId) {
    try {
      await fetch(`${API_BASE_URL}/analytics/views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId: popupId,
          sessionId: sessionId,
          deviceType: isMobile() ? 'mobile' : 'desktop',
          pageUrl: window.location.href,
        }),
      });
    } catch (error) {
      console.error('ExitIntent Pro: Failed to track view:', error);
    }
  }

  /**
   * Track conversion
   */
  async function trackConversion(popupId, type) {
    try {
      await fetch(`${API_BASE_URL}/analytics/conversions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId: popupId,
          type: type,
          sessionId: sessionId,
        }),
      });
    } catch (error) {
      console.error('ExitIntent Pro: Failed to track conversion:', error);
    }
  }

  /**
   * Utility functions
   */
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  function getScrollPercentage() {
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const trackLength = docHeight - winHeight;
    return Math.floor((scrollTop / trackLength) * 100);
  }

  function getOrCreateSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function wasRecentlyShown(popupId) {
    const key = `${STORAGE_KEY}_${popupId}`;
    const shown = localStorage.getItem(key);
    if (!shown) return false;

    const shownTime = parseInt(shown, 10);
    const now = Date.now();
    return (now - shownTime) < config.cookieDuration;
  }

  function markAsShown(popupId) {
    const key = `${STORAGE_KEY}_${popupId}`;
    localStorage.setItem(key, Date.now().toString());
  }

  /**
   * Add CSS styles
   */
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .exitintent-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-center;
        z-index: 999999;
        animation: fadeIn 0.3s ease-out;
      }

      .exitintent-popup {
        position: relative;
        background: white;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        margin: 20px;
        max-height: 90vh;
        overflow-y: auto;
        opacity: 0;
        transform: scale(0.9) translateY(20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .exitintent-popup.show {
        opacity: 1;
        transform: scale(1) translateY(0);
      }

      .exitintent-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        transition: all 0.2s;
        color: #64748b;
      }

      .exitintent-close:hover {
        background: rgba(0, 0, 0, 0.2);
        transform: rotate(90deg);
      }

      .exitintent-heading {
        font-size: 32px;
        font-weight: bold;
        margin: 0 0 16px 0;
      }

      .exitintent-subheading {
        font-size: 18px;
        margin: 0 0 32px 0;
        opacity: 0.9;
      }

      .exitintent-image {
        max-width: 100%;
        height: auto;
        margin-bottom: 24px;
        border-radius: 8px;
      }

      .exitintent-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 400px;
        margin: 0 auto;
      }

      .exitintent-email-input {
        padding: 16px 20px;
        font-size: 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        outline: none;
        transition: all 0.2s;
      }

      .exitintent-email-input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .exitintent-button {
        padding: 16px 32px;
        font-size: 18px;
        font-weight: 600;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .exitintent-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @media (max-width: 640px) {
        .exitintent-popup {
          margin: 0;
          width: 100%;
          max-width: 100%;
          max-height: 100vh;
          border-radius: 0;
        }

        .exitintent-heading {
          font-size: 24px;
        }

        .exitintent-subheading {
          font-size: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      addStyles();
      init();
    });
  } else {
    addStyles();
    init();
  }

})();
