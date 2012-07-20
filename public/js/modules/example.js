define(function (require) {
	
	// dependencies
	var $ = require('jquery');
	require('plugins/jquery.crap');
	
	// define module class
	var Example = function () {
		$('body').append('<p>Hello from example module.</p>');
		$('body').crap();
	};
	
	// return exposed module
	return Example;
});