import { Search } from './app.search';
import { weeQuery as $ } from '../utils/wee-query';
import { initNav } from '../utils/init-nav';
import { Table } from './app.table';

$(() => {
  const totalEl = $<HTMLElement>('.app-search-total').get();

  const table = new Table({
    form: $('.form').on('submit', e => e.preventDefault()),
    tableEl: $('.app-table').get(),
    tableHeadRowEl: $('.app-table-head-row').get(),
    tableHeadColTpl: $('#table-head-col-tpl'),
    rowTpl: $('#row-tpl'),
    colTpl: $('#col-tpl'),
    getTHLabelEl: (tableHeadEl: Element) => $(tableHeadEl, '.table-head-label').get(),
    getTHRemoveBtn: (tableHeadEl: Element) => $(tableHeadEl, '.remove'),
    getTHDownloadBtn: (tableHeadEl: Element) => $(tableHeadEl, '.download'),
    getRowLabelEl: (rowEl: Element) => $(rowEl, 'label').get(),
    getColLabelEl: (colEl: Element) => $(colEl, 'label').get(),
    getColInputEl: (colEl: Element) => $<HTMLInputElement>(colEl, 'input').get(),
  });

  const search = new Search({
    inputEl: $<HTMLInputElement>('.app-search input').get(),
    highlightTpl: $('#highlight-tpl'),
    highlightClass: 'app-highlight',
    selectedClass: 'selected',
    nextBtn: $('.btn-search-next'),
    prevBtn: $('.btn-search-prev'),
    onScrollTo: (currentIndex, total) => (totalEl.textContent = currentIndex + 1 + '/' + total),
    onSearchComplete: total => {
      totalEl.classList[total > 0 ? 'remove' : 'add']('d-none');
      total > 0 && search.scrollTo('curr');
    },
  });

  initNav();

  table.onRenderComplete(() => search.exec());

  $('.app-btn-add').selectFileOnClick(files => {
    [...(files ?? [])].forEach(async file => {
      table.updateData(
        file.name,
        (await file.text())
          .split(/\r?\n/)
          .map(row => row.split(new RegExp(/=(.*)/, 's')))
          .filter(([k, v]) => !!k && !!v),
      );
    });
  });
});
