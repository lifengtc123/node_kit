'use strict';

/* App Module */

var phonecatApp = angular.module('phonecatApp', [
  'ngRoute',
    'ngAnimate',

  'phonecatControllers',
  'phonecatFilters',
  'phonecatServices'
]);

phonecatApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/boxes', {
        templateUrl: 'partials/boxes.html',
        controller: 'BoxesCtrl'
      }).
      when('/message', {
        templateUrl: 'partials/messages.html',
        controller: 'MessagesCtrl'
      }).
        when('/alert', {
            templateUrl: 'partials/alert.html',
            controller: 'MessagesCtrl'
        }).
        when('/setting', {
            templateUrl: 'partials/setting.html',
            controller: 'MessagesCtrl'
        }).
      otherwise({
        redirectTo: '/boxes'
      });
  }]);
