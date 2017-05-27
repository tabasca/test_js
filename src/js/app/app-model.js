import { transformToArr, swapItemsInArr, sortArr, completeAssign } from '../utils';
import { initialState } from '../initial-state';
import { FilterType } from '../meta';

export default class Model {
	constructor(data = [], state = initialState) {

		this._state = completeAssign({}, state);
		this._initialData = completeAssign({}, data);
		this._baseCities = completeAssign({}, data);

		this._baseCities = transformToArr(this._baseCities);
		this._initialData = transformToArr(this._initialData);

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

		this._state.filteredBaseCities = sortArr(this._baseCities, filterType);

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

		this._state.selectedCities.map(function (city) {
			features.every(function (feature) {

				if (city.listItem.featuresArr.indexOf(feature) !== -1) {
					that._state.filteredSelectedCities.push(city);
				}

			});
		});

		console.log('filtered selected cities: ', this._state.filteredSelectedCities);
	}

	getReplacedElem(item) {

		let replacedElem;

		this._initialData.map(function (city) {

			if(city.listItem.elem.innerHTML === item.innerHTML) {

				replacedElem = completeAssign({}, city);

			}
		});

		return replacedElem;
	}

	swapItems(list, a, b) {

		switch (list) {
			case 'cities':
				list = this._state.filteredBaseCities.length ? this._state.filteredBaseCities : this._state.filteredBaseCities = completeAssign({}, this._baseCities);
				break;
			case 'cities-selected':
				list = this._state.filteredSelectedCities.length ? this._state.filteredSelectedCities : this._state.filteredSelectedCities = completeAssign({}, this._state.selectedCities);
				break;
		}

		list = transformToArr(list);

		swapItemsInArr(list, a, b);
	}

	setCitySelected () {

		let that = this;
		let counter = 0;

		let isCityAlreadySelected = this._state.selectedCities.some(function (city, index) {
			counter = index;
			return city.name === that._state.selectedCity.name;
		});

		if (isCityAlreadySelected) {
			this._state.selectedCities.splice(counter, 1);
			this._baseCities.push(this._state.selectedCity);

			this._state.selectedCity.isSelected = false;
		} else {
			this._state.selectedCities.push(this._state.selectedCity);

			this._baseCities.some(function (city, index) {
				counter = index;
				return city.name === that._state.selectedCity.name;
			});

			this._baseCities.splice(counter, 1);

			this._state.selectedCity.isSelected = true;
		}

		console.log('this._baseCities: ', this._baseCities);
		console.log('this._state.selectedCities: ', this._state.selectedCities);

		this.isTransferToAnotherList = true;
	}

	endTransfer() {
		this.isTransferToAnotherList = false;
	}

	updateSelectedCityDOMelem(newItem) {

		this._state.selectedCity.listItem.elem = newItem;

	}

}