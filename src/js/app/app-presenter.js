import Model from './app-model';
import ListItemView from './list-item-view';
import ErrorItemView from './error-item-view';
import Map from './map';
import Filter from './filter';
import { ListType, FilterType } from '../meta';
import { getCoords, getElementFromTemplate, findAncestor } from '../utils';

// draganddrop in OOP from learnjavascript.ru
import ListDragZone from '../dragndrop/ListDragZone';
import ListDropTarget from '../dragndrop/ListDropTarget';

let AppModel;
let AppMap;
let App;
let filter;

let containerForCities = document.getElementById('cities');
let containerForSelectedCities = document.querySelector('.cities-selected');

let tumbler = document.querySelector('#tumbler');

let dragZone, avatar, dropTarget;
let downX, downY;

let baseListError;
let selectedListError;

class Presenter {
  init (app) {
    App = app;
    AppModel = new Model(App.data);
    AppMap = new Map();

    this.initFilters();
    this.renderApp();

    this.bindHandlers = this.bindHandlers.bind(this);
    this.bindHandlers();
    this.addDragAndDrop();
  }

  clearList (listType = null) {
    AppModel.clearRenderedArr(listType);
    AppModel.clearListItems(listType);
  }

  renderList (cities, container, listType, isInitiatedByFilter, isReset) {
    this.clearList(listType);

    let that = this;
    let counter = 0;

    switch (listType) {
      case ListType.BASE:
        if (baseListError) {
          baseListError.removeItem();
          baseListError = null;
        }

        if (!cities.length) {
          baseListError = new ErrorItemView();
          container.appendChild(baseListError.elem);
          baseListError.onResetFiltersBtnClick = this.resetBaseFilters.bind(this);
          baseListError.bindEvents();
        }
        break;
      case ListType.SELECTED:
        if (selectedListError) {
          selectedListError.removeItem();
          selectedListError = null;
        }

        if (!cities.length && AppModel.state.selectedList.activeFilter.length) {
          selectedListError = new ErrorItemView();
          container.appendChild(selectedListError.elem);
          selectedListError.onResetFiltersBtnClick = this.resetSelectedFilters.bind(this);
          selectedListError.bindEvents();
        }
        break;
    }

    cities.map(function (city) {
      let elem = that.createCityElem(city, container, listType, isInitiatedByFilter, isReset, counter);
      AppModel.updateListItems(elem, listType, isInitiatedByFilter, isReset);
      AppModel.updateRenderedList(city, listType, isInitiatedByFilter, isReset);
      counter++;
    });

    AppModel.setLocalStorageData(AppModel.state);
  }

  createCityElem (city, container, listType, isInitiatedByFilter, isReset, counter) {
    let item = new ListItemView(city);
    let marker;
    container.appendChild(item.elem);

    AppModel.setCityId(city, counter);

    if (AppModel.state.markers.every(marker => marker.id !== city.id)) {
      AppMap.addMarker(city);
      marker = AppMap.marker._icon;
      AppModel.updateMarkers(marker, city, listType);
    }

    marker = AppModel.getMarker(city.id);
    item.marker = marker;
    marker.classList.remove('marker-invalid');

    item.showPopup = this.showPopup.bind(this, item);
    item.bindEvents(item);
    item.id = city.id;

    return item;
  }

  initFilters () {
    filter = new Filter();

    filter.setFilterEnabled = this.setFilterEnabled.bind(this);
    filter.convertTemperature = this.convertTemperature.bind(this);

    filter.bindEvents();
  }

  renderApp (reset) {
    let that = this;
    if (reset) {
      if (filter) {
        this.resetBaseFilters();
        this.resetSelectedFilters();
        AppModel.popup && this.destroyPopup();

        return false;
      }
    }
    let isReset = false;

    if (AppModel.localStorageData) {
      AppModel.updateState();
      isReset = true;
    }

    if (AppModel.state.dataInFahrenheit) {
      tumbler.checked = 'true';
    }

    if (AppModel.state.selectedList.cities.length) {
      this.renderList(AppModel.state.selectedList.cities, containerForSelectedCities, ListType.SELECTED, isReset);
    }

    this.renderList(AppModel.state.baseList.cities.length ? AppModel.state.baseList.cities : AppModel.state.cities, containerForCities, ListType.BASE, isReset);

    let counter = 0;

    if (AppModel.state.baseList.activeFilter) {
      AppModel.state.baseList.cities.map(function (city) {
        let elem = that.createCityElem(city, containerForCities, ListType.BASE, false, false, counter);
        that.updateListItems(elem, ListType.BASE, false, true);
        counter++;
      });

      console.log(AppModel.state.baseList.cities);
      console.log(AppModel.state.baseList.listItems);

      let textToFilterBy = AppModel.state.baseList.textToFilterBy;
      filter.updateSearchInputVal(textToFilterBy);
      this.filterCities(ListType.BASE, AppModel.state.baseList.activeFilter, textToFilterBy, true, false);

      console.log('AFTER FILTER !!!!!!!!!!!!!!: ', AppModel.state.baseList.cities);
      console.log(AppModel.state.baseList.listItems);
    }

    if (AppModel.state.selectedList.activeFilter.length) {
      filter.updateSelectedFeaturesBtns(AppModel.state.selectedList.activeFilter);
      this.filterCities(ListType.SELECTED, AppModel.state.selectedList.activeFilter, null, true, true);
    }
  }

