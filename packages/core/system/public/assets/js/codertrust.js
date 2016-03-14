function initializeBreadCrum($scope, name, url) {
    $scope.baseLinks = [
        {'name': name, 'url': url, 'isLink': true}
    ];
    $scope.breadCrumAdd = function (name) {
        $scope.breadcrumLinks = angular.copy($scope.baseLinks);
        $scope.breadcrumLinks.push({'name': name, 'url': '', 'isLink': false});
    }
    $scope.breadCrumAppend = function (name) {

        $scope.breadcrumLinks.push({'name': name, 'url': '', 'isLink': false});
    }

    $scope.breadCrumAddUrl = function (name, url) {
        $scope.breadcrumLinks = angular.copy($scope.baseLinks);
        $scope.breadcrumLinks.push({'name': name, 'url': url, 'isLink': true});
    }

    $scope.breadCrumAppendUrl = function (name, url) {
        $scope.breadcrumLinks.push({'name': name, 'url': url, 'isLink': true});
    }
}

function initializeDeletePopup($scope, modelName, MESSAGES,$uibModal) {
    $scope.popupTitle = MESSAGES.DELETE_TITLE.replace(MESSAGES.DELETE_MODEL, modelName);
    $scope.popupMessage = MESSAGES.DELETE_MESSAGE.replace(MESSAGES.DELETE_MODEL, modelName.toLowerCase());  
    
    $scope.modalDeletePopup = function (deleteObj) {
        var modalInstance = $uibModal.open({
            templateUrl: '/system/views/delete-popup.html',
            controller: 'DeleteModalInstanceCtrl',
            size: 'sm',
            resolve: {
                popupTitle: function () {
                    return $scope.popupTitle;
                },
                popupMessage: function () {
                    return $scope.popupMessage;
                },deleteObj: function () {
                    return deleteObj;
                }
            }
        });

        modalInstance.result.then(function (deleteObj) {
            $scope.remove(deleteObj);
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    $scope.cancelDelete = function () {
        $('#deletePopup').modal("hide");
    };   
}

function initializePermission($scope, $rootScope, $location, flash, featureName, MESSAGES) {
    $scope.readPermission = false;
    $scope.writePermission = false;
    $scope.deletePermission = false;
    $scope.updatePermission = false;
    $scope.updatePermissions=function(){
        if (!angular.isUndefined($rootScope.userFeaturesList)) {
            $scope.userFeaturesList = $rootScope.userFeaturesList;
            for (var i = 0; i < $scope.userFeaturesList.length; i++) {
                if (featureName === $scope.userFeaturesList[i].feature.name) {
                    $scope.readPermission = $scope.readPermission || $scope.userFeaturesList[i].isRead;
                    $scope.writePermission = $scope.writePermission || $scope.userFeaturesList[i].isWrite;
                    $scope.deletePermission = $scope.deletePermission || $scope.userFeaturesList[i].isDelete;
                    $scope.updatePermission = $scope.updatePermission || $scope.userFeaturesList[i].isUpdate;
                }
            }
        }
        if (!$scope.readPermission) {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.updatePermissions();
    $rootScope.$on('permission', function () {
        $scope.updatePermissions();
    });
}

function deleteObjectFromArray(objList, obj) {
    for (var i = 0; i < objList.length; i++) {
        if (objList[i] === obj || objList[i]._id === obj._id) {
            objList.splice(i, 1);
        }
    }
}

function objectPresntInArray(objList, obj) {
    for (var i = 0; i < objList.length; i++) {
        if (objList[i] === obj || objList[i]._id === obj._id) {
            return i;
        }
    }
    return -1;
}

function addNonDuplicateObjectArray(objList, obj){
    if(objectPresntInArray(objList, obj) == -1){
        objList.push(obj);
    }
}

function initializeRoleFilter($scope, $rootScope, RoleService) {
    //finding all Roles
    $scope.loadRoles = function () {
        if ($rootScope.roles) {
            $scope.roles = $rootScope.roles;
        } else {
            RoleService.role.query(function (roles) {
                $scope.roles = roles;
                $rootScope.roles = roles;
            });
        }
    };

    $scope.roleFilter = function (roleId) {
        if (roleId) {
            $rootScope.userFilter.role = roleId;
        } else {
            delete $rootScope.userFilter.role;
        }
        $rootScope.$emit('userFilterChanged');
    };
}

function initializeCountryFilter($scope, $rootScope, CountryService, ZoneService, CityService, BranchService) {
    //fetching the list of countries
    $rootScope.userFilter = {};
    $scope.listCountry = function () {
        if ($rootScope.countries) {
            $scope.countries = $rootScope.countries;
        } else {
            CountryService.country.query(function (countries) {
                $scope.countries = countries;
                $rootScope.countries = countries;
            });
        }
    };

    $scope.listZone = function (countryId) {
        if (countryId) {
            $rootScope.userFilter.country = countryId;
            ZoneService.countryZone.query({countryId: countryId}, function (zones) {
                $scope.zones = zones;
            });
        } else {
            delete $rootScope.userFilter.country;
        }
        $rootScope.$emit('userFilterChanged');
    };

    $scope.listCity = function (zoneId) {
        if (zoneId) {
            $rootScope.userFilter.zone = zoneId;
            CityService.zoneCity.query({zoneId: zoneId}, function (cities) {
                $scope.cities = cities;
            });
        } else {
            delete $rootScope.userFilter.zone;
        }
        $rootScope.$emit('userFilterChanged');
    };

    //fetching the list of  branches based on city
    $scope.listBranches = function (cityId) {
        if (cityId) {
            $rootScope.userFilter.city = cityId;
            BranchService.cityBranch.query({cityId: cityId}, function (branches) {
                $scope.branches = branches;
            });
        } else {
            delete $rootScope.userFilter.city;
        }
        $rootScope.$emit('userFilterChanged');
    };

    $scope.branchFilter = function (branchId) {
        if (branchId) {
            $rootScope.userFilter.branch = branchId;
        } else {
            delete $rootScope.userFilter.branch;
        }
        $rootScope.$emit('userFilterChanged');
    };
}

function initializeAdminList($scope, $rootScope, UserService) {
    $scope.adminList = function () {
        UserService.users.query({'roles': 'admin'}, function (userList) {
            $scope.adminList = userList;
        });
    };

    $scope.countryAdminList = function (mainObject, query) {
        mainObject.adminList = [];
        UserService.users.query(query, function (userList) {
            for (var a = 0; a < userList.length; a++) {
                for (var i = 0; i < $scope.adminList.length; i++) {
                    if ($scope.adminList[i]._id === userList[a]._id) {
                        mainObject.adminList.push(userList[a]);
                    }
                }
            }
        });
    };

    $scope.addAdmin = function (admin, mainObject) {
        var index = objectPresntInArray(mainObject.adminList, admin);
        if (index > -1) {
            mainObject.adminList.splice(index, 1);
        } else {
            mainObject.adminList.push(admin);
        }
    };

    $scope.checkAdmin = function (admin, mainObject) {
        if (mainObject && mainObject.adminList) {
            var index = objectPresntInArray(mainObject.adminList, admin);
            return index > -1;
        }
        return false;
    };
}

function pageTitleMessage($scope,$translate,titleString,descString){
    $translate(titleString).then(function (translatedValue) {
        $scope.breadcrumbTitle = translatedValue;
    });

    $translate(descString).then(function (translatedValue) {
        $scope.breadcrumbDesc = translatedValue;
    });
}



