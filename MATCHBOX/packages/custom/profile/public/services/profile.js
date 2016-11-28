'use strict';

angular.module('mean.profile').factory('ProfileService',
  function($resource) {
    return {
      name: 'profile',
      
      userProfile : $resource('/api/user/:userId/update', {userId : '@userId'}, {
			update : { method : 'PUT' }
      }),
      contactPage : $resource('/api/contact-us', {data : '@data'}, {
			query : { 
				method : 'GET',
				isArray: true
            } 
      })
      
    };
  });
