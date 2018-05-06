export default function tooltips(){
	$('[data-toggle="tooltip"]').tooltip({
		trigger: 'hover focus',
		template: '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
	});
};