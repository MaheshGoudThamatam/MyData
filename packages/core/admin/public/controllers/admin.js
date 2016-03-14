'use strict';

angular.module('mean.admin').controller('AdminController', function ($scope, Global, $rootScope, MeanUser) {
    $scope.global = Global;
    $scope.menus = {};
    $scope.overIcon = false;
    $scope.user = MeanUser;

    $scope.isCollapsed = false;

    $rootScope.$on('loggedin', function () {
        $scope.global = {
            authenticated: !!$rootScope.user,
            user: $rootScope.user
        };
    });
});
