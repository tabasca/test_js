import Presenter from './app-presenter';

export default class AppView {
	constructor (data) {
		this.data = data;
	}

	renderApp () {
		Presenter.init(this);
	}

	showError (error) {
		console.log('Error! - ' + error.message);
	}

	set onMouseUp (handler) {
		return this._onMouseUp = handler;
	}

	set onMouseDown (handler) {
		return this._onMouseDown = handler;
	}

	set onMouseMove (handler) {
		return this._onMouseMove = handler;
	}

	bindEvents () {
		document.onmousemove = this._onMouseMove;
		document.onmouseup = this._onMouseUp;
		document.onmousedown = this._onMouseDown;

		document.ondragstart = function () {
			return false;
		}
	}
};