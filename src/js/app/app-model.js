import { transformToArr, sortArr, completeAssign } from '../utils';
import { initialState } from '../initial-state';
import { ListType, FilterType } from '../meta';

const LOCAL_STORAGE = window.localStorage;
const BASE_LIST = document.getElementById('cities');
const SELECTED_LIST = document.querySelector('.cities-selected');

export default class Model {
  constructor (data = [], state = initialState) {
    this._state = completeAssign({}, state);
    this._state.cities = transformToArr(completeAssign({}, data));
  }

  setLocalStorageData (data) {
    LOCAL_STORAGE.setItem('cities', '');
    return LOCAL_STORAGE.setItem('cities', JSON.stringify(data));
  }

  get localStorageData () {
    return JSON.parse(LOCAL_STORAGE.getItem('cities'));
  }

  get state () {
    return this._state;
  }

  get cities () {
    return this._state.cities;
  }

  updateState () {
    this._state = this.localStorageData;
    this._state.baseList.renderedCities = [];
    this._state.baseList.renderedListItems = [];
    this._state.selectedList.renderedCities = [];
    this._state.selectedList.renderedListItems = [];
    this._state.baseList.listItems = [];
    this._state.selectedList.listItems = [];
    this._state.markers = [];
  }

  getMarker (key) {
    let currentCityMarker;
    this._state.markers.map(function (marker) {
      if (marker.id === key) {
        currentCityMarker = marker.elem;
      }
    });
    return currentCityMarker;
  }

  updateMarkers (marker, item) {
    let markerObj = [];
    markerObj.id = item.id;
    markerObj.elem = marker;
    this._state.markers.push(markerObj);
  }

  updateRenderedList (city, listType, isInitiatedByFilter, isReset) {
    let updateList = function (list) {
      if (list.every(listItem => listItem.id !== city.id)) {
        list.push(city);
      } else {
        let position;
        list.map(function (listItem, index) {
          if (listItem.id === city.id) {
            position = index;
          }
        });
        list.splice(position, 1);
      }
    };
    switch (listType) {
      case ListType.BASE:
        !isReset && !isInitiatedByFilter && updateList(this._state.baseList.cities);
        updateList(this._state.baseList.renderedCities);
        break;
      case ListType.SELECTED:
        !isReset && !isInitiatedByFilter && updateList(this._state.selectedList.cities);
        updateList(this._state.selectedList.renderedCities);
        break;
      default:
        !isReset && !isInitiatedByFilter && updateList(this._state.baseList.cities);
        updateList(this._state.baseList.renderedCities);
        !isReset && !isInitiatedByFilter && updateList(this._state.selectedList.cities);
        updateList(this._state.selectedList.renderedCities);
    }
  }

  updateListItems (item, listType, isInitiatedByFilter, isReset, isListItemsNeeded) {
    let updateList = function (list) {
      if (list.every(listItem => listItem.id !== item.id)) {
        list.push(item);
      } else {
        let position;
        list.map(function (listItem, index) {
          if (listItem.id === item.id) {
            position = index;
            listItem.removeItem();
          }
        });
        list.splice(position, 1);
      }
    };
    switch (listType) {
      case ListType.BASE:
        !isReset && !isInitiatedByFilter && updateList(this._state.baseList.listItems);
        updateList(this._state.baseList.renderedListItems);
        isListItemsNeeded && updateList(this._state.baseList.listItems);
        break;
      case ListType.SELECTED:
        !isReset && !isInitiatedByFilter && updateList(this._state.selectedList.listItems);
        updateList(this._state.selectedList.renderedListItems);
        isListItemsNeeded && updateList(this._state.selectedList.listItems);
        break;
      default:
        !isReset && !isInitiatedByFilter && updateList(this._state.baseList.listItems);
        updateList(this._state.baseList.renderedListItems);
        !isReset && !isInitiatedByFilter && updateList(this._state.selectedList.listItems);
        updateList(this._state.selectedList.renderedListItems);
    }
  }

