import { Wee, weeQuery as $ } from '../utils/wee-query';
import { saveAsFile } from '../utils/save-as-file';

type TableConfig = {
  form: Wee;
  tableEl: Element;
  tableHeadRowEl: Element;
  tableHeadColTpl: Wee;
  rowTpl: Wee;
  colTpl: Wee;
  getTHLabelEl: (tableHeadEl: Element) => Element;
  getTHRemoveBtn: (tableHeadEl: Element) => Wee;
  getTHDownloadBtn: (tableHeadEl: Element) => Wee;
  getRowLabelEl: (rowEl: Element) => Element;
  getColLabelEl: (colEl: Element) => Element;
  getColInputEl: (colEl: Element) => HTMLInputElement;
};

export class Table {
  private readonly formSeperator = '__#__';
  private readonly tableData: { [filename: string]: string[][] } = {};
  private tableKeys: string[] = [];
  private onRenderCompleteFn?: () => unknown;

  constructor(private readonly config: TableConfig) {}

  public updateData(filename: string, data: string[][]): void {
    this.tableData[filename] = data;
    this.tableKeys = [...new Set([...this.tableKeys, ...this.tableData[filename].map(([k]) => k)])];
    this.render();
  }

  public onRenderComplete(onRenderCompleteFn: () => unknown): void {
    this.onRenderCompleteFn = onRenderCompleteFn;
  }

  private render(): void {
    this.renderReset();
    Object.keys(this.tableData).forEach(colName => this.renderHeadRow(colName));
    this.tableKeys.forEach(key => this.renderRow(key));
    this.onRenderCompleteFn?.();
  }

  private renderReset(): void {
    const tableHeadRowEl = this.config.tableHeadRowEl;
    tableHeadRowEl.innerHTML = '<div class="col"></div>';
    this.config.tableEl.innerHTML = '';
    this.config.tableEl.append(tableHeadRowEl);
  }

  private renderHeadRow(colName: string): void {
    const tableHeadEl = this.config.tableHeadColTpl.fromTemplate()!;
    const tableHeadRowEl = this.config.tableHeadRowEl;
    this.config.getTHLabelEl(tableHeadEl).textContent = colName;
    this.config.getTHDownloadBtn(tableHeadEl).on('click', () => this.downloadColAsFile(colName));
    this.config.getTHRemoveBtn(tableHeadEl).on('click', () => this.removeCol(colName));
    tableHeadRowEl.appendChild(tableHeadEl);
  }

  private renderRow(key: string): void {
    const rowEl = this.config.rowTpl.fromTemplate()!;
    this.config.getRowLabelEl(rowEl).textContent = key;

    Object.keys(this.tableData).forEach(colName => {
      const [, value]: string[] = this.tableData[colName].find(([k]) => k === key) ?? [key, ''];
      const colEl = this.config.colTpl.fromTemplate()!;
      const labelEl = this.config.getColLabelEl(colEl);
      const inputEl = this.config.getColInputEl(colEl);

      labelEl.textContent = value;
      inputEl.value = value;
      inputEl.name = colName + this.formSeperator + key;

      $(labelEl).on('click', function () {
        labelEl.classList.add('d-none');
        inputEl.type = 'text';
        inputEl.focus();
      });

      $(inputEl).on('blur', function () {
        inputEl.type = 'hidden';
        labelEl.classList.remove('d-none');
        labelEl.textContent = inputEl.value;
      });

      $(inputEl).on('keyup', e => (e as KeyboardEvent).key === 'Enter' && inputEl.blur());

      rowEl.appendChild(colEl);
    });

    this.config.tableEl.appendChild(rowEl);
  }

  private downloadColAsFile(colName: string): void {
    saveAsFile(
      colName,
      Object.entries(this.config.form.serialize()!)
        .filter(([k, v]) => k.includes(colName + this.formSeperator) && v)
        .map(([k, v]) => k.replace(colName + this.formSeperator, '') + '=' + v)
        .join('\n'),
    );
  }

  private removeCol(colName: string): void {
    delete this.tableData[colName];
    this.tableKeys = Object.values(this.tableData)
      .map(items =>
        items.reduce((acc, [k]) => {
          if (!acc.includes(k)) acc.push(k);
          return acc;
        }, []),
      )
      .reduce((acc, curr) => [...new Set([...acc, ...curr])], []);
    this.render();
  }
}
