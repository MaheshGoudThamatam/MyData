'use strict';

angular.module('mean.investor').factory('PolicyService', function($resource) {
    return {
        name: 'policy', 
        
        page: $resource('/api/policy/pagination', {}, {
  		    update: {method: 'PUT'},
  		    query: {method: 'GET', isArray:false}
        }),
        crud: $resource('/api/policy/:policyId', { policyId : '@_id' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		})
    };
  }
);
