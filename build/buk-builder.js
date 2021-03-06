/*! =======================================================
 * BUK Builder v0.6.1
 * Platform agnostic versioning tool for CSS & RequireJS.
 * https://github.com/bkwld/buk-builder
 * ========================================================
 * (c) 2012 Dan Rogers
 * This code may be freely distributed under the MIT license.
 * http://danro.mit-license.org/
 * ========================================================*/

// dependencies
var fs = require('fs')
  , events = require('events')
  , crypto = require('crypto')
  , path = require('path')
  , async = require('async')
  , requirejs = require('requirejs')
  , colors = require('colors')
  , cheerio = require('cheerio')
  , _ = require('underscore')
  , P = require('pjs').P
;

// properties
var config = null
  , baseDir = '../'
  , realRoot = ''
  , realPublic = ''
  , realDist = ''
  , srcPrefix = ''
  , distPath = ''
  , logPrefix = '-- '
  , logArrow = '---> '.bold.grey
  , extJs = '.js'
  , extCss = '.css'
;

// parse arguments from key=value pairs and store in options object
var options = {};
_.each(_.rest(process.argv, 2), function (argument) {
  var pair = argument.split('=');
  options[pair[0]] = pair[1];
});

/* ========================================================
 * Base class - extends EventEmitter
 * ========================================================
 */
var BaseClass = P(events.EventEmitter, function (proto, supr) {
  proto.init = function () {
    events.EventEmitter.call(this);
  };
});
  
/* ========================================================
 * BukBuilder singleton - run the builder and output results
 * ========================================================
 */
var BukBuilder = P(BaseClass, function (proto, supr) {
  
  proto.assets = {};
  proto.templates = {};
  
  // main constructor
  proto.init = function () {
    supr.init.call(this);
    var self = this;
    
    // banner-only mode
    if (options.mode === 'banner') {
      self.showBanner();
      process.exit();
    }
    
    // common init
    self.loadConfig();
    self.newline();
    self.initAssets();
    self.initTemplates();
    
    // if there are no assets, we're done here
    if (!_.size(self.assets)) process.exit();
    
    // begin opimizing assets if in build mode
    if (options.mode === 'build') {
      // start async series for all assets
      var series = _.map(self.assets, function (asset) {
        return _.bind(asset.optimize, asset);
      });
      async.series(series, function (err, results) {
        self.assetsReady();
      });
      
    // otherwise skip ahead to ready
    } else {
      self.assetsReady();
    }
  };
  
  proto.loadConfig = function () {
    // determine base dir from options
    if (_.isString(options.base)) baseDir += options.base;
    try {
      baseDir = fs.realpathSync(baseDir);
    } catch (e) {
      console.log(logPrefix + 'invalid base directory: '.red.bold + baseDir);
      process.exit();
    }
    
    // load config module
    var configFile = 'config.js';
    if (_.isString(options.config)) configFile = options.config;
    try {
      config = require(baseDir + '/' + configFile);
    } catch (e) {
      console.log(logPrefix + 'error loading config file: '.red.bold + configFile);
      console.log(e.toString());
      process.exit();
    }
    
    srcPrefix = config.paths.prefix;
    distPath = srcPrefix + config.paths.dist;
    
    // define / validate real paths
    try {
      realRoot = fs.realpathSync(baseDir);
      realPublic = fs.realpathSync(realRoot + '/' + config.paths.public),
      realDist = fs.realpathSync(realPublic + '/' + config.paths.dist);
    } catch (e) {
      console.log(logPrefix + 'error reading directory: '.red.bold);
      console.log(e.toString());
      process.exit();
    }
  };
    
  proto.assetsReady = function () {
    var self = this;
    
    // update tags in template files
    _.invoke(self.templates, 'update');
    
    // finished!
    self.logFinished();
  };
  
  // helper methods
  proto.showBanner = function () {
    var self = this,
      label = _.isString(options.label) ? options.label : '';
    console.log('==========[ BUK Builder ('.blue.bold + label + ') ]=========='.blue.bold);
  };
  
  proto.newline = function () {
    console.log('');
  };
  
  proto.initAssets = function () {
    var self = this;
    _.each(config.assets, function (value, key) {
      var asset = new Asset(value);
      self.assets[asset.id] = asset;
      asset.on('invalid', _.bind(self.removeAsset, self));
      asset.validate();
    });
  };
  
  proto.initTemplates = function () {
    var self = this;
    _.each(config.templates, function (value, index) {
      var template = new Template(value);
      template.assets = self.assets;
      self.templates[value] = template;
      template.on('invalid', _.bind(self.removeTemplate, self));
      template.validate();
    });
  };
  
  proto.removeAsset = function (asset) {
    var self = this;
    delete self.assets[asset.id];
  };
  
  proto.removeTemplate = function (template) {
    var self = this;
    delete self.templates[template.src];
  };
  
  proto.logFinished = function () {
    console.log("");
    console.log(logPrefix + "done!");
  };
});

