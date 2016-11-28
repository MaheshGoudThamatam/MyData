/*
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <constants: for company list,edit, add page>
 */

angular.module('mean.company').constant('COMPANY', {
    PATH: {
    	COMPANY_ADD: '/company/add',
    	COMPANY_EDIT: '/company/:companyId/edit',
    	COMPANY_LIST: '/company'
    },
    FILE_PATH: {
    	COMPANY_ADD: 'company/views/company-add.html',
    	COMPANY_EDIT: 'company/views/company-edit.html',
    	COMPANY_LIST: 'company/views/company-list.html'
    },
    STATE: {
    	COMPANY_ADD: 'Company_create company',
    	COMPANY_EDIT: 'Company_update company',
    	COMPANY_LIST: 'Company_all companies'
    }
});