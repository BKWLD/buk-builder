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
	jsdom = require('jsdom'),
	config = require('../config.js'),
	BaseClass = require('base-class'),
	_ = require('underscore');

// properties
var realRoot = fs.realpathSync('../'),
	realPublic = '',
	realDist = '',
	srcPrefix = config.paths.prefix,
	distPath = srcPrefix + config.paths.dist,
	logPrefix = '-- ',
	logArrow = '---> '.bold.grey,
	devMode = 'dev',
	buildMode = 'build',
	extJs = '.js',
	extCss = '.css';
	
// define / validate real paths
try {
	realPublic = fs.realpathSync(realRoot + '/' + config.paths.public),
	realDist = fs.realpathSync(realPublic + '/' + config.paths.dist);
} catch (e) {
	console.log(e);
	process.exit();
}

// BukBuilder singleton - run the builder and output results
var BukBuilder = BaseClass.extend({
	
	assets: {},
	templates: {},
	
	// main flow ---------------------------------------------------------
	initialize: function (mode) {
		var self = this;
		
		// common init
		mode = self.validMode(mode);
		self.showBanner(mode);
		self.initAssets();
		self.initTemplates();
		
		// optimize assets in build mode
		if (mode === buildMode) _.invoke(self.assets, 'optimize');
		
		// update tags in template files
		_.invoke(self.templates, 'update');
		
		// finished!
		self.logFinished();
	},
	
	// helpers ---------------------------------------------------------
	showBanner: function (mode) {
		var self = this;
		console.log('==========[ BUK Builder ('.blue.bold + mode + ') ]=========='.blue.bold);
	},
		
	validMode: function (mode) {
		var validModes = [devMode, buildMode];
		return _.contains(validModes, mode) ? mode : devMode;
	},
	
	initAssets: function () {
		var self = this;
		_.each(config.assets, function (value, key) {
			var asset = new Asset(value);
			self.assets[asset.id] = asset;
			asset.on('invalid', _.bind(self.removeAsset, self));
			asset.validate();
		});
	},
	
	initTemplates: function () {
		var self = this;
		_.each(config.templates, function (value, index) {
			var template = new Template(value);
			template.assets = self.assets;
			self.templates[value] = template;
			template.on('invalid', _.bind(self.removeTemplate, self));
			template.validate();
		});
	},
	
	removeAsset: function (asset) {
		var self = this;
		delete self.assets[asset.id];
	},
	
	removeTemplate: function (template) {
		var self = this;
		delete self.templates[template.src];
	},
	
	logFinished: function () {
		console.log("");
		console.log(logPrefix + "done!");
	}
});

// BaseFile class - validation and warning messages
var BaseFile = BaseClass.extend({
	
	basePath: realRoot,
	src: null,
	
	validate: function (name) {
		if (!name) name = 'file';
		var self = this;
		// validate src file within public directory
		try {
			self.realPath = fs.realpathSync(self.basePath + '/' + self.src);
		} catch (e) {
			console.log(logPrefix + (name + ' warning: ').red.bold +
				'"' + config.paths.public + '/' + self.src + '" does not exist.');
			self.emit('invalid', self);
			return false;
		}
		return true;
	}
});


// Asset class - validate and optimize assets
var Asset = BaseFile.extend({
	
	basePath: realPublic,
	id: null,
	src: null,
	min: false,
	rjs: false,
	
	initialize: function (obj) {
		var self = this;
		_.extend(self, obj);
	},
	
	validate: function () {
		var self = this;
		var valid = self.supr('asset');
		if (valid) {
			// add prefix to src
			self.src = srcPrefix + self.src;
		}
	},
	
	optimize: function () {
		
	}
});

// Template class - validate and modify templates
var Template = BaseFile.extend({
	
	assets: {}, // reference to builder.assets
	
	initialize: function (src) {
		var self = this;
		self.src = src;
	},
	
	validate: function () {
		var self = this;
		var valid = self.supr('template');
	},
	
	update: function () {
		
	}
});

// start the build process
new BukBuilder(process.argv[2]);
