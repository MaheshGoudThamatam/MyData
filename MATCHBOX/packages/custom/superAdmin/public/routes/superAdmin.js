'use strict';

angular.module('mean.superAdmin').config(['$stateProvider','SUPERADMIN',
  function($stateProvider,SUPERADMIN) {
	
	$stateProvider.state(SUPERADMIN.STATE.SUPERADMIN, {
		url: SUPERADMIN.URL_PATH.SUPERADMIN,
      	templateUrl: SUPERADMIN.FILE_PATH.SUPERADMIN,
      	resolve: {
            loggedin: function (MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
    .state(SUPERADMIN.STATE.SUPERADMIN_DASHBOARD, {
    	url: SUPERADMIN.URL_PATH.SUPERADMIN_DASHBOARD,
      	templateUrl: SUPERADMIN.FILE_PATH.SUPERADMIN,
      	resolve: {
            loggedin: function (MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
    .state(SUPERADMIN.STATE.ADD_PARTNER, {
    	url: SUPERADMIN.URL_PATH.ADD_PARTNER,
    	templateUrl: SUPERADMIN.FILE_PATH.ADD_PARTNER,
    	resolve: {
            loggedin: function (MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
    .state(SUPERADMIN.STATE.LIST_PARTNERS, {
    	url: SUPERADMIN.URL_PATH.LIST_PARTNERS,
    	templateUrl: SUPERADMIN.FILE_PATH.LIST_PARTNERS,
    	resolve: {
            loggedin: function (MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
    })
    .state(SUPERADMIN.STATE.UPDATE_PARTNER, {
		url : SUPERADMIN.URL_PATH.UPDATE_PARTNER,
		templateUrl : SUPERADMIN.FILE_PATH.UPDATE_PARTNER,
		resolve: {
            loggedin: function (MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
	})
	.state(SUPERADMIN.STATE.PARTNER_DETAIL, {
		url : SUPERADMIN.URL_PATH.PARTNER_DETAIL,
		templateUrl : SUPERADMIN.FILE_PATH.PARTNER_DETAIL,
		resolve: {
            loggedin: function (MeanUser) {
                return MeanUser.checkLoggedin();
            }
        }
	});
	
  }
]);
