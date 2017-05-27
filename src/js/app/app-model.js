import { transformToArr, swapItemsInArr, sortArr, completeAssign } from '../utils';
import { initialState } from '../initial-state';
import { ListType, FilterType } from '../meta';

export default class Model {
	constructor (data = [], state = initialState) {
		this._state = completeAssign({}, state);
		this._baseCities = completeAssign({}, data);

		this._baseCities = transformToArr(this._baseCities);
	}

	get state () {
		return this._state;
	}

	get cities () {
		return this._baseCities;
	}

	updateRenderedList (city, listType) {
		switch (listType) {
			case ListType.BASE:
				this._state.renderedBaseCities.push(city);
				break;
			case ListType.SELECTED:
				this._state.renderedSelectedCities.push(city);
				break;
		}
	}

	clearRenderedArr (listType) {
		switch (listType) {
			case ListType.BASE:
				this._state.renderedBaseCities = [];
				break;
			case ListType.SELECTED:
				this._state.renderedSelectedCities = [];
				break;
		}
	}

	getCityObject (elem, list) {
		let cityObj;

		switch (list) {
			case 'cities':
				list = this._state.filteredBaseCities.length ? this._state.filteredBaseCities : this._state.filteredBaseCities = completeAssign({}, this._baseCities);
				break;
			case 'cities-selected':
				list = this._state.filteredSelectedCities.length ? this._state.filteredSelectedCities : this._state.filteredSelectedCities = completeAssign({}, this._state.selectedCities);
				break;
		}

		list = transformToArr(list);

		list.map(function (city) {

			if(city.listItem.elem.innerHTML === elem.innerHTML) {

				cityObj = completeAssign({}, city);

			}
		});

		return cityObj;
	}

	passCityToTheModel (city) {
		this._state.selectedCity = completeAssign({}, city);
	}

	filterList (filterType, filterSymbols) {
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

			case FilterType.FEATURE.sun: case FilterType.FEATURE.cloud: case FilterType.FEATURE.meteor: case FilterType.FEATURE.rain: case FilterType.FEATURE.wind: case FilterType.FEATURE.snow:

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

	sortAlphabetically (filterType) {
		this._state.filteredBaseCities = sortArr(this._baseCities, filterType);
	}

	filterByText (text) {
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
		if (!features.length) {
			this._state.filteredSelectedCities = this._state.selectedCities;
			return false;
		}

		let that = this;

		this._state.filteredSelectedCities = [];
		let appropriateItems = this._state.selectedCities;

		features.forEach(function (feature) {
			that._state.filteredSelectedCities = appropriateItems.filter(function (city) {
				return city.listItem.featuresForFilter.indexOf(feature) !== -1;
			});

			appropriateItems = that._state.filteredSelectedCities;
		});
	}

	swapItems (list, a, b) {
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

			if (this._state.filteredBaseCities.length) {
				this._state.filteredBaseCities.push(this._state.selectedCity);
			}

			if (this._state.renderedBaseCities.length) {
				this._state.renderedBaseCities.push(this._state.selectedCity);
			}

			this._state.renderedSelectedCities.some(function (city, index) {
				counter = index;
				return city.name === that._state.selectedCity.name;
			});
			this._state.renderedSelectedCities.splice(counter, 1);

			this._state.selectedCity.isSelected = false;
		} else {
			this._state.selectedCities.push(this._state.selectedCity);
			this._state.renderedSelectedCities.push(this._state.selectedCity);

			this._baseCities.some(function (city, index) {
				counter = index;
				return city.name === that._state.selectedCity.name;
			});

			this._baseCities.splice(counter, 1);

			if (this._state.filteredBaseCities.length) {
				this._state.filteredBaseCities.some(function (city, index) {
					counter = index;
					return city.name === that._state.selectedCity.name;
				});
				this._state.filteredBaseCities.splice(counter, 1);
			}

			if (this._state.renderedBaseCities.length) {
				this._state.renderedBaseCities.some(function (city, index) {
					counter = index;
					return city.name === that._state.selectedCity.name;
				});
				this._state.renderedBaseCities.splice(counter, 1);
			}

			this._state.selectedCity.isSelected = true;
		}

		this.isTransferToAnotherList = true;
	}

	endTransfer() {
		this.isTransferToAnotherList = false;
	}

	updateSelectedCityDOMelem(newItem) {
		this._state.selectedCity.listItem.elem = newItem;
	}

}