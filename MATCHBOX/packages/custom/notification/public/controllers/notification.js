'use strict';

/* jshint -W098 */
angular.module('mean.notification').controller('NotificationController', function ($scope,$rootScope, Global, NotificationService,$stateParams,$timeout,$location,flash) {
    $scope.global = Global;
    $scope.package = {
        name: 'notification'
    };
    flashmessageOn($rootScope, $scope,flash);
    $scope.loadNotification = function(){
        $scope.notificationId = $stateParams.notificationId;
        NotificationService.show.query({notificationId: $scope.notificationId},function(alert){
            $scope.alert = alert;
        });
    };

    $scope.loadAlert = function(){
        $timeout(function(){
            NotificationService.all.query({userId: $rootScope.user._id},function(alerts){
                $scope.alerts = alerts;
            })
        },200)
    };

    $scope.readNotification = function(alert){
        $location.url(alert.url)
    }
});
