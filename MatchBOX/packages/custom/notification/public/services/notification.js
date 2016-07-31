'use strict';

angular.module('mean.notification').factory('NotificationService',
    function($resource) {
        return {
            activeAll: $resource('/api/notifications/:userId/active', {userId: '@userId'}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            all:$resource('/api/notifications/:userId', {userId: '@userId'}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            show:$resource('/api/notification/:notificationId', {notificationId: '@notificationId'}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            })
        };
    });