  clearRenderedArr (listType) {
    switch (listType) {
      case ListType.BASE:
        this._state.baseList.renderedCities = [];
        this._state.baseList.renderedListItems.map(function (listItem) {
          listItem.removeItem();
          listItem.marker.classList.add('marker-invalid');
        });
        this._state.baseList.renderedListItems = [];
        break;
      case ListType.SELECTED:
        this._state.selectedList.renderedCities = [];
        this._state.selectedList.renderedListItems.map(function (listItem) {
          listItem.removeItem();
          listItem.marker.classList.add('marker-invalid');
        });
        this._state.selectedList.renderedListItems = [];
        break;
    }
  }

  getListItem (city, listType) {
    let currentListItem;
    let that = this;

    switch (listType) {
      case ListType.BASE:
        this._state.baseList.renderedListItems.map(function (listItem) {
          if (listItem.id === city.id) {
            currentListItem = listItem;
          }
        });
        if (!currentListItem) {
          this._state.baseList.listItems.map(function (listItem) {
            if (listItem.id === city.id) {
              currentListItem = listItem;
              BASE_LIST.appendChild(currentListItem.elem);
              that._state.baseList.renderedListItems.push(currentListItem);
            }
          });
        }
        break;
      case ListType.SELECTED:
        this._state.selectedList.renderedListItems.map(function (listItem) {
          if (listItem.id === city.id) {
            currentListItem = listItem;
          }
        });
        if (!currentListItem) {
          this._state.selectedList.listItems.map(function (listItem) {
            if (listItem.id === city.id) {
              currentListItem = listItem;
              SELECTED_LIST.appendChild(currentListItem.elem);
              that._state.selectedList.renderedListItems.push(currentListItem);
            }
          });
        }
        break;
    }

    return currentListItem;
  }

  resetFilters (listType) {
    switch (listType) {
      case ListType.BASE:
        this._state.baseList.activeFilter = null;
        this._state.baseList.filteredCities = [];
        this._state.baseList.filteredListItems = [];
        break;
      case ListType.SELECTED:
        this._state.selectedList.activeFilter = [];
        this._state.selectedList.filteredCities = [];
        this._state.selectedList.filteredListItems = [];
        break;
    }
  }

  getCityObject (elem, list) {
    let textToSearchBy = elem.replace('<span class="highlight">', '');
    textToSearchBy = textToSearchBy.replace('</span>', '');

    let cityObj;

    switch (list) {
      case 'cities':
        list = this._state.baseList.renderedCities;
        break;
      case 'cities-selected':
        list = this._state.selectedList.renderedCities;
        break;
    }

    list.map(function (city) {
      if (city.name === textToSearchBy) {
        cityObj = city;
      }
    });

    return cityObj;
  }

  setCityId (city, id) {
    city.id = city.id >= 0 ? city.id : id;
  }

  passCityToTheModel (city) {
    this._state.selectedCity = completeAssign({}, city);
  }

  filterList (filterType, filterSymbols) {
    switch (filterType) {
      case FilterType.ASCENDING:

        this._state.baseList.activeFilter = FilterType.ASCENDING;
        this.sortAlphabetically(filterType);
        break;

      case FilterType.DESCENDING:

        this._state.baseList.activeFilter = FilterType.DESCENDING;
        this.sortAlphabetically(filterType);
        break;

      case FilterType.SEARCH:

        this._state.baseList.activeFilter = FilterType.SEARCH;
        this.filterByText(filterSymbols);
        break;

      case FilterType.FEATURE.sun: case FilterType.FEATURE.cloud: case FilterType.FEATURE.meteor: case FilterType.FEATURE.rain: case FilterType.FEATURE.wind: case FilterType.FEATURE.snow:

        if (this._state.selectedList.activeFilter.indexOf(filterType) === -1) {
          this._state.selectedList.activeFilter.push(filterType);
        } else {
          this._state.selectedList.activeFilter.splice(this._state.selectedList.activeFilter.indexOf(filterType), 1);
        }

        this.filterByFeatures(this._state.selectedList.activeFilter);
        break;
      default:
        this.filterByFeatures(this._state.selectedList.activeFilter);
        break;
    }
  }

  sortAlphabetically (filterType) {
    this._state.baseList.filteredCities = sortArr(this._state.baseList.renderedCities, filterType);
  }

