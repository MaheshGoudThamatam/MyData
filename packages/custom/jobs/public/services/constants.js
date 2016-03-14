angular.module('mean.jobs').constant('JOBS', {
    URL_PATH: {
        JOB: "/admin",
        JOBS_LIST: '/jobs',
        JOBS_DETAIL: '/job/:jobId/details',
        SITE_LIST: '/site',
        SITE_CREATE: '/site/create',
        SITE_EDIT: '/site/:siteId/edit',
        SITE_DETAILS: '/site/:siteId/details'
    },
    FILE_PATH: {
        JOB: 'system/views/admin_layout.html',
        JOBS_LIST: 'jobs/views/jobstab.html',
        JOBS_DETAIL: 'jobs/views/jobdetail.html',
        SITE_LIST: 'jobs/views/site_list.html',
        SITE_CREATE: 'jobs/views/site_create.html',
        SITE_EDIT: 'jobs/views/site_edit.html',
        SITE_DETAILS: 'jobs/views/site_details.html'
    },
    STATE: {
        JOB: 'job',
        JOBS_LIST: 'job.list',
        JOBS_DETAIL: 'job.detailed',
        SITE_LIST: 'job.site_list',
        SITE_CREATE: 'job.site_create',
        SITE_EDIT: 'job.site_edit',
        SITE_DETAILS: 'job.site_details'
    }
});


  