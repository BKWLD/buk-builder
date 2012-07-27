// Base class with events support

var klass = require('klass'),
events = require('events');

var BaseClass = klass(events.EventEmitter).methods({
	initialize: function () {
		events.EventEmitter.call(this);
	}
});

module.exports = BaseClass;