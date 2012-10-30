/*! =======================================================
 * BUK Builder configuration
 * required by: build/buk-builder.js
 * ========================================================*/
/*jshint node:true*/

module.exports = {
	// file paths for builder
	paths: {
		"public": "public", // public directory which contains all assets
		"dist": "dist", // output dir for hashed assets
		"js": "js", // base dir for all requirejs modules
		"prefix": "/" // prefix for all tag src attributes
	},
	
	// assets to minify and hash
	assets: [
		// options:
		//   id: data-build-id
		//   src: dev src path
		//   min: minify?
		//   rjs: requirejs module?
		//   baseUrl: path (relative to the public directory) of the js file
		{ id: "jquery",    src: "js/libs/require-jquery.js" },
		{ id: "modernizr", src: "js/libs/modernizr.js" },
		{ id: "style",     src: "css/style.css", min: true },
		{ id: "main",      src: "js/main.js", min: true, rjs: true }
	],
	
	// templates with asset tags to maintain
	templates: [
		// (path relative to root)
		"public/index.html",
		"app/partials/header.html",
		"app/partials/footer.html"
	]
};
