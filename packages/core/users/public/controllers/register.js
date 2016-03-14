'use strict';

angular
		.module('mean.users')
		.controller(
				'RegisterCtrl',
				function($rootScope, MeanUser, $scope, $cookies, USERS,
						$timeout, $http, flash, MESSAGES,$translate) {
					$scope.USERS = USERS;
					var vm = this;
					vm.user = {};

					vm.registerForm = MeanUser.registerForm = true;

					vm.input = {
						type : 'password',
						placeholder : 'Password',
						placeholderConfirmPass : 'Repeat Password',
						iconClassConfirmPass : '',
						tooltipText : 'Show password',
						tooltipTextConfirmPass : 'Show password'
					};

					vm.togglePasswordVisible = function() {
						vm.input.type = vm.input.type === 'text' ? 'password'
								: 'text';
						vm.input.placeholder = vm.input.placeholder === 'Password' ? 'Visible Password'
								: 'Password';
						vm.input.iconClass = vm.input.iconClass === 'icon_hide_password' ? ''
								: 'icon_hide_password';
						vm.input.tooltipText = vm.input.tooltipText === 'Show password' ? 'Hide password'
								: 'Show password';
					};
					vm.togglePasswordConfirmVisible = function() {
						vm.input.type = vm.input.type === 'text' ? 'password'
								: 'text';
						vm.input.placeholderConfirmPass = vm.input.placeholderConfirmPass === 'Repeat Password' ? 'Visible Password'
								: 'Repeat Password';
						vm.input.iconClassConfirmPass = vm.input.iconClassConfirmPass === 'icon_hide_password' ? ''
								: 'icon_hide_password';
						vm.input.tooltipTextConfirmPass = vm.input.tooltipTextConfirmPass === 'Show password' ? 'Hide password'
								: 'Show password';
					};

					// Register the register() function
					vm.register = function() {
						this.user.isMentor = $rootScope.isMentor;
						if ($rootScope.projectId) {
							this.user.project = $rootScope.projectId;
						}
						MeanUser.register(this.user);

					};

					$rootScope.$on('registerfailed', function() {
						flash
								.setMessage(MeanUser.registerError,
										MESSAGES.ERROR);
					});
				});