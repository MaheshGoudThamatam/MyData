'use strict';

angular.module('mean.users').controller('changePasswordCtrl', [ 'MeanUser', '$location', '$scope' , '$http', 'USERS', 'PROFILE', '$timeout',
    function (MeanUser, $location, $scope, $http, USERS, PROFILE, $timeout) {
        $scope.USERS = USERS;
        $scope.PROFILE = PROFILE;
        $scope.changePasswordMessage = "Password has been updated successfully.";
        $scope.changepassword = function (form, user) {
            if (user === null) {
                $scope.inValidForm = true;
                form.$setDirty();
            } else {
                $http.put('/api/updatePassword/' + MeanUser.user._id, user).then(function (response) {

                    if (response) {
                    }
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
        }
        $scope.redirectProfile = function () {
            $location.path(PROFILE.URL_PATH.DASHBOARD);
        };
    }
]);