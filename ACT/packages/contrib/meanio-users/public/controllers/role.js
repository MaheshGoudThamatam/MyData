(function() {
    'use strict';
    /* jshint -W098 */
    angular.module('mean.users').controller('RoleController', RoleController);
    RoleController.$inject = ['$scope', 'Global', '$stateParams', '$location', 'MeanUser', '$rootScope', 'USERS', 'UserService', 'RoleService', 'NgTableParams', 'utilityService', 'FeatureService'];

    function RoleController($scope, Global, $stateParams, $location, MeanUser, $rootScope, USERS, UserService, RoleService, NgTableParams, utilityService, FeatureService) {
        $scope.global = Global;
        $scope.USERS = USERS;
        $scope.package = {
            name: 'user'
        };
        $scope.newRole = {};
        $scope.newRole.permissions = {};
        if (MeanUser) {
            $scope.userLogged = MeanUser.user;
            $scope.isSuperAdmin = utilityService.isSuperAdmin(MeanUser.user.role._id);
        }

        $rootScope.$on('loggedin', function() {
            if (!$scope.isSuperAdmin) {
                $scope.isSuperAdmin = utilityService.isSuperAdmin(MeanUser.user.role._id);
            }
        });

        $scope.getFeatures = function() {
            FeatureService.features.query(function(response) {
                $scope.features = response;
            }, function(error) {});
        };

        $scope.addFeature = function(feature) {
            $scope.featureErr = false;
            if (angular.isDefined($scope.newRole.permissions[feature._id])) {
                delete $scope.newRole.permissions[feature._id];
                $scope.disable = false;
            } else {
                $scope.newRole.permissions[feature._id] = {};
                $scope.newRole.permissions[feature._id].read = true;
                $scope.disable = true;
            }
        };

        $scope.createRole = function(isValid) {
            var err = true;
            if (Object.keys($scope.newRole.permissions).length < 1) {
                err = false;
                $scope.featureErr = true;
            }
            if (isValid && err) {
                var role = new RoleService.roles($scope.newRole);
                role.$save(function(response) {
                    $scope.role = {};
                    $scope.saved = true;
                    $location.path(USERS.URL_PATH.ROLE_LIST);
                    utilityService.flash.success("Role Created Successfully");
                    $scope.featureErr = false;
                }, function(error) {
                    $scope.err = error;
                    if (angular.isDefined(error.data[0].permission)) {
                        $location.path(USERS.URL_PATH.ROLE_LIST);
                        utilityService.flash.error("Access Denied");
                    }
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }
        };

        $scope.getRoles = function() {
            RoleService.roles.query(function(response) {
                $scope.roleData = response.roles;
                $scope.roleDataset2 = response.pristine;
                $scope.tableParams = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.roleData,
                });
                $scope.tablePristine = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.roleDataset2
                });
                $scope.tablePristine.settings(utilityService.ngTableCounts($scope.roleDataset2));
            }, function(error) {});
        };

        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('roleData', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.tableParams)) {
                    $scope.tableParams.settings(utilityService.ngTableCounts(array));
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
                if (angular.isDefined($scope.tableParams)) {
                    $scope.tableParams.settings().dataset = $scope.roleData.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.name + item.description;
                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.tableParams.reload();
                }
            }
        });

        $scope.findRole = function() {
            RoleService.roles.get({
                roleId: $stateParams.roleId
            }, function(role) {
                $scope.role = role;
            }, function(error) {
                if (angular.isDefined(error.data[0].permission)) {
                    $location.path(USERS.URL_PATH.ROLE_LIST);
                    utilityService.flash.error("Access Denied");
                }
            });
        };

        $scope.editFeature = function(feature) {
            $scope.featureErr = false;
            if (angular.isDefined($scope.role.permissions[feature._id])) {
                delete $scope.role.permissions[feature._id];
                $scope.disable = false;
            } else {
                $scope.role.permissions[feature._id] = {};
                $scope.role.permissions[feature._id].read = true;
                $scope.disable = true;
            }
        };

        $scope.newRoles = function() {
            $location.path(USERS.URL_PATH.ROLE_CREATE);
        };

        $scope.edit = function(roleId) {
            $location.path(USERS.URL_PATH.ROLE_EDIT.replace(':roleId', roleId));
        };

        $scope.updateRole = function(Url, isValid) {
            var err = true;
            if (Object.keys($scope.role.permissions).length < 1) {
                err = false;
                $scope.featureErr = true;
            }
            if (isValid && err) {
                var updateRole = new RoleService.roles($scope.role);
                updateRole.$update({
                    roleId: $stateParams.roleId
                }, function(role) {
                	$scope.saved = true;
                    $location.path(Url);
                    utilityService.flash.success("Role updated Successfully");
                    $scope.featureErr = false;
                }, function(error) {
                    $scope.error = error;
                    if (angular.isDefined(error.data[0].permission)) {
                        $location.path(USERS.URL_PATH.ROLE_LIST);
                        utilityService.flash.error("Access Denied");
                    }
                });
            } else {
                $scope.submitted = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };

        $scope.delete = function(roleObj) {
            if (roleObj) {
                utilityService.delConfirm(function(result) {
                    var message = "";
                    if (result) {
                        var role = new RoleService.roles(roleObj);
                        role.$remove(function(response) {
                            for (var i = 0; i < $scope.tableParams.settings().dataset.length; i++) {
                                if (roleObj == $scope.tableParams.settings().dataset[i]) {
                                    $scope.tableParams.settings().dataset.splice(i, 1);
                                }
                            }
                            for (var i = 0; i < $scope.roleData.length; i++) {
                                if (roleObj == $scope.roleData[i]) {
                                    $scope.roleData.splice(i, 1);
                                }
                            }
                            $scope.tableParams.reload().then(function(data) {
                                if (data.length === 0 && $scope.tableParams.total() > 0) {
                                    $scope.tableParams.page($scope.tableParams.page() - 1);
                                    $scope.tableParams.reload();
                                }
                            });
                            utilityService.flash.success("Role Deleted Successfully");
                        }, function(err) {
                            if (err) {
                                utilityService.flash.error(err.data);
                            }
                        })
                    }
                });
            }
        };

        $scope.cancelRedirect = function() {
            $location.path(USERS.URL_PATH.ROLE_LIST);
        };
    }
})();