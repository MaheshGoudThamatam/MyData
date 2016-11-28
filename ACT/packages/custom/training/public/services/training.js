(function() {
    'use strict';
    angular.module('mean.training').factory('TrainingService', TrainingService);
    TrainingService.$inject = ['$http', '$q', '$resource'];

    function TrainingService($http, $q, $resource) {
        return {
            training: $resource('/api/training/:trainingId', {
                trainingId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            users: $resource('/api/fetchCompanyUser',{},{
               update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
 
            })
        };
    }

})();
