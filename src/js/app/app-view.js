import Presenter from './app-presenter';

export default class AppView {
	constructor(data) {
		this.data = data;
	}

	static renderApp() {
		Presenter.init(this.data);
	}

	static showError(error) {
		console.log('Error! - ' + error.message);
	}


}