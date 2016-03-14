'use strict';
angular.module('mean.system').controller('HeaderController', function ($scope, $rootScope, MeanUser, $state, $location, $cookieStore, PROFILE, flash, USERS, MentorprojectService, MESSAGES, MENTOR, $stateParams, SYSTEM, COURSE, $translate, $http, $timeout) {
    $scope.package = {
        name: 'Mentor',
        modelName: 'Mentor'

    };
    $scope.MESSAGES = MESSAGES;
    $scope.SYSTEM = SYSTEM;
    $scope.MENTOR = MENTOR;
    $scope.PROFILE = PROFILE;
    $scope.mentorprojects = MENTOR;
    $scope.flash = flash;
    $scope.apply = "Apply";
    $scope.COURSE = COURSE;
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializeBreadCrum($scope, $scope.package.modelName, SYSTEM.URL_PATH.MENTORSHIP);


    $scope.redirectProfile = function () {
        if ($scope.isScreenLock()) {
            $location.path('/profile/lockScreen');
        }
        if (vm.hdrvars.user && vm.hdrvars.authenticated && !vm.hdrvars.user.profileUpdated && !$scope.isScreenLock()) {
            flash.setMessage("Please complete your profile first.", MESSAGES.ERROR);
            $location.path('/profile/edit');
        }
    };

    $scope.isScreenLock = function () {
        return  angular.isDefined($cookieStore.get('pageLocked')) && $cookieStore.get('pageLocked') == 'true';
    };

    $scope.lockScreen = function () {
        if ($scope.isScreenLock() && $location.path() != '/profile/lockScreen') {
            $location.path('/profile/lockScreen');
        }
    };

    $scope.lockScreen();

    var vm = this;

    var nonAdminPage = ["/", "/auth/login", "/profile/lockScreen", "/auth/register", "/forgot-password"];

    $scope.setLayout = function () {
        $scope.app = {};
        $scope.app.layout = {};
        $scope.app.layout.isNavbarFixed = true;
        $scope.app.layout.isSidebarClosed = false;
        $scope.app.layout.isSidebarFixed = true;
        $scope.app.layout.isFooterFixed = false;
        $scope.app.layout.isBoxedPage = false;
        $scope.app.layout.isAdminPage = false;
    };


    // angular translate
    // ----------------------
    $scope.language = {
        // Handles language dropdown
        listIsOpen: false,
        // list of available languages
        available: {
            'en_US': 'English',
            'it_IT': 'Italiano',
            'de_DE': 'Deutsch'
        },
        // display always the current ui language
        init: function () {
            var proposedLanguage = $translate.proposedLanguage() || $translate.use();
            var preferredLanguage = $translate.preferredLanguage();
            // we know we have set a preferred one in app.config
            $scope.language.selected = $scope.language.available[(proposedLanguage || preferredLanguage)];
        },
        set: function (localeId, ev) {
            $translate.use(localeId);
            $scope.language.selected = $scope.language.available[localeId];
            $scope.language.listIsOpen = !$scope.language.listIsOpen;
        }
    };

    $scope.countryFlag = function (localeId) {
        return "flag-icon-" + localeId.split("_")[1].toLowerCase();
    };


    $scope.language.init();

    vm.hdrvars = {
        authenticated: MeanUser.loggedin,
        user: MeanUser.user,
        isAdmin: MeanUser.isAdmin
    };


    $rootScope.userType = '';
    $scope.isCollapsed = false;

    $rootScope.$on('loggedin', function () {
        $scope.currentuser = angular.copy(MeanUser.user);
        $rootScope.currentUser = $scope.currentuser;
        vm.hdrvars.currentuser = $rootScope.user;
        vm.hdrvars = {
            authenticated: MeanUser.loggedin,
            user: MeanUser.user,
            isAdmin: MeanUser.isAdmin
        };
        $scope.app.layout.isAdminPage = true;
        $scope.features();
        $scope.redirectProfile();
    });

    $rootScope.$on('user', function () {

        vm.hdrvars.user = $rootScope.user;
    });

    vm.logout = function () {
        MeanUser.logout();
    };

    vm.lockScreen = function () {
        $cookieStore.put('pageLocked', 'true');
        $location.path('/profile/lockScreen');
    };

    $rootScope.$on('logout', function () {
        vm.hdrvars = {
            authenticated: false,
            user: {},
            isAdmin: false
        };
        $scope.app.layout.isAdminPage = false;
        $location.path('/auth/login');
    });


    $rootScope.isMentor = false;
    vm.mentorRegisteration = function () {
        $rootScope.isMentor = true;
        $rootScope.isMentorLogin = true;
        $state.go('auth.register');

    };
    vm.studentRegisteration = function () {
        $state.go('auth.register');
    };
    vm.changePassword = function () {
        $location.path('/change-password');
    };

    vm.redirectProfile = function () {
        $location.path(PROFILE.URL_PATH.PROFILEABOUTME);
    };

    $rootScope.$on("messageChanged", function () {
        $scope.currentMessage = flash.getMessage();
        $scope.currentMessageCode = flash.getMessageCode();
        $scope.currentMessageClass = flash.getMessageClass();
    });
    $scope.findMentorProject = function () {
        MentorprojectService.task.query(function (mentorprojects) {
            $scope.mentorprojects = mentorprojects;
        });
    }

    vm.mentorRegisterationBasedOnProject = function (mentorProject) {
        $rootScope.isMentor = true;
        $scope.userMentor = vm.hdrvars.user;
        if ($scope.userMentor) {
            MentorprojectService.isMentor.get({
                userId: $scope.userMentor._id,
                projectId: mentorProject._id
            }, function (user) {
                $scope.mentorUser = user;
            });
        }
        $rootScope.projectId = mentorProject._id;
        $scope.isDisabled = true;
        $scope.apply = 'Applied';
        $state.go('auth.register');
    };

    vm.redirectMentorship = function () {
        $location.path('/mentorship');
    };

    $scope.find = function () {
        $scope.currentPage = 1;
        $scope.currentPageSize = 10;
        var query = {};
        query.page = $scope.currentPage;
        query.pageSize = $scope.currentPageSize;
        $scope.loadPagination(query);
    };

    $scope.redirectdashboard = function () {
        $location.path(MESSAGES.DASHBOARD_URL);
    }
    $scope.success = function () {
        $scope.user = angular.copy(MeanUser.user);
    };
    vm.redirectMentorDetails = function () {
        $scope.userMentor = vm.hdrvars.user;
        if ($scope.userMentor) {
            MentorprojectService.isMentor.get({
                userId: $scope.userMentor._id
            }, function (user) {
                $scope.userMentor = user;
            });
        }
        $location.path(MENTOR.URL_PATH.MENTOR_DETAIL_PAGE);
    };

    $scope.getPageWrapperClass = function (loggedIn) {
        return loggedIn ? "page-wrapper" : "page-wrapperlanding";
    }

    $scope.getPageContentClass = function (loggedIn) {
        return loggedIn ? "content container-fluid content-data inner-margntop" : "page-data content container-fluid content-data";
    }
    vm.mentorProjectDetails = function (index, mentorproject) {
        $rootScope.mentorproject = mentorproject;
        $location.path('/mentor/project/details');
    };
    $scope.detailMentorProject = function () {
        $scope.breadCrumAdd("Details");
    };
    $scope.loadNewMentorship = function () {
        $scope.breadCrumAdd();
    };
    vm.cancelProject = function () {
        $location.path('/mentorship');
    };
    vm.redirectAvailableCourse = function () {
        $location.path(COURSE.URL_PATH.COURSE_LIST);
    };

    $scope.$on('$locationChangeSuccess', function () {
        if (nonAdminPage.indexOf($location.path()) > -1) {
            $scope.app.layout.isAdminPage = false;
        }else{
            $scope.app.layout.isAdminPage = true;
        }

        $timeout(function () {
            $('ul.main-navigation-menu li').each(function (index) {
                if ($(this).parent().hasClass("main-navigation-menu")) {
                    $(this).removeClass("active");
                }
            });
            $(".sub-menu li").each(function (index) {
                if ($(this).hasClass('active') == true) {
                    $(this).parent().parent().addClass("open").addClass("active");
                    $(this).parent().show();
                }
            });
            if ($location.path() == MESSAGES.DASHBOARD_URL) {
                $('ul.main-navigation-menu li:first').addClass("active");
            }
            $scope.redirectProfile();
        }, 1000);
    });
    $scope.$on('$locationChangeStart', function () {
        console.log("ROute Change started");
    });

    $rootScope.$on('PageUnlocked', function () {
        $location.path('/profile/dashboard');
    });


    $scope.features = function () {
        $scope.userFeaturesList = [];
        $scope.categoryList = [];
        $http.get('/api/user/role/' + $scope.currentuser._id).then(function (response) {
            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].feature && !response.data[i].feature.isComponent && response.data[i].feature.featureCategory) {

                    var found = false;
                    for (var j = 0; j < $scope.categoryList.length; j++) {
                        if ($scope.categoryList[j]._id == response.data[i].feature.featureCategory._id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        response.data[i].feature.featureCategory.features = [];
                        $scope.categoryList.push(response.data[i].feature.featureCategory);
                    }
                    found = false;
                    for (var j = 0; j < $scope.categoryList.length; j++) {
                        if ($scope.categoryList[j]._id == response.data[i].feature.featureCategory._id) {
                            addNonDuplicateObjectArray($scope.categoryList[j].features, response.data[i].feature);
                        }
                    }
                }
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
            $rootScope.categoryList = $scope.categoryList;
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


});


