
var myApp = angular.module('myApp', ['ngRoute', 'appControllers'])
var appControllers = angular.module('appControllers', [])

myApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', { templateUrl: 'views/projects.tpl.html' })
		.when('/about', { templateUrl: 'views/login.html' })
		.when('/feedback', { templateUrl: 'views/feedback.tpl.html'})
		.when('/renewable', { templateUrl: 'views/renewable.html'})
		.when('/wireframe', { templateUrl: 'views/wireframe.tpl.html'})
}])

console.log("inside app")
