import Model from './app-model';
import App from './app-view';
import ListItemView from './list-item-view';
import Map from './map';

let AppModel;

class Presenter {

	init() {
		AppModel = new Model(App.data);

		let containerForData = document.getElementById('cities');

		let cities = App.data;

		let AppMap = new Map();

		cities.map(function (city) {
			let item = new ListItemView(city);

			containerForData.appendChild(item.elem);
			AppMap.addMarkers(city.location);
		});



	}


}

export default new Presenter();