import DropTarget from './DropTarget';
import { isDescendant, findAncestor } from '../utils';

export default class ListDropTarget extends DropTarget {
	constructor(elem) {
		super(elem);
	}

	_showHoverIndication() {
		this._targetElem && this._targetElem.classList.add('hover');
	}

	_hideHoverIndication() {
		this._targetElem && this._targetElem.classList.remove('hover');
	}

	_getTargetElem(avatar, event) {
		this._target = avatar.getTargetElem();

		var elemToMove = avatar.getDragInfo(event).dragZoneElem;

		// запретить перенос в самого себя
		if (this._target == elemToMove || isDescendant(elemToMove, this._target)) {
			return false;
		}

		//разрешить перенос, если у элемента-цели есть родитель с нужным классом
		if (!this._target.classList.contains('list-item')) {
			this._target = findAncestor(this._target, 'list-item');
		}

		return this._target;
	}

	get target() {
		return this._target;
	}

	onDragEnd(avatar, event) {
		if (!this._targetElem) {
			// перенос закончился вне подходящей точки приземления
			avatar.onDragCancel();
			return;
		}

		this._hideHoverIndication();
	}
}