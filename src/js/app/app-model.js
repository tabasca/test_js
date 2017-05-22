import { completeAssign } from '../utils';
import { initialState } from '../initial-state';

export default class Model {
	constructor(data) {

		this.selectedCities = [];

		this._data = completeAssign({}, data);
		this._state = completeAssign({}, initialState);

		this.cities = [];

		this.selectCity = this.selectCity.bind(this);

	}

	get state() {
		return this._state;
	}

	get data() {
		return this._data;
	}

	selectCity(item) {

		this.getSelectedCityData(item);

		this.selectedCities.push(this._state.selectedCity);

	}

	getSelectedCityData(item) {

		let that = this;

		this.cities.forEach(function (city) {
			if (city.elem == item) {

				that._state.selectedCity = completeAssign({}, city);

			}
		});

	}

}