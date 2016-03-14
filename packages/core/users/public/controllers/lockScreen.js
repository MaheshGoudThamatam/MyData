'use strict';

angular.module('mean.users').controller('lockScreenCtrl', function ($rootScope, MeanUser, $location, $scope, USERS, $timeout, flash, MESSAGES,$cookies,COURSE) {
    $scope.USERS = USERS;


    // Register the login() function
    $scope.unlock = function (form) {
        if (form.$invalid) {
            $scope.inValidForm = true;
            form.$setDirty();
        } else {
            MeanUser.login(this.user);
        }
        
    };
});
