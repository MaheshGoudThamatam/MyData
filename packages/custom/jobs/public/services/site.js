'use strict';

angular.module('mean.jobs').factory('SiteService', function($resource) {
	return {

		site : $resource('/api/site/:siteId', {
			siteId : '@_id'
		}, {
			update : {
				method : 'PUT'
			}
		}),
		page : $resource('/api/site/pagination', {}, {
			update : {
				method : 'PUT'
			},
			query : {
				method : 'GET',
				isArray : false
			}
		}),
	};
});
