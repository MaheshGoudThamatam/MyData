'use strict';

angular.module('mean.system', ['ui.router', 'pascalprecht.translate', 'tmh.dynamicLocale', 'slickCarousel', 'duScroll', 'ngAside', 'angularMoment', 'oitozero.ngSweetAlert', 'mwl.calendar'])
    .run(['$rootScope', function ($rootScope) {
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            var toPath = toState.url;
            toPath = toPath.replace(new RegExp('/', 'g'), '');
            toPath = toPath.replace(new RegExp(':', 'g'), '-');
            $rootScope.state = toPath;
            if ($rootScope.state === '') {
                $rootScope.state = 'firstPage';
            }
        });
    }]).config(function (calendarConfig) {
        calendarConfig.dateFormatter = 'moment'; //use either moment or angular to format dates on the calendar. Default angular. Setting this will override any date formats you have already set.
        calendarConfig.showTimesOnWeekView = false; //Make the week view more like the day view, with the caveat that event end times are ignored.

    });
