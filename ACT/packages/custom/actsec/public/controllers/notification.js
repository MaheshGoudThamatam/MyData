(function() {
    'use strict';

    /* jshint -W098 */

    angular.module('mean.actsec').controller('NotificationController', NotificationController);
    NotificationController.$inject = ['$scope', '$rootScope', 'Global', 'Socket', '$stateParams', 'MeanUser', 'NotificationService', 'utilityService', '$location'];

    function NotificationController($scope, $rootScope, Global, Socket, $stateParams, MeanUser, NotificationService, utilityService, $location) {
        $scope.global = Global;
        $scope.package = {
            name: 'socket'
        };

        $scope.notifs = [];
        $scope.notify = [];
        $scope.pageNo = 0;

        $rootScope.$on('loggedin', function() {
            var socketAuth = {
                token: MeanUser.JWT,
                user: MeanUser.user._id
            };
            NotificationService.notifications.query({}, function(notifs) {
                $scope.notifs = notifs;
            });
            Socket.emit('auth', socketAuth);
            $rootScope.$on('refreshNotifications', function() {
                NotificationService.notifications.query({}, function(notifs) {
                    $scope.notifs = notifs;
                });
            });
        });

        $scope.$on('socket:notify', function(event, data) {
            if (!data.payload) {
                return;
            }
            var notif = JSON.parse(data.payload);
            $scope.notifs.unshift(notif);
            $scope.notifs = utilityService.uniq($scope.notifs, '_id');
        });

        $scope.notification = function() {
            NotificationService.notify.query({
            	page : $scope.pageNo,
            	perPage : 10
            }, function(notify) {
                $scope.notify = notify;
            });
        };

        $scope.goNotif = function(notif) {
            NotificationService.markRead(notif._id, function() {
                $rootScope.$emit('refreshNotifications');
            });
            $location.path(notif.link);
        };

        $scope.readAll = function() {
            NotificationService.markAllRead(function(res) {
                if (res.data.status == 'success') {
                    $scope.notification();
                    $rootScope.$emit('refreshNotifications');
                } else {
                    utilityService.flash.error('Server error occurred. Please try again.');
                }
            })
        };
        
        $scope.readMore = function(){
        	$scope.pageNo = $scope.pageNo + 1;
        	NotificationService.notify.query({
        		page : $scope.pageNo,
            	perPage : 10
            }, function(notify) {
                $scope.notifications = notify;
                console.log($scope.notifications.length);
                for(var i=0;i<$scope.notifications.length; i++){
                	$scope.notify.push($scope.notifications[i]);
                }
            });
        }
    }

})();