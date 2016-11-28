angular.module('mean.superAdmin').constant('SUPERADMIN', {
    URL_PATH: {
    	SUPERADMIN: '/superAdmin/example',
    	SUPERADMIN_DASHBOARD: '/superAdmin/dashboard',
        ADD_PARTNER: '/superAdmin/add-partner',
        LIST_PARTNERS: '/superAdmin/partners',
        UPDATE_PARTNER: '/superAdmin/partner/:partnerId/edit',
        PARTNER_DETAIL: '/superAdmin/partner/:partnerId/patrner-detail',
    },
    
    FILE_PATH: {
    	SUPERADMIN: 'superAdmin/views/index.html',
    	SUPERADMIN_DASHBOARD: 'superAdmin/views/admin-dashboard.html',
    	ADD_PARTNER: 'superAdmin/views/adminAddPartner.html',
    	LIST_PARTNERS: 'superAdmin/views/admin-partner-list.html',
    	UPDATE_PARTNER: 'superAdmin/views/admin-partner-update.html',
        PARTNER_DETAIL: 'superAdmin/views/admin-partner-detail.html',
    },

    STATE: {
    	SUPERADMIN: 'super admin',
    	SUPERADMIN_DASHBOARD: 'super admin dashboard',
    	ADD_PARTNER: 'add partner',
    	LIST_PARTNERS: 'list partner',
    	UPDATE_PARTNER: 'edit partner',
        PARTNER_DETAIL: 'patrner detail',
    }
});