/*
 * <Author:Abha Singh>
 * <Date: 28-06-2016>
 * <constants: for location list, edit, add page>
 */

angular.module('mean.location').constant('LOCATION', {
    URL_PATH: {
        LOCATIONCREATE: '/locations/add',
        LOCATIONEDIT: '/locations/:locationId/edit',
        LOCATIONLIST: '/locations',

    },
    FILE_PATH: {
        LOCATIONCREATE: 'location/views/location_create.html',
        LOCATIONEDIT: 'location/views/location_edit.html',
        LOCATIONLIST: 'location/views/location_list.html',
    },
    STATE: {
        LOCATIONCREATE: 'Locations_create location',
        LOCATIONEDIT: 'Locations_update location',
        LOCATIONLIST: 'Locations_all locations',

    }
});