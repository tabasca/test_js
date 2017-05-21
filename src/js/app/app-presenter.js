import Model from './app-model';
import App from './app-view';
import ListItemView from './list-item-view';
import Map from './map';

//draganddrop in OOP from learnjavascript.ru
import DragManager from '../dragndrop/DragManager';
import ListDragZone from '../dragndrop/ListDragZone';
import ListDropTarget from '../dragndrop/ListDropTarget';

let AppModel;
let containerForCities;

class Presenter {

	init() {
		AppModel = new Model(App.data);

		containerForCities = document.getElementById('cities');

		let cities = App.data;

		let AppMap = new Map();

		cities.map(function (city) {
			let item = new ListItemView(city);

			containerForCities.appendChild(item.elem);
			AppMap.addMarkers(city.location);
		});

		this.addDragAndDrop();

	}

	addDragAndDrop() {

		let containerForSelectedCities = document.querySelector('.cities-selected');

		new ListDragZone(containerForCities);
		new ListDropTarget(containerForCities);
		new ListDropTarget(containerForSelectedCities);

	}


}

export default new Presenter();