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

  updateRenderedList (city, listToAdd, listToSplice) {
    let counter;
    let that = this;
    switch (listToAdd) {
      case ListType.BASE:
        this._state.renderedBaseCities.push(city);
        break;
      case ListType.SELECTED:
        this._state.renderedSelectedCities.push(city);
        break;
    }

    if (listToSplice) {
      switch (listToSplice) {
        case ListType.BASE:

          this._state.renderedBaseCities.some(function (city, index) {
            counter = index;
            return city.name === that._state.selectedCity.name;
          });

          this._state.renderedBaseCities.splice(counter, 1);
          break;
        case ListType.SELECTED:

          this._state.renderedSelectedCities.some(function (city, index) {
            counter = index;
            return city.name === that._state.selectedCity.name;
          });

          this._state.renderedSelectedCities.splice(counter, 1);
          break;
      }
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

  resetFilters (listType) {
    switch (listType) {
      case ListType.BASE:
        this._state.activeBaseFilter = null;
        this._state.filteredBaseCities = [];
        break;
      case ListType.SELECTED:
        this._state.activeSelectedFilter = [];
        this._state.filteredSelectedCities = [];
        break;
    }
  }

  getCityObject (elem, list) {
    let cityObj;

    switch (list) {
      case 'cities':
        list = this._state.renderedBaseCities;
        break;
      case 'cities-selected':
        list = this._state.renderedSelectedCities;
        break;
    }

    list = transformToArr(list);

    list.map(function (city) {
      if (city.listItem.elem.innerHTML === elem.innerHTML) {
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
    this._state.filteredBaseCities = sortArr(this._state.renderedBaseCities, filterType);
  }

  filterByText (text) {
    let that = this;

    this._state.filteredBaseCities = [];

    if (!text.length) {
      this._state.filteredBaseCities = this._baseCities;
      return;
    }

    this._baseCities.map(function (city) {
      let cityToCheck = completeAssign({}, city);
      if (cityToCheck.listItem.name.toLowerCase().indexOf(text.toLowerCase()) > -1) {
        that.highlightTextOnSearch(cityToCheck, text);
        that._state.filteredBaseCities.push(cityToCheck);
      }
    });
  }

  highlightTextOnSearch (city, text) {
    let elemToHighlight = city.listItem.elem.querySelector('.list-item-name');

    let textToSearch = city.name;
    let index = textToSearch.toLowerCase().indexOf(text.toLowerCase());
    if (index >= 0) {
      textToSearch = textToSearch.substring(0, index) + "<span class='highlight'>" + textToSearch.substring(index, index + text.length) + '</span>' + textToSearch.substring(index + text.length);
      elemToHighlight.innerHTML = textToSearch;
    }

    city.highlightedName = textToSearch;
  }

  unhighlightText (city) {
    city.highlightedName = null;
  }

  convertCelsiusToFahrenheit () {
    if (this._state.selectedCities.length) {
      this._state.selectedCities.map(function (city) {
        let temp = city.weather ? city.weather.replace('ºC', '') : null;

        city.temperatureInFarenheit = +temp * 9 / 5 + 32 + 'ºF';
      });
    }

    if (this._baseCities.length) {
      this._baseCities.map(function (city) {
        let temp = city.weather ? city.weather.replace('ºC', '') : null;

        city.temperatureInFarenheit = +temp * 9 / 5 + 32 + 'ºF';
      });
    }
  }

  convertFarenheitToCelcius () {
    if (this._state.selectedCities.length) {
      this._state.selectedCities.map(function (city) {
        city.temperatureInFarenheit = null;
      });
    }

    if (this._baseCities.length) {
      this._baseCities.map(function (city) {
        city.temperatureInFarenheit = null;
      });
    }
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
        list = this._state.renderedBaseCities;
        break;
      case 'cities-selected':
        list = this._state.renderedSelectedCities;
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

    this.isTransferToAnotherList = true;
  }

  endTransfer () {
    this.isTransferToAnotherList = false;
  }

  updateSelectedCityDOMelem (newItem) {
    this._state.selectedCity.listItem.elem = newItem;
  }
}
