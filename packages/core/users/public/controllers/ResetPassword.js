'use strict';

angular.module('mean.users').controller('ResetPasswordCtrl', function (MeanUser, $location, USERS, $scope, $stateParams) {
    $scope.USERS = USERS;

    var vm = this;
    vm.user = {};
    vm.registerForm = MeanUser.registerForm = false;
    $scope.checkToken = function () {
        $http.get('/api/user/confirmToken/' + $stateParams.tokenId);
    };

    $scope.resetFormResetPassword = function () {
        document.getElementById("resetPwdForm").reset();
    };

    vm.resetpassword = function () {
        MeanUser.resetpassword(this.user);
        $location.path(USERS.URL_PATH.LOGIN);

    };
});