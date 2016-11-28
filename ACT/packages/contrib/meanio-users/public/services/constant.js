angular.module('mean.users').constant('USERS', {
    URL_PATH: {
        USER_CREATE: '/users/create',
        USER_LIST: '/users',
        USER_EDIT: '/users/:userId/edit',
        ROLE_CREATE: '/roles/create',
        ROLE_LIST: '/roles',
        ROLE_EDIT: '/roles/:roleId/edit',
        USER_BULKUPLOAD: '/users/result/bulkupload',
        USER_BULKFILE: '/users/upload/bulkupload',
        USER_PROFILE: '/profile',
        USER_PROFILE_MANAGE: '/profile/manage',
        USER_PROFILE_HELP: '/profile/help'
    },
    FILE_PATH: {
        USER_CREATE: 'users/views/user_create.html',
        USER_LIST: 'users/views/user_list.html',
        USER_EDIT: 'users/views/user_edit.html',
        ROLE_CREATE: 'users/views/role_create.html',
        ROLE_LIST: 'users/views/role_list.html',
        ROLE_EDIT: 'users/views/role_edit.html',
        USER_BULKUPLOAD: '/users/views/bulkUploadResult.html',
        USER_BULKFILE: '/users/views/bulkUpload.html',
        USER_PROFILE: '/users/views/profile_timeline.html',
        USER_PROFILE_MANAGE: '/users/views/profile_manage.html',
        USER_PROFILE_HELP: '/users/views/profile_help.html'
    },
    STATE: {
        USER_CREATE: 'User_create user',
        USER_LIST: 'User_all users',
        USER_EDIT: 'User_edit user',
        ROLE_CREATE: 'Role_create role',
        ROLE_LIST: 'Role_all roles',
        ROLE_EDIT: 'Role_edit role',
        USER_BULKUPLOAD: 'User_BulkuploadResult users',
        USER_BULKFILE: ' User_UploadFile users',
        USER_PROFILE: 'Profile_notifications',
        USER_PROFILE_MANAGE: 'Profile_manage',
        USER_PROFILE_HELP: 'Profile_help'
    }   
});