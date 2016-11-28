'use strict';

angular.module('mean.plugNplay').factory('PlugNplayService', function ($resource) {
    return {
       
        crud: $resource('/api/plugNplay', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        }),
        plugNPlay:$resource('/api/plugNplay/areas/:plugNplayId', {plugNplayId:'@_id'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
        plugNPlayForSearch:$resource('/api/city/plugNplay', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
        plugnplayUser:$resource('/api/plugNplay/userEnrolled', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
    };
});