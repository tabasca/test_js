import { sortArr, completeAssign } from '../utils';
import { initialState } from '../initial-state';
import { FilterType } from '../meta';

export default class Model {
	constructor(data = [], state = initialState) {

		this._state = completeAssign({}, state);
		this._baseCities = completeAssign({}, data);

		if (typeof this._baseCities.map !== "function") {
			this._baseCities = Object.keys(this._baseCities).map(key => this._baseCities[key]);
		}

		this.selectCity = this.selectCity.bind(this);

	}

	get state() {
		return this._state;
	}

	get cities() {
		return this._baseCities;
	}

	// get citiesInSelectedList() {
	// 	let that = this;
	//
	// 	this._citiesInSelectedList = [];
	//
	// 	this._cities.map(function (city) {
	// 		if (city.isSelected) {
	// 			that._citiesInSelectedList.push(city);
	// 		}
	// 	});
	//
	// 	return this._citiesInSelectedList;
	// }

	// resetFilteredSelectedCities() {
	// 	this.filteredSelectedCities = Object.assign({}, this.selectedCities);
	//
	// 	if (typeof this.filteredSelectedCities.map !== "function") {
	// 		this.filteredSelectedCities = Object.keys(this.filteredSelectedCities).map(key => this.filteredSelectedCities[key]);
	// 	}
	// }

	selectCity(avatar) {
		let that = this;

		this._baseCities.map(function (city) {

			if(city.listItem.elem.innerHTML === avatar._dragZoneElem.innerHTML) {

				that._state.selectedCity = completeAssign({}, city);

			}
		});
	}

	filterList(filterType, filterSymbols) {

		switch (filterType) {
			case FilterType.ASCENDING:

				this._state.activeBaseFilter = FilterType.ASCENDING;
				this.sortAlphabetically(filterType);
				break;

			case FilterType.DESCENDING:

				this._state.activeBaseFilter = FilterType.DESCENDING;
				this.sortAlphabetically(filterType);
				break;

			case FilterType.SEARCH:

				this._state.activeBaseFilter = FilterType.SEARCH;
				this.filterByText(filterSymbols);
				break;

			case FilterType.FEATURE.indexOf(filterType) !== -1:

				if (this._state.activeSelectedFilter.indexOf(filterType) === -1) {
					this._state.activeSelectedFilter.push(filterType);
				} else {
					this._state.activeSelectedFilter.splice(this._state.activeSelectedFilter.indexOf(filterType), 1);
				}

				this.filterByFeature(this._state.activeSelectedFilter);
				break;

			default:

				this._state.activeBaseFilter = '';
				this._state.activeSelectedFilter = '';

		}

	}

	sortAlphabetically(filterType) {

		this._state.filteredBaseCities = this._baseCities;

		sortArr(this._state.filteredBaseCities, filterType);

	}

	filterByText(text) {

		let that = this;

		this._state.filteredBaseCities = [];

		if (!text.length) {

			this._state.filteredBaseCities = this._baseCities;
			return;
		}

		this._baseCities.map(function (city) {
			if (city.listItem.name.toLowerCase().indexOf(text.toLowerCase()) > -1) {
				that._state.filteredBaseCities.push(city);
			}
		});
	}

	filterByFeature (features) {
		let that = this;

		this._state.filteredSelectedCities = [];

		this.selectedCities.map(function (city) {
			features.every(function (feature) {

				if (city.listItem.featuresArr.indexOf(feature) !== -1) {
					that._state.filteredSelectedCities.push(city);
				}

			});
		});

		console.log('filtered selected cities: ', this._state.filteredSelectedCities);
	}

	setCitySelected () {



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