import Model from './app-model';
import ListItemView from './list-item-view';
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

let containerForCities = document.getElementById('cities');
let containerForSelectedCities = document.querySelector('.cities-selected');

let dragZone, avatar, dropTarget;
let downX, downY;

class Presenter {

	init(app) {
		App = app;
		AppModel = new Model(App.data);
		AppMap = new Map();

		if (AppModel.state.selectedCities.length) {
			this.renderList(AppModel.state.selectedCities, containerForSelectedCities);
		}

		this.renderList(AppModel.cities, containerForCities);

		this.initFilters();

		this.bindHandlers = this.bindHandlers.bind(this);
		this.bindHandlers();
		this.addDragAndDrop();

	}

	clearList(listType = null) {

		let citiesArr = null;

		switch (listType) {
			case ListType.BASE:
				citiesArr = AppModel.state.filteredBaseCities.length ? AppModel.state.filteredBaseCities : AppModel.cities;
				break;
			case ListType.SELECTED:
				citiesArr = AppModel.state.filteredSelectedCities.length ? AppModel.state.filteredSelectedCities : AppModel.state.selectedCities;
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

	}

	renderList(cities, container, listType) {

		this.clearList(listType);

		let that = this;

		cities.map(function (city) {

			let item = new ListItemView(city);

			container.appendChild(item.elem);
			AppMap.addMarker(city);

			item.marker = AppMap._marker._icon;

			item.showPopup = that.showPopup.bind(that, item);

			item.bindEvents(item);
			city.listItem = item;
		});

	}

	initFilters() {
		let filter = new Filter();

		filter.setFilterEnabled = this.setFilterEnabled.bind(this);

		filter.bindEvents();
	}

	setFilterEnabled(evt) {
		evt.preventDefault();
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

			case FilterType.FEATURE.indexOf(filterType) !== -1:
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

	getMarkerPosition(item) {
		return getCoords(item.marker);
	}

	showPopup(item) {

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

	destroyPopup() {

		AppModel.popup.remove();

	}

	addDragAndDrop() {

		new ListDragZone(containerForCities);
		new ListDropTarget(containerForCities);

		new ListDragZone(containerForSelectedCities);
		new ListDropTarget(containerForSelectedCities);

	}

	getDestination(currentTarget, destinationSelector) {
		if (!currentTarget.classList.contains(destinationSelector)) {

			let newDestination = findAncestor(currentTarget, destinationSelector);

			if (newDestination) {
				return newDestination;
			} else {
				throw new Error('invalid destination');
			}
		}

		return currentTarget;
	}

	transferItem(avatar) {

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

			AppModel.updateSelectedCityDOMelem(item.elem);

		} else {

			destination = this.getDestination(destination, 'list-item');

			let replacedItem = AppModel.getReplacedElem(destination);

			let currentList = avatar._dragZone._elem.classList.contains('cities-selected') ? ListType.SELECTED : ListType.BASE;

			AppModel.swapItems(currentList, city, replacedItem);

			let temp = document.createElement('div');
			city.listItem.elem.parentNode.insertBefore(temp, city.listItem.elem);
			replacedItem.listItem.elem.parentNode.insertBefore(city.listItem.elem, replacedItem.listItem.elem);
			temp.parentNode.insertBefore(replacedItem.listItem.elem, temp);
			temp.parentNode.removeChild(temp);

		}

		avatar.onDragEnd();

	}

	onMouseDown(e) {

		if (e.which != 1) { // не левой кнопкой
			return false;
		}

		dragZone = this.findDragZone(e);

		if (!dragZone) {
			return;
		}

		// запомним, что элемент нажат на текущих координатах pageX/pageY
		downX = e.pageX;
		downY = e.pageY;

		return false;
	}

	onMouseMove(e) {
		if (!dragZone) return; // элемент не зажат

		if (!avatar) { // элемент нажат, но пока не начали его двигать
			if (Math.abs(e.pageX - downX) < 3 && Math.abs(e.pageY - downY) < 3) {
				return;
			}
			// попробовать захватить элемент
			avatar = dragZone.onDragStart(downX, downY, e);

			if (!avatar) { // не получилось, значит перенос продолжать нельзя
				this.cleanUp(); // очистить приватные переменные, связанные с переносом
				return;
			}

			AppModel.selectCity(avatar);
		}

		// отобразить перенос объекта, перевычислить текущий элемент под курсором
		avatar.onDragMove(e);

		// найти новый dropTarget под курсором: newDropTarget
		// текущий dropTarget остался от прошлого mousemove
		// *оба значения: и newDropTarget и dropTarget могут быть null
		var newDropTarget = this.findDropTarget(e);

		if (newDropTarget != dropTarget) {

			// уведомить старую и новую зоны-цели о том, что с них ушли/на них зашли
			dropTarget && dropTarget.onDragLeave(newDropTarget, avatar, e);
			newDropTarget && newDropTarget.onDragEnter(dropTarget, avatar, e);

			if (newDropTarget && dropTarget) {

				AppModel.setCitySelected();
				this.transferItem(avatar, e);

			}

		}

		dropTarget = newDropTarget;

		dropTarget && dropTarget.onDragMove(avatar, e);

		return false;
	}

	onMouseUp(e) {

		if (e.which != 1) { // не левой кнопкой
			return false;
		}

		if (avatar) { // если уже начали передвигать

			if (dropTarget) {
				// завершить перенос и избавиться от аватара, если это нужно
				// эта функция обязана вызвать avatar.onDragEnd/onDragCancel
				dropTarget.onDragEnd(avatar, e);

				if (AppModel.isTransferToAnotherList) {
					AppModel.endTransfer();
				} else {
					this.transferItem(avatar, e);
				}

			} else {
				avatar.onDragCancel();
			}

		}

		this.cleanUp();
	}

	cleanUp() {
		// очистить все промежуточные объекты
		dragZone = avatar = dropTarget = null;
	}

	findDragZone(event) {
		var elem = event.target;
		while (elem != document && !elem.dragZone) {
			elem = elem.parentNode;
		}
		return elem.dragZone;
	}

	findDropTarget(event) {
		// получить элемент под аватаром
		var elem = avatar.getTargetElem();

		while (elem != document && !elem.dropTarget) {
			elem = elem.parentNode;
		}

		if (!elem.dropTarget) {
			return null;
		}

		return elem.dropTarget;
	}

	bindHandlers() {

		App.onMouseMove = this.onMouseMove.bind(this);
		App.onMouseDown = this.onMouseDown.bind(this);
		App.onMouseUp = this.onMouseUp.bind(this);

		App.bindEvents();

	}

}

export default new Presenter();