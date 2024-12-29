import { Point } from "../classes/Point";

/**
 * A class representing a component in the Bridge Presentation Presenter.
 * 
 * It corresponds to a single HTML element.
 */
export default class View {
  
  private _root: HTMLElement; // todo make private
  private _hidden = false;
  private eventListeners: Map<string, EventListener> = new Map();

  constructor(template: string) {
    // temporary template element to parse the template
    const templateElement = document.createElement('div');
    templateElement.innerHTML = template.trim();
    // temporary element is discarded, root is the first child of the template
    this._root = templateElement.firstElementChild as HTMLElement;
  }

  /**
   * Returns the root element of the view.
   */
  public get root(): HTMLElement {
    return this._root;
  }

  /**
   * Attaches the view to the given parent element.
   */
  attach(parent: HTMLElement): void {
    parent.appendChild(this.root);
  }

  /**
   * Appends a child view to the root element of this view.
   * 
   * The subview will be appended as the last child of the root element.
   */
  addSubView(view: View): void {
    view.attach(this.root);
  }

  /**
   * Detaches the view from the DOM.
   */
  detach(): void {
    if (this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
  }

  /**
   * Hides the view by setting the display style to 'none'.
   */
  public hide(): void {
    this.hidden = true;
  }

  /**
   * Shows the view by unsetting display='none'.
   */
  public show(): void {
    this.hidden = false;
  }

  get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    if (this.hidden === value) return;
    this._hidden = value;
    this.root.style.display = value ? 'none' : '';
  }

  /**
   * Returns the height of the view.
   * 
   * The view must be attached to the DOM before calling this method.
   */
  public get height(): number {
    console.assert(this.root.parentElement, 'View must be attached to the DOM before calling height');
    return this.root.offsetHeight;
  }

  /**
   * Returns the width of the view.
   * 
   * The view must be attached to the DOM before calling this method.
   */
  public get width(): number {
    console.assert(this.root.parentElement, 'View must be attached to the DOM before calling width');
    return this.root.offsetWidth;
  }

  /**
   * Returns the position of the top-left corner of the view relative to the top-left corner of the document.
   */
  public get start(): Point {
    console.assert(this.root.parentElement, 'View must be attached to the DOM before calling start');
    const rect = this.root.getBoundingClientRect();
    return new Point(rect.left + window.scrollX, rect.top + window.scrollY);
  }

  /**
   * Sets a class on the root element of the view.
   * @param className  class name to toggle
   * @param state value to set the class to. If not provided, the class will be toggled: added if it doesn't exist, removed if it does.
   */
  toggleClass(className: string, state?: boolean): void {
    if (state === true) {
      this.root.classList.add(className); // Add the class if state is true
    } else if (state === false) {
      this.root.classList.remove(className); // Remove the class if state is false
    } else {
      this.root.classList.toggle(className); // Toggle the class if state is undefined
    }
  }

  /**
   * Adds a class to the root
   * @param className class name to add
   */
  addClass(className: string): void {
    this.root.classList.add(className);
  }

  /**
   * Removes a class from the root
   * @param className class name to remove
   */
  removeClass(className: string): void {
    this.root.classList.remove(className);
  }

  /**
   * Add an event listener to the root element, with optional namespace support.
   */
  on(event: string, callback: EventListener): void {
    const [eventType, namespace] = this.parseEvent(event);
    const key = namespace ? `${eventType}.${namespace}` : eventType;

    // Add the event listener
    this.root.addEventListener(eventType, callback);

    // Track the listener for future removal
    this.eventListeners.set(key, callback);
  }

  /**
   * Remove an event listener from the root element, with optional namespace support.
   */
  off(event: string): void {
    const [eventType, namespace] = this.parseEvent(event);

    // Remove specific namespaced listeners or all listeners of the event type
    for (const [key, callback] of this.eventListeners) {
      const [keyType, keyNamespace] = this.parseEvent(key);

      if (eventType === keyType && (!namespace || namespace === keyNamespace)) {
        this.root.removeEventListener(keyType, callback);
        this.eventListeners.delete(key);
      }
    }
  }

  /**
   * Helper to parse an event string into type and namespace.
   */
  private parseEvent(event: string): [string, string | undefined] {
    const [eventType, namespace] = event.split(".");
    return [eventType, namespace];
  }


  /**
   * Fades in the view.
   */
  fadeIn(duration: number = 500): void {
    this.root.style.opacity = '0';
    this.root.style.display = ''; // Reset display in case it was hidden
    this.root.style.transition = `opacity ${duration}ms ease-in`;

    setTimeout(() => {
      this.root.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      this.root.style.transition = ''; // Clean up transition
    }, duration);
  }

  /**
   * Fades out the view.
   */
  fadeOut(duration: number = 500): void {
    this.root.style.opacity = '1'; // Ensure opacity starts at 1
    this.root.style.transition = `opacity ${duration}ms ease-out`;

    setTimeout(() => {
      this.root.style.opacity = '0';
    }, 10);

    setTimeout(() => {
      this.root.style.display = 'none'; // Hide element after fade-out
      this.root.style.transition = ''; // Clean up transition
    }, duration);
  }

  /**
   * Slides up the view.
   */
  slideUp(duration: number = 500): void {
    const element = this.root;
    element.style.transition = `height ${duration}ms ease, margin ${duration}ms ease, padding ${duration}ms ease`;
    element.style.overflow = 'hidden';
    element.style.height = `${element.offsetHeight}px`;

    // Trigger reflow to ensure the height is set before collapsing
    element.offsetHeight;

    element.style.height = '0';
    element.style.paddingTop = '0';
    element.style.paddingBottom = '0';
    element.style.marginTop = '0';
    element.style.marginBottom = '0';

    setTimeout(() => {
      element.style.display = 'none'; // Hide the element
      element.style.removeProperty('height');
      element.style.removeProperty('padding-top');
      element.style.removeProperty('padding-bottom');
      element.style.removeProperty('margin-top');
      element.style.removeProperty('margin-bottom');
      element.style.removeProperty('overflow');
      element.style.removeProperty('transition');
    }, duration);
  }

  /**
   * Slides down the view.
   */
  slideDown(duration: number = 500): void {
    const element = this.root;
    element.style.removeProperty('display'); // Ensure it's not hidden
    const display = window.getComputedStyle(element).display;
    if (display === 'none') {
      element.style.display = 'block'; // Default to block if none
    }

    const height = element.offsetHeight; // Get the full height

    // Set initial styles for sliding
    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.paddingTop = '0';
    element.style.paddingBottom = '0';
    element.style.marginTop = '0';
    element.style.marginBottom = '0';

    // Trigger reflow
    element.offsetHeight;

    element.style.transition = `height ${duration}ms ease, margin ${duration}ms ease, padding ${duration}ms ease`;
    element.style.height = `${height}px`;
    element.style.paddingTop = '';
    element.style.paddingBottom = '';
    element.style.marginTop = '';
    element.style.marginBottom = '';

    setTimeout(() => {
      element.style.removeProperty('height');
      element.style.removeProperty('overflow');
      element.style.removeProperty('transition');
    }, duration);
  }
}
