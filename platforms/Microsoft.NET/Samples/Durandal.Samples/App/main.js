﻿requirejs.config({
	baseUrl: 'App',
	paths: {
		'text': '../Scripts/text',
		'durandal': '../Scripts/durandal',
		'plugins': '../Scripts/durandal/plugins',
		'transitions': '../Scripts/durandal/transitions',
		'knockout': '../Scripts/knockout-2.2.1.debug',
		'bootstrap': '../Scripts/bootstrap',
		'jquery': '../Scripts/jquery-1.9.1'
	},
	shim: {
		'bootstrap': {
			deps: ['jquery'],
			exports: '$.support.transition' // just picked one
		},
		'jquery': {
			exports: function () {
				return jQuery;
			},
		}
	}
});



define('main', ['durandal/system', 'durandal/app', 'durandal/viewLocator'], function (system, app, viewLocator) {
	//>>excludeStart("build", true);
	system.debug(true);
	//>>excludeEnd("build");

	app.title = 'Durandal Samples';

	//specify which plugins to install and their configuration
	app.plugins = {
		router: true,
		dialog: true,
		widget: {
			kinds: ['expander']
		}
	};

	app.start().then(function () {
		//Replace 'viewmodels' in the moduleId with 'views' to locate the view.
		//Look for partial views in a 'views' folder in the root.
		viewLocator.useConvention();

		//Show the app by setting the root view model for our application.
		app.setRoot('shell');
	});
});