  convertTemperature (evt) {
    if (evt.target.checked) {
      AppModel.convertCelsiusToFahrenheit();
    } else {
      AppModel.convertFahrenheitToCelsius();
    }

    this.renderApp(true);
  }

  setFilterEnabled (evt) {
    let textToFilterBy = null;

    let listType = ListType.BASE;
    let filterType = evt.target.value;
    let isInitiatedByFilter = true;

    let selectedFlag = false;

    switch (filterType) {
      case FilterType.ASCENDING:

        break;

      case FilterType.DESCENDING:

        break;

      case FilterType.FEATURE.sun: case FilterType.FEATURE.cloud: case FilterType.FEATURE.meteor: case FilterType.FEATURE.rain: case FilterType.FEATURE.wind: case FilterType.FEATURE.snow:
        selectedFlag = true;

        listType = ListType.SELECTED;

        break;

      default:

        textToFilterBy = filterType;
        filterType = FilterType.SEARCH;
    }

    this.filterCities(listType, filterType, textToFilterBy, isInitiatedByFilter, selectedFlag);
  }

  filterCities (listType, filterType, textToFilterBy, isInitiatedByFilter, selectedFlag) {
    AppModel.filterList(filterType, textToFilterBy);
    let cities = selectedFlag ? AppModel.state.selectedList.filteredCities : AppModel.state.baseList.filteredCities;
    let container = selectedFlag ? containerForSelectedCities : containerForCities;
    this.renderList(cities, container, listType, isInitiatedByFilter);
  }

  getMarkerPosition (item) {
    return getCoords(item.marker);
  }

  showPopup (item) {
    if (AppModel.popup) {
      this.destroyPopup();
    }

    let popup = getElementFromTemplate(item.getPopupMarkup());
    document.body.appendChild(popup);

    let popupCoords = this.getMarkerPosition(item);
    popup.style.left = popupCoords.left + 'px';
    popup.style.top = popupCoords.top + 'px';

    AppModel.popup = popup;
  }

  destroyPopup () {
    AppModel.popup.remove();
  }

  addDragAndDrop () {
    /* eslint-disable */
    let baseListDragZone = new ListDragZone(containerForCities);
    let baseListDropTarget = new ListDropTarget(containerForCities);

    let selectedListDragZone = new ListDragZone(containerForSelectedCities);
    let selectedListDropTarget = new ListDropTarget(containerForSelectedCities);
    /* eslint-enable */
  }

  getDestination (currentTarget, destinationSelector) {
    if (!currentTarget.classList.contains(destinationSelector)) {
      let newDestination = findAncestor(currentTarget, destinationSelector);

      if (newDestination) {
        return newDestination;
      } else {
        return false;
      }
    }

    return currentTarget;
  }

  resetBaseFilters () {
    let isRenderInitiatedByFilter = false;
    let isReset = true;
    AppModel.resetFilters(ListType.BASE);
    filter.resetBaseFilters();

    this.renderList(AppModel.state.baseList.cities, containerForCities, ListType.BASE, isRenderInitiatedByFilter, isReset);
  }

  resetSelectedFilters () {
    let isRenderInitiatedByFilter = false;
    let isReset = true;
    AppModel.resetFilters(ListType.SELECTED);
    filter.resetFeaturesFilter();

    if (AppModel.state.selectedList.cities.length) {
      this.renderList(AppModel.state.selectedList.cities, containerForSelectedCities, ListType.SELECTED, isRenderInitiatedByFilter, isReset);
    }
  }

