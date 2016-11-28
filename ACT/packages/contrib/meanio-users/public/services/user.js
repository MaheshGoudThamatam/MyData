(function() {
    'use strict';
    angular.module('mean.users').factory('UserService', UserService);
    UserService.$inject = ['$http', '$q', '$resource'];

    function UserService($http, $q, $resource) {
        return {
            users: $resource('/api/users/:createuserId', {
                createuserId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            locationAndBuilding: $resource('/api/user/locationandbuilding', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            currentUser: $resource('/api/user', {}, {
                method: 'GET'
            }),
            updateUserPassword: $resource('/api/changepassword', {}, {
                method: 'POST'
            }),
            saveProfileImage: $resource('/api/profile/imageUpload', {}, {
                method: 'POST'
            })
        }
    }
})();