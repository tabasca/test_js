import { completeAssign } from '../utils';
import { initialState } from '../initial-state';

export default class Model {
	constructor(data, state = initialState) {

		this._state = completeAssign({}, state);
		this._cities = completeAssign({}, data);

		if (typeof this._cities.map !== "function") {
			this._cities = Object.keys(this._cities).map(key => this._cities[key]);
		}

		this.selectedCities = [];

		this.renderedCities = [];

		this.selectCity = this.selectCity.bind(this);

		this.resetFilteredCities();

	}

	get state() {
		return this._state;
	}

	get cities() {
		return this._cities;
	}

	get citiesInSelectedList() {
		let that = this;

		this._citiesInSelectedList = [];

		this._cities.map(function (city) {
			if (city.isSelected) {
				that._citiesInSelectedList.push(city);
			}
		});

		return this._citiesInSelectedList;
	}

	resetFilteredCities() {
		this.filteredCities = Object.assign({}, this.cities);

		if (typeof this.filteredCities.map !== "function") {
			this.filteredCities = Object.keys(this.filteredCities).map(key => this.filteredCities[key]);
		}
	}

	selectCity(avatar) {
		let that = this;

		this._cities.map(function (city) {

			if(city.listItem.elem.innerHTML === avatar._dragZoneElem.innerHTML) {

				that._state.selectedCity = completeAssign({}, city);

				that.selectedCities.push(that._state.selectedCity);

			}
		});
	}

	filterList(filterType, filterSymbols) {

		this._state.isFilterEnabled = true;

		switch (filterType) {
			case 'asc':
				this.sortAlphabetically('asc');
				break;
			case 'desc':
				this.sortAlphabetically('desc');
				break;
			case 'search':
				this.filterByText(filterSymbols);
				break;
			default:
				this.resetFilteredCities();
		}

	}

	sortAlphabetically(filterType) {

		this.filteredCities.sort(function (a, b) {

			let nameA = a.listItem.name.toLowerCase();
			let nameB = b.listItem.name.toLowerCase();

			if (filterType === 'asc') {
				if (nameA < nameB) {
					return -1;
				}

				if (nameA > nameB) {
					return 1;
				}
			} else {
				if (nameA < nameB) {
					return 1;
				}

				if (nameA > nameB) {
					return -1;
				}
			}

			return 0;
		});

	}

	filterByText(text) {

		let that = this;

		if (!text.length) {
			this.resetFilteredCities();

			return;
		}

		this.filteredCities = [];

		this._cities.map(function (city) {
			if (city.listItem.name.toLowerCase().indexOf(text.toLowerCase()) > -1) {
				that.filteredCities.push(city);
			}
		});
	}

	setCitySelected() {
		this._state.selectedCity.isSelected = !this._state.selectedCity.isSelected;

		this._state.isTransferToAnotherList = true;
	}

	endTransfer() {
		this._state.isTransferToAnotherList = false;
	}

	updateSelectedCityDOMelem(newItem) {

		let that = this;

		this.filteredCities.map(function (city) {
			if (city.listItem.elem === newItem) {

				city.listItem.elem = that._state.selectedCity.listItem.elem
			}
		});

		this._state.selectedCity.listItem.elem = newItem;

	}

}