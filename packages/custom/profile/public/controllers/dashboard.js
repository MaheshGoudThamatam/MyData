'use strict';

angular.module('mean.profile').controller('userDashboardCtrl', function (MeanUser, $location, $scope, $http, $rootScope,$translate,URLFactory) {
    $scope.package = {
        name: 'profile',
        modelName: 'Dashboard'
    };
    console.log("DashBoard Controller");
    $scope.URLFactory=URLFactory;
    pageTitleMessage($scope,$translate,'dashboard.WELCOME','dashboard.TITLE_DESC');
    initializeBreadCrum($scope, $scope.package.modelName, URLFactory.PROFILE.URL_PATH.DASHBOARD);

    $rootScope.$on('loggedin', function () {
        $scope.features();
    });

    $scope.activateLeftBar = function (url) {
        return $location.path().indexOf(url) > -1 ? "active" : "";
    };
});