  filterByFeatures (features) {
    let that = this;

    if (!features.length) {
      this._state.selectedList.filteredCities = this._state.selectedList.cities;
      this._state.selectedList.filteredListItems = this._state.selectedList.listItems;
      return false;
    }

    this._state.selectedList.filteredCities = [];
    this._state.selectedList.filteredListItems = [];

    let appropriateItems = this._state.selectedList.cities;

    features.forEach(function (feature) {
      that._state.selectedList.filteredCities = appropriateItems.filter(function (city) {
        let listItem = that.getListItem(city, ListType.SELECTED);
        return listItem.featuresForFilter.indexOf(feature) !== -1;
      });

      appropriateItems = that._state.selectedList.filteredCities;
    });
  }

  filterByText (text) {
    let that = this;

    if (!text.length) {
      this._state.baseList.filteredCities = this._state.baseList.cities;
      this._state.baseList.filteredListItems = this._state.baseList.listItems;

      this._state.baseList.textToFilterBy = '';
      return false;
    }

    this._state.baseList.filteredCities = [];
    this._state.baseList.filteredListItems = [];

    this._state.baseList.cities.map(function (city) {
      let cityToCheck = completeAssign({}, city);
      if (cityToCheck.name.toLowerCase().indexOf(text.toLowerCase()) > -1) {
        that.highlightTextOnSearch(cityToCheck, text);
        that._state.baseList.filteredCities.push(cityToCheck);
      }
    });

    this._state.baseList.textToFilterBy = text;
  }

  highlightTextOnSearch (city, text) {
    let listItem = this.getListItem(city, ListType.BASE);
    let areaToHighlight = listItem.elem.querySelector('.list-item-name');

    let textToSearch = city.name;
    let index = textToSearch.toLowerCase().indexOf(text.toLowerCase());
    if (index >= 0) {
      textToSearch = textToSearch.substring(0, index) + "<span class='highlight'>" + textToSearch.substring(index, index + text.length) + '</span>' + textToSearch.substring(index + text.length);
      areaToHighlight.innerHTML = textToSearch;
    }

    city.highlightedName = textToSearch;
    this._state.baseList.filteredListItems.push(listItem);
  }

  unhighlightText (city) {
    let listItem = this.getListItem(city, ListType.BASE);
    let counter;
    this._state.baseList.filteredListItems.some(function (elem, index) {
      counter = index;
      return elem.innerHTML === listItem.innerHTML;
    });
    this._state.baseList.filteredListItems.splice(counter, 1);
    city.highlightedName = null;
  }

  convertCelsiusToFahrenheit () {
    if (this._state.selectedList.cities.length) {
      this._state.selectedList.cities.map(function (city) {
        let temp = city.weather ? city.weather.replace('ºC', '') : null;

        city.temperatureInFahrenheit = +temp * 9 / 5 + 32 + 'ºF';
      });
    }

    if (this._state.baseList.cities.length) {
      this._state.baseList.cities.map(function (city) {
        let temp = city.weather ? city.weather.replace('ºC', '') : null;

        city.temperatureInFahrenheit = +temp * 9 / 5 + 32 + 'ºF';
      });
    }

    this._state.dataInFahrenheit = true;
    this.setLocalStorageData(this._state);
  }

  convertFahrenheitToCelsius () {
    if (this._state.selectedList.cities.length) {
      this._state.selectedList.cities.map(function (city) {
        city.temperatureInFahrenheit = null;
      });
    }

    if (this._state.baseList.cities.length) {
      this._state.baseList.cities.map(function (city) {
        city.temperatureInFahrenheit = null;
      });
    }

    this._state.dataInFahrenheit = false;
    this.setLocalStorageData(this._state);
  }

  swapItems (a, b) {
    let temp = completeAssign({}, a);
    a = b;
    b = temp;
  }

  setCitySelected () {
    this._state.selectedCity.isSelected = !this._state.selectedCity.isSelected;
    this.isTransferToAnotherList = true;
  }

  endTransfer () {
    this.isTransferToAnotherList = false;
  }
}
