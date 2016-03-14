angular.module('mean.jobsites').constant('JOBSSITES', {
    URL_PATH: {
        JOBSITES: '/admin',
        JOBSITES_LIST: '/jobsites',
        JOBSITES_CREATE: '/jobsites/create',
        JOBSITES_EDIT: '/jobsites/:jobSitesId/edit'
    },
    FILE_PATH: {
        JOBSITES: 'system/views/admin_layout.html',
        JOBSITES_LIST: 'jobsites/views/admin_jobsites_list.html',
        JOBSITES_CREATE: 'jobsites/views/admin_jobsites_create.html',
        JOBSITES_EDIT: 'jobsites/views/admin_jobsites_edit.html'
    },
    STATE: {
        JOBSITES: 'jobsite',
        JOBSITES_LIST: 'jobsite.list',
        JOBSITES_CREATE: 'jobsite.create',
        JOBSITES_EDIT: 'jobsite.edit'
    }
});


  