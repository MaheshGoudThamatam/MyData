'use strict';

angular.module('mean.team').factory('TeamService', function($resource) {
	return {
		teamCreate : $resource('/api/:partnerId/team', {  partnerId : '@partnerId' , roleType :'admin'}, {
			update : { method : 'PUT' },
			query : { method : 'GET', isArray : true }
		}),
		teamEdit : $resource('/api/team/:partnerId/:teamId', {  partnerId : '@partnerId' ,teamId :'@_id'}, {
			update : { method : 'PUT' },
			query : { method : 'GET', isArray : true }
		}),
		teamList : $resource('/api/:partnerId/team', {  partnerId : '@partnerId'}, {
			update : { method : 'PUT' },
			query : { method : 'GET', isArray : true }
		}),
		teamOne : $resource('/api/team/:partnerId/:teamId', {  partnerId : '@partnerId' , roleType :'partner', teamId:'@teamId'}, {
			update : { method : 'PUT' },
			query : { method : 'GET', isArray : true }
		}),
		page: $resource('/api/role/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        })

	};
});
