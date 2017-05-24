import { completeAssign } from '../utils';
import { initialState } from '../initial-state';

export default class Model {
	constructor(data, state = initialState) {

		this.selectedCities = [];

		this._data = completeAssign({}, data);
		this._state = completeAssign({}, state);

		this.cities = [];

		this.selectCity = this.selectCity.bind(this);

	}

	get state() {
		return this._state;
	}

	get data() {
		return this._data;
	}

	selectCity(city) {

		this._state.selectedCity = completeAssign({}, city);
		this._state.areThereSelectedElems = true;

		this.selectedCities.push(this._state.selectedCity);

	}

	updateSelectedCityDOMelem(newItem) {

		this._state.selectedCity.listItem.elem = newItem;

	}

}