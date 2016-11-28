(function() {
    'use strict';

    function StarterController($scope, $rootScope, Global, utilityService, MeanUser, $location, Socket, $window) {
        // Original scaffolded code.
        $scope.global = Global;
        $scope.package = {
            name: 'actsec'
        };

        //Set the initial title of the page to appName (see CONFIG angular constant)
        utilityService.setPageTitle();

        $scope.bodyClass = 'state login';
        $scope.loggedin = false;
        $scope.user = {};

        $rootScope.$on('loggedin', function() {
            $scope.loggedin = MeanUser.loggedin;
            $scope.bodyClass = 'state page-header-fixed page-sidebar-closed-hide-logo page-content-white page-sidebar-fixed';
            $scope.user = MeanUser.user;
        });

        $scope.$watch('user', function(user) {
            if (user.firstLogin) {
                $location.path('/set-password');
            }
            $scope.$on('$locationChangeStart', function(event, next, current) {
                if (user.firstLogin) {
                    if (next.indexOf('/logout') > -1){
                        user = {};
                    } else {
                        $location.path('/set-password');
                    }
                } else {
                    if (next.indexOf('/set-password') > -1) {
                        $location.path('/');
                    }
                }
            });
        });

        $rootScope.$on('logout', function() {
            $scope.bodyClass = 'state login';
            $scope.loggedin = false;
        });

        $rootScope.$on('loginfailed', function() {
            $scope.bodyClass = 'state login';
            $scope.loggedin = false;
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $("html, body").animate({
                scrollTop: 0
            }, 200);
            if (toState.name == 'Estimate external security task' || toState.name == 'Incidents_create incident') {
                if (!$scope.loggedin) {
                    $('body').addClass('white-bg');
                }
            } else {
                $('body').removeClass('white-bg');
            }
        });
    }

    angular.module('mean.actsec').controller('StarterController', StarterController);

    StarterController.$inject = ['$scope', '$rootScope', 'Global', 'utilityService', 'MeanUser', '$location', 'Socket', '$window'];
})();