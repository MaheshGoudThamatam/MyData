angular.module('mean.risks').constant('RISK', {
    PATH: {
        LIST_RISK: '/risks',
        CREATE_RISK: '/risks/create',
        EDIT_RISK: '/risks/:riskId/edit'
    },
    FILE_PATH: {
        LIST_RISK: 'risks/views/risk_list.html',
        CREATE_RISK: 'risks/views/risk_create.html',
        EDIT_RISK: 'risks/views/risk_edit.html'
    },
    
    STATE: {
        LIST_RISK: 'Risk_all risks',
        CREATE_RISK: 'Risk_risk create',
        EDIT_RISK: 'Risk_risk edit'
    }
});


  