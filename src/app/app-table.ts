import { domOperator } from "../utils/dom-operator";
import { saveAsFile } from "../utils/save-as-file";
import { eventEmitter } from "../utils/event-emitter";

(function ($) {
  $(async () => {
    const rowTpl = $('#row-tpl');
    const colTpl = $('#col-tpl');
    const tableHeadTpl = $('#table-head-tpl');
    const tableEl = $<HTMLElement>('.app-table').get();
    const tableHeadRowEl = $<HTMLElement>('.app-table-head-row').get();
    const tableData: { [filename: string]: string[][] } = {};
    let tableKeys = [];

    $('.app-btn-add').bindFileChooser(function () {
      [...this.files].forEach(async (file) => {
        tableData[file.name] = (await file.text())
          .split(/\r?\n/)
          .map(row => row.split(/=(.*)/s))
          .filter(([k, v]) => !!k && !!v)
        tableKeys = [...new Set([...tableKeys, ...tableData[file.name].map(([k]) => k)])];
        render();
      });
      this.value = null;
    });

    function render() {
      tableEl.innerHTML = '';
      tableHeadRowEl.innerHTML = '<div class="col"></div>'
      tableEl.append(tableHeadRowEl);

      Object.keys(tableData).forEach(colName => {
        const tableHeadEl = tableHeadTpl.fromTemplate();
        tableHeadEl.querySelector('.table-head-label').textContent = colName;
        tableHeadRowEl.appendChild(tableHeadEl);

        $(tableHeadEl.querySelector('.download')).on('click', () => {
          saveAsFile(colName, Object.entries($('.form').serialize())
            .filter(([k, v]) => k.includes(colName + '__#__') && v)
            .map(([k, v]) => k.replace(colName + '__#__', '') + '=' + v)
            .join('\n'));
        });

        $(tableHeadEl.querySelector('.remove')).on('click', () => {
          delete tableData[colName];
          tableKeys = Object.values(tableData)
            .map(items => items.reduce((acc, [k]) => {
              if (!acc.includes(k)) acc.push(k);
              return acc;
            }, []))
            .reduce((acc, curr) => [...new Set([...acc, ...curr])], []);
          render();
        });
      });
      $('.form').on('submit', (e) => e.preventDefault());

      tableKeys.forEach((key) => {
        const rowEl = rowTpl.fromTemplate();

        rowEl.querySelector('label').textContent = key;
        Object.keys(tableData).forEach((colName) => {
          const item = tableData[colName].find(([k]) => k === key);
          const colEl = colTpl.fromTemplate();
          const labelEl = colEl.querySelector('label');
          const inputEl = colEl.querySelector('input');
          labelEl.textContent = item?.[1] ?? '';

          inputEl.value = item?.[1] ?? '';
          inputEl.name = colName + '__#__' + key;

          $(labelEl).on('click', function () {
            this.style.display = 'none';
            inputEl.type = 'text';
            inputEl.focus();
          });

          $(inputEl).on('blur', function () {
            inputEl.type = 'hidden';
            $(labelEl).get().style.removeProperty('display');
            labelEl.textContent = inputEl.value;
          });

          $(inputEl).on('keyup', function (e: KeyboardEvent) {
            if (e.key === 'Enter') {
              this.blur();
            }
          })

          rowEl.appendChild(colEl);
        })

        tableEl.appendChild(rowEl);
      });
      eventEmitter.emit('render-complete');
    }
  });
})(domOperator)
