import { domOperator } from "../utils/dom-operator";
import { ipcRenderer } from "electron";

(function ($) {
  $(async () => {
    const btnEl = $('.app-resize i').get(0);

    $('.app-minimize').on('click', () => ipcRenderer.invoke('main-minimize'));
    $('.app-close').on('click', () => ipcRenderer.invoke('main-close'));
    $('.app-resize').on('click', () => ipcRenderer.invoke('main-toggle-maximize'));

    ipcRenderer.on('unmaximize', () => {
      btnEl.classList.remove('bi-fullscreen-exit');
      btnEl.classList.add('bi-square');
    });

    ipcRenderer.on('maximize', () => {
      btnEl.classList.add('bi-fullscreen-exit');
      btnEl.classList.remove('bi-square');
    });
  });
})(domOperator);
