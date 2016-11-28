angular.module('mean.audit').constant('AUDIT', {
    PATH: {
    	LIST_AUDITCATEGORY: '/audit-category',
    	CREATE_AUDITCATEGORY: '/audit-category/create',
    	EDIT_AUDITCATEGORY: '/audit-category/:auditCategoryId/edit',
        AUDITCATEGORY_BULKUPLOAD: '/audit-category/:auditCategoryId/bulkupload',
        AUDITCREATE: '/audit/add',
        AUDITLIST: '/audits',
        AUDITLISTBACK: '/audits/:locationId/:buildingId',
        AUDITEDIT: '/audit/:auditId/edit',
        PERFORMAUDIT:'/audit/:auditId/perform',
        PERFORMAUDITVIEW :'/audit/:performId/view',
        PERFORMEDLIST:'/performedaudit'
    },
    FILE_PATH: {
    	LIST_AUDITCATEGORY: 'audit/views/audit_category_list.html',
    	CREATE_AUDITCATEGORY: 'audit/views/audit_category_create.html',
    	EDIT_AUDITCATEGORY: 'audit/views/audit_category_edit.html',
        AUDITCATEGORY_BULKUPLOAD: 'audit/views/audit_category_bulkupload.html',
        AUDITCREATE: 'audit/views/audit_create.html',
        AUDITLIST: 'audit/views/audit_list.html',
        AUDITLISTBACK: 'audit/views/audit_list.html',
        AUDITEDIT: 'audit/views/audit_edit.html',
        PERFORMAUDIT:'audit/views/perform_audit.html',
        PERFORMAUDITVIEW:'audit/views/performaudit_view.html',
        PERFORMEDLIST:'audit/views/performedaudit_list.html'
    },
    STATE: {
    	LIST_AUDITCATEGORY: 'Audit Categories_all audit categories',
    	CREATE_AUDITCATEGORY: 'Audit Categories_audit category create',
    	EDIT_AUDITCATEGORY: 'Audit Categories_audit category edit',
        AUDITCATEGORY_BULKUPLOAD: 'Audit Categories_audit categories bulkupload',
        AUDITCREATE: 'Audits_create audit',
        AUDITLIST: 'Audits_all audits',
        AUDITLISTBACK: 'Audits_all audits*',
        AUDITEDIT: 'Audits_update audit',
        PERFORMAUDIT:'Perform audits',
        PERFORMAUDITVIEW:'Perform audit view',
        PERFORMEDLIST:'Perform audit list'
    }
});

