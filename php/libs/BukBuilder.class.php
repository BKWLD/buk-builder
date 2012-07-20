<?php

/**
 * Companion class for the BUK Builder NodeJS asset versioning tool. 
 *
 * @file		BukBuilder.class.php
 * @version 0.3.0
 *
 */

class BukBuilder {

	private static $config = '/build/config.json';
	private static $assets;
	
	// load config file and copy assets into place
	public static function init() {
		
		// load config json
		$docRoot = $_SERVER['DOCUMENT_ROOT'];
		$string = file_get_contents($docRoot . self::$config);
		$json = json_decode($string, true);
		
		// set props from config
		$dev = $json['dev'];
		$paths = $json['paths'];
		$files = $json['files'];
		$latestPath = $paths['latest'];
		$distPath = $paths['dist'];
		self::$assets = array();
		
		// loop thru the files list and populate the assets array
		foreach ($files as $fileName => $hashFileName) {
			
			// if we're in dev mode, set assets to latest and keep looping
			if ($dev) {
				self::$assets[$fileName] = $latestPath . $fileName;
				continue;
			// otherwise, set assets to hashed names
			} else {
				self::$assets[$fileName] = $distPath . $hashFileName;
			}
			
			// path vars for filesystem lookup
			$latestFilePath = $docRoot . $latestPath . $fileName;
			$hashFilePath = $docRoot . $distPath . $hashFileName;
			
			// if the file exists, continue the loop
			if (file_exists($hashFilePath)) {
				continue;
			// otherwise, copy the latest into the dist directory
			} elseif (is_writable(dirname($hashFilePath))) {
				copy($latestFilePath, $hashFilePath);
			// If we can't write a new file, though we need one, continue to use the last version.
			// This could lead to confusion but it's better than showing errors on production.  However,
			// if using PagodaBox, you can add /build/dist to the shared_writable_dirs.  See:
			// http://help.pagodabox.com/customer/portal/articles/175475-understanding-the-boxfile
			} else {
				continue;
			}
		}
	}
	
	// generate a CSS style tag
	public static function style($name) {
		return '<link rel="stylesheet" href="' . self::$assets[$name] . '">' . "\n";
	}
	
	// generate a JS script tag, with optional RequireJS support
	public static function script($name, $lib='') {
		// standard script tag
		if ($lib == '') {
			return '<script src="' . self::$assets[$name] . '"></script>';
		// RequireJS script tag
		} else {
			return '<script data-main="' . self::$assets[$name] . '" src="' . self::$assets[$lib] . '"></script>';
		}
	}
	
}