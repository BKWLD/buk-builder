// Set the require.js configuration for the application
require.config({
	
	// Base path used to load scripts
	baseUrl: '/js/',
	
	// Set common library paths
	paths: {
		jquery: 'empty:', // jquery is already loaded
		underscore: 'libs/underscore',
		backbone: 'libs/backbone'
	}
});

// Define the application entry point
define('main', function (require) {
	
	// dependencies
	var $ = require('jquery'),
		_ = require('underscore'),
		Backbone = require('backbone'),
		Example = require('modules/example');
		
	// modules loaded + DOM ready
	$(function () {
		new Example();
	});
});

// Start the application
require(['main']);
