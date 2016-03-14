angular.module('mean.role').constant('ROLE', {
    URL_PATH: {
        ROLE: '/admin',
        LIST_ROLE: '/role',
        CREATE_ROLE: '/role/create',
        EDIT_ROLE: '/role/:roleId/edit',
        SHOW_ROLE: '/role/:roleId/view',
        ROLE_PERMISSION: '/role/role-permission-allocation',

        LIST_FEATURE_ROLE: '/featurerole',
        CREATE_FEATURE_ROLE: '/featurerole/create',
        EDIT_FEATURE_ROLE: '/featurerole/:roleId/edit',
        SHOW_FEATURE_ROLE: '/featurerole/:featureroleId/view',

        LIST_FEATURE: '/feature',
        CREATE_FEATURE: '/feature/create',
        EDIT_FEATURE: '/feature/:featureId/edit',
        SHOW_FEATURE: '/feature/:featureId/view',

        FEATURE_CATEGORY_LIST: '/featurecategory',
        FEATURE_CATEGORY_CREATE: '/featurecategory/create',
        FEATURE_CATEGORY_EDIT: '/featurecategory/:featureCategoryId/edit',
        FEATURE_CATEGORY_DETAILS: '/featurecategory/:featureCategoryId/details',

        ADMIN_LIST: '/user/admin-list'
    },
    FILE_PATH: {
        ROLE: 'system/views/admin_layout.html',
        LIST_ROLE: 'role/views/role_list.html',
        CREATE_ROLE: 'role/views/role_create.html',
        EDIT_ROLE: 'role/views/role_edit.html',
        SHOW_ROLE: 'role/views/role_view.html',
        ROLE_PERMISSION: 'role/views/role_permission_allocation.html',

        LIST_FEATURE_ROLE: 'role/views/featurerole_list.html',
        CREATE_FEATURE_ROLE: 'featurerole/views/featurerole_create.html',
        EDIT_FEATURE_ROLE: 'featurerole/views/featurerole_edit.html',
        SHOW_FEATURE_ROLE: 'featurerole/views/featurerole_view.html',

        LIST_FEATURE: 'role/views/feature_list.html',
        CREATE_FEATURE: 'role/views/feature_create.html',
        EDIT_FEATURE: 'role/views/feature_edit.html',
        SHOW_FEATURE: 'role/views/feature_view.html',

        FEATURE_CATEGORY_LIST: 'role/views/featurecategory_list.html',
        FEATURE_CATEGORY_CREATE: 'role/views/featurecategory_create.html',
        FEATURE_CATEGORY_EDIT: 'role/views/featurecategory_edit.html',
        FEATURE_CATEGORY_DETAILS: 'role/views/featurecategory_details.html',

        ADMIN_LIST: '/role/views/admin_list.html'
    },
    STATE: {
        ROLE: 'role',
        LIST_ROLE: 'role.list',
        CREATE_ROLE: 'role.create',
        EDIT_ROLE: 'role.edit',
        SHOW_ROLE: 'role.show',
        ROLE_PERMISSION: 'role.permission',

        LIST_FEATURE_ROLE: 'role.featurerole_list',
        CREATE_FEATURE_ROLE: 'role.featurerole_create',
        EDIT_FEATURE_ROLE: 'role.featurerole_edit',
        SHOW_FEATURE_ROLE: 'role.featurerole_show',

        LIST_FEATURE: 'role.feature_list',
        CREATE_FEATURE: 'role.feature_create',
        EDIT_FEATURE: 'role.feature_edit',
        SHOW_FEATURE: 'role.feature_show',

        FEATURE_CATEGORY_LIST: 'role.featurecategory list',
        FEATURE_CATEGORY_CREATE: 'role.featurecategory create',
        FEATURE_CATEGORY_EDIT: 'role.featurecategory edit',
        FEATURE_CATEGORY_DETAILS: 'role.featurecategory details',

        ADMIN_LIST: 'role.admin_list'
    }
});


  