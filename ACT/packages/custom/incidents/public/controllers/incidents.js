/*
 * <Author:Christopher Fernandes>
 * <Date:27-07-2016>
 */
(function() {
    'use strict';
    angular.module('mean.incidents').controller('incidentController', incidentController);
    incidentController.$inject = ['$scope', 'Global', '$stateParams', 'utilityService', '$location', '$http', 'Upload', 'IncidentsService', 'INCIDENT', 'NgTableParams'];

    function incidentController($scope, Global, $stateParams, utilityService, $location, $http, Upload, IncidentsService, INCIDENT, NgTableParams) {
        $scope.descriptionPage = false;
        $scope.selectedIncident = '';
        /*to hide starting incident cards page and show create page*/
        $scope.showDescPage = function(incidentSelected) {
                $scope.incidentObj = {};
                $scope.incidentObj.name = "";
                $scope.incidentObj.description = "";
                $scope.incidentObj.location = "";
                $scope.incidentObj.company = "";
                $scope.incidentObj.name = 'incident-' + incidentSelected.incidenttype;
                $scope.incidentObj.incidenttype =  incidentSelected._id;
                $scope.descriptionPage = true;
                $scope.selectedIncident = incidentSelected.incidenttype;
            }
            /*to hide create div and to show starting incident cards page*/
        $scope.cancelDescPage = function() {
                $scope.descriptionPage = false;
                $scope.incidentPhotoUploaded = undefined;
            }
            /*api call on submit*/
        $scope.submitDescription = function(isValid, company) {
                if (!isValid) {
                    $scope.submitted = true;
                } else {
                    $scope.descriptionPage = false;
                    $scope.incidentObj.companyId = company;
                    $scope.incidentObj.company = company;
                    var incident = new IncidentsService.incidents($scope.incidentObj);
                    incident.$save(function(response) {
                    	$scope.saved = true;
                        $scope.incidentPhotoUploaded = undefined;
                        $location.path(INCIDENT.PATH.INCIDENT_LIST);
                        utilityService.flash.success("Incident Created Successfully");
                    }, function(error) {
                        $scope.error = error;
                    });
                }
            }
            /*to redirect to root*/
        $scope.cancelIncident = function() {
                $location.path('/');
            }
            /*to redirect to root*/
        $scope.getCompanyDetails = function() {
            $http({
                url: '/api/onUserLogged/company/',
                method: 'GET',
            }).success(function(response) {
                $scope.company = response;
                $scope.url = location.host + '/report-incident/' + response.token;
                $scope.getIncidents($scope.company);
            });
        }; /*to redirect to root*/
        $scope.getTokenURL = function(tokenId) {
            utilityService.genericConfirm('Reset Url?', 'This action will replace the existing url with new one. This action cannot be undone are you sure to proceed?', function() {
                $http({
                    url: '/api/company/' + tokenId + '/updateToken',
                    method: 'GET',
                }).success(function(response) {
                    $scope.company = response;
                    $scope.getCompanybuildings($scope.company);
                    $scope.url = location.host + '/report-incident/' + response.token;
                    utilityService.flash.success('Url reset has been done successfully');
                });
            });
        };
        $scope.loadCompanyonToken = function() {
            $http({
                url: '/api/company/' + $stateParams.tokenId + '/loadCompany',
                method: 'GET',
            }).success(function(response) {
                if ($stateParams.tokenId == response.token) {
                    $scope.company = response;
                    $scope.getCompanybuildings($scope.company);
                } else {
                    $location.path('/404');
                    utilityService.flash.error(' This url is expired ');
                }
            }).error(function(err) {
                $location.path('/404');
                utilityService.flash.error(' This url is expired ');
            });
        };
        $scope.addIncidentPhoto = function(file) {
            $scope.loadCompanyonToken();
            if (file) {
                if (file.name.split('.').pop() !== 'jpeg' && file.name.split('.').pop() !== 'jpg') {
                    utilityService.flash.error('Only jpg/jpeg are accepted.');
                    return;
                } else {
                    $scope.upload = Upload.upload({
                        url: "/api/incidentphoto/upload?companyName=" + $scope.company.company_name,
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.incidentObj.photo = data;
                        $scope.incidentPhotoUploaded = data.split('\\').pop().split('/').pop();
                        utilityService.flash.success('Uploaded successfully');
                    }).error(function(err) {
                        $scope.incidentphoto = err;
                    });
                }
            }
        };
        $scope.getCompanybuildings = function(company) {
            $http({
                url: '/api/incidents/companyBuildings/' + company._id,
                method: 'GET',
            }).success(function(response) {
                $scope.companyLocaitons = response;
            });
        };
        $scope.userlocationBuilding = function(locationId, company) {
            $http({
                url: '/api/buildings/location/' + company + '/?locationId=' + locationId,
                method: 'GET',
            }).success(function(buildings) {
                $scope.buildings = buildings;
            });
        };
        $scope.getIncidents = function(company) {
            IncidentsService.incidents.query({
                companyId: company._id
            }, function(incidents) {
                $scope.incidents = incidents;
                for (var i = 0; i < $scope.incidents.length; i++) {
                    if($scope.incidents[i].photo){
                        $scope.incidents[i].photocompletepath = $scope.incidents[i].photo;
                        $scope.incidents[i].photo = $scope.incidents[i].photo.split('\\').pop().split('/').pop();
                    }    
                }
                $scope.listincidents = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.incidents
                });
            })
        };

        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('incidents', function(array) {
            if(angular.isDefined(array)) {
                if(angular.isDefined($scope.listincidents)) {
                    $scope.listincidents.settings(utilityService.ngTableCounts(array));
                }
            }
        });

        $scope.$watch('tableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.listincidents)) {
                    $scope.listincidents.settings().dataset = $scope.incidents.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.firstname + item.description + item.securitytask.task_name + item.createdAt;
                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.listincidents.reload();
                }
            }
        });
        $scope.getIncidentTypes = function(){
            $http({
                url: '/api/incidenttype',
                method: 'GET',
            }).success(function(incidenttypes) {
                $scope.incidenttypes = incidenttypes;
                });
        }
        $scope.downloadAttachedIncident = function(downloadpath) {
            $http({
                url: '/api/fileDownload?filename=' + downloadpath,
                method: 'GET',
                responseType: 'arraybuffer'
            }).success(function(response, status, headers, config) {
                var fileName = headers('content-disposition').split('=').pop();
                var contenttype = headers('content-type');
                var blob = new Blob([response], {
                    type: contenttype
                });
                saveAs(blob, fileName);
            });
        };
        
        $scope.removeIncidentPhoto = function(){
        	$scope.incidentPhotoUploaded = undefined;
        }
   }
})();
