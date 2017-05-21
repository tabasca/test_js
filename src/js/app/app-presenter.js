import Model from './app-model';
import App from './app-view';
import ListItemView from './list-item-view';

let AppModel;

class Presenter {

	init() {
		AppModel = new Model(App.data);

		let containerForData = document.getElementById('cities');

		let cities = App.data;

		cities.map(function (city) {
			let item = new ListItemView(city);

			containerForData.appendChild(item.elem);
		})
	}


}

export default new Presenter();