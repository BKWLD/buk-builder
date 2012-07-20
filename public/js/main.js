define(function (require) {
	
	// dependencies
	var $ = require('jquery'),
	_ = require('underscore'),
	Backbone = require('backbone'),
	Example = require('modules/example');
		
	// jquery + modules have loaded, handle DOM ready event.
	$(function() {
			new Example();
	});
});