define(function (require) {
	
	// dependencies
	var $ = require('jquery')
		, _ = require('underscore')
		, Backbone = require('backbone')
		, crap = require('plugins/jquery.crap')
	;
	
	var ExampleView = Backbone.View.extend({
		
		initialize: function () {
			this.$el.append('<p>Hello from example module.</p>');
			this.$el.crap();
		}
		
	});
	
	// return exposed module
	return ExampleView;
});