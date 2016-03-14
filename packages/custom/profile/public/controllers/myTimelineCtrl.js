'use strict';
/**
 * Controller of the My profile page
 */
angular.module('mean.profile').controller('MyTimelineCtrl', function ($scope, MeanUser,PROFILE) {
    $scope.package = {
        name: 'profile',
        modelName: 'Profile'
    };
    initializeBreadCrum($scope, $scope.package.modelName, PROFILE.URL_PATH.PROFILE_MY_PROFILE,"My Timeline","Profile Page Description");
    $scope.noImage=true;
    $scope.loadUser = function () {
        $scope.user = MeanUser.user;
        $scope.userInfo = $scope.user;
        if ($scope.userInfo.avatar == '') {
            $scope.noImage = true;
        }
    };

    $scope.removeImage = function () {
        $scope.noImage = true;
    };


});
