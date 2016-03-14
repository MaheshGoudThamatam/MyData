'use strict';

angular.module('mean.users').controller('LoginCtrl', function ($rootScope, MeanUser, $location, $scope, USERS, $timeout, flash, MESSAGES,$cookies,COURSE,$translate) {
    $scope.USERS = USERS;
    var vm = this;
    vm.user = {};
    var queryParams = $location.search();
    switch (queryParams.confirmation || queryParams.errorcode) {
        case "0":
            flash.setMessage(USERS.MESSAGES.USER_VERIFIED, MESSAGES.SUCCESS);
            break;
        case "1":
            flash.setMessage(USERS.MESSAGES.NOT_CONFIRMED, MESSAGES.ERROR);
            break;
        case "2":
            flash.setMessage(USERS.MESSAGES.CONFIRMATION_TOKEN_EXPIRED, MESSAGES.ERROR);
            break;
        case "3":
            flash.setMessage(USERS.MESSAGES.CONFIRMATION_TOKEN_EXPIRED, MESSAGES.ERROR);
            break;
        case "7":
            flash.setMessage(USERS.MESSAGES.DIFFERENT_PROVIDER, MESSAGES.ERROR);
            break;
    }
    $rootScope.$on('loggedin', function () {
    	   var enrollCourseIdCookie = $cookies.get('enrollCourseId');
	    	if (enrollCourseIdCookie) {
            var urlPath = COURSE.URL_PATH.COURSEDETAILS;
            urlPath = urlPath.replace(":courseId", enrollCourseIdCookie);
                $location.path(urlPath);
		} else {
                $location.path(MESSAGES.DASHBOARD_URL);
		}
    });
    vm.input = {
        type: 'password',
        placeholder: 'Password',
        confirmPlaceholder: 'Repeat Password',
        iconClass: '',
        tooltipText: 'Show password'
    };

    vm.togglePasswordVisible = function () {
        vm.input.type = vm.input.type === 'text' ? 'password' : 'text';
        vm.input.placeholder = vm.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
        vm.input.iconClass = vm.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
        vm.input.tooltipText = vm.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
    };

    $rootScope.$on('loginfailed', function () {
        flash.setMessage(MeanUser.loginError, MESSAGES.ERROR);
    });

    // Register the login() function
    vm.login = function (form) {
        if (form.$invalid) {
            $scope.inValidForm = true;
            form.$setDirty();
        } else {
            MeanUser.login(this.user);
        }
        
    };
});
