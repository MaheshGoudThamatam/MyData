angular.module('mean.onlinetest').constant('ONLINETEST',{
    URL_PATH:{
        ONLINE_TEST: '/admin',
        LIST_ONLINE_TEST : '/onlinetest',
        CREATE_ONLINE_TEST : '/onlinetest/create',
        EDIT_ONLINE_TEST : '/onlinetest/:onlinetestId/edit',
        VIEW_ONLINE_TEST : '/onlinetest/:onlinetestId/view',
        DELETE_ONLINE_TEST : '/onlinetest/delete_online_test'
    },
    FILE_PATH: {
        ONLINE_TEST: 'system/views/admin_layout.html',
        LIST_ONLINE_TEST : 'onlinetest/views/onlinetest_list.html',
        CREATE_ONLINE_TEST : 'onlinetest/views/onlinetest_create.html',
        EDIT_ONLINE_TEST : 'onlinetest/views/onlinetest_edit.html',
        VIEW_ONLINE_TEST : 'onlinetest/views/onlinetest_view.html',
        DELETE_ONLINE_TEST : 'onlinetest/views/delete_online_test.html'
    },
    STATE: {
        ONLINE_TEST: 'onlinetest',
        LIST_ONLINE_TEST : 'onlinetest.list',
        CREATE_ONLINE_TEST : 'onlinetest.create',
        EDIT_ONLINE_TEST : 'onlinetest.edit',
        VIEW_ONLINE_TEST : 'onlinetest.view',
        DELETE_ONLINE_TEST : 'onlinetest.delete'
    }
});


  