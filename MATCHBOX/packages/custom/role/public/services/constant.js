angular.module('mean.role').constant('ROLE', {
    URL_PATH: {
        LIST_ROLE: '/admin/role',
        CREATE_ROLE: '/admin/role/create',
        EDIT_ROLE: '/admin/role/:roleId/edit',
        SHOW_ROLE: '/admin/role/:roleId/view',
        ROLE_PERMISSION: '/admin/role/role-permission-allocation',
    },
    
    FILE_PATH: {
        LIST_ROLE: 'role/views/role_list.html',
        CREATE_ROLE: 'role/views/role_create.html',
        EDIT_ROLE: 'role/views/role_edit.html',
        SHOW_ROLE: 'role/views/role_view.html',
        ROLE_PERMISSION: 'role/views/role_permission_allocation.html',
    },
    
    STATE: {
        LIST_ROLE: 'role list',
        CREATE_ROLE: 'role create',
        EDIT_ROLE: 'role edit',
        SHOW_ROLE: 'role show',
        ROLE_PERMISSION: 'role permission',
    }
});