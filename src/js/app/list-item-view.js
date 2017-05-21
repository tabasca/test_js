import { getElementFromTemplate } from '../utils';

export default class ListItemView {
	constructor(data) {
		this.data = data;
	}

	get elem() {
		if (!this._elem) {
			this._elem = getElementFromTemplate(this.getMarkup());
			// this.bindHandlers();
		}

		return this._elem;
	}

	getFeatures(list) {

		let feature = '';
		let counter = 0;

		for (let it of list) {
			counter++;

			feature += `<span class="list-item-feature">${it}️</span>`;
		}

		return feature;
	}

	getMarkup() {
		let name = this.data.name;
		let temperature = this.data.weather;
		let featuresArr = this.data.features;

		return `<article class="list-item">
		    <div class="list-item-handle"></div>
		    <h3 class="list-item-title">
		      <span class="list-item-name">${name}</span>,
		      <span class="list-item-weather">${temperature}</span>
		    </h3>
		    <div class="list-item-features">
		      ${this.getFeatures(featuresArr)}
		    </div>
		  </article>`

	}
}