/*
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <Services, Services for add, edit, read, company, Service for load all security managers>
 */

(function() {
    'use strict';
    angular.module('mean.company').factory('CompanyService', CompanyService);
    CompanyService.$inject = ['$http', '$q','$resource'];

    function CompanyService($http, $q, $resource) {
        return {
            company: $resource('/api/company/:companyId', {
                companyId: '@_id'
            }, {
                update : {
                    method : 'PUT'
                },
                query:{
                    method:'GET' , isArray: true
                }

            }),
            manager: $resource('/api/company/:companyId/companyManagers', {
                companyId: '@_id'
            }, {
                query:{
                    method:'GET' , isArray: true
                }

            })
        }
    }
})();
