import { domOperator } from "../utils/dom-operator";
import { debounceTime } from "../utils/debounce-time";

(function ($) {
  $(async () => {
    const totalEl = $('.app-search-total').get();
    const btnNextEl = $('.btn-search-next').get();
    const btnPrevEl = $('.btn-search-prev').get();
    const inputEl = $<HTMLInputElement>('.app-search input').get();
    let currentIndex = 0;
    let total: number;
    let query: XPathResult;
    const debounce = debounceTime();

    $(inputEl).on('keyup', (e: KeyboardEvent) => e.key === 'Enter' && btnNextEl.click());
    $(btnNextEl).on('click', () => focusItem("next"));
    $(btnPrevEl).on('click', () => focusItem("prev"));

    $(inputEl).on('input', function () {
      currentIndex = 0;
      total = 0;
      Array.from(document.getElementsByClassName('app-highlight')).forEach(el => el.outerHTML = el.innerHTML);

      debounce(() => {
        if (this.value) {
          const xpath = `//label[contains(text(),'${this.value}')]`;

          query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          total = query.snapshotLength;

          for (let i = 0, length = query.snapshotLength; i < length; ++i) {
            const highlightEl = $('#highlight-tpl').fromTemplate();
            highlightEl.textContent = this.value;
            $(query.snapshotItem(i)).get().innerHTML = $(query.snapshotItem(i)).get().innerHTML.replace(this.value, highlightEl.outerHTML);
          }
        }

        if (total > 0) {
          totalEl.classList.remove('d-none');
          focusItem("curr");
        } else {
          totalEl.classList.add('d-none')
        }
      }, 150);
    });

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
        $(query.snapshotItem(currentIndex))?.get()?.scrollIntoView?.({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });

        $(query.snapshotItem(currentIndex))?.get().querySelector?.('.app-highlight').classList.add('selected');
        totalEl.textContent = (currentIndex + 1) + '/' + total;
      } else if (direction !== 'curr') {
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  })
})(domOperator);
