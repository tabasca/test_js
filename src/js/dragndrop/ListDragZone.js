import DragZone from './DragZone';
import ListDragAvatar from './ListDragAvatar';

export default class ListDragZone extends DragZone {
  _makeAvatar () {
    return new ListDragAvatar(this, this._elem);
  }
};
