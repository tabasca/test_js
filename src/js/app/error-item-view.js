import { getElementFromTemplate } from '../utils';

export default class ErrorItemView {
  constructor (data) {
    this.data = data;
  }

  get elem () {
    if (!this._elem) {
      this._elem = getElementFromTemplate(this.getMarkup());

      this.btnToResetFilters = this._elem.querySelector('.error-message-reset');
    }

    return this._elem;
  }

  set onResetFiltersBtnClick (handler) {
    this._onResetFiltersBtnClick = handler;
    return this._onResetFiltersBtnClick;
  }

  getMarkup () {
    return `<div class="error-message">
          <p>Ни один из вариантов не подходит под выбранные фильтры, попробуйте <span class="error-message-reset" role="button">сбросить фильтры</span> или смягчить условия поиска.</p>
        </div>`;
  }

  removeItem () {
    this._elem.remove();
    this.unbindEvents();
  }

  bindEvents () {
    this.btnToResetFilters.addEventListener('click', this._onResetFiltersBtnClick);
  }

  unbindEvents () {
    this.btnToResetFilters.removeEventListener('click', this._onResetFiltersBtnClick);
  }
};
