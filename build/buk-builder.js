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
var realRoot = fs.realpathSync('../'),
	realPublic = '',
	realDist = '',
	srcPrefix = config.paths.prefix,
	distPath = srcPrefix + config.paths.dist,
	jquery = fs.readFileSync('./utils/jquery-1.7.2.min.js').toString(),
	logPrefix = '-- ',
	logArrow = '---> '.bold.grey,
	modeDev = 'dev',
	modeBuild = 'build',
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
	  self.showBanner();
		self.initAssets();
		self.initTemplates();
		
		// TODO
		
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
			asset.on('invalid', _.bind(self.removeAsset, self));
			asset.validate();
		});
		
		console.log(self.assets);
	},
	
	initTemplates: function () {
		var self = this;
		_.each(config.templates, function (value, index) {
			var template = new Template(value);
			self.templates[value] = template;
			template.on('invalid', _.bind(self.removeTemplate, self));
			template.validate();
		});
		
		console.log(self.templates);
	},
	
	removeAsset: function (asset) {
		var self = this;
		delete self.assets[asset.id];
	},
	
	removeTemplate: function (template) {
		var self = this;
		delete self.templates[template.src];
	}
	
});

// BaseFile class - file validation and warning messages
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


// Asset class - validate and minify assets
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
	}
});

// Template class - validate and modify templates
var Template = BaseFile.extend({
	
	basePath: realRoot,
	
	initialize: function (src) {
		var self = this;
		self.src = src;
	},
	
	validate: function () {
		var self = this;
		var valid = self.supr('template');
	}
	
});

// start the build process
new BukBuilder(process.argv[2]);
