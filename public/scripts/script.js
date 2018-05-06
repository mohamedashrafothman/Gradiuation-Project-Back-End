'use strict'

import chart from '../../node_modules/chart.js/dist/Chart.min.js';
import initChartJs from './modules/chart.js';
import misc from './modules/misc.js';
import offCanvas from './modules/off-canvas.js';
import dashboard from './modules/dashboard.js';
import loader from './modules/loader.js';
import barRatingInit from './modules/barRatingInit.js';
import datePickerInit from './modules/datePickerInit.js';
import wowJsInit from './modules/wowJsInit.js';
import mapAutoComplete from './modules/mapAutoComplete.js';
import scrollSmothy from './modules/scroll-smothy';
import tooltips from './modules/tooltips';

$(document).ready(function () {

	initChartJs();
	misc();
	dashboard();
	offCanvas();
	loader();
	barRatingInit();
	datePickerInit();
	wowJsInit();
	mapAutoComplete();
	scrollSmothy();
	tooltips();
	
});