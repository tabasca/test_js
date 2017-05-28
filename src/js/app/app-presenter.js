import Model from './app-model';
import ListItemView from './list-item-view';
import ErrorItemView from './error-item-view';
import Map from './map';
import Filter from './filter';
import { ListType, FilterType } from '../meta';
import { transformToArr, getCoords, getElementFromTemplate, findAncestor } from '../utils';

//draganddrop in OOP from learnjavascript.ru
import ListDragZone from '../dragndrop/ListDragZone';
import ListDropTarget from '../dragndrop/ListDropTarget';

let AppModel;
let AppMap;
let App;
let filter;

let containerForCities = document.getElementById('cities');
let containerForSelectedCities = document.querySelector('.cities-selected');

let dragZone, avatar, dropTarget;
let downX, downY;

let baseListError;
let selectedListError;

class Presenter {

	init(app) {
		App = app;
		AppModel = new Model(App.data);
		AppMap = new Map();

		if (AppModel.state.selectedCities.length) {
			this.renderList(AppModel.state.selectedCities, containerForSelectedCities, ListType.SELECTED);
		}

		this.renderList(AppModel.cities, containerForCities, ListType.BASE);

		this.initFilters();

		this.bindHandlers = this.bindHandlers.bind(this);
		this.bindHandlers();
		this.addDragAndDrop();
	}

	clearList(listType = null) {
		let citiesArr = null;

		switch (listType) {
			case ListType.BASE:
				citiesArr = AppModel.state.renderedBaseCities;
				break;
			case ListType.SELECTED:
				citiesArr = AppModel.state.renderedSelectedCities;
				break;

			default:
				citiesArr = [];
				return false;

		}

		citiesArr = transformToArr(citiesArr);

		citiesArr.map(function (city) {
			city.listItem.removeItem();
			city.listItem.marker.remove();
		});

		AppModel.clearRenderedArr(listType);
	}

	renderList (cities, container, listType) {
		this.clearList(listType);

		let that = this;

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

				if (!cities.length && AppModel.state.activeSelectedFilter.length) {
					selectedListError = new ErrorItemView();
					container.appendChild(selectedListError.elem);
					selectedListError.onResetFiltersBtnClick = this.resetSelectedFilters.bind(this);
					selectedListError.bindEvents();
				}
				break;
		}

		cities.map(function (city) {

			let item = new ListItemView(city);

			container.appendChild(item.elem);
			AppMap.addMarker(city);

			item.marker = AppMap._marker._icon;

			item.showPopup = that.showPopup.bind(that, item);
			item.bindEvents(item);

			city.listItem = item;
			AppModel.updateRenderedList(city, listType);
		});
	}

	initFilters () {
		filter = new Filter();

		filter.setFilterEnabled = this.setFilterEnabled.bind(this);

		filter.bindEvents();
	}

	setFilterEnabled (evt) {
		// evt.preventDefault();

		let textToFilterBy = null;
		let container = containerForCities;

		let listType = ListType.BASE;
		let filterType = evt.target.value;

		let selectedFlag = false;

		switch (filterType) {
			case FilterType.ASCENDING:

				break;

			case FilterType.DESCENDING:

				break;

			case FilterType.FEATURE.sun: case FilterType.FEATURE.cloud: case FilterType.FEATURE.meteor: case FilterType.FEATURE.rain: case FilterType.FEATURE.wind: case FilterType.FEATURE.snow:
				selectedFlag = true;

				container = containerForSelectedCities;
				listType = ListType.SELECTED;

				break;

			default:

				textToFilterBy = filterType;
				filterType = FilterType.SEARCH;
		}

		AppModel.filterList(filterType, textToFilterBy);

		let cities = selectedFlag ? AppModel.state.filteredSelectedCities : AppModel.state.filteredBaseCities;

		this.renderList(cities, container, listType);
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
		new ListDragZone(containerForCities);
		new ListDropTarget(containerForCities);

		new ListDragZone(containerForSelectedCities);
		new ListDropTarget(containerForSelectedCities);
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
		AppModel.resetFilters(ListType.BASE);
		filter.resetBaseFilters();

		this.renderList(AppModel.cities, containerForCities, ListType.BASE);
	}

	resetSelectedFilters () {
		AppModel.resetFilters(ListType.SELECTED);
		filter.resetFeaturesFilter();

		if (AppModel.state.selectedCities.length) {
			this.renderList(AppModel.state.selectedCities, containerForSelectedCities, ListType.SELECTED);
		}
	}

	transferItem (avatar, evt) {
		let city = AppModel.state.selectedCity;
		let destination = avatar._currentTargetElem;

		if (AppModel.isTransferToAnotherList) {

			let item = new ListItemView(city);

			item.marker = city.listItem.marker;

			destination = this.getDestination(destination, 'cities');
			destination.appendChild(item.elem);

			item.showPopup = this.showPopup.bind(this, item);
			item.bindEvents();

			city.listItem.removeItem();

			let dropList = this.findDropTarget(evt)._elem.classList.contains('cities-selected') ? ListType.SELECTED : ListType.BASE;

			AppModel.updateSelectedCityDOMelem(item.elem);

			switch (dropList) {
				case 'cities':
					baseListError && baseListError.removeItem();
					break;
				case 'cities-selected':
					selectedListError && selectedListError.removeItem();
					break;
			}

		} else {

			destination = this.getDestination(destination, 'list-item');
			let currentList = avatar._dragZone._elem.classList.contains('cities-selected') ? ListType.SELECTED : ListType.BASE;

			let replacedItem = AppModel.getCityObject(destination, currentList);

			if (replacedItem === city || !replacedItem) {
				return false;
			}

			AppModel.swapItems(currentList, city, replacedItem);

			let temp = document.createElement('div');
			city.listItem.elem.parentNode.insertBefore(temp, city.listItem.elem);
			replacedItem.listItem.elem.parentNode.insertBefore(city.listItem.elem, replacedItem.listItem.elem);
			temp.parentNode.insertBefore(replacedItem.listItem.elem, temp);
			temp.parentNode.removeChild(temp);

		}

		avatar.onDragEnd();
	}

	onMouseDown (evt) {
		if (evt.which != 1) { // не левой кнопкой
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

			let cityObj = AppModel.getCityObject(avatar._dragZoneElem, currentList);
			AppModel.passCityToTheModel(cityObj);
		}

		avatar.onDragMove(evt);

		var newDropTarget = this.findDropTarget(evt);

		if (newDropTarget != dropTarget) {

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
		if (evt.which != 1) { // не левой кнопкой
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
		while (elem != document && !elem.dragZone) {
			elem = elem.parentNode;
		}
		return elem.dragZone;
	}

	findDropTarget () {
		var elem = avatar.getTargetElem();

		while (elem != document && !elem.dropTarget) {
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