angular.module('mean.amenity').constant('AMENITY', {
    URL_PATH: {
    	AMENITY_LIST: '/admin/amenity',
    	AMENITY_CREATE: '/admin/amenity/create',
    	AMENITY_UPDATE: '/admin/amenity/:amenityId/edit'
    },
    
    FILE_PATH: {
    	AMENITY_LIST: 'amenity/views/amenity_list.html',
    	AMENITY_CREATE: 'amenity/views/amenity_create.html',
    	AMENITY_UPDATE: 'amenity/views/amenity_edit.html'
    },

    STATE: {
    	AMENITY_LIST: 'amenity list',
    	AMENITY_CREATE: 'amenity create',
    	AMENITY_UPDATE: 'amenity  update'
    }
}); 