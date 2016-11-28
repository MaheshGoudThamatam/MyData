/*
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <constants: for company list,edit, add page>
 */

angular.module('mean.building').constant('SITE', {
    PATH: {
    	BUILDING_ADD: '/sites/add',
    	BUILDING_EDIT: '/sites/:buildingId/edit',
    	BUILDING_LIST: '/sites'
    },
    FILE_PATH: {
    	BUILDING_ADD: 'building/views/building-add.html',
    	BUILDING_EDIT: 'building/views/building-edit.html',
    	BUILDING_LIST: 'building/views/building-list.html'
    },
    STATE: {
    	BUILDING_ADD: 'Site_create site',
    	BUILDING_EDIT: 'Site_update site',
    	BUILDING_LIST: 'Site_all sites'
    }
});