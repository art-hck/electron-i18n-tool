import { domOperator } from "../utils/dom-operator";
import { debounceTime } from "../utils/debounce-time";
import { eventEmitter } from "../utils/event-emitter";
import escapeHTML from "escape-html";

(function ($) {
  $(async () => {
    const totalEl: HTMLElement = $('.app-search-total').get();
    const btnNextEl: HTMLElement = $('.btn-search-next').get();
    const btnPrevEl: HTMLElement = $('.btn-search-prev').get();
    const inputEl: HTMLInputElement = $<HTMLInputElement>('.app-search input').get();
    let currentIndex = 0;
    let total: number;
    let result: XPathResult;
    const debounce = debounceTime();

    $(inputEl).on('keyup', (e: KeyboardEvent) => e.key === 'Enter' && btnNextEl.click());
    $(btnNextEl).on('click', () => focusItem("next"));
    $(btnPrevEl).on('click', () => focusItem("prev"));

    eventEmitter.on('render-complete', () => search());

    $(inputEl).on('input', function () {
      total = currentIndex = 0;
      [...document.getElementsByClassName('app-highlight')].forEach(el => el.outerHTML = el.innerHTML)

      debounce(() => search(), 150);
    });

    function search() {
      if (inputEl.value) {
        const xpath = `//label[contains(text(),'${inputEl.value}')]`;

        result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        total = result.snapshotLength;
        currentIndex = currentIndex > total ? 0 : currentIndex;

        for (let i = 0; i < total; ++i) {
          const highlightEl = $('#highlight-tpl').fromTemplate();
          highlightEl.textContent = inputEl.value;

          $(result.snapshotItem(i)).get().innerHTML = $(result.snapshotItem(i)).get().innerHTML.replace(escapeHTML(inputEl.value), highlightEl.outerHTML);
        }
      }

      if (total > 0) {
        totalEl.classList.remove('d-none');
        focusItem("curr");
      } else {
        totalEl.classList.add('d-none')
      }
    }

    function focusItem(direction: 'next' | 'prev' | 'curr') {
      if (total > 0) {
        switch (direction) {
          case "next":
            currentIndex === (total - 1) ? (currentIndex = 0) : currentIndex++;
            break;
          case "prev":
            currentIndex === 0 ? (currentIndex = (total - 1)) : currentIndex--;
            break;
        }

        Array.from(document.getElementsByClassName('app-highlight')).forEach(el => el.classList.remove('selected'));
        $(result.snapshotItem(currentIndex))?.get()?.scrollIntoView?.({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });

        $(result.snapshotItem(currentIndex))?.get().querySelector?.('.app-highlight').classList.add('selected');
        totalEl.textContent = (currentIndex + 1) + '/' + total;
      } else if (direction !== 'curr') {
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  })
})(domOperator);
