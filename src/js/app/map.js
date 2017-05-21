export default class Map {
	constructor() {

		L.mapbox.accessToken = 'pk.eyJ1IjoidGFiYXNjYSIsImEiOiJjajJ4OTdsdDgwMDBsMndubW95NGpxcGVrIn0.U-KpOKWaEfwfaovFMk5aQg';
		this.map = L.mapbox.map('map', 'mapbox.streets')
			.setView([50, 90], 3);

		this.addMarkers = this.addMarkers.bind(this);
	}

	addMarkers(location) {

		let marker = L.divIcon({className: 'marker'});

		L.marker([location.lat, location.lng], {
			icon: marker
		}).addTo(this.map);
	}
}