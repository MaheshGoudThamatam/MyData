'use strict';

angular.module('mean.superAdmin').factory('SuperAdmin', function($resource) {
	return {
		name : 'superAdmin',
		crud : $resource('/api/partner/:partnerId', {partnerId : '@partnerId'}, {
					update : {
						method : 'PUT'
					},
					query : {
						method : 'GET',
						isArray :  true,
						headers : {
							'Authorization' : 'Bearer ' + localStorage.getItem("JWT")
						}
					}
				}),
		loadroomtypeCommssionPercentage : $resource('/api/addroom/loadroomtypes', {}, {
			          update: { method: 'PUT' },
			          query: { method: 'GET', isArray: true }
			   }),		
				
	};
});
