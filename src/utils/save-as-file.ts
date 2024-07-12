import { weeQuery as $ } from './wee-query';

export function saveAsFile(filename: string, str: string): void {
  const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(str);
  const el = $(document.createElement('a')).attrs({ href, download: filename }).styles({ display: 'none' }).get();
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
}
