angular.module('mean.space_type').constant('SPACE_TYPE', {
    URL_PATH: {
    	SPACE_TYPE_LIST: '/admin/space-type',
    	SPACE_TYPE_CREATE: '/admin/space-type/create',
    	SPACE_TYPE_UPDATE: '/admin/space-type/:spaceTypeId/edit',
    	SPACE_TYPE_DELETE: '/admin/space-type/:spaceTypeId/delete'
    },
    
    FILE_PATH: {
    	SPACE_TYPE_LIST: 'space_type/views/space_type_list.html',
    	SPACE_TYPE_CREATE: 'space_type/views/space_type_create.html',
    	SPACE_TYPE_UPDATE: 'space_type/views/space_type_edit.html',
    	SPACE_TYPE_DELETE: 'space_type/views/space_type_delete.html'
    },

    STATE: {
    	SPACE_TYPE_LIST: 'space type',
    	SPACE_TYPE_CREATE: 'space type create',
    	SPACE_TYPE_UPDATE: 'space type update',
    	SPACE_TYPE_DELETE: 'space type delete'
    }
});