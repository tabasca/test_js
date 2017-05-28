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
    this._onMouseUp = handler;
    return this._onMouseUp;
  }

  set onMouseDown (handler) {
    this._onMouseDown = handler;
    return this._onMouseDown;
  }

  set onMouseMove (handler) {
    this._onMouseMove = handler;
    return this._onMouseMove;
  }

  bindEvents () {
    document.onmousemove = this._onMouseMove;
    document.onmouseup = this._onMouseUp;
    document.onmousedown = this._onMouseDown;

    document.ondragstart = function () {
      return false;
    };
  }
};
