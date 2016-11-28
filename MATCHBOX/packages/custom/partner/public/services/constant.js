angular.module('mean.partner').constant('PARTNER', {
    URL_PATH: {
    	PARTNER_LIST: '/admin/partner',
    	PARTNER_CREATE: '/admin/partner/create',
    	PARTNER_UPDATE: '/admin/partner/:partnerId/edit',
    	PARTNER_DELETE: '/admin/partner/:partnerId/delete'
    },
    
    FILE_PATH: {
    	PARTNER_LIST: 'partner/views/partner_list.html',
    	PARTNER_CREATE: 'partner/views/partner_create.html',
    	PARTNER_UPDATE: 'partner/views/partner_edit.html',
    	PARTNER_DELETE: 'partner/views/partner_delete.html'
    },

    STATE: {
    	PARTNER_LIST: 'partner',
    	PARTNER_CREATE: 'partner create',
    	PARTNER_UPDATE: 'partner update',
    	PARTNER_DELETE: 'partner delete'
    }
});