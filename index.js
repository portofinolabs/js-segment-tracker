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
   * Initializes Segment tracking for click events.
   */
  function initSegmentTracking() {
    document.body.addEventListener('click', handleElementClick);
  }

  initSegmentTracking();
}(typeof window !== 'undefined' ? window : this));
