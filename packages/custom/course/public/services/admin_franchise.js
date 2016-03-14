'use strict';
/**
 * Franchise Course Service
 */
angular.module('mean.course').factory('FranchiseService', function($resource) {
	   return {
		   franchise: $resource('/api/franchise/:franchiseId', {
		    	 franchiseId : '@_id' 
			     }, {
		             update : { method : 'PUT' },
		             query: {method: 'GET', isArray: true}

			 
			 
			     }),
		   page: $resource('/api/franchise/pagination', {}, {
		        update: {
		            method: 'PUT'
		        },
		        query: {
		            method: 'GET',
		            isArray: false
		        }
		        
		     }),
		     
	   };
		     
});
 