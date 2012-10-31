// Set the require.js configuration for the application
require.config({
	
	// Base path used to load scripts
	baseUrl: '/js/admin/',
	
	// Prevent caching during dev
	urlArgs: "bust=" + (new Date()).getTime(),
	
	// Exclude these modules on build
	stubModules: ['text'],
	
	// Set common library paths
	paths: {
		jquery: 'empty:' // jquery is already loaded
	}
});

// Define the application entry point
define('main', function (require) {
	
	// dependencies
	var $ = require('jquery'),
		widget = require('modules/widget');
		
	// modules loaded + DOM ready
	$(function () {
		widget();
	});
});

// Start the application
require(['main']);
