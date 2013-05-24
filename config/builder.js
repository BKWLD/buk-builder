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
		"base": "js", // base dir for requirejs modules
		"admin": "js/admin", // custom base dir for requirejs modules
		"prefix": "/" // prefix for all tag src attributes
	},
	
	// assets to minify and hash
	assets: [
		// options:
		//   id: data-build-id
		//   src: dev src path
		//   min: minify?
		//   rjs: requirejs module base, default: false, true == "base"
		//   hashname: produce a hashed filename?
		{ id: "jquery",    src: "js/libs/require-jquery.js" },
		{ id: "modernizr", src: "js/libs/modernizr.js" },
		{ id: "style",     src: "css/style.css", min: true },
		{ id: "main",      src: "js/main.js", min: true, rjs: true },
		{ id: "admin",     src: "js/admin/main.js", min: true, rjs: "admin" }
	],
	
	// templates with asset tags to maintain
	templates: [
		// (path relative to root)
		"public/index-alt.html",
		"public/index.html"
	]
};
