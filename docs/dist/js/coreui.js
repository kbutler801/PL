/*!
  * CoreUI v4.2.0 (https://coreui.io)
  * Copyright 2022 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://coreui.io)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('date-fns'), require('@popperjs/core')) :
  typeof define === 'function' && define.amd ? define(['date-fns', '@popperjs/core'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.coreui = factory(global.dateFns, global.Popper));
})(this, (function (dateFns, Popper) { 'use strict';

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
    if (e) {
      for (const k in e) {
        if (k !== 'default') {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }

  const Popper__namespace = /*#__PURE__*/_interopNamespace(Popper);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): alert.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's  util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const MAX_UID = 1000000;
  const MILLISECONDS_MULTIPLIER = 1000;
  const TRANSITION_END = 'transitionend'; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

  const toType = object => {
    if (object === null || object === undefined) {
      return `${object}`;
    }

    return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
  };
  /**
   * --------------------------------------------------------------------------
   * Public Util Api
   * --------------------------------------------------------------------------
   */


  const getUID = prefix => {
    do {
      prefix += Math.floor(Math.random() * MAX_UID);
    } while (document.getElementById(prefix));

    return prefix;
  };

  const getSelector = element => {
    let selector = element.getAttribute('data-coreui-target');

    if (!selector || selector === '#') {
      let hrefAttr = element.getAttribute('href'); // The only valid content that could double as a selector are IDs or classes,
      // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
      // `document.querySelector` will rightfully complain it is invalid.
      // See https://github.com/twbs/bootstrap/issues/32273

      if (!hrefAttr || !hrefAttr.includes('#') && !hrefAttr.startsWith('.')) {
        return null;
      } // Just in case some CMS puts out a full URL with the anchor appended


      if (hrefAttr.includes('#') && !hrefAttr.startsWith('#')) {
        hrefAttr = `#${hrefAttr.split('#')[1]}`;
      }

      selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : null;
    }

    return selector;
  };

  const getSelectorFromElement = element => {
    const selector = getSelector(element);

    if (selector) {
      return document.querySelector(selector) ? selector : null;
    }

    return null;
  };

  const getElementFromSelector = element => {
    const selector = getSelector(element);
    return selector ? document.querySelector(selector) : null;
  };

  const getTransitionDurationFromElement = element => {
    if (!element) {
      return 0;
    } // Get transition-duration of the element


    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay); // Return 0 if element or transition duration is not found

    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    } // If multiple durations are defined, take the first


    transitionDuration = transitionDuration.split(',')[0];
    transitionDelay = transitionDelay.split(',')[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };

  const triggerTransitionEnd = element => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };

  const isElement = obj => {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    if (typeof obj.jquery !== 'undefined') {
      obj = obj[0];
    }

    return typeof obj.nodeType !== 'undefined';
  };

  const getElement = obj => {
    if (isElement(obj)) {
      // it's a jQuery object or a node element
      return obj.jquery ? obj[0] : obj;
    }

    if (typeof obj === 'string' && obj.length > 0) {
      return document.querySelector(obj);
    }

    return null;
  };

  const typeCheckConfig = (componentName, config, configTypes) => {
    Object.keys(configTypes).forEach(property => {
      const expectedTypes = configTypes[property];
      const value = config[property];
      const valueType = value && isElement(value) ? 'element' : toType(value);

      if (!new RegExp(expectedTypes).test(valueType)) {
        throw new TypeError(`${componentName.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
      }
    });
  };

  const isVisible = element => {
    if (!isElement(element) || element.getClientRects().length === 0) {
      return false;
    }

    const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible'; // Handle `details` element as its content may falsie appear visible when it is closed

    const closedDetails = element.closest('details:not([open])');

    if (!closedDetails) {
      return elementIsVisible;
    }

    if (closedDetails !== element) {
      const summary = element.closest('summary');

      if (summary && summary.parentNode !== closedDetails) {
        return false;
      }

      if (summary === null) {
        return false;
      }
    }

    return elementIsVisible;
  };

  const isDisabled = element => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }

    if (element.classList.contains('disabled')) {
      return true;
    }

    if (typeof element.disabled !== 'undefined') {
      return element.disabled;
    }

    return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
  };

  const findShadowRoot = element => {
    if (!document.documentElement.attachShadow) {
      return null;
    } // Can find the shadow root otherwise it'll return the document


    if (typeof element.getRootNode === 'function') {
      const root = element.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }

    if (element instanceof ShadowRoot) {
      return element;
    } // when we don't find a shadow root


    if (!element.parentNode) {
      return null;
    }

    return findShadowRoot(element.parentNode);
  };

  const noop = () => {};
  /**
   * Trick to restart an element's animation
   *
   * @param {HTMLElement} element
   * @return void
   *
   * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
   */


  const reflow = element => {
    // eslint-disable-next-line no-unused-expressions
    element.offsetHeight;
  };

  const getjQuery = () => {
    const {
      jQuery
    } = window;

    if (jQuery && !document.body.hasAttribute('data-coreui-no-jquery')) {
      return jQuery;
    }

    return null;
  };

  const DOMContentLoadedCallbacks = [];

  const onDOMContentLoaded = callback => {
    if (document.readyState === 'loading') {
      // add listener on the first call when the document is in loading state
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener('DOMContentLoaded', () => {
          DOMContentLoadedCallbacks.forEach(callback => callback());
        });
      }

      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };

  const isRTL = () => document.documentElement.dir === 'rtl';

  const defineJQueryPlugin = plugin => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();
      /* istanbul ignore if */

      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;

        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };

  const execute = callback => {
    if (typeof callback === 'function') {
      callback();
    }
  };

  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }

    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;

    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }

      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };

    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };
  /**
   * Return the previous/next element of a list.
   *
   * @param {array} list    The list of elements
   * @param activeElement   The active element
   * @param shouldGetNext   Choose to get next or previous element
   * @param isCycleAllowed
   * @return {Element|elem} The proper element
   */


  const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
    let index = list.indexOf(activeElement); // if the element does not exist in the list return an element depending on the direction and if cycle is allowed

    if (index === -1) {
      return list[!shouldGetNext && isCycleAllowed ? list.length - 1 : 0];
    }

    const listLength = list.length;
    index += shouldGetNext ? 1 : -1;

    if (isCycleAllowed) {
      index = (index + listLength) % listLength;
    }

    return list[Math.max(0, Math.min(index, listLength - 1))];
  };

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): dom/event-handler.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's  dom/event-handler.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  const stripNameRegex = /\..*/;
  const stripUidRegex = /::\d+$/;
  const eventRegistry = {}; // Events storage

  let uidEvent = 1;
  const customEvents = {
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
  };
  const customEventsRegex = /^(mouseenter|mouseleave)/i;
  const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);
  /**
   * ------------------------------------------------------------------------
   * Private methods
   * ------------------------------------------------------------------------
   */

  function getUidEvent(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }

  function getEvent(element) {
    const uid = getUidEvent(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }

  function bootstrapHandler(element, fn) {
    return function handler(event) {
      event.delegateTarget = element;

      if (handler.oneOff) {
        EventHandler.off(element, event.type, fn);
      }

      return fn.apply(element, [event]);
    };
  }

  function bootstrapDelegationHandler(element, selector, fn) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);

      for (let {
        target
      } = event; target && target !== this; target = target.parentNode) {
        for (let i = domElements.length; i--;) {
          if (domElements[i] === target) {
            event.delegateTarget = target;

            if (handler.oneOff) {
              EventHandler.off(element, event.type, selector, fn);
            }

            return fn.apply(target, [event]);
          }
        }
      } // To please ESLint


      return null;
    };
  }

  function findHandler(events, handler, delegationSelector = null) {
    const uidEventList = Object.keys(events);

    for (let i = 0, len = uidEventList.length; i < len; i++) {
      const event = events[uidEventList[i]];

      if (event.originalHandler === handler && event.delegationSelector === delegationSelector) {
        return event;
      }
    }

    return null;
  }

  function normalizeParams(originalTypeEvent, handler, delegationFn) {
    const delegation = typeof handler === 'string';
    const originalHandler = delegation ? delegationFn : handler;
    let typeEvent = getTypeEvent(originalTypeEvent);
    const isNative = nativeEvents.has(typeEvent);

    if (!isNative) {
      typeEvent = originalTypeEvent;
    }

    return [delegation, originalHandler, typeEvent];
  }

  function addHandler(element, originalTypeEvent, handler, delegationFn, oneOff) {
    if (typeof originalTypeEvent !== 'string' || !element) {
      return;
    }

    if (!handler) {
      handler = delegationFn;
      delegationFn = null;
    } // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
    // this prevents the handler from being dispatched the same way as mouseover or mouseout does


    if (customEventsRegex.test(originalTypeEvent)) {
      const wrapFn = fn => {
        return function (event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn.call(this, event);
          }
        };
      };

      if (delegationFn) {
        delegationFn = wrapFn(delegationFn);
      } else {
        handler = wrapFn(handler);
      }
    }

    const [delegation, originalHandler, typeEvent] = normalizeParams(originalTypeEvent, handler, delegationFn);
    const events = getEvent(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFn = findHandler(handlers, originalHandler, delegation ? handler : null);

    if (previousFn) {
      previousFn.oneOff = previousFn.oneOff && oneOff;
      return;
    }

    const uid = getUidEvent(originalHandler, originalTypeEvent.replace(namespaceRegex, ''));
    const fn = delegation ? bootstrapDelegationHandler(element, handler, delegationFn) : bootstrapHandler(element, handler);
    fn.delegationSelector = delegation ? handler : null;
    fn.originalHandler = originalHandler;
    fn.oneOff = oneOff;
    fn.uidEvent = uid;
    handlers[uid] = fn;
    element.addEventListener(typeEvent, fn, delegation);
  }

  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn = findHandler(events[typeEvent], handler, delegationSelector);

    if (!fn) {
      return;
    }

    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    delete events[typeEvent][fn.uidEvent];
  }

  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};
    Object.keys(storeElementEvent).forEach(handlerKey => {
      if (handlerKey.includes(namespace)) {
        const event = storeElementEvent[handlerKey];
        removeHandler(element, events, typeEvent, event.originalHandler, event.delegationSelector);
      }
    });
  }

  function getTypeEvent(event) {
    // allow to get the native events from namespaced events ('click.coreui.button' --> 'click')
    event = event.replace(stripNameRegex, '');
    return customEvents[event] || event;
  }

  const EventHandler = {
    on(element, event, handler, delegationFn) {
      addHandler(element, event, handler, delegationFn, false);
    },

    one(element, event, handler, delegationFn) {
      addHandler(element, event, handler, delegationFn, true);
    },

    off(element, originalTypeEvent, handler, delegationFn) {
      if (typeof originalTypeEvent !== 'string' || !element) {
        return;
      }

      const [delegation, originalHandler, typeEvent] = normalizeParams(originalTypeEvent, handler, delegationFn);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getEvent(element);
      const isNamespace = originalTypeEvent.startsWith('.');

      if (typeof originalHandler !== 'undefined') {
        // Simplest case: handler is passed, remove that listener ONLY.
        if (!events || !events[typeEvent]) {
          return;
        }

        removeHandler(element, events, typeEvent, originalHandler, delegation ? handler : null);
        return;
      }

      if (isNamespace) {
        Object.keys(events).forEach(elementEvent => {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        });
      }

      const storeElementEvent = events[typeEvent] || {};
      Object.keys(storeElementEvent).forEach(keyHandlers => {
        const handlerKey = keyHandlers.replace(stripUidRegex, '');

        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          const event = storeElementEvent[keyHandlers];
          removeHandler(element, events, typeEvent, event.originalHandler, event.delegationSelector);
        }
      });
    },

    trigger(element, event, args) {
      if (typeof event !== 'string' || !element) {
        return null;
      }

      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      const isNative = nativeEvents.has(typeEvent);
      let jQueryEvent;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      let evt = null;

      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }

      if (isNative) {
        evt = document.createEvent('HTMLEvents');
        evt.initEvent(typeEvent, bubbles, true);
      } else {
        evt = new CustomEvent(event, {
          bubbles,
          cancelable: true
        });
      } // merge custom information in our event


      if (typeof args !== 'undefined') {
        Object.keys(args).forEach(key => {
          Object.defineProperty(evt, key, {
            get() {
              return args[key];
            }

          });
        });
      }

      if (defaultPrevented) {
        evt.preventDefault();
      }

      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }

      if (evt.defaultPrevented && typeof jQueryEvent !== 'undefined') {
        jQueryEvent.preventDefault();
      }

      return evt;
    }

  };

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): dom/data.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's dom/data.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  const elementMap = new Map();
  const Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, new Map());
      }

      const instanceMap = elementMap.get(element); // make it clear we only want one instance per element
      // can be removed later when multiple key/instances are fine to be used

      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        // eslint-disable-next-line no-console
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }

      instanceMap.set(key, instance);
    },

    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }

      return null;
    },

    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }

      const instanceMap = elementMap.get(element);
      instanceMap.delete(key); // free up element references if there are no instances left for an element

      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }

  };

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): alert.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's base-component.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const VERSION = '4.2.0';

  class BaseComponent {
    constructor(element) {
      element = getElement(element);

      if (!element) {
        return;
      }

      this._element = element;
      Data.set(this._element, this.constructor.DATA_KEY, this);
    }

    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler.off(this._element, this.constructor.EVENT_KEY);
      Object.getOwnPropertyNames(this).forEach(propertyName => {
        this[propertyName] = null;
      });
    }

    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }
    /** Static */


    static getInstance(element) {
      return Data.get(getElement(element), this.DATA_KEY);
    }

    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    }

    static get VERSION() {
      return VERSION;
    }

    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }

    static get DATA_KEY() {
      return `coreui.${this.NAME}`;
    }

    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/component-functions.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const enableDismissTrigger = (component, method = 'hide') => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler.on(document, clickEvent, `[data-coreui-dismiss="${name}"]`, function (event) {
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }

      if (isDisabled(this)) {
        return;
      }

      const target = getElementFromSelector(this) || this.closest(`.${name}`);
      const instance = component.getOrCreateInstance(target); // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method

      instance[method]();
    });
  };

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): alert.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's alert.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$m = 'alert';
  const DATA_KEY$l = 'coreui.alert';
  const EVENT_KEY$l = `.${DATA_KEY$l}`;
  const EVENT_CLOSE = `close${EVENT_KEY$l}`;
  const EVENT_CLOSED = `closed${EVENT_KEY$l}`;
  const CLASS_NAME_FADE$5 = 'fade';
  const CLASS_NAME_SHOW$b = 'show';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Alert extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$m;
    } // Public


    close() {
      const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);

      if (closeEvent.defaultPrevented) {
        return;
      }

      this._element.classList.remove(CLASS_NAME_SHOW$b);

      const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);

      this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
    } // Private


    _destroyElement() {
      this._element.remove();

      EventHandler.trigger(this._element, EVENT_CLOSED);
      this.dispose();
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Alert.getOrCreateInstance(this);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  enableDismissTrigger(Alert, 'close');
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Alert to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Alert);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): alert.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's button.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$l = 'button';
  const DATA_KEY$k = 'coreui.button';
  const EVENT_KEY$k = `.${DATA_KEY$k}`;
  const DATA_API_KEY$e = '.data-api';
  const CLASS_NAME_ACTIVE$4 = 'active';
  const SELECTOR_DATA_TOGGLE$9 = '[data-coreui-toggle="button"]';
  const EVENT_CLICK_DATA_API$9 = `click${EVENT_KEY$k}${DATA_API_KEY$e}`;
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Button extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$l;
    } // Public


    toggle() {
      // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
      this._element.setAttribute('aria-pressed', this._element.classList.toggle(CLASS_NAME_ACTIVE$4));
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Button.getOrCreateInstance(this);

        if (config === 'toggle') {
          data[config]();
        }
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$9, SELECTOR_DATA_TOGGLE$9, event => {
    event.preventDefault();
    const button = event.target.closest(SELECTOR_DATA_TOGGLE$9);
    const data = Button.getOrCreateInstance(button);
    data.toggle();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Button to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Button);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): dom/manipulator.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's  dom/manipulator.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  function normalizeData(val) {
    if (val === 'true') {
      return true;
    }

    if (val === 'false') {
      return false;
    }

    if (val === Number(val).toString()) {
      return Number(val);
    }

    if (val === '' || val === 'null') {
      return null;
    }

    return val;
  }

  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
  }

  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-coreui-${normalizeDataKey(key)}`, value);
    },

    removeDataAttribute(element, key) {
      element.removeAttribute(`data-coreui-${normalizeDataKey(key)}`);
    },

    getDataAttributes(element) {
      if (!element) {
        return {};
      }

      const attributes = {};
      Object.keys(element.dataset).filter(key => key.startsWith('coreui')).forEach(key => {
        let pureKey = key.replace(/^coreui/, '');
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      });
      return attributes;
    },

    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-coreui-${normalizeDataKey(key)}`));
    },

    offset(element) {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset
      };
    },

    position(element) {
      return {
        top: element.offsetTop,
        left: element.offsetLeft
      };
    }

  };

  const createGroupsInArray = (arr, numberOfGroups) => {
    const perGroup = Math.ceil(arr.length / numberOfGroups); // eslint-disable-next-line unicorn/no-new-array

    return new Array(numberOfGroups).fill('').map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup));
  };
  const getLocalDateFromString = (string, locale, time) => {
    const date = new Date(2013, 11, 31, 17, 19, 22);
    let regex = time ? date.toLocaleString(locale) : date.toLocaleDateString(locale);
    regex = regex.replace('2013', '(?<year>[0-9]{2,4})').replace('12', '(?<month>[0-9]{1,2})').replace('31', '(?<day>[0-9]{1,2})');

    if (time) {
      regex = regex.replace('5', '(?<hour>[0-9]{1,2})').replace('17', '(?<hour>[0-9]{1,2})').replace('19', '(?<minute>[0-9]{1,2})').replace('22', '(?<second>[0-9]{1,2})').replace('PM', '(?<ampm>[A-Z]{2})');
    }

    const rgx = new RegExp(`${regex}`);
    const partials = string.match(rgx);

    if (partials === null) {
      return;
    }

    const newDate = partials.groups && (time ? new Date(Number(partials.groups.year, 10), Number(partials.groups.month, 10) - 1, Number(partials.groups.day), partials.groups.ampm ? partials.groups.ampm === 'PM' ? Number(partials.groups.hour) + 12 : Number(partials.groups.hour) : Number(partials.groups.hour), Number(partials.groups.minute), Number(partials.groups.second)) : new Date(Number(partials.groups.year), Number(partials.groups.month) - 1, Number(partials.groups.day)));
    return newDate;
  };
  const getMonthsNames = locale => {
    const months = [];
    const d = new Date();
    d.setDate(1);

    for (let i = 0; i < 12; i++) {
      d.setMonth(i);
      months.push(d.toLocaleString(locale, {
        month: 'short'
      }));
    }

    return months;
  };
  const getYears = year => {
    const years = [];

    for (let _year = year - 6; _year < year + 6; _year++) {
      years.push(_year);
    }

    return years;
  };

  const getLeadingDays = (year, month, firstDayOfWeek) => {
    // 0: sunday
    // 1: monday
    const dates = [];
    const d = new Date(year, month);
    const y = d.getFullYear();
    const m = d.getMonth();
    const firstWeekday = new Date(y, m, 1).getDay();
    let leadingDays = 6 - (6 - firstWeekday) - firstDayOfWeek;

    if (firstDayOfWeek) {
      leadingDays = leadingDays < 0 ? 7 + leadingDays : leadingDays;
    }

    for (let i = leadingDays * -1; i < 0; i++) {
      dates.push({
        date: new Date(y, m, i + 1),
        month: 'previous'
      });
    }

    return dates;
  };

  const getMonthDays = (year, month) => {
    const dates = [];
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= lastDay; i++) {
      dates.push({
        date: new Date(year, month, i),
        month: 'current'
      });
    }

    return dates;
  };

  const getTrailingDays = (year, month, leadingDays, monthDays) => {
    const dates = [];
    const days = 42 - (leadingDays.length + monthDays.length);

    for (let i = 1; i <= days; i++) {
      dates.push({
        date: new Date(year, month + 1, i),
        month: 'next'
      });
    }

    return dates;
  };

  const getMonthDetails = (year, month, firstDayOfWeek) => {
    const daysPrevMonth = getLeadingDays(year, month, firstDayOfWeek);
    const daysThisMonth = getMonthDays(year, month);
    const daysNextMonth = getTrailingDays(year, month, daysPrevMonth, daysThisMonth);
    const days = [...daysPrevMonth, ...daysThisMonth, ...daysNextMonth];
    const weeks = [];
    days.forEach((day, index) => {
      if (index % 7 === 0 || weeks.length === 0) {
        weeks.push([]);
      }

      weeks[weeks.length - 1].push(day);
    });
    return weeks;
  };
  const isDateDisabled = (date, min, max, dates) => {
    let disabled;

    if (dates) {
      dates.forEach(_date => {
        if (Array.isArray(_date) && isDateInRange(date, _date[0], _date[1])) {
          disabled = true;
        }

        if (_date instanceof Date && isSameDateAs(date, _date)) {
          disabled = true;
        }
      });
    }

    if (min && date < min) {
      disabled = true;
    }

    if (max && date > max) {
      disabled = true;
    }

    return disabled;
  };
  const isDateInRange = (date, start, end) => {
    return start && end && start <= date && date <= end;
  };
  const isDateSelected = (date, start, end) => {
    return start && isSameDateAs(start, date) || end && isSameDateAs(end, date);
  };
  const isEndDate = (date, start, end) => {
    return start && end && isSameDateAs(end, date) && start < end;
  };
  const isLastDayOfMonth = date => {
    const test = new Date(date.getTime());
    const month = test.getMonth();
    test.setDate(test.getDate() + 1);
    return test.getMonth() !== month;
  };
  const isSameDateAs = (date, date2) => {
    if (date instanceof Date && date2 instanceof Date) {
      return date.getDate() === date2.getDate() && date.getMonth() === date2.getMonth() && date.getFullYear() === date2.getFullYear();
    }

    if (date === null && date2 === null) {
      return true;
    }

    return false;
  };
  const isStartDate = (date, start, end) => {
    return start && end && isSameDateAs(start, date) && start < end;
  };
  const isToday = date => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  /* eslint-disable indent, multiline-ternary */
  /**
  * ------------------------------------------------------------------------
  * Constants
  * ------------------------------------------------------------------------
  */

  const NAME$k = 'calendar';
  const DATA_KEY$j = 'coreui.calendar';
  const EVENT_KEY$j = `.${DATA_KEY$j}`;
  const DATA_API_KEY$d = '.data-api';
  const EVENT_CALENDAR_DATE_CHANGE = `calendarDateChange${EVENT_KEY$j}`;
  const EVENT_CELL_HOVER = `cellHover${EVENT_KEY$j}`;
  const EVENT_END_DATE_CHANGE$1 = `endDateChange${EVENT_KEY$j}`;
  const EVENT_LOAD_DATA_API$9 = `load${EVENT_KEY$j}${DATA_API_KEY$d}`;
  const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$j}`;
  const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$j}`;
  const EVENT_START_DATE_CHANGE$1 = `startDateChange${EVENT_KEY$j}`;
  const CLASS_NAME_CALENDAR = 'calendar';
  const SELECTOR_CALENDAR = '.calendar';
  const SELECTOR_CALENDAR_CELL_INNER = '.calendar-cell-inner';
  const Default$j = {
    calendarDate: new Date(),
    calendars: 1,
    disabledDates: null,
    endDate: null,
    firstDayOfWeek: 1,
    locale: 'default',
    maxDate: null,
    minDate: null,
    range: true,
    startDate: null,
    selectEndDate: false,
    weekdayFormat: 2
  };
  const DefaultType$j = {
    calendarDate: '(date|string|null)',
    calendars: 'number',
    disabledDates: '(array|null)',
    endDate: '(date|string|null)',
    firstDayOfWeek: 'number',
    locale: 'string',
    maxDate: '(date|string|null)',
    minDate: '(date|string|null)',
    range: 'boolean',
    startDate: '(date|string|null)',
    selectEndDate: 'boolean',
    weekdayFormat: '(number|string)'
  };
  /**
  * ------------------------------------------------------------------------
  * Class Definition
  * ------------------------------------------------------------------------
  */

  class Calendar extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._calendarDate = this._config.calendarDate;
      this._startDate = this._config.startDate;
      this._endDate = this._config.endDate;
      this._hoverDate = null;
      this._selectEndDate = this._config.selectEndDate;
      this._view = 'days';

      this._createCalendar();

      this._addEventListeners();
    } // Getters


    static get Default() {
      return Default$j;
    }

    static get DefaultType() {
      return DefaultType$j;
    }

    static get NAME() {
      return NAME$k;
    } // Private


    _addEventListeners() {
      EventHandler.on(this._element, 'click', SELECTOR_CALENDAR_CELL_INNER, event => {
        event.preventDefault();

        if (event.target.classList.contains('day')) {
          this._selectDate(Manipulator.getDataAttribute(event.target, 'date'));
        }

        if (event.target.classList.contains('month')) {
          this._setCalendarDate(new Date(this._calendarDate.getFullYear(), Manipulator.getDataAttribute(event.target, 'month'), 1));

          this._view = 'days';
        }

        if (event.target.classList.contains('year')) {
          this._calendarDate = new Date(Manipulator.getDataAttribute(event.target, 'year'), this._calendarDate.getMonth(), 1);
          this._view = 'months';
        }

        this._updateCalendar();
      });
      EventHandler.on(this._element, EVENT_MOUSEENTER$1, SELECTOR_CALENDAR_CELL_INNER, event => {
        event.preventDefault();

        if (event.target.parentElement.classList.contains('disabled')) {
          return;
        }

        this._hoverDate = new Date(Manipulator.getDataAttribute(event.target, 'date'));
        EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
          date: new Date(Manipulator.getDataAttribute(event.target, 'date'))
        });
      });
      EventHandler.on(this._element, EVENT_MOUSELEAVE$1, SELECTOR_CALENDAR_CELL_INNER, event => {
        event.preventDefault();
        this._hoverDate = null;
        EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
          date: null
        });
      }); // Navigation

      EventHandler.on(this._element, 'click', '.btn-prev', event => {
        event.preventDefault();

        this._modifyCalendarDate(0, -1);
      });
      EventHandler.on(this._element, 'click', '.btn-double-prev', event => {
        event.preventDefault();

        this._modifyCalendarDate(this._view === 'years' ? -10 : -1);
      });
      EventHandler.on(this._element, 'click', '.btn-next', event => {
        event.preventDefault();

        this._modifyCalendarDate(0, 1);
      });
      EventHandler.on(this._element, 'click', '.btn-double-next', event => {
        event.preventDefault();

        this._modifyCalendarDate(this._view === 'years' ? 10 : 1);
      });
      EventHandler.on(this._element, 'click', '.btn-month', event => {
        event.preventDefault();
        this._view = 'months';
        this._element.innerHTML = '';

        this._createCalendarPanel();
      });
      EventHandler.on(this._element, 'click', '.btn-year', event => {
        event.preventDefault();
        this._view = 'years';
        this._element.innerHTML = '';

        this._createCalendarPanel();
      });
    }

    _setCalendarDate(date) {
      this._calendarDate = date;
      EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
        date
      });
    }

    _modifyCalendarDate(years, months = 0) {
      const year = this._calendarDate.getFullYear();

      const month = this._calendarDate.getMonth();

      const d = new Date(year, month, 1);

      if (years) {
        d.setFullYear(d.getFullYear() + years);
      }

      if (months) {
        d.setMonth(d.getMonth() + months);
      }

      this._calendarDate = d;

      if (this._view === 'days') {
        EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
          date: d
        });
      }

      this._updateCalendar();
    }

    _setEndDate(date, selectEndDate = false) {
      this._endDate = new Date(date);
      EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE$1, {
        date: this._endDate,
        selectEndDate
      });
    }

    _setStartDate(date, selectEndDate = true) {
      this._startDate = new Date(date);
      EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE$1, {
        date: this._startDate,
        selectEndDate
      });
    }

    _selectDate(date) {
      if (isDateDisabled(date, this._config.minDate, this._config.maxDate, this._config.disabledDates)) {
        return;
      }

      if (this._config.range) {
        if (this._selectEndDate) {
          if (this._startDate && this._startDate > new Date(date)) {
            this._setEndDate(this._startDate);

            this._setStartDate(date);
          } else {
            this._setEndDate(date);
          }
        } else {
          this._setStartDate(date, true);
        }
      } else {
        this._setStartDate(date);
      }
    }

    _createCalendarPanel(addMonths) {
      let date = this._calendarDate;

      if (addMonths !== 0) {
        date = new Date(this._calendarDate.getFullYear(), this._calendarDate.getMonth() + addMonths, 1);
      }

      const year = date.getFullYear();
      const month = date.getMonth();
      const calendarPanelEl = document.createElement('div');
      calendarPanelEl.classList.add('calendar-panel'); // Create navigation

      const navigationElement = document.createElement('div');
      navigationElement.classList.add('calendar-nav');
      navigationElement.innerHTML = `
      <div class="calendar-nav-prev">
        <button class="btn btn-transparent btn-sm btn-double-prev">
          <span class="calendar-nav-icon calendar-nav-icon-double-prev"></span>
        </button>
        ${this._view === 'days' ? `<button class="btn btn-transparent btn-sm btn-prev">
          <span class="calendar-nav-icon calendar-nav-icon-prev"></span>
        </button>` : ''}
      </div>
      <div class="calendar-nav-date">
        <button class="btn btn-transparent btn-sm btn-month">
          ${date.toLocaleDateString(this._config.locale, {
      month: 'long'
    })}
        </button>
        <button class="btn btn-transparent btn-sm btn-year">
          ${date.toLocaleDateString(this._config.locale, {
      year: 'numeric'
    })}
        </button>
      </div>
      <div class="calendar-nav-next">
        ${this._view === 'days' ? `<button class="btn btn-transparent btn-sm btn-next">
          <span class="calendar-nav-icon calendar-nav-icon-next"></span>
        </button>` : ''}
        <button class="btn btn-transparent btn-sm btn-double-next">
          <span class="calendar-nav-icon calendar-nav-icon-double-next"></span>
        </button>
      </div>
    `;
      const monthDetails = getMonthDetails(year, month, this._config.firstDayOfWeek);
      const listOfMonths = createGroupsInArray(getMonthsNames(this._config.locale), 4);
      const listOfYears = createGroupsInArray(getYears(date.getFullYear()), 4);
      const weekDays = monthDetails[0];
      const calendarTable = document.createElement('table');
      calendarTable.innerHTML = `
    ${this._view === 'days' ? `
      <thead>
        <tr>
          ${weekDays.map(({
      date
    }) => `<th class="calendar-cell">
              <div class="calendar-header-cell-inner">
              ${typeof this._config.weekdayFormat === 'string' ? date.toLocaleDateString(this._config.locale, {
      weekday: this._config.weekdayFormat
    }) : date.toLocaleDateString(this._config.locale, {
      weekday: 'long'
    }).slice(0, this._config.weekdayFormat)}
              </div>
            </th>`).join('')}
        </tr>
      </thead>` : ''}
      <tbody>
        ${this._view === 'days' ? monthDetails.map(week => `<tr>${week.map(({
      date,
      month
    }) => `<td class="calendar-cell ${this._dayClassNames(date, month)}">
              <div class="calendar-cell-inner day" data-coreui-date="${date}">
                ${date.toLocaleDateString(this._config.locale, {
      day: 'numeric'
    })}
              </div>
            </td>`).join('')}</tr>`).join('') : ''}
        ${this._view === 'months' ? listOfMonths.map((row, index) => `<tr>${row.map((month, idx) => `<td class="calendar-cell">
              <div class="calendar-cell-inner month" data-coreui-month="${index * 3 + idx - addMonths}">
                ${month}
              </div>
            </td>`).join('')}</tr>`).join('') : ''}
        ${this._view === 'years' ? listOfYears.map(row => `<tr>${row.map(year => `<td class="calendar-cell">
              <div class="calendar-cell-inner year" data-coreui-year="${year}">
                ${year}
              </div>
            </td>`).join('')}</tr>`).join('') : ''}
      </tbody>
    `;
      calendarPanelEl.append(navigationElement, calendarTable);
      return calendarPanelEl;
    }

    _createCalendar() {
      const calendarsEl = document.createElement('div');
      calendarsEl.classList.add('calendars');
      Array.from({
        length: this._config.calendars
      }).forEach((_, index) => calendarsEl.append(this._createCalendarPanel(index)));

      this._element.classList.add(CLASS_NAME_CALENDAR);

      this._element.append(calendarsEl);
    }

    _updateCalendar() {
      this._element.innerHTML = '';

      this._createCalendarPanel();
    }

    _dayClassNames(date, month) {
      const classNames = {
        today: isToday(date),
        disabled: isDateDisabled(date, this._config.minDate, this._config.maxDate, this._config.disabledDates),
        [month]: true,
        last: isLastDayOfMonth(date),
        range: month === 'current' && isDateInRange(date, this._startDate, this._endDate),
        'range-hover': month === 'current' && (this._hoverDate && this._selectEndDate ? isDateInRange(date, this._startDate, this._hoverDate) : isDateInRange(date, this._hoverDate, this._endDate)),
        selected: isDateSelected(date, this._startDate, this._endDate),
        start: isStartDate(date, this._startDate, this._endDate),
        end: isEndDate(date, this._startDate, this._endDate)
      }; // eslint-disable-next-line unicorn/no-array-reduce, unicorn/prefer-object-from-entries

      const result = Object.keys(classNames).reduce((o, key) => {
        // eslint-disable-next-line no-unused-expressions
        classNames[key] === true && (o[key] = classNames[key]);
        return o;
      }, {});
      return Object.keys(result).join(' ');
    }

    _getConfig(config) {
      config = { ...this.constructor.Default,
        ...Manipulator.getDataAttributes(this._element),
        ...config
      };
      typeCheckConfig(NAME$k, config, DefaultType$j);
      return config;
    } // Static


    static calendarInterface(element, config) {
      const data = Calendar.getOrCreateInstance(element, config);

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        const data = Calendar.getOrCreateInstance(this);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }

  }
  /**
  * ------------------------------------------------------------------------
  * Data Api implementation
  * ------------------------------------------------------------------------
  */


  EventHandler.on(window, EVENT_LOAD_DATA_API$9, () => {
    Array.from(document.querySelectorAll(SELECTOR_CALENDAR)).forEach(element => {
      Calendar.calendarInterface(element);
    });
  });
  /**
  * ------------------------------------------------------------------------
  * jQuery
  * ------------------------------------------------------------------------
  * add .Calendar to jQuery only if jQuery is present
  */

  defineJQueryPlugin(Calendar);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): dom/selector-engine.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's  dom/selector-engine.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const NODE_TEXT = 3;
  const SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },

    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },

    children(element, selector) {
      return [].concat(...element.children).filter(child => child.matches(selector));
    },

    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode;

      while (ancestor && ancestor.nodeType === Node.ELEMENT_NODE && ancestor.nodeType !== NODE_TEXT) {
        if (ancestor.matches(selector)) {
          parents.push(ancestor);
        }

        ancestor = ancestor.parentNode;
      }

      return parents;
    },

    prev(element, selector) {
      let previous = element.previousElementSibling;

      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }

        previous = previous.previousElementSibling;
      }

      return [];
    },

    next(element, selector) {
      let next = element.nextElementSibling;

      while (next) {
        if (next.matches(selector)) {
          return [next];
        }

        next = next.nextElementSibling;
      }

      return [];
    },

    focusableChildren(element) {
      const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(', ');
      return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
    }

  };

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): carousel.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's carousel.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$j = 'carousel';
  const DATA_KEY$i = 'coreui.carousel';
  const EVENT_KEY$i = `.${DATA_KEY$i}`;
  const DATA_API_KEY$c = '.data-api';
  const ARROW_LEFT_KEY = 'ArrowLeft';
  const ARROW_RIGHT_KEY = 'ArrowRight';
  const TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  const SWIPE_THRESHOLD = 40;
  const Default$i = {
    interval: 5000,
    keyboard: true,
    slide: false,
    pause: 'hover',
    wrap: true,
    touch: true
  };
  const DefaultType$i = {
    interval: '(number|boolean)',
    keyboard: 'boolean',
    slide: '(boolean|string)',
    pause: '(string|boolean)',
    wrap: 'boolean',
    touch: 'boolean'
  };
  const ORDER_NEXT = 'next';
  const ORDER_PREV = 'prev';
  const DIRECTION_LEFT = 'left';
  const DIRECTION_RIGHT = 'right';
  const KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY]: DIRECTION_LEFT
  };
  const EVENT_SLIDE = `slide${EVENT_KEY$i}`;
  const EVENT_SLID = `slid${EVENT_KEY$i}`;
  const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$i}`;
  const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY$i}`;
  const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY$i}`;
  const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$i}`;
  const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$i}`;
  const EVENT_TOUCHEND = `touchend${EVENT_KEY$i}`;
  const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$i}`;
  const EVENT_POINTERUP = `pointerup${EVENT_KEY$i}`;
  const EVENT_DRAG_START = `dragstart${EVENT_KEY$i}`;
  const EVENT_LOAD_DATA_API$8 = `load${EVENT_KEY$i}${DATA_API_KEY$c}`;
  const EVENT_CLICK_DATA_API$8 = `click${EVENT_KEY$i}${DATA_API_KEY$c}`;
  const CLASS_NAME_CAROUSEL = 'carousel';
  const CLASS_NAME_ACTIVE$3 = 'active';
  const CLASS_NAME_SLIDE = 'slide';
  const CLASS_NAME_END = 'carousel-item-end';
  const CLASS_NAME_START = 'carousel-item-start';
  const CLASS_NAME_NEXT = 'carousel-item-next';
  const CLASS_NAME_PREV = 'carousel-item-prev';
  const CLASS_NAME_POINTER_EVENT = 'pointer-event';
  const SELECTOR_ACTIVE$1 = '.active';
  const SELECTOR_ACTIVE_ITEM = '.active.carousel-item';
  const SELECTOR_ITEM = '.carousel-item';
  const SELECTOR_ITEM_IMG = '.carousel-item img';
  const SELECTOR_NEXT_PREV = '.carousel-item-next, .carousel-item-prev';
  const SELECTOR_INDICATORS = '.carousel-indicators';
  const SELECTOR_INDICATOR = '[data-coreui-target]';
  const SELECTOR_DATA_SLIDE = '[data-coreui-slide], [data-coreui-slide-to]';
  const SELECTOR_DATA_RIDE = '[data-coreui-ride="carousel"]';
  const POINTER_TYPE_TOUCH = 'touch';
  const POINTER_TYPE_PEN = 'pen';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Carousel extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._items = null;
      this._interval = null;
      this._activeElement = null;
      this._isPaused = false;
      this._isSliding = false;
      this.touchTimeout = null;
      this.touchStartX = 0;
      this.touchDeltaX = 0;
      this._config = this._getConfig(config);
      this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
      this._touchSupported = 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
      this._pointerEvent = Boolean(window.PointerEvent);

      this._addEventListeners();
    } // Getters


    static get Default() {
      return Default$i;
    }

    static get NAME() {
      return NAME$j;
    } // Public


    next() {
      this._slide(ORDER_NEXT);
    }

    nextWhenVisible() {
      // Don't call next when the page isn't visible
      // or the carousel or its parent isn't visible
      if (!document.hidden && isVisible(this._element)) {
        this.next();
      }
    }

    prev() {
      this._slide(ORDER_PREV);
    }

    pause(event) {
      if (!event) {
        this._isPaused = true;
      }

      if (SelectorEngine.findOne(SELECTOR_NEXT_PREV, this._element)) {
        triggerTransitionEnd(this._element);
        this.cycle(true);
      }

      clearInterval(this._interval);
      this._interval = null;
    }

    cycle(event) {
      if (!event) {
        this._isPaused = false;
      }

      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }

      if (this._config && this._config.interval && !this._isPaused) {
        this._updateInterval();

        this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
      }
    }

    to(index) {
      this._activeElement = SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);

      const activeIndex = this._getItemIndex(this._activeElement);

      if (index > this._items.length - 1 || index < 0) {
        return;
      }

      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
        return;
      }

      if (activeIndex === index) {
        this.pause();
        this.cycle();
        return;
      }

      const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;

      this._slide(order, this._items[index]);
    } // Private


    _getConfig(config) {
      config = { ...Default$i,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$j, config, DefaultType$i);
      return config;
    }

    _handleSwipe() {
      const absDeltax = Math.abs(this.touchDeltaX);

      if (absDeltax <= SWIPE_THRESHOLD) {
        return;
      }

      const direction = absDeltax / this.touchDeltaX;
      this.touchDeltaX = 0;

      if (!direction) {
        return;
      }

      this._slide(direction > 0 ? DIRECTION_RIGHT : DIRECTION_LEFT);
    }

    _addEventListeners() {
      if (this._config.keyboard) {
        EventHandler.on(this._element, EVENT_KEYDOWN$1, event => this._keydown(event));
      }

      if (this._config.pause === 'hover') {
        EventHandler.on(this._element, EVENT_MOUSEENTER, event => this.pause(event));
        EventHandler.on(this._element, EVENT_MOUSELEAVE, event => this.cycle(event));
      }

      if (this._config.touch && this._touchSupported) {
        this._addTouchEventListeners();
      }
    }

    _addTouchEventListeners() {
      const hasPointerPenTouch = event => {
        return this._pointerEvent && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
      };

      const start = event => {
        if (hasPointerPenTouch(event)) {
          this.touchStartX = event.clientX;
        } else if (!this._pointerEvent) {
          this.touchStartX = event.touches[0].clientX;
        }
      };

      const move = event => {
        // ensure swiping with one touch and not pinching
        this.touchDeltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this.touchStartX;
      };

      const end = event => {
        if (hasPointerPenTouch(event)) {
          this.touchDeltaX = event.clientX - this.touchStartX;
        }

        this._handleSwipe();

        if (this._config.pause === 'hover') {
          // If it's a touch-enabled device, mouseenter/leave are fired as
          // part of the mouse compatibility events on first tap - the carousel
          // would stop cycling until user tapped out of it;
          // here, we listen for touchend, explicitly pause the carousel
          // (as if it's the second time we tap on it, mouseenter compat event
          // is NOT fired) and after a timeout (to allow for mouse compatibility
          // events to fire) we explicitly restart cycling
          this.pause();

          if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
          }

          this.touchTimeout = setTimeout(event => this.cycle(event), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
        }
      };

      SelectorEngine.find(SELECTOR_ITEM_IMG, this._element).forEach(itemImg => {
        EventHandler.on(itemImg, EVENT_DRAG_START, event => event.preventDefault());
      });

      if (this._pointerEvent) {
        EventHandler.on(this._element, EVENT_POINTERDOWN, event => start(event));
        EventHandler.on(this._element, EVENT_POINTERUP, event => end(event));

        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        EventHandler.on(this._element, EVENT_TOUCHSTART, event => start(event));
        EventHandler.on(this._element, EVENT_TOUCHMOVE, event => move(event));
        EventHandler.on(this._element, EVENT_TOUCHEND, event => end(event));
      }
    }

    _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }

      const direction = KEY_TO_DIRECTION[event.key];

      if (direction) {
        event.preventDefault();

        this._slide(direction);
      }
    }

    _getItemIndex(element) {
      this._items = element && element.parentNode ? SelectorEngine.find(SELECTOR_ITEM, element.parentNode) : [];
      return this._items.indexOf(element);
    }

    _getItemByOrder(order, activeElement) {
      const isNext = order === ORDER_NEXT;
      return getNextActiveElement(this._items, activeElement, isNext, this._config.wrap);
    }

    _triggerSlideEvent(relatedTarget, eventDirectionName) {
      const targetIndex = this._getItemIndex(relatedTarget);

      const fromIndex = this._getItemIndex(SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element));

      return EventHandler.trigger(this._element, EVENT_SLIDE, {
        relatedTarget,
        direction: eventDirectionName,
        from: fromIndex,
        to: targetIndex
      });
    }

    _setActiveIndicatorElement(element) {
      if (this._indicatorsElement) {
        const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE$1, this._indicatorsElement);
        activeIndicator.classList.remove(CLASS_NAME_ACTIVE$3);
        activeIndicator.removeAttribute('aria-current');
        const indicators = SelectorEngine.find(SELECTOR_INDICATOR, this._indicatorsElement); // eslint-disable-next-line unicorn/no-for-loop

        for (let i = 0; i < indicators.length; i++) {
          if (Number.parseInt(indicators[i].getAttribute('data-coreui-slide-to'), 10) === this._getItemIndex(element)) {
            indicators[i].classList.add(CLASS_NAME_ACTIVE$3);
            indicators[i].setAttribute('aria-current', 'true');
            break;
          }
        }
      }
    }

    _updateInterval() {
      const element = this._activeElement || SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);

      if (!element) {
        return;
      }

      const elementInterval = Number.parseInt(element.getAttribute('data-coreui-interval'), 10);

      if (elementInterval) {
        this._config.defaultInterval = this._config.defaultInterval || this._config.interval;
        this._config.interval = elementInterval;
      } else {
        this._config.interval = this._config.defaultInterval || this._config.interval;
      }
    }

    _slide(directionOrOrder, element) {
      const order = this._directionToOrder(directionOrOrder);

      const activeElement = SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);

      const activeElementIndex = this._getItemIndex(activeElement);

      const nextElement = element || this._getItemByOrder(order, activeElement);

      const nextElementIndex = this._getItemIndex(nextElement);

      const isCycling = Boolean(this._interval);
      const isNext = order === ORDER_NEXT;
      const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
      const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;

      const eventDirectionName = this._orderToDirection(order);

      if (nextElement && nextElement.classList.contains(CLASS_NAME_ACTIVE$3)) {
        this._isSliding = false;
        return;
      }

      if (this._isSliding) {
        return;
      }

      const slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

      if (slideEvent.defaultPrevented) {
        return;
      }

      if (!activeElement || !nextElement) {
        // Some weirdness is happening, so we bail
        return;
      }

      this._isSliding = true;

      if (isCycling) {
        this.pause();
      }

      this._setActiveIndicatorElement(nextElement);

      this._activeElement = nextElement;

      const triggerSlidEvent = () => {
        EventHandler.trigger(this._element, EVENT_SLID, {
          relatedTarget: nextElement,
          direction: eventDirectionName,
          from: activeElementIndex,
          to: nextElementIndex
        });
      };

      if (this._element.classList.contains(CLASS_NAME_SLIDE)) {
        nextElement.classList.add(orderClassName);
        reflow(nextElement);
        activeElement.classList.add(directionalClassName);
        nextElement.classList.add(directionalClassName);

        const completeCallBack = () => {
          nextElement.classList.remove(directionalClassName, orderClassName);
          nextElement.classList.add(CLASS_NAME_ACTIVE$3);
          activeElement.classList.remove(CLASS_NAME_ACTIVE$3, orderClassName, directionalClassName);
          this._isSliding = false;
          setTimeout(triggerSlidEvent, 0);
        };

        this._queueCallback(completeCallBack, activeElement, true);
      } else {
        activeElement.classList.remove(CLASS_NAME_ACTIVE$3);
        nextElement.classList.add(CLASS_NAME_ACTIVE$3);
        this._isSliding = false;
        triggerSlidEvent();
      }

      if (isCycling) {
        this.cycle();
      }
    }

    _directionToOrder(direction) {
      if (![DIRECTION_RIGHT, DIRECTION_LEFT].includes(direction)) {
        return direction;
      }

      if (isRTL()) {
        return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
      }

      return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }

    _orderToDirection(order) {
      if (![ORDER_NEXT, ORDER_PREV].includes(order)) {
        return order;
      }

      if (isRTL()) {
        return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }

      return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    } // Static


    static carouselInterface(element, config) {
      const data = Carousel.getOrCreateInstance(element, config);
      let {
        _config
      } = data;

      if (typeof config === 'object') {
        _config = { ..._config,
          ...config
        };
      }

      const action = typeof config === 'string' ? config : _config.slide;

      if (typeof config === 'number') {
        data.to(config);
      } else if (typeof action === 'string') {
        if (typeof data[action] === 'undefined') {
          throw new TypeError(`No method named "${action}"`);
        }

        data[action]();
      } else if (_config.interval && _config.ride) {
        data.pause();
        data.cycle();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        Carousel.carouselInterface(this, config);
      });
    }

    static dataApiClickHandler(event) {
      const target = getElementFromSelector(this);

      if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
        return;
      }

      const config = { ...Manipulator.getDataAttributes(target),
        ...Manipulator.getDataAttributes(this)
      };
      const slideIndex = this.getAttribute('data-coreui-slide-to');

      if (slideIndex) {
        config.interval = false;
      }

      Carousel.carouselInterface(target, config);

      if (slideIndex) {
        Carousel.getInstance(target).to(slideIndex);
      }

      event.preventDefault();
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$8, SELECTOR_DATA_SLIDE, Carousel.dataApiClickHandler);
  EventHandler.on(window, EVENT_LOAD_DATA_API$8, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);

    for (let i = 0, len = carousels.length; i < len; i++) {
      Carousel.carouselInterface(carousels[i], Carousel.getInstance(carousels[i]));
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Carousel to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Carousel);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): collapse.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's collapse.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$i = 'collapse';
  const DATA_KEY$h = 'coreui.collapse';
  const EVENT_KEY$h = `.${DATA_KEY$h}`;
  const DATA_API_KEY$b = '.data-api';
  const Default$h = {
    toggle: true,
    parent: null
  };
  const DefaultType$h = {
    toggle: 'boolean',
    parent: '(null|element)'
  };
  const EVENT_SHOW$7 = `show${EVENT_KEY$h}`;
  const EVENT_SHOWN$7 = `shown${EVENT_KEY$h}`;
  const EVENT_HIDE$7 = `hide${EVENT_KEY$h}`;
  const EVENT_HIDDEN$7 = `hidden${EVENT_KEY$h}`;
  const EVENT_CLICK_DATA_API$7 = `click${EVENT_KEY$h}${DATA_API_KEY$b}`;
  const CLASS_NAME_SHOW$a = 'show';
  const CLASS_NAME_COLLAPSE = 'collapse';
  const CLASS_NAME_COLLAPSING = 'collapsing';
  const CLASS_NAME_COLLAPSED = 'collapsed';
  const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
  const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
  const WIDTH = 'width';
  const HEIGHT = 'height';
  const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
  const SELECTOR_DATA_TOGGLE$8 = '[data-coreui-toggle="collapse"]';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Collapse extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._isTransitioning = false;
      this._config = this._getConfig(config);
      this._triggerArray = [];
      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$8);

      for (let i = 0, len = toggleList.length; i < len; i++) {
        const elem = toggleList[i];
        const selector = getSelectorFromElement(elem);
        const filterElement = SelectorEngine.find(selector).filter(foundElem => foundElem === this._element);

        if (selector !== null && filterElement.length) {
          this._selector = selector;

          this._triggerArray.push(elem);
        }
      }

      this._initializeChildren();

      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
      }

      if (this._config.toggle) {
        this.toggle();
      }
    } // Getters


    static get Default() {
      return Default$h;
    }

    static get NAME() {
      return NAME$i;
    } // Public


    toggle() {
      if (this._isShown()) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      if (this._isTransitioning || this._isShown()) {
        return;
      }

      let actives = [];
      let activesData;

      if (this._config.parent) {
        const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
        actives = SelectorEngine.find(SELECTOR_ACTIVES, this._config.parent).filter(elem => !children.includes(elem)); // remove children if greater depth
      }

      const container = SelectorEngine.findOne(this._selector);

      if (actives.length) {
        const tempActiveData = actives.find(elem => container !== elem);
        activesData = tempActiveData ? Collapse.getInstance(tempActiveData) : null;

        if (activesData && activesData._isTransitioning) {
          return;
        }
      }

      const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$7);

      if (startEvent.defaultPrevented) {
        return;
      }

      actives.forEach(elemActive => {
        if (container !== elemActive) {
          Collapse.getOrCreateInstance(elemActive, {
            toggle: false
          }).hide();
        }

        if (!activesData) {
          Data.set(elemActive, DATA_KEY$h, null);
        }
      });

      const dimension = this._getDimension();

      this._element.classList.remove(CLASS_NAME_COLLAPSE);

      this._element.classList.add(CLASS_NAME_COLLAPSING);

      this._element.style[dimension] = 0;

      this._addAriaAndCollapsedClass(this._triggerArray, true);

      this._isTransitioning = true;

      const complete = () => {
        this._isTransitioning = false;

        this._element.classList.remove(CLASS_NAME_COLLAPSING);

        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$a);

        this._element.style[dimension] = '';
        EventHandler.trigger(this._element, EVENT_SHOWN$7);
      };

      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      const scrollSize = `scroll${capitalizedDimension}`;

      this._queueCallback(complete, this._element, true);

      this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }

    hide() {
      if (this._isTransitioning || !this._isShown()) {
        return;
      }

      const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$7);

      if (startEvent.defaultPrevented) {
        return;
      }

      const dimension = this._getDimension();

      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
      reflow(this._element);

      this._element.classList.add(CLASS_NAME_COLLAPSING);

      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$a);

      const triggerArrayLength = this._triggerArray.length;

      for (let i = 0; i < triggerArrayLength; i++) {
        const trigger = this._triggerArray[i];
        const elem = getElementFromSelector(trigger);

        if (elem && !this._isShown(elem)) {
          this._addAriaAndCollapsedClass([trigger], false);
        }
      }

      this._isTransitioning = true;

      const complete = () => {
        this._isTransitioning = false;

        this._element.classList.remove(CLASS_NAME_COLLAPSING);

        this._element.classList.add(CLASS_NAME_COLLAPSE);

        EventHandler.trigger(this._element, EVENT_HIDDEN$7);
      };

      this._element.style[dimension] = '';

      this._queueCallback(complete, this._element, true);
    }

    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$a);
    } // Private


    _getConfig(config) {
      config = { ...Default$h,
        ...Manipulator.getDataAttributes(this._element),
        ...config
      };
      config.toggle = Boolean(config.toggle); // Coerce string values

      config.parent = getElement(config.parent);
      typeCheckConfig(NAME$i, config, DefaultType$h);
      return config;
    }

    _getDimension() {
      return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
    }

    _initializeChildren() {
      if (!this._config.parent) {
        return;
      }

      const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
      SelectorEngine.find(SELECTOR_DATA_TOGGLE$8, this._config.parent).filter(elem => !children.includes(elem)).forEach(element => {
        const selected = getElementFromSelector(element);

        if (selected) {
          this._addAriaAndCollapsedClass([element], this._isShown(selected));
        }
      });
    }

    _addAriaAndCollapsedClass(triggerArray, isOpen) {
      if (!triggerArray.length) {
        return;
      }

      triggerArray.forEach(elem => {
        if (isOpen) {
          elem.classList.remove(CLASS_NAME_COLLAPSED);
        } else {
          elem.classList.add(CLASS_NAME_COLLAPSED);
        }

        elem.setAttribute('aria-expanded', isOpen);
      });
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const _config = {};

        if (typeof config === 'string' && /show|hide/.test(config)) {
          _config.toggle = false;
        }

        const data = Collapse.getOrCreateInstance(this, _config);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config]();
        }
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$7, SELECTOR_DATA_TOGGLE$8, function (event) {
    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
    if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
      event.preventDefault();
    }

    const selector = getSelectorFromElement(this);
    const selectorElements = SelectorEngine.find(selector);
    selectorElements.forEach(element => {
      Collapse.getOrCreateInstance(element, {
        toggle: false
      }).toggle();
    });
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Collapse to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Collapse);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): dropdown.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's dropdown.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$h = 'dropdown';
  const DATA_KEY$g = 'coreui.dropdown';
  const EVENT_KEY$g = `.${DATA_KEY$g}`;
  const DATA_API_KEY$a = '.data-api';
  const ESCAPE_KEY$2 = 'Escape';
  const SPACE_KEY = 'Space';
  const TAB_KEY$2 = 'Tab';
  const ARROW_UP_KEY = 'ArrowUp';
  const ARROW_DOWN_KEY = 'ArrowDown';
  const RIGHT_MOUSE_BUTTON$1 = 2; // MouseEvent.button value for the secondary button, usually the right button

  const REGEXP_KEYDOWN = new RegExp(`${ARROW_UP_KEY}|${ARROW_DOWN_KEY}|${ESCAPE_KEY$2}`);
  const EVENT_HIDE$6 = `hide${EVENT_KEY$g}`;
  const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$g}`;
  const EVENT_SHOW$6 = `show${EVENT_KEY$g}`;
  const EVENT_SHOWN$6 = `shown${EVENT_KEY$g}`;
  const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$g}${DATA_API_KEY$a}`;
  const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$g}${DATA_API_KEY$a}`;
  const EVENT_KEYUP_DATA_API$1 = `keyup${EVENT_KEY$g}${DATA_API_KEY$a}`;
  const CLASS_NAME_SHOW$9 = 'show';
  const CLASS_NAME_DROPUP = 'dropup';
  const CLASS_NAME_DROPEND = 'dropend';
  const CLASS_NAME_DROPSTART = 'dropstart';
  const CLASS_NAME_NAVBAR = 'navbar';
  const SELECTOR_DATA_TOGGLE$7 = '[data-coreui-toggle="dropdown"]';
  const SELECTOR_MENU = '.dropdown-menu';
  const SELECTOR_NAVBAR_NAV = '.navbar-nav';
  const SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
  const PLACEMENT_TOP = isRTL() ? 'top-end' : 'top-start';
  const PLACEMENT_TOPEND = isRTL() ? 'top-start' : 'top-end';
  const PLACEMENT_BOTTOM = isRTL() ? 'bottom-end' : 'bottom-start';
  const PLACEMENT_BOTTOMEND = isRTL() ? 'bottom-start' : 'bottom-end';
  const PLACEMENT_RIGHT = isRTL() ? 'left-start' : 'right-start';
  const PLACEMENT_LEFT = isRTL() ? 'right-start' : 'left-start';
  const Default$g = {
    offset: [0, 2],
    boundary: 'clippingParents',
    reference: 'toggle',
    display: 'dynamic',
    popperConfig: null,
    autoClose: true
  };
  const DefaultType$g = {
    offset: '(array|string|function)',
    boundary: '(string|element)',
    reference: '(string|element|object)',
    display: 'string',
    popperConfig: '(null|object|function)',
    autoClose: '(boolean|string)'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Dropdown extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._popper = null;
      this._config = this._getConfig(config);
      this._menu = this._getMenuElement();
      this._inNavbar = this._detectNavbar();
    } // Getters


    static get Default() {
      return Default$g;
    }

    static get DefaultType() {
      return DefaultType$g;
    }

    static get NAME() {
      return NAME$h;
    } // Public


    toggle() {
      return this._isShown() ? this.hide() : this.show();
    }

    show() {
      if (isDisabled(this._element) || this._isShown(this._menu)) {
        return;
      }

      const relatedTarget = {
        relatedTarget: this._element
      };
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$6, relatedTarget);

      if (showEvent.defaultPrevented) {
        return;
      }

      const parent = Dropdown.getParentFromElement(this._element); // Totally disable Popper for Dropdowns in Navbar

      if (this._inNavbar) {
        Manipulator.setDataAttribute(this._menu, 'popper', 'none');
      } else {
        this._createPopper(parent);
      } // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


      if ('ontouchstart' in document.documentElement && !parent.closest(SELECTOR_NAVBAR_NAV)) {
        [].concat(...document.body.children).forEach(elem => EventHandler.on(elem, 'mouseover', noop));
      }

      this._element.focus();

      this._element.setAttribute('aria-expanded', true);

      this._menu.classList.add(CLASS_NAME_SHOW$9);

      this._element.classList.add(CLASS_NAME_SHOW$9);

      EventHandler.trigger(this._element, EVENT_SHOWN$6, relatedTarget);
    }

    hide() {
      if (isDisabled(this._element) || !this._isShown(this._menu)) {
        return;
      }

      const relatedTarget = {
        relatedTarget: this._element
      };

      this._completeHide(relatedTarget);
    }

    dispose() {
      if (this._popper) {
        this._popper.destroy();
      }

      super.dispose();
    }

    update() {
      this._inNavbar = this._detectNavbar();

      if (this._popper) {
        this._popper.update();
      }
    } // Private


    _completeHide(relatedTarget) {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$6, relatedTarget);

      if (hideEvent.defaultPrevented) {
        return;
      } // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support


      if ('ontouchstart' in document.documentElement) {
        [].concat(...document.body.children).forEach(elem => EventHandler.off(elem, 'mouseover', noop));
      }

      if (this._popper) {
        this._popper.destroy();
      }

      this._menu.classList.remove(CLASS_NAME_SHOW$9);

      this._element.classList.remove(CLASS_NAME_SHOW$9);

      this._element.setAttribute('aria-expanded', 'false');

      Manipulator.removeDataAttribute(this._menu, 'popper');
      EventHandler.trigger(this._element, EVENT_HIDDEN$6, relatedTarget);
    }

    _getConfig(config) {
      config = { ...this.constructor.Default,
        ...Manipulator.getDataAttributes(this._element),
        ...config
      };
      typeCheckConfig(NAME$h, config, this.constructor.DefaultType);

      if (typeof config.reference === 'object' && !isElement(config.reference) && typeof config.reference.getBoundingClientRect !== 'function') {
        // Popper virtual elements require a getBoundingClientRect method
        throw new TypeError(`${NAME$h.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
      }

      return config;
    }

    _createPopper(parent) {
      if (typeof Popper__namespace === 'undefined') {
        throw new TypeError('Bootstrap\'s dropdowns require Popper (https://popper.js.org)');
      }

      let referenceElement = this._element;

      if (this._config.reference === 'parent') {
        referenceElement = parent;
      } else if (isElement(this._config.reference)) {
        referenceElement = getElement(this._config.reference);
      } else if (typeof this._config.reference === 'object') {
        referenceElement = this._config.reference;
      }

      const popperConfig = this._getPopperConfig();

      const isDisplayStatic = popperConfig.modifiers.find(modifier => modifier.name === 'applyStyles' && modifier.enabled === false);
      this._popper = Popper__namespace.createPopper(referenceElement, this._menu, popperConfig);

      if (isDisplayStatic) {
        Manipulator.setDataAttribute(this._menu, 'popper', 'static');
      }
    }

    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$9);
    }

    _getMenuElement() {
      return SelectorEngine.next(this._element, SELECTOR_MENU)[0];
    }

    _getPlacement() {
      const parentDropdown = this._element.parentNode;

      if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
        return PLACEMENT_RIGHT;
      }

      if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
        return PLACEMENT_LEFT;
      } // We need to trim the value because custom properties can also include spaces


      const isEnd = getComputedStyle(this._menu).getPropertyValue('--cui-position').trim() === 'end';

      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
        return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
      }

      return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
    }

    _detectNavbar() {
      return this._element.closest(`.${CLASS_NAME_NAVBAR}`) !== null;
    }

    _getOffset() {
      const {
        offset
      } = this._config;

      if (typeof offset === 'string') {
        return offset.split(',').map(val => Number.parseInt(val, 10));
      }

      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }

      return offset;
    }

    _getPopperConfig() {
      const defaultBsPopperConfig = {
        placement: this._getPlacement(),
        modifiers: [{
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }]
      }; // Disable Popper if we have a static display

      if (this._config.display === 'static') {
        defaultBsPopperConfig.modifiers = [{
          name: 'applyStyles',
          enabled: false
        }];
      }

      return { ...defaultBsPopperConfig,
        ...(typeof this._config.popperConfig === 'function' ? this._config.popperConfig(defaultBsPopperConfig) : this._config.popperConfig)
      };
    }

    _selectMenuItem({
      key,
      target
    }) {
      const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(isVisible);

      if (!items.length) {
        return;
      } // if target isn't included in items (e.g. when expanding the dropdown)
      // allow cycling to get the last item in case key equals ARROW_UP_KEY


      getNextActiveElement(items, target, key === ARROW_DOWN_KEY, !items.includes(target)).focus();
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Dropdown.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      });
    }

    static clearMenus(event) {
      if (event && (event.button === RIGHT_MOUSE_BUTTON$1 || event.type === 'keyup' && event.key !== TAB_KEY$2)) {
        return;
      }

      const toggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE$7);

      for (let i = 0, len = toggles.length; i < len; i++) {
        const context = Dropdown.getInstance(toggles[i]);

        if (!context || context._config.autoClose === false) {
          continue;
        }

        if (!context._isShown()) {
          continue;
        }

        const relatedTarget = {
          relatedTarget: context._element
        };

        if (event) {
          const composedPath = event.composedPath();
          const isMenuTarget = composedPath.includes(context._menu);

          if (composedPath.includes(context._element) || context._config.autoClose === 'inside' && !isMenuTarget || context._config.autoClose === 'outside' && isMenuTarget) {
            continue;
          } // Tab navigation through the dropdown menu or events from contained inputs shouldn't close the menu


          if (context._menu.contains(event.target) && (event.type === 'keyup' && event.key === TAB_KEY$2 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
            continue;
          }

          if (event.type === 'click') {
            relatedTarget.clickEvent = event;
          }
        }

        context._completeHide(relatedTarget);
      }
    }

    static getParentFromElement(element) {
      return getElementFromSelector(element) || element.parentNode;
    }

    static dataApiKeydownHandler(event) {
      // If not input/textarea:
      //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
      // If input/textarea:
      //  - If space key => not a dropdown command
      //  - If key is other than escape
      //    - If key is not up or down => not a dropdown command
      //    - If trigger inside the menu => not a dropdown command
      if (/input|textarea/i.test(event.target.tagName) ? event.key === SPACE_KEY || event.key !== ESCAPE_KEY$2 && (event.key !== ARROW_DOWN_KEY && event.key !== ARROW_UP_KEY || event.target.closest(SELECTOR_MENU)) : !REGEXP_KEYDOWN.test(event.key)) {
        return;
      }

      const isActive = this.classList.contains(CLASS_NAME_SHOW$9);

      if (!isActive && event.key === ESCAPE_KEY$2) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (isDisabled(this)) {
        return;
      }

      const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$7) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$7)[0];
      const instance = Dropdown.getOrCreateInstance(getToggleButton);

      if (event.key === ESCAPE_KEY$2) {
        instance.hide();
        return;
      }

      if (event.key === ARROW_UP_KEY || event.key === ARROW_DOWN_KEY) {
        if (!isActive) {
          instance.show();
        }

        instance._selectMenuItem(event);

        return;
      }

      if (!isActive || event.key === SPACE_KEY) {
        Dropdown.clearMenus();
      }
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$7, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_CLICK_DATA_API$6, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API$1, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$7, function (event) {
    event.preventDefault();
    Dropdown.getOrCreateInstance(this).toggle();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Dropdown to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Dropdown);

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO (v4.2.0): picker.js
   * License (https://coreui.io/pro/license-new/)
   * --------------------------------------------------------------------------
   */
  /**
  * ------------------------------------------------------------------------
  * Constants
  * ------------------------------------------------------------------------
  */

  const NAME$g = 'picker';
  const DATA_KEY$f = 'coreui.picker';
  const EVENT_KEY$f = `.${DATA_KEY$f}`;
  const EVENT_CANCEL = `onCancelClick${EVENT_KEY$f}`;
  const Default$f = {
    cancelButton: 'Cancel',
    cancelButtonClasses: ['btn', 'btn-sm', 'btn-ghost-primary'],
    confirmButton: 'OK',
    confirmButtonClasses: ['btn', 'btn-sm', 'btn-primary'],
    container: 'dropdown',
    disabled: false,
    footer: false
  };
  const DefaultType$f = {
    cancelButton: '(boolean|string)',
    cancelButtonClasses: '(array|string)',
    confirmButton: '(boolean|string)',
    confirmButtonClasses: '(array|string)',
    container: 'string',
    disabled: 'boolean',
    footer: 'boolean'
  };
  /**
  * ------------------------------------------------------------------------
  * Class Definition
  * ------------------------------------------------------------------------
  */

  class Picker extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._dropdown = null; //

      this._dropdownEl = null;
      this._dropdownMenuEl = null;
      this._dropdownToggleEl = null;

      this._createPicker();
    } // Getters


    static get Default() {
      return Default$f;
    }

    static get DefaultType() {
      return DefaultType$f;
    }

    static get NAME() {
      return NAME$g;
    }

    _getButtonClasses(classes) {
      if (typeof classes === 'string') {
        return classes.split(' ');
      }

      return classes;
    } // Private


    _createDropdown() {
      const dropdownEl = document.createElement('div');
      dropdownEl.classList.add('picker');
      this._dropdownEl = dropdownEl;
      const dropdownToggleEl = document.createElement('div');
      this._dropdownToggleEl = dropdownToggleEl;

      if (!this._config.disabled) {
        Manipulator.setDataAttribute(dropdownToggleEl, 'toggle', 'dropdown');
      }

      const dropdownMenuEl = document.createElement('div');
      dropdownMenuEl.classList.add('dropdown-menu');
      this._dropdownMenuEl = dropdownMenuEl;
      dropdownEl.append(dropdownToggleEl, dropdownMenuEl);

      this._element.append(dropdownEl);

      this._dropdown = new Dropdown(dropdownToggleEl, {
        autoClose: 'outside'
      });
    }

    _createFooter() {
      const footerEl = document.createElement('div');
      footerEl.classList.add('picker-footer');
      footerEl.append(this._createFooterContent());

      if (this._config.cancelButton) {
        const cancelButtonEl = document.createElement('button');
        cancelButtonEl.classList.add(...this._getButtonClasses(this._config.cancelButtonClasses));
        cancelButtonEl.type = 'button';
        cancelButtonEl.innerHTML = this._config.cancelButton;
        cancelButtonEl.addEventListener('click', () => {
          this._dropdown.hide();

          EventHandler.trigger(this._element, EVENT_CANCEL);
        });
        footerEl.append(cancelButtonEl);
      }

      if (this._config.confirmButton) {
        const confirmButtonEl = document.createElement('button');
        confirmButtonEl.classList.add(...this._getButtonClasses(this._config.confirmButtonClasses));
        confirmButtonEl.type = 'button';
        confirmButtonEl.innerHTML = this._config.confirmButton;
        confirmButtonEl.addEventListener('click', () => {
          this._dropdown.hide();
        });
        footerEl.append(confirmButtonEl);
      }

      this._dropdownMenuEl.append(footerEl);
    }

    _createFooterContent() {
      return '';
    }

    _createPicker() {
      if (this._config.container === 'dropdown') {
        this._createDropdown();
      }

      if (this._config.footer || this._config.timepicker) {
        this._createFooter();
      }
    }

    _getConfig(config) {
      config = { ...this.constructor.Default,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$g, config, DefaultType$f);
      return config;
    }

  }

  const convert12hTo24h = (abbr, hour) => {
    if (abbr === 'am' && hour === 12) {
      return 0;
    }

    if (abbr === 'am') {
      return hour;
    }

    if (abbr === 'pm' && hour === 12) {
      return 12;
    }

    return hour + 12;
  };
  const convert24hTo12h = hour => hour % 12 || 12;
  const getAmPm = (date, locale) => {
    if (date.toLocaleTimeString(locale).includes('AM')) {
      return 'am';
    }

    if (date.toLocaleTimeString(locale).includes('PM')) {
      return 'pm';
    }

    return date.getHours() >= 12 ? 'pm' : 'am';
  };
  const getListOfHours = locale => Array.from({
    length: isAmPm(locale) ? 12 : 24
  }, (_, i) => {
    return {
      value: isAmPm(locale) ? i + 1 : i,
      label: (isAmPm(locale) ? i + 1 : i).toLocaleString(locale)
    };
  });
  const getListOfMinutes = (locale, valueAsString = false) => Array.from({
    length: 60
  }, (_, i) => {
    const d = new Date();
    d.setMinutes(i);
    return {
      value: valueAsString ? i.toString() : i,
      label: d.toLocaleTimeString(locale, {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit'
      }).split(':')[1]
    };
  });
  const getListOfSeconds = (locale, valueAsString = false) => Array.from({
    length: 60
  }, (_, i) => {
    const d = new Date();
    d.setSeconds(i);
    return {
      value: valueAsString ? i.toString() : i,
      label: d.toLocaleTimeString(locale, {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit'
      }).split(':')[2]
    };
  });
  const isAmPm = locale => ['am', 'AM', 'pm', 'PM'].some(el => new Date().toLocaleString(locale).includes(el));
  const isValidTime = time => {
    const d = new Date(`1970-01-01 ${time}`);
    return d instanceof Date && d.getTime();
  };

  /* eslint-disable indent */
  /**
  * ------------------------------------------------------------------------
  * Constants
  * ------------------------------------------------------------------------
  */

  const NAME$f = 'time-picker';
  const DATA_KEY$e = 'coreui.time-picker';
  const EVENT_KEY$e = `.${DATA_KEY$e}`;
  const DATA_API_KEY$9 = '.data-api';
  const EVENT_TIME_CHANGE = `timeChange${EVENT_KEY$e}`;
  const EVENT_LOAD_DATA_API$7 = `load${EVENT_KEY$e}${DATA_API_KEY$9}`;
  const SELECTOR_DATA_TOGGLE$6 = '[data-coreui-toggle="time-picker"]';
  const Default$e = { ...Picker.Default,
    cleaner: true,
    container: 'dropdown',
    disabled: false,
    footer: true,
    indicator: true,
    inputReadOnly: false,
    locale: 'default',
    placeholder: 'Select time',
    size: null,
    time: null,
    variant: 'roll'
  };
  const DefaultType$e = { ...Picker.DefaultType,
    cleaner: 'boolean',
    indicator: 'boolean',
    inputReadOnly: 'boolean',
    locale: 'string',
    placeholder: 'string',
    size: '(string|null)',
    time: '(date|string|null)',
    variant: 'string'
  };
  /**
  * ------------------------------------------------------------------------
  * Class Definition
  * ------------------------------------------------------------------------
  */

  class TimePicker extends Picker {
    constructor(element, config) {
      super(element);

      this._handleTimeChange = (set, value) => {
        const _date = this._date || new Date('1970-01-01');

        if (set === 'toggle') {
          if (value === 'am') {
            this._ampm = 'am';

            _date.setHours(_date.getHours() - 12);
          }

          if (value === 'pm') {
            this._ampm = 'pm';

            _date.setHours(_date.getHours() + 12);
          }
        }

        if (set === 'hours') {
          if (isAmPm(this._config.locale)) {
            _date.setHours(convert12hTo24h(this._ampm, Number.parseInt(value, 10)));
          } else {
            _date.setHours(Number.parseInt(value, 10));
          }
        }

        if (set === 'minutes') {
          _date.setMinutes(Number.parseInt(value, 10));
        }

        if (set === 'seconds') {
          _date.setSeconds(Number.parseInt(value, 10));
        }

        if (this._input) {
          this._input.value = _date.toLocaleTimeString(this._config.locale);
        }

        this._date = new Date(_date);
        EventHandler.trigger(this._element, EVENT_TIME_CHANGE, {
          timeString: _date.toTimeString(),
          localeTimeString: _date.toLocaleTimeString(),
          date: _date
        });
      };

      this._config = this._getConfig(config);
      this._date = this._convertStringToDate(this._config.time);
      this._initialDate = null;
      this._ampm = this._date ? getAmPm(new Date(this._date), this._config.locale) : 'am'; // subcomponents

      this._input = null;
      this._timePickerBody = null;

      this._createTimePicker();

      this._createTimePickerSelection();

      this._addEventListeners();

      this._setUpSelects();
    } // Getters


    static get Default() {
      return Default$e;
    }

    static get DefaultType() {
      return DefaultType$e;
    }

    static get NAME() {
      return NAME$f;
    } // Public


    cancel() {
      this._date = this._initialDate;
      this._input.value = this._initialDate ? this._convertStringToDate(this._initialDate).toLocaleTimeString(this._config.locale) : '';
      this._timePickerBody.innerHTML = '';

      this._createTimePickerSelection();
    }

    clear() {
      this._date = null;
      this._input.value = '';
      this._timePickerBody.innerHTML = '';

      this._createTimePickerSelection();
    }

    reset() {
      this._date = this._convertStringToDate(this._config.time);
      this._input.value = this._convertStringToDate(this._config.time).toLocaleTimeString(this._config.locale);
      this._timePickerBody.innerHTML = '';

      this._createTimePickerSelection();
    }

    update(config) {
      this._config = this._getConfig(config);
      this._element.innerHTML = '';

      this._createTimePicker();

      this._createTimePickerSelection();
    }

    _getPartOfTime(part) {
      if (this._date === null) {
        return null;
      }

      if (part === 'hours') {
        return isAmPm(this._config.locale) ? convert24hTo12h(this._date.getHours()) : this._date.getHours();
      }

      if (part === 'minutes') {
        return this._date.getMinutes();
      }

      if (part === 'seconds') {
        return this._date.getSeconds();
      }

      if (part === 'toggle') {
        return getAmPm(new Date(this._date), this._config.locale);
      }
    }

    _setUpRolls(initial = false) {
      Array.from(['hours', 'minutes', 'seconds', 'toggle']).forEach(part => {
        SelectorEngine.find(`[data-coreui-${part}]`, this._element).forEach(element => {
          if (this._getPartOfTime(part) === Manipulator.getDataAttribute(element, part)) {
            element.classList.add('selected');

            this._scrollTo(element.parentElement, element, initial);

            for (const sibling of element.parentElement.children) {
              if (sibling !== element) {
                sibling.classList.remove('selected');
              }
            }
          }
        });
      });
    }

    _setUpSelects() {
      Array.from(['hours', 'minutes', 'seconds', 'toggle']).forEach(part => {
        SelectorEngine.find(`select.${part}`, this._element).forEach(element => {
          if (this._getPartOfTime(part)) {
            element.value = this._getPartOfTime(part);
          }
        });
      });
    } // Private


    _addEventListeners() {
      EventHandler.on(this._element, 'shown.coreui.dropdown', () => {
        this._initialDate = new Date(this._date);

        if (this._config.variant === 'roll') {
          this._setUpRolls(true);
        }

        if (this._config.variant === 'select') {
          this._setUpSelects();
        }
      });
      EventHandler.on(this._element, 'timeChange.coreui.time-picker', () => {
        if (this._config.variant === 'roll') {
          this._setUpRolls();
        }

        if (this._config.variant === 'select') {
          this._setUpSelects();
        }
      });
      EventHandler.on(this._element, 'click', '.picker-input-group-cleaner', event => {
        event.stopPropagation();
        this.clear();
      });
      EventHandler.on(this._element, 'onCancelClick.coreui.picker', () => {
        this.cancel();
      });
      EventHandler.on(this._input, 'input', event => {
        if (isValidTime(event.target.value)) {
          this._date = this._convertStringToDate(event.target.value);
          EventHandler.trigger(this._element, EVENT_TIME_CHANGE, {
            timeString: this._date.toTimeString(),
            localeTimeString: this._date.toLocaleTimeString(),
            date: this._date
          });
        }
      });
    }

    _convertStringToDate(date) {
      return date ? date instanceof Date ? date : new Date(`1970-01-01 ${date}`) : null;
    }

    _createInputGroup() {
      const inputGroupEl = document.createElement('div');
      inputGroupEl.classList.add('input-group', 'picker-input-group');

      if (this._config.size) {
        inputGroupEl.classList.add(`input-group-${this._config.size}`);
      }

      const inputEl = document.createElement('input');
      inputEl.classList.add('form-control');
      inputEl.disabled = this._config.disabled;
      inputEl.placeholder = this._config.placeholder;
      inputEl.readOnly = this._config.inputReadOnly;
      inputEl.type = 'text';
      inputEl.value = this._date ? this._date.toLocaleTimeString(this._config.locale) : '';
      inputGroupEl.append(inputEl);
      const inputGroupTextEl = document.createElement('span');
      inputGroupTextEl.classList.add('input-group-text');

      if (this._config.indicator) {
        inputGroupTextEl.innerHTML = `
        <span class="picker-input-group-indicator">
          <span class="picker-input-group-icon time-picker-input-icon"></span>
        </span>`;
      }

      if (this._config.cleaner) {
        inputGroupTextEl.innerHTML += `
        <span class="picker-input-group-cleaner" role="button">
          <span class="picker-input-group-icon time-picker-cleaner-icon"></span>
        </span>`;
      }

      if (this._config.indicator || this._config.cleaner) {
        inputGroupEl.append(inputGroupTextEl);
      }

      this._input = inputEl;
      return inputGroupEl;
    }

    _createTimePicker() {
      this._element.classList.add('time-picker');

      if (this._config.container === 'dropdown') {
        this._dropdownToggleEl.append(this._createInputGroup());

        this._dropdownMenuEl.prepend(this._createTimePickerBody());
      }

      if (this._config.container === 'inline') {
        this._element.append(this._createTimePickerBody());
      }
    }

    _createTimePickerBody() {
      const timePickerBodyEl = document.createElement('div');
      timePickerBodyEl.classList.add('time-picker-body');

      if (this._config.variant === 'roll') {
        timePickerBodyEl.classList.add('time-picker-roll');
      }

      this._timePickerBody = timePickerBodyEl;
      return timePickerBodyEl;
    }

    _createTimePickerSelection() {
      const selectedHour = this._date ? isAmPm(this._config.locale) ? convert24hTo12h(this._date.getHours()) : this._date.getHours() : null;
      const selectedMinute = this._date ? this._date.getMinutes() : null;
      const selectedSecond = this._date ? this._date.getSeconds() : null;

      if (this._config.variant === 'roll') {
        this._createTimePickerRoll(selectedHour, selectedMinute, selectedSecond);
      }

      if (this._config.variant === 'select') {
        this._createTimePickerSelect(selectedHour, selectedMinute, selectedSecond);
      }
    }

    _createSelect(className, options) {
      const selectEl = document.createElement('select');
      selectEl.classList.add('form-select', 'form-select-sm', className);
      selectEl.disabled = this._config.disabled;
      selectEl.addEventListener('change', event => this._handleTimeChange(className, event.target.value));
      options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.innerHTML = option.label;
        selectEl.append(optionEl);
      });
      return selectEl;
    }

    _createTimePickerSelect() {
      const timeSeparatorEl = document.createElement('div');
      timeSeparatorEl.classList.add('time-separator');
      timeSeparatorEl.innerHTML = ':';
      this._timePickerBody.innerHTML = '<span class="time-picker-inline-icon"></span>';

      this._timePickerBody.append(this._createSelect('hours', getListOfHours(this._config.locale)), timeSeparatorEl.cloneNode(true), this._createSelect('minutes', getListOfMinutes(this._config.locale, true)), timeSeparatorEl, this._createSelect('seconds', getListOfSeconds(this._config.locale, true)));

      if (isAmPm(this._config.locale)) {
        this._timePickerBody.append(this._createSelect('toggle', [{
          value: 'am',
          label: 'AM'
        }, {
          value: 'pm',
          label: 'PM'
        }], '_selectAmPm', this._ampm));
      }
    }

    _createTimePickerRoll() {
      this._timePickerBody.append(this._createTimePickerRollCol(getListOfHours(this._config.locale), 'hours'), this._createTimePickerRollCol(getListOfMinutes(this._config.locale), 'minutes'), this._createTimePickerRollCol(getListOfSeconds(this._config.locale), 'seconds'));

      if (isAmPm(this._config.locale)) {
        this._timePickerBody.append(this._createTimePickerRollCol([{
          value: 'am',
          label: 'AM'
        }, {
          value: 'pm',
          label: 'PM'
        }], 'toggle', this._ampm));
      }
    }

    _createTimePickerRollCol(options, part) {
      const timePickerRollColEl = document.createElement('div');
      timePickerRollColEl.classList.add('time-picker-roll-col');
      options.forEach(option => {
        const timePickerRollCellEl = document.createElement('div');
        timePickerRollCellEl.classList.add('time-picker-roll-cell');
        timePickerRollCellEl.setAttribute('role', 'button');
        timePickerRollCellEl.innerHTML = option.label;
        timePickerRollCellEl.addEventListener('click', () => {
          this._handleTimeChange(part, option.value);
        });
        Manipulator.setDataAttribute(timePickerRollCellEl, part, option.value);
        timePickerRollColEl.append(timePickerRollCellEl);
      });
      return timePickerRollColEl;
    }

    _getConfig(config) {
      config = { ...this.constructor.Default,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$f, config, DefaultType$e);
      return config;
    }

    _scrollTo(parent, children, initial = false) {
      parent.scrollTo({
        top: children.offsetTop,
        behavior: initial ? 'instant' : 'smooth'
      });
    }

    _updateTimePicker() {
      this._element.innerHTML = '';

      this._createTimePicker();
    } // Static


    static timePickerInterface(element, config) {
      const data = TimePicker.getOrCreateInstance(element, config);

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        const data = TimePicker.getOrCreateInstance(this);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }

  }
  /**
  * ------------------------------------------------------------------------
  * Data Api implementation
  * ------------------------------------------------------------------------
  */


  EventHandler.on(window, EVENT_LOAD_DATA_API$7, () => {
    const timePickers = SelectorEngine.find(SELECTOR_DATA_TOGGLE$6);

    for (let i = 0, len = timePickers.length; i < len; i++) {
      TimePicker.timePickerInterface(timePickers[i]);
    }
  });
  /**
  * ------------------------------------------------------------------------
  * jQuery
  * ------------------------------------------------------------------------
  * add .TimePicker to jQuery only if jQuery is present
  */

  defineJQueryPlugin(TimePicker);

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO (v4.2.0): date-range-picker.js
   * License (https://coreui.io/pro/license-new/)
   * --------------------------------------------------------------------------
   */
  /**
  * ------------------------------------------------------------------------
  * Constants
  * ------------------------------------------------------------------------
  */

  const NAME$e = 'date-range-picker';
  const DATA_KEY$d = 'coreui.date-range-picker';
  const EVENT_KEY$d = `.${DATA_KEY$d}`;
  const DATA_API_KEY$8 = '.data-api';
  const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY$d}`;
  const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY$d}`;
  const EVENT_LOAD_DATA_API$6 = `load${EVENT_KEY$d}${DATA_API_KEY$8}`;
  const SELECTOR_DATA_TOGGLE$5 = '[data-coreui-toggle="date-range-picker"]';
  const Default$d = { ...Picker.Default,
    calendars: 2,
    cleaner: true,
    calendarDate: null,
    date: null,
    disabled: false,
    disabledDates: null,
    endDate: null,
    firstDayOfWeek: 1,
    format: null,
    indicator: true,
    locale: 'default',
    maxDate: null,
    minDate: null,
    placeholder: ['Start date', 'End date'],
    range: true,
    ranges: {},
    rangesButtonsClasses: ['btn', 'btn-ghost-secondary'],
    separator: true,
    size: null,
    startDate: null,
    selectEndDate: false,
    timepicker: false,
    todayButton: 'Today',
    todayButtonClasses: ['btn', 'btn-sm', 'btn-primary', 'me-auto']
  };
  const DefaultType$d = { ...Picker.DefaultType,
    calendars: 'number',
    cleaner: 'boolean',
    calendarDate: '(date|string|null)',
    date: '(date|string|null)',
    disabledDates: '(array|null)',
    disabled: 'boolean',
    endDate: '(date|string|null)',
    firstDayOfWeek: 'number',
    format: '(string|null)',
    indicator: 'boolean',
    locale: 'string',
    maxDate: '(date|string|null)',
    minDate: '(date|string|null)',
    placeholder: '(array|string)',
    range: 'boolean',
    ranges: 'object',
    rangesButtonsClasses: '(array|string)',
    separator: 'boolean',
    size: '(string|null)',
    startDate: '(date|string|null)',
    selectEndDate: 'boolean',
    timepicker: 'boolean',
    todayButton: '(boolean|string)',
    todayButtonClasses: '(array|string)'
  };
  /**
  * ------------------------------------------------------------------------
  * Class Definition
  * ------------------------------------------------------------------------
  */

  class DateRangePicker extends Picker {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._calendarDate = this._convertStringToDate(this._config.calendarDate || this._config.date || this._config.startDate || new Date());
      this._startDate = this._convertStringToDate(this._config.date || this._config.startDate);
      this._endDate = this._convertStringToDate(this._config.endDate);
      this._initialStartDate = null;
      this._initialEndDate = null;
      this._mobile = window.innerWidth < 768;
      this._selectEndDate = this._config.selectEndDate; // nodes

      this._calendars = null;
      this._calendarStart = null;
      this._calendarEnd = null;
      this._dateRangePicker = null;
      this._endInput = null;
      this._startInput = null;
      this._timepickers = null;
      this._timePickerEnd = null;
      this._timePickerStart = null;

      this._createDateRangePicker();

      this._createCalendars();

      this._addEventListeners();

      this._addCalendarEventListeners();
    } // Getters


    static get Default() {
      return Default$d;
    }

    static get DefaultType() {
      return DefaultType$d;
    }

    static get NAME() {
      return NAME$e;
    } // Public


    cancel() {
      this._endDate = this._initialEndDate;
      this._endInput.value = this._setInputValue(this._initialEndDate);
      this._startDate = this._initialStartDate;
      this._startInput.value = this._setInputValue(this._initialStartDate);
      this._calendars.innerHTML = '';

      if (this._config.timepicker) {
        this._timepickers.innerHTML = '';
      }

      this._createCalendars();

      this._addCalendarEventListeners();
    }

    clear() {
      this._endDate = null;
      this._endInput.value = '';
      this._startDate = null;
      this._startInput.value = '';
      this._calendars.innerHTML = '';

      if (this._config.timepicker) {
        this._timepickers.innerHTML = '';
      }

      this._createCalendars();

      this._addCalendarEventListeners();
    }

    reset() {
      this._endDate = this._config.endDate;
      this._endInput.value = this._setInputValue(this._config.endDate);
      this._startDate = this._config.startDate;
      this._startInput.value = this._setInputValue(this._config.startDate);
      this._calendars.innerHTML = '';

      if (this._config.timepicker) {
        this._timepickers.innerHTML = '';
      }

      this._createCalendars();

      this._addCalendarEventListeners();
    }

    update(config) {
      this._config = this._getConfig(config);
      this._element.innerHTML = '';

      this._createDateRangePicker();

      this._createCalendars();

      this._addEventListeners();

      this._addCalendarEventListeners();
    } // Private


    _addEventListeners() {
      EventHandler.on(this._element, 'shown.coreui.dropdown', () => {
        this._initialStartDate = new Date(this._startDate);
        this._initialEndDate = new Date(this._endDate);
      });
      EventHandler.on(this._startInput, 'click', () => {
        this._dropdown.show();

        this._selectEndDate = false;

        this._updateCalendars();
      });
      EventHandler.on(this._startInput, 'input', event => {
        const date = this._config.format ? dateFns.parseISO(event.target.value) : getLocalDateFromString(event.target.value, this._config.locale, this._config.timepicker); // eslint-disable-next-line no-console

        console.log(dateFns.parseISO(event.target.value));

        if (date instanceof Date && date.getTime()) {
          this._startDate = date;
          this._calendarDate = date;

          this._updateCalendars();
        }
      });
      EventHandler.on(this._endInput, 'click', () => {
        this._dropdown.show();

        this._selectEndDate = true;

        this._updateCalendars();
      });
      EventHandler.on(this._endInput, 'input', event => {
        const date = this._config.format ? dateFns.parseISO(event.target.value) : getLocalDateFromString(event.target.value, this._config.locale, this._config.timepicker);

        if (date instanceof Date && date.getTime()) {
          this._endDate = date;
          this._calendarDate = date;

          this._updateCalendars();
        }
      });
      EventHandler.on(this._element, 'click', '.picker-input-group-cleaner', event => {
        event.stopPropagation();
        this.clear();
      });
      EventHandler.on(this._element, 'onCancelClick.coreui.picker', () => {
        this.cancel();
      });
      EventHandler.on(window, 'resize', () => {
        this._mobile = window.innerWidth < 768;
      });
    }

    _addCalendarEventListeners() {
      SelectorEngine.find('.calendar', this._element).forEach(calendar => {
        EventHandler.on(calendar, 'startDateChange.coreui.calendar', event => {
          this._startDate = event.date;
          this._selectEndDate = event.selectEndDate;
          this._startInput.value = this._setInputValue(event.date);

          this._updateCalendars();

          if (!this._config.range && !this._config.footer && !this._config.timepicker) {
            this._dropdown.hide();
          }

          EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, {
            date: event.date,
            formatedDate: event.date ? this._formatDate(event.date) : undefined
          });
        });
        EventHandler.on(calendar, 'endDateChange.coreui.calendar', event => {
          this._endDate = event.date;
          this._selectEndDate = event.selectEndDate;
          this._endInput.value = this._setInputValue(event.date);

          this._updateCalendars();

          if (this._startDate && !this._config.footer && !this._config.timepicker) {
            this._dropdown.hide();
          }

          EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, {
            date: event.date,
            formatedDate: event.date ? this._formatDate(event.date) : undefined
          });
        });
        EventHandler.on(calendar, 'cellHover.coreui.calendar', event => {
          if (this._selectEndDate) {
            this._endInput.value = event.date ? this._formatDate(event.date) : '';
            return;
          }

          this._startInput.value = event.date ? this._formatDate(event.date) : '';
        });
      });
    }

    _convertStringToDate(date) {
      return date ? date instanceof Date ? date : new Date(date) : null;
    }

    _createInput(placeholder, value) {
      const inputEl = document.createElement('input');
      inputEl.classList.add('form-control');
      inputEl.disabled = this._config.disabled;
      inputEl.placeholder = placeholder;
      inputEl.readOnly = this._config.inputReadOnly || typeof this._config.format === 'string';
      inputEl.type = 'text';
      inputEl.value = value;
      return inputEl;
    }

    _createInputGroup() {
      const inputGroupEl = document.createElement('div');
      inputGroupEl.classList.add('input-group', 'picker-input-group');

      if (this._config.size) {
        inputGroupEl.classList.add(`input-group-${this._config.size}`);
      }

      const startInputEl = this._createInput(this._getPlaceholder()[0], this._setInputValue(this._startDate));

      const endInputEl = this._createInput(this._getPlaceholder()[1], this._setInputValue(this._endDate));

      const inputGroupTextSeparatorEl = document.createElement('span');
      inputGroupTextSeparatorEl.classList.add('input-group-text');
      inputGroupTextSeparatorEl.innerHTML = '<span class="picker-input-group-icon date-picker-arrow-icon"></span>';
      const inputGroupTextEl = document.createElement('span');
      inputGroupTextEl.classList.add('input-group-text');

      if (this._config.indicator) {
        inputGroupTextEl.innerHTML = `
        <span class="picker-input-group-indicator">
          <span class="picker-input-group-icon time-picker-input-icon"></span>
        </span>`;
      }

      if (this._config.cleaner) {
        inputGroupTextEl.innerHTML += `
        <span class="picker-input-group-cleaner" role="button">
          <span class="picker-input-group-icon time-picker-cleaner-icon"></span>
        </span>`;
      }

      this._startInput = startInputEl;
      this._endInput = endInputEl;
      inputGroupEl.append(startInputEl);

      if (this._config.separator) {
        inputGroupEl.append(inputGroupTextSeparatorEl);
      }

      if (this._config.range) {
        inputGroupEl.append(endInputEl);
      }

      if (this._config.indicator || this._config.cleaner) {
        inputGroupEl.append(inputGroupTextEl);
      }

      return inputGroupEl;
    }

    _createCalendars() {
      const calendarEl = document.createElement('div');
      calendarEl.classList.add('date-picker-calendar');

      this._calendars.append(calendarEl); // eslint-disable-next-line no-new


      new Calendar(calendarEl, {
        calendarDate: new Date(this._calendarDate.getFullYear(), this._calendarDate.getMonth(), 1),
        calendars: this._config.calendars,
        disabledDates: this._config.disabledDates,
        endDate: this._endDate,
        firstDayOfWeek: this._config.firstDayOfWeek,
        locale: this._config.locale,
        maxDate: this._config.maxDate,
        minDate: this._config.minDate,
        range: this._config.range,
        selectEndDate: this._selectEndDate,
        startDate: this._startDate
      });
      EventHandler.one(calendarEl, 'calendarDateChange.coreui.calendar', event => {
        this._calendarDate = new Date(event.date.getFullYear(), event.date.getMonth(), 1);

        this._updateCalendars();
      });

      if (this._config.timepicker) {
        if (this._mobile || this._range && this._config.calendars === 1) {
          const timePickerStartEl = document.createElement('div');
          timePickerStartEl.classList.add('time-picker'); // eslint-disable-next-line no-new

          new TimePicker(timePickerStartEl, {
            container: 'inline',
            disabled: !this._startDate,
            locale: this._config.locale,
            time: this._startDate,
            variant: 'select'
          });
          calendarEl.append(timePickerStartEl);
          EventHandler.one(timePickerStartEl, 'timeChange.coreui.time-picker', event => {
            this._startDate = event.date;
            this._startInput.value = this._setInputValue(this._startDate);

            this._updateCalendars();
          });
          const timePickerEndEl = document.createElement('div');
          timePickerEndEl.classList.add('time-picker'); // eslint-disable-next-line no-new

          new TimePicker(timePickerEndEl, {
            container: 'inline',
            disabled: !this._endDate,
            locale: this._config.locale,
            time: this._endDate,
            variant: 'select'
          });

          this._timepickers.append(timePickerEndEl);

          EventHandler.one(timePickerEndEl, 'timeChange.coreui.time-picker', event => {
            this._endDate = event.date;
            this._endInput.value = this._setInputValue(this._endDate);

            this._updateCalendars();
          });
        } else {
          Array.from({
            length: this._config.calendars
          }).forEach((_, index) => {
            const timePickerEl = document.createElement('div');
            timePickerEl.classList.add('time-picker'); // eslint-disable-next-line no-new

            new TimePicker(timePickerEl, {
              container: 'inline',
              disabled: index === 0 ? !this._startDate : !this._endDate,
              locale: this._config.locale,
              time: index === 0 ? this._startDate : this._endDate,
              variant: 'select'
            });

            this._timepickers.append(timePickerEl);

            EventHandler.one(timePickerEl, 'timeChange.coreui.time-picker', event => {
              if (index === 0) {
                this._startDate = event.date;
                this._startInput.value = this._setInputValue(this._startDate);
              } else {
                this._endDate = event.date;
                this._endInput.value = this._setInputValue(this._endDate);
              }

              this._updateCalendars();
            });
          });
        }
      }
    }

    _createDateRangePicker() {
      this._element.classList.add('date-picker');

      this._dropdownToggleEl.append(this._createInputGroup());

      this._dropdownMenuEl.prepend(this._createDateRangePickerBody());
    }

    _createDateRangePickerBody() {
      const dateRangePickerBodyEl = document.createElement('div');
      dateRangePickerBodyEl.classList.add('date-picker-body');

      if (Object.keys(this._config.ranges).length) {
        const dateRangePickerRangesEl = document.createElement('div');
        dateRangePickerRangesEl.classList.add('date-picker-ranges');
        Object.keys(this._config.ranges).forEach(key => {
          const buttonEl = document.createElement('button');
          buttonEl.classList.add(...this._getButtonClasses(this._config.rangesButtonsClasses));
          buttonEl.role = 'button';
          buttonEl.addEventListener('click', () => {
            this._startDate = this._config.ranges[key][0];
            this._endDate = this._config.ranges[key][1];
            this._startInput.value = this._setInputValue(this._startDate);
            this._endInput.value = this._setInputValue(this._endDate);

            this._updateCalendars();
          });
          buttonEl.innerHTML = key;
          dateRangePickerRangesEl.append(buttonEl);
        });
        dateRangePickerBodyEl.append(dateRangePickerRangesEl);
      }

      const calendarsEl = document.createElement('div');
      calendarsEl.classList.add('date-picker-calendars');
      this._calendars = calendarsEl;
      dateRangePickerBodyEl.append(calendarsEl);

      if (this._config.timepicker) {
        const timepickersEl = document.createElement('div');
        timepickersEl.classList.add('date-picker-timepickers');
        this._timepickers = timepickersEl;
        dateRangePickerBodyEl.append(timepickersEl);
      }

      return dateRangePickerBodyEl;
    }

    _createFooterContent() {
      if (this._config.todayButton) {
        const todayButtonEl = document.createElement('button');
        todayButtonEl.classList.add(...this._getButtonClasses(this._config.todayButtonClasses));
        todayButtonEl.type = 'button';
        todayButtonEl.innerHTML = this._config.todayButton;
        todayButtonEl.addEventListener('click', () => {
          const date = new Date();
          this._calendarDate = date;
          this._startDate = date;
          this._endDate = date;
          this._endInput.value = this._setInputValue(date);
          this._startInput.value = this._setInputValue(date);

          this._updateCalendars();
        });
        return todayButtonEl;
      }
    }

    _formatDate(date) {
      if (this._config.format) {
        return dateFns.format(date, this._config.format);
      }

      if (this._config.timepicker) {
        return date.toLocaleString(this._config.locale);
      }

      return date.toLocaleDateString(this._config.locale);
    }

    _setInputValue(date) {
      if (date) {
        return this._formatDate(date);
      }

      return '';
    }

    _updateCalendars() {
      this._calendars.innerHTML = '';

      if (this._config.timepicker) {
        this._timepickers.innerHTML = '';
      }

      this._createCalendars();

      this._addCalendarEventListeners();
    }

    _getConfig(config) {
      config = { ...this.constructor.Default,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$e, config, DefaultType$d);
      return config;
    }

    _getPlaceholder() {
      const {
        placeholder
      } = this._config;

      if (typeof placeholder === 'string') {
        return placeholder.split(',');
      }

      return placeholder;
    } // Static


    static dateRangePickerInterface(element, config) {
      const data = DateRangePicker.getOrCreateInstance(element, config);

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        const data = DateRangePicker.getOrCreateInstance(this);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }

  }
  /**
  * ------------------------------------------------------------------------
  * Data Api implementation
  * ------------------------------------------------------------------------
  */


  EventHandler.on(window, EVENT_LOAD_DATA_API$6, () => {
    const dateRangePickers = SelectorEngine.find(SELECTOR_DATA_TOGGLE$5);

    for (let i = 0, len = dateRangePickers.length; i < len; i++) {
      DateRangePicker.dateRangePickerInterface(dateRangePickers[i]);
    }
  });
  /**
  * ------------------------------------------------------------------------
  * jQuery
  * ------------------------------------------------------------------------
  * add .DateRangePicker to jQuery only if jQuery is present
  */

  defineJQueryPlugin(DateRangePicker);

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO (v4.2.0): date-picker.js
   * License (https://coreui.io/pro/license-new/)
   * --------------------------------------------------------------------------
   */
  /**
  * ------------------------------------------------------------------------
  * Constants
  * ------------------------------------------------------------------------
  */

  const NAME$d = 'date-picker';
  const DATA_KEY$c = 'coreui.date-picker';
  const EVENT_KEY$c = `.${DATA_KEY$c}`;
  const DATA_API_KEY$7 = '.data-api';
  const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY$c}`;
  const EVENT_LOAD_DATA_API$5 = `load${EVENT_KEY$c}${DATA_API_KEY$7}`;
  const SELECTOR_DATA_TOGGLE$4 = '[data-coreui-toggle="date-picker"]';
  const Default$c = { ...DateRangePicker.Default,
    calendars: 1,
    placeholder: ['Select date'],
    range: false,
    separator: false
  };
  const DefaultType$c = { ...DateRangePicker.DefaultType,
    date: '(date|string|null)'
  };
  /**
  * ------------------------------------------------------------------------
  * Class Definition
  * ------------------------------------------------------------------------
  */

  class DatePicker extends DateRangePicker {
    // Getters
    static get Default() {
      return Default$c;
    }

    static get DefaultType() {
      return DefaultType$c;
    }

    static get NAME() {
      return NAME$d;
    } // Overrides


    _addCalendarEventListeners() {
      super._addCalendarEventListeners();

      SelectorEngine.find('.calendar', this._element).forEach(calendar => {
        EventHandler.on(calendar, 'startDateChange.coreui.calendar', event => {
          this._startDate = event.date;
          this._selectEndDate = event.selectEndDate;
          this._startInput.value = this._setInputValue(event.date);

          this._updateCalendars();

          EventHandler.trigger(this._element, EVENT_DATE_CHANGE, {
            date: event.date,
            formatedDate: event.date ? this._formatDate(event.date) : undefined
          });
        });
      });
    } // Static


    static datePickerInterface(element, config) {
      const data = DatePicker.getOrCreateInstance(element, config);

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        const data = DatePicker.getOrCreateInstance(this);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }

  }
  /**
  * ------------------------------------------------------------------------
  * Data Api implementation
  * ------------------------------------------------------------------------
  */


  EventHandler.on(window, EVENT_LOAD_DATA_API$5, () => {
    const datePickers = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);

    for (let i = 0, len = datePickers.length; i < len; i++) {
      DatePicker.datePickerInterface(datePickers[i]);
    }
  });
  /**
  * ------------------------------------------------------------------------
  * jQuery
  * ------------------------------------------------------------------------
  * add .DatePicker to jQuery only if jQuery is present
  */

  defineJQueryPlugin(DatePicker);

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO (v4.2.0): loading-button.js
   * License (https://coreui.io/pro/license-new/)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$c = 'loading-button';
  const DATA_KEY$b = 'coreui.loading-button';
  const EVENT_KEY$b = `.${DATA_KEY$b}`;
  const EVENT_START = `start${EVENT_KEY$b}`;
  const EVENT_STOP = `stop${EVENT_KEY$b}`;
  const CLASS_NAME_IS_LOADING = 'is-loading';
  const CLASS_NAME_LOADING_BUTTON_SPINNER = 'btn-loading-spinner';
  const Default$b = {
    disabledOnLoading: false,
    spinner: true,
    spinnerType: 'border',
    timeout: false
  };
  const DefaultType$b = {
    disabledOnLoading: 'boolean',
    spinner: 'boolean',
    spinnerType: 'string',
    timeout: '(boolean|number)'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class LoadingButton extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._timeout = this._config.timeout;
      this._spinner = null;
      this._state = 'idle';

      if (this._element) {
        Data.set(element, DATA_KEY$b, this);
      }
    } // Getters


    static get Default() {
      return Default$b;
    }

    static get DefaultType() {
      return DefaultType$b;
    }

    static get DATA_KEY() {
      return DATA_KEY$b;
    }

    static get NAME() {
      return NAME$c;
    } // Public


    start() {
      if (this._state !== 'loading') {
        this._createSpinner();

        this._state = 'loading';
        setTimeout(() => {
          this._element.classList.add(CLASS_NAME_IS_LOADING);

          EventHandler.trigger(this._element, EVENT_START);

          if (this._config.disabledOnLoading) {
            this._element.setAttribute('disabled', true);
          }
        }, 1);

        if (this._config.timeout) {
          setTimeout(() => {
            this.stop();
          }, this._config.timeout);
        }
      }
    }

    stop() {
      this._element.classList.remove(CLASS_NAME_IS_LOADING);

      const stoped = () => {
        this._removeSpinner();

        this._state = 'idle';

        if (this._config.disabledOnLoading) {
          this._element.removeAttribute('disabled');
        }

        EventHandler.trigger(this._element, EVENT_STOP);
      };

      if (this._spinner) {
        this._queueCallback(stoped, this._spinner, true);

        return;
      }

      stoped();
    }

    dispose() {
      Data.removeData(this._element, DATA_KEY$b);
      this._element = null;
    }

    _getConfig(config) {
      config = { ...Default$b,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$c, config, DefaultType$b);
      return config;
    }

    _createSpinner() {
      if (this._config.spinner) {
        const spinner = document.createElement('span');
        const type = this._config.spinnerType;
        spinner.classList.add(CLASS_NAME_LOADING_BUTTON_SPINNER, `spinner-${type}`, `spinner-${type}-sm`);
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-hidden', 'true');

        this._element.insertBefore(spinner, this._element.firstChild);

        this._spinner = spinner;
      }
    }

    _removeSpinner() {
      if (this._config.spinner) {
        this._spinner.remove();

        this._spinner = null;
      }
    } // Static


    static loadingButtonInterface(element, config) {
      const data = LoadingButton.getOrCreateInstance(element, config);

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        LoadingButton.loadingButtonInterface(this, config);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .LoadingButton to jQuery only if jQuery is present
   */


  defineJQueryPlugin(LoadingButton);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/scrollBar.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
  const SELECTOR_STICKY_CONTENT = '.sticky-top';

  class ScrollBarHelper {
    constructor() {
      this._element = document.body;
    }

    getWidth() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
      const documentWidth = document.documentElement.clientWidth;
      return Math.abs(window.innerWidth - documentWidth);
    }

    hide() {
      const width = this.getWidth();

      this._disableOverFlow(); // give padding to element to balance the hidden scrollbar width


      this._setElementAttributes(this._element, 'paddingRight', calculatedValue => calculatedValue + width); // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth


      this._setElementAttributes(SELECTOR_FIXED_CONTENT, 'paddingRight', calculatedValue => calculatedValue + width);

      this._setElementAttributes(SELECTOR_STICKY_CONTENT, 'marginRight', calculatedValue => calculatedValue - width);
    }

    _disableOverFlow() {
      this._saveInitialAttribute(this._element, 'overflow');

      this._element.style.overflow = 'hidden';
    }

    _setElementAttributes(selector, styleProp, callback) {
      const scrollbarWidth = this.getWidth();

      const manipulationCallBack = element => {
        if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
          return;
        }

        this._saveInitialAttribute(element, styleProp);

        const calculatedValue = window.getComputedStyle(element)[styleProp];
        element.style[styleProp] = `${callback(Number.parseFloat(calculatedValue))}px`;
      };

      this._applyManipulationCallback(selector, manipulationCallBack);
    }

    reset() {
      this._resetElementAttributes(this._element, 'overflow');

      this._resetElementAttributes(this._element, 'paddingRight');

      this._resetElementAttributes(SELECTOR_FIXED_CONTENT, 'paddingRight');

      this._resetElementAttributes(SELECTOR_STICKY_CONTENT, 'marginRight');
    }

    _saveInitialAttribute(element, styleProp) {
      const actualValue = element.style[styleProp];

      if (actualValue) {
        Manipulator.setDataAttribute(element, styleProp, actualValue);
      }
    }

    _resetElementAttributes(selector, styleProp) {
      const manipulationCallBack = element => {
        const value = Manipulator.getDataAttribute(element, styleProp);

        if (typeof value === 'undefined') {
          element.style.removeProperty(styleProp);
        } else {
          Manipulator.removeDataAttribute(element, styleProp);
          element.style[styleProp] = value;
        }
      };

      this._applyManipulationCallback(selector, manipulationCallBack);
    }

    _applyManipulationCallback(selector, callBack) {
      if (isElement(selector)) {
        callBack(selector);
      } else {
        SelectorEngine.find(selector, this._element).forEach(callBack);
      }
    }

    isOverflowing() {
      return this.getWidth() > 0;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/backdrop.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const Default$a = {
    className: 'modal-backdrop',
    isVisible: true,
    // if false, we use the backdrop helper without adding any element to the dom
    isAnimated: false,
    rootElement: 'body',
    // give the choice to place backdrop under different elements
    clickCallback: null
  };
  const DefaultType$a = {
    className: 'string',
    isVisible: 'boolean',
    isAnimated: 'boolean',
    rootElement: '(element|string)',
    clickCallback: '(function|null)'
  };
  const NAME$b = 'backdrop';
  const CLASS_NAME_FADE$4 = 'fade';
  const CLASS_NAME_SHOW$8 = 'show';
  const EVENT_MOUSEDOWN = `mousedown.coreui.${NAME$b}`;

  class Backdrop {
    constructor(config) {
      this._config = this._getConfig(config);
      this._isAppended = false;
      this._element = null;
    }

    show(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }

      this._append();

      if (this._config.isAnimated) {
        reflow(this._getElement());
      }

      this._getElement().classList.add(CLASS_NAME_SHOW$8);

      this._emulateAnimation(() => {
        execute(callback);
      });
    }

    hide(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }

      this._getElement().classList.remove(CLASS_NAME_SHOW$8);

      this._emulateAnimation(() => {
        this.dispose();
        execute(callback);
      });
    } // Private


    _getElement() {
      if (!this._element) {
        const backdrop = document.createElement('div');
        backdrop.className = this._config.className;

        if (this._config.isAnimated) {
          backdrop.classList.add(CLASS_NAME_FADE$4);
        }

        this._element = backdrop;
      }

      return this._element;
    }

    _getConfig(config) {
      config = { ...Default$a,
        ...(typeof config === 'object' ? config : {})
      }; // use getElement() with the default "body" to get a fresh Element on each instantiation

      config.rootElement = getElement(config.rootElement);
      typeCheckConfig(NAME$b, config, DefaultType$a);
      return config;
    }

    _append() {
      if (this._isAppended) {
        return;
      }

      this._config.rootElement.append(this._getElement());

      EventHandler.on(this._getElement(), EVENT_MOUSEDOWN, () => {
        execute(this._config.clickCallback);
      });
      this._isAppended = true;
    }

    dispose() {
      if (!this._isAppended) {
        return;
      }

      EventHandler.off(this._element, EVENT_MOUSEDOWN);

      this._element.remove();

      this._isAppended = false;
    }

    _emulateAnimation(callback) {
      executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/focustrap.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const Default$9 = {
    trapElement: null,
    // The element to trap focus inside of
    autofocus: true
  };
  const DefaultType$9 = {
    trapElement: 'element',
    autofocus: 'boolean'
  };
  const NAME$a = 'focustrap';
  const DATA_KEY$a = 'coreui.focustrap';
  const EVENT_KEY$a = `.${DATA_KEY$a}`;
  const EVENT_FOCUSIN$1 = `focusin${EVENT_KEY$a}`;
  const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$a}`;
  const TAB_KEY$1 = 'Tab';
  const TAB_NAV_FORWARD = 'forward';
  const TAB_NAV_BACKWARD = 'backward';

  class FocusTrap {
    constructor(config) {
      this._config = this._getConfig(config);
      this._isActive = false;
      this._lastTabNavDirection = null;
    }

    activate() {
      const {
        trapElement,
        autofocus
      } = this._config;

      if (this._isActive) {
        return;
      }

      if (autofocus) {
        trapElement.focus();
      }

      EventHandler.off(document, EVENT_KEY$a); // guard against infinite focus loop

      EventHandler.on(document, EVENT_FOCUSIN$1, event => this._handleFocusin(event));
      EventHandler.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event));
      this._isActive = true;
    }

    deactivate() {
      if (!this._isActive) {
        return;
      }

      this._isActive = false;
      EventHandler.off(document, EVENT_KEY$a);
    } // Private


    _handleFocusin(event) {
      const {
        target
      } = event;
      const {
        trapElement
      } = this._config;

      if (target === document || target === trapElement || trapElement.contains(target)) {
        return;
      }

      const elements = SelectorEngine.focusableChildren(trapElement);

      if (elements.length === 0) {
        trapElement.focus();
      } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
    }

    _handleKeydown(event) {
      if (event.key !== TAB_KEY$1) {
        return;
      }

      this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
    }

    _getConfig(config) {
      config = { ...Default$9,
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$a, config, DefaultType$9);
      return config;
    }

  }

  /**
   * --------------------------------------------------------------------------
    * CoreUI (v4.2.0): modal.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's modal.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$9 = 'modal';
  const DATA_KEY$9 = 'coreui.modal';
  const EVENT_KEY$9 = `.${DATA_KEY$9}`;
  const DATA_API_KEY$6 = '.data-api';
  const ESCAPE_KEY$1 = 'Escape';
  const Default$8 = {
    backdrop: true,
    keyboard: true,
    focus: true
  };
  const DefaultType$8 = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    focus: 'boolean'
  };
  const EVENT_HIDE$5 = `hide${EVENT_KEY$9}`;
  const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$9}`;
  const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$9}`;
  const EVENT_SHOW$5 = `show${EVENT_KEY$9}`;
  const EVENT_SHOWN$5 = `shown${EVENT_KEY$9}`;
  const EVENT_RESIZE$1 = `resize${EVENT_KEY$9}`;
  const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$9}`;
  const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$9}`;
  const EVENT_MOUSEUP_DISMISS = `mouseup.dismiss${EVENT_KEY$9}`;
  const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$9}`;
  const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$9}${DATA_API_KEY$6}`;
  const CLASS_NAME_OPEN = 'modal-open';
  const CLASS_NAME_FADE$3 = 'fade';
  const CLASS_NAME_SHOW$7 = 'show';
  const CLASS_NAME_STATIC = 'modal-static';
  const OPEN_SELECTOR$1 = '.modal.show';
  const SELECTOR_DIALOG = '.modal-dialog';
  const SELECTOR_MODAL_BODY = '.modal-body';
  const SELECTOR_DATA_TOGGLE$3 = '[data-coreui-toggle="modal"]';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Modal extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._isShown = false;
      this._ignoreBackdropClick = false;
      this._isTransitioning = false;
      this._scrollBar = new ScrollBarHelper();
    } // Getters


    static get Default() {
      return Default$8;
    }

    static get NAME() {
      return NAME$9;
    } // Public


    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }

    show(relatedTarget) {
      if (this._isShown || this._isTransitioning) {
        return;
      }

      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, {
        relatedTarget
      });

      if (showEvent.defaultPrevented) {
        return;
      }

      this._isShown = true;

      if (this._isAnimated()) {
        this._isTransitioning = true;
      }

      this._scrollBar.hide();

      document.body.classList.add(CLASS_NAME_OPEN);

      this._adjustDialog();

      this._setEscapeEvent();

      this._setResizeEvent();

      EventHandler.on(this._dialog, EVENT_MOUSEDOWN_DISMISS, () => {
        EventHandler.one(this._element, EVENT_MOUSEUP_DISMISS, event => {
          if (event.target === this._element) {
            this._ignoreBackdropClick = true;
          }
        });
      });

      this._showBackdrop(() => this._showElement(relatedTarget));
    }

    hide() {
      if (!this._isShown || this._isTransitioning) {
        return;
      }

      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5);

      if (hideEvent.defaultPrevented) {
        return;
      }

      this._isShown = false;

      const isAnimated = this._isAnimated();

      if (isAnimated) {
        this._isTransitioning = true;
      }

      this._setEscapeEvent();

      this._setResizeEvent();

      this._focustrap.deactivate();

      this._element.classList.remove(CLASS_NAME_SHOW$7);

      EventHandler.off(this._element, EVENT_CLICK_DISMISS);
      EventHandler.off(this._dialog, EVENT_MOUSEDOWN_DISMISS);

      this._queueCallback(() => this._hideModal(), this._element, isAnimated);
    }

    dispose() {
      [window, this._dialog].forEach(htmlElement => EventHandler.off(htmlElement, EVENT_KEY$9));

      this._backdrop.dispose();

      this._focustrap.deactivate();

      super.dispose();
    }

    handleUpdate() {
      this._adjustDialog();
    } // Private


    _initializeBackDrop() {
      return new Backdrop({
        isVisible: Boolean(this._config.backdrop),
        // 'static' option will be translated to true, and booleans will keep their value
        isAnimated: this._isAnimated()
      });
    }

    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }

    _getConfig(config) {
      config = { ...Default$8,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$9, config, DefaultType$8);
      return config;
    }

    _showElement(relatedTarget) {
      const isAnimated = this._isAnimated();

      const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);

      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
        // Don't move modal's DOM position
        document.body.append(this._element);
      }

      this._element.style.display = 'block';

      this._element.removeAttribute('aria-hidden');

      this._element.setAttribute('aria-modal', true);

      this._element.setAttribute('role', 'dialog');

      this._element.scrollTop = 0;

      if (modalBody) {
        modalBody.scrollTop = 0;
      }

      if (isAnimated) {
        reflow(this._element);
      }

      this._element.classList.add(CLASS_NAME_SHOW$7);

      const transitionComplete = () => {
        if (this._config.focus) {
          this._focustrap.activate();
        }

        this._isTransitioning = false;
        EventHandler.trigger(this._element, EVENT_SHOWN$5, {
          relatedTarget
        });
      };

      this._queueCallback(transitionComplete, this._dialog, isAnimated);
    }

    _setEscapeEvent() {
      if (this._isShown) {
        EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, event => {
          if (this._config.keyboard && event.key === ESCAPE_KEY$1) {
            event.preventDefault();
            this.hide();
          } else if (!this._config.keyboard && event.key === ESCAPE_KEY$1) {
            this._triggerBackdropTransition();
          }
        });
      } else {
        EventHandler.off(this._element, EVENT_KEYDOWN_DISMISS$1);
      }
    }

    _setResizeEvent() {
      if (this._isShown) {
        EventHandler.on(window, EVENT_RESIZE$1, () => this._adjustDialog());
      } else {
        EventHandler.off(window, EVENT_RESIZE$1);
      }
    }

    _hideModal() {
      this._element.style.display = 'none';

      this._element.setAttribute('aria-hidden', true);

      this._element.removeAttribute('aria-modal');

      this._element.removeAttribute('role');

      this._isTransitioning = false;

      this._backdrop.hide(() => {
        document.body.classList.remove(CLASS_NAME_OPEN);

        this._resetAdjustments();

        this._scrollBar.reset();

        EventHandler.trigger(this._element, EVENT_HIDDEN$5);
      });
    }

    _showBackdrop(callback) {
      EventHandler.on(this._element, EVENT_CLICK_DISMISS, event => {
        if (this._ignoreBackdropClick) {
          this._ignoreBackdropClick = false;
          return;
        }

        if (event.target !== event.currentTarget) {
          return;
        }

        if (this._config.backdrop === true) {
          this.hide();
        } else if (this._config.backdrop === 'static') {
          this._triggerBackdropTransition();
        }
      });

      this._backdrop.show(callback);
    }

    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_FADE$3);
    }

    _triggerBackdropTransition() {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);

      if (hideEvent.defaultPrevented) {
        return;
      }

      const {
        classList,
        scrollHeight,
        style
      } = this._element;
      const isModalOverflowing = scrollHeight > document.documentElement.clientHeight; // return if the following background transition hasn't yet completed

      if (!isModalOverflowing && style.overflowY === 'hidden' || classList.contains(CLASS_NAME_STATIC)) {
        return;
      }

      if (!isModalOverflowing) {
        style.overflowY = 'hidden';
      }

      classList.add(CLASS_NAME_STATIC);

      this._queueCallback(() => {
        classList.remove(CLASS_NAME_STATIC);

        if (!isModalOverflowing) {
          this._queueCallback(() => {
            style.overflowY = '';
          }, this._dialog);
        }
      }, this._dialog);

      this._element.focus();
    } // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // ----------------------------------------------------------------------


    _adjustDialog() {
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

      const scrollbarWidth = this._scrollBar.getWidth();

      const isBodyOverflowing = scrollbarWidth > 0;

      if (!isBodyOverflowing && isModalOverflowing && !isRTL() || isBodyOverflowing && !isModalOverflowing && isRTL()) {
        this._element.style.paddingLeft = `${scrollbarWidth}px`;
      }

      if (isBodyOverflowing && !isModalOverflowing && !isRTL() || !isBodyOverflowing && isModalOverflowing && isRTL()) {
        this._element.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    } // Static


    static jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        const data = Modal.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](relatedTarget);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_TOGGLE$3, function (event) {
    const target = getElementFromSelector(this);

    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }

    EventHandler.one(target, EVENT_SHOW$5, showEvent => {
      if (showEvent.defaultPrevented) {
        // only register focus restorer if modal will actually get shown
        return;
      }

      EventHandler.one(target, EVENT_HIDDEN$5, () => {
        if (isVisible(this)) {
          this.focus();
        }
      });
    }); // avoid conflict when clicking moddal toggler while another one is open

    const allReadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);

    if (allReadyOpen) {
      Modal.getInstance(allReadyOpen).hide();
    }

    const data = Modal.getOrCreateInstance(target);
    data.toggle(this);
  });
  enableDismissTrigger(Modal);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Modal to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Modal);

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO (v4.2.0): multi-select.js
   * License (https://coreui.io/pro/license-new/)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$8 = 'multi-select';
  const DATA_KEY$8 = 'coreui.multi-select';
  const EVENT_KEY$8 = `.${DATA_KEY$8}`;
  const DATA_API_KEY$5 = '.data-api';
  const TAB_KEY = 'Tab';
  const RIGHT_MOUSE_BUTTON = 2;
  const SELECTOR_INPUT = '.form-multi-select-search';
  const SELECTOR_OPTGROUP = '.form-multi-select-optgroup';
  const SELECTOR_OPTION = '.form-multi-select-option';
  const SELECTOR_OPTIONS = '.form-multi-select-options';
  const SELECTOR_OPTIONS_EMPTY = '.form-multi-select-options-empty';
  const SELECTOR_SELECT = '.form-multi-select';
  const SELECTOR_SELECTION = '.form-multi-select-selection';
  const SELECTOR_SELECTION_CLEANER = '.form-multi-select-selection-cleaner';
  const EVENT_CHANGED = `changed${EVENT_KEY$8}`;
  const EVENT_CLICK = `click${EVENT_KEY$8}`;
  const EVENT_HIDE$4 = `hide${EVENT_KEY$8}`;
  const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$8}`;
  const EVENT_KEYDOWN = `keydown${EVENT_KEY$8}`;
  const EVENT_KEYUP = `keyup${EVENT_KEY$8}`;
  const EVENT_SEARCH = `search${EVENT_KEY$8}`;
  const EVENT_SHOW$4 = `show${EVENT_KEY$8}`;
  const EVENT_SHOWN$4 = `showN${EVENT_KEY$8}`;
  const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const EVENT_LOAD_DATA_API$4 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const CLASS_NAME_DISABLED = 'disabled';
  const CLASS_NAME_SELECT = 'form-multi-select';
  const CLASS_NAME_SELECT_DROPDOWN = 'form-multi-select-dropdown';
  const CLASS_NAME_SELECT_MULTIPLE = 'form-multi-select-multiple';
  const CLASS_NAME_SELECT_WITH_CLEANER = 'form-multi-select-with-cleaner';
  const CLASS_NAME_SELECT_ALL = 'form-multi-select-all';
  const CLASS_NAME_OPTGROUP = 'form-multi-select-optgroup';
  const CLASS_NAME_OPTGROUP_LABEL = 'form-multi-select-optgroup-label';
  const CLASS_NAME_OPTION = 'form-multi-select-option';
  const CLASS_NAME_OPTION_WITH_CHECKBOX = 'form-multi-select-option-with-checkbox';
  const CLASS_NAME_OPTIONS = 'form-multi-select-options';
  const CLASS_NAME_OPTIONS_EMPTY = 'form-multi-select-options-empty';
  const CLASS_NAME_SEARCH = 'form-multi-select-search';
  const CLASS_NAME_SELECTED = 'form-multi-selected';
  const CLASS_NAME_SELECTION = 'form-multi-select-selection';
  const CLASS_NAME_SELECTION_CLEANER = 'form-multi-select-selection-cleaner';
  const CLASS_NAME_SELECTION_TAGS = 'form-multi-select-selection-tags';
  const CLASS_NAME_SHOW$6 = 'show';
  const CLASS_NAME_TAG = 'form-multi-select-tag';
  const CLASS_NAME_TAG_DELETE = 'form-multi-select-tag-delete';
  const CLASS_NAME_LABEL = 'label';
  const Default$7 = {
    cleaner: true,
    multiple: true,
    placeholder: 'Select...',
    options: false,
    optionsMaxHeight: 'auto',
    optionsStyle: 'checkbox',
    search: false,
    searchNoResultsLabel: 'No results found',
    selectAll: true,
    selectAllLabel: 'Select all options',
    selectionType: 'tags',
    selectionTypeCounterText: 'item(s) selected'
  };
  const DefaultType$7 = {
    cleaner: 'boolean',
    multiple: 'boolean',
    placeholder: 'string',
    options: '(boolean|array)',
    optionsMaxHeight: '(number|string)',
    optionsStyle: 'string',
    search: 'boolean',
    searchNoResultsLabel: 'string',
    selectAll: 'boolean',
    selectAllLabel: 'string',
    selectionType: 'string',
    selectionTypeCounterText: 'string'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class MultiSelect extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._selectAllElement = null;
      this._selectionElement = null;
      this._selectionCleanerElement = null;
      this._searchElement = null;
      this._optionsElement = null;
      this._config = this._getConfig(config);
      this._clone = null;
      this._options = this._getOptions();
      this._search = '';
      this._selection = this._getSelectedOptions(this._options);

      if (this._config.options.length > 0) {
        this._createNativeSelect(this._config.options);
      }

      this._createSelect();

      this._addEventListeners();

      Data.set(this._element, DATA_KEY$8, this);
    } // Getters


    static get Default() {
      return Default$7;
    }

    static get DefaultType() {
      return DefaultType$7;
    }

    static get DATA_KEY() {
      return DATA_KEY$8;
    }

    static get NAME() {
      return NAME$8;
    } // Public


    show() {
      EventHandler.trigger(this._element, EVENT_SHOW$4);

      this._clone.classList.add(CLASS_NAME_SHOW$6);

      if (this._config.search) {
        SelectorEngine.findOne(SELECTOR_INPUT, this._clone).focus();
      }

      EventHandler.trigger(this._element, EVENT_SHOWN$4);
    }

    hide() {
      EventHandler.trigger(this._element, EVENT_HIDE$4);

      this._clone.classList.remove(CLASS_NAME_SHOW$6);

      EventHandler.trigger(this._element, EVENT_HIDDEN$4);
    }

    search(text) {
      this._search = text.length > 0 ? text.toLowerCase() : text;

      this._filterOptionsList();

      EventHandler.trigger(this._element, EVENT_SEARCH);
    }

    update(config) {
      this._config = this._getConfig(config);
      this._options = this._getOptions();
      this._selection = this._getSelectedOptions(this._options);

      this._clone.remove();

      this._element.innerHTML = '';

      this._createNativeOptions(this._element, this._options);

      this._createSelect();

      this._addEventListeners();
    }

    selectAll(options = this._options) {
      options.forEach(option => {
        if (option.disabled) {
          return;
        }

        if (option.label) {
          this.selectAll(option.options);
          return;
        }

        this._selectOption(option.value, option.text);
      });
    }

    deselectAll(options = this._options) {
      options.forEach(option => {
        if (option.disabled) {
          return;
        }

        if (option.label) {
          this.deselectAll(option.options);
          return;
        }

        this._deselectOption(option.value);
      });
    }

    getValue() {
      return this._selection;
    } // Private


    _addEventListeners() {
      EventHandler.on(this._clone, EVENT_CLICK, () => {
        this.show();
      });
      EventHandler.on(this._searchElement, EVENT_KEYUP, () => {
        this._onSearchChange(this._searchElement);
      });
      EventHandler.on(this._searchElement, EVENT_KEYDOWN, event => {
        const key = event.keyCode || event.charCode;

        if ((key === 8 || key === 46) && event.target.value.length === 0) {
          this._deselectLastOption();
        }
      });
      EventHandler.on(this._selectAllElement, EVENT_CLICK, event => {
        event.preventDefault();
        event.stopPropagation();
        this.selectAll();
      });
      EventHandler.on(this._optionsElement, EVENT_CLICK, event => {
        event.preventDefault();
        event.stopPropagation();

        this._onOptionsClick(event.target);
      });
      EventHandler.on(this._selectionCleanerElement, EVENT_CLICK, event => {
        event.preventDefault();
        event.stopPropagation();
        this.deselectAll();
      });
      EventHandler.on(this._optionsElement, EVENT_KEYDOWN, event => {
        const key = event.keyCode || event.charCode;

        if (key === 13) {
          this._onOptionsClick(event.target);

          SelectorEngine.findOne(SELECTOR_INPUT, this._clone).focus();
        }
      });
    }

    _getConfig(config) {
      config = { ...Default$7,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$8, config, DefaultType$7);
      return config;
    }

    _getClassNames() {
      return [...this._element.classList.value.split(' ')];
    }

    _getOptions(node = this._element) {
      if (this._config.options) {
        return this._config.options;
      }

      const nodes = Array.from(node.childNodes).filter(element => element.nodeName === 'OPTION' || element.nodeName === 'OPTGROUP');
      const options = [];
      nodes.forEach(node => {
        if (node.nodeName === 'OPTION') {
          options.push({
            value: node.value,
            text: node.innerHTML,
            selected: node.selected,
            disabled: node.disabled
          });
        }

        if (node.nodeName === 'OPTGROUP') {
          options.push({
            label: node.label,
            options: this._getOptions(node)
          });
        }
      });
      return options;
    }

    _getSelectedOptions(options) {
      const selected = [];
      options.forEach(e => {
        if (typeof e.value === 'undefined') {
          this._getSelectedOptions(e.options);

          return;
        }

        if (e.selected) {
          // Add only the last option if single select
          if (!this._config.multiple) {
            selected.length = 0;
          }

          selected.push({
            value: String(e.value),
            text: e.text
          });
        }
      });
      return selected;
    }

    _createNativeSelect(data) {
      this._element.classList.add(CLASS_NAME_SELECT);

      if (this._config.multiple) {
        this._element.setAttribute('multiple', true);
      }

      this._createNativeOptions(this._element, data);
    }

    _createNativeOptions(parentElement, options) {
      options.forEach(option => {
        if (typeof option.options !== 'undefined') {
          const optgroup = document.createElement('optgroup');
          optgroup.label = option.label;

          this._createNativeOptions(optgroup, option.options);

          parentElement.append(optgroup);
        } else {
          const opt = document.createElement('OPTION');
          opt.value = option.value;

          if (option.disabled === true) {
            opt.setAttribute('disabled', 'disabled');
          }

          if (option.selected === true) {
            opt.setAttribute('selected', 'selected');
          }

          opt.innerHTML = option.text;
          parentElement.append(opt);
        }
      });
    }

    _hideNativeSelect() {
      this._element.tabIndex = '-1';
      this._element.style.display = 'none';
    }

    _createSelect() {
      const div = document.createElement('div');
      div.classList.add(CLASS_NAME_SELECT);

      this._getClassNames().forEach(className => {
        div.classList.add(className);
      });

      if (this._config.multiple) {
        div.classList.add(CLASS_NAME_SELECT_MULTIPLE);
      }

      if (this._config.multiple && this._config.selectionType === 'tags') {
        div.classList.add(CLASS_NAME_SELECTION_TAGS);
      }

      this._clone = div;

      this._element.parentNode.insertBefore(div, this._element.nextSibling);

      this._createSelection();

      this._createSelectionCleaner();

      if (this._config.search) {
        this._createSearchInput();

        this._updateSearch();
      }

      this._createOptionsContainer();

      this._hideNativeSelect();

      this._updateOptionsList();
    }

    _createSelection() {
      const span = document.createElement('span');
      span.classList.add(CLASS_NAME_SELECTION);

      this._clone.append(span);

      this._updateSelection();

      this._selectionElement = span;
    }

    _createSelectionCleaner() {
      if (this._config.cleaner && this._config.multiple) {
        const cleaner = document.createElement('button');
        cleaner.classList.add(CLASS_NAME_SELECTION_CLEANER);
        cleaner.style.display = 'none';

        this._clone.append(cleaner);

        this._clone.classList.add(CLASS_NAME_SELECT_WITH_CLEANER);

        this._updateSelectionCleaner();

        this._selectionCleanerElement = cleaner;
      }
    }

    _createSearchInput() {
      const input = document.createElement('input');
      input.classList.add(CLASS_NAME_SEARCH);
      this._searchElement = input;

      this._updateSearchSize();

      this._clone.append(input);
    }

    _createOptionsContainer() {
      const dropdownDiv = document.createElement('div');
      dropdownDiv.classList.add(CLASS_NAME_SELECT_DROPDOWN);

      if (this._config.selectAll && this._config.multiple) {
        const selectAll = document.createElement('button');
        selectAll.classList.add(CLASS_NAME_SELECT_ALL);
        selectAll.innerHTML = this._config.selectAllLabel;
        this._selectAllElement = selectAll;
        dropdownDiv.append(selectAll);
      }

      const optionsDiv = document.createElement('div');
      optionsDiv.classList.add(CLASS_NAME_OPTIONS);

      if (this._config.optionsMaxHeight !== 'auto') {
        optionsDiv.style.maxHeight = `${this._config.optionsMaxHeight}px`;
        optionsDiv.style.overflow = 'scroll';
      }

      dropdownDiv.append(optionsDiv);

      this._clone.append(dropdownDiv);

      this._createOptions(optionsDiv, this._options);

      this._optionsElement = optionsDiv;
    }

    _createOptions(parentElement, options) {
      options.forEach(option => {
        if (typeof option.value !== 'undefined') {
          const optionDiv = document.createElement('div');
          optionDiv.classList.add(CLASS_NAME_OPTION);

          if (option.disabled) {
            optionDiv.classList.add(CLASS_NAME_DISABLED);
          }

          if (this._config.optionsStyle === 'checkbox') {
            optionDiv.classList.add(CLASS_NAME_OPTION_WITH_CHECKBOX);
          }

          optionDiv.dataset.value = String(option.value);
          optionDiv.tabIndex = 0;
          optionDiv.innerHTML = option.text;
          parentElement.append(optionDiv);
        }

        if (typeof option.label !== 'undefined') {
          const optgroup = document.createElement('div');
          optgroup.classList.add(CLASS_NAME_OPTGROUP);
          const optgrouplabel = document.createElement('div');
          optgrouplabel.innerHTML = option.label;
          optgrouplabel.classList.add(CLASS_NAME_OPTGROUP_LABEL);
          optgroup.append(optgrouplabel);

          this._createOptions(optgroup, option.options);

          parentElement.append(optgroup);
        }
      });
    }

    _createTag(value, text) {
      const tag = document.createElement('span');
      tag.classList.add(CLASS_NAME_TAG);
      tag.dataset.value = value;
      tag.innerHTML = text;
      const closeBtn = document.createElement('button');
      closeBtn.classList.add(CLASS_NAME_TAG_DELETE, 'text-medium-emphasis');
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
      tag.append(closeBtn);
      EventHandler.on(closeBtn, EVENT_CLICK, event => {
        event.preventDefault();
        event.stopPropagation();
        tag.remove();

        this._deselectOption(value);
      });
      return tag;
    }

    _onOptionsClick(element) {
      if (!element.classList.contains(CLASS_NAME_OPTION) || element.classList.contains(CLASS_NAME_LABEL)) {
        return;
      }

      const value = String(element.dataset.value);
      const text = element.textContent;

      if (this._config.multiple && element.classList.contains(CLASS_NAME_SELECTED)) {
        this._deselectOption(value);
      } else if (this._config.multiple && !element.classList.contains(CLASS_NAME_SELECTED)) {
        this._selectOption(value, text);
      } else if (!this._config.multiple) {
        this._selectOption(value, text);
      }

      if (!this._config.multiple) {
        this.hide();
        this.search('');
        this._searchElement.value = null;
      }
    }

    _selectOption(value, text) {
      if (!this._config.multiple) {
        this.deselectAll();
      }

      if (this._selection.filter(e => e.value === value).length === 0) {
        this._selection.push({
          value,
          text
        });
      }

      const nativeOption = SelectorEngine.findOne(`option[value="${value}"]`, this._element);

      if (nativeOption) {
        nativeOption.selected = true;
      }

      const option = SelectorEngine.findOne(`[data-value="${value}"]`, this._optionsElement);

      if (option) {
        option.classList.add(CLASS_NAME_SELECTED);
      }

      EventHandler.trigger(this._element, EVENT_CHANGED, {
        value: this._selection
      });

      this._updateSelection();

      this._updateSelectionCleaner();

      this._updateSearch();

      this._updateSearchSize();
    }

    _deselectOption(value) {
      const selected = this._selection.filter(e => e.value !== value);

      this._selection = selected;
      SelectorEngine.findOne(`option[value="${value}"]`, this._element).selected = false;
      const option = SelectorEngine.findOne(`[data-value="${value}"]`, this._optionsElement);

      if (option) {
        option.classList.remove(CLASS_NAME_SELECTED);
      }

      EventHandler.trigger(this._element, EVENT_CHANGED, {
        value: this._selection
      });

      this._updateSelection();

      this._updateSelectionCleaner();

      this._updateSearch();

      this._updateSearchSize();
    }

    _deselectLastOption() {
      if (this._selection.length > 0) {
        const last = this._selection.pop();

        this._deselectOption(last.value);
      }
    }

    _updateSelection() {
      const selection = SelectorEngine.findOne(SELECTOR_SELECTION, this._clone);

      if (this._config.multiple && this._config.selectionType === 'counter') {
        selection.innerHTML = `${this._selection.length} ${this._config.selectionTypeCounterText}`;
        return;
      }

      if (this._config.multiple && this._config.selectionType === 'tags') {
        selection.innerHTML = '';

        this._selection.forEach(e => {
          selection.append(this._createTag(e.value, e.text));
        });

        return;
      }

      if (this._config.multiple && this._config.selectionType === 'text') {
        selection.innerHTML = this._selection.map(e => e.text).join(', ');
        return;
      }

      if (this._selection.length > 0) {
        selection.innerHTML = this._selection[0].text;
      }
    }

    _updateSelectionCleaner() {
      if (!this._config.cleaner || this._selectionCleanerElement === null) {
        return;
      }

      const selectionCleaner = SelectorEngine.findOne(SELECTOR_SELECTION_CLEANER, this._clone);

      if (this._selection.length > 0) {
        selectionCleaner.style.removeProperty('display');
        return;
      }

      selectionCleaner.style.display = 'none';
    }

    _updateSearch() {
      if (!this._config.search) {
        return;
      }

      if (this._selection.length > 0 && !this._config.multiple) {
        this._searchElement.placeholder = this._selection[0].text;
        this._selectionElement.style.display = 'none';
        return;
      }

      if (this._selection.length > 0 && this._config.multiple && this._config.selectionType !== 'counter') {
        this._searchElement.removeAttribute('placeholder');

        this._selectionElement.style.removeProperty('display');

        return;
      }

      if (this._selection.length === 0 && this._config.multiple) {
        this._searchElement.placeholder = this._config.placeholder;
        this._selectionElement.style.display = 'none';
        return;
      }

      if (this._config.multiple && this._config.selectionType === 'counter') {
        this._searchElement.placeholder = `${this._selection.length} item(s) selected`;
        this._selectionElement.style.display = 'none';
      }
    }

    _updateSearchSize(size = 2) {
      if (!this._searchElement || !this._config.multiple) {
        return;
      }

      if (this._selection.length > 0 && (this._config.selectionType === 'tags' || this._config.selectionType === 'text')) {
        this._searchElement.size = size;
        return;
      }

      if (this._selection.length === 0 && (this._config.selectionType === 'tags' || this._config.selectionType === 'text')) {
        this._searchElement.removeAttribute('size');
      }
    }

    _onSearchChange(element) {
      if (element) {
        this.search(element.value);

        this._updateSearchSize(element.value.length + 1);
      }
    }

    _updateOptionsList(options = this._options) {
      options.forEach(option => {
        if (option.label) {
          this._updateOptionsList(option.options);

          return;
        }

        if (option.selected) {
          this._selectOption(option.value, option.text);
        }
      });
    }

    _isVisible(element) {
      const style = window.getComputedStyle(element);
      return style.display !== 'none';
    }

    _filterOptionsList() {
      const options = SelectorEngine.find(SELECTOR_OPTION, this._clone);
      let visibleOptions = 0;
      options.forEach(option => {
        // eslint-disable-next-line unicorn/prefer-includes
        if (option.textContent.toLowerCase().indexOf(this._search) === -1) {
          option.style.display = 'none';
        } else {
          option.style.removeProperty('display');
          visibleOptions++;
        }

        const optgroup = option.closest(SELECTOR_OPTGROUP);

        if (optgroup) {
          // eslint-disable-next-line  unicorn/prefer-array-some
          if (SelectorEngine.children(optgroup, SELECTOR_OPTION).filter(element => this._isVisible(element)).length > 0) {
            optgroup.style.removeProperty('display');
          } else {
            optgroup.style.display = 'none';
          }
        }
      });

      if (visibleOptions > 0) {
        if (SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._clone)) {
          SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._clone).remove();
        }

        return;
      }

      if (visibleOptions === 0) {
        const placeholder = document.createElement('div');
        placeholder.classList.add(CLASS_NAME_OPTIONS_EMPTY);
        placeholder.innerHTML = this._config.searchNoResultsLabel;

        if (!SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._clone)) {
          SelectorEngine.findOne(SELECTOR_OPTIONS, this._clone).append(placeholder);
        }
      }
    } // Static


    static multiSelectInterface(element, config) {
      const data = MultiSelect.getOrCreateInstance(element, config);

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        MultiSelect.multiSelectInterface(this, config);
      });
    }

    static clearMenus(event) {
      if (event && (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY)) {
        return;
      }

      const selects = SelectorEngine.find(SELECTOR_SELECT);

      for (let i = 0, len = selects.length; i < len; i++) {
        const context = Data.get(selects[i], DATA_KEY$8);
        ({
          relatedTarget: selects[i]
        });

        if (event && event.type === 'click') ;

        if (!context) {
          continue;
        }

        if (!context._clone.classList.contains(CLASS_NAME_SHOW$6)) {
          continue;
        }

        if (context._clone.contains(event.target)) {
          continue;
        }

        context._clone.classList.remove(CLASS_NAME_SHOW$6);

        EventHandler.trigger(context._element, EVENT_HIDDEN$4);
      }
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(window, EVENT_LOAD_DATA_API$4, () => {
    SelectorEngine.find(SELECTOR_SELECT).forEach(ms => {
      if (ms.tabIndex !== -1) {
        MultiSelect.multiSelectInterface(ms);
      }
    });
  });
  EventHandler.on(document, EVENT_CLICK_DATA_API$4, MultiSelect.clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API, MultiSelect.clearMenus);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .MultiSelect to jQuery only if jQuery is present
   */

  defineJQueryPlugin(MultiSelect);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): navigation.js
   * Licensed under MIT (https://coreui.io/license)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$7 = 'navigation';
  const DATA_KEY$7 = 'coreui.navigation';
  const EVENT_KEY$7 = `.${DATA_KEY$7}`;
  const DATA_API_KEY$4 = '.data-api';
  const Default$6 = {
    activeLinksExact: true,
    groupsAutoCollapse: true
  };
  const DefaultType$6 = {
    activeLinksExact: 'boolean',
    groupsAutoCollapse: '(string|boolean)'
  };
  const CLASS_NAME_ACTIVE$2 = 'active';
  const CLASS_NAME_SHOW$5 = 'show';
  const CLASS_NAME_NAV_GROUP = 'nav-group';
  const CLASS_NAME_NAV_GROUP_TOGGLE = 'nav-group-toggle';
  const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
  const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$7}${DATA_API_KEY$4}`;
  const SELECTOR_NAV_GROUP = '.nav-group';
  const SELECTOR_NAV_GROUP_ITEMS = '.nav-group-items';
  const SELECTOR_NAV_GROUP_TOGGLE = '.nav-group-toggle';
  const SELECTOR_NAV_LINK = '.nav-link';
  const SELECTOR_DATA_NAVIGATION = '[data-coreui="navigation"]';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Navigation extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);

      this._setActiveLink();

      this._addEventListeners();

      Data.set(element, DATA_KEY$7, this);
    } // Getters


    static get Default() {
      return Default$6;
    }

    static get DATA_KEY() {
      return DATA_KEY$7;
    }

    static get DefaultType() {
      return DefaultType$6;
    }

    static get NAME() {
      return NAME$7;
    } // Private


    _getConfig(config) {
      config = { ...Default$6,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$7, config, DefaultType$6);
      return config;
    }

    _setActiveLink() {
      Array.from(this._element.querySelectorAll(SELECTOR_NAV_LINK)).forEach(element => {
        if (element.classList.contains(CLASS_NAME_NAV_GROUP_TOGGLE)) {
          return;
        }

        let currentUrl = String(window.location);
        const urlHasParams = /\?.*=/;
        const urlHasQueryString = /\?./;
        const urlHasHash = /#./;

        if (urlHasParams.test(currentUrl) || urlHasQueryString.test(currentUrl)) {
          currentUrl = currentUrl.split('?')[0];
        }

        if (urlHasHash.test(currentUrl)) {
          currentUrl = currentUrl.split('#')[0];
        }

        if (this._config.activeLinksExact && element.href === currentUrl) {
          element.classList.add(CLASS_NAME_ACTIVE$2);
          Array.from(this._getParents(element, SELECTOR_NAV_GROUP)).forEach(element => {
            element.classList.add(CLASS_NAME_SHOW$5);
            element.setAttribute('aria-expanded', true);
          });
        }

        if (!this._config.activeLinksExact && element.href.startsWith(currentUrl)) {
          element.classList.add(CLASS_NAME_ACTIVE$2);
          Array.from(this._getParents(element, SELECTOR_NAV_GROUP)).forEach(element => {
            element.classList.add(CLASS_NAME_SHOW$5);
            element.setAttribute('aria-expanded', true);
          });
        }
      });
    }

    _getParents(element, selector) {
      // Setup parents array
      const parents = []; // Get matching parent elements

      for (; element && element !== document; element = element.parentNode) {
        // Add matching parents to array
        if (selector) {
          if (element.matches(selector)) {
            parents.push(element);
          }
        } else {
          parents.push(element);
        }
      }

      return parents;
    }

    _getAllSiblings(element, filter) {
      const siblings = [];
      element = element.parentNode.firstChild;

      do {
        if (element.nodeType === 3) {
          continue; // text node
        }

        if (element.nodeType === 8) {
          continue; // comment node
        }

        if (!filter || filter(element)) {
          siblings.push(element);
        } // eslint-disable-next-line no-cond-assign

      } while (element = element.nextSibling);

      return siblings;
    }

    _getChildren(n, skipMe) {
      const children = [];

      for (; n; n = n.nextSibling) {
        if (n.nodeType === 1 && n !== skipMe) {
          children.push(n);
        }
      }

      return children;
    }

    _getSiblings(element, filter) {
      const siblings = this._getChildren(element.parentNode.firstChild, element).filter(filter);

      return siblings;
    }

    _slideDown(element) {
      element.style.height = 'auto';
      const height = element.clientHeight;
      element.style.height = '0px';
      setTimeout(() => {
        element.style.height = `${height}px`;
      }, 0);

      this._queueCallback(() => {
        element.style.height = 'auto';
      }, element, true);
    }

    _slideUp(element, callback) {
      const height = element.clientHeight;
      element.style.height = `${height}px`;
      setTimeout(() => {
        element.style.height = '0px';
      }, 0);

      this._queueCallback(() => {
        if (typeof callback === 'function') {
          callback();
        }
      }, element, true);
    }

    _toggleGroupItems(event) {
      let toggler = event.target;

      if (!toggler.classList.contains(CLASS_NAME_NAV_GROUP_TOGGLE)) {
        toggler = toggler.closest(SELECTOR_NAV_GROUP_TOGGLE);
      }

      const filter = element => Boolean(element.classList.contains(CLASS_NAME_NAV_GROUP) && element.classList.contains(CLASS_NAME_SHOW$5)); // Close other groups


      if (this._config.groupsAutoCollapse === true) {
        this._getSiblings(toggler.parentNode, filter).forEach(element => {
          this._slideUp(SelectorEngine.findOne(SELECTOR_NAV_GROUP_ITEMS, element), () => {
            element.classList.remove(CLASS_NAME_SHOW$5);
            element.setAttribute('aria-expanded', false);
          });
        });
      }

      if (toggler.parentNode.classList.contains(CLASS_NAME_SHOW$5)) {
        this._slideUp(SelectorEngine.findOne(SELECTOR_NAV_GROUP_ITEMS, toggler.parentNode), () => {
          toggler.parentNode.classList.remove(CLASS_NAME_SHOW$5);
          toggler.parentNode.setAttribute('aria-expanded', false);
        });

        return;
      }

      toggler.parentNode.classList.add(CLASS_NAME_SHOW$5);
      toggler.parentNode.setAttribute('aria-expanded', true);

      this._slideDown(SelectorEngine.findOne(SELECTOR_NAV_GROUP_ITEMS, toggler.parentNode));
    }

    _addEventListeners() {
      EventHandler.on(this._element, EVENT_CLICK_DATA_API$3, SELECTOR_NAV_GROUP_TOGGLE, event => {
        event.preventDefault();

        this._toggleGroupItems(event, this);
      });
    } // Static


    static navigationInterface(element, config) {
      const data = Navigation.getOrCreateInstance(element, config);

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        Navigation.navigationInterface(this, config);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
    Array.from(document.querySelectorAll(SELECTOR_DATA_NAVIGATION)).forEach(element => {
      Navigation.navigationInterface(element);
    });
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Navigation to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Navigation);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): dropdown.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's offcanvas.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$6 = 'offcanvas';
  const DATA_KEY$6 = 'coreui.offcanvas';
  const EVENT_KEY$6 = `.${DATA_KEY$6}`;
  const DATA_API_KEY$3 = '.data-api';
  const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const ESCAPE_KEY = 'Escape';
  const Default$5 = {
    backdrop: true,
    keyboard: true,
    scroll: false
  };
  const DefaultType$5 = {
    backdrop: 'boolean',
    keyboard: 'boolean',
    scroll: 'boolean'
  };
  const CLASS_NAME_SHOW$4 = 'show';
  const CLASS_NAME_BACKDROP$1 = 'offcanvas-backdrop';
  const OPEN_SELECTOR = '.offcanvas.show';
  const EVENT_SHOW$3 = `show${EVENT_KEY$6}`;
  const EVENT_SHOWN$3 = `shown${EVENT_KEY$6}`;
  const EVENT_HIDE$3 = `hide${EVENT_KEY$6}`;
  const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$6}`;
  const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$6}`;
  const SELECTOR_DATA_TOGGLE$2 = '[data-coreui-toggle="offcanvas"]';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Offcanvas extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._isShown = false;
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();

      this._addEventListeners();
    } // Getters


    static get NAME() {
      return NAME$6;
    }

    static get Default() {
      return Default$5;
    } // Public


    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }

    show(relatedTarget) {
      if (this._isShown) {
        return;
      }

      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
        relatedTarget
      });

      if (showEvent.defaultPrevented) {
        return;
      }

      this._isShown = true;
      this._element.style.visibility = 'visible';

      this._backdrop.show();

      if (!this._config.scroll) {
        new ScrollBarHelper().hide();
      }

      this._element.removeAttribute('aria-hidden');

      this._element.setAttribute('aria-modal', true);

      this._element.setAttribute('role', 'dialog');

      this._element.classList.add(CLASS_NAME_SHOW$4);

      const completeCallBack = () => {
        if (!this._config.scroll) {
          this._focustrap.activate();
        }

        EventHandler.trigger(this._element, EVENT_SHOWN$3, {
          relatedTarget
        });
      };

      this._queueCallback(completeCallBack, this._element, true);
    }

    hide() {
      if (!this._isShown) {
        return;
      }

      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);

      if (hideEvent.defaultPrevented) {
        return;
      }

      this._focustrap.deactivate();

      this._element.blur();

      this._isShown = false;

      this._element.classList.remove(CLASS_NAME_SHOW$4);

      this._backdrop.hide();

      const completeCallback = () => {
        this._element.setAttribute('aria-hidden', true);

        this._element.removeAttribute('aria-modal');

        this._element.removeAttribute('role');

        this._element.style.visibility = 'hidden';

        if (!this._config.scroll) {
          new ScrollBarHelper().reset();
        }

        EventHandler.trigger(this._element, EVENT_HIDDEN$3);
      };

      this._queueCallback(completeCallback, this._element, true);
    }

    dispose() {
      this._backdrop.dispose();

      this._focustrap.deactivate();

      super.dispose();
    } // Private


    _getConfig(config) {
      config = { ...Default$5,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$6, config, DefaultType$5);
      return config;
    }

    _initializeBackDrop() {
      return new Backdrop({
        className: CLASS_NAME_BACKDROP$1,
        isVisible: this._config.backdrop,
        isAnimated: true,
        rootElement: this._element.parentNode,
        clickCallback: () => this.hide()
      });
    }

    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }

    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, event => {
        if (this._config.keyboard && event.key === ESCAPE_KEY) {
          this.hide();
        }
      });
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Offcanvas.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function (event) {
    const target = getElementFromSelector(this);

    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }

    if (isDisabled(this)) {
      return;
    }

    EventHandler.one(target, EVENT_HIDDEN$3, () => {
      // focus on trigger when it is closed
      if (isVisible(this)) {
        this.focus();
      }
    }); // avoid conflict when clicking a toggler of an offcanvas, while another is open

    const allReadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);

    if (allReadyOpen && allReadyOpen !== target) {
      Offcanvas.getInstance(allReadyOpen).hide();
    }

    const data = Offcanvas.getOrCreateInstance(target);
    data.toggle(this);
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => SelectorEngine.find(OPEN_SELECTOR).forEach(el => Offcanvas.getOrCreateInstance(el).show()));
  enableDismissTrigger(Offcanvas);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  defineJQueryPlugin(Offcanvas);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): alert.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's  util/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const uriAttributes = new Set(['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href']);
  const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  /**
   * A pattern that recognizes a commonly useful subset of URLs that are safe.
   *
   * Shoutout to Angular https://github.com/angular/angular/blob/12.2.x/packages/core/src/sanitization/url_sanitizer.ts
   */

  const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^#&/:?]*(?:[#/?]|$))/i;
  /**
   * A pattern that matches safe data URLs. Only matches image, video and audio types.
   *
   * Shoutout to Angular https://github.com/angular/angular/blob/12.2.x/packages/core/src/sanitization/url_sanitizer.ts
   */

  const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i;

  const allowedAttribute = (attribute, allowedAttributeList) => {
    const attributeName = attribute.nodeName.toLowerCase();

    if (allowedAttributeList.includes(attributeName)) {
      if (uriAttributes.has(attributeName)) {
        return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue) || DATA_URL_PATTERN.test(attribute.nodeValue));
      }

      return true;
    }

    const regExp = allowedAttributeList.filter(attributeRegex => attributeRegex instanceof RegExp); // Check if a regular expression validates the attribute.

    for (let i = 0, len = regExp.length; i < len; i++) {
      if (regExp[i].test(attributeName)) {
        return true;
      }
    }

    return false;
  };

  const DefaultAllowlist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  function sanitizeHtml(unsafeHtml, allowList, sanitizeFn) {
    if (!unsafeHtml.length) {
      return unsafeHtml;
    }

    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml);
    }

    const domParser = new window.DOMParser();
    const createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
    const elements = [].concat(...createdDocument.body.querySelectorAll('*'));

    for (let i = 0, len = elements.length; i < len; i++) {
      const element = elements[i];
      const elementName = element.nodeName.toLowerCase();

      if (!Object.keys(allowList).includes(elementName)) {
        element.remove();
        continue;
      }

      const attributeList = [].concat(...element.attributes);
      const allowedAttributes = [].concat(allowList['*'] || [], allowList[elementName] || []);
      attributeList.forEach(attribute => {
        if (!allowedAttribute(attribute, allowedAttributes)) {
          element.removeAttribute(attribute.nodeName);
        }
      });
    }

    return createdDocument.body.innerHTML;
  }

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): tooltip.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's tooltip.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$5 = 'tooltip';
  const DATA_KEY$5 = 'coreui.tooltip';
  const EVENT_KEY$5 = `.${DATA_KEY$5}`;
  const CLASS_PREFIX$1 = 'bs-tooltip';
  const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn']);
  const DefaultType$4 = {
    animation: 'boolean',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string',
    delay: '(number|object)',
    html: 'boolean',
    selector: '(string|boolean)',
    placement: '(string|function)',
    offset: '(array|string|function)',
    container: '(string|element|boolean)',
    fallbackPlacements: 'array',
    boundary: '(string|element)',
    customClass: '(string|function)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    allowList: 'object',
    popperConfig: '(null|object|function)'
  };
  const AttachmentMap = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: isRTL() ? 'left' : 'right',
    BOTTOM: 'bottom',
    LEFT: isRTL() ? 'right' : 'left'
  };
  const Default$4 = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner"></div>' + '</div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    selector: false,
    placement: 'top',
    offset: [0, 0],
    container: false,
    fallbackPlacements: ['top', 'right', 'bottom', 'left'],
    boundary: 'clippingParents',
    customClass: '',
    sanitize: true,
    sanitizeFn: null,
    allowList: DefaultAllowlist,
    popperConfig: null
  };
  const Event$2 = {
    HIDE: `hide${EVENT_KEY$5}`,
    HIDDEN: `hidden${EVENT_KEY$5}`,
    SHOW: `show${EVENT_KEY$5}`,
    SHOWN: `shown${EVENT_KEY$5}`,
    INSERTED: `inserted${EVENT_KEY$5}`,
    CLICK: `click${EVENT_KEY$5}`,
    FOCUSIN: `focusin${EVENT_KEY$5}`,
    FOCUSOUT: `focusout${EVENT_KEY$5}`,
    MOUSEENTER: `mouseenter${EVENT_KEY$5}`,
    MOUSELEAVE: `mouseleave${EVENT_KEY$5}`
  };
  const CLASS_NAME_FADE$2 = 'fade';
  const CLASS_NAME_MODAL = 'modal';
  const CLASS_NAME_SHOW$3 = 'show';
  const HOVER_STATE_SHOW = 'show';
  const HOVER_STATE_OUT = 'out';
  const SELECTOR_TOOLTIP_INNER = '.tooltip-inner';
  const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
  const EVENT_MODAL_HIDE = 'hide.coreui.modal';
  const TRIGGER_HOVER = 'hover';
  const TRIGGER_FOCUS = 'focus';
  const TRIGGER_CLICK = 'click';
  const TRIGGER_MANUAL = 'manual';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Tooltip extends BaseComponent {
    constructor(element, config) {
      if (typeof Popper__namespace === 'undefined') {
        throw new TypeError('Bootstrap\'s tooltips require Popper (https://popper.js.org)');
      }

      super(element); // private

      this._isEnabled = true;
      this._timeout = 0;
      this._hoverState = '';
      this._activeTrigger = {};
      this._popper = null; // Protected

      this._config = this._getConfig(config);
      this.tip = null;

      this._setListeners();
    } // Getters


    static get Default() {
      return Default$4;
    }

    static get NAME() {
      return NAME$5;
    }

    static get Event() {
      return Event$2;
    }

    static get DefaultType() {
      return DefaultType$4;
    } // Public


    enable() {
      this._isEnabled = true;
    }

    disable() {
      this._isEnabled = false;
    }

    toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    }

    toggle(event) {
      if (!this._isEnabled) {
        return;
      }

      if (event) {
        const context = this._initializeOnDelegatedTarget(event);

        context._activeTrigger.click = !context._activeTrigger.click;

        if (context._isWithActiveTrigger()) {
          context._enter(null, context);
        } else {
          context._leave(null, context);
        }
      } else {
        if (this.getTipElement().classList.contains(CLASS_NAME_SHOW$3)) {
          this._leave(null, this);

          return;
        }

        this._enter(null, this);
      }
    }

    dispose() {
      clearTimeout(this._timeout);
      EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);

      if (this.tip) {
        this.tip.remove();
      }

      this._disposePopper();

      super.dispose();
    }

    show() {
      if (this._element.style.display === 'none') {
        throw new Error('Please use show on visible elements');
      }

      if (!(this.isWithContent() && this._isEnabled)) {
        return;
      }

      const showEvent = EventHandler.trigger(this._element, this.constructor.Event.SHOW);
      const shadowRoot = findShadowRoot(this._element);
      const isInTheDom = shadowRoot === null ? this._element.ownerDocument.documentElement.contains(this._element) : shadowRoot.contains(this._element);

      if (showEvent.defaultPrevented || !isInTheDom) {
        return;
      } // A trick to recreate a tooltip in case a new title is given by using the NOT documented `data-coreui-original-title`
      // This will be removed later in favor of a `setContent` method


      if (this.constructor.NAME === 'tooltip' && this.tip && this.getTitle() !== this.tip.querySelector(SELECTOR_TOOLTIP_INNER).innerHTML) {
        this._disposePopper();

        this.tip.remove();
        this.tip = null;
      }

      const tip = this.getTipElement();
      const tipId = getUID(this.constructor.NAME);
      tip.setAttribute('id', tipId);

      this._element.setAttribute('aria-describedby', tipId);

      if (this._config.animation) {
        tip.classList.add(CLASS_NAME_FADE$2);
      }

      const placement = typeof this._config.placement === 'function' ? this._config.placement.call(this, tip, this._element) : this._config.placement;

      const attachment = this._getAttachment(placement);

      this._addAttachmentClass(attachment);

      const {
        container
      } = this._config;
      Data.set(tip, this.constructor.DATA_KEY, this);

      if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
        container.append(tip);
        EventHandler.trigger(this._element, this.constructor.Event.INSERTED);
      }

      if (this._popper) {
        this._popper.update();
      } else {
        this._popper = Popper__namespace.createPopper(this._element, tip, this._getPopperConfig(attachment));
      }

      tip.classList.add(CLASS_NAME_SHOW$3);

      const customClass = this._resolvePossibleFunction(this._config.customClass);

      if (customClass) {
        tip.classList.add(...customClass.split(' '));
      } // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


      if ('ontouchstart' in document.documentElement) {
        [].concat(...document.body.children).forEach(element => {
          EventHandler.on(element, 'mouseover', noop);
        });
      }

      const complete = () => {
        const prevHoverState = this._hoverState;
        this._hoverState = null;
        EventHandler.trigger(this._element, this.constructor.Event.SHOWN);

        if (prevHoverState === HOVER_STATE_OUT) {
          this._leave(null, this);
        }
      };

      const isAnimated = this.tip.classList.contains(CLASS_NAME_FADE$2);

      this._queueCallback(complete, this.tip, isAnimated);
    }

    hide() {
      if (!this._popper) {
        return;
      }

      const tip = this.getTipElement();

      const complete = () => {
        if (this._isWithActiveTrigger()) {
          return;
        }

        if (this._hoverState !== HOVER_STATE_SHOW) {
          tip.remove();
        }

        this._cleanTipClass();

        this._element.removeAttribute('aria-describedby');

        EventHandler.trigger(this._element, this.constructor.Event.HIDDEN);

        this._disposePopper();
      };

      const hideEvent = EventHandler.trigger(this._element, this.constructor.Event.HIDE);

      if (hideEvent.defaultPrevented) {
        return;
      }

      tip.classList.remove(CLASS_NAME_SHOW$3); // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support

      if ('ontouchstart' in document.documentElement) {
        [].concat(...document.body.children).forEach(element => EventHandler.off(element, 'mouseover', noop));
      }

      this._activeTrigger[TRIGGER_CLICK] = false;
      this._activeTrigger[TRIGGER_FOCUS] = false;
      this._activeTrigger[TRIGGER_HOVER] = false;
      const isAnimated = this.tip.classList.contains(CLASS_NAME_FADE$2);

      this._queueCallback(complete, this.tip, isAnimated);

      this._hoverState = '';
    }

    update() {
      if (this._popper !== null) {
        this._popper.update();
      }
    } // Protected


    isWithContent() {
      return Boolean(this.getTitle());
    }

    getTipElement() {
      if (this.tip) {
        return this.tip;
      }

      const element = document.createElement('div');
      element.innerHTML = this._config.template;
      const tip = element.children[0];
      this.setContent(tip);
      tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$3);
      this.tip = tip;
      return this.tip;
    }

    setContent(tip) {
      this._sanitizeAndSetContent(tip, this.getTitle(), SELECTOR_TOOLTIP_INNER);
    }

    _sanitizeAndSetContent(template, content, selector) {
      const templateElement = SelectorEngine.findOne(selector, template);

      if (!content && templateElement) {
        templateElement.remove();
        return;
      } // we use append for html objects to maintain js events


      this.setElementContent(templateElement, content);
    }

    setElementContent(element, content) {
      if (element === null) {
        return;
      }

      if (isElement(content)) {
        content = getElement(content); // content is a DOM node or a jQuery

        if (this._config.html) {
          if (content.parentNode !== element) {
            element.innerHTML = '';
            element.append(content);
          }
        } else {
          element.textContent = content.textContent;
        }

        return;
      }

      if (this._config.html) {
        if (this._config.sanitize) {
          content = sanitizeHtml(content, this._config.allowList, this._config.sanitizeFn);
        }

        element.innerHTML = content;
      } else {
        element.textContent = content;
      }
    }

    getTitle() {
      const title = this._element.getAttribute('data-coreui-original-title') || this._config.title;

      return this._resolvePossibleFunction(title);
    }

    updateAttachment(attachment) {
      if (attachment === 'right') {
        return 'end';
      }

      if (attachment === 'left') {
        return 'start';
      }

      return attachment;
    } // Private


    _initializeOnDelegatedTarget(event, context) {
      return context || this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
    }

    _getOffset() {
      const {
        offset
      } = this._config;

      if (typeof offset === 'string') {
        return offset.split(',').map(val => Number.parseInt(val, 10));
      }

      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }

      return offset;
    }

    _resolvePossibleFunction(content) {
      return typeof content === 'function' ? content.call(this._element) : content;
    }

    _getPopperConfig(attachment) {
      const defaultBsPopperConfig = {
        placement: attachment,
        modifiers: [{
          name: 'flip',
          options: {
            fallbackPlacements: this._config.fallbackPlacements
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }, {
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'arrow',
          options: {
            element: `.${this.constructor.NAME}-arrow`
          }
        }, {
          name: 'onChange',
          enabled: true,
          phase: 'afterWrite',
          fn: data => this._handlePopperPlacementChange(data)
        }],
        onFirstUpdate: data => {
          if (data.options.placement !== data.placement) {
            this._handlePopperPlacementChange(data);
          }
        }
      };
      return { ...defaultBsPopperConfig,
        ...(typeof this._config.popperConfig === 'function' ? this._config.popperConfig(defaultBsPopperConfig) : this._config.popperConfig)
      };
    }

    _addAttachmentClass(attachment) {
      this.getTipElement().classList.add(`${this._getBasicClassPrefix()}-${this.updateAttachment(attachment)}`);
    }

    _getAttachment(placement) {
      return AttachmentMap[placement.toUpperCase()];
    }

    _setListeners() {
      const triggers = this._config.trigger.split(' ');

      triggers.forEach(trigger => {
        if (trigger === 'click') {
          EventHandler.on(this._element, this.constructor.Event.CLICK, this._config.selector, event => this.toggle(event));
        } else if (trigger !== TRIGGER_MANUAL) {
          const eventIn = trigger === TRIGGER_HOVER ? this.constructor.Event.MOUSEENTER : this.constructor.Event.FOCUSIN;
          const eventOut = trigger === TRIGGER_HOVER ? this.constructor.Event.MOUSELEAVE : this.constructor.Event.FOCUSOUT;
          EventHandler.on(this._element, eventIn, this._config.selector, event => this._enter(event));
          EventHandler.on(this._element, eventOut, this._config.selector, event => this._leave(event));
        }
      });

      this._hideModalHandler = () => {
        if (this._element) {
          this.hide();
        }
      };

      EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);

      if (this._config.selector) {
        this._config = { ...this._config,
          trigger: 'manual',
          selector: ''
        };
      } else {
        this._fixTitle();
      }
    }

    _fixTitle() {
      const title = this._element.getAttribute('title');

      const originalTitleType = typeof this._element.getAttribute('data-coreui-original-title');

      if (title || originalTitleType !== 'string') {
        this._element.setAttribute('data-coreui-original-title', title || '');

        if (title && !this._element.getAttribute('aria-label') && !this._element.textContent) {
          this._element.setAttribute('aria-label', title);
        }

        this._element.setAttribute('title', '');
      }
    }

    _enter(event, context) {
      context = this._initializeOnDelegatedTarget(event, context);

      if (event) {
        context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
      }

      if (context.getTipElement().classList.contains(CLASS_NAME_SHOW$3) || context._hoverState === HOVER_STATE_SHOW) {
        context._hoverState = HOVER_STATE_SHOW;
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HOVER_STATE_SHOW;

      if (!context._config.delay || !context._config.delay.show) {
        context.show();
        return;
      }

      context._timeout = setTimeout(() => {
        if (context._hoverState === HOVER_STATE_SHOW) {
          context.show();
        }
      }, context._config.delay.show);
    }

    _leave(event, context) {
      context = this._initializeOnDelegatedTarget(event, context);

      if (event) {
        context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
      }

      if (context._isWithActiveTrigger()) {
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HOVER_STATE_OUT;

      if (!context._config.delay || !context._config.delay.hide) {
        context.hide();
        return;
      }

      context._timeout = setTimeout(() => {
        if (context._hoverState === HOVER_STATE_OUT) {
          context.hide();
        }
      }, context._config.delay.hide);
    }

    _isWithActiveTrigger() {
      for (const trigger in this._activeTrigger) {
        if (this._activeTrigger[trigger]) {
          return true;
        }
      }

      return false;
    }

    _getConfig(config) {
      const dataAttributes = Manipulator.getDataAttributes(this._element);
      Object.keys(dataAttributes).forEach(dataAttr => {
        if (DISALLOWED_ATTRIBUTES.has(dataAttr)) {
          delete dataAttributes[dataAttr];
        }
      });
      config = { ...this.constructor.Default,
        ...dataAttributes,
        ...(typeof config === 'object' && config ? config : {})
      };
      config.container = config.container === false ? document.body : getElement(config.container);

      if (typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }

      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      }

      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      }

      typeCheckConfig(NAME$5, config, this.constructor.DefaultType);

      if (config.sanitize) {
        config.template = sanitizeHtml(config.template, config.allowList, config.sanitizeFn);
      }

      return config;
    }

    _getDelegateConfig() {
      const config = {};

      for (const key in this._config) {
        if (this.constructor.Default[key] !== this._config[key]) {
          config[key] = this._config[key];
        }
      } // In the future can be replaced with:
      // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
      // `Object.fromEntries(keysWithDifferentValues)`


      return config;
    }

    _cleanTipClass() {
      const tip = this.getTipElement();
      const basicClassPrefixRegex = new RegExp(`(^|\\s)${this._getBasicClassPrefix()}\\S+`, 'g');
      const tabClass = tip.getAttribute('class').match(basicClassPrefixRegex);

      if (tabClass !== null && tabClass.length > 0) {
        tabClass.map(token => token.trim()).forEach(tClass => tip.classList.remove(tClass));
      }
    }

    _getBasicClassPrefix() {
      return CLASS_PREFIX$1;
    }

    _handlePopperPlacementChange(popperData) {
      const {
        state
      } = popperData;

      if (!state) {
        return;
      }

      this.tip = state.elements.popper;

      this._cleanTipClass();

      this._addAttachmentClass(this._getAttachment(state.placement));
    }

    _disposePopper() {
      if (this._popper) {
        this._popper.destroy();

        this._popper = null;
      }
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tooltip.getOrCreateInstance(this, config);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config]();
        }
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Tooltip to jQuery only if jQuery is present
   */


  defineJQueryPlugin(Tooltip);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): popover.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's popover.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$4 = 'popover';
  const DATA_KEY$4 = 'coreui.popover';
  const EVENT_KEY$4 = `.${DATA_KEY$4}`;
  const CLASS_PREFIX = 'bs-popover';
  const Default$3 = { ...Tooltip.Default,
    placement: 'right',
    offset: [0, 8],
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip">' + '<div class="popover-arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div>' + '</div>'
  };
  const DefaultType$3 = { ...Tooltip.DefaultType,
    content: '(string|element|function)'
  };
  const Event$1 = {
    HIDE: `hide${EVENT_KEY$4}`,
    HIDDEN: `hidden${EVENT_KEY$4}`,
    SHOW: `show${EVENT_KEY$4}`,
    SHOWN: `shown${EVENT_KEY$4}`,
    INSERTED: `inserted${EVENT_KEY$4}`,
    CLICK: `click${EVENT_KEY$4}`,
    FOCUSIN: `focusin${EVENT_KEY$4}`,
    FOCUSOUT: `focusout${EVENT_KEY$4}`,
    MOUSEENTER: `mouseenter${EVENT_KEY$4}`,
    MOUSELEAVE: `mouseleave${EVENT_KEY$4}`
  };
  const SELECTOR_TITLE = '.popover-header';
  const SELECTOR_CONTENT = '.popover-body';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Popover extends Tooltip {
    // Getters
    static get Default() {
      return Default$3;
    }

    static get NAME() {
      return NAME$4;
    }

    static get Event() {
      return Event$1;
    }

    static get DefaultType() {
      return DefaultType$3;
    } // Overrides


    isWithContent() {
      return this.getTitle() || this._getContent();
    }

    setContent(tip) {
      this._sanitizeAndSetContent(tip, this.getTitle(), SELECTOR_TITLE);

      this._sanitizeAndSetContent(tip, this._getContent(), SELECTOR_CONTENT);
    } // Private


    _getContent() {
      return this._resolvePossibleFunction(this._config.content);
    }

    _getBasicClassPrefix() {
      return CLASS_PREFIX;
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Popover.getOrCreateInstance(this, config);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config]();
        }
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Popover to jQuery only if jQuery is present
   */


  defineJQueryPlugin(Popover);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): scrollspy.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's scrollspy.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$3 = 'scrollspy';
  const DATA_KEY$3 = 'coreui.scrollspy';
  const EVENT_KEY$3 = `.${DATA_KEY$3}`;
  const DATA_API_KEY$2 = '.data-api';
  const Default$2 = {
    offset: 10,
    method: 'auto',
    target: ''
  };
  const DefaultType$2 = {
    offset: 'number',
    method: 'string',
    target: '(string|element)'
  };
  const EVENT_ACTIVATE = `activate${EVENT_KEY$3}`;
  const EVENT_SCROLL = `scroll${EVENT_KEY$3}`;
  const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$3}${DATA_API_KEY$2}`;
  const CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
  const CLASS_NAME_ACTIVE$1 = 'active';
  const SELECTOR_DATA_SPY = '[data-coreui-spy="scroll"]';
  const SELECTOR_NAV_LIST_GROUP$1 = '.nav, .list-group';
  const SELECTOR_NAV_LINKS = '.nav-link';
  const SELECTOR_NAV_ITEMS = '.nav-item';
  const SELECTOR_LIST_ITEMS = '.list-group-item';
  const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}, .${CLASS_NAME_DROPDOWN_ITEM}`;
  const SELECTOR_DROPDOWN$1 = '.dropdown';
  const SELECTOR_DROPDOWN_TOGGLE$1 = '.dropdown-toggle';
  const METHOD_OFFSET = 'offset';
  const METHOD_POSITION = 'position';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class ScrollSpy extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._scrollElement = this._element.tagName === 'BODY' ? window : this._element;
      this._config = this._getConfig(config);
      this._offsets = [];
      this._targets = [];
      this._activeTarget = null;
      this._scrollHeight = 0;
      EventHandler.on(this._scrollElement, EVENT_SCROLL, () => this._process());
      this.refresh();

      this._process();
    } // Getters


    static get Default() {
      return Default$2;
    }

    static get NAME() {
      return NAME$3;
    } // Public


    refresh() {
      const autoMethod = this._scrollElement === this._scrollElement.window ? METHOD_OFFSET : METHOD_POSITION;
      const offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method;
      const offsetBase = offsetMethod === METHOD_POSITION ? this._getScrollTop() : 0;
      this._offsets = [];
      this._targets = [];
      this._scrollHeight = this._getScrollHeight();
      const targets = SelectorEngine.find(SELECTOR_LINK_ITEMS, this._config.target);
      targets.map(element => {
        const targetSelector = getSelectorFromElement(element);
        const target = targetSelector ? SelectorEngine.findOne(targetSelector) : null;

        if (target) {
          const targetBCR = target.getBoundingClientRect();

          if (targetBCR.width || targetBCR.height) {
            return [Manipulator[offsetMethod](target).top + offsetBase, targetSelector];
          }
        }

        return null;
      }).filter(item => item).sort((a, b) => a[0] - b[0]).forEach(item => {
        this._offsets.push(item[0]);

        this._targets.push(item[1]);
      });
    }

    dispose() {
      EventHandler.off(this._scrollElement, EVENT_KEY$3);
      super.dispose();
    } // Private


    _getConfig(config) {
      config = { ...Default$2,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' && config ? config : {})
      };
      config.target = getElement(config.target) || document.documentElement;
      typeCheckConfig(NAME$3, config, DefaultType$2);
      return config;
    }

    _getScrollTop() {
      return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
    }

    _getScrollHeight() {
      return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    }

    _getOffsetHeight() {
      return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
    }

    _process() {
      const scrollTop = this._getScrollTop() + this._config.offset;

      const scrollHeight = this._getScrollHeight();

      const maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();

      if (this._scrollHeight !== scrollHeight) {
        this.refresh();
      }

      if (scrollTop >= maxScroll) {
        const target = this._targets[this._targets.length - 1];

        if (this._activeTarget !== target) {
          this._activate(target);
        }

        return;
      }

      if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
        this._activeTarget = null;

        this._clear();

        return;
      }

      for (let i = this._offsets.length; i--;) {
        const isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (typeof this._offsets[i + 1] === 'undefined' || scrollTop < this._offsets[i + 1]);

        if (isActiveTarget) {
          this._activate(this._targets[i]);
        }
      }
    }

    _activate(target) {
      this._activeTarget = target;

      this._clear();

      const queries = SELECTOR_LINK_ITEMS.split(',').map(selector => `${selector}[data-coreui-target="${target}"],${selector}[href="${target}"]`);
      const link = SelectorEngine.findOne(queries.join(','), this._config.target);
      link.classList.add(CLASS_NAME_ACTIVE$1);

      if (link.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
        SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, link.closest(SELECTOR_DROPDOWN$1)).classList.add(CLASS_NAME_ACTIVE$1);
      } else {
        SelectorEngine.parents(link, SELECTOR_NAV_LIST_GROUP$1).forEach(listGroup => {
          // Set triggered links parents as active
          // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
          SelectorEngine.prev(listGroup, `${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`).forEach(item => item.classList.add(CLASS_NAME_ACTIVE$1)); // Handle special case when .nav-link is inside .nav-item

          SelectorEngine.prev(listGroup, SELECTOR_NAV_ITEMS).forEach(navItem => {
            SelectorEngine.children(navItem, SELECTOR_NAV_LINKS).forEach(item => item.classList.add(CLASS_NAME_ACTIVE$1));
          });
        });
      }

      EventHandler.trigger(this._scrollElement, EVENT_ACTIVATE, {
        relatedTarget: target
      });
    }

    _clear() {
      SelectorEngine.find(SELECTOR_LINK_ITEMS, this._config.target).filter(node => node.classList.contains(CLASS_NAME_ACTIVE$1)).forEach(node => node.classList.remove(CLASS_NAME_ACTIVE$1));
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = ScrollSpy.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
    SelectorEngine.find(SELECTOR_DATA_SPY).forEach(spy => new ScrollSpy(spy));
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .ScrollSpy to jQuery only if jQuery is present
   */

  defineJQueryPlugin(ScrollSpy);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): sidebar.js
   * Licensed under MIT (https://coreui.io/license)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$2 = 'sidebar';
  const DATA_KEY$2 = 'coreui.sidebar';
  const EVENT_KEY$2 = `.${DATA_KEY$2}`;
  const DATA_API_KEY$1 = '.data-api';
  const Default$1 = {};
  const DefaultType$1 = {};
  const CLASS_NAME_BACKDROP = 'sidebar-backdrop';
  const CLASS_NAME_HIDE$1 = 'hide';
  const CLASS_NAME_SHOW$2 = 'show';
  const CLASS_NAME_SIDEBAR_NARROW = 'sidebar-narrow';
  const CLASS_NAME_SIDEBAR_OVERLAID = 'sidebar-overlaid';
  const CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE = 'sidebar-narrow-unfoldable';
  const EVENT_HIDE$2 = `hide${EVENT_KEY$2}`;
  const EVENT_HIDDEN$2 = `hidden${EVENT_KEY$2}`;
  const EVENT_RESIZE = 'resize';
  const EVENT_SHOW$2 = `show${EVENT_KEY$2}`;
  const EVENT_SHOWN$2 = `shown${EVENT_KEY$2}`;
  const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$2}${DATA_API_KEY$1}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY$2}${DATA_API_KEY$1}`;
  const SELECTOR_DATA_CLOSE = '[data-coreui-close="sidebar"]';
  const SELECTOR_DATA_TOGGLE$1 = '[data-coreui-toggle]';
  const SELECTOR_SIDEBAR = '.sidebar';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Sidebar extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._show = this._isVisible();
      this._mobile = this._isMobile();
      this._overlaid = this._isOverlaid();
      this._narrow = this._isNarrow();
      this._unfoldable = this._isUnfoldable();
      this._backdrop = this._initializeBackDrop();

      this._addEventListeners();
    } // Getters


    static get Default() {
      return Default$1;
    }

    static get DefaultType() {
      return DefaultType$1;
    }

    static get NAME() {
      return NAME$2;
    } // Public


    show() {
      EventHandler.trigger(this._element, EVENT_SHOW$2);

      if (this._element.classList.contains(CLASS_NAME_HIDE$1)) {
        this._element.classList.remove(CLASS_NAME_HIDE$1);
      }

      if (this._isMobile()) {
        this._element.classList.add(CLASS_NAME_SHOW$2);

        this._backdrop.show();

        new ScrollBarHelper().hide();
      }

      const complete = () => {
        if (this._isVisible() === true) {
          this._show = true;

          if (this._isMobile() || this._isOverlaid()) {
            this._addClickOutListener();
          }

          EventHandler.trigger(this._element, EVENT_SHOWN$2);
        }
      };

      this._queueCallback(complete, this._element, true);
    }

    hide() {
      EventHandler.trigger(this._element, EVENT_HIDE$2);

      if (this._element.classList.contains(CLASS_NAME_SHOW$2)) {
        this._element.classList.remove(CLASS_NAME_SHOW$2);
      }

      if (this._isMobile()) {
        this._backdrop.hide();

        new ScrollBarHelper().reset();
      } else {
        this._element.classList.add(CLASS_NAME_HIDE$1);
      }

      const complete = () => {
        if (this._isVisible() === false) {
          this._show = false;

          if (this._isMobile() || this._isOverlaid()) {
            this._removeClickOutListener();
          }

          EventHandler.trigger(this._element, EVENT_HIDDEN$2);
        }
      };

      this._queueCallback(complete, this._element, true);
    }

    toggle() {
      if (this._isVisible()) {
        this.hide();
        return;
      }

      this.show();
    }

    narrow() {
      if (!this._isMobile()) {
        this._addClassName(CLASS_NAME_SIDEBAR_NARROW);

        this._narrow = true;
      }
    }

    unfoldable() {
      if (!this._isMobile()) {
        this._addClassName(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE);

        this._unfoldable = true;
      }
    }

    reset() {
      if (!this._isMobile()) {
        if (this._narrow) {
          this._element.classList.remove(CLASS_NAME_SIDEBAR_NARROW);

          this._narrow = false;
        }

        if (this._unfoldable) {
          this._element.classList.remove(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE);

          this._unfoldable = false;
        }
      }
    }

    toggleNarrow() {
      if (this._narrow) {
        this.reset();
        return;
      }

      this.narrow();
    }

    toggleUnfoldable() {
      if (this._unfoldable) {
        this.reset();
        return;
      }

      this.unfoldable();
    } // Private


    _getConfig(config) {
      config = { ...Default$1,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$2, config, DefaultType$1);
      return config;
    }

    _initializeBackDrop() {
      return new Backdrop({
        className: CLASS_NAME_BACKDROP,
        isVisible: this._isMobile(),
        isAnimated: true,
        rootElement: this._element.parentNode,
        clickCallback: () => this.hide()
      });
    }

    _isMobile() {
      return Boolean(window.getComputedStyle(this._element, null).getPropertyValue('--cui-is-mobile'));
    }

    _isNarrow() {
      return this._element.classList.contains(CLASS_NAME_SIDEBAR_NARROW);
    }

    _isOverlaid() {
      return this._element.classList.contains(CLASS_NAME_SIDEBAR_OVERLAID);
    }

    _isUnfoldable() {
      return this._element.classList.contains(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE);
    }

    _isVisible() {
      const rect = this._element.getBoundingClientRect();

      return rect.top >= 0 && rect.left >= 0 && Math.floor(rect.bottom) <= (window.innerHeight || document.documentElement.clientHeight) && Math.floor(rect.right) <= (window.innerWidth || document.documentElement.clientWidth);
    }

    _addClassName(className) {
      this._element.classList.add(className);
    }

    _clickOutListener(event, sidebar) {
      if (event.target.closest(SELECTOR_SIDEBAR) === null) {
        event.preventDefault();
        event.stopPropagation();
        sidebar.hide();
      }
    }

    _addClickOutListener() {
      EventHandler.on(document, EVENT_CLICK_DATA_API$1, event => {
        this._clickOutListener(event, this);
      });
    }

    _removeClickOutListener() {
      EventHandler.off(document, EVENT_CLICK_DATA_API$1);
    } // Sidebar navigation


    _addEventListeners() {
      if (this._mobile && this._show) {
        this._addClickOutListener();
      }

      if (this._overlaid && this._show) {
        this._addClickOutListener();
      }

      EventHandler.on(this._element, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, event => {
        event.preventDefault();
        const toggle = Manipulator.getDataAttribute(event.target, 'toggle');

        if (toggle === 'narrow') {
          this.toggleNarrow();
        }

        if (toggle === 'unfoldable') {
          this.toggleUnfoldable();
        }
      });
      EventHandler.on(this._element, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_CLOSE, event => {
        event.preventDefault();
        this.hide();
      });
      EventHandler.on(window, EVENT_RESIZE, () => {
        if (this._isMobile() && this._isVisible()) {
          this.hide();
          this._backdrop = this._initializeBackDrop();
        }
      });
    } // Static


    static sidebarInterface(element, config) {
      const data = Sidebar.getOrCreateInstance(element, config);

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        Sidebar.sidebarInterface(this, config);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    Array.from(document.querySelectorAll(SELECTOR_SIDEBAR)).forEach(element => {
      Sidebar.sidebarInterface(element);
    });
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  defineJQueryPlugin(Sidebar);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): tab.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's tab.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME$1 = 'tab';
  const DATA_KEY$1 = 'coreui.tab';
  const EVENT_KEY$1 = `.${DATA_KEY$1}`;
  const DATA_API_KEY = '.data-api';
  const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
  const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
  const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
  const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}${DATA_API_KEY}`;
  const CLASS_NAME_DROPDOWN_MENU = 'dropdown-menu';
  const CLASS_NAME_ACTIVE = 'active';
  const CLASS_NAME_FADE$1 = 'fade';
  const CLASS_NAME_SHOW$1 = 'show';
  const SELECTOR_DROPDOWN = '.dropdown';
  const SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
  const SELECTOR_ACTIVE = '.active';
  const SELECTOR_ACTIVE_UL = ':scope > li > .active';
  const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="tab"], [data-coreui-toggle="pill"], [data-coreui-toggle="list"]';
  const SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
  const SELECTOR_DROPDOWN_ACTIVE_CHILD = ':scope > .dropdown-menu .active';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Tab extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$1;
    } // Public


    show() {
      if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && this._element.classList.contains(CLASS_NAME_ACTIVE)) {
        return;
      }

      let previous;
      const target = getElementFromSelector(this._element);

      const listElement = this._element.closest(SELECTOR_NAV_LIST_GROUP);

      if (listElement) {
        const itemSelector = listElement.nodeName === 'UL' || listElement.nodeName === 'OL' ? SELECTOR_ACTIVE_UL : SELECTOR_ACTIVE;
        previous = SelectorEngine.find(itemSelector, listElement);
        previous = previous[previous.length - 1];
      }

      const hideEvent = previous ? EventHandler.trigger(previous, EVENT_HIDE$1, {
        relatedTarget: this._element
      }) : null;
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$1, {
        relatedTarget: previous
      });

      if (showEvent.defaultPrevented || hideEvent !== null && hideEvent.defaultPrevented) {
        return;
      }

      this._activate(this._element, listElement);

      const complete = () => {
        EventHandler.trigger(previous, EVENT_HIDDEN$1, {
          relatedTarget: this._element
        });
        EventHandler.trigger(this._element, EVENT_SHOWN$1, {
          relatedTarget: previous
        });
      };

      if (target) {
        this._activate(target, target.parentNode, complete);
      } else {
        complete();
      }
    } // Private


    _activate(element, container, callback) {
      const activeElements = container && (container.nodeName === 'UL' || container.nodeName === 'OL') ? SelectorEngine.find(SELECTOR_ACTIVE_UL, container) : SelectorEngine.children(container, SELECTOR_ACTIVE);
      const active = activeElements[0];
      const isTransitioning = callback && active && active.classList.contains(CLASS_NAME_FADE$1);

      const complete = () => this._transitionComplete(element, active, callback);

      if (active && isTransitioning) {
        active.classList.remove(CLASS_NAME_SHOW$1);

        this._queueCallback(complete, element, true);
      } else {
        complete();
      }
    }

    _transitionComplete(element, active, callback) {
      if (active) {
        active.classList.remove(CLASS_NAME_ACTIVE);
        const dropdownChild = SelectorEngine.findOne(SELECTOR_DROPDOWN_ACTIVE_CHILD, active.parentNode);

        if (dropdownChild) {
          dropdownChild.classList.remove(CLASS_NAME_ACTIVE);
        }

        if (active.getAttribute('role') === 'tab') {
          active.setAttribute('aria-selected', false);
        }
      }

      element.classList.add(CLASS_NAME_ACTIVE);

      if (element.getAttribute('role') === 'tab') {
        element.setAttribute('aria-selected', true);
      }

      reflow(element);

      if (element.classList.contains(CLASS_NAME_FADE$1)) {
        element.classList.add(CLASS_NAME_SHOW$1);
      }

      let parent = element.parentNode;

      if (parent && parent.nodeName === 'LI') {
        parent = parent.parentNode;
      }

      if (parent && parent.classList.contains(CLASS_NAME_DROPDOWN_MENU)) {
        const dropdownElement = element.closest(SELECTOR_DROPDOWN);

        if (dropdownElement) {
          SelectorEngine.find(SELECTOR_DROPDOWN_TOGGLE, dropdownElement).forEach(dropdown => dropdown.classList.add(CLASS_NAME_ACTIVE));
        }

        element.setAttribute('aria-expanded', true);
      }

      if (callback) {
        callback();
      }
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tab.getOrCreateInstance(this);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config]();
        }
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }

    if (isDisabled(this)) {
      return;
    }

    const data = Tab.getOrCreateInstance(this);
    data.show();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Tab to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Tab);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): toast.js
   * Licensed under MIT (https://coreui.io/license)
   *
   * This component is a modified version of the Bootstrap's toast.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'toast';
  const DATA_KEY = 'coreui.toast';
  const EVENT_KEY = `.${DATA_KEY}`;
  const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
  const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
  const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
  const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
  const EVENT_HIDE = `hide${EVENT_KEY}`;
  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  const EVENT_SHOW = `show${EVENT_KEY}`;
  const EVENT_SHOWN = `shown${EVENT_KEY}`;
  const CLASS_NAME_FADE = 'fade';
  const CLASS_NAME_HIDE = 'hide'; // @deprecated - kept here only for backwards compatibility

  const CLASS_NAME_SHOW = 'show';
  const CLASS_NAME_SHOWING = 'showing';
  const DefaultType = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  const Default = {
    animation: true,
    autohide: true,
    delay: 5000
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Toast extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._timeout = null;
      this._hasMouseInteraction = false;
      this._hasKeyboardInteraction = false;

      this._setListeners();
    } // Getters


    static get DefaultType() {
      return DefaultType;
    }

    static get Default() {
      return Default;
    }

    static get NAME() {
      return NAME;
    } // Public


    show() {
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);

      if (showEvent.defaultPrevented) {
        return;
      }

      this._clearTimeout();

      if (this._config.animation) {
        this._element.classList.add(CLASS_NAME_FADE);
      }

      const complete = () => {
        this._element.classList.remove(CLASS_NAME_SHOWING);

        EventHandler.trigger(this._element, EVENT_SHOWN);

        this._maybeScheduleHide();
      };

      this._element.classList.remove(CLASS_NAME_HIDE); // @deprecated


      reflow(this._element);

      this._element.classList.add(CLASS_NAME_SHOW);

      this._element.classList.add(CLASS_NAME_SHOWING);

      this._queueCallback(complete, this._element, this._config.animation);
    }

    hide() {
      if (!this._element.classList.contains(CLASS_NAME_SHOW)) {
        return;
      }

      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);

      if (hideEvent.defaultPrevented) {
        return;
      }

      const complete = () => {
        this._element.classList.add(CLASS_NAME_HIDE); // @deprecated


        this._element.classList.remove(CLASS_NAME_SHOWING);

        this._element.classList.remove(CLASS_NAME_SHOW);

        EventHandler.trigger(this._element, EVENT_HIDDEN);
      };

      this._element.classList.add(CLASS_NAME_SHOWING);

      this._queueCallback(complete, this._element, this._config.animation);
    }

    dispose() {
      this._clearTimeout();

      if (this._element.classList.contains(CLASS_NAME_SHOW)) {
        this._element.classList.remove(CLASS_NAME_SHOW);
      }

      super.dispose();
    } // Private


    _getConfig(config) {
      config = { ...Default,
        ...Manipulator.getDataAttributes(this._element),
        ...(typeof config === 'object' && config ? config : {})
      };
      typeCheckConfig(NAME, config, this.constructor.DefaultType);
      return config;
    }

    _maybeScheduleHide() {
      if (!this._config.autohide) {
        return;
      }

      if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
        return;
      }

      this._timeout = setTimeout(() => {
        this.hide();
      }, this._config.delay);
    }

    _onInteraction(event, isInteracting) {
      switch (event.type) {
        case 'mouseover':
        case 'mouseout':
          this._hasMouseInteraction = isInteracting;
          break;

        case 'focusin':
        case 'focusout':
          this._hasKeyboardInteraction = isInteracting;
          break;
      }

      if (isInteracting) {
        this._clearTimeout();

        return;
      }

      const nextElement = event.relatedTarget;

      if (this._element === nextElement || this._element.contains(nextElement)) {
        return;
      }

      this._maybeScheduleHide();
    }

    _setListeners() {
      EventHandler.on(this._element, EVENT_MOUSEOVER, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onInteraction(event, false));
      EventHandler.on(this._element, EVENT_FOCUSIN, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onInteraction(event, false));
    }

    _clearTimeout() {
      clearTimeout(this._timeout);
      this._timeout = null;
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Toast.getOrCreateInstance(this, config);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config](this);
        }
      });
    }

  }

  enableDismissTrigger(Toast);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Toast to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Toast);

  /**
   * --------------------------------------------------------------------------
   * CoreUI (v4.2.0): index.esm.js
   * Licensed under MIT (https://coreui.io/license)
   * --------------------------------------------------------------------------
   */
  const index_umd = {
    Alert,
    Button,
    Calendar,
    Carousel,
    Collapse,
    DatePicker,
    DateRangePicker,
    Dropdown,
    LoadingButton,
    Modal,
    MultiSelect,
    Navigation,
    OffCanvas: Offcanvas,
    Popover,
    ScrollSpy,
    Sidebar,
    Tab,
    Timepicker: TimePicker,
    Toast,
    Tooltip
  };

  return index_umd;

}));
//# sourceMappingURL=coreui.js.map
