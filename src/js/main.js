import 'whatwg-fetch';

import AppView from './app/app-view';

(function () {
  let App = new AppView();

  window.fetch('/data/data.json')
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(function (data) {
      App.data = data;
      App.renderApp();
    })
    .catch(function (err) {
      App.showError(err);
    });
})();
