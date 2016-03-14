'use strict';

// $viewPathProvider, to allow overriding system default views
angular.module('mean.system').provider('$viewPath', function () {
    function ViewPathProvider() {
        var overrides = {};

        this.path = function (path) {
            return function () {
                return overrides[path] || path;
            };
        };

        this.override = function (defaultPath, newPath) {
            if (overrides[defaultPath]) {
                throw new Error('View already has an override: ' + defaultPath);
            }
            overrides[defaultPath] = newPath;
            return this;
        };

        this.$get = function () {
            return this;
        };
    }

    return new ViewPathProvider();
});

// $meanStateProvider, provider to wire up $viewPathProvider to $stateProvider
angular.module('mean.system').provider('$meanState', ['$stateProvider', '$viewPathProvider', function ($stateProvider, $viewPathProvider) {
    function MeanStateProvider() {
        this.state = function (stateName, data) {
            if (data.templateUrl) {
                data.templateUrl = $viewPathProvider.path(data.templateUrl);
            }
            $stateProvider.state(stateName, data);
            return this;
        };

        this.$get = function () {
            return this;
        };
    }

    return new MeanStateProvider();
}]);

//Setting up route
angular.module('mean.system').config(['$meanStateProvider', '$urlRouterProvider',
    function ($meanStateProvider, $urlRouterProvider) {
        // For unmatched routes:
        $urlRouterProvider.otherwise("/404");

        // states for my app
        $meanStateProvider
            .state('home', {
                url: '/',
                templateUrl: 'system/views/index.html'
            })
            .state('mentorship', {
                url: '/mentorship',
                templateUrl: 'system/views/mentorship.html'
            })
            .state('mentor project details', {
                url: '/mentor/project/details',
                templateUrl: 'system/views/mentor_project_details.html'
            })
            .state('404', {
                url: '/404',
                templateUrl:  'system/views/404.html',
                controller: '404'
            });

    }
]).config(['$locationProvider',
    function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
]);
