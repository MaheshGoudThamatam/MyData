angular.module('mean.investor').constant('INVESTOR', {
    URL_PATH: {
        RISKFACTORCREATE: '/riskfactor/create',
        RISKFACTORLIST: '/riskfactors',
        RISKFACTOREDIT: '/riskfactor/:riskfactorId/edit',
        RISKFACTORVIEW: '/riskfactor/:riskfactorId/view',

        POLICYLIST: '/policies',
         POLICYCREATE: '/policy/create',
        POLICYLISTEDIT: '/policy/:policyId/edit',
        POLICYLISTVIEW: '/policy/:policyId/view',

        POLICYASSIGNMENT: '/investor/policy/:userId/assignment',
        INVESTORDETAILS: '/investor/details',
    },
    FILE_PATH: {
        RISKFACTORCREATE: 'investor/views/riskfactor_create.html',
        RISKFACTORLIST: 'investor/views/riskfactor_list.html',
        RISKFACTOREDIT: 'investor/views/riskfactor_edit.html',
        RISKFACTORVIEW: 'investor/views/riskfactor_view.html',

        POLICYCREATE: 'investor/views/policy_create.html',
        POLICYLIST: 'investor/views/policy_list.html',
        POLICYEDIT: 'investor/views/policy_edit.html',
        POLICYVIEW: 'investor/views/policy_view.html',

        POLICYASSIGNMENT: 'investor/views/policyAssignment.html',
        INVESTORDETAILS: 'investor/views/investorsList.html',
    },
    STATE: {
        RISKFACTORCREATE: 'riskfactor create',
        RISKFACTORLIST: 'riskfactor list',
        RISKFACTOREDIT: 'riskfactor edit',
        RISKFACTORVIEW: 'riskfactor view',

        POLICYCREATE: 'policy create',
        POLICYLIST: 'policy list',
        POLICYEDIT: 'policy edit',
        POLICYVIEW: 'policy view',

       
        POLICYASSIGNMENT: 'policy assignment',
        INVESTORDETAILS: 'investor details',
    }
});