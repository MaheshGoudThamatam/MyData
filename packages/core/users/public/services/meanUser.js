'use strict';
angular.module('mean.users').factory('MeanUser', ['$rootScope', '$http', '$location', '$stateParams', '$cookies', '$q', '$timeout', '$cookieStore', 'MESSAGES', 'flash', 'COURSE',
    function ($rootScope, $http, $location, $stateParams, $cookies, $q, $timeout, $cookieStore, MESSAGES, flash, COURSE) {

        var self;

        function escape(html) {
            return String(html)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        function b64_to_utf8(str) {
            return decodeURIComponent(escape(window.atob(str)));
        }


        function MeanUserKlass() {
            this.name = 'users';
            this.user = {};
            this.registerForm = false;
            this.loggedin = false;
            this.isAdmin = false;
            this.loginError = 0;
            this.usernameError = null;
            this.registerError = null;
            this.resetpassworderror = null;
            this.validationError = null;
            self = this;
            /*  $http.get('/api/users/me').success(this.onIdentity.bind(this));*/
            $http.get('/api/users/me').success(function (response) {
                if (!response && $cookies.get('token') && $cookies.get('redirect')) {
                    self.onIdentity.bind(self)({
                        token: $cookies.get('token'),
                        redirect: $cookies.get('redirect').replace(/^"|"$/g, '')
                    });
                    $cookies.remove('token');
                    $cookies.remove('redirect');
                } else {
                    self.onIdentity.bind(self)(response);
                }
            });

        }

        MeanUserKlass.prototype.onIdentity = function (response) {
            this.loginError = 0;
            this.loggedin = true;
            this.registerError = 0;
            if (!response) {
                if (!this.user.provider) {
                    this.user = {};
                    this.loggedin = false;
                    this.isAdmin = false;
                }
            } else if (angular.isDefined(response.token)) {
                localStorage.setItem('JWT', response.token);
                var encodedProfile = decodeURI(b64_to_utf8(response.token.split('.')[1]));
                var payload = JSON.parse(encodedProfile);
                this.user = payload;
                this.loggedin = true;
                var destination = $cookies.get('redirect');
                if (this.user.roles.indexOf('admin') !== -1) {
                    this.isAdmin = true;
                }
                $rootScope.$emit('loggedin');
                if (destination) {
                    $location.path(destination.replace(/^"|"$/g, ''));
                    $cookieStore.remove('redirect');
                } else {
                    this.redirection();
                }
            } else {
                this.user = response;
                this.loggedin = true;
                if (this.user.roles.indexOf('admin') !== -1) {
                    this.isAdmin = true;
                }
                $rootScope.$emit('loggedin');
                this.redirection();
            }
        };
        MeanUserKlass.prototype.redirection = function () {
            var enrollCourseIdCookie = $cookies.get('enrollCourseId');
            var locPath = $location.path();
            if ((locPath === "/")
                || (locPath === '/auth/login')) {
                $location.path('/auth/login');
            } else {
                if (this.user && this.loggedin && !this.user.profileUpdated) {
                    $location.path('/profile/edit');
                }
            }
        };

        MeanUserKlass.prototype.onIdFail = function (response) {
            flash.setMessage(response.msg, MESSAGES.ERROR);
            this.registerError = response;
            this.validationError = response.msg;
            this.resetpassworderror = response.msg;
            $rootScope.regsterError = response;
            $rootScope.$emit('loginfailed');
            $rootScope.$emit('registerfailed');
            if (response.errorType && response.errorType === 'login') {
                //$location.path("/auth/login");
            }
        };
        var MeanUser = new MeanUserKlass();
        MeanUserKlass.prototype.login = function (user) {
            // this is an ugly hack due to mean-admin needs
            var destination = $location.path().indexOf('/login') === -1 ? $location.absUrl() : false;
            $http.post('/api/login', {
                email: user.email,
                password: user.password,
                redirect: destination
            }).success(this.onIdentity.bind(this)).error(this.onIdFail.bind(this));
        };
        MeanUserKlass.prototype.register = function (user) {
            $http.post('/api/registeruser', {
                name: user.name,
                username: user.username,
                email: user.email,
                password: user.password,
                confirmPassword: user.confirmPassword,
                userType: user.userType,
                firstName: user.firstName,
                lastName: user.lastName,
                country_user: user.country_user,
                dob: user.dob,
                isMentor: user.isMentor,
                project: user.project

            })
                .success(function (user1) {
                    $cookies.remove('userType');
                    console.log(user);
                    $rootScope.profileSuccessMessage = 'User successfully registerd. In order to continue you need to confirm your email address.';
                    $location.url('/confirm');

                })
                .error(this.onIdFail.bind(this));
        };

        MeanUserKlass.prototype.resetpassword = function (user) {
            $http.post('/api/reset/' + $stateParams.tokenId, {
                password: user.password,
                confirmPassword: user.confirmPassword
            }).success(this.onIdentity.bind(this)).error(this.onIdFail.bind(this));
        };
        MeanUserKlass.prototype.forgotpassword = function (user) {
            $http.post('/api/forgot-password', {
                text: user.email
            }).success(function (response) {
                $rootScope.$emit('forgotmailsent', response);
            }).error(this.onIdFail.bind(this));
        };
        MeanUserKlass.prototype.logout = function () {
            this.user = {};
            this.loggedin = false;
            this.isAdmin = false;
            $http.get('/api/logout').success(function (data) {
                flash.clearMessage();
                $rootScope.$emit('logout');
                localStorage.removeItem('JWT');
            });
        };
        MeanUserKlass.prototype.checkLoggedin = function () {
            var deferred = $q.defer();
            // Make an AJAX call to check if the user is logged in
            $http.get('/api/loggedin').success(function (user) {
                // Authenticated
                if (user !== '0'){
                    $rootScope.$emit('loggedin');
                    $timeout(deferred.resolve);
                }
                // Not Authenticated
                else {
                    $cookies.put('redirect', $location.path());
                    $timeout(deferred.reject);
                    $location.url('/auth/login');
                }
            });
            return deferred.promise;
        };
        MeanUserKlass.prototype.updateProfile = function (user) {
            return $http.put('/api/updateProfile/' + user._id + '?timestamp=' + new Date().getTime(), user);
        };
        MeanUserKlass.prototype.checkLoggedOut = function () {
            // Check if the user is not connected
            // Initialize a new promise
            var deferred = $q.defer();
            // Make an AJAX call to check if the user is logged in
            $http.get('/api/loggedin').success(function (user) {
                // Authenticated
                if (user !== '0') {
                    $timeout(deferred.reject);
                    $location.url('/auth/login');
                }
                // Not Authenticated
                else $timeout(deferred.resolve);
            });
            return deferred.promise;
        };
        MeanUserKlass.prototype.checkAdmin = function () {
            var deferred = $q.defer();
            // Make an AJAX call to check if the user is logged in
            $http.get('/api/loggedin').success(function (user) {
                // Authenticated
                if (user !== '0' && user.roles.indexOf('admin') !== -1) $timeout(deferred.resolve);
                // Not Authenticated or not Admin
                else {
                    $timeout(deferred.reject);
                    $location.url('/auth/login');
                }
            });
            return deferred.promise;
        };
        var tokenWatch = $rootScope.$watch(function () {
            return $cookies.get('token');
        }, function (newVal, oldVal) {
            if (oldVal) {
            }
            if (newVal && newVal !== undefined && newVal !== null && newVal !== '') {
                self.onIdentity({
                    token: $cookies.get('token')
                });
                $cookieStore.remove('token');
                tokenWatch();
            }
        });

        MeanUserKlass.prototype.updateProfile = function (user) {
            return $http.put('/api/updateProfile/' + user._id, user);
        };

        return MeanUser;

    }
])
;
