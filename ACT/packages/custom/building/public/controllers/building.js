/*
 * <Author:Christopher Fernandes>
 * <Date:30-06-2016>
 */

(function() {
    'use strict';
    angular.module('mean.building').controller('BuildingController', BuildingController);
    BuildingController.$inject = ['$scope', 'Global', '$stateParams', 'BuildingService', 'NgMap', 'utilityService', 'NgTableParams', 'SITE', '$location', 'ASSETS', 'LOCATION', '$window'];

    function BuildingController($scope, Global, $stateParams, BuildingService, NgMap, utilityService, NgTableParams, SITE, $location, ASSETS, LOCATION, $window) {
        $scope.global = Global;
        $scope.package = {
            name: 'building'
        };
        $scope.mapError = false;
        $scope.dragMarker = true;
        $scope.zoomLevel = 1;

        $scope.create = function(isValid) {
            if (isValid) {
                NgMap.getMap().then(function(map) {
                    $scope.building.loc = [];
                    if ($scope.lat && $scope.lng) {
                        $scope.building.loc.push($scope.lat);
                        $scope.building.loc.push($scope.lng);
                    } else {
                        $scope.building.loc.push(map.markers[0].position.lat());
                        $scope.building.loc.push(map.markers[0].position.lng());
                    }
                    var building = new BuildingService.building($scope.building);
                    building.$save(function(response) {
                    	$scope.saved = true;
                        $location.path(SITE.PATH.BUILDING_LIST)
                        $scope.zoomLevel = 1;
                        utilityService.flash.success("Building Created Successfully");
                    }, function(error) {
                        $scope.error = error;
                    });
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }

        }

        $scope.update = function(isValid) {
            if (isValid) {
                NgMap.getMap().then(function(map) {
                    $scope.building.loc = [];
                    if ($scope.lat && $scope.lng) {
                        $scope.building.loc.push($scope.lat);
                        $scope.building.loc.push($scope.lng);
                    } else {
                        $scope.building.loc.push(map.markers[0].position.lat());
                        $scope.building.loc.push(map.markers[0].position.lng());
                    }
                    var building = $scope.building;
                    if (!building.updatedAt) {
                        building.updatedAt = [];
                    }
                    building.updatedAt = new Date();
                    building.$update({
                        companyId: $stateParams.buildingId
                    }, function() {
                        $scope.zoomLevel = 1;
                        $scope.saved = true;
                        utilityService.flash.success("Buidling Updated Successfully");
                        $location.path(SITE.PATH.BUILDING_LIST)
                    }, function(error) {
                        $scope.error = error;
                    });
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }
        }

        $scope.findOne = function() {
            BuildingService.building.get({
                buildingId: $stateParams.buildingId
            }, function(building) {
                $scope.building = building;
                $scope.zoomLevel = 15;
                $scope.address = $scope.building.loc[0] + ',' + $scope.building.loc[1];
            })
        }

        //Check if all address fiels is added and call the function to add marker in map
        $scope.fetchMap = function(building) {
            var address = undefined;
            $scope.mapError = true;
            if (building.address_line_1) {
                if (building.city) {
                        if (building.country) {
                            $scope.building = building;
                            $scope.zoomLevel = 15;
                            $scope.mapError = false;
                            address = {
                                addressLine1: building.address_line_1,
                                city: building.city,
                                country: building.country
                            }
                        }
                }
            }
            $scope.addAddress(address)
        }

        //Fetch position on Changing marker position
        $scope.dragFn = function() {
            $scope.lat = this.position.lat();
            $scope.lng = this.position.lng();
        }

        //Add marker on map if address is added
        $scope.addAddress = function(address) {
            if (!angular.isUndefined(address)) {
                $scope.address = address.addressLine1 + ' ' + address.city + ' ' + address.country
            } else {
                $scope.address = undefined;
            }
        }

        /**
         * fetch all building lists
         */
        $scope.findAll = function() {
            BuildingService.building.query({}, function(buildings) {
                $scope.buildingArray = buildings;
                $scope.initializeNgTable(buildings);
            })
        };

        /**
         * initialize ng tables
         * @params {buildings},  Array contain all building object
         */
        $scope.initializeNgTable = function(buildings) {
            $scope.buildingTable = new NgTableParams(utilityService.ngTableOptions(), {
                dataset: buildings
            });
        };

        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('buildingArray', function(array) {
            if(angular.isDefined(array)) {
                if(angular.isDefined($scope.buildingTable)) {
                    $scope.buildingTable.settings(utilityService.ngTableCounts(array));
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
                if (angular.isDefined($scope.buildingTable)) {
                    $scope.buildingTable.settings().dataset = $scope.buildingArray.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.building_name + item.city  + item.country + item.contact_number;

                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.buildingTable.reload();
                }
            }
        });

        /**
         * redirect to add building page
         */
        $scope.addBuilding = function() {
            $location.path(SITE.PATH.BUILDING_ADD);
        };

        /**
         * redirect to buiding list page
         */
        $scope.cancel = function() {
            $location.path(SITE.PATH.BUILDING_LIST)
        };

        /**
         * redirect to edit buiding page
         * @params {buidingId} buiding id to assign to url params
         */
        $scope.editBuilding = function(building) {
            var urlPath = SITE.PATH.BUILDING_EDIT;
            urlPath = urlPath.replace(":buildingId", building._id);
            $location.path(urlPath);
        };

        /**
         * Hard Delete building function
         * @params {Building} Contain building object
         */
        $scope.deleteBuilding = function(Building) {
            if (Building) {
                var title = "Are you sure?";
                var body = "<div class='text-danger'>All the Camera System, Burglar Alarm, Access Control & Guarding associated with this building will be permanently deleted.</div>";
                utilityService.genericConfirm(title, body, function(response) {
                    var message = "";
                        message = "Building Deleted Successfully";
                        var building = new BuildingService.building(Building);
                        building.$remove(function(response) {
                            for (var i = 0; i < $scope.buildingTable.settings().dataset.length; i++) {
                                if (Building == $scope.buildingTable.settings().dataset[i]) {
                                    $scope.buildingTable.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.buildingArray.length; i++) {
                                if (Building == $scope.buildingArray[i]) {
                                    $scope.buildingArray.splice(i, 1);
                                }
                            }
                            $scope.buildingTable.reload().then(function(data) {
                                if (data.length === 0 && $scope.buildingTable.total() > 0) {
                                    $scope.buildingTable.page($scope.buildingTable.page() - 1);
                                    $scope.buildingTable.reload();
                                }
                            });
                            utilityService.flash.success(message);
                        })
                });
            }
        };

        /**
         * Soft delete building
         * @params {building} contain building object
         */
        $scope.softDelete = function(building) {
            utilityService.delConfirm(function(result) {
                var message = "Cancel";
                if (result) {
                    var buildingObj = building;
                    if (!buildingObj.updatedAt) {
                        buildingObj.updatedAt = "";
                    }
                    if (buildingObj.active == true) {
                        buildingObj.active = false;
                        message = "Company Deactivated Successfully";
                    } else
                    if (buildingObj.active == false) {
                        buildingObj.active = true;
                        message = "Company Activated Successfully";
                    }
                    buildingObj.updatedAt = new Date();
                    buildingObj.$update({
                        buildingId: building._id
                    }, function() {
                        utilityService.flash.success(message);
                    }, function(error) {
                        $scope.error = error
                    })
                }
            })
        };

        /*
         * Redirect to assets page from building list
         */
        $scope.manageAssets = function(building) {
            var urlPath = ASSETS.PATH.CAMERA_LIST;
            urlPath = urlPath.replace(":buildingId", building._id);
            $location.path(urlPath);
        };

        /*
         *  Fetch location & if location is not available popup will appear and redirect to create location page
         */
        $scope.locationFilter = function(){
            BuildingService.locationFilter.query({}, function(locations){
                if (locations.length) {
                    $scope.locations = locations;
                } else {
                    var title = "No location Found.";
                    var message = "Please add location first, do you want to create location?";
                    $location.path(SITE.PATH.BUILDING_LIST);
                    utilityService.genericConfirm(title, message, function() {
                        //TODO: this will completely reload the window & need to find a better solution later
                        $window.location.href = LOCATION.URL_PATH.LOCATIONCREATE;
                    });
                }
            })
        };
    }

})();