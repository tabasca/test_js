/**
 * Зона, в которую объекты можно класть
 * Занимается индикацией передвижения по себе, добавлением в себя
 */

export default class DropTarget {
	constructor(elem) {
		elem.dropTarget = this;
		this._elem = elem;

		/**
		 * Подэлемент, над которым в настоящий момент находится аватар
		 */
		this._targetElem = null;

		this._transferItem = this._transferItem.bind(this);
	}

	/**
	 * Возвращает DOM-подэлемент, над которым сейчас пролетает аватар
	 *
	 * @return DOM-элемент, на который можно положить или undefined
	 */
	_getTargetElem(avatar, event) {
		return this._elem;
	}

	/**
	 * Спрятать индикацию переноса
	 * Вызывается, когда аватар уходит с текущего this._targetElem
	 */
	_hideHoverIndication(avatar) {
		/* override */
	}

	/**
	 * Показать индикацию переноса
	 * Вызывается, когда аватар пришел на новый this._targetElem
	 */
	_showHoverIndication(avatar) {
		/* override */
	}

	_transferItem(avatar) {
		/* override */
	}

	/**
	 * Метод вызывается при каждом движении аватара
	 */
	onDragMove(avatar, event) {
		let newTargetElem = this._getTargetElem(avatar, event);

		if (this._targetElem != newTargetElem) {

			this._hideHoverIndication(avatar);
			this._targetElem = newTargetElem;
			this._showHoverIndication(avatar);
		}
	}

	/**
	 * Завершение переноса.
	 * Алгоритм обработки (переопределить функцию и написать в потомке):
	 * 1. Получить данные переноса из avatar.getDragInfo()
	 * 2. Определить, возможен ли перенос на _targetElem (если он есть)
	 * 3. Вызвать avatar.onDragEnd() или avatar.onDragCancel()
	 *  Если нужно подтвердить перенос запросом на сервер, то avatar.onDragEnd(),
	 *  а затем асинхронно, если сервер вернул ошибку, avatar.onDragCancel()
	 *  При этом аватар должен уметь "откатываться" после onDragEnd.
	 *
	 * При любом завершении этого метода нужно (делается ниже):
	 *  снять текущую индикацию переноса
	 *  обнулить this._targetElem
	 */
	onDragEnd(avatar, event) {
		this._hideHoverIndication(avatar);
		this._targetElem = null;
	}

	/**
	 * Вход аватара в DropTarget
	 */
	onDragEnter(fromDropTarget, avatar, event) {
		this.isReplacementDenied = false;

		if (fromDropTarget) {
			this._transferItem(avatar);
		}

	}

	/**
	 * Выход аватара из DropTarget
	 */
	onDragLeave(toDropTarget, avatar, event) {
		this._hideHoverIndication();
		this._targetElem = null;
	}
}