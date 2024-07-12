import { Wee, weeQuery as $ } from '../utils/wee-query';
import { debounceTime } from '../utils/debounce-time';

export class Search {
  private readonly debounce = debounceTime();
  private currentIndex = 0;
  private total = 0;
  private result?: XPathResult;

  constructor(
    private readonly config: {
      inputEl: HTMLInputElement;
      highlightClass: string;
      selectedClass: string;
      highlightTpl: Wee;
      nextBtn: Wee;
      prevBtn: Wee;
      onSearchComplete?: (total: number) => unknown;
      onScrollTo?: (currentIndex: number, total: number) => unknown;
    },
  ) {
    $(this.config.inputEl)
      .on('keyup', e => (e as KeyboardEvent).key === 'Enter' && this.scrollTo('next'))
      .on('input', () => {
        this.reset();
        this.debounce(() => this.exec(), 150);
      });

    this.config.nextBtn.on('click', () => this.scrollTo('next'));
    this.config.prevBtn.on('click', () => this.scrollTo('prev'));
  }

  public exec(): void {
    if (this.config.inputEl.value) {
      const xpath = `//label[contains(text(),'${this.config.inputEl.value}')]`;

      this.result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE /*, null*/);
      this.total = this.result.snapshotLength;
      this.currentIndex = this.currentIndex > this.total ? 0 : this.currentIndex;

      for (let i = 0; i < this.total; ++i) {
        const highlightEl = this.config.highlightTpl.fromTemplate()!;
        highlightEl.textContent = this.config.inputEl.value;
        this.getResultItem(i).innerHTML = this.getResultItem(i).innerText.replace(this.config.inputEl.value, highlightEl.outerHTML);
      }
    }

    this.config.onSearchComplete?.(this.total);
  }

  public scrollTo(direction: 'next' | 'prev' | 'curr'): void {
    if (this.total > 0) {
      if (direction === 'next') {
        this.currentIndex === this.total - 1 ? (this.currentIndex = 0) : this.currentIndex++;
      }

      if (direction === 'prev') {
        this.currentIndex === 0 ? (this.currentIndex = this.total - 1) : this.currentIndex--;
      }

      Array.from(document.getElementsByClassName(this.config.highlightClass)).forEach(el => el.classList.remove(this.config.selectedClass));
      this.getResultItem(this.currentIndex)?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });

      this.getResultItem(this.currentIndex)?.querySelector?.(`.${this.config.highlightClass}`)?.classList.add(this.config.selectedClass);
      this.config.onScrollTo?.(this.currentIndex, this.total);
    } else if (direction !== 'curr') {
      this.config.inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private reset(): void {
    this.total = this.currentIndex = 0;
    [...document.getElementsByClassName(this.config.highlightClass)].forEach(el => (el.outerHTML = el.innerHTML));
  }

  private getResultItem(index: number): HTMLElement {
    return this.result?.snapshotItem(index) as HTMLElement;
  }
}
