'use strict';

angular.module('mean.users')
    .controller('AuthCtrl', ['$scope', '$rootScope', '$http', '$state', 'Global',
        function($scope, $rootScope, $http, $state, Global) {
            // This object will contain list of available social buttons to authorize
            $scope.socialButtonsCounter = 0;
            $scope.global = Global;
            $scope.$state = $state;

            $http.get('/api/get-config')
                .success(function(config) {
                    if (config.hasOwnProperty('local')) delete config.local; // Only non-local passport strategies
                    $scope.socialButtons = config;
                    $scope.socialButtonsCounter = Object.keys(config).length;
                });
        }
    ])
    .controller('LoginCtrl', ['$rootScope', 'MeanUser',
        function($rootScope, MeanUser) {
            var vm = this;

            // This object will be filled by the form
            vm.user = {};

            vm.input = {
                type: 'password',
                placeholder: 'Password',
                confirmPlaceholder: 'Repeat Password',
                iconClass: '',
                tooltipText: 'Show password'
            };

            vm.togglePasswordVisible = function() {
                vm.input.type = vm.input.type === 'text' ? 'password' : 'text';
                vm.input.placeholder = vm.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
                vm.input.iconClass = vm.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
                vm.input.tooltipText = vm.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
            };

            $rootScope.$on('loginfailed', function() {
                vm.loginError = MeanUser.loginError;
            });

            // Register the login() function
            vm.login = function() {
                MeanUser.login(this.user);
            };
        }
    ])
    .controller('RegisterCtrl', ['$rootScope', 'MeanUser',
        function($rootScope, MeanUser) {
            var vm = this;

            vm.user = {};

            vm.registerForm = MeanUser.registerForm = true;

            vm.input = {
                type: 'password',
                placeholder: 'Password',
                placeholderConfirmPass: 'Repeat Password',
                iconClassConfirmPass: '',
                tooltipText: 'Show password',
                tooltipTextConfirmPass: 'Show password'
            };

            vm.togglePasswordVisible = function() {
                vm.input.type = vm.input.type === 'text' ? 'password' : 'text';
                vm.input.placeholder = vm.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
                vm.input.iconClass = vm.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
                vm.input.tooltipText = vm.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
            };
            vm.togglePasswordConfirmVisible = function() {
                vm.input.type = vm.input.type === 'text' ? 'password' : 'text';
                vm.input.placeholderConfirmPass = vm.input.placeholderConfirmPass === 'Repeat Password' ? 'Visible Password' : 'Repeat Password';
                vm.input.iconClassConfirmPass = vm.input.iconClassConfirmPass === 'icon_hide_password' ? '' : 'icon_hide_password';
                vm.input.tooltipTextConfirmPass = vm.input.tooltipTextConfirmPass === 'Show password' ? 'Hide password' : 'Show password';
            };

            // Register the register() function
            vm.register = function() {
                MeanUser.register(this.user);
            };

            $rootScope.$on('registerfailed', function() {
                vm.registerError = MeanUser.registerError;
            });
        }
    ])
    .controller('ForgotPasswordCtrl', ['MeanUser', '$rootScope', '$location', 'utilityService',
        function(MeanUser, $rootScope, $location, utilityService) {
            var vm = this;
            vm.user = {};
            vm.registerForm = MeanUser.registerForm = false;
            vm.forgotpassword = function() {
                MeanUser.forgotpassword(this.user);
            };
            $rootScope.$on('forgotmailsent', function(event, args) {
                if (args.status == 'success') {
                    $location.path('/login');
                    utilityService.flash.info('Password reset instructions have been sent to your registered email.');
                } else {
                    vm.user = {};
                    utilityService.flash.error('No user with that email exists.')
                }
                vm.response = args;
            });
        }
    ])
    .controller('ResetPasswordCtrl', ['MeanUser', '$rootScope', '$location', 'utilityService', '$scope',
        function(MeanUser, $rootScope, $location, utilityService, $scope) {
            var vm = this;
            $scope.user = {};
            vm.registerForm = MeanUser.registerForm = false;
            vm.resetpassword = function() {
                if ($scope.validPassword && ($scope.user.password === $scope.user.confirmPassword)) {
                    MeanUser.resetpassword($scope.user);
                } else {
                    $scope.submitted = true;
                } 
            };
            $scope.$watch('user.password', function(password) {
                if (password) {
                    var pattern = new RegExp("^(?=.*[A-Z])(?=.*[!@#$%&_+=])(?=.*[0-9])(?=.*[a-z]).{8,}$");
                    $scope.validPassword = pattern.test(password);
                }
            });

            $scope.showPass = function(event) {
            var element = event.target.previousElementSibling;
            if ($(element).attr('type') == 'password') {
                $(element).attr('type', 'text');
                $(event.currentTarget).find('i').removeClass('fa-eye');
                $(event.currentTarget).find('i').addClass('fa-eye-slash');
            } else {
                $(element).attr('type', 'password');
                $(event.currentTarget).find('i').removeClass('fa-eye-slash');
                $(event.currentTarget).find('i').addClass('fa-eye');
            }
        };

        $scope.showPassAlt = function(event) {
            var element = $(event.currentTarget).parent().prev();
            if ($(element).attr('type') == 'password') {
                $(element).attr('type', 'text');
                $(event.target).removeClass('fa-eye');
                $(event.target).addClass('fa-eye-slash');
                event.stopPropagation();
            } else {
                $(element).attr('type', 'password');
                $(event.target).removeClass('fa-eye-slash');
                $(event.target).addClass('fa-eye');
                event.stopPropagation();
            }
        };

            $rootScope.$on('passwordresetdone', function(event, args) {
                vm.errors = [];
                if (Array.isArray(args)) {
                    args.forEach(function(arg) {
                        vm.errors.push(arg.msg);
                    })
                } else {
                    $location.path('/login');
                    if (args.user) {
                        utilityService.flash.success('Your password has been successfully updated. Please login with the new password.');
                    } else if (args.msg) {
                        utilityService.flash.error(args.msg);
                    } else {
                        utilityService.flash.error('There was an error resetting your password. Please try again or contact support.');
                    }
                }
            });
        }
    ]);