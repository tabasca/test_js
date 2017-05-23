import { getElementFromTemplate, getCoords } from '../utils';

export default class ListItemView {
	constructor(data) {
		this.data = data;

		this.popups = [];
	}

	get elem() {
		if (!this._elem) {
			this._elem = getElementFromTemplate(this.getMarkup());


			this.onItemMouseover = this.onItemMouseover.bind(this);
			this.onItemMouseout = this.onItemMouseout.bind(this);

			this.onMarkerMouseover = this.onMarkerMouseover.bind(this);
			this.onMarkerMouseout = this.onMarkerMouseout.bind(this);

			this.showPopup = this.showPopup.bind(this);

			this.removeItem = this.removeItem.bind(this);

		}

		return this._elem;
	}

	set elem(data) {
		return this._elem = data;
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
		  </article>`;
	}

	getPopupMarkup() {
		let name = this.data.name;
		let temperature = this.data.weather;
		let featuresArr = this.data.features;

		return `<div class="popup" role="popup" aria-labellebby="popup-title">
				  <h3 class="popup-title" id="popup-title">
				    <span class="popup-title-name">${name}</span>,
				    <span class="popup-title-weather">${temperature}</span>
				  </h3>
				  <div class="popup-features">
				    ${this.getFeatures(featuresArr)}
				  </div>
				</div>`;
	}

	getMarkerPosition() {
		return getCoords(this.marker);
	}

	onItemMouseover() {
		this.marker.classList.add('marker-hovered');
	}

	onItemMouseout() {
		this.marker.classList.remove('marker-hovered');
	}

	initPopup() {
		this.popup = getElementFromTemplate(this.getPopupMarkup());
		document.body.appendChild(this.popup);

		let popupCoords = this.getMarkerPosition();
		this.popup.style.left = popupCoords.left + 'px';
		this.popup.style.top = popupCoords.top + 'px';
	}

	showPopup() {

		this.destroyPopups();

		this.initPopup();
	}

	destroyPopups() {

		if (document.querySelector('.popup')) {
			document.querySelector('.popup').remove();
		}

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

		this._elem.addEventListener('click', this.showPopup);
		this.marker.addEventListener('click', this.showPopup);
	}

	unbindEvents() {
		this._elem.removeEventListener('mouseover', this.onItemMouseover);
		this._elem.removeEventListener('mouseout', this.onItemMouseout);

		this.marker.removeEventListener('mouseover', this.onMarkerMouseover);
		this.marker.removeEventListener('mouseout', this.onMarkerMouseout);

		this._elem.removeEventListener('click', this.showPopup);
		this.marker.removeEventListener('click', this.showPopup);
	}

	removeItem() {

		this.unbindEvents();

		this._elem.remove();
	}
}