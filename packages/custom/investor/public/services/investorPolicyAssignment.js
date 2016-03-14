'use strict';

angular.module('mean.investor').factory('InvestorPolicyAssignmentService', function($resource) {
    return {
        name: 'investorpolicyassignment', 
        
        page: $resource('/api/policy/pagination', {}, {
  		    update: {method: 'PUT'},
  		    query: {method: 'GET', isArray:false}
        }),
        crud: $resource('/api/admin/policy-request', {}, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		})
    };
  }
);
