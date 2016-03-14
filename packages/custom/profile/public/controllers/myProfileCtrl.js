'use strict';
/**
 * Controller of the My profile page
 */
angular.module('mean.profile').controller('MyProfileCtrl', function ($scope, MeanUser,PROFILE,CityService) {
    $scope.package = {
        name: 'profile',
        modelName: 'Profile'
    };
    console.log("Profile Controller");
    initializeBreadCrum($scope, $scope.package.modelName, PROFILE.URL_PATH.PROFILE_MY_PROFILE,"My Profile","Profile Page Description");
    $scope.noImage=true;
    $scope.loadUser = function () {
        $scope.user = MeanUser.user;
        $scope.userInfo = $scope.user;
        console.log( $scope.userInfo);
        if ($scope.userInfo.avatar == '') {
            $scope.noImage = true;
        }
    };

    $scope.removeImage = function () {
        $scope.noImage = true;
    };
    $scope.loadCityList = function () {
    	var countryId = $scope.userInfo.country[0]._id;
        CityService.cityBasedCountry.query({'countryId':countryId},function (cityList) {
            $scope.cityList = cityList;
           
        });
    };

});
