export function domOperator<T extends HTMLElement = HTMLElement>(selector?: T | Node | string | (() => any)) {
  let els;
  switch (typeof selector) {
    case "string":
      els = document.querySelectorAll(selector);
      break;
    case "object":
      els = [selector ?? window];
      break;
    case "function":
      window.addEventListener('DOMContentLoaded', selector);
      break;
  }

  const $ = {
    on: (e: keyof HTMLElementEventMap | string, listener: <G>(this: T, evt: Event) => void) => {
      els?.forEach(item => item.addEventListener(e, listener.bind(item)));
      return $;
    },
    get: (index = 0) => els[index] as T,
    fromTemplate: () => {
      if (els?.[0]) {
        return document.importNode((els[0] as HTMLTemplateElement).content, true).querySelector<T>(':first-child')
      }
    },
    checked: (checked: boolean) => {
      if (els?.[0]) {
        els[0].checked = checked;
        els[0].dispatchEvent(new Event('change'))
      }
      return $;
    },
    value: (v) => {
      if (els?.[0]) {
        els[0].value = v;
        els[0].dispatchEvent(new Event('change'))
      }
      return $;
    },
    bindFileChooser: (cb: (e: Event) => unknown) => {
      if (els?.[0]) {
        const inputFileEl = document.createElement('input');
        inputFileEl.setAttribute('type', 'file');
        inputFileEl.multiple = true;
        inputFileEl.style.display = 'none';
        els?.[0].addEventListener('click', () => inputFileEl.click());
        inputFileEl.addEventListener('change', cb);

        return inputFileEl;
      }
    },
    serialize: <T>() => Object.fromEntries(new FormData(els[0])) as unknown as T,
  }
  return $;
}
