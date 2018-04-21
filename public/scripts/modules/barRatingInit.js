export default function barRatingInit(){
	// jquery bar rating plugin configuration
	$('#viewRating').barrating({
		theme: 'fontawesome-stars',
		readonly: true,
		showValues: true
	});
	$('#addTrip').barrating({
		theme: 'fontawesome-stars',
		showValues: true,
		deselectable: false,
		readonly: true
	});
};