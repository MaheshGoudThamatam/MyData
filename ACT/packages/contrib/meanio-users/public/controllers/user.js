(function() {
    'use strict';
    /* jshint -W098 */
    angular.module('mean.users').controller('UserController', UserController);

    UserController.$inject = ['$scope', 'Global', '$stateParams', '$location', 'MeanUser', '$rootScope', 'USERS', 'UserService', 'RoleService', 'NgTableParams', 'utilityService', 'Upload', '$http', '$window', 'SITE', 'CONFIG', '$timeout'];

    function UserController($scope, Global, $stateParams, $location, MeanUser, $rootScope, USERS, UserService, RoleService, NgTableParams, utilityService, Upload, $http, $window, SITE, CONFIG, $timeout) {
        $scope.global = Global;
        $scope.USERS = USERS;
        $scope.package = {
            name: 'user'
        };
        $scope.uploadBegins = false;
        $scope.userLogged = MeanUser.user;
        $scope.createUser = function(isValid) {
            var buildingsArray = $("#tree").jstree("get_checked", true);
            if (isValid && buildingsArray.length > 0) {
                var user = new UserService.users($scope.newUser);
                user.locationAndBuilding = buildingsArray;
                user.$save(function(response) {
                    $scope.user = {};
                    $scope.saved = true;
                    utilityService.flash.success("User Created Successfully");
                    $location.path(USERS.URL_PATH.USER_LIST);
                }, function(error) {
                    $scope.err = error;
                    if (angular.isDefined(error.data[0].permission)) {
                        $location.path(USERS.URL_PATH.USER_LIST);
                        utilityService.flash.error("Access Denied");
                    }
                });
            } else {
                if (buildingsArray.length < 1) {
                    $scope.isBuildingSelected = false;
                    $('.jstree-checkbox').css('background-color', 'red').css('opacity', '0.5');
                }
                $scope.submitted = true;
            }
        };
        $scope.getRolesonUSer = function() {
            RoleService.roles.query(function(response) {
                $scope.selectedRoles = response.roles;
            }, function(error) {
                $location.path(USERS.URL_PATH.USER_LIST);
            });
        };
        $scope.getUsers = function() {
            UserService.users.query(function(response) {
                $scope.userData = response;
                $scope.tableParams = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.userData
                });
            }, function(error) {});
        };

        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('userData', function(array) {
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
                    $scope.tableParams.settings().dataset = $scope.userData.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.firstname + item.lastname + item.email + item.role.name;
                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.tableParams.reload();
                }
            }
        });
        $scope.findUser = function() {
            UserService.users.get({
                createuserId: $stateParams.userId
            }, function(user) {
                if (user.role._id == CONFIG.roles.SECURITY_MANAGER) {
                    if (MeanUser.user.role._id == CONFIG.roles.SECURITY_MANAGER) {
                        $scope.user = user;
                    } else {
                        $location.path(USERS.URL_PATH.USER_LIST);
                        utilityService.flash.error("Unauthorized")
                    }
                } else {
                    $scope.user = user;
                }
            }, function(error) {
                if (angular.isDefined(error.data[0].permission)) {
                    $location.path(USERS.URL_PATH.USER_LIST);
                    utilityService.flash.error("Access Denied");
                }
            });
        };
        $scope.getProfile = function() {
            UserService.currentUser.get({}, function(user) {
                if (!user) {
                    $window.location.href = '/';
                    utilityService.flash.error('Error fetching user.');
                } else {
                    $scope.profile = user;
                }
            });
        };
        $scope.saveProfile = function(isValid) {
            if (isValid) {
                var profile = new UserService.currentUser($scope.profile);
                profile.$save(function(response) {
                    window.location.href = USERS.URL_PATH.USER_PROFILE_MANAGE;
                    utilityService.flash.success("Profile Update Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }
        };
        $scope.passMatch = false;
        $scope.updatePassword = function(isValid) {
            if (angular.isUndefined($scope.changePassword)) {
                $scope.changePassword = {};
            }
            if (isValid && $scope.changePassword.password === $scope.changePassword.confirmPassword && $scope.validPassword) {
                var changePassword = new UserService.updateUserPassword($scope.changePassword);
                changePassword.$save(function(response) {
                    $location.path(USERS.URL_PATH.USER_PROFILE_MANAGE);
                    utilityService.flash.success("Password changed Successfully");
                    $scope.changePassword = {};
                    $scope.passMatch = false;
                    $scope.submitted3 = false;
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                if ($scope.changePassword.password !== $scope.changePassword.confirmPassword) {
                    $scope.passMatch = true;
                }
                utilityService.flash.error("Please enter valid details");
                $scope.submitted3 = true;
            }
        }

        $scope.changeErr = function() {
            if ($scope.submitted3 = true) {
                if (angular.isUndefined($scope.changePassword)) {
                    $scope.changePassword = {};
                }
                if ($scope.changePassword.password === $scope.changePassword.confirmPassword) {
                    $scope.passMatch = false;
                } else {
                    $scope.passMatch = true;
                }
            }
        };

        $scope.newUsers = function() {
            $location.path(USERS.URL_PATH.USER_CREATE);
        };
        $scope.edit = function(userId) {
            $location.path(USERS.URL_PATH.USER_EDIT.replace(':userId', userId));
        };
        $scope.updateUser = function(Url, isValid) {
            var buildingsArray = $("#tree").jstree("get_checked", true);
            if (isValid && buildingsArray.length > 0) {
                var user = new UserService.users($scope.user);
                user.locationAndBuilding = buildingsArray;
                user.$update({
                    createuserId: $stateParams.userId
                }, function(response) {
                    $scope.saved = true;
                    $location.path(Url);
                    utilityService.flash.success("User Updated Successfully");
                }, function(error) {
                    $scope.error = error;
                    if (angular.isDefined(error.data[0].permission)) {
                        $location.path(USERS.URL_PATH.USER_LIST);
                        utilityService.flash.error("Access Denied");
                    }
                });
            } else {
                $scope.submitted = true;
                if (buildingsArray.length < 1) {
                    $scope.isBuildingSelected = false;
                    $('.jstree-checkbox').css('background-color', 'red').css('opacity', '0.5');
                }
            }
        };
        $scope.delete = function(userObj) {
            if (userObj) {
                utilityService.delConfirm(function(result) {
                    var message = "";
                    if (result) {
                        message = "User Deleted Successfully";
                        var user = new UserService.users(userObj);
                        user.$remove(function(response) {
                            for (var i = 0; i < $scope.tableParams.settings().dataset.length; i++) {
                                if (userObj == $scope.tableParams.settings().dataset[i]) {
                                    $scope.tableParams.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.userData.length; i++) {
                                if (userObj == $scope.userData[i]) {
                                    $scope.userData.splice(i, 1);
                                }
                            }
                            $scope.tableParams.reload().then(function(data) {
                                if (data.length === 0 && $scope.tableParams.total() > 0) {
                                    $scope.tableParams.page($scope.tableParams.page() - 1);
                                    $scope.tableParams.reload();
                                }
                            });
                            utilityService.flash.success(message);
                        })
                    }
                });
            }
        };
        $scope.cancelRedirect = function() {
            $location.path(USERS.URL_PATH.USER_LIST);
        };
        $scope.getRoleSelect = function() {
            RoleService.roleSelect.query(function(roles) {
                $scope.roleArray = roles;
            });
        };
        $scope.onUsersFileSelect = function(file) {
            $scope.resultUsersSet = [];
            if (file) {
                if (file.name.split('.').pop() !== 'xls' && file.name.split('.').pop() !== 'xlsx') {
                    $scope.uploadBegins = false;
                    utilityService.flash.error('Only xls and xlsx are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/users/bulkupload",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.uploadBegins = true;
                        $scope.resultUsersSet = data.result
                    }).error(function(err) {
                        $scope.uploadBegins = false;
                        utilityService.flash.error(err.error);
                    });
                }
            }
        };
        $scope.cancelRedirectList = function() {
            $location.path(USERS.URL_PATH.USER_LIST);
        };
        $scope.bulkUploadRedirect = function() {
            $scope.uploadBegins = false;
            $location.path(USERS.URL_PATH.USER_BULKFILE);
        };
        $scope.getTemplate = function() {
            $http({
                url: '/api/users/getTemplate',
                method: 'GET',
                responseType: 'arraybuffer'
            }).success(function(response) {
                var blob = new Blob([response], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                saveAs(blob, 'bulkupload_user_template' + '.xlsx');
            });
        };
        /**
         * Initialize jsTree
         * @params {data} contain json of location and building to initialize jstree
         */
        $scope.initializeTree = function(data) {
            $('#tree').jstree({
                'core': {
                    'data': data
                },
                'plugins': ["wholerow", "checkbox", "types", "themes"],
                'check_callback': true,
                'types': {
                    'default': {
                        'icon': 'glyphicon glyphicon-flash'
                    },
                    'location': {
                        'icon': 'fa fa-map-marker'
                    },
                    'building': {
                        'icon': 'fa fa-building'
                    }
                }
            })
            $('#tree').bind("ready.jstree", function(e, data) {
                $('#tree').jstree("open_all");
            });
        };

        /**
         * fetch building and location & convert to json format required by jsTree
         */
        $scope.initLocBuildCreate = function() {
            UserService.locationAndBuilding.query({}, function(response) {
                for (var i = 0; i < response.length; i++) {
                    response[i].children = [];
                    for (var j = 0; j < response[i].buildings.length; j++) {
                        var co
                        response[i].buildings[j].text = response[i].buildings[j].building_name;
                        response[i].buildings[j].id = response[i].buildings[j]._id;
                        response[i].buildings[j].type = 'building';
                    }
                    response[i].children = response[i].buildings;
                    response[i].id = response[i]._id;
                    response[i].text = response[i].name;
                    response[i].type = 'location';
                }
                $scope.buildingArrayCreate = response;
                $scope.initializeTree(response)
            })
        };

        /**
         * fetch location and building & convert to json format required by jsTree & added selected field so location & building
         * is auto selected if already present in user database
         */
        $scope.initLocBuildUpdate = function() {
            var locationHasBuilding = true;
            var proceed = true;
            UserService.locationAndBuilding.query({}, function(response) {
                UserService.users.get({
                    createuserId: $stateParams.userId
                }, function(user) {
                    // checking if logged in user and editable user role are security manager, if not then user is not allowed to edit user details
                    if (user.role._id == CONFIG.roles.SECURITY_MANAGER) {
                        if (MeanUser.user.role._id == CONFIG.roles.SECURITY_MANAGER) {
                            proceed = true;
                        } else {
                            proceed = false;
                        }
                    }
                    if (proceed) {
                        for (var i = 0; i < response.length; i++) {
                            if (response[i].buildings.length > 0) {
                                for (var j = 0; j < response[i].buildings.length; j++) {
                                    response[i].buildings[j].text = response[i].buildings[j].building_name;
                                    response[i].buildings[j].type = 'building';
                                    response[i].buildings[j].id = response[i].buildings[j]._id;
                                    for (var k = 0; k < user.buildings.length; k++) {
                                        if (JSON.stringify(response[i].buildings[j]._id) == JSON.stringify(user.buildings[k])) {
                                            response[i].buildings[j].state = {
                                                selected: true,
                                                disabled: utilityService.isSecurityManager(user.role._id)
                                            }
                                        }
                                    }
                                    response[i].state = {
                                        disabled: utilityService.isSecurityManager(user.role._id)
                                    }
                                }
                            } else {
                                locationHasBuilding = false;
                            }
                            response[i].children = response[i].buildings;
                            response[i].text = response[i].name;
                            response[i].id = response[i]._id;
                            response[i].type = 'location';
                            if (locationHasBuilding == false) {
                                for (var k = 0; k < user.locations.length; k++) {
                                    if (JSON.stringify(response[i]._id) == JSON.stringify(user.locations[k])) {
                                        response[i].state = {
                                            selected: true
                                        }
                                    }
                                }
                            }
                        }
                        $scope.initializeTree(response);
                    }
                })
            })
        };

        $scope.checkLocation = function() {
            UserService.currentUser.get({}, function(user) {
                if (user.buildings.length < 1) {
                    var title = "No Site Found.";
                    var message = "Please add site first, do you want to create site?";
                    $location.path(USERS.URL_PATH.USER_LIST);
                    utilityService.genericConfirm(title, message, function() {
                        //TODO: this will completely reload the window & need to find a better solution later
                        $window.location.href = SITE.PATH.BUILDING_ADD;
                    });
                }
            })
        };

        $scope.cancel = function() {
            $location.path("/");
        };

        $('#tree').on('click', function() {
            $scope.$apply(function() {
                if ($scope.submitted == true) {
                    if (($("#tree").jstree("get_checked", true)).length > 0) {
                        $scope.isBuildingSelected = true;
                        $('.jstree-checkbox').css('background-color', 'transparent').css('opacity', '1');
                    } else {
                        $scope.isBuildingSelected = false;
                        $('.jstree-checkbox').css('background-color', 'red').css('opacity', '0.5');
                    };
                }
            });
        });

        $scope.roleIsSecurityManagerCreate = function() {
            if ($scope.newUser.role == CONFIG.roles.SECURITY_MANAGER) {
                $('#tree li').each(function() {
                    $("#tree").jstree().disable_node(this.id);
                    $("#tree").jstree().select_node(this.id);
                })
                $scope.isBuildingSelected = true;
                $('.jstree-checkbox').css('background-color', 'transparent').css('opacity', '1');
            } else {
                $('#tree li').each(function() {
                    $("#tree").jstree().enable_node(this.id);
                    $("#tree").jstree().deselect_node(this.id);
                })
            }
        };

        $scope.roleIsSecurityManagerUpdate = function() {
            if ($scope.user.role._id == CONFIG.roles.SECURITY_MANAGER) {
                $('#tree li').each(function() {
                    $("#tree").jstree().disable_node(this.id);
                    $("#tree").jstree().select_node(this.id);
                })
                $scope.isBuildingSelected = true;
                $('.jstree-checkbox').css('background-color', 'transparent').css('opacity', '1');
            } else {
                $('#tree li').each(function() {
                    $("#tree").jstree().enable_node(this.id);
                    $("#tree").jstree().deselect_node(this.id);
                })
            }
        };

        $scope.showPass = function(event) {
            var element = event.target.previousElementSibling;
            if ($(element).attr('type') == 'password') {
                $(element).attr('type', 'text');
                $(event.currentTarget).find('i').removeClass('fa-eye');
                $(event.currentTarget).find('i').addClass('fa-eye-slash');
            } else {
                $(element).attr('type', 'password');
                $(event.currentTarget).find('i').removeClass('fa-eye-slash');
                $(event.currentTarget).find('i').addClass('fa-eye');
            }
        };

        $scope.showPassAlt = function(event) {
            var element = $(event.currentTarget).parent().prev();
            if ($(element).attr('type') == 'password') {
                $(element).attr('type', 'text');
                $(event.target).removeClass('fa-eye');
                $(event.target).addClass('fa-eye-slash');
                event.stopPropagation();
            } else {
                $(element).attr('type', 'password');
                $(event.target).removeClass('fa-eye-slash');
                $(event.target).addClass('fa-eye');
                event.stopPropagation();
            }
        };

        $scope.$watch('changePassword.password', function(password) {
            if (password) {
                var pattern = new RegExp("^(?=.*[A-Z])(?=.*[!@#$%&_+=])(?=.*[0-9])(?=.*[a-z]).{8,}$");
                $scope.validPassword = pattern.test(password);
            }
        });

        $scope.passwordUpdateFn = function(isValid) {

            if (angular.isUndefined($scope.changePassword)) {
                $scope.changePassword = {};
            }
            if (isValid && $scope.changePassword.password === $scope.changePassword.confirmPassword && $scope.validPassword) {
                $scope.passwordError = false;
                var changePassword = new UserService.updateUserPassword($scope.changePassword);
                changePassword.$save(function(response) {
                    $location.path('/');
                    utilityService.flash.success("Password changed Successfully. Redirecting to dashboard...");
                    $scope.changePassword = {};
                    $scope.submitted = false;
                    $scope.confirmPasswordMismatch = false;
                    $timeout(function() {
                        $window.location.href = '/';
                    }, 3000);
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                utilityService.flash.error("Please enter valid details");
                $scope.submitted = true;
                if ($scope.changePassword.password !== $scope.changePassword.confirmPassword) {
                    $scope.confirmPasswordMismatch = true;
                }
            }
        };


        /**
         * Profile image upload function & initialize croppie plugin (frontend only)
         * @params {file} image file
         */
        $scope.viewImageViewport = false;
        $scope.uploadImage = function(file) {
            if (file.name.split('.').pop() !== 'jpeg' && file.name.split('.').pop() !== 'jpg') {
                utilityService.flash.error('Only jpg/jpeg are accepted.');
                return;
            } else {
                initializeCroppie = $('#profileImage').croppie({
                    viewport: {
                        width: 200,
                        height: 200,
                        type: 'square'
                    },
                    boundary: {
                        width: 300,
                        height: 300
                    },
                    enableExif: true
                });
                var reader = new FileReader();
                reader.onload = function(e) {
                    initializeCroppie.croppie('bind', {
                        url: e.target.result
                    }).then(function() {
                        $scope.$apply(function() {
                            $scope.viewImageViewport = true;
                        });
                    });
                }
                reader.readAsDataURL(file);
            }
        };


        /**
         * initialize the croppie
         */
        var initializeCroppie = {};

        /**
         * remove uploaded image
         */
        $scope.removeProfileImage = function() {
            initializeCroppie.croppie('destroy');
            $scope.viewImageViewport = false;
        };

        /**
         * save uploaded image to user database after cropping
         */
        $scope.saveProfileImage = function() {
            if ($scope.viewImageViewport) {
                if (angular.isUndefined($scope.profile)) {
                    $scope.profile = {};
                }
                initializeCroppie.croppie('result', {
                    type: 'canvas',
                    size: 'viewport'
                }).then(function(resp) {
                    var base64Image = resp;
                    var profile = new UserService.saveProfileImage($scope.profile);
                    profile.base64Image = base64Image;
                    profile.$save(function(response) {
                        $scope.profile.profileImage = response.profileImage;
                        $(".profileImage").prop("ng-src", $scope.profile.profileImage + '?' + new Date().valueOf());
                        initializeCroppie.croppie('destroy');
                        $scope.viewImageViewport = false;
                        $scope.profile.base64Image = null;
                        utilityService.flash.success("Profile Updated Successfully");
                        window.location.href = USERS.URL_PATH.USER_PROFILE_MANAGE;
                    }, function(error) {
                        $scope.error = error;
                        utilityService.flash.error("Some error occurs, Please try again");
                    });
                });                
            } else {
                utilityService.flash.error('Please upload profile image');
            }
        };
    }
})();