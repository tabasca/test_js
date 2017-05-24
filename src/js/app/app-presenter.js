import Model from './app-model';
import ListItemView from './list-item-view';
import Map from './map';
import { getCoords, getElementFromTemplate, findAncestor } from '../utils';

//draganddrop in OOP from learnjavascript.ru
import ListDragZone from '../dragndrop/ListDragZone';
import ListDropTarget from '../dragndrop/ListDropTarget';

let AppModel;
let AppMap;
let App;

let containerForCities;
let containerForSelectedCities;

let dragZone, avatar, dropTarget;
let downX, downY;

class Presenter {

	init(app) {
		App = app;
		AppModel = new Model(App.data);
		AppMap = new Map();

		containerForCities = document.getElementById('cities');
		containerForSelectedCities = document.querySelector('.cities-selected');

		this.renderList();

		this.bindHandlers = this.bindHandlers.bind(this);

		this.bindHandlers();
		this.addDragAndDrop();

		this.initFilters();
	}

	clearList() {
		AppModel.renderedCities.map(function (city) {
			city.listItem.removeItem();
			city.listItem.marker.remove();
		});
	}

	renderList() {

		this.clearList();

		let cities = AppModel._cities;

		if (AppModel._state.isFilterEnabled) {

			cities = AppModel.filteredCities;

		}

		this.appendCities(containerForCities, cities);

		if (AppModel._state.areThereSelectedElems) {
			this.appendCities(containerForSelectedCities);
		}

	}

	initFilters() {
		let that = this;
		let ascFilterBtn = document.getElementById('cities-sort-asc');

		ascFilterBtn.addEventListener('click', function (evt) {
			evt.preventDefault();

			AppModel._state.isFilterEnabled = !AppModel._state.isFilterEnabled;

			AppModel.sortList();

			that.renderList();
		});
	}

	appendCities(container, data) {
		let that = this;
		AppModel.renderedCities = [];

		data.map(function (city) {
			let item = new ListItemView(city);

			container.appendChild(item.elem);
			AppMap.addMarker(city);

			item.marker = AppMap._marker._icon;

			item.showPopup = that.showPopup.bind(that, item);

			item.bindEvents(item);
			city.listItem = item;

			AppModel.renderedCities.push(city);
		});
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

	transferItem(avatar) {

		AppModel.updateSelectedCityDOMelem(avatar._dragZoneElem);

		let city = AppModel._state.selectedCity;

		let destination = avatar._currentTargetElem;

		if (!destination.classList.contains('cities')) {

			let newDestination = findAncestor(destination, 'cities');

			if (newDestination) {
				destination = newDestination;
			} else {
				throw new Error('invalid destination');
			}

		}

		let item = new ListItemView(city);

		item.marker = city.listItem.marker;
		destination.appendChild(item.elem);

		item.bindEvents();

		city.listItem.removeItem();

		AppModel.updateSelectedCityDOMelem(item);

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

			AppModel.cities.map(function (city) {
				if(city.listItem.elem === avatar._dragZoneElem) {
					AppModel.selectCity(city);
				}
			});

			if (!avatar) { // не получилось, значит перенос продолжать нельзя
				this.cleanUp(); // очистить приватные переменные, связанные с переносом
				return;
			}
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

				this.transferItem(avatar);

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