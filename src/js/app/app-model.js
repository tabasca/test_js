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
		this.filteredCities = [];
		this.renderedCities = [];

		this.selectCity = this.selectCity.bind(this);

	}

	get state() {
		return this._state;
	}

	get cities() {
		return this._cities;
	}

	selectCity(city) {

		this._state.selectedCity = completeAssign({}, city);
		this._state.areThereSelectedElems = true;

		this.selectedCities.push(this._state.selectedCity);

	}

	sortList() {
		if (this._state.isFilterEnabled) {
			this.sortAlphabetically();
		} else {
			this.filteredCities = [];
		}
	}

	sortAlphabetically() {
		this.filteredCities = Object.assign({}, this.cities);

		if (typeof this.filteredCities.map !== "function") {
			this.filteredCities = Object.keys(this.filteredCities).map(key => this.filteredCities[key]);
		}

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

	updateSelectedCityDOMelem(newItem) {

		this._state.selectedCity.listItem.elem = newItem;

	}

}