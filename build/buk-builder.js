/*! =======================================================
 * BUK Builder v0.5.0
 * Platform agnostic versioning tool for CSS & RequireJS.
 * https://github.com/danro/buk-builder-js
 * ========================================================
 * (c) 2012 Dan Rogers
 * This code may be freely distributed under the MIT license.
 * http://danro.mit-license.org/
 * ========================================================*/

// dependencies
var fs = require('fs'),
	rjs = require('requirejs'),
	colors = require('colors'),
	crypto = require('crypto'),
	config = require('../config.js'),
	BaseClass = require('./utils/base-class'),
	_ = require('underscore');

// properties
var rootPath = fs.realpathSync('../'),
	publicPath = '',
	distPath = '',
	distPrefix = config.paths.dist.replace(config.paths.public, ''),
	jquery = fs.readFileSync('./utils/jquery-1.7.2.min.js').toString(),
	logPrefix = '-- '.bold.blue,
	logArrow = '---> '.bold.grey,
	modeDev = 'dev',
	modeBuild = 'build',
	extJs = '.js',
	extCss = '.css';
	
// define / validate real paths
try {
	publicPath = fs.realpathSync(rootPath + '/' + config.paths.public),
	distPath = fs.realpathSync(rootPath + '/' + config.paths.dist);
	
} catch (e) {
	console.log(e);
	process.exit();
}

// BukBuilder singleton - run the builder and output results
var BukBuilder = BaseClass.extend({
	
	assets: {},
	
	// run logic ---------------------------------------------------------
	initialize: function (mode) {
		var self = this;
	  self.showBanner();
		self.initAssets();
		
		console.log(publicPath);
		console.log(distPath);
		console.log(distPrefix);
		
	},
	
	// helpers ---------------------------------------------------------
	showBanner: function () {
		console.log('==========[ BUK Builder ]=========='.blue.bold);
	},
	
	initAssets: function () {
		var self = this;
		_.each(config.assets, function (value, key) {
			var asset = new Asset(value);
			self.assets[asset.id] = asset;
		});
	}
	
});

// Asset class - manage each asset's state
var Asset = BaseClass.extend({
	
	id: null,
	src: null,
	min: false,
	rjs: false,
	
	initialize: function (obj) {
		_.extend(this, obj);
	}
});

// start the build process
new BukBuilder(process.argv[2]);
