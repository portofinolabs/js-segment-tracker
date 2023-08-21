/**
 * Self-invoking function to initialize Segment tracking and intercept navigation changes.
 * @param {Window} global - The global window object.
 */
(function (global) {
  const DATA_EVENT_PREFIX = 'data-event-';
  const CURRENT_URL_PARAM_KEY = 'url';

  let previousURL = window.location.href;
  function getTrackingDataFromEventTarget(target) {
    let currentTarget = target;
    while (currentTarget) {
      const eventName = currentTarget.getAttribute('data-track-event');
      if (eventName) {
        return eventName;
      }
      currentTarget = currentTarget.parentElement;
    }
    return null;
  }

  /**
   * Gathers page related data like path, referrer, search query, title, and full URL.
   * @param {string} [referrer=document.referrer] - Referrer of the page.
   * @returns {Object} - An object containing the page data.
   */
  function gatherEventData(referrer = document.referrer) {
    return {
      path: window.location.pathname,
      referrer,
      search: window.location.search,
      title: document.title,
      url: window.location.href,
    };
  }

  /**
   * Sends a 'Page Viewed New' event to Segment with relevant page data.
   * @param {string} [referrer=document.referrer] - Referrer of the page.
   */
  function trackPageViewed(referrer = document.referrer) {
    const eventData = gatherEventData(referrer);
    const analytics = global.analytics || window.analytics;
    if (analytics && typeof analytics.track === 'function') {
      analytics.track(
        process.env.PAGE_VIEWED_EVENT_NAME
          || process.env.VITE_PAGE_VIEWED_EVENT_NAME
          || 'Page Viewed',
        eventData,
      );
    } else {
      console.warn('Segment analytics is not available for Page Viewed event.');
    }
  }

  function getSpecialAttributesFromEvent(key, value) {
    switch (key) {
      case CURRENT_URL_PARAM_KEY:
        return !value ? previousURL : value;
      default:
        return value;
    }
  }

  function getDataAttributesFromEventTarget(target) {
    let currentTarget = target;
    const data = {};

    while (currentTarget) {
      for (const attr of currentTarget.attributes) {
        if (attr.name.startsWith(DATA_EVENT_PREFIX)) {
          const key = attr.name.slice(DATA_EVENT_PREFIX.length);
          data[key] = getSpecialAttributesFromEvent(key, attr.value);
        }
      }

      if (Object.keys(data).length > 0) {
        return data;
      }

      currentTarget = currentTarget.parentElement;
    }

    return data;
  }

  /**
   * Handles click events on DOM elements. Sends tracking data to Segment
   * if the clicked element has a `data-track-event` attribute.
   * @param {Event} event - The DOM click event.
   */
  function handleElementClick(event) {
    const analytics = global.analytics || window.analytics;
    const eventName = getTrackingDataFromEventTarget(event.target);

    if (eventName) {
      const eventData = {
        ...getDataAttributesFromEventTarget(event.target),
      };

      if (analytics && typeof analytics.track === 'function') {
        analytics.track(eventName, eventData);
      } else {
        console.warn('Segment analytics is not available.');
      }
    }
  }

  /**
   * Initializes Segment tracking for click events and navigation changes.
   */
  function initSegmentTracking() {
    document.body.addEventListener('click', handleElementClick);
    window.addEventListener('popstate', () => trackPageViewed(previousURL));
    window.addEventListener('hashchange', () => trackPageViewed(previousURL));
  }

  // Intercept changes to the history to track page views
  /**
   * Intercept history.pushState to track page views after a navigation change.
   */
  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    setTimeout(() => {
      trackPageViewed(previousURL);
      // Update the previousURL after tracking the event.
      previousURL = window.location.href;
    }, 0);
  };

  /**
   * Intercept history.replaceState to track page views after a navigation change.
   */
  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    setTimeout(() => {
      trackPageViewed(previousURL);
      previousURL = window.location.href;
    }, 0);
  };

  initSegmentTracking();
}(typeof window !== 'undefined' ? window : this));
