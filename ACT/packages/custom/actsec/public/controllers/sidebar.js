(function() {
    'use strict';

    function SidebarController($scope, $rootScope, Global, utilityService, MeanUser, $location, $http) {
        // Original scaffolded code.
        $scope.global = Global;
        $scope.package = {
            name: 'actsec'
        };

        $rootScope.$on('loggedin', function() {
            $http.get('/api/permissions').success(function(permissions) {
                MeanUser.permissions = permissions;
                $scope.features = permissions;
                // TODO: Trying to make the sidebar update the active link on page load. Need to make this work.
                // $rootScope.$emit('updateSidebar', true);
            });
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $rootScope.state = toState;
            $scope.currentState = toState;
        });

        $scope.$watch('currentState', function(value) {
            if ($scope.features) {
                for (var i = 0; i < $scope.features.length; i++) {
                    $scope.features[i].active = false;
                    if ($scope.features[i].url.split('/')[1] == value.url.split('/')[1]) {
                        $scope.features[i].active = true;
                    }
                }
            }
        });

        // TODO: Trying to make the sidebar update the active link on page load. Need to make this work.
        // $rootScope.$on('updateSidebar', function() {
        //     for (var i = 0; i < $scope.features.length; i++) {
        //         $scope.features[i].active = false;
        //         if ($scope.features[i].url.split('/')[1] == $scope.currentState.url.split('/')[1]) {
        //             $scope.features[i].active = true;
        //         }
        //     }
        // });
    }

    angular.module('mean.actsec').controller('SidebarController', SidebarController);

    SidebarController.$inject = ['$scope', '$rootScope', 'Global', 'utilityService', 'MeanUser', '$location', '$http'];
})();