export default function barRatingInit(){
	// jquery bar rating plugin configuration
	$('#viewRating, .reviewsRating').barrating({
		theme: 'fontawesome-stars',
		readonly: true,
		showValues: true
	});
	$('#companyRating').barrating({
		theme: 'fontawesome-stars',
		readonly: false,		
		showValues: true
	});
};