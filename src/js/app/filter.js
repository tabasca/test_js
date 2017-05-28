export default class Filter {
	constructor () {
		this.ascFilterBtn = document.getElementById('cities-sort-asc');
		this.descFilterBtn = document.getElementById('cities-sort-desc');
		this.searchInput = document.querySelector('.cities-filters-name');
		this.featureFilters = document.querySelectorAll('[name="cities-features"]');
	}

	set setFilterEnabled (handler) {
		return this._setFilterEnabled = handler;
	}

	bindEvents () {
		let that = this;

		this.ascFilterBtn.addEventListener('click', this._setFilterEnabled);
		this.descFilterBtn.addEventListener('click', this._setFilterEnabled);
		this.searchInput.addEventListener('input', this._setFilterEnabled);

		for (let i = 0; i < this.featureFilters.length; i++) {
			that.featureFilters[i].addEventListener('change', that._setFilterEnabled);
		}
	}

	resetBaseFilters () {
		this.ascFilterBtn.checked = false;
		this.descFilterBtn.checked = false;
		this.searchInput.value = '';
	}

	resetFeaturesFilter () {
		let that = this;

		for (let i = 0; i < this.featureFilters.length; i++) {
			that.featureFilters[i].checked = false;
		}
	}

	unbindEvents () {
		let that = this;

		this.ascFilterBtn.removeEventListener('click', this._setFilterEnabled);
		this.descFilterBtn.removeEventListener('click', this._setFilterEnabled);
		this.searchInput.removeEventListener('input', this._setFilterEnabled);

		for (let i = 0; i < this.featureFilters.length; i++) {
			that.featureFilters[i].removeEventListener('change', that._setFilterEnabled);
		}
	}
}