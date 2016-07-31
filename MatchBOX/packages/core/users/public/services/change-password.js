'use strict';

angular.module('mean.users').factory('ChangePasswordService',
  function($resource) {
    return {
      name: 'changePassword',
      
      changePassword : $resource('/api/change-password', {}, {
			update : { method : 'PUT' }
      })
      
    };
  });
