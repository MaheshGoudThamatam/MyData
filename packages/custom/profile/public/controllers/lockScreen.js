'use strict';

angular.module('mean.profile').controller('lockScreenCtrl', function ($scope, $rootScope, MeanUser, $location, $cookieStore) {
    $scope.loadUser = function () {
        $scope.user = MeanUser.user;

    };

    // Register the login() function
    $scope.unlockPage = function () {
        $cookieStore.remove('pageLocked');
        $location.path("/profile/dashboard");
    };

});
