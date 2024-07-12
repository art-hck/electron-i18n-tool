import { weeQuery as $ } from './wee-query';
import { ipcRenderer } from 'electron';

export function initNav(): void {
  const resizeIconEl = $('.app-resize i').get();

  $('.app-minimize').on('click', () => ipcRenderer.invoke('main-minimize'));
  $('.app-close').on('click', () => ipcRenderer.invoke('main-close'));
  $('.app-resize').on('click', () => ipcRenderer.invoke('main-toggle-maximize'));

  ipcRenderer.on('unmaximize', () => {
    resizeIconEl.classList.remove('bi-fullscreen-exit');
    resizeIconEl.classList.add('bi-square');
  });

  ipcRenderer.on('maximize', () => {
    resizeIconEl.classList.add('bi-fullscreen-exit');
    resizeIconEl.classList.remove('bi-square');
  });
}
