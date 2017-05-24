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
		var target = avatar.getTargetElem();

		var elemToMove = avatar.getDragInfo(event).dragZoneElem;

		// запретить перенос в самого себя
		if (target == elemToMove || isDescendant(elemToMove, target)) {
			return false;
		}

		//разрешить перенос, если у элемента-цели есть родитель с нужным классом
		if (!target.classList.contains('list-item')) {
			target = findAncestor(target, 'list-item');
		}

		return target;
	}

	onDragEnd(avatar, event) {
		if (!this._targetElem || this.isReplacementDenied) {
			// перенос закончился вне подходящей точки приземления
			avatar.onDragCancel();
			return;
		}

		this._hideHoverIndication();

		// получить информацию об объекте переноса
		var avatarInfo = avatar.getDragInfo(event);

		avatar.onDragEnd(); // аватар больше не нужен, перенос успешен

		let contentToReplace = this._targetElem.innerHTML;
		let contentToMove = avatarInfo.elem.innerHTML;

		this._targetElem.innerHTML = contentToMove;
		avatarInfo.dragZoneElem.innerHTML = contentToReplace;

		this._targetElem = null;
	}
}