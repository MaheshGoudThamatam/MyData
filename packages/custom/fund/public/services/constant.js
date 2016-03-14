angular.module('mean.fund').constant('FUND', {
    URL_PATH: {
        FUND: '/admin',
        FUNDDISTRIBUTION_LIST: '/fund_distribution',

    },
    PATH: {
        FUNDDISTRIBUTION_LIST: '/admin/fund_distribution',

    },
    FILE_PATH: {
        FUND: 'system/views/admin_layout.html',
        FUNDDISTRIBUTION_LIST: 'fund/views/funddistribution.html',

    },
    STATE: {
        FUND: 'fund',
        FUNDDISTRIBUTION_LIST: 'fund.funddistributionlist',


    }
});