/*
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <functions: nextPage, previousPage, fetchMap, create, update, dragFn, addAddress, initialize map, findOne, loadSecurityManager,
 *   findAll, initializeNgTable, addCompany, Cancel, editCompany, deleteCompany, softDelete>
 */

(function() {
    'use strict';

    /* jshint -W098 */
    angular.module('mean.company').controller('CompanyController', CompanyController);
    CompanyController.$inject = ['$scope', 'Global', '$stateParams', 'CompanyService', 'NgMap', 'utilityService', 'NgTableParams', 'COMPANY', '$location'];

    function CompanyController($scope, Global, $stateParams, CompanyService, NgMap, utilityService, NgTableParams, COMPANY, $location) {
        $scope.page1 = true;
        $scope.global = Global;
        $scope.package = {
            name: 'company'
        };
        $scope.mapError = false;
        $scope.dragMarker = true;
        $scope.zoomLevel = 1;

        /**
         * Function to switch to next page on company creation or update
         * @params {isValid} check if form is valid or not(frontend validations)
         * @params {company} company details which is already filled in form to assign to scope variable 
         */
        $scope.nextPage = function(isValid, company) {
            if (isValid) {
                if (company) {
                    $scope.company = company
                }
                $scope.dragMarker = false;
                $scope.page1 = false;
                $scope.page2 = true;
                $('.companyBar').addClass('done');
                $('.companyBar').removeClass('active');
                $('.companyBar').removeClass('error');
                $('.managerBar').addClass('active');
            } else {
                $('.companyBar').addClass('error');
                $scope.submitted = true;
            }
        }

        /**
         * Function to switch to previous page on company creation or update
         * @params {company} company details which is already filled in form to assign to scope variable 
         */
        $scope.previousPage = function(company) {
            $('.companyBar').removeClass('done');
            $('.companyBar').addClass('active');
            $('.managerBar').removeClass('active');
            $scope.dragMarker = true;
            if (company) {
                $scope.company = company;
            }
            $scope.page1 = true;
            $scope.page2 = false;
        }

        /**
         * Check if all address fields is added and call a function to add marker in map
         * @params {company} company details which is already filled in form to fetch address for map
         */
        $scope.fetchMap = function(company) {
            var address = undefined;
            $scope.mapError = true;
            if (company.address_line_1) {
                if (company.city) {
                        if (company.country) {
                            $scope.company = company
                            $scope.zoomLevel = 15;
                            $scope.mapError = false;
                            address = {
                                addressLine1: company.address_line_1,
                                city: company.city,
                                country: company.country
                            }
                        }
                }
            }
            $scope.addAddress(address)
        }

        /**
         * Create function for company
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.create = function(isValid) {
            if (isValid) {
                NgMap.getMap().then(function(map) {
                    $scope.company.loc = [];
                    if ($scope.lat && $scope.lng) {
                        $scope.company.loc.push($scope.lat);
                        $scope.company.loc.push($scope.lng);
                    } else {
                        $scope.company.loc.push(map.markers[0].position.lat());
                        $scope.company.loc.push(map.markers[0].position.lng());
                    }
                    var company = new CompanyService.company($scope.company);
                    company.$save(function(response) {
                    	$scope.saved = true;
                        $location.path(COMPANY.PATH.COMPANY_LIST)
                        $scope.zoomLevel = 1;
                        utilityService.flash.success("Company Created Successfully");
                    }, function(error) {
                        $scope.error = error;
                        var counter = true;
                        for (var i=0;i<error.data.length;i++){
                            if (error.data[i].param == 'company_name' || error.data[i].param == 'address_line_1' || error.data[i].param == 'city'  || error.data[i].param == 'country' || error.data[i].param == 'zipcode' || error.data[i].param == 'contact_number' || error.data[i].param == 'registration_number' || error.data[i].param == 'customer_reference') {
                                counter = false
                            } else {
                                counter = true;
                            }
                        }
                        if (!counter) {
                            $scope.previousPage();
                        }
                        $('.companyBar').addClass('error');
                    });
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submittedPage2 = true;
            }
        }

        /**
         * Update function for company
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.update = function(isValid) {
            if (isValid) {
                NgMap.getMap().then(function(map) {
                    $scope.company.loc = [];
                    if ($scope.lat && $scope.lng) {
                        $scope.company.loc.push($scope.lat);
                        $scope.company.loc.push($scope.lng);
                    } else {
                        $scope.company.loc.push(map.markers[0].position.lat());
                        $scope.company.loc.push(map.markers[0].position.lng());
                    }
                    var company = $scope.company;
                    if (!company.updatedAt) {
                        company.updatedAt = [];
                    }
                    company.updatedAt = new Date();
                    company.$update({
                        companyId: $stateParams.companyId
                    }, function() {
                        $scope.zoomLevel = 1;
                        $scope.saved = true;
                        utilityService.flash.success("Company Updated Successfully");
                        $location.path(COMPANY.PATH.COMPANY_LIST)
                    }, function(error) {
                        var counter = true;
                        for (var i=0;i<error.data.length;i++){
                            if (error.data[i].param == 'company_name' || error.data[i].param == 'address_line_1' || error.data[i].param == 'city'  || error.data[i].param == 'country' || error.data[i].param == 'zipcode' || error.data[i].param == 'contact_number' || error.data[i].param == 'registration_number' || error.data[i].param == 'customer_reference') {
                                counter = false
                            } else {
                                counter = true;
                            }
                        }
                        if (!counter) {
                            $scope.page1 = true;
                            $scope.page2 = false;
                        }
                        $scope.error = error;
                    });
                });
            } else {
                $scope.submittedPage2 = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        }

        /**
         * Fetch position on Changing marker position
         */
        $scope.dragFn = function() {
            $scope.lat = this.position.lat();
            $scope.lng = this.position.lng();
        }

        /**
         * Add marker on map if address is added
         * @params {address} address of company based on which marker is added in map
         */
        $scope.addAddress = function(address) {
            if (!angular.isUndefined(address)) {
                $scope.address = address.addressLine1 + ' ' + address.city +  ' ' + address.country
            } else {
                $scope.address = undefined;
            }
        }

        /**
         * Initialize the map
         * @params {event} event details
         * @params {map} map details
         */
        $scope.$on('mapInitialized', function(event, map) {

        });

        /**
         * fetch company object details
         */
        $scope.findOne = function() {
            CompanyService.company.get({
                companyId: $stateParams.companyId
            }, function(company) {
                $scope.company = company;
                $scope.zoomLevel = 15;
                $scope.address = $scope.company.loc[0] + ',' + $scope.company.loc[1]
                $scope.loadSecurityManager();
            });
        };

        /**
         * fetch all security manager of company
         */
        $scope.loadSecurityManager = function() {
            CompanyService.manager.query({companyId:$stateParams.companyId}, function(managers) {
                $scope.managers = managers;
                $scope.company.managers = [];
                $scope.company.managers = $scope.managers
            });
        };

        /**
         * fetch all company lists
         */
        $scope.findAll = function() {
            CompanyService.company.query({}, function(companies) {
                $scope.companyArray = companies;
                $scope.initializeNgTable(companies);
            })
        };

        /**
         * initialize ng tables
         * @params {companies},  Array contain all company object
         */
        $scope.initializeNgTable = function(companies) {
            $scope.companyTable = new NgTableParams(utilityService.ngTableOptions(), {
                dataset: companies
            });
        };

        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('companyArray', function(array) {
            if(angular.isDefined(array)) {
                if(angular.isDefined($scope.companyTable)) {
                    $scope.companyTable.settings(utilityService.ngTableCounts(array));
                }
            }
        });

        /**
         * $watch for the <input> element for table global filter.
         * 'tableFilter' is the ng-model of the <input> element (see .html)
         * Whenever the value changes, the table data is filtered and the table is reloaded. 
         * 
         * Note: This will not work for tables with server-side pagination. Filtering will also have to be done server-side.
         */
        $scope.$watch('tableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.companyTable)) {
                    $scope.companyTable.settings().dataset = $scope.companyArray.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.company_name + item.city  + item.country + item.contact_number;

                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.companyTable.reload();
                }
            }
        });

        /**
         * redirect to add company page
         */
        $scope.addCompany = function() {
            $location.path(COMPANY.PATH.COMPANY_ADD);
        };

        /**
         * redirect to company list page
         */
        $scope.cancel = function() {
            $location.path(COMPANY.PATH.COMPANY_LIST)
        };

        /**
         * redirect to edit company page
         * @params {companyId} Company id to assign to url params
         */
        $scope.editCompany = function(company) {
            var urlPath = COMPANY.PATH.COMPANY_EDIT;
            urlPath = urlPath.replace(":companyId", company._id);
            $location.path(urlPath);
        };

        /**
         * Hard Delete company function
         * @params {Company} Contain company object
         */
        $scope.deleteCompany = function(Company) {
            if (Company) {
                utilityService.delCompanyConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "Company Deleted Successfully";
                        var company = new CompanyService.company(Company);
                        company.$remove(function(response) {
                            for (var i = 0; i < $scope.companyTable.settings().dataset.length; i++) {
                                if (Company == $scope.companyTable.settings().dataset[i]) {
                                    $scope.companyTable.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.companyArray.length; i++) {
                                if (Company == $scope.companyArray[i]) {
                                    $scope.companyArray.splice(i, 1);
                                }
                            }
                            $scope.companyTable.reload().then(function(data) {
                                if (data.length === 0 && $scope.companyTable.total() > 0) {
                                    $scope.companyTable.page($scope.companyTable.page() - 1);
                                    $scope.companyTable.reload();
                                }
                            });
                            utilityService.flash.success(message);
                        })
                    }
                });
            }
        };

        /**
         * Soft delete company
         * @params {company} contain company object
         */
        $scope.softDelete = function(company) {
            utilityService.delConfirm(function(result) {
                var message = "Cancel";
                if (result) {
                    var companyObj = company;
                    if (!companyObj.updatedAt) {
                        companyObj.updatedAt = "";
                    }
                    if (companyObj.active == true) {
                        companyObj.active = false;
                        message = "Company Deactivated Successfully";
                    } else
                    if (companyObj.active == false) {
                        companyObj.active = true;
                        message = "Company Activated Successfully";
                    }
                    companyObj.updatedAt = new Date();
                    companyObj.$update({
                        companyId: company._id
                    }, function() {
                        utilityService.flash.success(message);
                    }, function(error) {
                        $scope.error = error
                    })
                }
            })
        };
    }

})();