import { completeAssign } from '../utils';
import { initialState } from '../initial-state';

export default class Model {
	constructor(data) {
		this._data = completeAssign({}, data);
		this._state = completeAssign({}, initialState);
	}

	get state() {
		return this._state;
	}

	get data() {
		return this._data;
	}


}