// BaseFile class - validation and warning messages
var BaseFile = P(BaseClass, function (proto, supr) {
  
  proto.validate = function (name) {
    if (!name) name = 'file';
    var self = this;
    // validate src file within public directory
    try {
      self.realPath = fs.realpathSync(self.basePath + '/' + self.src);
      self.logSrc = self.realPath.replace(realRoot + '/', '');
    } catch (e) {
      console.log(logPrefix + (name + ' warning: ').red.bold +
        '"' + config.paths.public + '/' + self.src + '" does not exist.');
      self.emit('invalid', self);
      return false;
    }
    return true;
  };
});


/* ========================================================
 * Asset class - validate and optimize assets
 * ========================================================
 */
var Asset = P(BaseFile, function (proto, supr) {
  
  proto.basePath = null;
  proto.id = null;
  proto.src = null;
  proto.min = false;
  proto.rjs = false;
  proto.hashname = true;
  proto.ext = null;
  
  proto.init = function (obj) {
    supr.init.call(this);
    var self = this;
    _.extend(self, obj);
    self.basePath = realPublic;
    // bind scope for anon callbacks
    _.bindAll(self, ['rjsOut']);
  };
  
  proto.validate = function (name) {
    var self = this;
    var valid = supr.validate.call(self, 'asset');
    if (valid) {
      // add prefix to src
      self.src = srcPrefix + self.src;
      self.ext = path.extname(self.src);
      self.name = path.basename(self.src, self.ext);
      self.dirname = path.dirname(self.realPath);
    }
  };
  
  proto.optimize = function (callback) {
    var self = this;
    
    // tempDist file name is realDist + id
    var tempDist = realDist + '/' + self.id + self.ext;
    
    // define async handler for optimize/copy methods
    self.done = done;
    
    if (self.rjs) {
      // if rjs value is truthy, use it to find the base module path
      self.modulePath = config.paths[self.rjs] || config.paths.base || config.paths.js;
      // asset is an rjs module, optimize it regardless of min setting
      self.optimizeJs(tempDist);
    } else if (self.min) {
      // if not an rjs module, we should still minify
      if (self.ext === extJs) self.optimizeJs(tempDist);
      if (self.ext === extCss) self.optimizeCss(tempDist);
    } else {
      // otherwise, simply copy the file into dist
      self.copy(tempDist);
    }
    
    // optimze is done, time to hash
    function done() {
      // hash and rename the tempDist
      self.hash(tempDist, self.hashname);
      callback();
    }
  };
  
  proto.optimizeJs = function (outFile) {
    var self = this;
    // RequireJS module combine + minify (if set)
    if (self.rjs) {
      console.log(logPrefix + "optimizing javascript module: " + (self.logSrc).green);
      requirejs.optimize({
        mainConfigFile: self.realPath,
        baseUrl: realPublic + '/' + self.modulePath,
        name: self.name,
        optimize: self.min ? 'uglify' : 'none',
        out: outFile
      }, self.rjsOut, self.rjsError);
    
    // normal javascript minify
    } else {
      console.log(logPrefix + "optimizing javascript file: " + (self.logSrc).green);
      requirejs.optimize({
        baseUrl: self.dirname,
        include: self.name,
        skipModuleInsertion: true,
        out: outFile
      }, self.rjsOut, self.rjsError);
    }
  };
  
  proto.optimizeCss = function (outFile) {
    var self = this;
    console.log(logPrefix + "optimizing css file: " + (self.logSrc).green);
    requirejs.optimize({
      optimizeCss: 'standard',
      cssIn: self.realPath,
      out: outFile
    }, self.rjsOut, self.rjsError);
  };
  
  proto.copy = function (outFile) {
    var self = this;
    var sourceFile = fs.readFileSync(self.realPath);
    console.log(logPrefix + "copying file to dist: " + (self.logSrc).green);
    fs.writeFileSync(outFile, sourceFile);
    self.done();
  };
  
  proto.hash = function (tempDist, hashname) {
    var self = this;
    try {
      // hash digest the tempDist file
      var data = fs.readFileSync(tempDist, 'utf8'),
        digest = crypto.createHash('sha1').update(data).digest('hex'),
        fileName = hashname ? self.id + '-' + digest + self.ext : self.id + self.ext,
        distFile = realDist + '/' + fileName;
      
      // rename the temp file to the new hashed name
      fs.renameSync(tempDist, distFile);
      
      // store new src for templates
      self.src = distPath + '/' + fileName;
      console.log(distFile.replace(realRoot + '/', '').grey + '\n');
      
    } catch (e) {
      // console.log(e);
    }
  };
  
  proto.rjsOut = function (buildResponse) {
    var self = this;
    var response = buildResponse.replace(RegExp(realRoot + '/', "g"), "");
    var lines = _.without(response.split('\n'), '');
    lines = _.rest(lines, 2);
    console.log(lines.join('\n').grey);
    self.done();
  };

  proto.rjsError = function() {
    console.log('\n-- require.JS error:'.red.bold);
    console.log(err);
  };
});

