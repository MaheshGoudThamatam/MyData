(function() {
    'use strict';

    function PageHeaderController($scope, $rootScope, Global, utilityService, MeanUser, $location, $state) {
        // Original scaffolded code.
        $scope.global = Global;
        $scope.package = {
            name: 'actsec'
        };
        $rootScope.$on('loggedin', function() {
            $scope.user = MeanUser.user;
            if (angular.isUndefined($scope.user.company)) {
                $scope.user.company = {
                    company_name: 'Actsec'
                };
            }
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $scope.pageTitle = $state.current.name.split('_')[0];
            if ($state.current.name.split('_')[1]) {
                $scope.pageSubTitle = $state.current.name.split('_')[1].replace('*', '');
            } else {
                $scope.pageSubTitle = '';
            }
        });
    }

    angular.module('mean.actsec').controller('PageHeaderController', PageHeaderController);

    PageHeaderController.$inject = ['$scope', '$rootScope', 'Global', 'utilityService', 'MeanUser', '$location', '$state'];
})();