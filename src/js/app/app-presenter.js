import Model from './app-model';
import App from './app-view';
import ListItemView from './list-item-view';
import Map from './map';

//draganddrop in OOP from learnjavascript.ru
import ListDragZone from '../dragndrop/ListDragZone';
import ListDropTarget from '../dragndrop/ListDropTarget';

let AppModel;
let AppMap;
let containerForCities;

let dragZone, avatar, dropTarget;
let downX, downY;

class Presenter {

	init() {
		AppModel = new Model(App.data);

		containerForCities = document.getElementById('cities');

		let cities = App.data;

		AppMap = new Map();

		cities.map(function (city) {
			let item = new ListItemView(city);

			containerForCities.appendChild(item.elem);
			AppMap.addMarker(city);

			item.onItemHover(AppMap._marker._icon);
			AppMap.onMarkerHover(AppMap._marker._icon, item.elem);

			city.marker = AppMap._marker._icon;
			city.elem = item.elem;

			AppModel.cities.push(city);
		});

		this.bindHandlers();
		this.addDragAndDrop();

	}

	addDragAndDrop() {

		let containerForSelectedCities = document.querySelector('.cities-selected');

		new ListDragZone(containerForCities);
		new ListDropTarget(containerForCities);

		new ListDragZone(containerForSelectedCities);
		new ListDropTarget(containerForSelectedCities);

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
		}

		// отобразить перенос объекта, перевычислить текущий элемент под курсором
		avatar.onDragMove(e);

		// найти новый dropTarget под курсором: newDropTarget
		// текущий dropTarget остался от прошлого mousemove
		// *оба значения: и newDropTarget и dropTarget могут быть null
		var newDropTarget = this.findDropTarget(e);

		if (newDropTarget != dropTarget) {

			let callback = () => {
				AppModel.selectCity(avatar._dragZoneElem);

				return AppModel._state.selectedCity;
			};

			let callbackToAddHover = (item) => {

				AppMap.onMarkerHover(AppModel._state.selectedCity.marker, item._elem);

			};

			// уведомить старую и новую зоны-цели о том, что с них ушли/на них зашли
			dropTarget && dropTarget.onDragLeave(newDropTarget, avatar, e);
			newDropTarget && newDropTarget.onDragEnter(dropTarget, avatar, e, callback, callbackToAddHover);
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
			console.log('no');
			return null;
		}

		return elem.dropTarget;
	}

	bindHandlers() {

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);

		document.onmousemove = this.onMouseMove;
		document.onmouseup = this.onMouseUp;
		document.onmousedown = this.onMouseDown;

		document.ondragstart = function () {
			return false;
		}
	}

}

export default new Presenter();