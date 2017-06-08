import DragAvatar from './DragAvatar';
import { getCoords } from '../utils';

export default class ListDragAvatar extends DragAvatar {
  initFromEvent (downX, downY, event) {
    if (event.target.className !== 'list-item-handle') {
      return false;
    }

    this._dragZoneElem = event.target.parentNode;

    let elem = this._elem = this._dragZoneElem.cloneNode(true);
    elem.className = 'avatar';

    // создать вспомогательные свойства shiftX/shiftY
    let coords = getCoords(this._dragZoneElem);
    this._shiftX = downX - coords.left;
    this._shiftY = downY - coords.top;

    // инициировать начало переноса
    document.body.appendChild(elem);
    elem.style.zIndex = 9999;
    elem.style.position = 'absolute';

    return true;
  }

  _destroy () {
    this._elem.remove();
  }

  /**
   * При любом исходе переноса элемент-клон больше не нужен
   */
  onDragCancel () {
    this._destroy();
  }

  onDragEnd () {
    this._destroy();
  }
}
