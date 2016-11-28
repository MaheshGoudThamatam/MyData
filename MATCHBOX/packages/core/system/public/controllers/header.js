'use strict';


angular.module('mean.system', []).controller('HeaderController', ['$scope', '$rootScope', 'Menus', 'MeanUser', '$state', '$location', 'USERS', '$http', 'flash', 'RoleService', 'URLFactory', 'USERPROFILE','NotificationService','$interval','$cookies','BOOKING',
    function ($scope, $rootScope, Menus, MeanUser, $state, $location, USERS, $http, flash, RoleService, URLFactory, USERPROFILE,NotificationService,$interval,$cookies, BOOKING) {

        var vm = this;
        var notificationInterval = undefined;
        
        vm.menus = {};
        vm.hdrvars = {
            authenticated: MeanUser.loggedin,
            user: MeanUser.user,
            isAdmin: MeanUser.isAdmin
        };
        $rootScope.$on('$stateChangeStart', 
            function(event, toState, toParams, fromState, fromParams, options){ 
            $('#plugNPlayUserForm').hide();
            $(".modal-backdrop").hide();
            $('.modal').hide();
            $('body').removeClass('modal-open');
        });
        $('html, body').animate({scrollTop: '0px'}, 0);
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $rootScope.state = toState;
            //  Scroll to top function.
            $('html, body').animate({scrollTop: '0px'}, 0);
            
            // Condition to check whether the browser is Internet Explorer and display message.
            if((navigator.userAgent.match(/Trident\/7\./)) && ($(window).width() > 1024)) {
                     toastr.options = {
                        "closeButton": true,
                        "debug": false,
                        "newestOnTop": false,
                        "progressBar": false,
                        "positionClass": "toast-top-full-width",
                        "preventDuplicates": true,
                        "onclick": null,
                        "showDuration": "600000",
                        "hideDuration": "600000",
                        "timeOut": "600000",
                        "extendedTimeOut": "600000",
                        "showEasing": "swing",
                        "hideEasing": "linear",
                        "showMethod": "fadeIn",
                        "hideMethod": "fadeOut"
                    };
                    toastr.warning('This site best viewed in Google Chrome and Mozilla Firefox. Your mileage may vary with other browsers.');
            }
            if ((/Edge/.test(navigator.userAgent)) && ($(window).width() > 1024)) {
                    toastr.options = {
                        "closeButton": true,
                        "debug": false,
                        "newestOnTop": false,
                        "progressBar": false,
                        "positionClass": "toast-top-full-width",
                        "preventDuplicates": true,
                        "onclick": null,
                        "showDuration": "600000",
                        "hideDuration": "600000",
                        "timeOut": "600000",
                        "extendedTimeOut": "600000",
                        "showEasing": "swing",
                        "hideEasing": "linear",
                        "showMethod": "fadeIn",
                        "hideMethod": "fadeOut"
                    };
                    toastr.warning('This site best viewed in Google Chrome and Mozilla Firefox. Your mileage may vary with other browsers.');
            }
        });

        $scope.alerts = [];

        $scope.redirectHome = function () {
            $location.path('/');
        };

        $rootScope.hideFooter = false;
        $rootScope.hideBgImage = false;
        $rootScope.isRedBg = false;
        $rootScope.loggedInUser = MeanUser.user;
       
        $scope.dashboardRedirectionBasedOnRole = function () {
            var loginData = $cookies.get('loginCookie');
            var selectedbookingID = $cookies.get('BookingId');
            var selectedRoom = $cookies.get('searchObject');
            var roomType = $cookies.get('roomType');
            var testRoom;
            if(selectedRoom){
            	testRoom=JSON.parse(selectedRoom);	
            }
            
            RoleService.role.query({}, function (roles) {
                $scope.roles = roles;
                if (angular.isDefined($rootScope.loggedInUser) && $rootScope.loggedInUser) {
                    var found = false;
                    for (var i = 0; i < $rootScope.loggedInUser.role.length; i++) {
                        for (var j = 0; j < $scope.roles.length; j++) {
                            if (JSON.stringify($rootScope.loggedInUser.role[i]._id) === JSON.stringify($scope.roles[j]._id)) {
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
                     if(loginData == 'userLoggingin'){
                             vm.hdrvars = {
                                     authenticated: MeanUser.loggedin,
                                            user: MeanUser.user
                            };
                            $cookies.remove("loginCookie");
                            console.log(roomType);
                            if(roomType && roomType === 'TrainingRoom'){
                            	$location.url('/training/room/'+selectedbookingID+'/bookings'+'?search_lon=' + testRoom.search_lon +'&search_lat=' + testRoom.search_lat + '&capacitymin='+testRoom.capacitymin+ '&capacitymax='+testRoom.capacitymax+ '&start_time='+testRoom.start_time+ '&end_time='+testRoom.end_time +'&roomType='+testRoom.roomType+'&place='+testRoom.place+'&from_date='+testRoom.from_date+'&end_date='+testRoom.end_date+'&timeType='+testRoom.timeType+'&excludeSunday='+testRoom.excludeSunday+'&excludeHoliday='+testRoom.excludeHoliday+'&dateselc='+testRoom.dateselc+'&pageNo='+testRoom.pageNo);
                            } else if(roomType && roomType === 'HotDesk'){
                            	$location.url('/hot-desk/room/'+selectedbookingID+'/bookings'+'?search_lon=' + testRoom.search_lon +'&search_lat=' + testRoom.search_lat + '&capacitymin='+testRoom.capacitymin+ '&capacitymax='+testRoom.capacitymax+ '&start_time='+testRoom.start_time+ '&end_time='+testRoom.end_time +'&roomType='+testRoom.roomType+'&place='+testRoom.place+'&from_date='+testRoom.from_date+'&end_date='+testRoom.end_date+'&timeType='+testRoom.timeType+'&excludeSunday='+testRoom.excludeSunday+'&excludeHoliday='+testRoom.excludeHoliday+'&dateselc='+testRoom.dateselc+'&pageNo='+testRoom.pageNo);
                            } else {
                            	$location.url('/room/'+selectedbookingID+'/bookings'+'?search_lon=' + testRoom.search_lon +'&search_lat=' + testRoom.search_lat + '&capacitymin='+testRoom.capacitymin+ '&capacitymax='+testRoom.capacitymax+ '&start_time='+testRoom.start_time+ '&end_time='+testRoom.end_time +'&roomType='+testRoom.roomType+'&place='+testRoom.place+'&from_date='+testRoom.from_date+'&end_date='+testRoom.end_date+'&timeType='+testRoom.timeType+'&excludeSunday='+testRoom.excludeSunday+'&excludeHoliday='+testRoom.excludeHoliday+'&dateselc='+testRoom.dateselc+'&pageNo='+testRoom.pageNo);
                            } 
                            $cookies.remove("BookingId");
                            found = false;
                        }

                    if (found) {
                        if ($scope.loggedInRole.name.match(/admin/i)) {
                            $scope.isUser = false;
                            $rootScope.loggedInUser.hasRole = 'Admin';
                            $rootScope.loggedInUser.isPartner = false;
                            $scope.dashboardUrl = BOOKING.URL_PATH.ADMINBOOKINGLIST;
                            if (angular.isUndefined($location.search().nord)) {
                                $location.path($scope.dashboardUrl);
                            }
                        } else if ($scope.loggedInRole.name.match(/partner/i)) {
                            $scope.isUser = false;
                            $rootScope.loggedInUser.hasRole = 'Partner';
                            $rootScope.loggedInUser.isPartner = true;
                            $scope.dashboardUrl = BOOKING.URL_PATH.ADMINBOOKINGLIST;
                            if (angular.isUndefined($location.search().nord)) {
                                $location.path($scope.dashboardUrl);
                            }
                        } else if ($scope.loggedInRole.name.match(/backoffice/i)) {
                            $scope.isUser = false;
                            $rootScope.loggedInUser.hasRole = 'BackOffice';
                            $scope.dashboardUrl = BOOKING.URL_PATH.ADMINBOOKINGLIST;
                            if (angular.isUndefined($location.search().nord)) {
                                $location.path($scope.dashboardUrl);
                            }
                        } else if ($scope.loggedInRole.name.match(/frontoffice/i)) {
                            $scope.isUser = false;
                            $rootScope.loggedInUser.hasRole = 'FrontOffice';
                            $scope.dashboardUrl = BOOKING.URL_PATH.ADMINBOOKINGLIST;
                            if (angular.isUndefined($location.search().nord)) {
                                $location.path($scope.dashboardUrl);
                            }
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
                    $scope.responseData = response.data;
                    $scope.leftPanels = [];
                    for (var i = 0; i < $scope.responseData.length; i++) {
                    	$scope.leftPanels.push($scope.responseData[i].feature);
                    }
                    for (var i = 0; i < $scope.leftPanels.length; i++) {
                        if (i > 0 && $scope.leftPanels[i].name.match(/bookings/i)) {
                            $scope.leftPanels[i].activeClass = 'active';
                        } else {
                            $scope.leftPanels[i].activeClass = 'inActive';
                        }
                    }
                    $scope.dashboardRedirectionBasedOnRole();

                }, function (error) {
                    $scope.error = error;
                });

                $http.get('/api/booking/notifyReviews/' + $rootScope.loggedInUser._id).then(function(response) {
                	console.log('Sent request for notifications');
                }, function(err) {
                	$scope.error = error;
                });
            }
        });

        $scope.changeActiveClass = function (leftPanelObj) {
            for (var i = 0; i < $scope.leftPanels.length; i++) {
                if (JSON.stringify($scope.leftPanels[i]._id) === JSON.stringify(leftPanelObj._id)) {
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
             $scope.imageFunc(MeanUser.user.avatar);
            });
            $scope.imageFunc = function(response){
           $scope.image = response;
                         $scope.res = $scope.image.split("upload");
                         $scope.thumbimg = $scope.res[0] + "upload/w_45,h_45,c_thumb" + $scope.res[1];
                         //return $scope.thumbimg;
            }
            


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
             NotificationService.show.get({
                                notificationId : alert._id
                            }, function(notification) {
                                
                            });
             $scope.loadAlert();
            $location.url(alert.url);
        }

        $scope.allNotification=function(){
            $location.path("/notification")
        }
        $scope.redirectPrivacyPolicy = function() {
             $location.path(USERPROFILE.URL_PATH.PRIVACY_POLICY);
        };
        $scope.redirectClose = function() {
             // $location.path('/');
             // location.reload();
             window.history.back();
        };
        $scope.redirectContactUs = function() {
             $location.path(USERPROFILE.URL_PATH.CONTACT_US);
        };
        $scope.redirectToU = function() {
             $location.path(USERPROFILE.URL_PATH.TERMS_OF_USE);
        };
        $scope.redirectAboutUs = function() {
             $location.path(USERPROFILE.URL_PATH.ABOUT_US);
        };

        var currentDate = new Date();
        $scope.currentYear = currentDate.getFullYear();
        $scope.promoCodeRedirect = function() {
            $location.path('/register');
        };
    }
]);