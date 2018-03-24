'use strict'
var autocomplete;
function initAutocomplete() {
	if (!document.getElementById('autocomplete')) return;
	autocomplete = new google.maps.places.Autocomplete(
		/* @type {!HTMLInputElement} */(document.getElementById('autocomplete')), {
			types: ['geocode']
		});
	autocomplete.addListener('place_changed', function () {
		var place = autocomplete.getPlace();
		var addressComponentsLength = place.address_components.length;
		document.getElementById('lng').value = place.geometry.location.lng();
		document.getElementById('lat').value = place.geometry.location.lat();
		document.getElementById('country').value = place.address_components[addressComponentsLength - 1].long_name;
		document.getElementById('city').value = place.address_components[addressComponentsLength - 2].long_name;
	});
	document.getElementById('autocomplete').addEventListener('keydown', function (e) {
		if (e.keyCode === 13) e.preventDefault();
	});
}

initAutocomplete();
