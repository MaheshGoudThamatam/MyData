angular.module('mean.branch').constant('BRANCH', {
    URL_PATH: {
        BRANCH: "/admin",
        LIST_COUNTRY: '/country',
        CREATE_COUNTRY: '/country/create',
        EDIT_COUNTRY: '/country/:countryId/edit',
        SHOW_COUNTRY: '/country/:countryId/show',
        LIST_ZONE: '/country/:countryId/zone',
        CREATE_ZONE: '/country/:countryId/zone/create',
        EDIT_ZONE: '/zone/:zoneId/edit',
        LIST_CITY: '/zone/:zoneId/city',
        CREATE_CITY: '/zone/:zoneId/city/create',
        EDIT_CITY: '/city/:cityId/edit',
        LIST_BRANCH: '/city/:cityId/branch',
        CREATE_BRANCH: '/city/:cityId/branch/create',
        EDIT_BRANCH: '/branch/:branchId/edit'
    },
    FILE_PATH: {
        BRANCH: 'system/views/admin_layout.html',
        LIST_COUNTRY: 'branch/views/country_list.html',
        CREATE_COUNTRY: 'branch/views/country_create.html',
        EDIT_COUNTRY: 'branch/views/country_edit.html',
        SHOW_COUNTRY: '/admin/country/:countryId/show',
        LIST_ZONE: 'branch/views/zone_list.html',
        CREATE_ZONE: 'branch/views/zone_create.html',
        EDIT_ZONE: 'branch/views/zone_edit.html',
        LIST_CITY: 'branch/views/city_list.html',
        CREATE_CITY: 'branch/views/city_create.html',
        EDIT_CITY: 'branch/views/city_edit.html',
        LIST_BRANCH: 'branch/views/branch_list.html',
        CREATE_BRANCH: 'branch/views/branch_create.html',
        EDIT_BRANCH: 'branch/views/branch_edit.html'
    },
    STATE: {
        BRANCH: "branch",
        LIST_COUNTRY: 'branch.country_list',
        CREATE_COUNTRY: 'branch.country_create',
        EDIT_COUNTRY: 'branch.country_edit',
        SHOW_COUNTRY: 'branch.country_ show',
        LIST_ZONE: 'branch.zone_list',
        CREATE_ZONE: 'branch.zone_create',
        EDIT_ZONE: 'branch.zone_edit',
        LIST_CITY: 'branch.city_list',
        CREATE_CITY: 'branch.city_create',
        EDIT_CITY: 'branch.city_edit',
        LIST_BRANCH: 'branch.branch_list',
        CREATE_BRANCH: 'branch.branch_create',
        EDIT_BRANCH: 'branch.branch_edit'
    }
});


  