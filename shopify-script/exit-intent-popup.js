/**
 * Exit-Intent Popup Script for Shopify
 * This script should be injected into merchant stores to detect exit-intent and display popups
 */

(function() {
  'use strict';

  const API_BASE_URL = '{{API_BASE_URL}}';
  const SHOP_ID = '{{SHOP_ID}}';
  const POPUP_CONFIG_URL = `${API_BASE_URL}/popups/active?shopId=${SHOP_ID}`;

  let popups = [];
  let currentPopup = null;
  let exitIntentTriggered = false;
  let mobileScrollTriggered = false;
  let sessionId = generateSessionId();
  let visitorId = getOrCreateVisitorId();

  // Initialize
  function init() {
    loadPopups();
    setupExitIntentDetection();
    setupMobileScrollDetection();
    setupTimeDelayTriggers();
    setupScrollPercentageTriggers();
  }

  // Load active popups from API
  async function loadPopups() {
    try {
      const response = await fetch(POPUP_CONFIG_URL);
      const data = await response.json();
      popups = data.filter(popup => popup.isActive && popup.status === 'active');
      
      if (popups.length > 0) {
        selectPopupForVisitor();
      }
    } catch (error) {
      console.error('Failed to load popups:', error);
    }
  }

  // Select popup based on A/B testing or regular selection
  function selectPopupForVisitor() {
    if (popups.length === 0) return;

    // Check if popup is part of an A/B test
    const abTestPopup = popups.find(p => p.abTestGroupId);
    if (abTestPopup) {
      // In a real implementation, call A/B testing API to assign popup
      currentPopup = abTestPopup;
    } else {
      // Select first active popup
      currentPopup = popups[0];
    }
  }

  // Exit-intent detection for desktop
  function setupExitIntentDetection() {
    document.addEventListener('mouseout', function(e) {
      if (!e.toElement && !e.relatedTarget && e.clientY < 10) {
        if (!exitIntentTriggered && currentPopup && currentPopup.triggerType === 'exit_intent') {
          const deviceType = getDeviceType();
          if (deviceType === 'desktop' && shouldShowPopup(currentPopup)) {
            showPopup(currentPopup);
            exitIntentTriggered = true;
          }
        }
      }
    });
  }

  // Mobile scroll detection
  function setupMobileScrollDetection() {
    let scrollPosition = 0;
    window.addEventListener('scroll', function() {
      const deviceType = getDeviceType();
      if (deviceType === 'mobile' && currentPopup && currentPopup.triggerType === 'mobile_scroll') {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercentage = (currentScroll / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        if (scrollPercentage > 50 && !mobileScrollTriggered && shouldShowPopup(currentPopup)) {
          showPopup(currentPopup);
          mobileScrollTriggered = true;
        }
      }
    });
  }

  // Time delay triggers
  function setupTimeDelayTriggers() {
    popups.forEach(popup => {
      if (popup.triggerType === 'time_delay' && popup.targeting?.timeDelay) {
        setTimeout(() => {
          if (shouldShowPopup(popup)) {
            showPopup(popup);
          }
        }, popup.targeting.timeDelay * 1000);
      }
    });
  }

  // Scroll percentage triggers
  function setupScrollPercentageTriggers() {
    window.addEventListener('scroll', function() {
      popups.forEach(popup => {
        if (popup.triggerType === 'scroll_percentage' && popup.targeting?.scrollPercentage) {
          const scrollPercentage = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          
          if (scrollPercentage >= popup.targeting.scrollPercentage && shouldShowPopup(popup)) {
            showPopup(popup);
          }
        }
      });
    });
  }

  // Check if popup should be shown based on targeting rules
  function shouldShowPopup(popup) {
    if (!popup.targeting) return true;

    const currentPath = window.location.pathname;
    const deviceType = getDeviceType();

    // Check device type
    if (popup.targeting.deviceTypes && !popup.targeting.deviceTypes.includes(deviceType)) {
      return false;
    }

    // Check page inclusion/exclusion
    if (popup.targeting.excludePages && popup.targeting.excludePages.length > 0) {
      if (popup.targeting.excludePages.some(page => currentPath.includes(page))) {
        return false;
      }
    }

    if (popup.targeting.showOnPages && popup.targeting.showOnPages.length > 0) {
      if (!popup.targeting.showOnPages.some(page => currentPath.includes(page))) {
        return false;
      }
    }

    // Check view limit
    if (popup.viewLimit > 0 && popup.viewCount >= popup.viewLimit) {
      return false;
    }

    return true;
  }

  // Show popup
  function showPopup(popup) {
    if (document.getElementById('exit-intent-popup')) {
      return; // Popup already showing
    }

    // Track view
    trackView(popup);

    // Create popup HTML
    const popupHTML = createPopupHTML(popup);
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Add event listeners
    const popupElement = document.getElementById('exit-intent-popup');
    const closeBtn = document.getElementById('popup-close');
    const submitBtn = document.getElementById('popup-submit');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => hidePopup());
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => handlePopupSubmit(popup));
    }

    // Close on overlay click
    popupElement?.addEventListener('click', (e) => {
      if (e.target === popupElement) {
        hidePopup();
      }
    });

    // Show popup with animation
    setTimeout(() => {
      popupElement?.classList.add('show');
    }, 10);
  }

  // Create popup HTML
  function createPopupHTML(popup) {
    const design = popup.design;
    const offer = popup.offer || {};

    return `
      <div id="exit-intent-popup" class="exit-intent-popup-overlay">
        <div class="exit-intent-popup" style="
          background-color: ${design.backgroundColor};
          color: ${design.textColor};
          width: ${design.width}px;
          max-width: 90%;
          border-radius: ${design.borderRadius}px;
          padding: ${design.padding}px;
          text-align: ${design.layout === 'centered' ? 'center' : design.layout};
        ">
          <button id="popup-close" class="popup-close" style="color: ${design.textColor};">×</button>
          ${design.imageUrl ? `<img src="${design.imageUrl}" alt="Popup" style="max-width: 100%; margin-bottom: 20px;" />` : ''}
          <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">${design.heading}</h2>
          <p style="margin: 0 0 20px 0; font-size: 16px;">${design.subheading}</p>
          ${offer.type === 'email_capture' ? `
            <input type="email" id="popup-email" placeholder="Enter your email" style="
              width: 100%;
              padding: 10px;
              margin-bottom: 15px;
              border: 1px solid #ccc;
              border-radius: 5px;
              font-size: 14px;
            " />
          ` : ''}
          <button id="popup-submit" style="
            background-color: ${design.buttonColor};
            color: #ffffff;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">${design.buttonText}</button>
        </div>
      </div>
      <style>
        .exit-intent-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .exit-intent-popup-overlay.show {
          opacity: 1;
        }
        .exit-intent-popup {
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .popup-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 30px;
          height: 30px;
        }
      </style>
    `;
  }

  // Hide popup
  function hidePopup() {
    const popup = document.getElementById('exit-intent-popup');
    if (popup) {
      popup.classList.remove('show');
      setTimeout(() => {
        popup.remove();
      }, 300);
    }
  }

  // Handle popup submit
  async function handlePopupSubmit(popup) {
    const offer = popup.offer || {};

    if (offer.type === 'email_capture') {
      const emailInput = document.getElementById('popup-email') as HTMLInputElement;
      const email = emailInput?.value;

      if (email && isValidEmail(email)) {
        try {
          await fetch(`${API_BASE_URL}/email-subscribers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shopId: SHOP_ID,
              email,
              popupId: popup.id,
            }),
          });

          // Track conversion
          trackConversion(popup, 'email_capture');

          // Show success message or redirect
          alert('Thank you for subscribing!');
          hidePopup();
        } catch (error) {
          console.error('Failed to submit email:', error);
          alert('Something went wrong. Please try again.');
        }
      } else {
        alert('Please enter a valid email address.');
      }
    } else if (offer.type === 'discount') {
      // Show discount code
      if (offer.discountCodeId) {
        try {
          const response = await fetch(`${API_BASE_URL}/discount-codes/${offer.discountCodeId}?shopId=${SHOP_ID}`);
          const discountCode = await response.json();
          
          trackConversion(popup, 'discount_code_used', { discountCodeId: discountCode.id });
          
          alert(`Use code: ${discountCode.code}`);
          hidePopup();
        } catch (error) {
          console.error('Failed to get discount code:', error);
        }
      }
    } else {
      // Other offer types
      trackConversion(popup, 'click');
      hidePopup();
    }
  }

  // Track popup view
  async function trackView(popup) {
    try {
      await fetch(`${API_BASE_URL}/analytics/views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId: popup.id,
          sessionId,
          visitorId,
          deviceType: getDeviceType(),
          browser: getBrowser(),
          pageUrl: window.location.href,
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }

  // Track conversion
  async function trackConversion(popup, type, metadata = {}) {
    try {
      await fetch(`${API_BASE_URL}/analytics/conversions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId: popup.id,
          type,
          sessionId,
          visitorId,
          ...metadata,
        }),
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }

  // Utility functions
  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now();
  }

  function getOrCreateVisitorId() {
    let visitorId = localStorage.getItem('exit_intent_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('exit_intent_visitor_id', visitorId);
    }
    return visitorId;
  }

  function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    return 'Unknown';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


