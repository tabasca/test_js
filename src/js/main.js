import 'whatwg-fetch';

(function () {

	window.fetch('/data/data.json')
		.then(function (response) {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Network response was not ok.');
		})
		.then(function (data) {
			//Application.data = data;
			console.log(data);
		})
		.catch(function (err) {
			console.log('Error! - ' + err.message);
		});

})();