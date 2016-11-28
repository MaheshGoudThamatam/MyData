(function() {
    'use strict';
    /* jshint -W098 */
    /** Name : Location Controller
     * @ <author> Abha Singh
     * @ <date> 28-jun-2016
     * @ METHODS: create, update, findOne, fetchMap, findAll, dragFn, addAddress, $on, remove, decativate, activate, cancelLocation, addLocation, editLocation
     */

    angular.module('mean.location').controller('LocationController', LocationController);
    LocationController.$inject = ['$scope', 'Global', 'LocationService', '$stateParams', '$location', 'LOCATION', 'NgMap', 'utilityService', 'NgTableParams'];

    function LocationController($scope, Global, LocationService, $stateParams, $location, LOCATION, NgMap, utilityService, NgTableParams) {
        $scope.global = Global;
        $scope.package = {
            name: 'location'
        };
        $scope.mapError = false;
        $scope.dragMarker = true;
        $scope.zoomLevel = 1;

        /**
         * Check if all address fiels is added and call the function to add marker in map
         * @params {location} location details which is already filled in form to fetch address for map
         */
        $scope.fetchMap = function(location) {
            var address = undefined;
            $scope.mapError = true;
            if (location.address_line_1) {
                if (location.city) {
                        if (location.country) {
                            $scope.zoomLevel = 15;
                            $scope.location = location
                            $scope.mapError = false;
                            address = {
                                addressLine1: location.address_line_1,
                                city: location.city,
                                country: location.country
                            }
                      }
                 }
            }
            $scope.addAddress(address)
        };

        /**
         * findAll locations
         * */
        $scope.findAll = function() {
            LocationService.location.query(function(locations) {
                $scope.locations = locations;
                $scope.locationTable = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.locations
                });
            });
        };

        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('locations', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.locationTable)) {
                    $scope.locationTable.settings(utilityService.ngTableCounts(array));
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
                if (angular.isDefined($scope.locationTable)) {
                    $scope.locationTable.settings().dataset = $scope.locations.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.name + item.city + item.country;

                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.locationTable.reload();
                }
            }
        });

        /**
         * create new location
         * @params {isValid}  check if form is valid or not(frontend validations)
         * */
        $scope.create = function(isValid) {
            if (isValid) {
                NgMap.getMap().then(function(map) {
                    $scope.location.loc = [];
                    if ($scope.lat && $scope.lng) {
                        $scope.location.loc.push($scope.lat);
                        $scope.location.loc.push($scope.lng);
                    } else {
                        $scope.location.loc.push(map.markers[0].position.lat());
                        $scope.location.loc.push(map.markers[0].position.lng());
                    }
                    var location = new LocationService.location($scope.location);
                    location.$save(function(response) {
                    	$scope.saved = true;
                        $scope.zoomLevel = 1;
                        $location.path(LOCATION.URL_PATH.LOCATIONLIST);
                        utilityService.flash.success('Location created successfully');
                        $scope.location = {};
                    }, function(error) {
                        $scope.error = error;
                    });
                });
            } else {
                $scope.submitted = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };

        /**
         * Fetch position on Changing marker position
         */
        $scope.dragFn = function() {
            $scope.lat = this.position.lat();
            $scope.lng = this.position.lng();
        };

        /**
         * Add marker on map if address is added
         *  @params {address} address of location based on which marker is added in map
         */
        $scope.addAddress = function(address) {
            if (!angular.isUndefined(address)) {
                $scope.address = address.addressLine1 + ' ' + address.city + ' '  + address.country
            } else {
                $scope.address = undefined;
            }
        };

        /**
         * Initialize map
         * */
        $scope.$on('mapInitialized', function(evt, map) {});

        /**
         * update particular location
         *  @params {isValid}  check if form is valid or not(frontend validations)
         * */
        $scope.update = function(isValid) {
            if (isValid) {
                NgMap.getMap().then(function(map) {
                    $scope.location.loc = [];
                    if ($scope.lat && $scope.lng) {
                        $scope.location.loc.push($scope.lat);
                        $scope.location.loc.push($scope.lng);
                    } else {
                        $scope.location.loc.push(map.markers[0].position.lat());
                        $scope.location.loc.push(map.markers[0].position.lng());
                    }
                    var location = $scope.location;
                    location.updatedAt = new Date();
                    location.$update({
                        locationId: $stateParams.locationId
                    }, function() {
                        $scope.zoomLevel = 1;
                        $scope.saved = true;
                        $location.path(LOCATION.URL_PATH.LOCATIONLIST);
                        utilityService.flash.success('Location updated successfully');
                    }, function(error) {
                        $scope.error = error;
                    });
                });
            } else {
                $scope.submitted = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };

        /**
         * Hard delete particular location
         * @params {Location} Contain location object
         * */
        $scope.remove = function(Location) {
            if (Location) {
                var title = "Are you sure?";
                var body = "<div class='text-danger'>All Buildings and Camera System, Burglar Alarm, Access Control, Guarding associated with that building will be permanently deleted.</div>";
                utilityService.genericConfirm(title, body, function(response) {
                    var message = "";
                    if (response) {
                        message = "Location deleted successfully";
                        var location = new LocationService.location(Location);
                        Location.$remove(function(response) {
                            for (var i = 0; i < $scope.locationTable.settings().dataset.length; i++) {
                                if (Location == $scope.locationTable.settings().dataset[i]) {
                                    $scope.locationTable.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.locations.length; i++) {
                                if (Location == $scope.locations[i]) {
                                    $scope.locations.splice(i, 1);
                                }
                            }
                            $scope.locationTable.reload().then(function(data) {
                                if (data.length === 0 && $scope.locationTable.total() > 0) {
                                    $scope.locationTable.page($scope.locationTable.page() - 1);
                                    $scope.locationTable.reload();
                                }
                            });
                            $location.path(LOCATION.URL_PATH.LOCATIONLIST);
                        });
                        utilityService.flash.success(message);
                    }
                });
            } else {
                $scope.location.$remove(function(response) {
                    $location.path(LOCATION.URL_PATH.LOCATIONLIST);
                });
            }
        };

        /**
         * Soft Delete/deactivate Location 
         * @params {location} Contain location object
         * */
        $scope.decativate = function(location) {
            if (location.active == true) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "Location Deactivated Successfully";
                        var locationObj = location;
                        locationObj.active = false;
                        locationObj.updatedAt = new Date();
                        locationObj.$update({
                            locationId: location._id
                        }, function() {
                            utilityService.flash.success(message);
                        }, function(error) {
                            $scope.error = error;
                        })
                    }
                })
            }
        };

        /** 
         * activate location
         * @params {location} Contain location object
         */
        $scope.activate = function(location) {
            if (location.active == false) {
                var locationObj = location;
                locationObj.active = true;
                locationObj.updatedAt = new Date();
                locationObj.$update({
                    locationId: location._id
                }, function() {
                    utilityService.flash.success("Location Activated Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            }
        };

        /**
         * findOne particular location
         * */
        $scope.findOne = function() {
            LocationService.location.get({
                locationId: $stateParams.locationId
            }, function(location) {
                $scope.zoomLevel = 15;
                $scope.location = location;
                $scope.address = $scope.location.loc[0] + ',' + $scope.location.loc[1]
            });
        };

        /**
         * cancel location
         * */
        $scope.cancelLocation = function() {
            $location.path(LOCATION.URL_PATH.LOCATIONLIST);
        };

        /**
         * add new location
         * */
        $scope.addLocation = function() {
            var urlPath = LOCATION.URL_PATH.LOCATIONCREATE;
            $location.path(urlPath);
        };

        /**
         * editLocation redirect function location
         * @params {id} contain location id
         * */
        $scope.editLocation = function(id) {
            var urlPath = LOCATION.URL_PATH.LOCATIONEDIT;
            urlPath = urlPath.replace(":locationId", id);
            $location.path(urlPath);
        };

    }

})();