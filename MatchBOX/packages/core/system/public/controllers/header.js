'use strict';


angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', 'Menus', 'MeanUser', '$state', '$location', 'USERS', '$http', 'flash', 'RoleService', 'URLFactory', 'USERPROFILE','NotificationService','$interval','$cookies',
    function ($scope, $rootScope, Menus, MeanUser, $state, $location, USERS, $http, flash, RoleService, URLFactory, USERPROFILE,NotificationService,$interval,$cookies) {


        var vm = this;
        var notificationInterval = undefined;
        
        vm.menus = {};
        vm.hdrvars = {
            authenticated: MeanUser.loggedin,
            user: MeanUser.user,
            isAdmin: MeanUser.isAdmin
        };

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
			$rootScope.state = toState;
		});

        $scope.alerts = [];

        $scope.redirectHome = function () {
            $location.path('/');r
        };

        $rootScope.hideFooter = false;
        $rootScope.hideBgImage = false;
        $rootScope.isRedBg = false;
        $rootScope.loggedInUser = MeanUser.user;

        $scope.dashboardRedirectionBasedOnRole = function () {
            var loginData = $cookies.get('loginCookie');
            var selectedbookingID = $cookies.get('BookingId');
            RoleService.role.query({}, function (roles) {
                $scope.roles = roles;
                if (angular.isDefined($rootScope.loggedInUser) && $rootScope.loggedInUser) {
                    var found = false;
                    for (var i = 0; i < $rootScope.loggedInUser.role.length; i++) {
                        for (var j = 0; j < $scope.roles.length; j++) {
                            if (JSON.stringify($rootScope.loggedInUser.role[i]) === JSON.stringify($scope.roles[j]._id)) {
                                $scope.loggedInRole = $scope.roles[j];
                                found = true;
                                break;
                            }
                        }
                        if (found) {
                            break;
                        }
                    }
                    $scope.isUser = true;
                    console.log("INside header redirect "+found);
                    console.log(loginData);
                     if(loginData == 'userLoggingin'){
                             vm.hdrvars = {
                                     authenticated: MeanUser.loggedin,
                                            user: MeanUser.user
                            };
                            $cookies.remove("loginCookie");
                            console.log("Inside redirection");
                            $location.path('/room/'+selectedbookingID+'/bookings');
                             $cookies.remove("BookingId");
                        }
                    if (found) {
                        if ($scope.loggedInRole.name.match(/partner/i)) {
                            $scope.isUser = false;
                            $rootScope.loggedInUser.hasRole = 'Partner';
                            $rootScope.loggedInUser.isPartner = true;
                            $scope.dashboardUrl = URLFactory.SPACE.URL_PATH.SPACE_LIST;
                            if (angular.isUndefined($location.search().nord)) {
                                $location.path($scope.dashboardUrl);
                            }
                        } else if ($scope.loggedInRole.name.match(/backoffice/i)) {
                            $scope.isUser = false;
                        } else if ($scope.loggedInRole.name.match(/frontoffice/i)) {
                            $scope.isUser = false;
                        } else if ($scope.loggedInRole.name.match(/admin/i)) {
                            $scope.isUser = false;
                            $rootScope.loggedInUser.hasRole = 'Admin';
                            $rootScope.loggedInUser.isPartner = false;
                            $scope.dashboardUrl = URLFactory.SUPERADMIN.URL_PATH.LIST_PARTNERS;
                            if (angular.isUndefined($location.search().nord)) {
                                $location.path($scope.dashboardUrl);
                            }
                        } else {
                            $scope.isUser = true;
                        }
                    }
                }
            });
        };


        $rootScope.$on('loggedin', function () {
            $rootScope.loggedInUser = MeanUser.user;
            if (angular.isDefined($rootScope.loggedInUser)) {
                $http.get('/api/user/role/' + $rootScope.loggedInUser._id).then(function (response) {
                    $scope.leftPanels = response.data;
                    for (var i = 0; i < $scope.leftPanels.length; i++) {
                        if (i > 0) {
                            $scope.leftPanels[i].activeClass = 'inActive';
                        } else {
                            $scope.leftPanels[i].activeClass = 'active';
                        }
                    }
                    $scope.dashboardRedirectionBasedOnRole();

                }, function (error) {
                    $scope.error = error;
                });
            }
        });

        $scope.changeActiveClass = function (index) {
            for (var i = 0; i < $scope.leftPanels.length; i++) {
                if (i === index) {
                    $scope.leftPanels[i].activeClass = 'active';
                } else {
                    $scope.leftPanels[i].activeClass = 'inActive';
                }
            }
        }

        // Default hard coded menu items for main menu

        var defaultMainMenu = [];

        // Query menus added by modules. Only returns menus that user is allowed to see.
        function queryMenu(name, defaultMenu) {

            Menus.query({
                name: name,
                defaultMenu: defaultMenu
            }, function (menu) {
                vm.menus[name] = menu;
            });
        }

        // Query server for menus and check permissions
        queryMenu('main', defaultMainMenu);
        queryMenu('account', []);


        $scope.isCollapsed = false;

        $rootScope.$on('loggedin', function () {
            $scope.currentuser = angular.copy(MeanUser.user);
            queryMenu('main', defaultMainMenu);

            vm.hdrvars = {
                authenticated: MeanUser.loggedin,
                user: MeanUser.user,
                isAdmin: MeanUser.isAdmin
            };
            $scope.user = angular.copy(MeanUser.user);
            $rootScope.user=vm.hdrvars.user;
             $rootScope.$on('Pictureupdated', function () {
                console.log('Pictureupdated');
             $scope.imageFunc(MeanUser.user.avatar);
            });
            $scope.imageFunc = function(response){
                console.log(response);
           $scope.image = response;
                         $scope.res = $scope.image.split("upload");
                         $scope.thumbimg = $scope.res[0] + "upload/w_45,h_45,c_thumb" + $scope.res[1];
                         //return $scope.thumbimg;
                         console.log($scope.thumbimg);
            }
            console.log($scope.resp);
            


            /* if(vm.hdrvars.authenticated && !vm.hdrvars.isAdmin && $scope.user.isPasswordUpdate){
             $rootScope.user = vm.hdrvars.user;
             $location.path(USERS.URL_PATH.CHANGE_PASSWORD);
             }
             else if(vm.hdrvars.authenticated && !vm.hdrvars.isAdmin && !($scope.user.profileUpdated)){
             $rootScope.user = vm.hdrvars.user;
             $location.path(USERPROFILE.URL_PATH.USER_PROFILE.replace(':userId',  $scope.user._id));
             }*/

            $scope.features();

            if(!angular.isUndefined(notificationInterval)) {
            	$interval.cancel(notificationInterval);
            }

            $scope.loadAlert();
        	
        	notificationInterval = $interval($scope.loadAlert,60000);
        });

        vm.logout = function () {
            $rootScope.hideFooter = false;
            $rootScope.hideBgImage = false;
            $rootScope.isRedBg = false;
            MeanUser.logout();
        };

        $rootScope.$on('logout', function () {
            vm.hdrvars = {
                authenticated: false,
                user: {},
                isAdmin: false
            };
            queryMenu('main', defaultMainMenu);
            $state.go('home');
            if(!angular.isUndefined(notificationInterval)) {
            	$interval.cancel(notificationInterval);
            }
        });

        $scope.features = function () {
            $scope.userFeaturesList = [];
            $http.get('/api/user/role/' + $scope.currentuser._id).then(function (response) {
                for (var i = 0; i < response.data.length; i++) {
                    var found = false;
                    for (var j = 0; j < $scope.userFeaturesList.length; j++) {
                        if ($scope.userFeaturesList[j].feature._id == response.data[i].feature._id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        $scope.userFeaturesList.push(response.data[i]);
                    }
                }
                $rootScope.userFeaturesList = $scope.userFeaturesList;
                $rootScope.$emit('permission');
            }, function (error) {
                if (error.data instanceof Array) {
                    $scope.err = error.data;
                } else {
                    $scope.err = [];
                    $scope.err.push(error.data);
                }
            });
        };

        $scope.loadAlert=function(){
            NotificationService.activeAll.query({userId: vm.hdrvars.user._id},function(alerts){
                $scope.alerts=alerts;
            })
        };

        // notificationInterval = $interval($scope.loadAlert,60000);

        $scope.readNotification = function(alert){
        	/*if(alert.title.match(/Space/i).length > 0){
        		var alertDescription = alert.description.split(':');
        		$location.path('/admin/space/' + alertDescription[1] + '/edit');
        	}*/
            $location.path("/notification/"+alert._id+"/show");
        }

        $scope.allNotification=function(){
            $location.path("/notification")
        }

    }
]);