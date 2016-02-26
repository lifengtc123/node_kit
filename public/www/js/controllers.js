'use strict';

/* Controllers */

var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('IndexCtrl', ['$scope', 'Phone',
    function($scope, Phone) {
        $scope.title="盒子";
        $scope.setTitle = function(name) {
            $scope.title = name;
        }

        $scope.setView = function(name) {
            alert(111);
        }

    }]);


phonecatControllers.controller('BoxesCtrl', ['$scope', 'Phone',
  function($scope, Phone) {
    $scope.phones = Phone.query();
    $scope.orderProp = 'age';

      $scope.setView2 = function(name) {
          alert(222);
      }
  }]);

phonecatControllers.controller('MessagesCtrl', ['$scope', '$routeParams', 'Phone',
  function($scope, $routeParams, Phone) {
      $scope.title="消息";
      $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {

    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);
