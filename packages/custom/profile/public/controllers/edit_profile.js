'use strict';
/**
 * Controller of the My profile page
 */
angular.module('mean.profile').controller('EditProfileCtrl', function ($scope, MeanUser,USERS,MESSAGES,flash,PROFILE,CityService, $http,$location,$translate) {
    $scope.package = {
        name: 'profile',
        modelName: 'Profile'
    };
    $scope.MESSAGES = MESSAGES;
    $scope.USERS = USERS;
    console.log("Profile Controller");
    
    initializeBreadCrum($scope, $scope.package.modelName, PROFILE.URL_PATH.PROFILE_MY_PROFILE);
    pageTitleMessage($scope,$translate,'profile.edit_profile.WELCOME','profile.edit_profile.TITLE_DESC');

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
    $scope.loadCityList = function () {
    	var countryId = $scope.userInfo.country[0]._id;
        CityService.cityBasedCountry.query({'countryId':countryId},function (cityList) {
            $scope.cityList = cityList;
            	
        });
    };
    
    $scope.editProfileAccount = function(userInfId){
    	 $location.path(PROFILE.URL_PATH.PROFILE_EDIT_ACCOUNT);
    };
    
    $scope.cancelEditProfileAccount = function () {
        $location.path(PROFILE.URL_PATH.PROFILE_MY_PROFILE);
    };
    
    $scope.update = function(isValid) {
    	console.log($scope.userInfo);
    	 if ($scope.userInfo === null) {
             $scope.inValidForm = true;
             form.$setDirty();
         } else {
             $http.put('/api/updateProfile/' + MeanUser.user._id, $scope.userInfo).then(function (response) {

                 if (response) {
                 }
                 flash.setMessage(MESSAGES.USER_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                 $location.path(USERS.URL_PATH.DASHBOARD);
                 $location.path($location.path());
             }, function (error) {
                 if (error.data instanceof Array) {
                     $scope.err = error.data;

                 } else {
                     $scope.err = [];
                     $scope.err.push(error.data);
                 }
             });
         }

    };

});
