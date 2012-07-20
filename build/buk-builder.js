/*! =======================================================
 * BUK Builder v0.4.1
 * Platform agnostic versioning tool for CSS & RequireJS.
 * https://github.com/danro/buk-builder-js
 * ========================================================
 * (c) 2012 Dan Rogers
 * This code may be freely distributed under the MIT license.
 * http://danro.mit-license.org/
 * ========================================================*/
/*jshint node:true */

// modules
var fs = require("fs"),
	rjs = require("requirejs"),
	colors = require("colors"),
	crypto = require("crypto"),
	_ = require("underscore");

// properties
var configFile = "./config.json",
	developing = process.argv[2] === "dev",
	testing = process.argv[2] === "test",
	latestPath = "./latest/",
	rootPath = fs.realpathSync("../"),
	rootLatest = fs.realpathSync(latestPath).replace(rootPath, "") + "/",
	logPrefix = "-- ".bold.blue,
	logArrow = "---> ".bold.grey,
	extJs = ".js",
	extCss = ".css";
	
// load config and notify if invalid
try {
	var config = require(configFile);
} catch (err) {
	console.log("===[ BUK Builder error! invalid config.json ]===".red.bold);
	process.exit(1);
}

// invoke methods and output results
if (developing) runDevMode();
else if (testing) runTestMode();

// dev mode ---------------------------------------------------------
function runDevMode() {
	showBanner();
	setDev(true);
	validateFiles();
	
	// replace js-modules with require statement for development
	console.log(logPrefix + "writing js modules for development:\n");
	var modules = config["js-modules"],
		modWrap = ['require.config(', ');'];
	if (modules) {
		_.each(modules, function (module, key) {
			// clone the module and set the path one level deeper
			module = cloneJSON(module);
			module.baseUrl = "../" + module.baseUrl;
			module.deps = [module.name]; // set deps array for require method
			delete module.name;
			var output = modWrap[0] + JSON.stringify(module, null, "  ") + modWrap[1];
			console.log(rootLatest + key + "\n" + logArrow + output.grey);
			fs.writeFileSync(latestPath + key, output);
		});
	} else {
		console.log("(no js-modules found in config)");
	}
	
	// dev mode finished
	logFinished();
}

// test mode ---------------------------------------------------------
function runTestMode() {
	showBanner();
	setDev(false);
	validateFiles();
	
	// optimize 'js-modules' files and replace them in latest dir
	var i=0;
	console.log(logPrefix + "optimizing files 'js-modules' using r.js compressor:");
	_.each(config["js-modules"], function (module, key) {
		rjs.optimize({
			baseUrl: module.baseUrl,
			name: module.name,
			paths: cloneJSON(module.paths),
			out: latestPath + key
		}, function (buildResponse) {
			console.log(buildResponse.replace(RegExp(rootPath, "g"), "").grey);
		});
	});
	
	// optimize 'css-compress' files and replace them in latest dir
	console.log(logPrefix + "optimizing files 'css-compress' using r.js compressor:");
	_.each(config["css-compress"], function (cssFile, index) {
		rjs.optimize({
			optimizeCss: "standard",
			cssIn: latestPath + cssFile,
			out: latestPath + cssFile
		}, function (buildResponse) {
			console.log(buildResponse.replace(RegExp(rootPath, "g"), "").grey);
		});
	});
	
	// create a hash digest for each file in files list
	console.log(logPrefix + "generating hash for each file in " + config.paths.latest + ":\n");
	var latestFiles = getLatestFiles(),
		hashResults = {},
		hashCallback = _.after(latestFiles.length, hashFinished);
	_.each(latestFiles, function (fileName, index) {
		var fileExt = getExt(fileName);
		hashFile(fileName, function (fileName, hash) {
			// format hash w/ a file extension
			hashResults[fileName] = fileName.replace(fileExt, "-") + hash + fileExt;
			hashCallback();
		});
	});
	
	// hash generation has finished
	function hashFinished() {
		// output hash results
		_.each(config.files, function (oldHash, fileName) {
			var hashResult = hashResults[fileName];
			if (hashResult !== oldHash) {
				config.files[fileName] = hashResult;
				hashResult = hashResult.cyan;
			} else {
				hashResult = hashResult.grey;
			}
			console.log(fileName + " " + logArrow + hashResult);
		});
		
		// save new file hashes to config
		writeConfig();
		
		// test mode finished
		logFinished();
	}
}

// helper methods ---------------------------------------------------------

// show the pretty banner
function showBanner() {
	console.log("==========[ BUK Builder ]==========".blue.bold);
}

// set the dev property which is later accessed from server-side script
function setDev(dev) {
	config.dev = dev;
	writeConfig();
	var mode = dev ? String(dev).bold.red : String(dev).bold.green;
	console.log(logPrefix + "setting dev mode: " + mode);
}

// utility to hash digest a given file
function hashFile(fileName, callback) {
	var shasum = crypto.createHash('sha1');

	var s = fs.ReadStream(latestPath + fileName);
	s.on('data', function(d) {
		shasum.update(d);
	});

	s.on('end', function() {
		var d = shasum.digest('hex');
		callback(fileName, d);
	});
}

// populate the files in config with any .js or .css found in latestPath
function validateFiles() {
	var latestFiles = getLatestFiles(),
		newFiles = {};
	_.each(latestFiles, function (fileName, index) {
		newFiles[fileName] = _.has(config.files, fileName) ? config.files[fileName] : fileName;
	});
	config.files = newFiles;
	writeConfig();
}

// get files from latest dir
function getLatestFiles() {
	return _.filter(fs.readdirSync(latestPath), function (fileName) {
		return getExt(fileName) !== null;
	});
}

function getExt(fileName) {
	if (fileName.indexOf(extJs) !== -1) return extJs;
	if (fileName.indexOf(extCss) !== -1) return extCss;
	return null;
}

// write the config JSON file
function writeConfig() {
	fs.writeFileSync(configFile, JSON.stringify(config, null, "\t"));
}

function cloneJSON(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function logFinished () {
	console.log("");
	console.log(logPrefix + "done!");
}
