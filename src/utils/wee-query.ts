export class Wee<T extends Element = Element> {
  constructor(private readonly els: Array<T>) {}

  private get el(): T | null {
    return this.els[0];
  }

  on(e: keyof HTMLElementEventMap | string, listener: (this: T, e: Event) => void): this {
    this.els.forEach(item => item.addEventListener(e, listener.bind(item)));
    return this;
  }

  get(index = 0): T {
    return this.els[index];
  }

  getAll(): T[] {
    return this.els;
  }

  fromTemplate(): T | null | undefined {
    if (this.el instanceof HTMLTemplateElement) {
      return document.importNode(this.el.content, true).querySelector<T>(':first-child');
    }
  }

  value(v: string | boolean, c: { emitEvent: boolean } = { emitEvent: true }): this {
    if (this.el instanceof HTMLInputElement) {
      if (typeof v === 'string') this.el.value = v;
      if (typeof v === 'boolean') this.el.checked = v;
      if (c.emitEvent) this.el.dispatchEvent(new Event('change'));
    }
    return this;
  }

  attrs(attrs: Record<string, string>): this {
    Object.entries(attrs).forEach(([k, v]) => this.el instanceof Element && this.el.setAttribute(k, v));
    return this;
  }

  styles(styles: Record<string, string>): this {
    Object.entries(styles).forEach(([k, v]) => this.el instanceof HTMLElement && this.el.style.setProperty(k, v));
    return this;
  }

  selectFileOnClick(cb: (fileList: FileList | null) => unknown): this {
    if (this.el) {
      const inputFile = weeQuery<HTMLInputElement>(document.createElement('input'))
        .attrs({ type: 'file', multiple: 'true' })
        .on('change', () => cb(inputFile.get().files))
        .on('change', () => inputFile.value('', { emitEvent: false }))
        .styles({ display: 'none' });
      this.on('click', () => inputFile.get().click());
    }

    return this;
  }

  serialize<T = { [k: string]: unknown }>(): T | null {
    return this.el instanceof HTMLFormElement && (Object.fromEntries(new FormData(this.el)) as unknown as T) || null;
  }
}

export function weeQuery<T extends Element = Element>(...selectors: Array<T | Element | string | (() => unknown)>): Wee<T> {
  return new Wee(
    selectors.reduce(
      (els, selector) => {
        if (typeof selector === 'string') return els.map(el => [...el.querySelectorAll<T>(selector)]).reduce((a, c) => [...a, ...c], []);
        if (typeof selector === 'object') return [selector as T];
        if (typeof selector === 'function') window.addEventListener('DOMContentLoaded', selector);
        return [];
      },
      [document as unknown as T],
    ),
  ) as Wee<T>;
}
