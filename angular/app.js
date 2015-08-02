
var myApp = angular.module('myApp', ['ngRoute', 'appControllers'])
var appControllers = angular.module('appControllers', [])

myApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/login', {
			templateUrl: 'views/login.html'
		})
		// 	when('/renewable', {
		// 	templateUrl: 'views/renewable.html'
		// })
}])

console.log("inside app")