  transferItem (avatar, evt) {
    let city = AppModel.state.selectedCity;

    let destination = avatar._currentTargetElem;
    let currentList = avatar._dragZone._elem.classList.contains('cities-selected') ? ListType.SELECTED : ListType.BASE;

    if (AppModel.isTransferToAnotherList) {
      if (city.highlightedName) {
        AppModel.unhighlightText(city);
      }

      let item = new ListItemView(city);
      item.marker = AppModel.getMarker(city.id);

      destination = this.getDestination(destination, 'cities');
      destination.appendChild(item.elem);

      item.showPopup = this.showPopup.bind(this, item);
      item.bindEvents();
      item.id = city.id;

      AppModel.updateListItems(item);

      let dropList = this.findDropTarget(evt)._elem.classList.contains('cities-selected') ? ListType.SELECTED : ListType.BASE;

      switch (dropList) {
        case 'cities':
          baseListError && baseListError.removeItem();
          break;
        case 'cities-selected':
          selectedListError && selectedListError.removeItem();
          break;
      }

      AppModel.updateRenderedList(city);

      if (AppModel.state.baseList.renderedCities.length === 0) {
        this.resetBaseFilters();
      }

      if (AppModel.state.selectedList.renderedCities.length === 0) {
        this.resetSelectedFilters();
      }

      AppModel.setLocalStorageData(AppModel.state);
    } else {
      destination = this.getDestination(destination, 'list-item');
      let destinationName = destination.querySelector('.list-item-name').innerHTML;
      let replacedItem = AppModel.getCityObject(destinationName, currentList);

      if (replacedItem === city || !replacedItem) {
        return false;
      }

      AppModel.swapItems(city, replacedItem);

      let currentCityDOMelem = AppModel.getListItem(city, currentList).elem;
      let replacedCityDOMelem = AppModel.getListItem(replacedItem, currentList).elem;

      let temp = document.createElement('div');
      currentCityDOMelem.parentNode.insertBefore(temp, currentCityDOMelem);
      replacedCityDOMelem.parentNode.insertBefore(currentCityDOMelem, replacedCityDOMelem);
      temp.parentNode.insertBefore(replacedCityDOMelem, temp);
      temp.parentNode.removeChild(temp);
    }

    avatar.onDragEnd();
  }

  onMouseDown (evt) {
    if (evt.which !== 1) { // не левой кнопкой
      return false;
    }

    dragZone = this.findDragZone(evt);

    if (!dragZone) {
      return;
    }

    // запомним, что элемент нажат на текущих координатах pageX/pageY
    downX = evt.pageX;
    downY = evt.pageY;

    return false;
  }

  onMouseMove (evt) {
    if (!dragZone) return;

    if (!avatar) {
      if (Math.abs(evt.pageX - downX) < 3 && Math.abs(evt.pageY - downY) < 3) {
        return;
      }

      avatar = dragZone.onDragStart(downX, downY, evt);

      if (!avatar) {
        this.cleanUp();
        return;
      }

      let currentList = avatar._dragZone._elem.classList.contains('cities-selected') ? ListType.SELECTED : ListType.BASE;

      let destinationName = avatar._dragZoneElem.querySelector('.list-item-name').innerHTML;
      let cityObj = AppModel.getCityObject(destinationName, currentList);
      AppModel.passCityToTheModel(cityObj);
    }

    avatar.onDragMove(evt);

    let newDropTarget = this.findDropTarget(evt);

    if (newDropTarget !== dropTarget) {
      dropTarget && dropTarget.onDragLeave(newDropTarget, avatar, evt);
      newDropTarget && newDropTarget.onDragEnter(dropTarget, avatar, evt);

      if (newDropTarget && dropTarget) {
        AppModel.setCitySelected();
        this.transferItem(avatar, evt);
      }
    }

    dropTarget = newDropTarget;

    dropTarget && dropTarget.onDragMove(avatar, evt);

    return false;
  }

  onMouseUp (evt) {
    if (evt.which !== 1) { // не левой кнопкой
      return false;
    }

    if (avatar) {
      if (dropTarget) {
        dropTarget.onDragEnd(avatar, evt);

        if (AppModel.isTransferToAnotherList) {
          AppModel.endTransfer();
        } else {
          this.transferItem(avatar, evt);
        }
      } else {
        avatar.onDragCancel();
      }
    }

    this.cleanUp();
  }

  cleanUp () {
    dragZone = avatar = dropTarget = null;
  }

  findDragZone (evt) {
    var elem = evt.target;
    while (elem !== document && !elem.dragZone) {
      elem = elem.parentNode;
    }
    return elem.dragZone;
  }

  findDropTarget () {
    var elem = avatar.getTargetElem();

    while (elem !== document && !elem.dropTarget) {
      elem = elem.parentNode;
    }

    if (!elem.dropTarget) {
      return null;
    }

    return elem.dropTarget;
  }

  bindHandlers () {
    App.onMouseMove = this.onMouseMove.bind(this);
    App.onMouseDown = this.onMouseDown.bind(this);
    App.onMouseUp = this.onMouseUp.bind(this);

    App.bindEvents();
  }
}

export default new Presenter();
