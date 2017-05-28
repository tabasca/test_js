/* eslint-disable no-undef */

export default class Map {
  constructor () {
    L.mapbox.accessToken = 'pk.eyJ1IjoidGFiYXNjYSIsImEiOiJjajJ4OTdsdDgwMDBsMndubW95NGpxcGVrIn0.U-KpOKWaEfwfaovFMk5aQg';
    this.map = L.mapbox.map('map', 'mapbox.streets')
      .setView([50, 90], 3);

    this.addMarker = this.addMarker.bind(this);
  }

  addMarker (city) {
    let markerTemplate = L.divIcon({className: 'marker'});

    this._marker = L.marker([city.location.lat, city.location.lng], {
      icon: markerTemplate
    }).addTo(this.map);
  }

  get marker () {
    return this._marker;
  }
}
