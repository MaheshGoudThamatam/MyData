'use strict';
/* jshint -W098 */
angular.module('mean.course').controller('UserAvailabilityController', function($scope, $stateParams, Global, BATCHService, $location, $rootScope, COURSE, flash, MESSAGES, $timeout, BRANCH) {
    $scope.global = Global;
    $scope.package = {
        name: 'Course',
        name1: 'Branch',
        modelName: 'Batch',
        featureName: 'Batches'
    };
    $scope.COURSE = COURSE;
    $scope.MESSAGES = MESSAGES;
    
});