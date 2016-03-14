angular.module('mean.jobs').constant('SKILLSET', {
    URL_PATH: {
        SKILLSET: "/admin",
        SKILLSET_CREATE: '/skillset/create',
        SKILLSET_LIST: '/skillset/list',
        SKILLSET_EDIT: '/skillset/:skillsetId/edit',
        SKILLSET_DETAILS: '/skillset/:skillsetId/details'
    },
    FILE_PATH: {
        SKILLSET: 'system/views/admin_layout.html',
        SKILLSET_CREATE: 'jobs/views/skillsetcreate.html',
        SKILLSET_LIST: 'jobs/views/skillsetlist.html',
        SKILLSET_EDIT: 'jobs/views/skillsetedit.html',
        SKILLSET_DETAILS: 'jobs/views/skillset_details.html'
    },
    STATE: {
        SKILLSET: "skillset",
        SKILLSET_CREATE: 'skillset.create',
        SKILLSET_LIST: 'skillset.list',
        SKILLSET_EDIT: 'skillset.edit',
        SKILLSET_DETAILS: 'skillset.details'
    }
});

