'use strict';
angular.module('mean.investor').factory('RiskFactorService', function($resource) {
    return {
        name: 'riskfactor',
        page: $resource('/api/riskfactor/policy/pagination', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: false
            }
        }),
        crud: $resource('/api/riskfactor/policy/:riskfactorId', {
            riskfactorId: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        technologyriskfactor: $resource('/api/technologyriskfactor/policy',{

        },{
        query:{
            method: 'GET',
            isArray: true
            }
        })
    };
});