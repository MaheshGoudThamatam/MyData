(function() {
    'use strict';
    angular.module('mean.actsec').factory('NotificationService', NotificationService);
    NotificationService.$inject = ['$resource', '$http'];

    function NotificationService($resource, $http) {
        return {
            notifications: $resource('/api/notifications', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),

            notify: $resource('/api/fetchallnotifications', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),

            markRead: function(id, callback) {
                $http.get('/api/notifications/read/' + id).then(function(success_res) {
                    callback();
                }, function(failure_res) {
                    callback();
                });
            },

            markAllRead: function(callback) {
                $http.get('/api/notifications/readAll').then(function(success_res) {
                    callback(success_res);
                }, function(failure_res) {
                    callback(failure_res);
                });
            }
        };
    }
})();