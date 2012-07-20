define([
	"jquery"
],

function($) {
	$.fn.crap = function() {
		return this.append('<p>Crap is Go!</p>');
	};
});
