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

$(document).ready(function () {

	$('#content').removeClass('d-none');
	$('.loader-wrapper').removeClass('d-block');
	$('.loader-wrapper').addClass('d-none');

	initAutocomplete();

	// jquery bar rating plugin configuration
	$('#viewRating').barrating({
		theme: 'fontawesome-stars',
		readonly: true,
		showValues: true
	});

	// off canvas
	$('[data-toggle="offcanvas"]').on('click', function () {
		$('.row-offcanvas').toggleClass('active');
	});

	new WOW().init();

	// initial multi select
	(function(){
		var items = [
			{ value: 1, text: 'الحج' },
			{ value: 2, text: 'العمرة' },
			{ value: 3, text: 'الشعائر' },
			{ value: 4, text: 'فطار' },
			{ value: 5, text: 'غداء' },
			{ value: 6, text: 'سبا' },
			{ value: 7, text: 'خدمة الغرف' },
			{ value: 8, text: 'انترنت' },
			{ value: 9, text: 'حمامات سباحة' },
			{ value: 10, text: 'مطعم' }
		];
		var select = $('[data-paraia-multi-select="true"]').paraia_multi_select({
			multi_select: true,
			items: items,
			defaults: [],
			rtl: true
		});

		$('.dropdown .items .item').each(function(){
			$(this).click(function(){
				var Items = select.paraia_multi_select('get_items');
				var arr = [];
				$(items).each(function(){
					var ts = this;
					$(Items).each(function(){
						if (Number(this) === ts.value){
							arr.push(ts.text);
							$('#selecteInclude').val(arr);
							console.log(arr);
						}
					})
				});
			});
		});
	})();

	// init datepicker
	(function(){
		$(".datepicker").datepicker({
			dateFormat: "dd-mm-yy",
			minDate: new Date()
		});
	})();
	
	// (function(){
	// 	var alert = $('.alert');
	// 	if(alert){
	// 		alert.each(function(i){
	// 			$(this).fadeOut(1000*i, "linear", function () {
	// 				console.log('done');
	// 			});
	// 		})
	// 	}
	// })();

});