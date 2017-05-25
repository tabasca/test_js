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

		this.filteredCities = Object.assign({}, this.cities);

		if (typeof this.filteredCities.map !== "function") {
			this.filteredCities = Object.keys(this.filteredCities).map(key => this.filteredCities[key]);
		}
		this.renderedCities = [];

		this.selectCity = this.selectCity.bind(this);

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

	selectCity(avatar) {
		let that = this;

		this._cities.map(function (city) {

			if(city.listItem.elem.innerHTML === avatar._dragZoneElem.innerHTML) {

				that._state.selectedCity = completeAssign({}, city);

				that.selectedCities.push(that._state.selectedCity);

			}
		});
	}

	sortList() {
		if (this._state.isFilterEnabled) {
			this.sortAlphabetically();
		} else {
			this.filteredCities = [];
		}
	}

	sortAlphabetically() {

		this.filteredCities.sort(function (a, b) {

			let nameA = a.listItem.name.toLowerCase();
			let nameB = b.listItem.name.toLowerCase();

			if (nameA < nameB) {
				return -1;
			}

			if (nameA > nameB) {
				return 1;
			}

			return 0;
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