define(function (require) {
	
	// dependencies
	var $ = require('jquery');
	
	// define module class
	var widget = function () {
		$('body').append('<p>Admin widget wants to party.</p>');
	};
	
	// return exposed module
	return widget;
});