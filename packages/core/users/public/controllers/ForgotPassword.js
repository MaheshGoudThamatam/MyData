'use strict';

angular.module('mean.users').controller('ForgotPasswordCtrl', [ 'MeanUser', '$rootScope', 'USERS', '$scope',
    function (MeanUser, $rootScope, USERS, $scope) {
        $scope.USERS = USERS;
        var vm = this;
        vm.user = {};
        vm.registerForm = MeanUser.registerForm = false;
        vm.forgotpassword = function () {
            MeanUser.forgotpassword(this.user);
        };
        $rootScope.$on('forgotmailsent', function (event, args) {
            vm.response = args;
        });
        vm.resetFormResetPassword = function () {
            document.getElementById("resetPwdForm").reset();
        };
    }
]);
