define(function (require) {
	
	// dependencies
	var $ = require('jquery');
	
	// define some jQuery plugin
	$.fn.crap = function() {
		return this.append('<p>Crap is Go!</p>');
	};
});