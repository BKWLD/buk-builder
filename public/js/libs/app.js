// Set the require.js configuration for your application.
require.config({
	
	// Base path used to load local scripts
	baseUrl: "/js/",
	
	// Define named libraries
	paths: {
		"jquery": "empty:", // jquery is already loaded
		"underscore": "libs/underscore",
		"backbone": "libs/backbone"
	},
	
	// Initialize the main js application
	deps: ["main"]
});