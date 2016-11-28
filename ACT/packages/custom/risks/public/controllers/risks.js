(function() {
    'use strict';
    /** Name : Risk Controller
     * Description : In this controller risks are created by the security manager.
     * @ <author> Anto Steffi 
     * @ <date> 29-June-2016, 30-June-2016, 01-July-2016
     * @ METHODS: create, update, findOne, riskRate, list, hard delete, activate, deactivate
     */
    /** Modification added methods
     * @ <author> Anto Steffi 
     * @ <date> 04-July-2016
     * @ METHODS: fetch the locations based on user, Based on location loading building
     */
    /** Modification added methods
     * @ <author> Anto Steffi 
     * @ <date> 07-July-2016, 08-July-2016 
     * @ METHODS: Find buildings by location for edit, global filter, modified list method
     */

    /* jshint -W098 */
    angular.module('mean.risks').controller('RisksController', RisksController);

    RisksController.$inject = ['$scope', 'Global', 'RiskService', '$stateParams', 'MeanUser', 'utilityService', 'NgTableParams', '$location', 'RISK'];

    function RisksController($scope, Global, RiskService, $stateParams, MeanUser, utilityService, NgTableParams, $location, RISK) {
        $scope.global = Global;
        $scope.package = {
            name: 'risks'
        };

        $scope.USER = MeanUser.user.name;
        $scope.risk = {};
        $scope.riskValues = [1, 2, 3, 4, 5];
        $scope.riskRatingShow = false;
        $scope.members = [];
        $scope.locations = [];

        /**
         * Calculate the Risk Rating
         */
        $scope.riskRate = function() {
            if ($scope.risk.consequence && $scope.risk.likelihood) {
                if (angular.isUndefined($scope.risk)) {
                    $scope.risk = {};
                    $scope.risk.riskRating = undefined;
                }
                $scope.riskRatingShow = true;
                $scope.risk.riskRating = $scope.risk.likelihood * $scope.risk.consequence;
                $scope.riskRatingColor($scope.risk.riskRating)
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.calculateError = true;
            }
        };

        /**
         * background color for riskrating show
         * @params: riskRating value based on which color is defined
         */
        $scope.riskRatingColor = function(riskRating) {
            if (riskRating < 4) {
                $scope.riskRatingClass = "btn default"
            } else
            if (riskRating > 3 && riskRating < 7) {
                $scope.riskRatingClass = "btn green"
            } else
            if (riskRating > 6 && riskRating < 13) {
                $scope.riskRatingClass = "btn blue"
            } else
            if (riskRating > 12 && riskRating < 16) {
                $scope.riskRatingClass = "btn yellow"
            } else
            if (riskRating > 15) {
                $scope.riskRatingClass = "btn red"
            }
        }

        /**
         * fetch the locations based on user
         */
        $scope.loadLocations = function() {
            $scope.user = MeanUser.user;
            RiskService.fetchLocations.query(function(locations) {
                $scope.locations = locations;
            })
        };

        /**
         * Based on location loading building
         */
        $scope.loadBuildings = function(locationId) {
            $scope.members = [];
            $scope.locationId = locationId;
            RiskService.fetchBuildings.query({
                locationId: $scope.locationId
            }, function(buildings) {
                $scope.buildings = buildings;
            });
        };

        /**
         * Create a new risk
         */
        $scope.create = function(isValid) {
            if (angular.isUndefined($scope.risk.members_participating)) {
                $scope.risk.members_participating = [];
            }
            if (isValid && $scope.risk.riskRating && $scope.risk.members_participating.length > 0) {
                $('.tags').css('border-color', 'none')
                $scope.user = MeanUser.user;
                var risk = new RiskService.risk($scope.risk);
                risk.$save(function(response) {
                	$scope.saved = true;
                    $location.path(RISK.PATH.LIST_RISK);
                    utilityService.flash.success("Risk Created Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                if ($scope.risk.members_participating.length < 1) {
                    $scope.membersParticipating = true;
                    $('.tags').css('border-color', '#ed6b75')
                }
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }
        };

        /**
         * Updates the edited risk
         */
        $scope.update = function(isValid) {
            if (angular.isUndefined($scope.risk.members_participating)) {
                $scope.risk.members_participating = [];
            }
            if (isValid && $scope.risk.members_participating.length > 0) {
                var risk = $scope.risk;
                if (!risk.updatedAt) {
                    risk.updatedAt = "";
                }
                risk.updatedAt = new Date();
                $scope.riskRate();
                risk.$update({
                    riskId: $stateParams.riskId
                }, function() {
                	$scope.saved = true;
                    $location.path(RISK.PATH.LIST_RISK);
                    utilityService.flash.success("Risk Updated Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                if ($scope.risk.members_participating.length < 1) {
                    $scope.membersParticipating = true;
                    $('.tags').css('border-color', '#ed6b75')
                }
                $scope.submitted = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };

        /**
         * Shows the single risk
         */
        $scope.findOne = function() {
            RiskService.risk.get({
                riskId: $stateParams.riskId
            }, function(risk) {
                for (var i = 0; i < risk.members_participating.length; i++) {
                    risk.members_participating[i].fullname = risk.members_participating[i].firstname + ' ' + risk.members_participating[i].lastname + ' <' + risk.members_participating[i].email + '>'
                }
                $scope.riskRatingShow = true;
                $scope.riskRatingColor(risk.riskRating)
                $scope.members = risk.members_participating;
                $scope.risk = risk;
                $scope.risk.building = $scope.risk.building._id;
                $scope.findBuildingsByLocation($scope.risk.location._id);
                $scope.loadUsers($scope.risk.building);
            });
        };

        /**
         * Hard Delete for Risk
         * 
         */
        $scope.deleteRisk = function(Risk) {
            if (Risk) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        var risk = new RiskService.risk(Risk);
                        risk.$remove(function(response) {
                            for (var i = 0; i < $scope.listRisk.settings().dataset.length; i++) {
                                if (Risk == $scope.listRisk.settings().dataset[i]) {
                                    $scope.listRisk.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.risks.length; i++) {
                                if (Risk == $scope.risks[i]) {
                                    $scope.risks.splice(i, 1);
                                }
                            }
                            $scope.listRisk.reload().then(function(data) {
                                if (data.length === 0 && $scope.listRisk.total() > 0) {
                                    $scope.listRisk.page($scope.listRisk.page() - 1);
                                    $scope.listRisk.reload();
                                }
                            });
                            utilityService.flash.success("Risk Deleted Successfully");
                        }, function(err) {
                            if (err) {
                                utilityService.flash.error(err.data);
                            }
                        })
                    }
                });
            }
        };

        /**
         * Activate Risk
         * 
         */
        $scope.activeRisk = function(risk) {
            if (risk.isActive == false) {
                var riskObj = risk;
                if (!riskObj.updatedAt) {
                    riskObj.updatedAt = "";
                }
                riskObj.isActive = true;
                riskObj.updatedAt = new Date();
                riskObj.$update({
                    riskId: risk._id
                }, function() {
                    utilityService.flash.success("Risk Activated Successfully");
                }, function(error) {
                    $scope.error = error
                })
            } else {
                utilityService.flash.error("Risk is Already Activated.");
            }
        };

        /**
         * Deactivate Risk
         * 
         */
        $scope.deactiveRisk = function(risk) {
            if (risk.isActive == true) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "Risk Deactivated Successfully";
                        var riskObj = risk;
                        if (!riskObj.updatedAt) {
                            riskObj.updatedAt = "";
                        }
                        riskObj.isActive = false;
                        riskObj.updatedAt = new Date();
                        riskObj.$update({
                            riskId: risk._id
                        }, function() {
                            utilityService.flash.warning(message);
                        }, function(error) {
                            $scope.error = error
                        })
                    }
                })
            } else {
                utilityService.flash.error("Risk is Already Deactivated.");
            }
        };

        /**
         * Redirect to Risk List Page
         */
        $scope.createRisk = function() {
            $location.path(RISK.PATH.CREATE_RISK);
        };

        /**
         * Redirect to Risk Edit Page
         */
        $scope.editRisk = function(id) {
            var urlPath = RISK.PATH.EDIT_RISK;
            urlPath = urlPath.replace(":riskId", id);
            $location.path(urlPath);
        };

        /**
         * Redirect to Risk List Page
         */
        $scope.cancel = function() {
            $location.path(RISK.PATH.LIST_RISK);
        };

        /**
         * Find buildings by location
         */
        $scope.findBuildingsByLocation = function(locationId) {
            $scope.locationId = locationId;
            RiskService.fetchBuildings.query({
                locationId: $scope.locationId
            }, function(buildings) {
                $scope.buildings = buildings;
            });

        };

        /**
         * Shows all the risk using NgTable
         */
        $scope.list = function() {
            RiskService.risk.query(function(risks) {
                $scope.risks = risks;
                $scope.listRisk = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.risks
                });
            })
        };

        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('risks', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.listRisk)) {
                    $scope.listRisk.settings(utilityService.ngTableCounts(array));
                }
            }
        });

        /**
         * Table for global filter
         */
        $scope.$watch('tableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.listRisk)) {
                    $scope.listRisk.settings().dataset = $scope.risks.filter(function(item) {
                        var haystack = item.name + item.description;
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.listRisk.reload();
                }
            }
        });

        $scope.loadUser = function() {
            RiskService.fetchUser.query(function(response) {
                for (var i = 0; i < response.length; i++) {
                    response[i].fullname = response[i].firstname + ' ' + response[i].lastname + ' <' + response[i].email + '>'
                }
                $scope.users = response
            })
        };

        $scope.loadInput = function($query) {
            return $scope.usersMember.filter(function(user) {
                return user.fullname.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };

        $scope.filterinputadded = function() {
            $scope.membersParticipating = false;
            $('.tags').css('border-color', '')
            var memberArray = [];
            if (angular.isUndefined($scope.risk)) {
                $scope.risk = {};
            }
            if (angular.isDefined($scope.members)) {
                for (var i = 0; i < $scope.members.length; i++) {
                    memberArray.push($scope.members[i]._id)
                }
                $scope.risk.members_participating = memberArray;
            }
        };

        $scope.filterinputremoved = function() {
            var memberArray = [];
            if (angular.isUndefined($scope.risk)) {
                $scope.risk = {};
            }
            for (var i = 0; i < $scope.members.length; i++) {
                memberArray.push($scope.members[i]._id)
            }
            $scope.risk.members_participating = memberArray;
        };

        $scope.loadLocationBasedOnUserSelected = function(memberarray) {
            var selecteduserarray = {};
            selecteduserarray.memberarray = memberarray;

            RiskService.fetchLocationsBasedOnUserSelected.query({
                "selecteduserarray": selecteduserarray
            }, function(response) {
                $scope.locationsBasedOnUser = response;
            }, function(error) {

            });
        };

        $scope.loadUsers = function(buildingId) {
            $scope.usersMember = [];
            RiskService.fetchUserBasedOnBuildingSelected.query({
                "buildingId" : buildingId
            }, function(response){
                for (var i = 0; i < response.length; i++) {
                    response[i].fullname = response[i].firstname + ' ' + response[i].lastname + ' <' + response[i].email + '>'
                }
                $scope.usersMember = response;
            });
        };
    }

})();