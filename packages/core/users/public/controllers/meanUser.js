'use strict';
angular.module('mean.users').controller('AuthCtrl', ['$scope', '$rootScope', '$http', '$state', 'Global', 'USERS',
    function($scope, $rootScope, $http, $state, Global, USERS) {
        // This object will contain list of available social
        // buttons to authorize
        $scope.USERS = USERS;
        $scope.socialButtonsCounter = 0;
        $scope.global = Global;
        $scope.$state = $state;
        $http.get('/api/get-config').success(function(config) {
            if (config.hasOwnProperty('local')) delete config.local; // Only
            // non-local
            // passport
            // strategies
            $scope.socialButtons = config;
            $scope.socialButtonsCounter = Object.keys(config).length;
        });
    }
]);