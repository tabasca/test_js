import { getElementFromTemplate } from '../utils';

export default class ListItemView {
	constructor(data) {
		this.data = data;
	}

	get elem() {
		if (!this._elem) {

			this.name = this.data.name;
			this.temperature = this.data.weather;
			this.featuresArr = this.data.features;

			this._elem = getElementFromTemplate(this.getMarkup());

			this.onItemMouseover = this.onItemMouseover.bind(this);
			this.onItemMouseout = this.onItemMouseout.bind(this);

			this.onMarkerMouseover = this.onMarkerMouseover.bind(this);
			this.onMarkerMouseout = this.onMarkerMouseout.bind(this);

			this.removeItem = this.removeItem.bind(this);

		}

		return this._elem;
	}

	set elem(data) {
		return this._elem = data;
	}

	set showPopup(handler) {
		return this._showPopup = handler;
	}

	get featuresForFilter() {

		this._featuresForFilter = [];
		let featureNames = [];

		this.featuresArr.map(function (feature) {
			switch (feature) {
				case '☄️':
					featureNames.push('meteor');
					break;
				case '☀️':
					featureNames.push('sun');
					break;
				case '❄️':
					featureNames.push('snow');
					break;
				case '💧':
					featureNames.push('rain');
					break;
				case '🌥':
					featureNames.push('cloud');
					break;
				case '🌬':
					featureNames.push('wind');
					break;
			}
		});

		return this._featuresForFilter = featureNames;

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

		return `<article class="list-item">
		    <div class="list-item-handle"></div>
		    <h3 class="list-item-title">
		      <span class="list-item-name">${this.name}</span>,
		      <span class="list-item-weather">${this.temperature}</span>
		    </h3>
		    <div class="list-item-features">
		      ${this.getFeatures(this.featuresArr)}
		    </div>
		  </article>`;
	}

	getPopupMarkup() {

		return `<div class="popup" role="popup" aria-labellebby="popup-title">
				  <h3 class="popup-title" id="popup-title">
				    <span class="popup-title-name">${this.name}</span>,
				    <span class="popup-title-weather">${this.temperature}</span>
				  </h3>
				  <div class="popup-features">
				    ${this.getFeatures(this.featuresArr)}
				  </div>
				</div>`;
	}

	onItemMouseover() {
		this.marker.classList.add('marker-hovered');
	}

	onItemMouseout() {
		this.marker.classList.remove('marker-hovered');
	}

	onMarkerMouseover() {
		this._elem.classList.add('item-hovered');
	}

	onMarkerMouseout() {
		this._elem.classList.remove('item-hovered');
	}

	bindEvents() {
		this._elem.addEventListener('mouseover', this.onItemMouseover);
		this._elem.addEventListener('mouseout', this.onItemMouseout);

		this.marker.addEventListener('mouseover', this.onMarkerMouseover);
		this.marker.addEventListener('mouseout', this.onMarkerMouseout);

		this._elem.addEventListener('click', this._showPopup);
		this.marker.addEventListener('click', this._showPopup);
	}

	unbindEvents() {
		this._elem.removeEventListener('mouseover', this.onItemMouseover);
		this._elem.removeEventListener('mouseout', this.onItemMouseout);

		this.marker.removeEventListener('mouseover', this.onMarkerMouseover);
		this.marker.removeEventListener('mouseout', this.onMarkerMouseout);

		this._elem.removeEventListener('click', this._showPopup);
		this.marker.removeEventListener('click', this._showPopup);
	}

	removeItem() {

		this.unbindEvents();

		this._elem.remove();
	}
}