/* ========================================================
 * Template class - validate and modify templates
 * ========================================================
 */
var Template = P(BaseFile, function (proto, supr) {
  
  proto.assets = {}; // reference to builder.assets
  proto.realPath = null;
  proto.attrMap = { link: 'href', script: 'src' };
  
  proto.init = function (src) {
    supr.init.call(this);
    var self = this;
    self.src = src;
    self.basePath = realRoot;
  };
  
  proto.validate = function (name) {
    var self = this;
    var valid = supr.validate.call(self, 'template');
  };
  
  proto.update = function () {
    var self = this;
    
    // load page into cheerio for jquery style dom manipulation
    var htmlStart = fs.readFileSync(self.realPath, 'utf8');
    var $ = cheerio.load(htmlStart);
    
    // for each tag with a valid data-build-id, match the current asset src
    $('*[data-build-id]').each(function () {
      var $tag = $(this),
        srcAttr = self.attrMap[$tag[0].name],
        asset = self.assets[$tag.attr('data-build-id')];
      
      // skip invalid assets or invalid tag types
      if (!asset || !srcAttr) return;
      
      // change tag source attribute
      $tag.attr(srcAttr, asset.src);
    });
    
    // write the updated template file if it has changed
    var htmlResult = $.html();
    if (htmlStart === htmlResult) {
      console.log(logPrefix + 'template unchanged: ' + (self.logSrc).grey);
    } else {
      console.log(logPrefix + 'template modified: ' + (self.logSrc).green);
      fs.writeFileSync(self.realPath, htmlResult);
    }
  };
});

// start the build process
new BukBuilder();
