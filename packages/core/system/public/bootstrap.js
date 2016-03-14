'use strict';
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 1.1.2 - 2016-02-01
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.collapse", "ui.bootstrap.accordion", "ui.bootstrap.alert", "ui.bootstrap.buttons", "ui.bootstrap.carousel", "ui.bootstrap.dateparser", "ui.bootstrap.isClass", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.debounce", "ui.bootstrap.dropdown", "ui.bootstrap.stackedMap", "ui.bootstrap.modal", "ui.bootstrap.paging", "ui.bootstrap.pager", "ui.bootstrap.pagination", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.progressbar", "ui.bootstrap.rating", "ui.bootstrap.tabs", "ui.bootstrap.timepicker", "ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["uib/template/accordion/accordion-group.html", "uib/template/accordion/accordion.html", "uib/template/alert/alert.html", "uib/template/carousel/carousel.html", "uib/template/carousel/slide.html", "uib/template/datepicker/datepicker.html", "uib/template/datepicker/day.html", "uib/template/datepicker/month.html", "uib/template/datepicker/popup.html", "uib/template/datepicker/year.html", "uib/template/modal/backdrop.html", "uib/template/modal/window.html", "uib/template/pager/pager.html", "uib/template/pagination/pagination.html", "uib/template/tooltip/tooltip-html-popup.html", "uib/template/tooltip/tooltip-popup.html", "uib/template/tooltip/tooltip-template-popup.html", "uib/template/popover/popover-html.html", "uib/template/popover/popover-template.html", "uib/template/popover/popover.html", "uib/template/progressbar/bar.html", "uib/template/progressbar/progress.html", "uib/template/progressbar/progressbar.html", "uib/template/rating/rating.html", "uib/template/tabs/tab.html", "uib/template/tabs/tabset.html", "uib/template/timepicker/timepicker.html", "uib/template/typeahead/typeahead-match.html", "uib/template/typeahead/typeahead-popup.html"]);
angular.module('ui.bootstrap.collapse', [])

    .directive('uibCollapse', ['$animate', '$q', '$parse', '$injector', function ($animate, $q, $parse, $injector) {
        var $animateCss = $injector.has('$animateCss') ? $injector.get('$animateCss') : null;
        return {
            link: function (scope, element, attrs) {
                var expandingExpr = $parse(attrs.expanding),
                    expandedExpr = $parse(attrs.expanded),
                    collapsingExpr = $parse(attrs.collapsing),
                    collapsedExpr = $parse(attrs.collapsed);

                if (!scope.$eval(attrs.uibCollapse)) {
                    element.addClass('in')
                        .addClass('collapse')
                        .attr('aria-expanded', true)
                        .attr('aria-hidden', false)
                        .css({height: 'auto'});
                }

                function expand() {
                    if (element.hasClass('collapse') && element.hasClass('in')) {
                        return;
                    }

                    $q.resolve(expandingExpr(scope))
                        .then(function () {
                            element.removeClass('collapse')
                                .addClass('collapsing')
                                .attr('aria-expanded', true)
                                .attr('aria-hidden', false);

                            if ($animateCss) {
                                $animateCss(element, {
                                    addClass: 'in',
                                    easing: 'ease',
                                    to: { height: element[0].scrollHeight + 'px' }
                                }).start()['finally'](expandDone);
                            } else {
                                $animate.addClass(element, 'in', {
                                    to: { height: element[0].scrollHeight + 'px' }
                                }).then(expandDone);
                            }
                        });
                }

                function expandDone() {
                    element.removeClass('collapsing')
                        .addClass('collapse')
                        .css({height: 'auto'});
                    expandedExpr(scope);
                }

                function collapse() {
                    if (!element.hasClass('collapse') && !element.hasClass('in')) {
                        return collapseDone();
                    }

                    $q.resolve(collapsingExpr(scope))
                        .then(function () {
                            element
                                // IMPORTANT: The height must be set before adding "collapsing" class.
                                // Otherwise, the browser attempts to animate from height 0 (in
                                // collapsing class) to the given height here.
                                .css({height: element[0].scrollHeight + 'px'})
                                // initially all panel collapse have the collapse class, this removal
                                // prevents the animation from jumping to collapsed state
                                .removeClass('collapse')
                                .addClass('collapsing')
                                .attr('aria-expanded', false)
                                .attr('aria-hidden', true);

                            if ($animateCss) {
                                $animateCss(element, {
                                    removeClass: 'in',
                                    to: {height: '0'}
                                }).start()['finally'](collapseDone);
                            } else {
                                $animate.removeClass(element, 'in', {
                                    to: {height: '0'}
                                }).then(collapseDone);
                            }
                        });
                }

                function collapseDone() {
                    element.css({height: '0'}); // Required so that collapse works when animation is disabled
                    element.removeClass('collapsing')
                        .addClass('collapse');
                    collapsedExpr(scope);
                }

                scope.$watch(attrs.uibCollapse, function (shouldCollapse) {
                    if (shouldCollapse) {
                        collapse();
                    } else {
                        expand();
                    }
                });
            }
        };
    }]);

angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse'])

    .constant('uibAccordionConfig', {
        closeOthers: true
    })

    .controller('UibAccordionController', ['$scope', '$attrs', 'uibAccordionConfig', function ($scope, $attrs, accordionConfig) {
        // This array keeps track of the accordion groups
        this.groups = [];

        // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
        this.closeOthers = function (openGroup) {
            var closeOthers = angular.isDefined($attrs.closeOthers) ?
                $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
            if (closeOthers) {
                angular.forEach(this.groups, function (group) {
                    if (group !== openGroup) {
                        group.isOpen = false;
                    }
                });
            }
        };

        // This is called from the accordion-group directive to add itself to the accordion
        this.addGroup = function (groupScope) {
            var that = this;
            this.groups.push(groupScope);

            groupScope.$on('$destroy', function (event) {
                that.removeGroup(groupScope);
            });
        };

        // This is called from the accordion-group directive when to remove itself
        this.removeGroup = function (group) {
            var index = this.groups.indexOf(group);
            if (index !== -1) {
                this.groups.splice(index, 1);
            }
        };
    }])

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
    .directive('uibAccordion', function () {
        return {
            controller: 'UibAccordionController',
            controllerAs: 'accordion',
            transclude: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/accordion/accordion.html';
            }
        };
    })

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
    .directive('uibAccordionGroup', function () {
        return {
            require: '^uibAccordion',         // We need this directive to be inside an accordion
            transclude: true,              // It transcludes the contents of the directive into the template
            replace: true,                // The element containing the directive will be replaced with the template
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/accordion/accordion-group.html';
            },
            scope: {
                heading: '@',               // Interpolate the heading attribute onto this scope
                isOpen: '=?',
                isDisabled: '=?'
            },
            controller: function () {
                this.setHeading = function (element) {
                    this.heading = element;
                };
            },
            link: function (scope, element, attrs, accordionCtrl) {
                accordionCtrl.addGroup(scope);

                scope.openClass = attrs.openClass || 'panel-open';
                scope.panelClass = attrs.panelClass || 'panel-default';
                scope.$watch('isOpen', function (value) {
                    element.toggleClass(scope.openClass, !!value);
                    if (value) {
                        accordionCtrl.closeOthers(scope);
                    }
                });

                scope.toggleOpen = function ($event) {
                    if (!scope.isDisabled) {
                        if (!$event || $event.which === 32) {
                            scope.isOpen = !scope.isOpen;
                        }
                    }
                };

                var id = 'accordiongroup-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
                scope.headingId = id + '-tab';
                scope.panelId = id + '-panel';
            }
        };
    })

// Use accordion-heading below an accordion-group to provide a heading containing HTML
    .directive('uibAccordionHeading', function () {
        return {
            transclude: true,   // Grab the contents to be used as the heading
            template: '',       // In effect remove this element!
            replace: true,
            require: '^uibAccordionGroup',
            link: function (scope, element, attrs, accordionGroupCtrl, transclude) {
                // Pass the heading to the accordion-group controller
                // so that it can be transcluded into the right place in the template
                // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
                accordionGroupCtrl.setHeading(transclude(scope, angular.noop));
            }
        };
    })

// Use in the accordion-group template to indicate where you want the heading to be transcluded
// You must provide the property on the accordion-group controller that will hold the transcluded element
    .directive('uibAccordionTransclude', function () {
        return {
            require: '^uibAccordionGroup',
            link: function (scope, element, attrs, controller) {
                scope.$watch(function () {
                    return controller[attrs.uibAccordionTransclude];
                }, function (heading) {
                    if (heading) {
                        element.find('span').html('');
                        element.find('span').append(heading);
                    }
                });
            }
        };
    });

angular.module('ui.bootstrap.alert', [])

    .controller('UibAlertController', ['$scope', '$attrs', '$interpolate', '$timeout', function ($scope, $attrs, $interpolate, $timeout) {
        $scope.closeable = !!$attrs.close;

        var dismissOnTimeout = angular.isDefined($attrs.dismissOnTimeout) ?
            $interpolate($attrs.dismissOnTimeout)($scope.$parent) : null;

        if (dismissOnTimeout) {
            $timeout(function () {
                $scope.close();
            }, parseInt(dismissOnTimeout, 10));
        }
    }])

    .directive('uibAlert', function () {
        return {
            controller: 'UibAlertController',
            controllerAs: 'alert',
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/alert/alert.html';
            },
            transclude: true,
            replace: true,
            scope: {
                type: '@',
                close: '&'
            }
        };
    });

angular.module('ui.bootstrap.buttons', [])

    .constant('uibButtonConfig', {
        activeClass: 'active',
        toggleEvent: 'click'
    })

    .controller('UibButtonsController', ['uibButtonConfig', function (buttonConfig) {
        this.activeClass = buttonConfig.activeClass || 'active';
        this.toggleEvent = buttonConfig.toggleEvent || 'click';
    }])

    .directive('uibBtnRadio', ['$parse', function ($parse) {
        return {
            require: ['uibBtnRadio', 'ngModel'],
            controller: 'UibButtonsController',
            controllerAs: 'buttons',
            link: function (scope, element, attrs, ctrls) {
                var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];
                var uncheckableExpr = $parse(attrs.uibUncheckable);

                element.find('input').css({display: 'none'});

                //model -> UI
                ngModelCtrl.$render = function () {
                    element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.uibBtnRadio)));
                };

                //ui->model
                element.on(buttonsCtrl.toggleEvent, function () {
                    if (attrs.disabled) {
                        return;
                    }

                    var isActive = element.hasClass(buttonsCtrl.activeClass);

                    if (!isActive || angular.isDefined(attrs.uncheckable)) {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.uibBtnRadio));
                            ngModelCtrl.$render();
                        });
                    }
                });

                if (attrs.uibUncheckable) {
                    scope.$watch(uncheckableExpr, function (uncheckable) {
                        attrs.$set('uncheckable', uncheckable ? '' : null);
                    });
                }
            }
        };
    }])

    .directive('uibBtnCheckbox', function () {
        return {
            require: ['uibBtnCheckbox', 'ngModel'],
            controller: 'UibButtonsController',
            controllerAs: 'button',
            link: function (scope, element, attrs, ctrls) {
                var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                element.find('input').css({display: 'none'});

                function getTrueValue() {
                    return getCheckboxValue(attrs.btnCheckboxTrue, true);
                }

                function getFalseValue() {
                    return getCheckboxValue(attrs.btnCheckboxFalse, false);
                }

                function getCheckboxValue(attribute, defaultValue) {
                    return angular.isDefined(attribute) ? scope.$eval(attribute) : defaultValue;
                }

                //model -> UI
                ngModelCtrl.$render = function () {
                    element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
                };

                //ui->model
                element.on(buttonsCtrl.toggleEvent, function () {
                    if (attrs.disabled) {
                        return;
                    }

                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
                        ngModelCtrl.$render();
                    });
                });
            }
        };
    });

angular.module('ui.bootstrap.carousel', [])

    .controller('UibCarouselController', ['$scope', '$element', '$interval', '$timeout', '$animate', function ($scope, $element, $interval, $timeout, $animate) {
        var self = this,
            slides = self.slides = $scope.slides = [],
            SLIDE_DIRECTION = 'uib-slideDirection',
            currentIndex = -1,
            currentInterval, isPlaying, bufferedTransitions = [];
        self.currentSlide = null;

        var destroyed = false;

        self.addSlide = function (slide, element) {
            slide.$element = element;
            slides.push(slide);
            //if this is the first slide or the slide is set to active, select it
            if (slides.length === 1 || slide.active) {
                if ($scope.$currentTransition) {
                    $scope.$currentTransition = null;
                }

                self.select(slides[slides.length - 1]);
                if (slides.length === 1) {
                    $scope.play();
                }
            } else {
                slide.active = false;
            }
        };

        self.getCurrentIndex = function () {
            if (self.currentSlide && angular.isDefined(self.currentSlide.index)) {
                return +self.currentSlide.index;
            }
            return currentIndex;
        };

        self.next = $scope.next = function () {
            var newIndex = (self.getCurrentIndex() + 1) % slides.length;

            if (newIndex === 0 && $scope.noWrap()) {
                $scope.pause();
                return;
            }

            return self.select(getSlideByIndex(newIndex), 'next');
        };

        self.prev = $scope.prev = function () {
            var newIndex = self.getCurrentIndex() - 1 < 0 ? slides.length - 1 : self.getCurrentIndex() - 1;

            if ($scope.noWrap() && newIndex === slides.length - 1) {
                $scope.pause();
                return;
            }

            return self.select(getSlideByIndex(newIndex), 'prev');
        };

        self.removeSlide = function (slide) {
            if (angular.isDefined(slide.index)) {
                slides.sort(function (a, b) {
                    return +a.index > +b.index;
                });
            }

            var bufferedIndex = bufferedTransitions.indexOf(slide);
            if (bufferedIndex !== -1) {
                bufferedTransitions.splice(bufferedIndex, 1);
            }
            //get the index of the slide inside the carousel
            var index = slides.indexOf(slide);
            slides.splice(index, 1);
            $timeout(function () {
                if (slides.length > 0 && slide.active) {
                    if (index >= slides.length) {
                        self.select(slides[index - 1]);
                    } else {
                        self.select(slides[index]);
                    }
                } else if (currentIndex > index) {
                    currentIndex--;
                }
            });

            //clean the currentSlide when no more slide
            if (slides.length === 0) {
                self.currentSlide = null;
                clearBufferedTransitions();
            }
        };

        /* direction: "prev" or "next" */
        self.select = $scope.select = function (nextSlide, direction) {
            var nextIndex = $scope.indexOfSlide(nextSlide);
            //Decide direction if it's not given
            if (direction === undefined) {
                direction = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
            }
            //Prevent this user-triggered transition from occurring if there is already one in progress
            if (nextSlide && nextSlide !== self.currentSlide && !$scope.$currentTransition) {
                goNext(nextSlide, nextIndex, direction);
            } else if (nextSlide && nextSlide !== self.currentSlide && $scope.$currentTransition) {
                bufferedTransitions.push(nextSlide);
                nextSlide.active = false;
            }
        };

        /* Allow outside people to call indexOf on slides array */
        $scope.indexOfSlide = function (slide) {
            return angular.isDefined(slide.index) ? +slide.index : slides.indexOf(slide);
        };

        $scope.isActive = function (slide) {
            return self.currentSlide === slide;
        };

        $scope.pause = function () {
            if (!$scope.noPause) {
                isPlaying = false;
                resetTimer();
            }
        };

        $scope.play = function () {
            if (!isPlaying) {
                isPlaying = true;
                restartTimer();
            }
        };

        $scope.$on('$destroy', function () {
            destroyed = true;
            resetTimer();
        });

        $scope.$watch('noTransition', function (noTransition) {
            $animate.enabled($element, !noTransition);
        });

        $scope.$watch('interval', restartTimer);

        $scope.$watchCollection('slides', resetTransition);

        function clearBufferedTransitions() {
            while (bufferedTransitions.length) {
                bufferedTransitions.shift();
            }
        }

        function getSlideByIndex(index) {
            if (angular.isUndefined(slides[index].index)) {
                return slides[index];
            }
            for (var i = 0, l = slides.length; i < l; ++i) {
                if (slides[i].index === index) {
                    return slides[i];
                }
            }
        }

        function goNext(slide, index, direction) {
            if (destroyed) {
                return;
            }

            angular.extend(slide, {direction: direction, active: true});
            angular.extend(self.currentSlide || {}, {direction: direction, active: false});
            if ($animate.enabled($element) && !$scope.$currentTransition &&
                slide.$element && self.slides.length > 1) {
                slide.$element.data(SLIDE_DIRECTION, slide.direction);
                if (self.currentSlide && self.currentSlide.$element) {
                    self.currentSlide.$element.data(SLIDE_DIRECTION, slide.direction);
                }

                $scope.$currentTransition = true;
                $animate.on('addClass', slide.$element, function (element, phase) {
                    if (phase === 'close') {
                        $scope.$currentTransition = null;
                        $animate.off('addClass', element);
                        if (bufferedTransitions.length) {
                            var nextSlide = bufferedTransitions.pop();
                            var nextIndex = $scope.indexOfSlide(nextSlide);
                            var nextDirection = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
                            clearBufferedTransitions();

                            goNext(nextSlide, nextIndex, nextDirection);
                        }
                    }
                });
            }

            self.currentSlide = slide;
            currentIndex = index;

            //every time you change slides, reset the timer
            restartTimer();
        }

        function resetTimer() {
            if (currentInterval) {
                $interval.cancel(currentInterval);
                currentInterval = null;
            }
        }

        function resetTransition(slides) {
            if (!slides.length) {
                $scope.$currentTransition = null;
                clearBufferedTransitions();
            }
        }

        function restartTimer() {
            resetTimer();
            var interval = +$scope.interval;
            if (!isNaN(interval) && interval > 0) {
                currentInterval = $interval(timerFn, interval);
            }
        }

        function timerFn() {
            var interval = +$scope.interval;
            if (isPlaying && !isNaN(interval) && interval > 0 && slides.length) {
                $scope.next();
            } else {
                $scope.pause();
            }
        }
    }])

    .directive('uibCarousel', function () {
        return {
            transclude: true,
            replace: true,
            controller: 'UibCarouselController',
            controllerAs: 'carousel',
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/carousel/carousel.html';
            },
            scope: {
                interval: '=',
                noTransition: '=',
                noPause: '=',
                noWrap: '&'
            }
        };
    })

    .directive('uibSlide', function () {
        return {
            require: '^uibCarousel',
            transclude: true,
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/carousel/slide.html';
            },
            scope: {
                active: '=?',
                actual: '=?',
                index: '=?'
            },
            link: function (scope, element, attrs, carouselCtrl) {
                carouselCtrl.addSlide(scope, element);
                //when the scope is destroyed then remove the slide from the current slides array
                scope.$on('$destroy', function () {
                    carouselCtrl.removeSlide(scope);
                });

                scope.$watch('active', function (active) {
                    if (active) {
                        carouselCtrl.select(scope);
                    }
                });
            }
        };
    })

    .animation('.item', ['$animateCss',
        function ($animateCss) {
            var SLIDE_DIRECTION = 'uib-slideDirection';

            function removeClass(element, className, callback) {
                element.removeClass(className);
                if (callback) {
                    callback();
                }
            }

            return {
                beforeAddClass: function (element, className, done) {
                    if (className === 'active') {
                        var stopped = false;
                        var direction = element.data(SLIDE_DIRECTION);
                        var directionClass = direction === 'next' ? 'left' : 'right';
                        var removeClassFn = removeClass.bind(this, element,
                                directionClass + ' ' + direction, done);
                        element.addClass(direction);

                        $animateCss(element, {addClass: directionClass})
                            .start()
                            .done(removeClassFn);

                        return function () {
                            stopped = true;
                        };
                    }
                    done();
                },
                beforeRemoveClass: function (element, className, done) {
                    if (className === 'active') {
                        var stopped = false;
                        var direction = element.data(SLIDE_DIRECTION);
                        var directionClass = direction === 'next' ? 'left' : 'right';
                        var removeClassFn = removeClass.bind(this, element, directionClass, done);

                        $animateCss(element, {addClass: directionClass})
                            .start()
                            .done(removeClassFn);

                        return function () {
                            stopped = true;
                        };
                    }
                    done();
                }
            };
        }]);

angular.module('ui.bootstrap.dateparser', [])

    .service('uibDateParser', ['$log', '$locale', 'dateFilter', 'orderByFilter', function ($log, $locale, dateFilter, orderByFilter) {
        // Pulled from https://github.com/mbostock/d3/blob/master/src/format/requote.js
        var SPECIAL_CHARACTERS_REGEXP = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

        var localeId;
        var formatCodeToRegex;

        this.init = function () {
            localeId = $locale.id;

            this.parsers = {};
            this.formatters = {};

            formatCodeToRegex = [
                {
                    key: 'yyyy',
                    regex: '\\d{4}',
                    apply: function (value) {
                        this.year = +value;
                    },
                    formatter: function (date) {
                        var _date = new Date();
                        _date.setFullYear(Math.abs(date.getFullYear()));
                        return dateFilter(_date, 'yyyy');
                    }
                },
                {
                    key: 'yy',
                    regex: '\\d{2}',
                    apply: function (value) {
                        this.year = +value + 2000;
                    },
                    formatter: function (date) {
                        var _date = new Date();
                        _date.setFullYear(Math.abs(date.getFullYear()));
                        return dateFilter(_date, 'yy');
                    }
                },
                {
                    key: 'y',
                    regex: '\\d{1,4}',
                    apply: function (value) {
                        this.year = +value;
                    },
                    formatter: function (date) {
                        var _date = new Date();
                        _date.setFullYear(Math.abs(date.getFullYear()));
                        return dateFilter(_date, 'y');
                    }
                },
                {
                    key: 'M!',
                    regex: '0?[1-9]|1[0-2]',
                    apply: function (value) {
                        this.month = value - 1;
                    },
                    formatter: function (date) {
                        var value = date.getMonth();
                        if (/^[0-9]$/.test(value)) {
                            return dateFilter(date, 'MM');
                        }

                        return dateFilter(date, 'M');
                    }
                },
                {
                    key: 'MMMM',
                    regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
                    apply: function (value) {
                        this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value);
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'MMMM');
                    }
                },
                {
                    key: 'MMM',
                    regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
                    apply: function (value) {
                        this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value);
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'MMM');
                    }
                },
                {
                    key: 'MM',
                    regex: '0[1-9]|1[0-2]',
                    apply: function (value) {
                        this.month = value - 1;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'MM');
                    }
                },
                {
                    key: 'M',
                    regex: '[1-9]|1[0-2]',
                    apply: function (value) {
                        this.month = value - 1;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'M');
                    }
                },
                {
                    key: 'd!',
                    regex: '[0-2]?[0-9]{1}|3[0-1]{1}',
                    apply: function (value) {
                        this.date = +value;
                    },
                    formatter: function (date) {
                        var value = date.getDate();
                        if (/^[1-9]$/.test(value)) {
                            return dateFilter(date, 'dd');
                        }

                        return dateFilter(date, 'd');
                    }
                },
                {
                    key: 'dd',
                    regex: '[0-2][0-9]{1}|3[0-1]{1}',
                    apply: function (value) {
                        this.date = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'dd');
                    }
                },
                {
                    key: 'd',
                    regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
                    apply: function (value) {
                        this.date = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'd');
                    }
                },
                {
                    key: 'EEEE',
                    regex: $locale.DATETIME_FORMATS.DAY.join('|'),
                    formatter: function (date) {
                        return dateFilter(date, 'EEEE');
                    }
                },
                {
                    key: 'EEE',
                    regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
                    formatter: function (date) {
                        return dateFilter(date, 'EEE');
                    }
                },
                {
                    key: 'HH',
                    regex: '(?:0|1)[0-9]|2[0-3]',
                    apply: function (value) {
                        this.hours = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'HH');
                    }
                },
                {
                    key: 'hh',
                    regex: '0[0-9]|1[0-2]',
                    apply: function (value) {
                        this.hours = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'hh');
                    }
                },
                {
                    key: 'H',
                    regex: '1?[0-9]|2[0-3]',
                    apply: function (value) {
                        this.hours = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'H');
                    }
                },
                {
                    key: 'h',
                    regex: '[0-9]|1[0-2]',
                    apply: function (value) {
                        this.hours = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'h');
                    }
                },
                {
                    key: 'mm',
                    regex: '[0-5][0-9]',
                    apply: function (value) {
                        this.minutes = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'mm');
                    }
                },
                {
                    key: 'm',
                    regex: '[0-9]|[1-5][0-9]',
                    apply: function (value) {
                        this.minutes = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'm');
                    }
                },
                {
                    key: 'sss',
                    regex: '[0-9][0-9][0-9]',
                    apply: function (value) {
                        this.milliseconds = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'sss');
                    }
                },
                {
                    key: 'ss',
                    regex: '[0-5][0-9]',
                    apply: function (value) {
                        this.seconds = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'ss');
                    }
                },
                {
                    key: 's',
                    regex: '[0-9]|[1-5][0-9]',
                    apply: function (value) {
                        this.seconds = +value;
                    },
                    formatter: function (date) {
                        return dateFilter(date, 's');
                    }
                },
                {
                    key: 'a',
                    regex: $locale.DATETIME_FORMATS.AMPMS.join('|'),
                    apply: function (value) {
                        if (this.hours === 12) {
                            this.hours = 0;
                        }

                        if (value === 'PM') {
                            this.hours += 12;
                        }
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'a');
                    }
                },
                {
                    key: 'Z',
                    regex: '[+-]\\d{4}',
                    apply: function (value) {
                        var matches = value.match(/([+-])(\d{2})(\d{2})/),
                            sign = matches[1],
                            hours = matches[2],
                            minutes = matches[3];
                        this.hours += toInt(sign + hours);
                        this.minutes += toInt(sign + minutes);
                    },
                    formatter: function (date) {
                        return dateFilter(date, 'Z');
                    }
                },
                {
                    key: 'ww',
                    regex: '[0-4][0-9]|5[0-3]',
                    formatter: function (date) {
                        return dateFilter(date, 'ww');
                    }
                },
                {
                    key: 'w',
                    regex: '[0-9]|[1-4][0-9]|5[0-3]',
                    formatter: function (date) {
                        return dateFilter(date, 'w');
                    }
                },
                {
                    key: 'GGGG',
                    regex: $locale.DATETIME_FORMATS.ERANAMES.join('|').replace(/\s/g, '\\s'),
                    formatter: function (date) {
                        return dateFilter(date, 'GGGG');
                    }
                },
                {
                    key: 'GGG',
                    regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
                    formatter: function (date) {
                        return dateFilter(date, 'GGG');
                    }
                },
                {
                    key: 'GG',
                    regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
                    formatter: function (date) {
                        return dateFilter(date, 'GG');
                    }
                },
                {
                    key: 'G',
                    regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
                    formatter: function (date) {
                        return dateFilter(date, 'G');
                    }
                }
            ];
        };

        this.init();

        function createParser(format, func) {
            var map = [], regex = format.split('');

            // check for literal values
            var quoteIndex = format.indexOf('\'');
            if (quoteIndex > -1) {
                var inLiteral = false;
                format = format.split('');
                for (var i = quoteIndex; i < format.length; i++) {
                    if (inLiteral) {
                        if (format[i] === '\'') {
                            if (i + 1 < format.length && format[i + 1] === '\'') { // escaped single quote
                                format[i + 1] = '$';
                                regex[i + 1] = '';
                            } else { // end of literal
                                regex[i] = '';
                                inLiteral = false;
                            }
                        }
                        format[i] = '$';
                    } else {
                        if (format[i] === '\'') { // start of literal
                            format[i] = '$';
                            regex[i] = '';
                            inLiteral = true;
                        }
                    }
                }

                format = format.join('');
            }

            angular.forEach(formatCodeToRegex, function (data) {
                var index = format.indexOf(data.key);

                if (index > -1) {
                    format = format.split('');

                    regex[index] = '(' + data.regex + ')';
                    format[index] = '$'; // Custom symbol to define consumed part of format
                    for (var i = index + 1, n = index + data.key.length; i < n; i++) {
                        regex[i] = '';
                        format[i] = '$';
                    }
                    format = format.join('');

                    map.push({
                        index: index,
                        key: data.key,
                        apply: data[func],
                        matcher: data.regex
                    });
                }
            });

            return {
                regex: new RegExp('^' + regex.join('') + '$'),
                map: orderByFilter(map, 'index')
            };
        }

        this.filter = function (date, format) {
            if (!angular.isDate(date) || isNaN(date) || !format) {
                return '';
            }

            format = $locale.DATETIME_FORMATS[format] || format;

            if ($locale.id !== localeId) {
                this.init();
            }

            if (!this.formatters[format]) {
                this.formatters[format] = createParser(format, 'formatter');
            }

            var parser = this.formatters[format],
                map = parser.map;

            var _format = format;

            return map.reduce(function (str, mapper, i) {
                var match = _format.match(new RegExp('(.*)' + mapper.key));
                if (match && angular.isString(match[1])) {
                    str += match[1];
                    _format = _format.replace(match[1] + mapper.key, '');
                }

                if (mapper.apply) {
                    return str + mapper.apply.call(null, date);
                }

                return str;
            }, '');
        };

        this.parse = function (input, format, baseDate) {
            if (!angular.isString(input) || !format) {
                return input;
            }

            format = $locale.DATETIME_FORMATS[format] || format;
            format = format.replace(SPECIAL_CHARACTERS_REGEXP, '\\$&');

            if ($locale.id !== localeId) {
                this.init();
            }

            if (!this.parsers[format]) {
                this.parsers[format] = createParser(format, 'apply');
            }

            var parser = this.parsers[format],
                regex = parser.regex,
                map = parser.map,
                results = input.match(regex),
                tzOffset = false;
            if (results && results.length) {
                var fields, dt;
                if (angular.isDate(baseDate) && !isNaN(baseDate.getTime())) {
                    fields = {
                        year: baseDate.getFullYear(),
                        month: baseDate.getMonth(),
                        date: baseDate.getDate(),
                        hours: baseDate.getHours(),
                        minutes: baseDate.getMinutes(),
                        seconds: baseDate.getSeconds(),
                        milliseconds: baseDate.getMilliseconds()
                    };
                } else {
                    if (baseDate) {
                        $log.warn('dateparser:', 'baseDate is not a valid date');
                    }
                    fields = { year: 1900, month: 0, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
                }

                for (var i = 1, n = results.length; i < n; i++) {
                    var mapper = map[i - 1];
                    if (mapper.matcher === 'Z') {
                        tzOffset = true;
                    }

                    if (mapper.apply) {
                        mapper.apply.call(fields, results[i]);
                    }
                }

                var datesetter = tzOffset ? Date.prototype.setUTCFullYear :
                    Date.prototype.setFullYear;
                var timesetter = tzOffset ? Date.prototype.setUTCHours :
                    Date.prototype.setHours;

                if (isValid(fields.year, fields.month, fields.date)) {
                    if (angular.isDate(baseDate) && !isNaN(baseDate.getTime()) && !tzOffset) {
                        dt = new Date(baseDate);
                        datesetter.call(dt, fields.year, fields.month, fields.date);
                        timesetter.call(dt, fields.hours, fields.minutes,
                            fields.seconds, fields.milliseconds);
                    } else {
                        dt = new Date(0);
                        datesetter.call(dt, fields.year, fields.month, fields.date);
                        timesetter.call(dt, fields.hours || 0, fields.minutes || 0,
                                fields.seconds || 0, fields.milliseconds || 0);
                    }
                }

                return dt;
            }
        };

        // Check if date is valid for specific month (and year for February).
        // Month: 0 = Jan, 1 = Feb, etc
        function isValid(year, month, date) {
            if (date < 1) {
                return false;
            }

            if (month === 1 && date > 28) {
                return date === 29 && (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0);
            }

            if (month === 3 || month === 5 || month === 8 || month === 10) {
                return date < 31;
            }

            return true;
        }

        function toInt(str) {
            return parseInt(str, 10);
        }

        this.toTimezone = toTimezone;
        this.fromTimezone = fromTimezone;
        this.timezoneToOffset = timezoneToOffset;
        this.addDateMinutes = addDateMinutes;
        this.convertTimezoneToLocal = convertTimezoneToLocal;

        function toTimezone(date, timezone) {
            return date && timezone ? convertTimezoneToLocal(date, timezone) : date;
        }

        function fromTimezone(date, timezone) {
            return date && timezone ? convertTimezoneToLocal(date, timezone, true) : date;
        }

        //https://github.com/angular/angular.js/blob/4daafd3dbe6a80d578f5a31df1bb99c77559543e/src/Angular.js#L1207
        function timezoneToOffset(timezone, fallback) {
            var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
            return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
        }

        function addDateMinutes(date, minutes) {
            date = new Date(date.getTime());
            date.setMinutes(date.getMinutes() + minutes);
            return date;
        }

        function convertTimezoneToLocal(date, timezone, reverse) {
            reverse = reverse ? -1 : 1;
            var timezoneOffset = timezoneToOffset(timezone, date.getTimezoneOffset());
            return addDateMinutes(date, reverse * (timezoneOffset - date.getTimezoneOffset()));
        }
    }]);

// Avoiding use of ng-class as it creates a lot of watchers when a class is to be applied to
// at most one element.
angular.module('ui.bootstrap.isClass', [])
    .directive('uibIsClass', [
        '$animate',
        function ($animate) {
            //                    11111111          22222222
            var ON_REGEXP = /^\s*([\s\S]+?)\s+on\s+([\s\S]+?)\s*$/;
            //                    11111111           22222222
            var IS_REGEXP = /^\s*([\s\S]+?)\s+for\s+([\s\S]+?)\s*$/;

            var dataPerTracked = {};

            return {
                restrict: 'A',
                compile: function (tElement, tAttrs) {
                    var linkedScopes = [];
                    var instances = [];
                    var expToData = {};
                    var lastActivated = null;
                    var onExpMatches = tAttrs.uibIsClass.match(ON_REGEXP);
                    var onExp = onExpMatches[2];
                    var expsStr = onExpMatches[1];
                    var exps = expsStr.split(',');

                    return linkFn;

                    function linkFn(scope, element, attrs) {
                        linkedScopes.push(scope);
                        instances.push({
                            scope: scope,
                            element: element
                        });

                        exps.forEach(function (exp, k) {
                            addForExp(exp, scope);
                        });

                        scope.$on('$destroy', removeScope);
                    }

                    function addForExp(exp, scope) {
                        var matches = exp.match(IS_REGEXP);
                        var clazz = scope.$eval(matches[1]);
                        var compareWithExp = matches[2];
                        var data = expToData[exp];
                        if (!data) {
                            var watchFn = function (compareWithVal) {
                                var newActivated = null;
                                instances.some(function (instance) {
                                    var thisVal = instance.scope.$eval(onExp);
                                    if (thisVal === compareWithVal) {
                                        newActivated = instance;
                                        return true;
                                    }
                                });
                                if (data.lastActivated !== newActivated) {
                                    if (data.lastActivated) {
                                        $animate.removeClass(data.lastActivated.element, clazz);
                                    }
                                    if (newActivated) {
                                        $animate.addClass(newActivated.element, clazz);
                                    }
                                    data.lastActivated = newActivated;
                                }
                            };
                            expToData[exp] = data = {
                                lastActivated: null,
                                scope: scope,
                                watchFn: watchFn,
                                compareWithExp: compareWithExp,
                                watcher: scope.$watch(compareWithExp, watchFn)
                            };
                        }
                        data.watchFn(scope.$eval(compareWithExp));
                    }

                    function removeScope(e) {
                        var removedScope = e.targetScope;
                        var index = linkedScopes.indexOf(removedScope);
                        linkedScopes.splice(index, 1);
                        instances.splice(index, 1);
                        if (linkedScopes.length) {
                            var newWatchScope = linkedScopes[0];
                            angular.forEach(expToData, function (data) {
                                if (data.scope === removedScope) {
                                    data.watcher = newWatchScope.$watch(data.compareWithExp, data.watchFn);
                                    data.scope = newWatchScope;
                                }
                            });
                        }
                        else {
                            expToData = {};
                        }
                    }
                }
            };
        }]);
angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods for working with the DOM.
 * It is meant to be used where we need to absolute-position elements in
 * relation to another element (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
    .factory('$uibPosition', ['$document', '$window', function ($document, $window) {
        /**
         * Used by scrollbarWidth() function to cache scrollbar's width.
         * Do not access this variable directly, use scrollbarWidth() instead.
         */
        var SCROLLBAR_WIDTH;
        var OVERFLOW_REGEX = {
            normal: /(auto|scroll)/,
            hidden: /(auto|scroll|hidden)/
        };
        var PLACEMENT_REGEX = {
            auto: /\s?auto?\s?/i,
            primary: /^(top|bottom|left|right)$/,
            secondary: /^(top|bottom|left|right|center)$/,
            vertical: /^(top|bottom)$/
        };

        return {

            /**
             * Provides a raw DOM element from a jQuery/jQLite element.
             *
             * @param {element} elem - The element to convert.
             *
             * @returns {element} A HTML element.
             */
            getRawNode: function (elem) {
                return elem[0] || elem;
            },

            /**
             * Provides a parsed number for a style property.  Strips
             * units and casts invalid numbers to 0.
             *
             * @param {string} value - The style value to parse.
             *
             * @returns {number} A valid number.
             */
            parseStyle: function (value) {
                value = parseFloat(value);
                return isFinite(value) ? value : 0;
            },

            /**
             * Provides the closest positioned ancestor.
             *
             * @param {element} element - The element to get the offest parent for.
             *
             * @returns {element} The closest positioned ancestor.
             */
            offsetParent: function (elem) {
                elem = this.getRawNode(elem);

                var offsetParent = elem.offsetParent || $document[0].documentElement;

                function isStaticPositioned(el) {
                    return ($window.getComputedStyle(el).position || 'static') === 'static';
                }

                while (offsetParent && offsetParent !== $document[0].documentElement && isStaticPositioned(offsetParent)) {
                    offsetParent = offsetParent.offsetParent;
                }

                return offsetParent || $document[0].documentElement;
            },

            /**
             * Provides the scrollbar width, concept from TWBS measureScrollbar()
             * function in https://github.com/twbs/bootstrap/blob/master/js/modal.js
             *
             * @returns {number} The width of the browser scollbar.
             */
            scrollbarWidth: function () {
                if (angular.isUndefined(SCROLLBAR_WIDTH)) {
                    var scrollElem = angular.element('<div style="position: absolute; top: -9999px; width: 50px; height: 50px; overflow: scroll;"></div>');
                    $document.find('body').append(scrollElem);
                    SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
                    SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
                    scrollElem.remove();
                }

                return SCROLLBAR_WIDTH;
            },

            /**
             * Provides the closest scrollable ancestor.
             * A port of the jQuery UI scrollParent method:
             * https://github.com/jquery/jquery-ui/blob/master/ui/scroll-parent.js
             *
             * @param {element} elem - The element to find the scroll parent of.
             * @param {boolean=} [includeHidden=false] - Should scroll style of 'hidden' be considered,
             *   default is false.
             *
             * @returns {element} A HTML element.
             */
            scrollParent: function (elem, includeHidden) {
                elem = this.getRawNode(elem);

                var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
                var documentEl = $document[0].documentElement;
                var elemStyle = $window.getComputedStyle(elem);
                var excludeStatic = elemStyle.position === 'absolute';
                var scrollParent = elem.parentElement || documentEl;

                if (scrollParent === documentEl || elemStyle.position === 'fixed') {
                    return documentEl;
                }

                while (scrollParent.parentElement && scrollParent !== documentEl) {
                    var spStyle = $window.getComputedStyle(scrollParent);
                    if (excludeStatic && spStyle.position !== 'static') {
                        excludeStatic = false;
                    }

                    if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
                        break;
                    }
                    scrollParent = scrollParent.parentElement;
                }

                return scrollParent;
            },

            /**
             * Provides read-only equivalent of jQuery's position function:
             * http://api.jquery.com/position/ - distance to closest positioned
             * ancestor.  Does not account for margins by default like jQuery position.
             *
             * @param {element} elem - The element to caclulate the position on.
             * @param {boolean=} [includeMargins=false] - Should margins be accounted
             * for, default is false.
             *
             * @returns {object} An object with the following properties:
             *   <ul>
             *     <li>**width**: the width of the element</li>
             *     <li>**height**: the height of the element</li>
             *     <li>**top**: distance to top edge of offset parent</li>
             *     <li>**left**: distance to left edge of offset parent</li>
             *   </ul>
             */
            position: function (elem, includeMagins) {
                elem = this.getRawNode(elem);

                var elemOffset = this.offset(elem);
                if (includeMagins) {
                    var elemStyle = $window.getComputedStyle(elem);
                    elemOffset.top -= this.parseStyle(elemStyle.marginTop);
                    elemOffset.left -= this.parseStyle(elemStyle.marginLeft);
                }
                var parent = this.offsetParent(elem);
                var parentOffset = {top: 0, left: 0};

                if (parent !== $document[0].documentElement) {
                    parentOffset = this.offset(parent);
                    parentOffset.top += parent.clientTop - parent.scrollTop;
                    parentOffset.left += parent.clientLeft - parent.scrollLeft;
                }

                return {
                    width: Math.round(angular.isNumber(elemOffset.width) ? elemOffset.width : elem.offsetWidth),
                    height: Math.round(angular.isNumber(elemOffset.height) ? elemOffset.height : elem.offsetHeight),
                    top: Math.round(elemOffset.top - parentOffset.top),
                    left: Math.round(elemOffset.left - parentOffset.left)
                };
            },

            /**
             * Provides read-only equivalent of jQuery's offset function:
             * http://api.jquery.com/offset/ - distance to viewport.  Does
             * not account for borders, margins, or padding on the body
             * element.
             *
             * @param {element} elem - The element to calculate the offset on.
             *
             * @returns {object} An object with the following properties:
             *   <ul>
             *     <li>**width**: the width of the element</li>
             *     <li>**height**: the height of the element</li>
             *     <li>**top**: distance to top edge of viewport</li>
             *     <li>**right**: distance to bottom edge of viewport</li>
             *   </ul>
             */
            offset: function (elem) {
                elem = this.getRawNode(elem);

                var elemBCR = elem.getBoundingClientRect();
                return {
                    width: Math.round(angular.isNumber(elemBCR.width) ? elemBCR.width : elem.offsetWidth),
                    height: Math.round(angular.isNumber(elemBCR.height) ? elemBCR.height : elem.offsetHeight),
                    top: Math.round(elemBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)),
                    left: Math.round(elemBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft))
                };
            },

            /**
             * Provides offset distance to the closest scrollable ancestor
             * or viewport.  Accounts for border and scrollbar width.
             *
             * Right and bottom dimensions represent the distance to the
             * respective edge of the viewport element.  If the element
             * edge extends beyond the viewport, a negative value will be
             * reported.
             *
             * @param {element} elem - The element to get the viewport offset for.
             * @param {boolean=} [useDocument=false] - Should the viewport be the document element instead
             * of the first scrollable element, default is false.
             * @param {boolean=} [includePadding=true] - Should the padding on the offset parent element
             * be accounted for, default is true.
             *
             * @returns {object} An object with the following properties:
             *   <ul>
             *     <li>**top**: distance to the top content edge of viewport element</li>
             *     <li>**bottom**: distance to the bottom content edge of viewport element</li>
             *     <li>**left**: distance to the left content edge of viewport element</li>
             *     <li>**right**: distance to the right content edge of viewport element</li>
             *   </ul>
             */
            viewportOffset: function (elem, useDocument, includePadding) {
                elem = this.getRawNode(elem);
                includePadding = includePadding !== false ? true : false;

                var elemBCR = elem.getBoundingClientRect();
                var offsetBCR = {top: 0, left: 0, bottom: 0, right: 0};

                var offsetParent = useDocument ? $document[0].documentElement : this.scrollParent(elem);
                var offsetParentBCR = offsetParent.getBoundingClientRect();

                offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
                offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;
                if (offsetParent === $document[0].documentElement) {
                    offsetBCR.top += $window.pageYOffset;
                    offsetBCR.left += $window.pageXOffset;
                }
                offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
                offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;

                if (includePadding) {
                    var offsetParentStyle = $window.getComputedStyle(offsetParent);
                    offsetBCR.top += this.parseStyle(offsetParentStyle.paddingTop);
                    offsetBCR.bottom -= this.parseStyle(offsetParentStyle.paddingBottom);
                    offsetBCR.left += this.parseStyle(offsetParentStyle.paddingLeft);
                    offsetBCR.right -= this.parseStyle(offsetParentStyle.paddingRight);
                }

                return {
                    top: Math.round(elemBCR.top - offsetBCR.top),
                    bottom: Math.round(offsetBCR.bottom - elemBCR.bottom),
                    left: Math.round(elemBCR.left - offsetBCR.left),
                    right: Math.round(offsetBCR.right - elemBCR.right)
                };
            },

            /**
             * Provides an array of placement values parsed from a placement string.
             * Along with the 'auto' indicator, supported placement strings are:
             *   <ul>
             *     <li>top: element on top, horizontally centered on host element.</li>
             *     <li>top-left: element on top, left edge aligned with host element left edge.</li>
             *     <li>top-right: element on top, lerightft edge aligned with host element right edge.</li>
             *     <li>bottom: element on bottom, horizontally centered on host element.</li>
             *     <li>bottom-left: element on bottom, left edge aligned with host element left edge.</li>
             *     <li>bottom-right: element on bottom, right edge aligned with host element right edge.</li>
             *     <li>left: element on left, vertically centered on host element.</li>
             *     <li>left-top: element on left, top edge aligned with host element top edge.</li>
             *     <li>left-bottom: element on left, bottom edge aligned with host element bottom edge.</li>
             *     <li>right: element on right, vertically centered on host element.</li>
             *     <li>right-top: element on right, top edge aligned with host element top edge.</li>
             *     <li>right-bottom: element on right, bottom edge aligned with host element bottom edge.</li>
             *   </ul>
             * A placement string with an 'auto' indicator is expected to be
             * space separated from the placement, i.e: 'auto bottom-left'  If
             * the primary and secondary placement values do not match 'top,
             * bottom, left, right' then 'top' will be the primary placement and
             * 'center' will be the secondary placement.  If 'auto' is passed, true
             * will be returned as the 3rd value of the array.
             *
             * @param {string} placement - The placement string to parse.
             *
             * @returns {array} An array with the following values
             * <ul>
             *   <li>**[0]**: The primary placement.</li>
             *   <li>**[1]**: The secondary placement.</li>
             *   <li>**[2]**: If auto is passed: true, else undefined.</li>
             * </ul>
             */
            parsePlacement: function (placement) {
                var autoPlace = PLACEMENT_REGEX.auto.test(placement);
                if (autoPlace) {
                    placement = placement.replace(PLACEMENT_REGEX.auto, '');
                }

                placement = placement.split('-');

                placement[0] = placement[0] || 'top';
                if (!PLACEMENT_REGEX.primary.test(placement[0])) {
                    placement[0] = 'top';
                }

                placement[1] = placement[1] || 'center';
                if (!PLACEMENT_REGEX.secondary.test(placement[1])) {
                    placement[1] = 'center';
                }

                if (autoPlace) {
                    placement[2] = true;
                } else {
                    placement[2] = false;
                }

                return placement;
            },

            /**
             * Provides coordinates for an element to be positioned relative to
             * another element.  Passing 'auto' as part of the placement parameter
             * will enable smart placement - where the element fits. i.e:
             * 'auto left-top' will check to see if there is enough space to the left
             * of the hostElem to fit the targetElem, if not place right (same for secondary
             * top placement).  Available space is calculated using the viewportOffset
             * function.
             *
             * @param {element} hostElem - The element to position against.
             * @param {element} targetElem - The element to position.
             * @param {string=} [placement=top] - The placement for the targetElem,
             *   default is 'top'. 'center' is assumed as secondary placement for
             *   'top', 'left', 'right', and 'bottom' placements.  Available placements are:
             *   <ul>
             *     <li>top</li>
             *     <li>top-right</li>
             *     <li>top-left</li>
             *     <li>bottom</li>
             *     <li>bottom-left</li>
             *     <li>bottom-right</li>
             *     <li>left</li>
             *     <li>left-top</li>
             *     <li>left-bottom</li>
             *     <li>right</li>
             *     <li>right-top</li>
             *     <li>right-bottom</li>
             *   </ul>
             * @param {boolean=} [appendToBody=false] - Should the top and left values returned
             *   be calculated from the body element, default is false.
             *
             * @returns {object} An object with the following properties:
             *   <ul>
             *     <li>**top**: Value for targetElem top.</li>
             *     <li>**left**: Value for targetElem left.</li>
             *     <li>**placement**: The resolved placement.</li>
             *   </ul>
             */
            positionElements: function (hostElem, targetElem, placement, appendToBody) {
                hostElem = this.getRawNode(hostElem);
                targetElem = this.getRawNode(targetElem);

                // need to read from prop to support tests.
                var targetWidth = angular.isDefined(targetElem.offsetWidth) ? targetElem.offsetWidth : targetElem.prop('offsetWidth');
                var targetHeight = angular.isDefined(targetElem.offsetHeight) ? targetElem.offsetHeight : targetElem.prop('offsetHeight');

                placement = this.parsePlacement(placement);

                var hostElemPos = appendToBody ? this.offset(hostElem) : this.position(hostElem);
                var targetElemPos = {top: 0, left: 0, placement: ''};

                if (placement[2]) {
                    var viewportOffset = this.viewportOffset(hostElem);

                    var targetElemStyle = $window.getComputedStyle(targetElem);
                    var adjustedSize = {
                        width: targetWidth + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginLeft) + this.parseStyle(targetElemStyle.marginRight))),
                        height: targetHeight + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginTop) + this.parseStyle(targetElemStyle.marginBottom)))
                    };

                    placement[0] = placement[0] === 'top' && adjustedSize.height > viewportOffset.top && adjustedSize.height <= viewportOffset.bottom ? 'bottom' :
                            placement[0] === 'bottom' && adjustedSize.height > viewportOffset.bottom && adjustedSize.height <= viewportOffset.top ? 'top' :
                            placement[0] === 'left' && adjustedSize.width > viewportOffset.left && adjustedSize.width <= viewportOffset.right ? 'right' :
                            placement[0] === 'right' && adjustedSize.width > viewportOffset.right && adjustedSize.width <= viewportOffset.left ? 'left' :
                        placement[0];

                    placement[1] = placement[1] === 'top' && adjustedSize.height - hostElemPos.height > viewportOffset.bottom && adjustedSize.height - hostElemPos.height <= viewportOffset.top ? 'bottom' :
                            placement[1] === 'bottom' && adjustedSize.height - hostElemPos.height > viewportOffset.top && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom ? 'top' :
                            placement[1] === 'left' && adjustedSize.width - hostElemPos.width > viewportOffset.right && adjustedSize.width - hostElemPos.width <= viewportOffset.left ? 'right' :
                            placement[1] === 'right' && adjustedSize.width - hostElemPos.width > viewportOffset.left && adjustedSize.width - hostElemPos.width <= viewportOffset.right ? 'left' :
                        placement[1];

                    if (placement[1] === 'center') {
                        if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                            var xOverflow = hostElemPos.width / 2 - targetWidth / 2;
                            if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
                                placement[1] = 'left';
                            } else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
                                placement[1] = 'right';
                            }
                        } else {
                            var yOverflow = hostElemPos.height / 2 - adjustedSize.height / 2;
                            if (viewportOffset.top + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom) {
                                placement[1] = 'top';
                            } else if (viewportOffset.bottom + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.top) {
                                placement[1] = 'bottom';
                            }
                        }
                    }
                }

                switch (placement[0]) {
                    case 'top':
                        targetElemPos.top = hostElemPos.top - targetHeight;
                        break;
                    case 'bottom':
                        targetElemPos.top = hostElemPos.top + hostElemPos.height;
                        break;
                    case 'left':
                        targetElemPos.left = hostElemPos.left - targetWidth;
                        break;
                    case 'right':
                        targetElemPos.left = hostElemPos.left + hostElemPos.width;
                        break;
                }

                switch (placement[1]) {
                    case 'top':
                        targetElemPos.top = hostElemPos.top;
                        break;
                    case 'bottom':
                        targetElemPos.top = hostElemPos.top + hostElemPos.height - targetHeight;
                        break;
                    case 'left':
                        targetElemPos.left = hostElemPos.left;
                        break;
                    case 'right':
                        targetElemPos.left = hostElemPos.left + hostElemPos.width - targetWidth;
                        break;
                    case 'center':
                        if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                            targetElemPos.left = hostElemPos.left + hostElemPos.width / 2 - targetWidth / 2;
                        } else {
                            targetElemPos.top = hostElemPos.top + hostElemPos.height / 2 - targetHeight / 2;
                        }
                        break;
                }

                targetElemPos.top = Math.round(targetElemPos.top);
                targetElemPos.left = Math.round(targetElemPos.left);
                targetElemPos.placement = placement[1] === 'center' ? placement[0] : placement[0] + '-' + placement[1];

                return targetElemPos;
            },

            /**
             * Provides a way for positioning tooltip & dropdown
             * arrows when using placement options beyond the standard
             * left, right, top, or bottom.
             *
             * @param {element} elem - The tooltip/dropdown element.
             * @param {string} placement - The placement for the elem.
             */
            positionArrow: function (elem, placement) {
                elem = this.getRawNode(elem);

                var innerElem = elem.querySelector('.tooltip-inner, .popover-inner');
                if (!innerElem) {
                    return;
                }

                var isTooltip = angular.element(innerElem).hasClass('tooltip-inner');

                var arrowElem = isTooltip ? elem.querySelector('.tooltip-arrow') : elem.querySelector('.arrow');
                if (!arrowElem) {
                    return;
                }

                placement = this.parsePlacement(placement);
                if (placement[1] === 'center') {
                    // no adjustment necessary - just reset styles
                    angular.element(arrowElem).css({top: '', bottom: '', right: '', left: '', margin: ''});
                    return;
                }

                var borderProp = 'border-' + placement[0] + '-width';
                var borderWidth = $window.getComputedStyle(arrowElem)[borderProp];

                var borderRadiusProp = 'border-';
                if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                    borderRadiusProp += placement[0] + '-' + placement[1];
                } else {
                    borderRadiusProp += placement[1] + '-' + placement[0];
                }
                borderRadiusProp += '-radius';
                var borderRadius = $window.getComputedStyle(isTooltip ? innerElem : elem)[borderRadiusProp];

                var arrowCss = {
                    top: 'auto',
                    bottom: 'auto',
                    left: 'auto',
                    right: 'auto',
                    margin: 0
                };

                switch (placement[0]) {
                    case 'top':
                        arrowCss.bottom = isTooltip ? '0' : '-' + borderWidth;
                        break;
                    case 'bottom':
                        arrowCss.top = isTooltip ? '0' : '-' + borderWidth;
                        break;
                    case 'left':
                        arrowCss.right = isTooltip ? '0' : '-' + borderWidth;
                        break;
                    case 'right':
                        arrowCss.left = isTooltip ? '0' : '-' + borderWidth;
                        break;
                }

                arrowCss[placement[1]] = borderRadius;

                angular.element(arrowElem).css(arrowCss);
            }
        };
    }]);

angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.isClass', 'ui.bootstrap.position'])

    .value('$datepickerSuppressError', false)

    .constant('uibDatepickerConfig', {
        datepickerMode: 'day',
        formatDay: 'dd',
        formatMonth: 'MMMM',
        formatYear: 'yyyy',
        formatDayHeader: 'EEE',
        formatDayTitle: 'MMMM yyyy',
        formatMonthTitle: 'yyyy',
        maxDate: null,
        maxMode: 'year',
        minDate: null,
        minMode: 'day',
        ngModelOptions: {},
        shortcutPropagation: false,
        showWeeks: true,
        yearColumns: 5,
        yearRows: 4
    })

    .controller('UibDatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$locale', '$log', 'dateFilter', 'uibDatepickerConfig', '$datepickerSuppressError', 'uibDateParser',
        function ($scope, $attrs, $parse, $interpolate, $locale, $log, dateFilter, datepickerConfig, $datepickerSuppressError, dateParser) {
            var self = this,
                ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl;
                ngModelOptions = {},
                watchListeners = [];

            // Modes chain
            this.modes = ['day', 'month', 'year'];

            if ($attrs.datepickerOptions) {
                angular.forEach([
                    'formatDay',
                    'formatDayHeader',
                    'formatDayTitle',
                    'formatMonth',
                    'formatMonthTitle',
                    'formatYear',
                    'initDate',
                    'maxDate',
                    'maxMode',
                    'minDate',
                    'minMode',
                    'showWeeks',
                    'shortcutPropagation',
                    'startingDay',
                    'yearColumns',
                    'yearRows'
                ], function (key) {
                    switch (key) {
                        case 'formatDay':
                        case 'formatDayHeader':
                        case 'formatDayTitle':
                        case 'formatMonth':
                        case 'formatMonthTitle':
                        case 'formatYear':
                            self[key] = angular.isDefined($scope.datepickerOptions[key]) ? $interpolate($scope.datepickerOptions[key])($scope.$parent) : datepickerConfig[key];
                            break;
                        case 'showWeeks':
                        case 'shortcutPropagation':
                        case 'yearColumns':
                        case 'yearRows':
                            self[key] = angular.isDefined($scope.datepickerOptions[key]) ?
                                $scope.datepickerOptions[key] : datepickerConfig[key];
                            break;
                        case 'startingDay':
                            if (angular.isDefined($scope.datepickerOptions.startingDay)) {
                                self.startingDay = $scope.datepickerOptions.startingDay;
                            } else if (angular.isNumber(datepickerConfig.startingDay)) {
                                self.startingDay = datepickerConfig.startingDay;
                            } else {
                                self.startingDay = ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 8) % 7;
                            }

                            break;
                        case 'maxDate':
                        case 'minDate':
                            if ($scope.datepickerOptions[key]) {
                                $scope.$watch(function () {
                                    return $scope.datepickerOptions[key];
                                }, function (value) {
                                    if (value) {
                                        if (angular.isDate(value)) {
                                            self[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
                                        } else {
                                            self[key] = new Date(dateFilter(value, 'medium'));
                                        }
                                    } else {
                                        self[key] = null;
                                    }

                                    self.refreshView();
                                });
                            } else {
                                self[key] = datepickerConfig[key] ? dateParser.fromTimezone(new Date(datepickerConfig[key]), ngModelOptions.timezone) : null;
                            }

                            break;
                        case 'maxMode':
                        case 'minMode':
                            if ($scope.datepickerOptions[key]) {
                                $scope.$watch(function () {
                                    return $scope.datepickerOptions[key];
                                }, function (value) {
                                    self[key] = $scope[key] = angular.isDefined(value) ? value : datepickerOptions[key];
                                    if (key === 'minMode' && self.modes.indexOf($scope.datepickerMode) < self.modes.indexOf(self[key]) ||
                                        key === 'maxMode' && self.modes.indexOf($scope.datepickerMode) > self.modes.indexOf(self[key])) {
                                        $scope.datepickerMode = self[key];
                                    }
                                });
                            } else {
                                self[key] = $scope[key] = datepickerConfig[key] || null;
                            }

                            break;
                        case 'initDate':
                            if ($scope.datepickerOptions.initDate) {
                                this.activeDate = dateParser.fromTimezone($scope.datepickerOptions.initDate, ngModelOptions.timezone) || new Date();
                                $scope.$watch(function () {
                                    return $scope.datepickerOptions.initDate;
                                }, function (initDate) {
                                    if (initDate && (ngModelCtrl.$isEmpty(ngModelCtrl.$modelValue) || ngModelCtrl.$invalid)) {
                                        self.activeDate = dateParser.fromTimezone(initDate, ngModelOptions.timezone);
                                        self.refreshView();
                                    }
                                });
                            } else {
                                this.activeDate = new Date();
                            }
                    }
                });
            } else {
                // Interpolated configuration attributes
                angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle'], function (key) {
                    self[key] = angular.isDefined($attrs[key]) ? $interpolate($attrs[key])($scope.$parent) : datepickerConfig[key];
                });

                // Evaled configuration attributes
                angular.forEach(['showWeeks', 'yearRows', 'yearColumns', 'shortcutPropagation'], function (key) {
                    self[key] = angular.isDefined($attrs[key]) ?
                        $scope.$parent.$eval($attrs[key]) : datepickerConfig[key];
                });

                if (angular.isDefined($attrs.startingDay)) {
                    self.startingDay = $scope.$parent.$eval($attrs.startingDay);
                } else if (angular.isNumber(datepickerConfig.startingDay)) {
                    self.startingDay = datepickerConfig.startingDay;
                } else {
                    self.startingDay = ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 8) % 7;
                }

                // Watchable date attributes
                angular.forEach(['minDate', 'maxDate'], function (key) {
                    if ($attrs[key]) {
                        watchListeners.push($scope.$parent.$watch($attrs[key], function (value) {
                            if (value) {
                                if (angular.isDate(value)) {
                                    self[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
                                } else {
                                    self[key] = new Date(dateFilter(value, 'medium'));
                                }
                            } else {
                                self[key] = null;
                            }

                            self.refreshView();
                        }));
                    } else {
                        self[key] = datepickerConfig[key] ? dateParser.fromTimezone(new Date(datepickerConfig[key]), ngModelOptions.timezone) : null;
                    }
                });

                angular.forEach(['minMode', 'maxMode'], function (key) {
                    if ($attrs[key]) {
                        watchListeners.push($scope.$parent.$watch($attrs[key], function (value) {
                            self[key] = $scope[key] = angular.isDefined(value) ? value : $attrs[key];
                            if (key === 'minMode' && self.modes.indexOf($scope.datepickerMode) < self.modes.indexOf(self[key]) ||
                                key === 'maxMode' && self.modes.indexOf($scope.datepickerMode) > self.modes.indexOf(self[key])) {
                                $scope.datepickerMode = self[key];
                            }
                        }));
                    } else {
                        self[key] = $scope[key] = datepickerConfig[key] || null;
                    }
                });

                if (angular.isDefined($attrs.initDate)) {
                    this.activeDate = dateParser.fromTimezone($scope.$parent.$eval($attrs.initDate), ngModelOptions.timezone) || new Date();
                    watchListeners.push($scope.$parent.$watch($attrs.initDate, function (initDate) {
                        if (initDate && (ngModelCtrl.$isEmpty(ngModelCtrl.$modelValue) || ngModelCtrl.$invalid)) {
                            self.activeDate = dateParser.fromTimezone(initDate, ngModelOptions.timezone);
                            self.refreshView();
                        }
                    }));
                } else {
                    this.activeDate = new Date();
                }
            }

            $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
            $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);

            $scope.disabled = angular.isDefined($attrs.disabled) || false;
            if (angular.isDefined($attrs.ngDisabled)) {
                watchListeners.push($scope.$parent.$watch($attrs.ngDisabled, function (disabled) {
                    $scope.disabled = disabled;
                    self.refreshView();
                }));
            }

            $scope.isActive = function (dateObject) {
                if (self.compare(dateObject.date, self.activeDate) === 0) {
                    $scope.activeDateId = dateObject.uid;
                    return true;
                }
                return false;
            };

            this.init = function (ngModelCtrl_) {
                ngModelCtrl = ngModelCtrl_;
                ngModelOptions = ngModelCtrl_.$options || datepickerConfig.ngModelOptions;

                if (ngModelCtrl.$modelValue) {
                    this.activeDate = ngModelCtrl.$modelValue;
                }

                ngModelCtrl.$render = function () {
                    self.render();
                };
            };

            this.render = function () {
                if (ngModelCtrl.$viewValue) {
                    var date = new Date(ngModelCtrl.$viewValue),
                        isValid = !isNaN(date);

                    if (isValid) {
                        this.activeDate = dateParser.fromTimezone(date, ngModelOptions.timezone);
                    } else if (!$datepickerSuppressError) {
                        $log.error('Datepicker directive: "ng-model" value must be a Date object');
                    }
                }
                this.refreshView();
            };

            this.refreshView = function () {
                if (this.element) {
                    $scope.selectedDt = null;
                    this._refreshView();
                    if ($scope.activeDt) {
                        $scope.activeDateId = $scope.activeDt.uid;
                    }

                    var date = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
                    date = dateParser.fromTimezone(date, ngModelOptions.timezone);
                    ngModelCtrl.$setValidity('dateDisabled', !date ||
                        this.element && !this.isDisabled(date));
                }
            };

            this.createDateObject = function (date, format) {
                var model = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
                model = dateParser.fromTimezone(model, ngModelOptions.timezone);
                var dt = {
                    date: date,
                    label: dateParser.filter(date, format),
                    selected: model && this.compare(date, model) === 0,
                    disabled: this.isDisabled(date),
                    current: this.compare(date, new Date()) === 0,
                    customClass: this.customClass(date) || null
                };

                if (model && this.compare(date, model) === 0) {
                    $scope.selectedDt = dt;
                }

                if (self.activeDate && this.compare(dt.date, self.activeDate) === 0) {
                    $scope.activeDt = dt;
                }

                return dt;
            };

            this.isDisabled = function (date) {
                return $scope.disabled ||
                    this.minDate && this.compare(date, this.minDate) < 0 ||
                    this.maxDate && this.compare(date, this.maxDate) > 0 ||
                    $attrs.dateDisabled && $scope.dateDisabled({date: date, mode: $scope.datepickerMode});
            };

            this.customClass = function (date) {
                return $scope.customClass({date: date, mode: $scope.datepickerMode});
            };

            // Split array into smaller arrays
            this.split = function (arr, size) {
                var arrays = [];
                while (arr.length > 0) {
                    arrays.push(arr.splice(0, size));
                }
                return arrays;
            };

            $scope.select = function (date) {
                if ($scope.datepickerMode === self.minMode) {
                    var dt = ngModelCtrl.$viewValue ? dateParser.fromTimezone(new Date(ngModelCtrl.$viewValue), ngModelOptions.timezone) : new Date(0, 0, 0, 0, 0, 0, 0);
                    dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    dt = dateParser.toTimezone(dt, ngModelOptions.timezone);
                    ngModelCtrl.$setViewValue(dt);
                    ngModelCtrl.$render();
                } else {
                    self.activeDate = date;
                    $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) - 1];
                }
            };

            $scope.move = function (direction) {
                var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
                    month = self.activeDate.getMonth() + direction * (self.step.months || 0);
                self.activeDate.setFullYear(year, month, 1);
                self.refreshView();
            };

            $scope.toggleMode = function (direction) {
                direction = direction || 1;

                if ($scope.datepickerMode === self.maxMode && direction === 1 ||
                    $scope.datepickerMode === self.minMode && direction === -1) {
                    return;
                }

                $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) + direction];
            };

            // Key event mapper
            $scope.keys = { 13: 'enter', 32: 'space', 33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home', 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

            var focusElement = function () {
                self.element[0].focus();
            };

            // Listen for focus requests from popup directive
            $scope.$on('uib:datepicker.focus', focusElement);

            $scope.keydown = function (evt) {
                var key = $scope.keys[evt.which];

                if (!key || evt.shiftKey || evt.altKey || $scope.disabled) {
                    return;
                }

                evt.preventDefault();
                if (!self.shortcutPropagation) {
                    evt.stopPropagation();
                }

                if (key === 'enter' || key === 'space') {
                    if (self.isDisabled(self.activeDate)) {
                        return; // do nothing
                    }
                    $scope.select(self.activeDate);
                } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
                    $scope.toggleMode(key === 'up' ? 1 : -1);
                } else {
                    self.handleKeyDown(key, evt);
                    self.refreshView();
                }
            };

            $scope.$on("$destroy", function () {
                //Clear all watch listeners on destroy
                while (watchListeners.length) {
                    watchListeners.shift()();
                }
            });
        }])

    .controller('UibDaypickerController', ['$scope', '$element', 'dateFilter', function (scope, $element, dateFilter) {
        var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        this.step = { months: 1 };
        this.element = $element;
        function getDaysInMonth(year, month) {
            return month === 1 && year % 4 === 0 &&
                (year % 100 !== 0 || year % 400 === 0) ? 29 : DAYS_IN_MONTH[month];
        }

        this.init = function (ctrl) {
            angular.extend(ctrl, this);
            scope.showWeeks = ctrl.showWeeks;
            ctrl.refreshView();
        };

        this.getDates = function (startDate, n) {
            var dates = new Array(n), current = new Date(startDate), i = 0, date;
            while (i < n) {
                date = new Date(current);
                dates[i++] = date;
                current.setDate(current.getDate() + 1);
            }
            return dates;
        };

        this._refreshView = function () {
            var year = this.activeDate.getFullYear(),
                month = this.activeDate.getMonth(),
                firstDayOfMonth = new Date(this.activeDate);

            firstDayOfMonth.setFullYear(year, month, 1);

            var difference = this.startingDay - firstDayOfMonth.getDay(),
                numDisplayedFromPreviousMonth = difference > 0 ?
                    7 - difference : -difference,
                firstDate = new Date(firstDayOfMonth);

            if (numDisplayedFromPreviousMonth > 0) {
                firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
            }

            // 42 is the number of days on a six-week calendar
            var days = this.getDates(firstDate, 42);
            for (var i = 0; i < 42; i++) {
                days[i] = angular.extend(this.createDateObject(days[i], this.formatDay), {
                    secondary: days[i].getMonth() !== month,
                    uid: scope.uniqueId + '-' + i
                });
            }

            scope.labels = new Array(7);
            for (var j = 0; j < 7; j++) {
                scope.labels[j] = {
                    abbr: dateFilter(days[j].date, this.formatDayHeader),
                    full: dateFilter(days[j].date, 'EEEE')
                };
            }

            scope.title = dateFilter(this.activeDate, this.formatDayTitle);
            scope.rows = this.split(days, 7);

            if (scope.showWeeks) {
                scope.weekNumbers = [];
                var thursdayIndex = (4 + 7 - this.startingDay) % 7,
                    numWeeks = scope.rows.length;
                for (var curWeek = 0; curWeek < numWeeks; curWeek++) {
                    scope.weekNumbers.push(
                        getISO8601WeekNumber(scope.rows[curWeek][thursdayIndex].date));
                }
            }
        };

        this.compare = function (date1, date2) {
            var _date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
            var _date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
            _date1.setFullYear(date1.getFullYear());
            _date2.setFullYear(date2.getFullYear());
            return _date1 - _date2;
        };

        function getISO8601WeekNumber(date) {
            var checkDate = new Date(date);
            checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
            var time = checkDate.getTime();
            checkDate.setMonth(0); // Compare with Jan 1
            checkDate.setDate(1);
            return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
        }

        this.handleKeyDown = function (key, evt) {
            var date = this.activeDate.getDate();

            if (key === 'left') {
                date = date - 1;
            } else if (key === 'up') {
                date = date - 7;
            } else if (key === 'right') {
                date = date + 1;
            } else if (key === 'down') {
                date = date + 7;
            } else if (key === 'pageup' || key === 'pagedown') {
                var month = this.activeDate.getMonth() + (key === 'pageup' ? -1 : 1);
                this.activeDate.setMonth(month, 1);
                date = Math.min(getDaysInMonth(this.activeDate.getFullYear(), this.activeDate.getMonth()), date);
            } else if (key === 'home') {
                date = 1;
            } else if (key === 'end') {
                date = getDaysInMonth(this.activeDate.getFullYear(), this.activeDate.getMonth());
            }
            this.activeDate.setDate(date);
        };
    }])

    .controller('UibMonthpickerController', ['$scope', '$element', 'dateFilter', function (scope, $element, dateFilter) {
        this.step = { years: 1 };
        this.element = $element;

        this.init = function (ctrl) {
            angular.extend(ctrl, this);
            ctrl.refreshView();
        };

        this._refreshView = function () {
            var months = new Array(12),
                year = this.activeDate.getFullYear(),
                date;

            for (var i = 0; i < 12; i++) {
                date = new Date(this.activeDate);
                date.setFullYear(year, i, 1);
                months[i] = angular.extend(this.createDateObject(date, this.formatMonth), {
                    uid: scope.uniqueId + '-' + i
                });
            }

            scope.title = dateFilter(this.activeDate, this.formatMonthTitle);
            scope.rows = this.split(months, 3);
        };

        this.compare = function (date1, date2) {
            var _date1 = new Date(date1.getFullYear(), date1.getMonth());
            var _date2 = new Date(date2.getFullYear(), date2.getMonth());
            _date1.setFullYear(date1.getFullYear());
            _date2.setFullYear(date2.getFullYear());
            return _date1 - _date2;
        };

        this.handleKeyDown = function (key, evt) {
            var date = this.activeDate.getMonth();

            if (key === 'left') {
                date = date - 1;
            } else if (key === 'up') {
                date = date - 3;
            } else if (key === 'right') {
                date = date + 1;
            } else if (key === 'down') {
                date = date + 3;
            } else if (key === 'pageup' || key === 'pagedown') {
                var year = this.activeDate.getFullYear() + (key === 'pageup' ? -1 : 1);
                this.activeDate.setFullYear(year);
            } else if (key === 'home') {
                date = 0;
            } else if (key === 'end') {
                date = 11;
            }
            this.activeDate.setMonth(date);
        };
    }])

    .controller('UibYearpickerController', ['$scope', '$element', 'dateFilter', function (scope, $element, dateFilter) {
        var columns, range;
        this.element = $element;

        function getStartingYear(year) {
            return parseInt((year - 1) / range, 10) * range + 1;
        }

        this.yearpickerInit = function () {
            columns = this.yearColumns;
            range = this.yearRows * columns;
            this.step = { years: range };
        };

        this._refreshView = function () {
            var years = new Array(range), date;

            for (var i = 0, start = getStartingYear(this.activeDate.getFullYear()); i < range; i++) {
                date = new Date(this.activeDate);
                date.setFullYear(start + i, 0, 1);
                years[i] = angular.extend(this.createDateObject(date, this.formatYear), {
                    uid: scope.uniqueId + '-' + i
                });
            }

            scope.title = [years[0].label, years[range - 1].label].join(' - ');
            scope.rows = this.split(years, columns);
            scope.columns = columns;
        };

        this.compare = function (date1, date2) {
            return date1.getFullYear() - date2.getFullYear();
        };

        this.handleKeyDown = function (key, evt) {
            var date = this.activeDate.getFullYear();

            if (key === 'left') {
                date = date - 1;
            } else if (key === 'up') {
                date = date - columns;
            } else if (key === 'right') {
                date = date + 1;
            } else if (key === 'down') {
                date = date + columns;
            } else if (key === 'pageup' || key === 'pagedown') {
                date += (key === 'pageup' ? -1 : 1) * range;
            } else if (key === 'home') {
                date = getStartingYear(this.activeDate.getFullYear());
            } else if (key === 'end') {
                date = getStartingYear(this.activeDate.getFullYear()) + range - 1;
            }
            this.activeDate.setFullYear(date);
        };
    }])

    .directive('uibDatepicker', function () {
        return {
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/datepicker/datepicker.html';
            },
            scope: {
                datepickerMode: '=?',
                datepickerOptions: '=?',
                dateDisabled: '&',
                customClass: '&',
                shortcutPropagation: '&?'
            },
            require: ['uibDatepicker', '^ngModel'],
            controller: 'UibDatepickerController',
            controllerAs: 'datepicker',
            link: function (scope, element, attrs, ctrls) {
                var datepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                datepickerCtrl.init(ngModelCtrl);
            }
        };
    })

    .directive('uibDaypicker', function () {
        return {
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/datepicker/day.html';
            },
            require: ['^uibDatepicker', 'uibDaypicker'],
            controller: 'UibDaypickerController',
            link: function (scope, element, attrs, ctrls) {
                var datepickerCtrl = ctrls[0],
                    daypickerCtrl = ctrls[1];

                daypickerCtrl.init(datepickerCtrl);
            }
        };
    })

    .directive('uibMonthpicker', function () {
        return {
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/datepicker/month.html';
            },
            require: ['^uibDatepicker', 'uibMonthpicker'],
            controller: 'UibMonthpickerController',
            link: function (scope, element, attrs, ctrls) {
                var datepickerCtrl = ctrls[0],
                    monthpickerCtrl = ctrls[1];

                monthpickerCtrl.init(datepickerCtrl);
            }
        };
    })

    .directive('uibYearpicker', function () {
        return {
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/datepicker/year.html';
            },
            require: ['^uibDatepicker', 'uibYearpicker'],
            controller: 'UibYearpickerController',
            link: function (scope, element, attrs, ctrls) {
                var ctrl = ctrls[0];
                angular.extend(ctrl, ctrls[1]);
                ctrl.yearpickerInit();

                ctrl.refreshView();
            }
        };
    })

    .constant('uibDatepickerPopupConfig', {
        altInputFormats: [],
        appendToBody: false,
        clearText: 'Clear',
        closeOnDateSelection: true,
        closeText: 'Done',
        currentText: 'Today',
        datepickerPopup: 'yyyy-MM-dd',
        datepickerPopupTemplateUrl: 'uib/template/datepicker/popup.html',
        datepickerTemplateUrl: 'uib/template/datepicker/datepicker.html',
        html5Types: {
            date: 'yyyy-MM-dd',
            'datetime-local': 'yyyy-MM-ddTHH:mm:ss.sss',
            'month': 'yyyy-MM'
        },
        onOpenFocus: true,
        showButtonBar: true
    })

    .controller('UibDatepickerPopupController', ['$scope', '$element', '$attrs', '$compile', '$parse', '$document', '$rootScope', '$uibPosition', 'dateFilter', 'uibDateParser', 'uibDatepickerPopupConfig', '$timeout', 'uibDatepickerConfig',
        function (scope, element, attrs, $compile, $parse, $document, $rootScope, $position, dateFilter, dateParser, datepickerPopupConfig, $timeout, datepickerConfig) {
            var cache = {},
                isHtml5DateInput = false;
            var dateFormat, closeOnDateSelection, appendToBody, onOpenFocus,
                datepickerPopupTemplateUrl, datepickerTemplateUrl, popupEl, datepickerEl,
                ngModel, ngModelOptions, $popup, altInputFormats, watchListeners = [];

            scope.watchData = {};

            this.init = function (_ngModel_) {
                ngModel = _ngModel_;
                ngModelOptions = _ngModel_.$options || datepickerConfig.ngModelOptions;
                closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection;
                appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;
                onOpenFocus = angular.isDefined(attrs.onOpenFocus) ? scope.$parent.$eval(attrs.onOpenFocus) : datepickerPopupConfig.onOpenFocus;
                datepickerPopupTemplateUrl = angular.isDefined(attrs.datepickerPopupTemplateUrl) ? attrs.datepickerPopupTemplateUrl : datepickerPopupConfig.datepickerPopupTemplateUrl;
                datepickerTemplateUrl = angular.isDefined(attrs.datepickerTemplateUrl) ? attrs.datepickerTemplateUrl : datepickerPopupConfig.datepickerTemplateUrl;
                altInputFormats = angular.isDefined(attrs.altInputFormats) ? scope.$parent.$eval(attrs.altInputFormats) : datepickerPopupConfig.altInputFormats;

                scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

                if (datepickerPopupConfig.html5Types[attrs.type]) {
                    dateFormat = datepickerPopupConfig.html5Types[attrs.type];
                    isHtml5DateInput = true;
                } else {
                    dateFormat = attrs.uibDatepickerPopup || datepickerPopupConfig.datepickerPopup;
                    attrs.$observe('uibDatepickerPopup', function (value, oldValue) {
                        var newDateFormat = value || datepickerPopupConfig.datepickerPopup;
                        // Invalidate the $modelValue to ensure that formatters re-run
                        // FIXME: Refactor when PR is merged: https://github.com/angular/angular.js/pull/10764
                        if (newDateFormat !== dateFormat) {
                            dateFormat = newDateFormat;
                            ngModel.$modelValue = null;

                            if (!dateFormat) {
                                throw new Error('uibDatepickerPopup must have a date format specified.');
                            }
                        }
                    });
                }

                if (!dateFormat) {
                    throw new Error('uibDatepickerPopup must have a date format specified.');
                }

                if (isHtml5DateInput && attrs.uibDatepickerPopup) {
                    throw new Error('HTML5 date input types do not support custom formats.');
                }

                // popup element used to display calendar
                popupEl = angular.element('<div uib-datepicker-popup-wrap><div uib-datepicker></div></div>');
                scope.ngModelOptions = angular.copy(ngModelOptions);
                scope.ngModelOptions.timezone = null;
                popupEl.attr({
                    'ng-model': 'date',
                    'ng-model-options': 'ngModelOptions',
                    'ng-change': 'dateSelection(date)',
                    'template-url': datepickerPopupTemplateUrl
                });

                // datepicker element
                datepickerEl = angular.element(popupEl.children()[0]);
                datepickerEl.attr('template-url', datepickerTemplateUrl);

                if (isHtml5DateInput) {
                    if (attrs.type === 'month') {
                        datepickerEl.attr('datepicker-mode', '"month"');
                        datepickerEl.attr('min-mode', 'month');
                    }
                }

                if (scope.datepickerOptions) {
                    angular.forEach(scope.datepickerOptions, function (value, option) {
                        // Ignore this options, will be managed later
                        if (['minDate', 'maxDate', 'minMode', 'maxMode', 'initDate', 'datepickerMode'].indexOf(option) === -1) {
                            datepickerEl.attr(cameltoDash(option), value);
                        } else {
                            datepickerEl.attr(cameltoDash(option), 'datepickerOptions.' + option);
                        }
                    });
                }

                angular.forEach(['minMode', 'maxMode', 'datepickerMode', 'shortcutPropagation'], function (key) {
                    if (attrs[key]) {
                        var getAttribute = $parse(attrs[key]);
                        var propConfig = {
                            get: function () {
                                return getAttribute(scope.$parent);
                            }
                        };

                        datepickerEl.attr(cameltoDash(key), 'watchData.' + key);

                        // Propagate changes from datepicker to outside
                        if (key === 'datepickerMode') {
                            var setAttribute = getAttribute.assign;
                            propConfig.set = function (v) {
                                setAttribute(scope.$parent, v);
                            };
                        }

                        Object.defineProperty(scope.watchData, key, propConfig);
                    }
                });

                angular.forEach(['minDate', 'maxDate', 'initDate'], function (key) {
                    if (attrs[key]) {
                        var getAttribute = $parse(attrs[key]);

                        watchListeners.push(scope.$parent.$watch(getAttribute, function (value) {
                            if (key === 'minDate' || key === 'maxDate') {
                                if (value === null) {
                                    cache[key] = null;
                                } else if (angular.isDate(value)) {
                                    cache[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
                                } else {
                                    cache[key] = new Date(dateFilter(value, 'medium'));
                                }

                                scope.watchData[key] = value === null ? null : cache[key];
                            } else {
                                scope.watchData[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
                            }
                        }));

                        datepickerEl.attr(cameltoDash(key), 'watchData.' + key);
                    }
                });

                if (attrs.dateDisabled) {
                    datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
                }

                angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle', 'showWeeks', 'startingDay', 'yearRows', 'yearColumns'], function (key) {
                    if (angular.isDefined(attrs[key])) {
                        datepickerEl.attr(cameltoDash(key), attrs[key]);
                    }
                });

                if (attrs.customClass) {
                    datepickerEl.attr('custom-class', 'customClass({ date: date, mode: mode })');
                }

                if (!isHtml5DateInput) {
                    // Internal API to maintain the correct ng-invalid-[key] class
                    ngModel.$$parserName = 'date';
                    ngModel.$validators.date = validator;
                    ngModel.$parsers.unshift(parseDate);
                    ngModel.$formatters.push(function (value) {
                        if (ngModel.$isEmpty(value)) {
                            scope.date = value;
                            return value;
                        }

                        scope.date = dateParser.fromTimezone(value, ngModelOptions.timezone);

                        if (angular.isNumber(scope.date)) {
                            scope.date = new Date(scope.date);
                        }

                        return dateParser.filter(scope.date, dateFormat);
                    });
                } else {
                    ngModel.$formatters.push(function (value) {
                        scope.date = dateParser.fromTimezone(value, ngModelOptions.timezone);
                        return value;
                    });
                }

                // Detect changes in the view from the text box
                ngModel.$viewChangeListeners.push(function () {
                    scope.date = parseDateString(ngModel.$viewValue);
                });

                element.on('keydown', inputKeydownBind);

                $popup = $compile(popupEl)(scope);
                // Prevent jQuery cache memory leak (template is now redundant after linking)
                popupEl.remove();

                if (appendToBody) {
                    $document.find('body').append($popup);
                } else {
                    element.after($popup);
                }

                scope.$on('$destroy', function () {
                    if (scope.isOpen === true) {
                        if (!$rootScope.$$phase) {
                            scope.$apply(function () {
                                scope.isOpen = false;
                            });
                        }
                    }

                    $popup.remove();
                    element.off('keydown', inputKeydownBind);
                    $document.off('click', documentClickBind);

                    //Clear all watch listeners on destroy
                    while (watchListeners.length) {
                        watchListeners.shift()();
                    }
                });
            };

            scope.getText = function (key) {
                return scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
            };

            scope.isDisabled = function (date) {
                if (date === 'today') {
                    date = new Date();
                }

                return scope.watchData.minDate && scope.compare(date, cache.minDate) < 0 ||
                    scope.watchData.maxDate && scope.compare(date, cache.maxDate) > 0;
            };

            scope.compare = function (date1, date2) {
                return new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
            };

            // Inner change
            scope.dateSelection = function (dt) {
                if (angular.isDefined(dt)) {
                    scope.date = dt;
                }
                var date = scope.date ? dateParser.filter(scope.date, dateFormat) : null; // Setting to NULL is necessary for form validators to function
                element.val(date);
                ngModel.$setViewValue(date);

                if (closeOnDateSelection) {
                    scope.isOpen = false;
                    element[0].focus();
                }
            };

            scope.keydown = function (evt) {
                if (evt.which === 27) {
                    evt.stopPropagation();
                    scope.isOpen = false;
                    element[0].focus();
                }
            };

            scope.select = function (date) {
                if (date === 'today') {
                    var today = new Date();
                    if (angular.isDate(scope.date)) {
                        date = new Date(scope.date);
                        date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
                    } else {
                        date = new Date(today.setHours(0, 0, 0, 0));
                    }
                }
                scope.dateSelection(date);
            };

            scope.close = function () {
                scope.isOpen = false;
                element[0].focus();
            };

            scope.disabled = angular.isDefined(attrs.disabled) || false;
            if (attrs.ngDisabled) {
                watchListeners.push(scope.$parent.$watch($parse(attrs.ngDisabled), function (disabled) {
                    scope.disabled = disabled;
                }));
            }

            scope.$watch('isOpen', function (value) {
                if (value) {
                    if (!scope.disabled) {
                        scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                        scope.position.top = scope.position.top + element.prop('offsetHeight');

                        $timeout(function () {
                            if (onOpenFocus) {
                                scope.$broadcast('uib:datepicker.focus');
                            }
                            $document.on('click', documentClickBind);
                        }, 0, false);
                    } else {
                        scope.isOpen = false;
                    }
                } else {
                    $document.off('click', documentClickBind);
                }
            });

            function cameltoDash(string) {
                return string.replace(/([A-Z])/g, function ($1) {
                    return '-' + $1.toLowerCase();
                });
            }

            function parseDateString(viewValue) {
                var date = dateParser.parse(viewValue, dateFormat, scope.date);
                if (isNaN(date)) {
                    for (var i = 0; i < altInputFormats.length; i++) {
                        date = dateParser.parse(viewValue, altInputFormats[i], scope.date);
                        if (!isNaN(date)) {
                            return date;
                        }
                    }
                }
                return date;
            }

            function parseDate(viewValue) {
                if (angular.isNumber(viewValue)) {
                    // presumably timestamp to date object
                    viewValue = new Date(viewValue);
                }

                if (!viewValue) {
                    return null;
                }

                if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                    return viewValue;
                }

                if (angular.isString(viewValue)) {
                    var date = parseDateString(viewValue);
                    if (!isNaN(date)) {
                        return dateParser.toTimezone(date, ngModelOptions.timezone);
                    }
                }

                return ngModel.$options && ngModel.$options.allowInvalid ? viewValue : undefined;
            }

            function validator(modelValue, viewValue) {
                var value = modelValue || viewValue;

                if (!attrs.ngRequired && !value) {
                    return true;
                }

                if (angular.isNumber(value)) {
                    value = new Date(value);
                }

                if (!value) {
                    return true;
                }

                if (angular.isDate(value) && !isNaN(value)) {
                    return true;
                }

                if (angular.isString(value)) {
                    return !isNaN(parseDateString(viewValue));
                }

                return false;
            }

            function documentClickBind(event) {
                if (!scope.isOpen && scope.disabled) {
                    return;
                }

                var popup = $popup[0];
                var dpContainsTarget = element[0].contains(event.target);
                // The popup node may not be an element node
                // In some browsers (IE) only element nodes have the 'contains' function
                var popupContainsTarget = popup.contains !== undefined && popup.contains(event.target);
                if (scope.isOpen && !(dpContainsTarget || popupContainsTarget)) {
                    scope.$apply(function () {
                        scope.isOpen = false;
                    });
                }
            }

            function inputKeydownBind(evt) {
                if (evt.which === 27 && scope.isOpen) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    scope.$apply(function () {
                        scope.isOpen = false;
                    });
                    element[0].focus();
                } else if (evt.which === 40 && !scope.isOpen) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    scope.$apply(function () {
                        scope.isOpen = true;
                    });
                }
            }
        }])

    .directive('uibDatepickerPopup', function () {
        return {
            require: ['ngModel', 'uibDatepickerPopup'],
            controller: 'UibDatepickerPopupController',
            scope: {
                datepickerOptions: '=?',
                isOpen: '=?',
                currentText: '@',
                clearText: '@',
                closeText: '@',
                dateDisabled: '&',
                customClass: '&'
            },
            link: function (scope, element, attrs, ctrls) {
                var ngModel = ctrls[0],
                    ctrl = ctrls[1];

                ctrl.init(ngModel);
            }
        };
    })

    .directive('uibDatepickerPopupWrap', function () {
        return {
            replace: true,
            transclude: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/datepicker/popup.html';
            }
        };
    });

angular.module('ui.bootstrap.debounce', [])
/**
 * A helper, internal service that debounces a function
 */
    .factory('$$debounce', ['$timeout', function ($timeout) {
        return function (callback, debounceTime) {
            var timeoutPromise;

            return function () {
                var self = this;
                var args = Array.prototype.slice.call(arguments);
                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                }

                timeoutPromise = $timeout(function () {
                    callback.apply(self, args);
                }, debounceTime);
            };
        };
    }]);

angular.module('ui.bootstrap.dropdown', ['ui.bootstrap.position'])

    .constant('uibDropdownConfig', {
        appendToOpenClass: 'uib-dropdown-open',
        openClass: 'open'
    })

    .service('uibDropdownService', ['$document', '$rootScope', function ($document, $rootScope) {
        var openScope = null;

        this.open = function (dropdownScope) {
            if (!openScope) {
                $document.on('click', closeDropdown);
                $document.on('keydown', keybindFilter);
            }

            if (openScope && openScope !== dropdownScope) {
                openScope.isOpen = false;
            }

            openScope = dropdownScope;
        };

        this.close = function (dropdownScope) {
            if (openScope === dropdownScope) {
                openScope = null;
                $document.off('click', closeDropdown);
                $document.off('keydown', keybindFilter);
            }
        };

        var closeDropdown = function (evt) {
            // This method may still be called during the same mouse event that
            // unbound this event handler. So check openScope before proceeding.
            if (!openScope) {
                return;
            }

            if (evt && openScope.getAutoClose() === 'disabled') {
                return;
            }

            if (evt && evt.which === 3) {
                return;
            }

            var toggleElement = openScope.getToggleElement();
            if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
                return;
            }

            var dropdownElement = openScope.getDropdownElement();
            if (evt && openScope.getAutoClose() === 'outsideClick' &&
                dropdownElement && dropdownElement[0].contains(evt.target)) {
                return;
            }

            openScope.isOpen = false;

            if (!$rootScope.$$phase) {
                openScope.$apply();
            }
        };

        var keybindFilter = function (evt) {
            if (evt.which === 27) {
                openScope.focusToggleElement();
                closeDropdown();
            } else if (openScope.isKeynavEnabled() && [38, 40].indexOf(evt.which) !== -1 && openScope.isOpen) {
                evt.preventDefault();
                evt.stopPropagation();
                openScope.focusDropdownEntry(evt.which);
            }
        };
    }])

    .controller('UibDropdownController', ['$scope', '$element', '$attrs', '$parse', 'uibDropdownConfig', 'uibDropdownService', '$animate', '$uibPosition', '$document', '$compile', '$templateRequest', function ($scope, $element, $attrs, $parse, dropdownConfig, uibDropdownService, $animate, $position, $document, $compile, $templateRequest) {
        var self = this,
            scope = $scope.$new(), // create a child scope so we are not polluting original one
            templateScope,
            appendToOpenClass = dropdownConfig.appendToOpenClass,
            openClass = dropdownConfig.openClass,
            getIsOpen,
            setIsOpen = angular.noop,
            toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
            appendToBody = false,
            appendTo = null,
            keynavEnabled = false,
            selectedOption = null,
            body = $document.find('body');

        $element.addClass('dropdown');

        this.init = function () {
            if ($attrs.isOpen) {
                getIsOpen = $parse($attrs.isOpen);
                setIsOpen = getIsOpen.assign;

                $scope.$watch(getIsOpen, function (value) {
                    scope.isOpen = !!value;
                });
            }

            if (angular.isDefined($attrs.dropdownAppendTo)) {
                var appendToEl = $parse($attrs.dropdownAppendTo)(scope);
                if (appendToEl) {
                    appendTo = angular.element(appendToEl);
                }
            }

            appendToBody = angular.isDefined($attrs.dropdownAppendToBody);
            keynavEnabled = angular.isDefined($attrs.keyboardNav);

            if (appendToBody && !appendTo) {
                appendTo = body;
            }

            if (appendTo && self.dropdownMenu) {
                appendTo.append(self.dropdownMenu);
                $element.on('$destroy', function handleDestroyEvent() {
                    self.dropdownMenu.remove();
                });
            }
        };

        this.toggle = function (open) {
            return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
        };

        // Allow other directives to watch status
        this.isOpen = function () {
            return scope.isOpen;
        };

        scope.getToggleElement = function () {
            return self.toggleElement;
        };

        scope.getAutoClose = function () {
            return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
        };

        scope.getElement = function () {
            return $element;
        };

        scope.isKeynavEnabled = function () {
            return keynavEnabled;
        };

        scope.focusDropdownEntry = function (keyCode) {
            var elems = self.dropdownMenu ? //If append to body is used.
                angular.element(self.dropdownMenu).find('a') :
                $element.find('ul').eq(0).find('a');

            switch (keyCode) {
                case 40:
                {
                    if (!angular.isNumber(self.selectedOption)) {
                        self.selectedOption = 0;
                    } else {
                        self.selectedOption = self.selectedOption === elems.length - 1 ?
                            self.selectedOption :
                            self.selectedOption + 1;
                    }
                    break;
                }
                case 38:
                {
                    if (!angular.isNumber(self.selectedOption)) {
                        self.selectedOption = elems.length - 1;
                    } else {
                        self.selectedOption = self.selectedOption === 0 ?
                            0 : self.selectedOption - 1;
                    }
                    break;
                }
            }
            elems[self.selectedOption].focus();
        };

        scope.getDropdownElement = function () {
            return self.dropdownMenu;
        };

        scope.focusToggleElement = function () {
            if (self.toggleElement) {
                self.toggleElement[0].focus();
            }
        };

        scope.$watch('isOpen', function (isOpen, wasOpen) {
            if (appendTo && self.dropdownMenu) {
                var pos = $position.positionElements($element, self.dropdownMenu, 'bottom-left', true),
                    css,
                    rightalign;

                css = {
                    top: pos.top + 'px',
                    display: isOpen ? 'block' : 'none'
                };

                rightalign = self.dropdownMenu.hasClass('dropdown-menu-right');
                if (!rightalign) {
                    css.left = pos.left + 'px';
                    css.right = 'auto';
                } else {
                    css.left = 'auto';
                    css.right = window.innerWidth -
                        (pos.left + $element.prop('offsetWidth')) + 'px';
                }

                // Need to adjust our positioning to be relative to the appendTo container
                // if it's not the body element
                if (!appendToBody) {
                    var appendOffset = $position.offset(appendTo);

                    css.top = pos.top - appendOffset.top + 'px';

                    if (!rightalign) {
                        css.left = pos.left - appendOffset.left + 'px';
                    } else {
                        css.right = window.innerWidth -
                            (pos.left - appendOffset.left + $element.prop('offsetWidth')) + 'px';
                    }
                }

                self.dropdownMenu.css(css);
            }

            var openContainer = appendTo ? appendTo : $element;

            $animate[isOpen ? 'addClass' : 'removeClass'](openContainer, appendTo ? appendToOpenClass : openClass).then(function () {
                if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
                    toggleInvoker($scope, { open: !!isOpen });
                }
            });

            if (isOpen) {
                if (self.dropdownMenuTemplateUrl) {
                    $templateRequest(self.dropdownMenuTemplateUrl).then(function (tplContent) {
                        templateScope = scope.$new();
                        $compile(tplContent.trim())(templateScope, function (dropdownElement) {
                            var newEl = dropdownElement;
                            self.dropdownMenu.replaceWith(newEl);
                            self.dropdownMenu = newEl;
                        });
                    });
                }

                scope.focusToggleElement();
                uibDropdownService.open(scope);
            } else {
                if (self.dropdownMenuTemplateUrl) {
                    if (templateScope) {
                        templateScope.$destroy();
                    }
                    var newEl = angular.element('<ul class="dropdown-menu"></ul>');
                    self.dropdownMenu.replaceWith(newEl);
                    self.dropdownMenu = newEl;
                }

                uibDropdownService.close(scope);
                self.selectedOption = null;
            }

            if (angular.isFunction(setIsOpen)) {
                setIsOpen($scope, isOpen);
            }
        });

        $scope.$on('$locationChangeSuccess', function () {
            if (scope.getAutoClose() !== 'disabled') {
                scope.isOpen = false;
            }
        });
    }])

    .directive('uibDropdown', function () {
        return {
            controller: 'UibDropdownController',
            link: function (scope, element, attrs, dropdownCtrl) {
                dropdownCtrl.init();
            }
        };
    })

    .directive('uibDropdownMenu', function () {
        return {
            restrict: 'A',
            require: '?^uibDropdown',
            link: function (scope, element, attrs, dropdownCtrl) {
                if (!dropdownCtrl || angular.isDefined(attrs.dropdownNested)) {
                    return;
                }

                element.addClass('dropdown-menu');

                var tplUrl = attrs.templateUrl;
                if (tplUrl) {
                    dropdownCtrl.dropdownMenuTemplateUrl = tplUrl;
                }

                if (!dropdownCtrl.dropdownMenu) {
                    dropdownCtrl.dropdownMenu = element;
                }
            }
        };
    })

    .directive('uibDropdownToggle', function () {
        return {
            require: '?^uibDropdown',
            link: function (scope, element, attrs, dropdownCtrl) {
                if (!dropdownCtrl) {
                    return;
                }

                element.addClass('dropdown-toggle');

                dropdownCtrl.toggleElement = element;

                var toggleDropdown = function (event) {
                    event.preventDefault();

                    if (!element.hasClass('disabled') && !attrs.disabled) {
                        scope.$apply(function () {
                            dropdownCtrl.toggle();
                        });
                    }
                };

                element.bind('click', toggleDropdown);

                // WAI-ARIA
                element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
                scope.$watch(dropdownCtrl.isOpen, function (isOpen) {
                    element.attr('aria-expanded', !!isOpen);
                });

                scope.$on('$destroy', function () {
                    element.unbind('click', toggleDropdown);
                });
            }
        };
    });

angular.module('ui.bootstrap.stackedMap', [])
/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
    .factory('$$stackedMap', function () {
        return {
            createNew: function () {
                var stack = [];

                return {
                    add: function (key, value) {
                        stack.push({
                            key: key,
                            value: value
                        });
                    },
                    get: function (key) {
                        for (var i = 0; i < stack.length; i++) {
                            if (key === stack[i].key) {
                                return stack[i];
                            }
                        }
                    },
                    keys: function () {
                        var keys = [];
                        for (var i = 0; i < stack.length; i++) {
                            keys.push(stack[i].key);
                        }
                        return keys;
                    },
                    top: function () {
                        return stack[stack.length - 1];
                    },
                    remove: function (key) {
                        var idx = -1;
                        for (var i = 0; i < stack.length; i++) {
                            if (key === stack[i].key) {
                                idx = i;
                                break;
                            }
                        }
                        return stack.splice(idx, 1)[0];
                    },
                    removeTop: function () {
                        return stack.splice(stack.length - 1, 1)[0];
                    },
                    length: function () {
                        return stack.length;
                    }
                };
            }
        };
    });
angular.module('ui.bootstrap.modal', ['ui.bootstrap.stackedMap'])
/**
 * A helper, internal data structure that stores all references attached to key
 */
    .factory('$$multiMap', function () {
        return {
            createNew: function () {
                var map = {};

                return {
                    entries: function () {
                        return Object.keys(map).map(function (key) {
                            return {
                                key: key,
                                value: map[key]
                            };
                        });
                    },
                    get: function (key) {
                        return map[key];
                    },
                    hasKey: function (key) {
                        return !!map[key];
                    },
                    keys: function () {
                        return Object.keys(map);
                    },
                    put: function (key, value) {
                        if (!map[key]) {
                            map[key] = [];
                        }

                        map[key].push(value);
                    },
                    remove: function (key, value) {
                        var values = map[key];

                        if (!values) {
                            return;
                        }

                        var idx = values.indexOf(value);

                        if (idx !== -1) {
                            values.splice(idx, 1);
                        }

                        if (!values.length) {
                            delete map[key];
                        }
                    }
                };
            }
        };
    })

/**
 * Pluggable resolve mechanism for the modal resolve resolution
 * Supports UI Router's $resolve service
 */
    .provider('$uibResolve', function () {
        var resolve = this;
        this.resolver = null;

        this.setResolver = function (resolver) {
            this.resolver = resolver;
        };

        this.$get = ['$injector', '$q', function ($injector, $q) {
            var resolver = resolve.resolver ? $injector.get(resolve.resolver) : null;
            return {
                resolve: function (invocables, locals, parent, self) {
                    if (resolver) {
                        return resolver.resolve(invocables, locals, parent, self);
                    }

                    var promises = [];

                    angular.forEach(invocables, function (value) {
                        if (angular.isFunction(value) || angular.isArray(value)) {
                            promises.push($q.resolve($injector.invoke(value)));
                        } else if (angular.isString(value)) {
                            promises.push($q.resolve($injector.get(value)));
                        } else {
                            promises.push($q.resolve(value));
                        }
                    });

                    return $q.all(promises).then(function (resolves) {
                        var resolveObj = {};
                        var resolveIter = 0;
                        angular.forEach(invocables, function (value, key) {
                            resolveObj[key] = resolves[resolveIter++];
                        });

                        return resolveObj;
                    });
                }
            };
        }];
    })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
    .directive('uibModalBackdrop', ['$animateCss', '$injector', '$uibModalStack',
        function ($animateCss, $injector, $modalStack) {
            return {
                replace: true,
                templateUrl: 'uib/template/modal/backdrop.html',
                compile: function (tElement, tAttrs) {
                    tElement.addClass(tAttrs.backdropClass);
                    return linkFn;
                }
            };

            function linkFn(scope, element, attrs) {
                if (attrs.modalInClass) {
                    $animateCss(element, {
                        addClass: attrs.modalInClass
                    }).start();

                    scope.$on($modalStack.NOW_CLOSING_EVENT, function (e, setIsAsync) {
                        var done = setIsAsync();
                        if (scope.modalOptions.animation) {
                            $animateCss(element, {
                                removeClass: attrs.modalInClass
                            }).start().then(done);
                        } else {
                            done();
                        }
                    });
                }
            }
        }])

    .directive('uibModalWindow', ['$uibModalStack', '$q', '$animate', '$animateCss', '$document',
        function ($modalStack, $q, $animate, $animateCss, $document) {
            return {
                scope: {
                    index: '@'
                },
                replace: true,
                transclude: true,
                templateUrl: function (tElement, tAttrs) {
                    return tAttrs.templateUrl || 'uib/template/modal/window.html';
                },
                link: function (scope, element, attrs) {
                    element.addClass(attrs.windowClass || '');
                    element.addClass(attrs.windowTopClass || '');
                    scope.size = attrs.size;

                    scope.close = function (evt) {
                        var modal = $modalStack.getTop();
                        if (modal && modal.value.backdrop &&
                            modal.value.backdrop !== 'static' &&
                            evt.target === evt.currentTarget) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            $modalStack.dismiss(modal.key, 'backdrop click');
                        }
                    };

                    // moved from template to fix issue #2280
                    element.on('click', scope.close);

                    // This property is only added to the scope for the purpose of detecting when this directive is rendered.
                    // We can detect that by using this property in the template associated with this directive and then use
                    // {@link Attribute#$observe} on it. For more details please see {@link TableColumnResize}.
                    scope.$isRendered = true;

                    // Deferred object that will be resolved when this modal is render.
                    var modalRenderDeferObj = $q.defer();
                    // Observe function will be called on next digest cycle after compilation, ensuring that the DOM is ready.
                    // In order to use this way of finding whether DOM is ready, we need to observe a scope property used in modal's template.
                    attrs.$observe('modalRender', function (value) {
                        if (value === 'true') {
                            modalRenderDeferObj.resolve();
                        }
                    });

                    modalRenderDeferObj.promise.then(function () {
                        var animationPromise = null;

                        if (attrs.modalInClass) {
                            animationPromise = $animateCss(element, {
                                addClass: attrs.modalInClass
                            }).start();

                            scope.$on($modalStack.NOW_CLOSING_EVENT, function (e, setIsAsync) {
                                var done = setIsAsync();
                                if ($animateCss) {
                                    $animateCss(element, {
                                        removeClass: attrs.modalInClass
                                    }).start().then(done);
                                } else {
                                    $animate.removeClass(element, attrs.modalInClass).then(done);
                                }
                            });
                        }


                        $q.when(animationPromise).then(function () {
                            /**
                             * If something within the freshly-opened modal already has focus (perhaps via a
                             * directive that causes focus). then no need to try and focus anything.
                             */
                            if (!($document[0].activeElement && element[0].contains($document[0].activeElement))) {
                                var inputWithAutofocus = element[0].querySelector('[autofocus]');
                                /**
                                 * Auto-focusing of a freshly-opened modal element causes any child elements
                                 * with the autofocus attribute to lose focus. This is an issue on touch
                                 * based devices which will show and then hide the onscreen keyboard.
                                 * Attempts to refocus the autofocus element via JavaScript will not reopen
                                 * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
                                 * the modal element if the modal does not contain an autofocus element.
                                 */
                                if (inputWithAutofocus) {
                                    inputWithAutofocus.focus();
                                } else {
                                    element[0].focus();
                                }
                            }
                        });

                        // Notify {@link $modalStack} that modal is rendered.
                        var modal = $modalStack.getTop();
                        if (modal) {
                            $modalStack.modalRendered(modal.key);
                        }
                    });
                }
            };
        }])

    .directive('uibModalAnimationClass', function () {
        return {
            compile: function (tElement, tAttrs) {
                if (tAttrs.modalAnimation) {
                    tElement.addClass(tAttrs.uibModalAnimationClass);
                }
            }
        };
    })

    .directive('uibModalTransclude', function () {
        return {
            link: function (scope, element, attrs, controller, transclude) {
                transclude(scope.$parent, function (clone) {
                    element.empty();
                    element.append(clone);
                });
            }
        };
    })

    .factory('$uibModalStack', ['$animate', '$animateCss', '$document',
        '$compile', '$rootScope', '$q', '$$multiMap', '$$stackedMap',
        function ($animate, $animateCss, $document, $compile, $rootScope, $q, $$multiMap, $$stackedMap) {
            var OPENED_MODAL_CLASS = 'modal-open';

            var backdropDomEl, backdropScope;
            var openedWindows = $$stackedMap.createNew();
            var openedClasses = $$multiMap.createNew();
            var $modalStack = {
                NOW_CLOSING_EVENT: 'modal.stack.now-closing'
            };

            //Modal focus behavior
            var focusableElementList;
            var focusIndex = 0;
            var tababbleSelector = 'a[href], area[href], input:not([disabled]), ' +
                'button:not([disabled]),select:not([disabled]), textarea:not([disabled]), ' +
                'iframe, object, embed, *[tabindex], *[contenteditable=true]';

            function backdropIndex() {
                var topBackdropIndex = -1;
                var opened = openedWindows.keys();
                for (var i = 0; i < opened.length; i++) {
                    if (openedWindows.get(opened[i]).value.backdrop) {
                        topBackdropIndex = i;
                    }
                }
                return topBackdropIndex;
            }

            $rootScope.$watch(backdropIndex, function (newBackdropIndex) {
                if (backdropScope) {
                    backdropScope.index = newBackdropIndex;
                }
            });

            function removeModalWindow(modalInstance, elementToReceiveFocus) {
                var modalWindow = openedWindows.get(modalInstance).value;
                var appendToElement = modalWindow.appendTo;

                //clean up the stack
                openedWindows.remove(modalInstance);

                removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, function () {
                    var modalBodyClass = modalWindow.openedClass || OPENED_MODAL_CLASS;
                    openedClasses.remove(modalBodyClass, modalInstance);
                    appendToElement.toggleClass(modalBodyClass, openedClasses.hasKey(modalBodyClass));
                    toggleTopWindowClass(true);
                }, modalWindow.closedDeferred);
                checkRemoveBackdrop();

                //move focus to specified element if available, or else to body
                if (elementToReceiveFocus && elementToReceiveFocus.focus) {
                    elementToReceiveFocus.focus();
                } else if (appendToElement.focus) {
                    appendToElement.focus();
                }
            }

            // Add or remove "windowTopClass" from the top window in the stack
            function toggleTopWindowClass(toggleSwitch) {
                var modalWindow;

                if (openedWindows.length() > 0) {
                    modalWindow = openedWindows.top().value;
                    modalWindow.modalDomEl.toggleClass(modalWindow.windowTopClass || '', toggleSwitch);
                }
            }

            function checkRemoveBackdrop() {
                //remove backdrop if no longer needed
                if (backdropDomEl && backdropIndex() === -1) {
                    var backdropScopeRef = backdropScope;
                    removeAfterAnimate(backdropDomEl, backdropScope, function () {
                        backdropScopeRef = null;
                    });
                    backdropDomEl = undefined;
                    backdropScope = undefined;
                }
            }

            function removeAfterAnimate(domEl, scope, done, closedDeferred) {
                var asyncDeferred;
                var asyncPromise = null;
                var setIsAsync = function () {
                    if (!asyncDeferred) {
                        asyncDeferred = $q.defer();
                        asyncPromise = asyncDeferred.promise;
                    }

                    return function asyncDone() {
                        asyncDeferred.resolve();
                    };
                };
                scope.$broadcast($modalStack.NOW_CLOSING_EVENT, setIsAsync);

                // Note that it's intentional that asyncPromise might be null.
                // That's when setIsAsync has not been called during the
                // NOW_CLOSING_EVENT broadcast.
                return $q.when(asyncPromise).then(afterAnimating);

                function afterAnimating() {
                    if (afterAnimating.done) {
                        return;
                    }
                    afterAnimating.done = true;

                    $animateCss(domEl, {
                        event: 'leave'
                    }).start().then(function () {
                        domEl.remove();
                        if (closedDeferred) {
                            closedDeferred.resolve();
                        }
                    });

                    scope.$destroy();
                    if (done) {
                        done();
                    }
                }
            }

            $document.on('keydown', keydownListener);

            $rootScope.$on('$destroy', function () {
                $document.off('keydown', keydownListener);
            });

            function keydownListener(evt) {
                if (evt.isDefaultPrevented()) {
                    return evt;
                }

                var modal = openedWindows.top();
                if (modal) {
                    switch (evt.which) {
                        case 27:
                        {
                            if (modal.value.keyboard) {
                                evt.preventDefault();
                                $rootScope.$apply(function () {
                                    $modalStack.dismiss(modal.key, 'escape key press');
                                });
                            }
                            break;
                        }
                        case 9:
                        {
                            $modalStack.loadFocusElementList(modal);
                            var focusChanged = false;
                            if (evt.shiftKey) {
                                if ($modalStack.isFocusInFirstItem(evt) || $modalStack.isModalFocused(evt, modal)) {
                                    focusChanged = $modalStack.focusLastFocusableElement();
                                }
                            } else {
                                if ($modalStack.isFocusInLastItem(evt)) {
                                    focusChanged = $modalStack.focusFirstFocusableElement();
                                }
                            }

                            if (focusChanged) {
                                evt.preventDefault();
                                evt.stopPropagation();
                            }
                            break;
                        }
                    }
                }
            }

            $modalStack.open = function (modalInstance, modal) {
                var modalOpener = $document[0].activeElement,
                    modalBodyClass = modal.openedClass || OPENED_MODAL_CLASS;

                toggleTopWindowClass(false);

                openedWindows.add(modalInstance, {
                    deferred: modal.deferred,
                    renderDeferred: modal.renderDeferred,
                    closedDeferred: modal.closedDeferred,
                    modalScope: modal.scope,
                    backdrop: modal.backdrop,
                    keyboard: modal.keyboard,
                    openedClass: modal.openedClass,
                    windowTopClass: modal.windowTopClass,
                    animation: modal.animation,
                    appendTo: modal.appendTo
                });

                openedClasses.put(modalBodyClass, modalInstance);

                var appendToElement = modal.appendTo,
                    currBackdropIndex = backdropIndex();

                if (!appendToElement.length) {
                    throw new Error('appendTo element not found. Make sure that the element passed is in DOM.');
                }

                if (currBackdropIndex >= 0 && !backdropDomEl) {
                    backdropScope = $rootScope.$new(true);
                    backdropScope.modalOptions = modal;
                    backdropScope.index = currBackdropIndex;
                    backdropDomEl = angular.element('<div uib-modal-backdrop="modal-backdrop"></div>');
                    backdropDomEl.attr('backdrop-class', modal.backdropClass);
                    if (modal.animation) {
                        backdropDomEl.attr('modal-animation', 'true');
                    }
                    $compile(backdropDomEl)(backdropScope);
                    $animate.enter(backdropDomEl, appendToElement);
                }

                var angularDomEl = angular.element('<div uib-modal-window="modal-window"></div>');
                angularDomEl.attr({
                    'template-url': modal.windowTemplateUrl,
                    'window-class': modal.windowClass,
                    'window-top-class': modal.windowTopClass,
                    'size': modal.size,
                    'index': openedWindows.length() - 1,
                    'animate': 'animate'
                }).html(modal.content);
                if (modal.animation) {
                    angularDomEl.attr('modal-animation', 'true');
                }

                $animate.enter($compile(angularDomEl)(modal.scope), appendToElement)
                    .then(function () {
                        $animate.addClass(appendToElement, modalBodyClass);
                    });

                openedWindows.top().value.modalDomEl = angularDomEl;
                openedWindows.top().value.modalOpener = modalOpener;

                $modalStack.clearFocusListCache();
            };

            function broadcastClosing(modalWindow, resultOrReason, closing) {
                return !modalWindow.value.modalScope.$broadcast('modal.closing', resultOrReason, closing).defaultPrevented;
            }

            $modalStack.close = function (modalInstance, result) {
                var modalWindow = openedWindows.get(modalInstance);
                if (modalWindow && broadcastClosing(modalWindow, result, true)) {
                    modalWindow.value.modalScope.$$uibDestructionScheduled = true;
                    modalWindow.value.deferred.resolve(result);
                    removeModalWindow(modalInstance, modalWindow.value.modalOpener);
                    return true;
                }
                return !modalWindow;
            };

            $modalStack.dismiss = function (modalInstance, reason) {
                var modalWindow = openedWindows.get(modalInstance);
                if (modalWindow && broadcastClosing(modalWindow, reason, false)) {
                    modalWindow.value.modalScope.$$uibDestructionScheduled = true;
                    modalWindow.value.deferred.reject(reason);
                    removeModalWindow(modalInstance, modalWindow.value.modalOpener);
                    return true;
                }
                return !modalWindow;
            };

            $modalStack.dismissAll = function (reason) {
                var topModal = this.getTop();
                while (topModal && this.dismiss(topModal.key, reason)) {
                    topModal = this.getTop();
                }
            };

            $modalStack.getTop = function () {
                return openedWindows.top();
            };

            $modalStack.modalRendered = function (modalInstance) {
                var modalWindow = openedWindows.get(modalInstance);
                if (modalWindow) {
                    modalWindow.value.renderDeferred.resolve();
                }
            };

            $modalStack.focusFirstFocusableElement = function () {
                if (focusableElementList.length > 0) {
                    focusableElementList[0].focus();
                    return true;
                }
                return false;
            };
            $modalStack.focusLastFocusableElement = function () {
                if (focusableElementList.length > 0) {
                    focusableElementList[focusableElementList.length - 1].focus();
                    return true;
                }
                return false;
            };

            $modalStack.isModalFocused = function (evt, modalWindow) {
                if (evt && modalWindow) {
                    var modalDomEl = modalWindow.value.modalDomEl;
                    if (modalDomEl && modalDomEl.length) {
                        return (evt.target || evt.srcElement) === modalDomEl[0];
                    }
                }
                return false;
            };

            $modalStack.isFocusInFirstItem = function (evt) {
                if (focusableElementList.length > 0) {
                    return (evt.target || evt.srcElement) === focusableElementList[0];
                }
                return false;
            };

            $modalStack.isFocusInLastItem = function (evt) {
                if (focusableElementList.length > 0) {
                    return (evt.target || evt.srcElement) === focusableElementList[focusableElementList.length - 1];
                }
                return false;
            };

            $modalStack.clearFocusListCache = function () {
                focusableElementList = [];
                focusIndex = 0;
            };

            $modalStack.loadFocusElementList = function (modalWindow) {
                if (focusableElementList === undefined || !focusableElementList.length) {
                    if (modalWindow) {
                        var modalDomE1 = modalWindow.value.modalDomEl;
                        if (modalDomE1 && modalDomE1.length) {
                            focusableElementList = modalDomE1[0].querySelectorAll(tababbleSelector);
                        }
                    }
                }
            };

            return $modalStack;
        }])

    .provider('$uibModal', function () {
        var $modalProvider = {
            options: {
                animation: true,
                backdrop: true, //can also be false or 'static'
                keyboard: true
            },
            $get: ['$rootScope', '$q', '$document', '$templateRequest', '$controller', '$uibResolve', '$uibModalStack',
                function ($rootScope, $q, $document, $templateRequest, $controller, $uibResolve, $modalStack) {
                    var $modal = {};

                    function getTemplatePromise(options) {
                        return options.template ? $q.when(options.template) :
                            $templateRequest(angular.isFunction(options.templateUrl) ?
                                options.templateUrl() : options.templateUrl);
                    }

                    var promiseChain = null;
                    $modal.getPromiseChain = function () {
                        return promiseChain;
                    };

                    $modal.open = function (modalOptions) {
                        var modalResultDeferred = $q.defer();
                        var modalOpenedDeferred = $q.defer();
                        var modalClosedDeferred = $q.defer();
                        var modalRenderDeferred = $q.defer();

                        //prepare an instance of a modal to be injected into controllers and returned to a caller
                        var modalInstance = {
                            result: modalResultDeferred.promise,
                            opened: modalOpenedDeferred.promise,
                            closed: modalClosedDeferred.promise,
                            rendered: modalRenderDeferred.promise,
                            close: function (result) {
                                return $modalStack.close(modalInstance, result);
                            },
                            dismiss: function (reason) {
                                return $modalStack.dismiss(modalInstance, reason);
                            }
                        };

                        //merge and clean up options
                        modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                        modalOptions.resolve = modalOptions.resolve || {};
                        modalOptions.appendTo = modalOptions.appendTo || $document.find('body').eq(0);

                        //verify options
                        if (!modalOptions.template && !modalOptions.templateUrl) {
                            throw new Error('One of template or templateUrl options is required.');
                        }

                        var templateAndResolvePromise =
                            $q.all([getTemplatePromise(modalOptions), $uibResolve.resolve(modalOptions.resolve, {}, null, null)]);

                        function resolveWithTemplate() {
                            return templateAndResolvePromise;
                        }

                        // Wait for the resolution of the existing promise chain.
                        // Then switch to our own combined promise dependency (regardless of how the previous modal fared).
                        // Then add to $modalStack and resolve opened.
                        // Finally clean up the chain variable if no subsequent modal has overwritten it.
                        var samePromise;
                        samePromise = promiseChain = $q.all([promiseChain])
                            .then(resolveWithTemplate, resolveWithTemplate)
                            .then(function resolveSuccess(tplAndVars) {
                                var providedScope = modalOptions.scope || $rootScope;

                                var modalScope = providedScope.$new();
                                modalScope.$close = modalInstance.close;
                                modalScope.$dismiss = modalInstance.dismiss;

                                modalScope.$on('$destroy', function () {
                                    if (!modalScope.$$uibDestructionScheduled) {
                                        modalScope.$dismiss('$uibUnscheduledDestruction');
                                    }
                                });

                                var ctrlInstance, ctrlLocals = {};

                                //controllers
                                if (modalOptions.controller) {
                                    ctrlLocals.$scope = modalScope;
                                    ctrlLocals.$uibModalInstance = modalInstance;
                                    angular.forEach(tplAndVars[1], function (value, key) {
                                        ctrlLocals[key] = value;
                                    });

                                    ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                                    if (modalOptions.controllerAs) {
                                        if (modalOptions.bindToController) {
                                            ctrlInstance.$close = modalScope.$close;
                                            ctrlInstance.$dismiss = modalScope.$dismiss;
                                            angular.extend(ctrlInstance, providedScope);
                                        }

                                        modalScope[modalOptions.controllerAs] = ctrlInstance;
                                    }
                                }

                                $modalStack.open(modalInstance, {
                                    scope: modalScope,
                                    deferred: modalResultDeferred,
                                    renderDeferred: modalRenderDeferred,
                                    closedDeferred: modalClosedDeferred,
                                    content: tplAndVars[0],
                                    animation: modalOptions.animation,
                                    backdrop: modalOptions.backdrop,
                                    keyboard: modalOptions.keyboard,
                                    backdropClass: modalOptions.backdropClass,
                                    windowTopClass: modalOptions.windowTopClass,
                                    windowClass: modalOptions.windowClass,
                                    windowTemplateUrl: modalOptions.windowTemplateUrl,
                                    size: modalOptions.size,
                                    openedClass: modalOptions.openedClass,
                                    appendTo: modalOptions.appendTo
                                });
                                modalOpenedDeferred.resolve(true);

                            }, function resolveError(reason) {
                                modalOpenedDeferred.reject(reason);
                                modalResultDeferred.reject(reason);
                            })['finally'](function () {
                            if (promiseChain === samePromise) {
                                promiseChain = null;
                            }
                        });

                        return modalInstance;
                    };

                    return $modal;
                }
            ]
        };

        return $modalProvider;
    });

angular.module('ui.bootstrap.paging', [])
/**
 * Helper internal service for generating common controller code between the
 * pager and pagination components
 */
    .factory('uibPaging', ['$parse', function ($parse) {
        return {
            create: function (ctrl, $scope, $attrs) {
                ctrl.setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;
                ctrl.ngModelCtrl = { $setViewValue: angular.noop }; // nullModelCtrl
                ctrl._watchers = [];

                ctrl.init = function (ngModelCtrl, config) {
                    ctrl.ngModelCtrl = ngModelCtrl;
                    ctrl.config = config;

                    ngModelCtrl.$render = function () {
                        ctrl.render();
                    };

                    if ($attrs.itemsPerPage) {
                        ctrl._watchers.push($scope.$parent.$watch($parse($attrs.itemsPerPage), function (value) {
                            ctrl.itemsPerPage = parseInt(value, 10);
                            $scope.totalPages = ctrl.calculateTotalPages();
                            ctrl.updatePage();
                        }));
                    } else {
                        ctrl.itemsPerPage = config.itemsPerPage;
                    }

                    $scope.$watch('totalItems', function (newTotal, oldTotal) {
                        if (angular.isDefined(newTotal) || newTotal !== oldTotal) {
                            $scope.totalPages = ctrl.calculateTotalPages();
                            ctrl.updatePage();
                        }
                    });
                };

                ctrl.calculateTotalPages = function () {
                    var totalPages = ctrl.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / ctrl.itemsPerPage);
                    return Math.max(totalPages || 0, 1);
                };

                ctrl.render = function () {
                    $scope.page = parseInt(ctrl.ngModelCtrl.$viewValue, 10) || 1;
                };

                $scope.selectPage = function (page, evt) {
                    if (evt) {
                        evt.preventDefault();
                    }

                    var clickAllowed = !$scope.ngDisabled || !evt;
                    if (clickAllowed && $scope.page !== page && page > 0 && page <= $scope.totalPages) {
                        if (evt && evt.target) {
                            evt.target.blur();
                        }
                        ctrl.ngModelCtrl.$setViewValue(page);
                        ctrl.ngModelCtrl.$render();
                    }
                };

                $scope.getText = function (key) {
                    return $scope[key + 'Text'] || ctrl.config[key + 'Text'];
                };

                $scope.noPrevious = function () {
                    return $scope.page === 1;
                };

                $scope.noNext = function () {
                    return $scope.page === $scope.totalPages;
                };

                ctrl.updatePage = function () {
                    ctrl.setNumPages($scope.$parent, $scope.totalPages); // Readonly variable

                    if ($scope.page > $scope.totalPages) {
                        $scope.selectPage($scope.totalPages);
                    } else {
                        ctrl.ngModelCtrl.$render();
                    }
                };

                $scope.$on('$destroy', function () {
                    while (ctrl._watchers.length) {
                        ctrl._watchers.shift()();
                    }
                });
            }
        };
    }]);

angular.module('ui.bootstrap.pager', ['ui.bootstrap.paging'])

    .controller('UibPagerController', ['$scope', '$attrs', 'uibPaging', 'uibPagerConfig', function ($scope, $attrs, uibPaging, uibPagerConfig) {
        $scope.align = angular.isDefined($attrs.align) ? $scope.$parent.$eval($attrs.align) : uibPagerConfig.align;

        uibPaging.create(this, $scope, $attrs);
    }])

    .constant('uibPagerConfig', {
        itemsPerPage: 10,
        previousText: 'Â« Previous',
        nextText: 'Next Â»',
        align: true
    })

    .directive('uibPager', ['uibPagerConfig', function (uibPagerConfig) {
        return {
            scope: {
                totalItems: '=',
                previousText: '@',
                nextText: '@',
                ngDisabled: '='
            },
            require: ['uibPager', '?ngModel'],
            controller: 'UibPagerController',
            controllerAs: 'pager',
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/pager/pager.html';
            },
            replace: true,
            link: function (scope, element, attrs, ctrls) {
                var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                if (!ngModelCtrl) {
                    return; // do nothing if no ng-model
                }

                paginationCtrl.init(ngModelCtrl, uibPagerConfig);
            }
        };
    }]);

angular.module('ui.bootstrap.pagination', ['ui.bootstrap.paging'])
    .controller('UibPaginationController', ['$scope', '$attrs', '$parse', 'uibPaging', 'uibPaginationConfig', function ($scope, $attrs, $parse, uibPaging, uibPaginationConfig) {
        var ctrl = this;
        // Setup configuration parameters
        var maxSize = angular.isDefined($attrs.maxSize) ? $scope.$parent.$eval($attrs.maxSize) : uibPaginationConfig.maxSize,
            rotate = angular.isDefined($attrs.rotate) ? $scope.$parent.$eval($attrs.rotate) : uibPaginationConfig.rotate,
            forceEllipses = angular.isDefined($attrs.forceEllipses) ? $scope.$parent.$eval($attrs.forceEllipses) : uibPaginationConfig.forceEllipses,
            boundaryLinkNumbers = angular.isDefined($attrs.boundaryLinkNumbers) ? $scope.$parent.$eval($attrs.boundaryLinkNumbers) : uibPaginationConfig.boundaryLinkNumbers;
        $scope.boundaryLinks = angular.isDefined($attrs.boundaryLinks) ? $scope.$parent.$eval($attrs.boundaryLinks) : uibPaginationConfig.boundaryLinks;
        $scope.directionLinks = angular.isDefined($attrs.directionLinks) ? $scope.$parent.$eval($attrs.directionLinks) : uibPaginationConfig.directionLinks;

        uibPaging.create(this, $scope, $attrs);

        if ($attrs.maxSize) {
            ctrl._watchers.push($scope.$parent.$watch($parse($attrs.maxSize), function (value) {
                maxSize = parseInt(value, 10);
                ctrl.render();
            }));
        }

        // Create page object used in template
        function makePage(number, text, isActive) {
            return {
                number: number,
                text: text,
                active: isActive
            };
        }

        function getPages(currentPage, totalPages) {
            var pages = [];

            // Default page limits
            var startPage = 1, endPage = totalPages;
            var isMaxSized = angular.isDefined(maxSize) && maxSize < totalPages;

            // recompute if maxSize
            if (isMaxSized) {
                if (rotate) {
                    // Current page is displayed in the middle of the visible ones
                    startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
                    endPage = startPage + maxSize - 1;

                    // Adjust if limit is exceeded
                    if (endPage > totalPages) {
                        endPage = totalPages;
                        startPage = endPage - maxSize + 1;
                    }
                } else {
                    // Visible pages are paginated with maxSize
                    startPage = (Math.ceil(currentPage / maxSize) - 1) * maxSize + 1;

                    // Adjust last page if limit is exceeded
                    endPage = Math.min(startPage + maxSize - 1, totalPages);
                }
            }

            // Add page number links
            for (var number = startPage; number <= endPage; number++) {
                var page = makePage(number, number, number === currentPage);
                pages.push(page);
            }

            // Add links to move between page sets
            if (isMaxSized && maxSize > 0 && (!rotate || forceEllipses || boundaryLinkNumbers)) {
                if (startPage > 1) {
                    if (!boundaryLinkNumbers || startPage > 3) { //need ellipsis for all options unless range is too close to beginning
                        var previousPageSet = makePage(startPage - 1, '...', false);
                        pages.unshift(previousPageSet);
                    }
                    if (boundaryLinkNumbers) {
                        if (startPage === 3) { //need to replace ellipsis when the buttons would be sequential
                            var secondPageLink = makePage(2, '2', false);
                            pages.unshift(secondPageLink);
                        }
                        //add the first page
                        var firstPageLink = makePage(1, '1', false);
                        pages.unshift(firstPageLink);
                    }
                }

                if (endPage < totalPages) {
                    if (!boundaryLinkNumbers || endPage < totalPages - 2) { //need ellipsis for all options unless range is too close to end
                        var nextPageSet = makePage(endPage + 1, '...', false);
                        pages.push(nextPageSet);
                    }
                    if (boundaryLinkNumbers) {
                        if (endPage === totalPages - 2) { //need to replace ellipsis when the buttons would be sequential
                            var secondToLastPageLink = makePage(totalPages - 1, totalPages - 1, false);
                            pages.push(secondToLastPageLink);
                        }
                        //add the last page
                        var lastPageLink = makePage(totalPages, totalPages, false);
                        pages.push(lastPageLink);
                    }
                }
            }
            return pages;
        }

        var originalRender = this.render;
        this.render = function () {
            originalRender();
            if ($scope.page > 0 && $scope.page <= $scope.totalPages) {
                $scope.pages = getPages($scope.page, $scope.totalPages);
            }
        };
    }])

    .constant('uibPaginationConfig', {
        itemsPerPage: 10,
        boundaryLinks: false,
        boundaryLinkNumbers: false,
        directionLinks: true,
        firstText: 'First',
        previousText: 'Previous',
        nextText: 'Next',
        lastText: 'Last',
        rotate: true,
        forceEllipses: false
    })

    .directive('uibPagination', ['$parse', 'uibPaginationConfig', function ($parse, uibPaginationConfig) {
        return {
            scope: {
                totalItems: '=',
                firstText: '@',
                previousText: '@',
                nextText: '@',
                lastText: '@',
                ngDisabled: '='
            },
            require: ['uibPagination', '?ngModel'],
            controller: 'UibPaginationController',
            controllerAs: 'pagination',
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'uib/template/pagination/pagination.html';
            },
            replace: true,
            link: function (scope, element, attrs, ctrls) {
                var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                if (!ngModelCtrl) {
                    return; // do nothing if no ng-model
                }

                paginationCtrl.init(ngModelCtrl, uibPaginationConfig);
            }
        };
    }]);

/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module('ui.bootstrap.tooltip', ['ui.bootstrap.position', 'ui.bootstrap.stackedMap'])

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
    .provider('$uibTooltip', function () {
        // The default options tooltip and popover.
        var defaultOptions = {
            placement: 'top',
            placementClassPrefix: '',
            animation: true,
            popupDelay: 0,
            popupCloseDelay: 0,
            useContentExp: false
        };

        // Default hide triggers for each show trigger
        var triggerMap = {
            'mouseenter': 'mouseleave',
            'click': 'click',
            'outsideClick': 'outsideClick',
            'focus': 'blur',
            'none': ''
        };

        // The options specified to the provider globally.
        var globalOptions = {};

        /**
         * `options({})` allows global configuration of all tooltips in the
         * application.
         *
         *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
         */
        this.options = function (value) {
            angular.extend(globalOptions, value);
        };

        /**
         * This allows you to extend the set of trigger mappings available. E.g.:
         *
         *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
         */
        this.setTriggers = function setTriggers(triggers) {
            angular.extend(triggerMap, triggers);
        };

        /**
         * This is a helper function for translating camel-case to snake_case.
         */
        function snake_case(name) {
            var regexp = /[A-Z]/g;
            var separator = '-';
            return name.replace(regexp, function (letter, pos) {
                return (pos ? separator : '') + letter.toLowerCase();
            });
        }

        /**
         * Returns the actual instance of the $tooltip service.
         * TODO support multiple triggers
         */
        this.$get = ['$window', '$compile', '$timeout', '$document', '$uibPosition', '$interpolate', '$rootScope', '$parse', '$$stackedMap', function ($window, $compile, $timeout, $document, $position, $interpolate, $rootScope, $parse, $$stackedMap) {
            var openedTooltips = $$stackedMap.createNew();
            $document.on('keypress', keypressListener);

            $rootScope.$on('$destroy', function () {
                $document.off('keypress', keypressListener);
            });

            function keypressListener(e) {
                if (e.which === 27) {
                    var last = openedTooltips.top();
                    if (last) {
                        last.value.close();
                        openedTooltips.removeTop();
                        last = null;
                    }
                }
            }

            return function $tooltip(ttType, prefix, defaultTriggerShow, options) {
                options = angular.extend({}, defaultOptions, globalOptions, options);

                /**
                 * Returns an object of show and hide triggers.
                 *
                 * If a trigger is supplied,
                 * it is used to show the tooltip; otherwise, it will use the `trigger`
                 * option passed to the `$tooltipProvider.options` method; else it will
                 * default to the trigger supplied to this directive factory.
                 *
                 * The hide trigger is based on the show trigger. If the `trigger` option
                 * was passed to the `$tooltipProvider.options` method, it will use the
                 * mapped trigger from `triggerMap` or the passed trigger if the map is
                 * undefined; otherwise, it uses the `triggerMap` value of the show
                 * trigger; else it will just use the show trigger.
                 */
                function getTriggers(trigger) {
                    var show = (trigger || options.trigger || defaultTriggerShow).split(' ');
                    var hide = show.map(function (trigger) {
                        return triggerMap[trigger] || trigger;
                    });
                    return {
                        show: show,
                        hide: hide
                    };
                }

                var directiveName = snake_case(ttType);

                var startSym = $interpolate.startSymbol();
                var endSym = $interpolate.endSymbol();
                var template =
                    '<div ' + directiveName + '-popup ' +
                    'title="' + startSym + 'title' + endSym + '" ' +
                    (options.useContentExp ?
                        'content-exp="contentExp()" ' :
                        'content="' + startSym + 'content' + endSym + '" ') +
                    'placement="' + startSym + 'placement' + endSym + '" ' +
                    'popup-class="' + startSym + 'popupClass' + endSym + '" ' +
                    'animation="animation" ' +
                    'is-open="isOpen"' +
                    'origin-scope="origScope" ' +
                    'style="visibility: hidden; display: block; top: -9999px; left: -9999px;"' +
                    '>' +
                    '</div>';

                return {
                    compile: function (tElem, tAttrs) {
                        var tooltipLinker = $compile(template);

                        return function link(scope, element, attrs, tooltipCtrl) {
                            var tooltip;
                            var tooltipLinkedScope;
                            var transitionTimeout;
                            var showTimeout;
                            var hideTimeout;
                            var positionTimeout;
                            var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
                            var triggers = getTriggers(undefined);
                            var hasEnableExp = angular.isDefined(attrs[prefix + 'Enable']);
                            var ttScope = scope.$new(true);
                            var repositionScheduled = false;
                            var isOpenParse = angular.isDefined(attrs[prefix + 'IsOpen']) ? $parse(attrs[prefix + 'IsOpen']) : false;
                            var contentParse = options.useContentExp ? $parse(attrs[ttType]) : false;
                            var observers = [];

                            var positionTooltip = function () {
                                // check if tooltip exists and is not empty
                                if (!tooltip || !tooltip.html()) {
                                    return;
                                }

                                if (!positionTimeout) {
                                    positionTimeout = $timeout(function () {
                                        // Reset the positioning.
                                        tooltip.css({ top: 0, left: 0 });

                                        // Now set the calculated positioning.
                                        var ttPosition = $position.positionElements(element, tooltip, ttScope.placement, appendToBody);
                                        tooltip.css({ top: ttPosition.top + 'px', left: ttPosition.left + 'px', visibility: 'visible' });

                                        // If the placement class is prefixed, still need
                                        // to remove the TWBS standard class.
                                        if (options.placementClassPrefix) {
                                            tooltip.removeClass('top bottom left right');
                                        }

                                        tooltip.removeClass(
                                                options.placementClassPrefix + 'top ' +
                                                options.placementClassPrefix + 'top-left ' +
                                                options.placementClassPrefix + 'top-right ' +
                                                options.placementClassPrefix + 'bottom ' +
                                                options.placementClassPrefix + 'bottom-left ' +
                                                options.placementClassPrefix + 'bottom-right ' +
                                                options.placementClassPrefix + 'left ' +
                                                options.placementClassPrefix + 'left-top ' +
                                                options.placementClassPrefix + 'left-bottom ' +
                                                options.placementClassPrefix + 'right ' +
                                                options.placementClassPrefix + 'right-top ' +
                                                options.placementClassPrefix + 'right-bottom');

                                        var placement = ttPosition.placement.split('-');
                                        tooltip.addClass(placement[0] + ' ' + options.placementClassPrefix + ttPosition.placement);
                                        $position.positionArrow(tooltip, ttPosition.placement);

                                        positionTimeout = null;
                                    }, 0, false);
                                }
                            };

                            // Set up the correct scope to allow transclusion later
                            ttScope.origScope = scope;

                            // By default, the tooltip is not open.
                            // TODO add ability to start tooltip opened
                            ttScope.isOpen = false;
                            openedTooltips.add(ttScope, {
                                close: hide
                            });

                            function toggleTooltipBind() {
                                if (!ttScope.isOpen) {
                                    showTooltipBind();
                                } else {
                                    hideTooltipBind();
                                }
                            }

                            // Show the tooltip with delay if specified, otherwise show it immediately
                            function showTooltipBind() {
                                if (hasEnableExp && !scope.$eval(attrs[prefix + 'Enable'])) {
                                    return;
                                }

                                cancelHide();
                                prepareTooltip();

                                if (ttScope.popupDelay) {
                                    // Do nothing if the tooltip was already scheduled to pop-up.
                                    // This happens if show is triggered multiple times before any hide is triggered.
                                    if (!showTimeout) {
                                        showTimeout = $timeout(show, ttScope.popupDelay, false);
                                    }
                                } else {
                                    show();
                                }
                            }

                            function hideTooltipBind() {
                                cancelShow();

                                if (ttScope.popupCloseDelay) {
                                    if (!hideTimeout) {
                                        hideTimeout = $timeout(hide, ttScope.popupCloseDelay, false);
                                    }
                                } else {
                                    hide();
                                }
                            }

                            // Show the tooltip popup element.
                            function show() {
                                cancelShow();
                                cancelHide();

                                // Don't show empty tooltips.
                                if (!ttScope.content) {
                                    return angular.noop;
                                }

                                createTooltip();

                                // And show the tooltip.
                                ttScope.$evalAsync(function () {
                                    ttScope.isOpen = true;
                                    assignIsOpen(true);
                                    positionTooltip();
                                });
                            }

                            function cancelShow() {
                                if (showTimeout) {
                                    $timeout.cancel(showTimeout);
                                    showTimeout = null;
                                }

                                if (positionTimeout) {
                                    $timeout.cancel(positionTimeout);
                                    positionTimeout = null;
                                }
                            }

                            // Hide the tooltip popup element.
                            function hide() {
                                if (!ttScope) {
                                    return;
                                }

                                // First things first: we don't show it anymore.
                                ttScope.$evalAsync(function () {
                                    if (ttScope) {
                                        ttScope.isOpen = false;
                                        assignIsOpen(false);
                                        // And now we remove it from the DOM. However, if we have animation, we
                                        // need to wait for it to expire beforehand.
                                        // FIXME: this is a placeholder for a port of the transitions library.
                                        // The fade transition in TWBS is 150ms.
                                        if (ttScope.animation) {
                                            if (!transitionTimeout) {
                                                transitionTimeout = $timeout(removeTooltip, 150, false);
                                            }
                                        } else {
                                            removeTooltip();
                                        }
                                    }
                                });
                            }

                            function cancelHide() {
                                if (hideTimeout) {
                                    $timeout.cancel(hideTimeout);
                                    hideTimeout = null;
                                }

                                if (transitionTimeout) {
                                    $timeout.cancel(transitionTimeout);
                                    transitionTimeout = null;
                                }
                            }

                            function createTooltip() {
                                // There can only be one tooltip element per directive shown at once.
                                if (tooltip) {
                                    return;
                                }

                                tooltipLinkedScope = ttScope.$new();
                                tooltip = tooltipLinker(tooltipLinkedScope, function (tooltip) {
                                    if (appendToBody) {
                                        $document.find('body').append(tooltip);
                                    } else {
                                        element.after(tooltip);
                                    }
                                });

                                prepObservers();
                            }

                            function removeTooltip() {
                                cancelShow();
                                cancelHide();
                                unregisterObservers();

                                if (tooltip) {
                                    tooltip.remove();
                                    tooltip = null;
                                }
                                if (tooltipLinkedScope) {
                                    tooltipLinkedScope.$destroy();
                                    tooltipLinkedScope = null;
                                }
                            }

                            /**
                             * Set the initial scope values. Once
                             * the tooltip is created, the observers
                             * will be added to keep things in sync.
                             */
                            function prepareTooltip() {
                                ttScope.title = attrs[prefix + 'Title'];
                                if (contentParse) {
                                    ttScope.content = contentParse(scope);
                                } else {
                                    ttScope.content = attrs[ttType];
                                }

                                ttScope.popupClass = attrs[prefix + 'Class'];
                                ttScope.placement = angular.isDefined(attrs[prefix + 'Placement']) ? attrs[prefix + 'Placement'] : options.placement;

                                var delay = parseInt(attrs[prefix + 'PopupDelay'], 10);
                                var closeDelay = parseInt(attrs[prefix + 'PopupCloseDelay'], 10);
                                ttScope.popupDelay = !isNaN(delay) ? delay : options.popupDelay;
                                ttScope.popupCloseDelay = !isNaN(closeDelay) ? closeDelay : options.popupCloseDelay;
                            }

                            function assignIsOpen(isOpen) {
                                if (isOpenParse && angular.isFunction(isOpenParse.assign)) {
                                    isOpenParse.assign(scope, isOpen);
                                }
                            }

                            ttScope.contentExp = function () {
                                return ttScope.content;
                            };

                            /**
                             * Observe the relevant attributes.
                             */
                            attrs.$observe('disabled', function (val) {
                                if (val) {
                                    cancelShow();
                                }

                                if (val && ttScope.isOpen) {
                                    hide();
                                }
                            });

                            if (isOpenParse) {
                                scope.$watch(isOpenParse, function (val) {
                                    if (ttScope && !val === ttScope.isOpen) {
                                        toggleTooltipBind();
                                    }
                                });
                            }

                            function prepObservers() {
                                observers.length = 0;

                                if (contentParse) {
                                    observers.push(
                                        scope.$watch(contentParse, function (val) {
                                            ttScope.content = val;
                                            if (!val && ttScope.isOpen) {
                                                hide();
                                            }
                                        })
                                    );

                                    observers.push(
                                        tooltipLinkedScope.$watch(function () {
                                            if (!repositionScheduled) {
                                                repositionScheduled = true;
                                                tooltipLinkedScope.$$postDigest(function () {
                                                    repositionScheduled = false;
                                                    if (ttScope && ttScope.isOpen) {
                                                        positionTooltip();
                                                    }
                                                });
                                            }
                                        })
                                    );
                                } else {
                                    observers.push(
                                        attrs.$observe(ttType, function (val) {
                                            ttScope.content = val;
                                            if (!val && ttScope.isOpen) {
                                                hide();
                                            } else {
                                                positionTooltip();
                                            }
                                        })
                                    );
                                }

                                observers.push(
                                    attrs.$observe(prefix + 'Title', function (val) {
                                        ttScope.title = val;
                                        if (ttScope.isOpen) {
                                            positionTooltip();
                                        }
                                    })
                                );

                                observers.push(
                                    attrs.$observe(prefix + 'Placement', function (val) {
                                        ttScope.placement = val ? val : options.placement;
                                        if (ttScope.isOpen) {
                                            positionTooltip();
                                        }
                                    })
                                );
                            }

                            function unregisterObservers() {
                                if (observers.length) {
                                    angular.forEach(observers, function (observer) {
                                        observer();
                                    });
                                    observers.length = 0;
                                }
                            }

                            // hide tooltips/popovers for outsideClick trigger
                            function bodyHideTooltipBind(e) {
                                if (!ttScope || !ttScope.isOpen || !tooltip) {
                                    return;
                                }
                                // make sure the tooltip/popover link or tool tooltip/popover itself were not clicked
                                if (!element[0].contains(e.target) && !tooltip[0].contains(e.target)) {
                                    hideTooltipBind();
                                }
                            }

                            var unregisterTriggers = function () {
                                triggers.show.forEach(function (trigger) {
                                    if (trigger === 'outsideClick') {
                                        element.off('click', toggleTooltipBind);
                                    } else {
                                        element.off(trigger, showTooltipBind);
                                        element.off(trigger, toggleTooltipBind);
                                    }
                                });
                                triggers.hide.forEach(function (trigger) {
                                    if (trigger === 'outsideClick') {
                                        $document.off('click', bodyHideTooltipBind);
                                    } else {
                                        element.off(trigger, hideTooltipBind);
                                    }
                                });
                            };

                            function prepTriggers() {
                                var val = attrs[prefix + 'Trigger'];
                                unregisterTriggers();

                                triggers = getTriggers(val);

                                if (triggers.show !== 'none') {
                                    triggers.show.forEach(function (trigger, idx) {
                                        if (trigger === 'outsideClick') {
                                            element.on('click', toggleTooltipBind);
                                            $document.on('click', bodyHideTooltipBind);
                                        } else if (trigger === triggers.hide[idx]) {
                                            element.on(trigger, toggleTooltipBind);
                                        } else if (trigger) {
                                            element.on(trigger, showTooltipBind);
                                            element.on(triggers.hide[idx], hideTooltipBind);
                                        }

                                        element.on('keypress', function (e) {
                                            if (e.which === 27) {
                                                hideTooltipBind();
                                            }
                                        });
                                    });
                                }
                            }

                            prepTriggers();

                            var animation = scope.$eval(attrs[prefix + 'Animation']);
                            ttScope.animation = angular.isDefined(animation) ? !!animation : options.animation;

                            var appendToBodyVal;
                            var appendKey = prefix + 'AppendToBody';
                            if (appendKey in attrs && attrs[appendKey] === undefined) {
                                appendToBodyVal = true;
                            } else {
                                appendToBodyVal = scope.$eval(attrs[appendKey]);
                            }

                            appendToBody = angular.isDefined(appendToBodyVal) ? appendToBodyVal : appendToBody;

                            // Make sure tooltip is destroyed and removed.
                            scope.$on('$destroy', function onDestroyTooltip() {
                                unregisterTriggers();
                                removeTooltip();
                                openedTooltips.remove(ttScope);
                                ttScope = null;
                            });
                        };
                    }
                };
            };
        }];
    })

// This is mostly ngInclude code but with a custom scope
    .directive('uibTooltipTemplateTransclude', [
        '$animate', '$sce', '$compile', '$templateRequest',
        function ($animate, $sce, $compile, $templateRequest) {
            return {
                link: function (scope, elem, attrs) {
                    var origScope = scope.$eval(attrs.tooltipTemplateTranscludeScope);

                    var changeCounter = 0,
                        currentScope,
                        previousElement,
                        currentElement;

                    var cleanupLastIncludeContent = function () {
                        if (previousElement) {
                            previousElement.remove();
                            previousElement = null;
                        }

                        if (currentScope) {
                            currentScope.$destroy();
                            currentScope = null;
                        }

                        if (currentElement) {
                            $animate.leave(currentElement).then(function () {
                                previousElement = null;
                            });
                            previousElement = currentElement;
                            currentElement = null;
                        }
                    };

                    scope.$watch($sce.parseAsResourceUrl(attrs.uibTooltipTemplateTransclude), function (src) {
                        var thisChangeId = ++changeCounter;

                        if (src) {
                            //set the 2nd param to true to ignore the template request error so that the inner
                            //contents and scope can be cleaned up.
                            $templateRequest(src, true).then(function (response) {
                                if (thisChangeId !== changeCounter) {
                                    return;
                                }
                                var newScope = origScope.$new();
                                var template = response;

                                var clone = $compile(template)(newScope, function (clone) {
                                    cleanupLastIncludeContent();
                                    $animate.enter(clone, elem);
                                });

                                currentScope = newScope;
                                currentElement = clone;

                                currentScope.$emit('$includeContentLoaded', src);
                            }, function () {
                                if (thisChangeId === changeCounter) {
                                    cleanupLastIncludeContent();
                                    scope.$emit('$includeContentError', src);
                                }
                            });
                            scope.$emit('$includeContentRequested', src);
                        } else {
                            cleanupLastIncludeContent();
                        }
                    });

                    scope.$on('$destroy', cleanupLastIncludeContent);
                }
            };
        }])

/**
 * Note that it's intentional that these classes are *not* applied through $animate.
 * They must not be animated as they're expected to be present on the tooltip on
 * initialization.
 */
    .directive('uibTooltipClasses', ['$uibPosition', function ($uibPosition) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                // need to set the primary position so the
                // arrow has space during position measure.
                // tooltip.positionTooltip()
                if (scope.placement) {
                    // // There are no top-left etc... classes
                    // // in TWBS, so we need the primary position.
                    var position = $uibPosition.parsePlacement(scope.placement);
                    element.addClass(position[0]);
                } else {
                    element.addClass('top');
                }

                if (scope.popupClass) {
                    element.addClass(scope.popupClass);
                }

                if (scope.animation()) {
                    element.addClass(attrs.tooltipAnimationClass);
                }
            }
        };
    }])

    .directive('uibTooltipPopup', function () {
        return {
            replace: true,
            scope: { content: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
            templateUrl: 'uib/template/tooltip/tooltip-popup.html'
        };
    })

    .directive('uibTooltip', [ '$uibTooltip', function ($uibTooltip) {
        return $uibTooltip('uibTooltip', 'tooltip', 'mouseenter');
    }])

    .directive('uibTooltipTemplatePopup', function () {
        return {
            replace: true,
            scope: { contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&',
                originScope: '&' },
            templateUrl: 'uib/template/tooltip/tooltip-template-popup.html'
        };
    })

    .directive('uibTooltipTemplate', ['$uibTooltip', function ($uibTooltip) {
        return $uibTooltip('uibTooltipTemplate', 'tooltip', 'mouseenter', {
            useContentExp: true
        });
    }])

    .directive('uibTooltipHtmlPopup', function () {
        return {
            replace: true,
            scope: { contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
            templateUrl: 'uib/template/tooltip/tooltip-html-popup.html'
        };
    })

    .directive('uibTooltipHtml', ['$uibTooltip', function ($uibTooltip) {
        return $uibTooltip('uibTooltipHtml', 'tooltip', 'mouseenter', {
            useContentExp: true
        });
    }]);

/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, and selector delegatation.
 */
angular.module('ui.bootstrap.popover', ['ui.bootstrap.tooltip'])

    .directive('uibPopoverTemplatePopup', function () {
        return {
            replace: true,
            scope: { title: '@', contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&',
                originScope: '&' },
            templateUrl: 'uib/template/popover/popover-template.html'
        };
    })

    .directive('uibPopoverTemplate', ['$uibTooltip', function ($uibTooltip) {
        return $uibTooltip('uibPopoverTemplate', 'popover', 'click', {
            useContentExp: true
        });
    }])

    .directive('uibPopoverHtmlPopup', function () {
        return {
            replace: true,
            scope: { contentExp: '&', title: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
            templateUrl: 'uib/template/popover/popover-html.html'
        };
    })

    .directive('uibPopoverHtml', ['$uibTooltip', function ($uibTooltip) {
        return $uibTooltip('uibPopoverHtml', 'popover', 'click', {
            useContentExp: true
        });
    }])

    .directive('uibPopoverPopup', function () {
        return {
            replace: true,
            scope: { title: '@', content: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
            templateUrl: 'uib/template/popover/popover.html'
        };
    })

    .directive('uibPopover', ['$uibTooltip', function ($uibTooltip) {
        return $uibTooltip('uibPopover', 'popover', 'click');
    }]);

angular.module('ui.bootstrap.progressbar', [])

    .constant('uibProgressConfig', {
        animate: true,
        max: 100
    })

    .controller('UibProgressController', ['$scope', '$attrs', 'uibProgressConfig', function ($scope, $attrs, progressConfig) {
        var self = this,
            animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

        this.bars = [];
        $scope.max = angular.isDefined($scope.max) ? $scope.max : progressConfig.max;

        this.addBar = function (bar, element, attrs) {
            if (!animate) {
                element.css({'transition': 'none'});
            }

            this.bars.push(bar);

            bar.max = $scope.max;
            bar.title = attrs && angular.isDefined(attrs.title) ? attrs.title : 'progressbar';

            bar.$watch('value', function (value) {
                bar.recalculatePercentage();
            });

            bar.recalculatePercentage = function () {
                var totalPercentage = self.bars.reduce(function (total, bar) {
                    bar.percent = +(100 * bar.value / bar.max).toFixed(2);
                    return total + bar.percent;
                }, 0);

                if (totalPercentage > 100) {
                    bar.percent -= totalPercentage - 100;
                }
            };

            bar.$on('$destroy', function () {
                element = null;
                self.removeBar(bar);
            });
        };

        this.removeBar = function (bar) {
            this.bars.splice(this.bars.indexOf(bar), 1);
            this.bars.forEach(function (bar) {
                bar.recalculatePercentage();
            });
        };

        $scope.$watch('max', function (max) {
            self.bars.forEach(function (bar) {
                bar.max = $scope.max;
                bar.recalculatePercentage();
            });
        });
    }])

    .directive('uibProgress', function () {
        return {
            replace: true,
            transclude: true,
            controller: 'UibProgressController',
            require: 'uibProgress',
            scope: {
                max: '=?'
            },
            templateUrl: 'uib/template/progressbar/progress.html'
        };
    })

    .directive('uibBar', function () {
        return {
            replace: true,
            transclude: true,
            require: '^uibProgress',
            scope: {
                value: '=',
                type: '@'
            },
            templateUrl: 'uib/template/progressbar/bar.html',
            link: function (scope, element, attrs, progressCtrl) {
                progressCtrl.addBar(scope, element, attrs);
            }
        };
    })

    .directive('uibProgressbar', function () {
        return {
            replace: true,
            transclude: true,
            controller: 'UibProgressController',
            scope: {
                value: '=',
                max: '=?',
                type: '@'
            },
            templateUrl: 'uib/template/progressbar/progressbar.html',
            link: function (scope, element, attrs, progressCtrl) {
                progressCtrl.addBar(scope, angular.element(element.children()[0]), {title: attrs.title});
            }
        };
    });

angular.module('ui.bootstrap.rating', [])

    .constant('uibRatingConfig', {
        max: 5,
        stateOn: null,
        stateOff: null,
        titles: ['one', 'two', 'three', 'four', 'five']
    })

    .controller('UibRatingController', ['$scope', '$attrs', 'uibRatingConfig', function ($scope, $attrs, ratingConfig) {
        var ngModelCtrl = { $setViewValue: angular.noop };

        this.init = function (ngModelCtrl_) {
            ngModelCtrl = ngModelCtrl_;
            ngModelCtrl.$render = this.render;

            ngModelCtrl.$formatters.push(function (value) {
                if (angular.isNumber(value) && value << 0 !== value) {
                    value = Math.round(value);
                }

                return value;
            });

            this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
            this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
            var tmpTitles = angular.isDefined($attrs.titles) ? $scope.$parent.$eval($attrs.titles) : ratingConfig.titles;
            this.titles = angular.isArray(tmpTitles) && tmpTitles.length > 0 ?
                tmpTitles : ratingConfig.titles;

            var ratingStates = angular.isDefined($attrs.ratingStates) ?
                $scope.$parent.$eval($attrs.ratingStates) :
                new Array(angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max);
            $scope.range = this.buildTemplateObjects(ratingStates);
        };

        this.buildTemplateObjects = function (states) {
            for (var i = 0, n = states.length; i < n; i++) {
                states[i] = angular.extend({ index: i }, { stateOn: this.stateOn, stateOff: this.stateOff, title: this.getTitle(i) }, states[i]);
            }
            return states;
        };

        this.getTitle = function (index) {
            if (index >= this.titles.length) {
                return index + 1;
            }

            return this.titles[index];
        };

        $scope.rate = function (value) {
            if (!$scope.readonly && value >= 0 && value <= $scope.range.length) {
                ngModelCtrl.$setViewValue(ngModelCtrl.$viewValue === value ? 0 : value);
                ngModelCtrl.$render();
            }
        };

        $scope.enter = function (value) {
            if (!$scope.readonly) {
                $scope.value = value;
            }
            $scope.onHover({value: value});
        };

        $scope.reset = function () {
            $scope.value = ngModelCtrl.$viewValue;
            $scope.onLeave();
        };

        $scope.onKeydown = function (evt) {
            if (/(37|38|39|40)/.test(evt.which)) {
                evt.preventDefault();
                evt.stopPropagation();
                $scope.rate($scope.value + (evt.which === 38 || evt.which === 39 ? 1 : -1));
            }
        };

        this.render = function () {
            $scope.value = ngModelCtrl.$viewValue;
        };
    }])

    .directive('uibRating', function () {
        return {
            require: ['uibRating', 'ngModel'],
            scope: {
                readonly: '=?',
                onHover: '&',
                onLeave: '&'
            },
            controller: 'UibRatingController',
            templateUrl: 'uib/template/rating/rating.html',
            replace: true,
            link: function (scope, element, attrs, ctrls) {
                var ratingCtrl = ctrls[0], ngModelCtrl = ctrls[1];
                ratingCtrl.init(ngModelCtrl);
            }
        };
    });

angular.module('ui.bootstrap.tabs', [])

    .controller('UibTabsetController', ['$scope', function ($scope) {
        var ctrl = this,
            tabs = ctrl.tabs = $scope.tabs = [];

        ctrl.select = function (selectedTab) {
            angular.forEach(tabs, function (tab) {
                if (tab.active && tab !== selectedTab) {
                    tab.active = false;
                    tab.onDeselect();
                    selectedTab.selectCalled = false;
                }
            });
            selectedTab.active = true;
            // only call select if it has not already been called
            if (!selectedTab.selectCalled) {
                selectedTab.onSelect();
                selectedTab.selectCalled = true;
            }
        };

        ctrl.addTab = function addTab(tab) {
            tabs.push(tab);
            // we can't run the select function on the first tab
            // since that would select it twice
            if (tabs.length === 1 && tab.active !== false) {
                tab.active = true;
            } else if (tab.active) {
                ctrl.select(tab);
            } else {
                tab.active = false;
            }
        };

        ctrl.removeTab = function removeTab(tab) {
            var index = tabs.indexOf(tab);
            //Select a new tab if the tab to be removed is selected and not destroyed
            if (tab.active && tabs.length > 1 && !destroyed) {
                //If this is the last tab, select the previous tab. else, the next tab.
                var newActiveIndex = index === tabs.length - 1 ? index - 1 : index + 1;
                ctrl.select(tabs[newActiveIndex]);
            }
            tabs.splice(index, 1);
        };

        var destroyed;
        $scope.$on('$destroy', function () {
            destroyed = true;
        });
    }])

    .directive('uibTabset', function () {
        return {
            transclude: true,
            replace: true,
            scope: {
                type: '@'
            },
            controller: 'UibTabsetController',
            templateUrl: 'uib/template/tabs/tabset.html',
            link: function (scope, element, attrs) {
                scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
                scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
            }
        };
    })

    .directive('uibTab', ['$parse', function ($parse) {
        return {
            require: '^uibTabset',
            replace: true,
            templateUrl: 'uib/template/tabs/tab.html',
            transclude: true,
            scope: {
                active: '=?',
                heading: '@',
                onSelect: '&select', //This callback is called in contentHeadingTransclude
                //once it inserts the tab's content into the dom
                onDeselect: '&deselect'
            },
            controller: function () {
                //Empty controller so other directives can require being 'under' a tab
            },
            controllerAs: 'tab',
            link: function (scope, elm, attrs, tabsetCtrl, transclude) {
                scope.$watch('active', function (active) {
                    if (active) {
                        tabsetCtrl.select(scope);
                    }
                });

                scope.disabled = false;
                if (attrs.disable) {
                    scope.$parent.$watch($parse(attrs.disable), function (value) {
                        scope.disabled = !!value;
                    });
                }

                scope.select = function () {
                    if (!scope.disabled) {
                        scope.active = true;
                    }
                };

                tabsetCtrl.addTab(scope);
                scope.$on('$destroy', function () {
                    tabsetCtrl.removeTab(scope);
                });

                //We need to transclude later, once the content container is ready.
                //when this link happens, we're inside a tab heading.
                scope.$transcludeFn = transclude;
            }
        };
    }])

    .directive('uibTabHeadingTransclude', function () {
        return {
            restrict: 'A',
            require: '^uibTab',
            link: function (scope, elm) {
                scope.$watch('headingElement', function updateHeadingElement(heading) {
                    if (heading) {
                        elm.html('');
                        elm.append(heading);
                    }
                });
            }
        };
    })

    .directive('uibTabContentTransclude', function () {
        return {
            restrict: 'A',
            require: '^uibTabset',
            link: function (scope, elm, attrs) {
                var tab = scope.$eval(attrs.uibTabContentTransclude);

                //Now our tab is ready to be transcluded: both the tab heading area
                //and the tab content area are loaded.  Transclude 'em both.
                tab.$transcludeFn(tab.$parent, function (contents) {
                    angular.forEach(contents, function (node) {
                        if (isTabHeading(node)) {
                            //Let tabHeadingTransclude know.
                            tab.headingElement = node;
                        } else {
                            elm.append(node);
                        }
                    });
                });
            }
        };

        function isTabHeading(node) {
            return node.tagName && (
                node.hasAttribute('uib-tab-heading') ||
                node.hasAttribute('data-uib-tab-heading') ||
                node.hasAttribute('x-uib-tab-heading') ||
                node.tagName.toLowerCase() === 'uib-tab-heading' ||
                node.tagName.toLowerCase() === 'data-uib-tab-heading' ||
                node.tagName.toLowerCase() === 'x-uib-tab-heading'
                );
        }
    });

angular.module('ui.bootstrap.timepicker', [])

    .constant('uibTimepickerConfig', {
        hourStep: 1,
        minuteStep: 1,
        secondStep: 1,
        showMeridian: true,
        showSeconds: false,
        meridians: null,
        readonlyInput: false,
        mousewheel: true,
        arrowkeys: true,
        showSpinners: true,
        templateUrl: 'uib/template/timepicker/timepicker.html'
    })

    .controller('UibTimepickerController', ['$scope', '$element', '$attrs', '$parse', '$log', '$locale', 'uibTimepickerConfig', function ($scope, $element, $attrs, $parse, $log, $locale, timepickerConfig) {
        var selected = new Date(),
            watchers = [],
            ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl
            meridians = angular.isDefined($attrs.meridians) ? $scope.$parent.$eval($attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

        $scope.tabindex = angular.isDefined($attrs.tabindex) ? $attrs.tabindex : 0;
        $element.removeAttr('tabindex');

        this.init = function (ngModelCtrl_, inputs) {
            ngModelCtrl = ngModelCtrl_;
            ngModelCtrl.$render = this.render;

            ngModelCtrl.$formatters.unshift(function (modelValue) {
                return modelValue ? new Date(modelValue) : null;
            });

            var hoursInputEl = inputs.eq(0),
                minutesInputEl = inputs.eq(1),
                secondsInputEl = inputs.eq(2);

            var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : timepickerConfig.mousewheel;

            if (mousewheel) {
                this.setupMousewheelEvents(hoursInputEl, minutesInputEl, secondsInputEl);
            }

            var arrowkeys = angular.isDefined($attrs.arrowkeys) ? $scope.$parent.$eval($attrs.arrowkeys) : timepickerConfig.arrowkeys;
            if (arrowkeys) {
                this.setupArrowkeyEvents(hoursInputEl, minutesInputEl, secondsInputEl);
            }

            $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : timepickerConfig.readonlyInput;
            this.setupInputEvents(hoursInputEl, minutesInputEl, secondsInputEl);
        };

        var hourStep = timepickerConfig.hourStep;
        if ($attrs.hourStep) {
            watchers.push($scope.$parent.$watch($parse($attrs.hourStep), function (value) {
                hourStep = +value;
            }));
        }

        var minuteStep = timepickerConfig.minuteStep;
        if ($attrs.minuteStep) {
            watchers.push($scope.$parent.$watch($parse($attrs.minuteStep), function (value) {
                minuteStep = +value;
            }));
        }

        var min;
        watchers.push($scope.$parent.$watch($parse($attrs.min), function (value) {
            var dt = new Date(value);
            min = isNaN(dt) ? undefined : dt;
        }));

        var max;
        watchers.push($scope.$parent.$watch($parse($attrs.max), function (value) {
            var dt = new Date(value);
            max = isNaN(dt) ? undefined : dt;
        }));

        var disabled = false;
        if ($attrs.ngDisabled) {
            watchers.push($scope.$parent.$watch($parse($attrs.ngDisabled), function (value) {
                disabled = value;
            }));
        }

        $scope.noIncrementHours = function () {
            var incrementedSelected = addMinutes(selected, hourStep * 60);
            return disabled || incrementedSelected > max ||
                incrementedSelected < selected && incrementedSelected < min;
        };

        $scope.noDecrementHours = function () {
            var decrementedSelected = addMinutes(selected, -hourStep * 60);
            return disabled || decrementedSelected < min ||
                decrementedSelected > selected && decrementedSelected > max;
        };

        $scope.noIncrementMinutes = function () {
            var incrementedSelected = addMinutes(selected, minuteStep);
            return disabled || incrementedSelected > max ||
                incrementedSelected < selected && incrementedSelected < min;
        };

        $scope.noDecrementMinutes = function () {
            var decrementedSelected = addMinutes(selected, -minuteStep);
            return disabled || decrementedSelected < min ||
                decrementedSelected > selected && decrementedSelected > max;
        };

        $scope.noIncrementSeconds = function () {
            var incrementedSelected = addSeconds(selected, secondStep);
            return disabled || incrementedSelected > max ||
                incrementedSelected < selected && incrementedSelected < min;
        };

        $scope.noDecrementSeconds = function () {
            var decrementedSelected = addSeconds(selected, -secondStep);
            return disabled || decrementedSelected < min ||
                decrementedSelected > selected && decrementedSelected > max;
        };

        $scope.noToggleMeridian = function () {
            if (selected.getHours() < 12) {
                return disabled || addMinutes(selected, 12 * 60) > max;
            }

            return disabled || addMinutes(selected, -12 * 60) < min;
        };

        var secondStep = timepickerConfig.secondStep;
        if ($attrs.secondStep) {
            watchers.push($scope.$parent.$watch($parse($attrs.secondStep), function (value) {
                secondStep = +value;
            }));
        }

        $scope.showSeconds = timepickerConfig.showSeconds;
        if ($attrs.showSeconds) {
            watchers.push($scope.$parent.$watch($parse($attrs.showSeconds), function (value) {
                $scope.showSeconds = !!value;
            }));
        }

        // 12H / 24H mode
        $scope.showMeridian = timepickerConfig.showMeridian;
        if ($attrs.showMeridian) {
            watchers.push($scope.$parent.$watch($parse($attrs.showMeridian), function (value) {
                $scope.showMeridian = !!value;

                if (ngModelCtrl.$error.time) {
                    // Evaluate from template
                    var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
                    if (angular.isDefined(hours) && angular.isDefined(minutes)) {
                        selected.setHours(hours);
                        refresh();
                    }
                } else {
                    updateTemplate();
                }
            }));
        }

        // Get $scope.hours in 24H mode if valid
        function getHoursFromTemplate() {
            var hours = +$scope.hours;
            var valid = $scope.showMeridian ? hours > 0 && hours < 13 :
                hours >= 0 && hours < 24;
            if (!valid) {
                return undefined;
            }

            if ($scope.showMeridian) {
                if (hours === 12) {
                    hours = 0;
                }
                if ($scope.meridian === meridians[1]) {
                    hours = hours + 12;
                }
            }
            return hours;
        }

        function getMinutesFromTemplate() {
            var minutes = +$scope.minutes;
            return minutes >= 0 && minutes < 60 ? minutes : undefined;
        }

        function getSecondsFromTemplate() {
            var seconds = +$scope.seconds;
            return seconds >= 0 && seconds < 60 ? seconds : undefined;
        }

        function pad(value) {
            if (value === null) {
                return '';
            }

            return angular.isDefined(value) && value.toString().length < 2 ?
                '0' + value : value.toString();
        }

        // Respond on mousewheel spin
        this.setupMousewheelEvents = function (hoursInputEl, minutesInputEl, secondsInputEl) {
            var isScrollingUp = function (e) {
                if (e.originalEvent) {
                    e = e.originalEvent;
                }
                //pick correct delta variable depending on event
                var delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
                return e.detail || delta > 0;
            };

            hoursInputEl.bind('mousewheel wheel', function (e) {
                if (!disabled) {
                    $scope.$apply(isScrollingUp(e) ? $scope.incrementHours() : $scope.decrementHours());
                }
                e.preventDefault();
            });

            minutesInputEl.bind('mousewheel wheel', function (e) {
                if (!disabled) {
                    $scope.$apply(isScrollingUp(e) ? $scope.incrementMinutes() : $scope.decrementMinutes());
                }
                e.preventDefault();
            });

            secondsInputEl.bind('mousewheel wheel', function (e) {
                if (!disabled) {
                    $scope.$apply(isScrollingUp(e) ? $scope.incrementSeconds() : $scope.decrementSeconds());
                }
                e.preventDefault();
            });
        };

        // Respond on up/down arrowkeys
        this.setupArrowkeyEvents = function (hoursInputEl, minutesInputEl, secondsInputEl) {
            hoursInputEl.bind('keydown', function (e) {
                if (!disabled) {
                    if (e.which === 38) { // up
                        e.preventDefault();
                        $scope.incrementHours();
                        $scope.$apply();
                    } else if (e.which === 40) { // down
                        e.preventDefault();
                        $scope.decrementHours();
                        $scope.$apply();
                    }
                }
            });

            minutesInputEl.bind('keydown', function (e) {
                if (!disabled) {
                    if (e.which === 38) { // up
                        e.preventDefault();
                        $scope.incrementMinutes();
                        $scope.$apply();
                    } else if (e.which === 40) { // down
                        e.preventDefault();
                        $scope.decrementMinutes();
                        $scope.$apply();
                    }
                }
            });

            secondsInputEl.bind('keydown', function (e) {
                if (!disabled) {
                    if (e.which === 38) { // up
                        e.preventDefault();
                        $scope.incrementSeconds();
                        $scope.$apply();
                    } else if (e.which === 40) { // down
                        e.preventDefault();
                        $scope.decrementSeconds();
                        $scope.$apply();
                    }
                }
            });
        };

        this.setupInputEvents = function (hoursInputEl, minutesInputEl, secondsInputEl) {
            if ($scope.readonlyInput) {
                $scope.updateHours = angular.noop;
                $scope.updateMinutes = angular.noop;
                $scope.updateSeconds = angular.noop;
                return;
            }

            var invalidate = function (invalidHours, invalidMinutes, invalidSeconds) {
                ngModelCtrl.$setViewValue(null);
                ngModelCtrl.$setValidity('time', false);
                if (angular.isDefined(invalidHours)) {
                    $scope.invalidHours = invalidHours;
                }

                if (angular.isDefined(invalidMinutes)) {
                    $scope.invalidMinutes = invalidMinutes;
                }

                if (angular.isDefined(invalidSeconds)) {
                    $scope.invalidSeconds = invalidSeconds;
                }
            };

            $scope.updateHours = function () {
                var hours = getHoursFromTemplate(),
                    minutes = getMinutesFromTemplate();

                ngModelCtrl.$setDirty();

                if (angular.isDefined(hours) && angular.isDefined(minutes)) {
                    selected.setHours(hours);
                    selected.setMinutes(minutes);
                    if (selected < min || selected > max) {
                        invalidate(true);
                    } else {
                        refresh('h');
                    }
                } else {
                    invalidate(true);
                }
            };

            hoursInputEl.bind('blur', function (e) {
                ngModelCtrl.$setTouched();
                if ($scope.hours === null || $scope.hours === '') {
                    invalidate(true);
                } else if (!$scope.invalidHours && $scope.hours < 10) {
                    $scope.$apply(function () {
                        $scope.hours = pad($scope.hours);
                    });
                }
            });

            $scope.updateMinutes = function () {
                var minutes = getMinutesFromTemplate(),
                    hours = getHoursFromTemplate();

                ngModelCtrl.$setDirty();

                if (angular.isDefined(minutes) && angular.isDefined(hours)) {
                    selected.setHours(hours);
                    selected.setMinutes(minutes);
                    if (selected < min || selected > max) {
                        invalidate(undefined, true);
                    } else {
                        refresh('m');
                    }
                } else {
                    invalidate(undefined, true);
                }
            };

            minutesInputEl.bind('blur', function (e) {
                ngModelCtrl.$setTouched();
                if ($scope.minutes === null) {
                    invalidate(undefined, true);
                } else if (!$scope.invalidMinutes && $scope.minutes < 10) {
                    $scope.$apply(function () {
                        $scope.minutes = pad($scope.minutes);
                    });
                }
            });

            $scope.updateSeconds = function () {
                var seconds = getSecondsFromTemplate();

                ngModelCtrl.$setDirty();

                if (angular.isDefined(seconds)) {
                    selected.setSeconds(seconds);
                    refresh('s');
                } else {
                    invalidate(undefined, undefined, true);
                }
            };

            secondsInputEl.bind('blur', function (e) {
                if (!$scope.invalidSeconds && $scope.seconds < 10) {
                    $scope.$apply(function () {
                        $scope.seconds = pad($scope.seconds);
                    });
                }
            });

        };

        this.render = function () {
            var date = ngModelCtrl.$viewValue;

            if (isNaN(date)) {
                ngModelCtrl.$setValidity('time', false);
                $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
            } else {
                if (date) {
                    selected = date;
                }

                if (selected < min || selected > max) {
                    ngModelCtrl.$setValidity('time', false);
                    $scope.invalidHours = true;
                    $scope.invalidMinutes = true;
                } else {
                    makeValid();
                }
                updateTemplate();
            }
        };

        // Call internally when we know that model is valid.
        function refresh(keyboardChange) {
            makeValid();
            ngModelCtrl.$setViewValue(new Date(selected));
            updateTemplate(keyboardChange);
        }

        function makeValid() {
            ngModelCtrl.$setValidity('time', true);
            $scope.invalidHours = false;
            $scope.invalidMinutes = false;
            $scope.invalidSeconds = false;
        }

        function updateTemplate(keyboardChange) {
            if (!ngModelCtrl.$modelValue) {
                $scope.hours = null;
                $scope.minutes = null;
                $scope.seconds = null;
                $scope.meridian = meridians[0];
            } else {
                var hours = selected.getHours(),
                    minutes = selected.getMinutes(),
                    seconds = selected.getSeconds();

                if ($scope.showMeridian) {
                    hours = hours === 0 || hours === 12 ? 12 : hours % 12; // Convert 24 to 12 hour system
                }

                $scope.hours = keyboardChange === 'h' ? hours : pad(hours);
                if (keyboardChange !== 'm') {
                    $scope.minutes = pad(minutes);
                }
                $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];

                if (keyboardChange !== 's') {
                    $scope.seconds = pad(seconds);
                }
                $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
            }
        }

        function addSecondsToSelected(seconds) {
            selected = addSeconds(selected, seconds);
            refresh();
        }

        function addMinutes(selected, minutes) {
            return addSeconds(selected, minutes * 60);
        }

        function addSeconds(date, seconds) {
            var dt = new Date(date.getTime() + seconds * 1000);
            var newDate = new Date(date);
            newDate.setHours(dt.getHours(), dt.getMinutes(), dt.getSeconds());
            return newDate;
        }

        $scope.showSpinners = angular.isDefined($attrs.showSpinners) ?
            $scope.$parent.$eval($attrs.showSpinners) : timepickerConfig.showSpinners;

        $scope.incrementHours = function () {
            if (!$scope.noIncrementHours()) {
                addSecondsToSelected(hourStep * 60 * 60);
            }
        };

        $scope.decrementHours = function () {
            if (!$scope.noDecrementHours()) {
                addSecondsToSelected(-hourStep * 60 * 60);
            }
        };

        $scope.incrementMinutes = function () {
            if (!$scope.noIncrementMinutes()) {
                addSecondsToSelected(minuteStep * 60);
            }
        };

        $scope.decrementMinutes = function () {
            if (!$scope.noDecrementMinutes()) {
                addSecondsToSelected(-minuteStep * 60);
            }
        };

        $scope.incrementSeconds = function () {
            if (!$scope.noIncrementSeconds()) {
                addSecondsToSelected(secondStep);
            }
        };

        $scope.decrementSeconds = function () {
            if (!$scope.noDecrementSeconds()) {
                addSecondsToSelected(-secondStep);
            }
        };

        $scope.toggleMeridian = function () {
            var minutes = getMinutesFromTemplate(),
                hours = getHoursFromTemplate();

            if (!$scope.noToggleMeridian()) {
                if (angular.isDefined(minutes) && angular.isDefined(hours)) {
                    addSecondsToSelected(12 * 60 * (selected.getHours() < 12 ? 60 : -60));
                } else {
                    $scope.meridian = $scope.meridian === meridians[0] ? meridians[1] : meridians[0];
                }
            }
        };

        $scope.blur = function () {
            ngModelCtrl.$setTouched();
        };

        $scope.$on('$destroy', function () {
            while (watchers.length) {
                watchers.shift()();
            }
        });
    }])

    .directive('uibTimepicker', ['uibTimepickerConfig', function (uibTimepickerConfig) {
        return {
            require: ['uibTimepicker', '?^ngModel'],
            controller: 'UibTimepickerController',
            controllerAs: 'timepicker',
            replace: true,
            scope: {},
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || uibTimepickerConfig.templateUrl;
            },
            link: function (scope, element, attrs, ctrls) {
                var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                if (ngModelCtrl) {
                    timepickerCtrl.init(ngModelCtrl, element.find('input'));
                }
            }
        };
    }]);

angular.module('ui.bootstrap.typeahead', ['ui.bootstrap.debounce', 'ui.bootstrap.position'])

/**
 * A helper service that can parse typeahead's syntax (string provided by users)
 * Extracted to a separate service for ease of unit testing
 */
    .factory('uibTypeaheadParser', ['$parse', function ($parse) {
        //                      00000111000000000000022200000000000000003333333333333330000000000044000
        var TYPEAHEAD_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;
        return {
            parse: function (input) {
                var match = input.match(TYPEAHEAD_REGEXP);
                if (!match) {
                    throw new Error(
                            'Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_"' +
                            ' but got "' + input + '".');
                }

                return {
                    itemName: match[3],
                    source: $parse(match[4]),
                    viewMapper: $parse(match[2] || match[1]),
                    modelMapper: $parse(match[1])
                };
            }
        };
    }])

    .controller('UibTypeaheadController', ['$scope', '$element', '$attrs', '$compile', '$parse', '$q', '$timeout', '$document', '$window', '$rootScope', '$$debounce', '$uibPosition', 'uibTypeaheadParser',
        function (originalScope, element, attrs, $compile, $parse, $q, $timeout, $document, $window, $rootScope, $$debounce, $position, typeaheadParser) {
            var HOT_KEYS = [9, 13, 27, 38, 40];
            var eventDebounceTime = 200;
            var modelCtrl, ngModelOptions;
            //SUPPORTED ATTRIBUTES (OPTIONS)

            //minimal no of characters that needs to be entered before typeahead kicks-in
            var minLength = originalScope.$eval(attrs.typeaheadMinLength);
            if (!minLength && minLength !== 0) {
                minLength = 1;
            }

            //minimal wait time after last character typed before typeahead kicks-in
            var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;

            //should it restrict model values to the ones selected from the popup only?
            var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;
            originalScope.$watch(attrs.typeaheadEditable, function (newVal) {
                isEditable = newVal !== false;
            });

            //binding to a variable that indicates if matches are being retrieved asynchronously
            var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;

            //a callback executed when a match is selected
            var onSelectCallback = $parse(attrs.typeaheadOnSelect);

            //should it select highlighted popup value when losing focus?
            var isSelectOnBlur = angular.isDefined(attrs.typeaheadSelectOnBlur) ? originalScope.$eval(attrs.typeaheadSelectOnBlur) : false;

            //binding to a variable that indicates if there were no results after the query is completed
            var isNoResultsSetter = $parse(attrs.typeaheadNoResults).assign || angular.noop;

            var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;

            var appendToBody = attrs.typeaheadAppendToBody ? originalScope.$eval(attrs.typeaheadAppendToBody) : false;

            var appendTo = attrs.typeaheadAppendTo ?
                originalScope.$eval(attrs.typeaheadAppendTo) : null;

            var focusFirst = originalScope.$eval(attrs.typeaheadFocusFirst) !== false;

            //If input matches an item of the list exactly, select it automatically
            var selectOnExact = attrs.typeaheadSelectOnExact ? originalScope.$eval(attrs.typeaheadSelectOnExact) : false;

            //binding to a variable that indicates if dropdown is open
            var isOpenSetter = $parse(attrs.typeaheadIsOpen).assign || angular.noop;

            var showHint = originalScope.$eval(attrs.typeaheadShowHint) || false;

            //INTERNAL VARIABLES

            //model setter executed upon match selection
            var parsedModel = $parse(attrs.ngModel);
            var invokeModelSetter = $parse(attrs.ngModel + '($$$p)');
            var $setModelValue = function (scope, newValue) {
                if (angular.isFunction(parsedModel(originalScope)) &&
                    ngModelOptions && ngModelOptions.$options && ngModelOptions.$options.getterSetter) {
                    return invokeModelSetter(scope, {$$$p: newValue});
                }

                return parsedModel.assign(scope, newValue);
            };

            //expressions used by typeahead
            var parserResult = typeaheadParser.parse(attrs.uibTypeahead);

            var hasFocus;

            //Used to avoid bug in iOS webview where iOS keyboard does not fire
            //mousedown & mouseup events
            //Issue #3699
            var selected;

            //create a child scope for the typeahead directive so we are not polluting original scope
            //with typeahead-specific data (matches, query etc.)
            var scope = originalScope.$new();
            var offDestroy = originalScope.$on('$destroy', function () {
                scope.$destroy();
            });
            scope.$on('$destroy', offDestroy);

            // WAI-ARIA
            var popupId = 'typeahead-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
            element.attr({
                'aria-autocomplete': 'list',
                'aria-expanded': false,
                'aria-owns': popupId
            });

            var inputsContainer, hintInputElem;
            //add read-only input to show hint
            if (showHint) {
                inputsContainer = angular.element('<div></div>');
                inputsContainer.css('position', 'relative');
                element.after(inputsContainer);
                hintInputElem = element.clone();
                hintInputElem.attr('placeholder', '');
                hintInputElem.val('');
                hintInputElem.css({
                    'position': 'absolute',
                    'top': '0px',
                    'left': '0px',
                    'border-color': 'transparent',
                    'box-shadow': 'none',
                    'opacity': 1,
                    'background': 'none 0% 0% / auto repeat scroll padding-box border-box rgb(255, 255, 255)',
                    'color': '#999'
                });
                element.css({
                    'position': 'relative',
                    'vertical-align': 'top',
                    'background-color': 'transparent'
                });
                inputsContainer.append(hintInputElem);
                hintInputElem.after(element);
            }

            //pop-up element used to display matches
            var popUpEl = angular.element('<div uib-typeahead-popup></div>');
            popUpEl.attr({
                id: popupId,
                matches: 'matches',
                active: 'activeIdx',
                select: 'select(activeIdx, evt)',
                'move-in-progress': 'moveInProgress',
                query: 'query',
                position: 'position',
                'assign-is-open': 'assignIsOpen(isOpen)',
                debounce: 'debounceUpdate'
            });
            //custom item template
            if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
                popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
            }

            if (angular.isDefined(attrs.typeaheadPopupTemplateUrl)) {
                popUpEl.attr('popup-template-url', attrs.typeaheadPopupTemplateUrl);
            }

            var resetHint = function () {
                if (showHint) {
                    hintInputElem.val('');
                }
            };

            var resetMatches = function () {
                scope.matches = [];
                scope.activeIdx = -1;
                element.attr('aria-expanded', false);
                resetHint();
            };

            var getMatchId = function (index) {
                return popupId + '-option-' + index;
            };

            // Indicate that the specified match is the active (pre-selected) item in the list owned by this typeahead.
            // This attribute is added or removed automatically when the `activeIdx` changes.
            scope.$watch('activeIdx', function (index) {
                if (index < 0) {
                    element.removeAttr('aria-activedescendant');
                } else {
                    element.attr('aria-activedescendant', getMatchId(index));
                }
            });

            var inputIsExactMatch = function (inputValue, index) {
                if (scope.matches.length > index && inputValue) {
                    return inputValue.toUpperCase() === scope.matches[index].label.toUpperCase();
                }

                return false;
            };

            var getMatchesAsync = function (inputValue, evt) {
                var locals = {$viewValue: inputValue};
                isLoadingSetter(originalScope, true);
                isNoResultsSetter(originalScope, false);
                $q.when(parserResult.source(originalScope, locals)).then(function (matches) {
                    //it might happen that several async queries were in progress if a user were typing fast
                    //but we are interested only in responses that correspond to the current view value
                    var onCurrentRequest = inputValue === modelCtrl.$viewValue;
                    if (onCurrentRequest && hasFocus) {
                        if (matches && matches.length > 0) {
                            scope.activeIdx = focusFirst ? 0 : -1;
                            isNoResultsSetter(originalScope, false);
                            scope.matches.length = 0;

                            //transform labels
                            for (var i = 0; i < matches.length; i++) {
                                locals[parserResult.itemName] = matches[i];
                                scope.matches.push({
                                    id: getMatchId(i),
                                    label: parserResult.viewMapper(scope, locals),
                                    model: matches[i]
                                });
                            }

                            scope.query = inputValue;
                            //position pop-up with matches - we need to re-calculate its position each time we are opening a window
                            //with matches as a pop-up might be absolute-positioned and position of an input might have changed on a page
                            //due to other elements being rendered
                            recalculatePosition();

                            element.attr('aria-expanded', true);

                            //Select the single remaining option if user input matches
                            if (selectOnExact && scope.matches.length === 1 && inputIsExactMatch(inputValue, 0)) {
                                if (angular.isNumber(scope.debounceUpdate) || angular.isObject(scope.debounceUpdate)) {
                                    $$debounce(function () {
                                        scope.select(0, evt);
                                    }, angular.isNumber(scope.debounceUpdate) ? scope.debounceUpdate : scope.debounceUpdate['default']);
                                } else {
                                    scope.select(0, evt);
                                }
                            }

                            if (showHint) {
                                var firstLabel = scope.matches[0].label;
                                if (angular.isString(inputValue) &&
                                    inputValue.length > 0 &&
                                    firstLabel.slice(0, inputValue.length).toUpperCase() === inputValue.toUpperCase()) {
                                    hintInputElem.val(inputValue + firstLabel.slice(inputValue.length));
                                } else {
                                    hintInputElem.val('');
                                }
                            }
                        } else {
                            resetMatches();
                            isNoResultsSetter(originalScope, true);
                        }
                    }
                    if (onCurrentRequest) {
                        isLoadingSetter(originalScope, false);
                    }
                }, function () {
                    resetMatches();
                    isLoadingSetter(originalScope, false);
                    isNoResultsSetter(originalScope, true);
                });
            };

            // bind events only if appendToBody params exist - performance feature
            if (appendToBody) {
                angular.element($window).on('resize', fireRecalculating);
                $document.find('body').on('scroll', fireRecalculating);
            }

            // Declare the debounced function outside recalculating for
            // proper debouncing
            var debouncedRecalculate = $$debounce(function () {
                // if popup is visible
                if (scope.matches.length) {
                    recalculatePosition();
                }

                scope.moveInProgress = false;
            }, eventDebounceTime);

            // Default progress type
            scope.moveInProgress = false;

            function fireRecalculating() {
                if (!scope.moveInProgress) {
                    scope.moveInProgress = true;
                    scope.$digest();
                }

                debouncedRecalculate();
            }

            // recalculate actual position and set new values to scope
            // after digest loop is popup in right position
            function recalculatePosition() {
                scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                scope.position.top += element.prop('offsetHeight');
            }

            //we need to propagate user's query so we can higlight matches
            scope.query = undefined;

            //Declare the timeout promise var outside the function scope so that stacked calls can be cancelled later
            var timeoutPromise;

            var scheduleSearchWithTimeout = function (inputValue) {
                timeoutPromise = $timeout(function () {
                    getMatchesAsync(inputValue);
                }, waitTime);
            };

            var cancelPreviousTimeout = function () {
                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                }
            };

            resetMatches();

            scope.assignIsOpen = function (isOpen) {
                isOpenSetter(originalScope, isOpen);
            };

            scope.select = function (activeIdx, evt) {
                //called from within the $digest() cycle
                var locals = {};
                var model, item;

                selected = true;
                locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
                model = parserResult.modelMapper(originalScope, locals);
                $setModelValue(originalScope, model);
                modelCtrl.$setValidity('editable', true);
                modelCtrl.$setValidity('parse', true);

                onSelectCallback(originalScope, {
                    $item: item,
                    $model: model,
                    $label: parserResult.viewMapper(originalScope, locals),
                    $event: evt
                });

                resetMatches();

                //return focus to the input element if a match was selected via a mouse click event
                // use timeout to avoid $rootScope:inprog error
                if (scope.$eval(attrs.typeaheadFocusOnSelect) !== false) {
                    $timeout(function () {
                        element[0].focus();
                    }, 0, false);
                }
            };

            //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
            element.on('keydown', function (evt) {
                //typeahead is open and an "interesting" key was pressed
                if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
                    return;
                }

                // if there's nothing selected (i.e. focusFirst) and enter or tab is hit, clear the results
                if (scope.activeIdx === -1 && (evt.which === 9 || evt.which === 13)) {
                    resetMatches();
                    scope.$digest();
                    return;
                }

                evt.preventDefault();
                var target;
                switch (evt.which) {
                    case 9:
                    case 13:
                        scope.$apply(function () {
                            if (angular.isNumber(scope.debounceUpdate) || angular.isObject(scope.debounceUpdate)) {
                                $$debounce(function () {
                                    scope.select(scope.activeIdx, evt);
                                }, angular.isNumber(scope.debounceUpdate) ? scope.debounceUpdate : scope.debounceUpdate['default']);
                            } else {
                                scope.select(scope.activeIdx, evt);
                            }
                        });
                        break;
                    case 27:
                        evt.stopPropagation();

                        resetMatches();
                        scope.$digest();
                        break;
                    case 38:
                        scope.activeIdx = (scope.activeIdx > 0 ? scope.activeIdx : scope.matches.length) - 1;
                        scope.$digest();
                        target = popUpEl.find('li')[scope.activeIdx];
                        target.parentNode.scrollTop = target.offsetTop;
                        break;
                    case 40:
                        scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
                        scope.$digest();
                        target = popUpEl.find('li')[scope.activeIdx];
                        target.parentNode.scrollTop = target.offsetTop;
                        break;
                }
            });

            element.bind('focus', function (evt) {
                hasFocus = true;
                if (minLength === 0 && !modelCtrl.$viewValue) {
                    $timeout(function () {
                        getMatchesAsync(modelCtrl.$viewValue, evt);
                    }, 0);
                }
            });

            element.bind('blur', function (evt) {
                if (isSelectOnBlur && scope.matches.length && scope.activeIdx !== -1 && !selected) {
                    selected = true;
                    scope.$apply(function () {
                        if (angular.isObject(scope.debounceUpdate) && angular.isNumber(scope.debounceUpdate.blur)) {
                            $$debounce(function () {
                                scope.select(scope.activeIdx, evt);
                            }, scope.debounceUpdate.blur);
                        } else {
                            scope.select(scope.activeIdx, evt);
                        }
                    });
                }
                if (!isEditable && modelCtrl.$error.editable) {
                    modelCtrl.$viewValue = '';
                    element.val('');
                }
                hasFocus = false;
                selected = false;
            });

            // Keep reference to click handler to unbind it.
            var dismissClickHandler = function (evt) {
                // Issue #3973
                // Firefox treats right click as a click on document
                if (element[0] !== evt.target && evt.which !== 3 && scope.matches.length !== 0) {
                    resetMatches();
                    if (!$rootScope.$$phase) {
                        scope.$digest();
                    }
                }
            };

            $document.on('click', dismissClickHandler);

            originalScope.$on('$destroy', function () {
                $document.off('click', dismissClickHandler);
                if (appendToBody || appendTo) {
                    $popup.remove();
                }

                if (appendToBody) {
                    angular.element($window).off('resize', fireRecalculating);
                    $document.find('body').off('scroll', fireRecalculating);
                }
                // Prevent jQuery cache memory leak
                popUpEl.remove();

                if (showHint) {
                    inputsContainer.remove();
                }
            });

            var $popup = $compile(popUpEl)(scope);

            if (appendToBody) {
                $document.find('body').append($popup);
            } else if (appendTo) {
                angular.element(appendTo).eq(0).append($popup);
            } else {
                element.after($popup);
            }

            this.init = function (_modelCtrl, _ngModelOptions) {
                modelCtrl = _modelCtrl;
                ngModelOptions = _ngModelOptions;

                scope.debounceUpdate = modelCtrl.$options && $parse(modelCtrl.$options.debounce)(originalScope);

                //plug into $parsers pipeline to open a typeahead on view changes initiated from DOM
                //$parsers kick-in on all the changes coming from the view as well as manually triggered by $setViewValue
                modelCtrl.$parsers.unshift(function (inputValue) {
                    hasFocus = true;

                    if (minLength === 0 || inputValue && inputValue.length >= minLength) {
                        if (waitTime > 0) {
                            cancelPreviousTimeout();
                            scheduleSearchWithTimeout(inputValue);
                        } else {
                            getMatchesAsync(inputValue);
                        }
                    } else {
                        isLoadingSetter(originalScope, false);
                        cancelPreviousTimeout();
                        resetMatches();
                    }

                    if (isEditable) {
                        return inputValue;
                    }

                    if (!inputValue) {
                        // Reset in case user had typed something previously.
                        modelCtrl.$setValidity('editable', true);
                        return null;
                    }

                    modelCtrl.$setValidity('editable', false);
                    return undefined;
                });

                modelCtrl.$formatters.push(function (modelValue) {
                    var candidateViewValue, emptyViewValue;
                    var locals = {};

                    // The validity may be set to false via $parsers (see above) if
                    // the model is restricted to selected values. If the model
                    // is set manually it is considered to be valid.
                    if (!isEditable) {
                        modelCtrl.$setValidity('editable', true);
                    }

                    if (inputFormatter) {
                        locals.$model = modelValue;
                        return inputFormatter(originalScope, locals);
                    }

                    //it might happen that we don't have enough info to properly render input value
                    //we need to check for this situation and simply return model value if we can't apply custom formatting
                    locals[parserResult.itemName] = modelValue;
                    candidateViewValue = parserResult.viewMapper(originalScope, locals);
                    locals[parserResult.itemName] = undefined;
                    emptyViewValue = parserResult.viewMapper(originalScope, locals);

                    return candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue;
                });
            };
        }])

    .directive('uibTypeahead', function () {
        return {
            controller: 'UibTypeaheadController',
            require: ['ngModel', '^?ngModelOptions', 'uibTypeahead'],
            link: function (originalScope, element, attrs, ctrls) {
                ctrls[2].init(ctrls[0], ctrls[1]);
            }
        };
    })

    .directive('uibTypeaheadPopup', ['$$debounce', function ($$debounce) {
        return {
            scope: {
                matches: '=',
                query: '=',
                active: '=',
                position: '&',
                moveInProgress: '=',
                select: '&',
                assignIsOpen: '&',
                debounce: '&'
            },
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.popupTemplateUrl || 'uib/template/typeahead/typeahead-popup.html';
            },
            link: function (scope, element, attrs) {
                scope.templateUrl = attrs.templateUrl;

                scope.isOpen = function () {
                    var isDropdownOpen = scope.matches.length > 0;
                    scope.assignIsOpen({ isOpen: isDropdownOpen });
                    return isDropdownOpen;
                };

                scope.isActive = function (matchIdx) {
                    return scope.active === matchIdx;
                };

                scope.selectActive = function (matchIdx) {
                    scope.active = matchIdx;
                };

                scope.selectMatch = function (activeIdx, evt) {
                    var debounce = scope.debounce();
                    if (angular.isNumber(debounce) || angular.isObject(debounce)) {
                        $$debounce(function () {
                            scope.select({activeIdx: activeIdx, evt: evt});
                        }, angular.isNumber(debounce) ? debounce : debounce['default']);
                    } else {
                        scope.select({activeIdx: activeIdx, evt: evt});
                    }
                };
            }
        };
    }])

    .directive('uibTypeaheadMatch', ['$templateRequest', '$compile', '$parse', function ($templateRequest, $compile, $parse) {
        return {
            scope: {
                index: '=',
                match: '=',
                query: '='
            },
            link: function (scope, element, attrs) {
                var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'uib/template/typeahead/typeahead-match.html';
                $templateRequest(tplUrl).then(function (tplContent) {
                    var tplEl = angular.element(tplContent.trim());
                    element.replaceWith(tplEl);
                    $compile(tplEl)(scope);
                });
            }
        };
    }])

    .filter('uibTypeaheadHighlight', ['$sce', '$injector', '$log', function ($sce, $injector, $log) {
        var isSanitizePresent;
        isSanitizePresent = $injector.has('$sanitize');

        function escapeRegexp(queryToEscape) {
            // Regex: capture the whole query string and replace it with the string that will be used to match
            // the results, for example if the capture is "a" the result will be \a
            return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
        }

        function containsHtml(matchItem) {
            return /<.*>/g.test(matchItem);
        }

        return function (matchItem, query) {
            if (!isSanitizePresent && containsHtml(matchItem)) {
                $log.warn('Unsafe use of typeahead please use ngSanitize'); // Warn the user about the danger
            }
            matchItem = query ? ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem; // Replaces the capture string with a the same string inside of a "strong" tag
            if (!isSanitizePresent) {
                matchItem = $sce.trustAsHtml(matchItem); // If $sanitize is not present we pack the string in a $sce object for the ng-bind-html directive
            }
            return matchItem;
        };
    }]);

angular.module("uib/template/accordion/accordion-group.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/accordion/accordion-group.html",
            "<div class=\"panel\" ng-class=\"panelClass || 'panel-default'\">\n" +
            "  <div role=\"tab\" id=\"{{::headingId}}\" aria-selected=\"{{isOpen}}\" class=\"panel-heading\" ng-keypress=\"toggleOpen($event)\">\n" +
            "    <h4 class=\"panel-title\">\n" +
            "      <a role=\"button\" data-toggle=\"collapse\" href aria-expanded=\"{{isOpen}}\" aria-controls=\"{{::panelId}}\" tabindex=\"0\" class=\"accordion-toggle\" ng-click=\"toggleOpen()\" uib-accordion-transclude=\"heading\"><span ng-class=\"{'text-muted': isDisabled}\">{{heading}}</span></a>\n" +
            "    </h4>\n" +
            "  </div>\n" +
            "  <div id=\"{{::panelId}}\" aria-labelledby=\"{{::headingId}}\" aria-hidden=\"{{!isOpen}}\" role=\"tabpanel\" class=\"panel-collapse collapse\" uib-collapse=\"!isOpen\">\n" +
            "    <div class=\"panel-body\" ng-transclude></div>\n" +
            "  </div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/accordion/accordion.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/accordion/accordion.html",
        "<div role=\"tablist\" class=\"panel-group\" ng-transclude></div>");
}]);

angular.module("uib/template/alert/alert.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/alert/alert.html",
            "<div class=\"alert\" ng-class=\"['alert-' + (type || 'warning'), closeable ? 'alert-dismissible' : null]\" role=\"alert\">\n" +
            "    <button ng-show=\"closeable\" type=\"button\" class=\"close\" ng-click=\"close({$event: $event})\">\n" +
            "        <span aria-hidden=\"true\">&times;</span>\n" +
            "        <span class=\"sr-only\">Close</span>\n" +
            "    </button>\n" +
            "    <div ng-transclude></div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/carousel/carousel.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/carousel/carousel.html",
            "<div ng-mouseenter=\"pause()\" ng-mouseleave=\"play()\" class=\"carousel\" ng-swipe-right=\"prev()\" ng-swipe-left=\"next()\">\n" +
            "  <div class=\"carousel-inner\" ng-transclude></div>\n" +
            "  <a role=\"button\" href class=\"left carousel-control\" ng-click=\"prev()\" ng-show=\"slides.length > 1\">\n" +
            "    <span aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-left\"></span>\n" +
            "    <span class=\"sr-only\">previous</span>\n" +
            "  </a>\n" +
            "  <a role=\"button\" href class=\"right carousel-control\" ng-click=\"next()\" ng-show=\"slides.length > 1\">\n" +
            "    <span aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-right\"></span>\n" +
            "    <span class=\"sr-only\">next</span>\n" +
            "  </a>\n" +
            "  <ol class=\"carousel-indicators\" ng-show=\"slides.length > 1\">\n" +
            "    <li ng-repeat=\"slide in slides | orderBy:indexOfSlide track by $index\" ng-class=\"{ active: isActive(slide) }\" ng-click=\"select(slide)\">\n" +
            "      <span class=\"sr-only\">slide {{ $index + 1 }} of {{ slides.length }}<span ng-if=\"isActive(slide)\">, currently active</span></span>\n" +
            "    </li>\n" +
            "  </ol>\n" +
            "</div>");
}]);

angular.module("uib/template/carousel/slide.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/carousel/slide.html",
            "<div ng-class=\"{\n" +
            "    'active': active\n" +
            "  }\" class=\"item text-center\" ng-transclude></div>\n" +
            "");
}]);

angular.module("uib/template/datepicker/datepicker.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/datepicker/datepicker.html",
            "<div class=\"uib-datepicker\" ng-switch=\"datepickerMode\" role=\"application\" ng-keydown=\"keydown($event)\">\n" +
            "  <uib-daypicker ng-switch-when=\"day\" tabindex=\"0\"></uib-daypicker>\n" +
            "  <uib-monthpicker ng-switch-when=\"month\" tabindex=\"0\"></uib-monthpicker>\n" +
            "  <uib-yearpicker ng-switch-when=\"year\" tabindex=\"0\"></uib-yearpicker>\n" +
            "</div>");
}]);

angular.module("uib/template/datepicker/day.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/datepicker/day.html",
            "<table class=\"uib-daypicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
            "  <thead>\n" +
            "    <tr>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
            "      <th colspan=\"{{::5 + showWeeks}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
            "    </tr>\n" +
            "    <tr>\n" +
            "      <th ng-if=\"showWeeks\" class=\"text-center\"></th>\n" +
            "      <th ng-repeat=\"label in ::labels track by $index\" class=\"text-center\"><small aria-label=\"{{::label.full}}\">{{::label.abbr}}</small></th>\n" +
            "    </tr>\n" +
            "  </thead>\n" +
            "  <tbody>\n" +
            "    <tr class=\"uib-weeks\" ng-repeat=\"row in rows track by $index\">\n" +
            "      <td ng-if=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
            "      <td ng-repeat=\"dt in row\" class=\"uib-day text-center\" role=\"gridcell\"\n" +
            "        id=\"{{::dt.uid}}\"\n" +
            "        ng-class=\"::dt.customClass\">\n" +
            "        <button type=\"button\" class=\"btn btn-default btn-sm\"\n" +
            "          uib-is-class=\"\n" +
            "            'btn-info' for selectedDt,\n" +
            "            'active' for activeDt\n" +
            "            on dt\"\n" +
            "          ng-click=\"select(dt.date)\"\n" +
            "          ng-disabled=\"::dt.disabled\"\n" +
            "          tabindex=\"-1\"><span ng-class=\"::{'text-muted': dt.secondary, 'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
            "      </td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n" +
            "");
}]);

angular.module("uib/template/datepicker/month.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/datepicker/month.html",
            "<table class=\"uib-monthpicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
            "  <thead>\n" +
            "    <tr>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
            "      <th><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
            "    </tr>\n" +
            "  </thead>\n" +
            "  <tbody>\n" +
            "    <tr class=\"uib-months\" ng-repeat=\"row in rows track by $index\">\n" +
            "      <td ng-repeat=\"dt in row\" class=\"uib-month text-center\" role=\"gridcell\"\n" +
            "        id=\"{{::dt.uid}}\"\n" +
            "        ng-class=\"::dt.customClass\">\n" +
            "        <button type=\"button\" class=\"btn btn-default\"\n" +
            "          uib-is-class=\"\n" +
            "            'btn-info' for selectedDt,\n" +
            "            'active' for activeDt\n" +
            "            on dt\"\n" +
            "          ng-click=\"select(dt.date)\"\n" +
            "          ng-disabled=\"::dt.disabled\"\n" +
            "          tabindex=\"-1\"><span ng-class=\"::{'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
            "      </td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n" +
            "");
}]);

angular.module("uib/template/datepicker/popup.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/datepicker/popup.html",
            "<div>\n" +
            "  <ul class=\"uib-datepicker-popup dropdown-menu\" dropdown-nested ng-if=\"isOpen\" ng-style=\"{top: position.top+'px', left: position.left+'px'}\" ng-keydown=\"keydown($event)\" ng-click=\"$event.stopPropagation()\">\n" +
            "    <li ng-transclude></li>\n" +
            "    <li ng-if=\"showButtonBar\" class=\"uib-button-bar\">\n" +
            "    <span class=\"btn-group pull-left\">\n" +
            "      <button type=\"button\" class=\"btn btn-sm btn-info uib-datepicker-current\" ng-click=\"select('today')\" ng-disabled=\"isDisabled('today')\">{{ getText('current') }}</button>\n" +
            "      <button type=\"button\" class=\"btn btn-sm btn-danger uib-clear\" ng-click=\"select(null)\">{{ getText('clear') }}</button>\n" +
            "    </span>\n" +
            "      <button type=\"button\" class=\"btn btn-sm btn-success pull-right uib-close\" ng-click=\"close()\">{{ getText('close') }}</button>\n" +
            "    </li>\n" +
            "  </ul>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/datepicker/year.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/datepicker/year.html",
            "<table class=\"uib-yearpicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
            "  <thead>\n" +
            "    <tr>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
            "      <th colspan=\"{{::columns - 2}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
            "    </tr>\n" +
            "  </thead>\n" +
            "  <tbody>\n" +
            "    <tr class=\"uib-years\" ng-repeat=\"row in rows track by $index\">\n" +
            "      <td ng-repeat=\"dt in row\" class=\"uib-year text-center\" role=\"gridcell\"\n" +
            "        id=\"{{::dt.uid}}\"\n" +
            "        ng-class=\"::dt.customClass\">\n" +
            "        <button type=\"button\" class=\"btn btn-default\"\n" +
            "          uib-is-class=\"\n" +
            "            'btn-info' for selectedDt,\n" +
            "            'active' for activeDt\n" +
            "            on dt\"\n" +
            "          ng-click=\"select(dt.date)\"\n" +
            "          ng-disabled=\"::dt.disabled\"\n" +
            "          tabindex=\"-1\"><span ng-class=\"::{'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
            "      </td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n" +
            "");
}]);

angular.module("uib/template/modal/backdrop.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/modal/backdrop.html",
            "<div class=\"modal-backdrop\"\n" +
            "     uib-modal-animation-class=\"fade\"\n" +
            "     modal-in-class=\"in\"\n" +
            "     ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10}\"\n" +
            "></div>\n" +
            "");
}]);

angular.module("uib/template/modal/window.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/modal/window.html",
            "<div modal-render=\"{{$isRendered}}\" tabindex=\"-1\" role=\"dialog\" class=\"modal\"\n" +
            "    uib-modal-animation-class=\"fade\"\n" +
            "    modal-in-class=\"in\"\n" +
            "    ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\">\n" +
            "    <div class=\"modal-dialog {{size ? 'modal-' + size : ''}}\"><div class=\"modal-content\" uib-modal-transclude></div></div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/pager/pager.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/pager/pager.html",
            "<ul class=\"pager\">\n" +
            "  <li ng-class=\"{disabled: noPrevious()||ngDisabled, previous: align}\"><a href ng-click=\"selectPage(page - 1, $event)\">{{::getText('previous')}}</a></li>\n" +
            "  <li ng-class=\"{disabled: noNext()||ngDisabled, next: align}\"><a href ng-click=\"selectPage(page + 1, $event)\">{{::getText('next')}}</a></li>\n" +
            "</ul>\n" +
            "");
}]);

angular.module("uib/template/pagination/pagination.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/pagination/pagination.html",
            "<ul class=\"pagination\">\n" +
            "  <li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" class=\"pagination-first\"><a href ng-click=\"selectPage(1, $event)\">{{::getText('first')}}</a></li>\n" +
            "  <li ng-if=\"::directionLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" class=\"pagination-prev\"><a href ng-click=\"selectPage(page - 1, $event)\">{{::getText('previous')}}</a></li>\n" +
            "  <li ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active,disabled: ngDisabled&&!page.active}\" class=\"pagination-page\"><a href ng-click=\"selectPage(page.number, $event)\">{{page.text}}</a></li>\n" +
            "  <li ng-if=\"::directionLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" class=\"pagination-next\"><a href ng-click=\"selectPage(page + 1, $event)\">{{::getText('next')}}</a></li>\n" +
            "  <li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" class=\"pagination-last\"><a href ng-click=\"selectPage(totalPages, $event)\">{{::getText('last')}}</a></li>\n" +
            "</ul>\n" +
            "");
}]);

angular.module("uib/template/tooltip/tooltip-html-popup.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/tooltip/tooltip-html-popup.html",
            "<div class=\"tooltip\"\n" +
            "  tooltip-animation-class=\"fade\"\n" +
            "  uib-tooltip-classes\n" +
            "  ng-class=\"{ in: isOpen() }\">\n" +
            "  <div class=\"tooltip-arrow\"></div>\n" +
            "  <div class=\"tooltip-inner\" ng-bind-html=\"contentExp()\"></div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/tooltip/tooltip-popup.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/tooltip/tooltip-popup.html",
            "<div class=\"tooltip\"\n" +
            "  tooltip-animation-class=\"fade\"\n" +
            "  uib-tooltip-classes\n" +
            "  ng-class=\"{ in: isOpen() }\">\n" +
            "  <div class=\"tooltip-arrow\"></div>\n" +
            "  <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/tooltip/tooltip-template-popup.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/tooltip/tooltip-template-popup.html",
            "<div class=\"tooltip\"\n" +
            "  tooltip-animation-class=\"fade\"\n" +
            "  uib-tooltip-classes\n" +
            "  ng-class=\"{ in: isOpen() }\">\n" +
            "  <div class=\"tooltip-arrow\"></div>\n" +
            "  <div class=\"tooltip-inner\"\n" +
            "    uib-tooltip-template-transclude=\"contentExp()\"\n" +
            "    tooltip-template-transclude-scope=\"originScope()\"></div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/popover/popover-html.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/popover/popover-html.html",
            "<div class=\"popover\"\n" +
            "  tooltip-animation-class=\"fade\"\n" +
            "  uib-tooltip-classes\n" +
            "  ng-class=\"{ in: isOpen() }\">\n" +
            "  <div class=\"arrow\"></div>\n" +
            "\n" +
            "  <div class=\"popover-inner\">\n" +
            "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-if=\"title\"></h3>\n" +
            "      <div class=\"popover-content\" ng-bind-html=\"contentExp()\"></div>\n" +
            "  </div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/popover/popover-template.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/popover/popover-template.html",
            "<div class=\"popover\"\n" +
            "  tooltip-animation-class=\"fade\"\n" +
            "  uib-tooltip-classes\n" +
            "  ng-class=\"{ in: isOpen() }\">\n" +
            "  <div class=\"arrow\"></div>\n" +
            "\n" +
            "  <div class=\"popover-inner\">\n" +
            "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-if=\"title\"></h3>\n" +
            "      <div class=\"popover-content\"\n" +
            "        uib-tooltip-template-transclude=\"contentExp()\"\n" +
            "        tooltip-template-transclude-scope=\"originScope()\"></div>\n" +
            "  </div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/popover/popover.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/popover/popover.html",
            "<div class=\"popover\"\n" +
            "  tooltip-animation-class=\"fade\"\n" +
            "  uib-tooltip-classes\n" +
            "  ng-class=\"{ in: isOpen() }\">\n" +
            "  <div class=\"arrow\"></div>\n" +
            "\n" +
            "  <div class=\"popover-inner\">\n" +
            "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-if=\"title\"></h3>\n" +
            "      <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
            "  </div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/progressbar/bar.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/progressbar/bar.html",
            "<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: (percent < 100 ? percent : 100) + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" aria-labelledby=\"{{::title}}\" ng-transclude></div>\n" +
            "");
}]);

angular.module("uib/template/progressbar/progress.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/progressbar/progress.html",
        "<div class=\"progress\" ng-transclude aria-labelledby=\"{{::title}}\"></div>");
}]);

angular.module("uib/template/progressbar/progressbar.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/progressbar/progressbar.html",
            "<div class=\"progress\">\n" +
            "  <div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: (percent < 100 ? percent : 100) + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" aria-labelledby=\"{{::title}}\" ng-transclude></div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/rating/rating.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/rating/rating.html",
            "<span ng-mouseleave=\"reset()\" ng-keydown=\"onKeydown($event)\" tabindex=\"0\" role=\"slider\" aria-valuemin=\"0\" aria-valuemax=\"{{range.length}}\" aria-valuenow=\"{{value}}\">\n" +
            "    <span ng-repeat-start=\"r in range track by $index\" class=\"sr-only\">({{ $index < value ? '*' : ' ' }})</span>\n" +
            "    <i ng-repeat-end ng-mouseenter=\"enter($index + 1)\" ng-click=\"rate($index + 1)\" class=\"glyphicon\" ng-class=\"$index < value && (r.stateOn || 'glyphicon-star') || (r.stateOff || 'glyphicon-star-empty')\" ng-attr-title=\"{{r.title}}\" aria-valuetext=\"{{r.title}}\"></i>\n" +
            "</span>\n" +
            "");
}]);

angular.module("uib/template/tabs/tab.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/tabs/tab.html",
            "<li ng-class=\"{active: active, disabled: disabled}\" class=\"uib-tab\">\n" +
            "  <a href ng-click=\"select()\" uib-tab-heading-transclude>{{heading}}</a>\n" +
            "</li>\n" +
            "");
}]);

angular.module("uib/template/tabs/tabset.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/tabs/tabset.html",
            "<div>\n" +
            "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
            "  <div class=\"tab-content\">\n" +
            "    <div class=\"tab-pane\" \n" +
            "         ng-repeat=\"tab in tabs\" \n" +
            "         ng-class=\"{active: tab.active}\"\n" +
            "         uib-tab-content-transclude=\"tab\">\n" +
            "    </div>\n" +
            "  </div>\n" +
            "</div>\n" +
            "");
}]);

angular.module("uib/template/timepicker/timepicker.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/timepicker/timepicker.html",
            "<table class=\"uib-timepicker\">\n" +
            "  <tbody>\n" +
            "    <tr class=\"text-center\" ng-show=\"::showSpinners\">\n" +
            "      <td class=\"uib-increment hours\"><a ng-click=\"incrementHours()\" ng-class=\"{disabled: noIncrementHours()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementHours()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
            "      <td>&nbsp;</td>\n" +
            "      <td class=\"uib-increment minutes\"><a ng-click=\"incrementMinutes()\" ng-class=\"{disabled: noIncrementMinutes()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementMinutes()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
            "      <td ng-show=\"showSeconds\">&nbsp;</td>\n" +
            "      <td ng-show=\"showSeconds\" class=\"uib-increment seconds\"><a ng-click=\"incrementSeconds()\" ng-class=\"{disabled: noIncrementSeconds()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementSeconds()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
            "      <td ng-show=\"showMeridian\"></td>\n" +
            "    </tr>\n" +
            "    <tr>\n" +
            "      <td class=\"form-group uib-time hours\" ng-class=\"{'has-error': invalidHours}\">\n" +
            "        <input style=\"width:50px;\" type=\"text\" placeholder=\"HH\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-readonly=\"::readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementHours()\" ng-blur=\"blur()\">\n" +
            "      </td>\n" +
            "      <td class=\"uib-separator\">:</td>\n" +
            "      <td class=\"form-group uib-time minutes\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
            "        <input style=\"width:50px;\" type=\"text\" placeholder=\"MM\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"::readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementMinutes()\" ng-blur=\"blur()\">\n" +
            "      </td>\n" +
            "      <td ng-show=\"showSeconds\" class=\"uib-separator\">:</td>\n" +
            "      <td class=\"form-group uib-time seconds\" ng-class=\"{'has-error': invalidSeconds}\" ng-show=\"showSeconds\">\n" +
            "        <input style=\"width:50px;\" type=\"text\" placeholder=\"SS\" ng-model=\"seconds\" ng-change=\"updateSeconds()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementSeconds()\" ng-blur=\"blur()\">\n" +
            "      </td>\n" +
            "      <td ng-show=\"showMeridian\" class=\"uib-time am-pm\"><button type=\"button\" ng-class=\"{disabled: noToggleMeridian()}\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\" ng-disabled=\"noToggleMeridian()\" tabindex=\"{{::tabindex}}\">{{meridian}}</button></td>\n" +
            "    </tr>\n" +
            "    <tr class=\"text-center\" ng-show=\"::showSpinners\">\n" +
            "      <td class=\"uib-decrement hours\"><a ng-click=\"decrementHours()\" ng-class=\"{disabled: noDecrementHours()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementHours()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
            "      <td>&nbsp;</td>\n" +
            "      <td class=\"uib-decrement minutes\"><a ng-click=\"decrementMinutes()\" ng-class=\"{disabled: noDecrementMinutes()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementMinutes()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
            "      <td ng-show=\"showSeconds\">&nbsp;</td>\n" +
            "      <td ng-show=\"showSeconds\" class=\"uib-decrement seconds\"><a ng-click=\"decrementSeconds()\" ng-class=\"{disabled: noDecrementSeconds()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementSeconds()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
            "      <td ng-show=\"showMeridian\"></td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n" +
            "");
}]);

angular.module("uib/template/typeahead/typeahead-match.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/typeahead/typeahead-match.html",
            "<a href\n" +
            "   tabindex=\"-1\"\n" +
            "   ng-bind-html=\"match.label | uibTypeaheadHighlight:query\"\n" +
            "   ng-attr-title=\"{{match.label}}\"></a>\n" +
            "");
}]);

angular.module("uib/template/typeahead/typeahead-popup.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/typeahead/typeahead-popup.html",
            "<ul class=\"dropdown-menu\" ng-show=\"isOpen() && !moveInProgress\" ng-style=\"{top: position().top+'px', left: position().left+'px'}\" role=\"listbox\" aria-hidden=\"{{!isOpen()}}\">\n" +
            "    <li ng-repeat=\"match in matches track by $index\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index, $event)\" role=\"option\" id=\"{{::match.id}}\">\n" +
            "        <div uib-typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
            "    </li>\n" +
            "</ul>\n" +
            "");
}]);
angular.module('ui.bootstrap.carousel').run(function () {
    !angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/css">.ng-animate.item:not(.left):not(.right){-webkit-transition:0s ease-in-out left;transition:0s ease-in-out left}</style>');
});
angular.module('ui.bootstrap.datepicker').run(function () {
    !angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/css">.uib-datepicker .uib-title{width:100%;}.uib-day button,.uib-month button,.uib-year button{min-width:100%;}.uib-datepicker-popup.dropdown-menu{display:block;}.uib-button-bar{padding:10px 9px 2px;}</style>');
});
angular.module('ui.bootstrap.timepicker').run(function () {
    !angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/css">.uib-time input{width:50px;}</style>');
});
angular.module('ui.bootstrap.typeahead').run(function () {
    !angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/css">[uib-typeahead-popup].dropdown-menu{display:block;}</style>');
});
/*! 
 * angular-loading-bar v0.7.1
 * https://chieffancypants.github.io/angular-loading-bar
 * Copyright (c) 2015 Wes Cruver
 * License: MIT
 */
/*
 * angular-loading-bar
 *
 * intercepts XHR requests and creates a loading bar.
 * Based on the excellent nprogress work by rstacruz (more info in readme)
 *
 * (c) 2013 Wes Cruver
 * License: MIT
 */


(function () {

    'use strict';

// Alias the loading bar for various backwards compatibilities since the project has matured:
    angular.module('angular-loading-bar', ['cfp.loadingBarInterceptor']);
    angular.module('chieffancypants.loadingBar', ['cfp.loadingBarInterceptor']);


    /**
     * loadingBarInterceptor service
     *
     * Registers itself as an Angular interceptor and listens for XHR requests.
     */
    angular.module('cfp.loadingBarInterceptor', ['cfp.loadingBar'])
        .config(['$httpProvider', function ($httpProvider) {

            var interceptor = ['$q', '$cacheFactory', '$timeout', '$rootScope', '$log', 'cfpLoadingBar', function ($q, $cacheFactory, $timeout, $rootScope, $log, cfpLoadingBar) {

                /**
                 * The total number of requests made
                 */
                var reqsTotal = 0;

                /**
                 * The number of requests completed (either successfully or not)
                 */
                var reqsCompleted = 0;

                /**
                 * The amount of time spent fetching before showing the loading bar
                 */
                var latencyThreshold = cfpLoadingBar.latencyThreshold;

                /**
                 * $timeout handle for latencyThreshold
                 */
                var startTimeout;


                /**
                 * calls cfpLoadingBar.complete() which removes the
                 * loading bar from the DOM.
                 */
                function setComplete() {
                    $timeout.cancel(startTimeout);
                    cfpLoadingBar.complete();
                    reqsCompleted = 0;
                    reqsTotal = 0;
                }

                /**
                 * Determine if the response has already been cached
                 * @param  {Object}  config the config option from the request
                 * @return {Boolean} retrns true if cached, otherwise false
                 */
                function isCached(config) {
                    var cache;
                    var defaultCache = $cacheFactory.get('$http');
                    var defaults = $httpProvider.defaults;

                    // Choose the proper cache source. Borrowed from angular: $http service
                    if ((config.cache || defaults.cache) && config.cache !== false &&
                        (config.method === 'GET' || config.method === 'JSONP')) {
                        cache = angular.isObject(config.cache) ? config.cache
                            : angular.isObject(defaults.cache) ? defaults.cache
                            : defaultCache;
                    }

                    var cached = cache !== undefined ?
                        cache.get(config.url) !== undefined : false;

                    if (config.cached !== undefined && cached !== config.cached) {
                        return config.cached;
                    }
                    config.cached = cached;
                    return cached;
                }


                return {
                    'request': function (config) {
                        // Check to make sure this request hasn't already been cached and that
                        // the requester didn't explicitly ask us to ignore this request:
                        if (!config.ignoreLoadingBar && !isCached(config)) {
                            $rootScope.$broadcast('cfpLoadingBar:loading', {url: config.url});
                            if (reqsTotal === 0) {
                                startTimeout = $timeout(function () {
                                    cfpLoadingBar.start();
                                }, latencyThreshold);
                            }
                            reqsTotal++;
                            cfpLoadingBar.set(reqsCompleted / reqsTotal);
                        }
                        return config;
                    },

                    'response': function (response) {
                        if (!response || !response.config) {
                            $log.error('Broken interceptor detected: Config object not supplied in response:\n https://github.com/chieffancypants/angular-loading-bar/pull/50');
                            return response;
                        }

                        if (!response.config.ignoreLoadingBar && !isCached(response.config)) {
                            reqsCompleted++;
                            $rootScope.$broadcast('cfpLoadingBar:loaded', {url: response.config.url, result: response});
                            if (reqsCompleted >= reqsTotal) {
                                setComplete();
                            } else {
                                cfpLoadingBar.set(reqsCompleted / reqsTotal);
                            }
                        }
                        return response;
                    },

                    'responseError': function (rejection) {
                        if (!rejection || !rejection.config) {
                            $log.error('Broken interceptor detected: Config object not supplied in rejection:\n https://github.com/chieffancypants/angular-loading-bar/pull/50');
                            return $q.reject(rejection);
                        }

                        if (!rejection.config.ignoreLoadingBar && !isCached(rejection.config)) {
                            reqsCompleted++;
                            $rootScope.$broadcast('cfpLoadingBar:loaded', {url: rejection.config.url, result: rejection});
                            if (reqsCompleted >= reqsTotal) {
                                setComplete();
                            } else {
                                cfpLoadingBar.set(reqsCompleted / reqsTotal);
                            }
                        }
                        return $q.reject(rejection);
                    }
                };
            }];

            $httpProvider.interceptors.push(interceptor);
        }]);


    /**
     * Loading Bar
     *
     * This service handles adding and removing the actual element in the DOM.
     * Generally, best practices for DOM manipulation is to take place in a
     * directive, but because the element itself is injected in the DOM only upon
     * XHR requests, and it's likely needed on every view, the best option is to
     * use a service.
     */
    angular.module('cfp.loadingBar', [])
        .provider('cfpLoadingBar', function () {

            this.includeSpinner = true;
            this.includeBar = true;
            this.latencyThreshold = 100;
            this.startSize = 0.02;
            this.parentSelector = 'body';
            this.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>';
            this.loadingBarTemplate = '<div id="loading-bar"><div class="bar"><div class="peg"></div></div></div>';

            this.$get = ['$injector', '$document', '$timeout', '$rootScope', function ($injector, $document, $timeout, $rootScope) {
                var $animate;
                var $parentSelector = this.parentSelector,
                    loadingBarContainer = angular.element(this.loadingBarTemplate),
                    loadingBar = loadingBarContainer.find('div').eq(0),
                    spinner = angular.element(this.spinnerTemplate);

                var incTimeout,
                    completeTimeout,
                    started = false,
                    status = 0;

                var includeSpinner = this.includeSpinner;
                var includeBar = this.includeBar;
                var startSize = this.startSize;

                /**
                 * Inserts the loading bar element into the dom, and sets it to 2%
                 */
                function _start() {
                    if (!$animate) {
                        $animate = $injector.get('$animate');
                    }

                    var $parent = $document.find($parentSelector).eq(0);
                    $timeout.cancel(completeTimeout);

                    // do not continually broadcast the started event:
                    if (started) {
                        return;
                    }

                    $rootScope.$broadcast('cfpLoadingBar:started');
                    started = true;

                    if (includeBar) {
                        $animate.enter(loadingBarContainer, $parent, angular.element($parent[0].lastChild));
                    }

                    if (includeSpinner) {
                        $animate.enter(spinner, $parent, angular.element($parent[0].lastChild));
                    }

                    _set(startSize);
                }

                /**
                 * Set the loading bar's width to a certain percent.
                 *
                 * @param n any value between 0 and 1
                 */
                function _set(n) {
                    if (!started) {
                        return;
                    }
                    var pct = (n * 100) + '%';
                    loadingBar.css('width', pct);
                    status = n;

                    // increment loadingbar to give the illusion that there is always
                    // progress but make sure to cancel the previous timeouts so we don't
                    // have multiple incs running at the same time.
                    $timeout.cancel(incTimeout);
                    incTimeout = $timeout(function () {
                        _inc();
                    }, 250);
                }

                /**
                 * Increments the loading bar by a random amount
                 * but slows down as it progresses
                 */
                function _inc() {
                    if (_status() >= 1) {
                        return;
                    }

                    var rnd = 0;

                    // TODO: do this mathmatically instead of through conditions

                    var stat = _status();
                    if (stat >= 0 && stat < 0.25) {
                        // Start out between 3 - 6% increments
                        rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
                    } else if (stat >= 0.25 && stat < 0.65) {
                        // increment between 0 - 3%
                        rnd = (Math.random() * 3) / 100;
                    } else if (stat >= 0.65 && stat < 0.9) {
                        // increment between 0 - 2%
                        rnd = (Math.random() * 2) / 100;
                    } else if (stat >= 0.9 && stat < 0.99) {
                        // finally, increment it .5 %
                        rnd = 0.005;
                    } else {
                        // after 99%, don't increment:
                        rnd = 0;
                    }

                    var pct = _status() + rnd;
                    _set(pct);
                }

                function _status() {
                    return status;
                }

                function _completeAnimation() {
                    status = 0;
                    started = false;
                }

                function _complete() {
                    if (!$animate) {
                        $animate = $injector.get('$animate');
                    }

                    $rootScope.$broadcast('cfpLoadingBar:completed');
                    _set(1);

                    $timeout.cancel(completeTimeout);

                    // Attempt to aggregate any start/complete calls within 500ms:
                    completeTimeout = $timeout(function () {
                        var promise = $animate.leave(loadingBarContainer, _completeAnimation);
                        if (promise && promise.then) {
                            promise.then(_completeAnimation);
                        }
                        $animate.leave(spinner);
                    }, 500);
                }

                return {
                    start: _start,
                    set: _set,
                    status: _status,
                    inc: _inc,
                    complete: _complete,
                    includeSpinner: this.includeSpinner,
                    latencyThreshold: this.latencyThreshold,
                    parentSelector: this.parentSelector,
                    startSize: this.startSize
                };


            }];     //
        });       // wtf javascript. srsly
})();       //

/**
 * x is a value between 0 and 1, indicating where in the animation you are.
 */
var duScrollDefaultEasing = function (x) {
    'use strict';

    if (x < 0.5) {
        return Math.pow(x * 2, 2) / 2;
    }
    return 1 - Math.pow((1 - x) * 2, 2) / 2;
};

angular.module('duScroll', [
    'duScroll.scrollspy',
    'duScroll.smoothScroll',
    'duScroll.scrollContainer',
    'duScroll.spyContext',
    'duScroll.scrollHelpers'
])
    //Default animation duration for smoothScroll directive
    .value('duScrollDuration', 350)
    //Scrollspy debounce interval, set to 0 to disable
    .value('duScrollSpyWait', 100)
    //Wether or not multiple scrollspies can be active at once
    .value('duScrollGreedy', false)
    //Default offset for smoothScroll directive
    .value('duScrollOffset', 0)
    //Default easing function for scroll animation
    .value('duScrollEasing', duScrollDefaultEasing);


angular.module('duScroll.scrollHelpers', ['duScroll.requestAnimation'])
    .run(["$window", "$q", "cancelAnimation", "requestAnimation", "duScrollEasing", "duScrollDuration", "duScrollOffset", function ($window, $q, cancelAnimation, requestAnimation, duScrollEasing, duScrollDuration, duScrollOffset) {
        'use strict';

        var proto = {};

        var isDocument = function (el) {
            return (typeof HTMLDocument !== 'undefined' && el instanceof HTMLDocument) || (el.nodeType && el.nodeType === el.DOCUMENT_NODE);
        };

        var isElement = function (el) {
            return (typeof HTMLElement !== 'undefined' && el instanceof HTMLElement) || (el.nodeType && el.nodeType === el.ELEMENT_NODE);
        };

        var unwrap = function (el) {
            return isElement(el) || isDocument(el) ? el : el[0];
        };

        proto.duScrollTo = function (left, top, duration, easing) {
            var aliasFn;
            if (angular.isElement(left)) {
                aliasFn = this.duScrollToElement;
            } else if (angular.isDefined(duration)) {
                aliasFn = this.duScrollToAnimated;
            }
            if (aliasFn) {
                return aliasFn.apply(this, arguments);
            }
            var el = unwrap(this);
            if (isDocument(el)) {
                return $window.scrollTo(left, top);
            }
            el.scrollLeft = left;
            el.scrollTop = top;
        };

        var scrollAnimation, deferred;
        proto.duScrollToAnimated = function (left, top, duration, easing) {
            if (duration && !easing) {
                easing = duScrollEasing;
            }
            var startLeft = this.duScrollLeft(),
                startTop = this.duScrollTop(),
                deltaLeft = Math.round(left - startLeft),
                deltaTop = Math.round(top - startTop);

            var startTime = null, progress = 0;
            var el = this;

            var cancelOnEvents = 'scroll mousedown mousewheel touchmove keydown';
            var cancelScrollAnimation = function ($event) {
                if (!$event || (progress && $event.which > 0)) {
                    el.unbind(cancelOnEvents, cancelScrollAnimation);
                    cancelAnimation(scrollAnimation);
                    deferred.reject();
                    scrollAnimation = null;
                }
            };

            if (scrollAnimation) {
                cancelScrollAnimation();
            }
            deferred = $q.defer();

            if (duration === 0 || (!deltaLeft && !deltaTop)) {
                if (duration === 0) {
                    el.duScrollTo(left, top);
                }
                deferred.resolve();
                return deferred.promise;
            }

            var animationStep = function (timestamp) {
                if (startTime === null) {
                    startTime = timestamp;
                }

                progress = timestamp - startTime;
                var percent = (progress >= duration ? 1 : easing(progress / duration));

                el.scrollTo(
                        startLeft + Math.ceil(deltaLeft * percent),
                        startTop + Math.ceil(deltaTop * percent)
                );
                if (percent < 1) {
                    scrollAnimation = requestAnimation(animationStep);
                } else {
                    el.unbind(cancelOnEvents, cancelScrollAnimation);
                    scrollAnimation = null;
                    deferred.resolve();
                }
            };

            //Fix random mobile safari bug when scrolling to top by hitting status bar
            el.duScrollTo(startLeft, startTop);

            el.bind(cancelOnEvents, cancelScrollAnimation);

            scrollAnimation = requestAnimation(animationStep);
            return deferred.promise;
        };

        proto.duScrollToElement = function (target, offset, duration, easing) {
            var el = unwrap(this);
            if (!angular.isNumber(offset) || isNaN(offset)) {
                offset = duScrollOffset;
            }
            var top = this.duScrollTop() + unwrap(target).getBoundingClientRect().top - offset;
            if (isElement(el)) {
                top -= el.getBoundingClientRect().top;
            }
            return this.duScrollTo(0, top, duration, easing);
        };

        proto.duScrollLeft = function (value, duration, easing) {
            if (angular.isNumber(value)) {
                return this.duScrollTo(value, this.duScrollTop(), duration, easing);
            }
            var el = unwrap(this);
            if (isDocument(el)) {
                return $window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft;
            }
            return el.scrollLeft;
        };
        proto.duScrollTop = function (value, duration, easing) {
            if (angular.isNumber(value)) {
                return this.duScrollTo(this.duScrollLeft(), value, duration, easing);
            }
            var el = unwrap(this);
            if (isDocument(el)) {
                return $window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
            }
            return el.scrollTop;
        };

        proto.duScrollToElementAnimated = function (target, offset, duration, easing) {
            return this.duScrollToElement(target, offset, duration || duScrollDuration, easing);
        };

        proto.duScrollTopAnimated = function (top, duration, easing) {
            return this.duScrollTop(top, duration || duScrollDuration, easing);
        };

        proto.duScrollLeftAnimated = function (left, duration, easing) {
            return this.duScrollLeft(left, duration || duScrollDuration, easing);
        };

        angular.forEach(proto, function (fn, key) {
            angular.element.prototype[key] = fn;

            //Remove prefix if not already claimed by jQuery / ui.utils
            var unprefixed = key.replace(/^duScroll/, 'scroll');
            if (angular.isUndefined(angular.element.prototype[unprefixed])) {
                angular.element.prototype[unprefixed] = fn;
            }
        });

    }]);


//Adapted from https://gist.github.com/paulirish/1579671
angular.module('duScroll.polyfill', [])
    .factory('polyfill', ["$window", function ($window) {
        'use strict';

        var vendors = ['webkit', 'moz', 'o', 'ms'];

        return function (fnName, fallback) {
            if ($window[fnName]) {
                return $window[fnName];
            }
            var suffix = fnName.substr(0, 1).toUpperCase() + fnName.substr(1);
            for (var key, i = 0; i < vendors.length; i++) {
                key = vendors[i] + suffix;
                if ($window[key]) {
                    return $window[key];
                }
            }
            return fallback;
        };
    }]);

angular.module('duScroll.requestAnimation', ['duScroll.polyfill'])
    .factory('requestAnimation', ["polyfill", "$timeout", function (polyfill, $timeout) {
        'use strict';

        var lastTime = 0;
        var fallback = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = $timeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        return polyfill('requestAnimationFrame', fallback);
    }])
    .factory('cancelAnimation', ["polyfill", "$timeout", function (polyfill, $timeout) {
        'use strict';

        var fallback = function (promise) {
            $timeout.cancel(promise);
        };

        return polyfill('cancelAnimationFrame', fallback);
    }]);


angular.module('duScroll.spyAPI', ['duScroll.scrollContainerAPI'])
    .factory('spyAPI', ["$rootScope", "$timeout", "$window", "$document", "scrollContainerAPI", "duScrollGreedy", "duScrollSpyWait", function ($rootScope, $timeout, $window, $document, scrollContainerAPI, duScrollGreedy, duScrollSpyWait) {
        'use strict';

        var createScrollHandler = function (context) {
            var timer = false, queued = false;
            var handler = function () {
                queued = false;
                var container = context.container,
                    containerEl = container[0],
                    containerOffset = 0,
                    bottomReached;

                if (typeof HTMLElement !== 'undefined' && containerEl instanceof HTMLElement || containerEl.nodeType && containerEl.nodeType === containerEl.ELEMENT_NODE) {
                    containerOffset = containerEl.getBoundingClientRect().top;
                    bottomReached = Math.round(containerEl.scrollTop + containerEl.clientHeight) >= containerEl.scrollHeight;
                } else {
                    bottomReached = Math.round($window.pageYOffset + $window.innerHeight) >= $document[0].body.scrollHeight;
                }
                var compareProperty = (bottomReached ? 'bottom' : 'top');

                var i, currentlyActive, toBeActive, spies, spy, pos;
                spies = context.spies;
                currentlyActive = context.currentlyActive;
                toBeActive = undefined;

                for (i = 0; i < spies.length; i++) {
                    spy = spies[i];
                    pos = spy.getTargetPosition();
                    if (!pos) continue;

                    if (bottomReached || (pos.top + spy.offset - containerOffset < 20 && (duScrollGreedy || pos.top * -1 + containerOffset) < pos.height)) {
                        //Find the one closest the viewport top or the page bottom if it's reached
                        if (!toBeActive || toBeActive[compareProperty] < pos[compareProperty]) {
                            toBeActive = {
                                spy: spy
                            };
                            toBeActive[compareProperty] = pos[compareProperty];
                        }
                    }
                }

                if (toBeActive) {
                    toBeActive = toBeActive.spy;
                }
                if (currentlyActive === toBeActive || (duScrollGreedy && !toBeActive)) return;
                if (currentlyActive) {
                    currentlyActive.$element.removeClass('active');
                    $rootScope.$broadcast('duScrollspy:becameInactive', currentlyActive.$element);
                }
                if (toBeActive) {
                    toBeActive.$element.addClass('active');
                    $rootScope.$broadcast('duScrollspy:becameActive', toBeActive.$element);
                }
                context.currentlyActive = toBeActive;
            };

            if (!duScrollSpyWait) {
                return handler;
            }

            //Debounce for potential performance savings
            return function () {
                if (!timer) {
                    handler();
                    timer = $timeout(function () {
                        timer = false;
                        if (queued) {
                            handler();
                        }
                    }, duScrollSpyWait, false);
                } else {
                    queued = true;
                }
            };
        };

        var contexts = {};

        var createContext = function ($scope) {
            var id = $scope.$id;
            var context = {
                spies: []
            };

            context.handler = createScrollHandler(context);
            contexts[id] = context;

            $scope.$on('$destroy', function () {
                destroyContext($scope);
            });

            return id;
        };

        var destroyContext = function ($scope) {
            var id = $scope.$id;
            var context = contexts[id], container = context.container;
            if (container) {
                container.off('scroll', context.handler);
            }
            delete contexts[id];
        };

        var defaultContextId = createContext($rootScope);

        var getContextForScope = function (scope) {
            if (contexts[scope.$id]) {
                return contexts[scope.$id];
            }
            if (scope.$parent) {
                return getContextForScope(scope.$parent);
            }
            return contexts[defaultContextId];
        };

        var getContextForSpy = function (spy) {
            var context, contextId, scope = spy.$scope;
            if (scope) {
                return getContextForScope(scope);
            }
            //No scope, most likely destroyed
            for (contextId in contexts) {
                context = contexts[contextId];
                if (context.spies.indexOf(spy) !== -1) {
                    return context;
                }
            }
        };

        var isElementInDocument = function (element) {
            while (element.parentNode) {
                element = element.parentNode;
                if (element === document) {
                    return true;
                }
            }
            return false;
        };

        var addSpy = function (spy) {
            var context = getContextForSpy(spy);
            if (!context) return;
            context.spies.push(spy);
            if (!context.container || !isElementInDocument(context.container)) {
                if (context.container) {
                    context.container.off('scroll', context.handler);
                }
                context.container = scrollContainerAPI.getContainer(spy.$scope);
                context.container.on('scroll', context.handler).triggerHandler('scroll');
            }
        };

        var removeSpy = function (spy) {
            var context = getContextForSpy(spy);
            if (spy === context.currentlyActive) {
                context.currentlyActive = null;
            }
            var i = context.spies.indexOf(spy);
            if (i !== -1) {
                context.spies.splice(i, 1);
            }
            spy.$element = null;
        };

        return {
            addSpy: addSpy,
            removeSpy: removeSpy,
            createContext: createContext,
            destroyContext: destroyContext,
            getContextForScope: getContextForScope
        };
    }]);


angular.module('duScroll.scrollContainerAPI', [])
    .factory('scrollContainerAPI', ["$document", function ($document) {
        'use strict';

        var containers = {};

        var setContainer = function (scope, element) {
            var id = scope.$id;
            containers[id] = element;
            return id;
        };

        var getContainerId = function (scope) {
            if (containers[scope.$id]) {
                return scope.$id;
            }
            if (scope.$parent) {
                return getContainerId(scope.$parent);
            }
            return;
        };

        var getContainer = function (scope) {
            var id = getContainerId(scope);
            return id ? containers[id] : $document;
        };

        var removeContainer = function (scope) {
            var id = getContainerId(scope);
            if (id) {
                delete containers[id];
            }
        };

        return {
            getContainerId: getContainerId,
            getContainer: getContainer,
            setContainer: setContainer,
            removeContainer: removeContainer
        };
    }]);


angular.module('duScroll.smoothScroll', ['duScroll.scrollHelpers', 'duScroll.scrollContainerAPI'])
    .directive('duSmoothScroll', ["duScrollDuration", "duScrollOffset", "scrollContainerAPI", function (duScrollDuration, duScrollOffset, scrollContainerAPI) {
        'use strict';

        return {
            link: function ($scope, $element, $attr) {
                $element.on('click', function (e) {
                    if (!$attr.href || $attr.href.indexOf('#') === -1) return;

                    var target = document.getElementById($attr.href.replace(/.*(?=#[^\s]+$)/, '').substring(1));
                    if (!target || !target.getBoundingClientRect) return;

                    if (e.stopPropagation) e.stopPropagation();
                    if (e.preventDefault) e.preventDefault();

                    var offset = $attr.offset ? parseInt($attr.offset, 10) : duScrollOffset;
                    var duration = $attr.duration ? parseInt($attr.duration, 10) : duScrollDuration;
                    var container = scrollContainerAPI.getContainer($scope);

                    container.duScrollToElement(
                        angular.element(target),
                        isNaN(offset) ? 0 : offset,
                        isNaN(duration) ? 0 : duration
                    );
                });
            }
        };
    }]);


angular.module('duScroll.spyContext', ['duScroll.spyAPI'])
    .directive('duSpyContext', ["spyAPI", function (spyAPI) {
        'use strict';

        return {
            restrict: 'A',
            scope: true,
            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink($scope, iElement, iAttrs, controller) {
                        spyAPI.createContext($scope);
                    }
                };
            }
        };
    }]);


angular.module('duScroll.scrollContainer', ['duScroll.scrollContainerAPI'])
    .directive('duScrollContainer', ["scrollContainerAPI", function (scrollContainerAPI) {
        'use strict';

        return {
            restrict: 'A',
            scope: true,
            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink($scope, iElement, iAttrs, controller) {
                        iAttrs.$observe('duScrollContainer', function (element) {
                            if (angular.isString(element)) {
                                element = document.getElementById(element);
                            }

                            element = (angular.isElement(element) ? angular.element(element) : iElement);
                            scrollContainerAPI.setContainer($scope, element);
                            $scope.$on('$destroy', function () {
                                scrollContainerAPI.removeContainer($scope);
                            });
                        });
                    }
                };
            }
        };
    }]);


angular.module('duScroll.scrollspy', ['duScroll.spyAPI'])
    .directive('duScrollspy', ["spyAPI", "duScrollOffset", "$timeout", "$rootScope", function (spyAPI, duScrollOffset, $timeout, $rootScope) {
        'use strict';

        var Spy = function (targetElementOrId, $scope, $element, offset) {
            if (angular.isElement(targetElementOrId)) {
                this.target = targetElementOrId;
            } else if (angular.isString(targetElementOrId)) {
                this.targetId = targetElementOrId;
            }
            this.$scope = $scope;
            this.$element = $element;
            this.offset = offset;
        };

        Spy.prototype.getTargetElement = function () {
            if (!this.target && this.targetId) {
                this.target = document.getElementById(this.targetId);
            }
            return this.target;
        };

        Spy.prototype.getTargetPosition = function () {
            var target = this.getTargetElement();
            if (target) {
                return target.getBoundingClientRect();
            }
        };

        Spy.prototype.flushTargetCache = function () {
            if (this.targetId) {
                this.target = undefined;
            }
        };

        return {
            link: function ($scope, $element, $attr) {
                var href = $attr.ngHref || $attr.href;
                var targetId;

                if (href && href.indexOf('#') !== -1) {
                    targetId = href.replace(/.*(?=#[^\s]+$)/, '').substring(1);
                } else if ($attr.duScrollspy) {
                    targetId = $attr.duScrollspy;
                }
                if (!targetId) return;

                // Run this in the next execution loop so that the scroll context has a chance
                // to initialize
                $timeout(function () {
                    var spy = new Spy(targetId, $scope, $element, -($attr.offset ? parseInt($attr.offset, 10) : duScrollOffset));
                    spyAPI.addSpy(spy);

                    $scope.$on('$destroy', function () {
                        spyAPI.removeSpy(spy);
                    });
                    $scope.$on('$locationChangeSuccess', spy.flushTargetCache.bind(spy));
                    $rootScope.$on('$stateChangeSuccess', spy.flushTargetCache.bind(spy));
                }, 0, false);
            }
        };
    }]);

(function (window) {
    var createModule = function (angular) {
        var module = angular.module('FBAngular', []);

        module.factory('Fullscreen', ['$document', '$rootScope', function ($document, $rootScope) {
            var document = $document[0];

            // ensure ALLOW_KEYBOARD_INPUT is available and enabled
            var isKeyboardAvailbleOnFullScreen = (typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element) && Element.ALLOW_KEYBOARD_INPUT;

            var emitter = $rootScope.$new();

            // listen event on document instead of element to avoid firefox limitation
            // see https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode
            $document.on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function () {
                emitter.$emit('FBFullscreen.change', serviceInstance.isEnabled());
            });

            var serviceInstance = {
                $on: angular.bind(emitter, emitter.$on),
                all: function () {
                    serviceInstance.enable(document.documentElement);
                },
                enable: function (element) {
                    if (element.requestFullScreen) {
                        element.requestFullScreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.webkitRequestFullscreen) {
                        // Safari temporary fix
                        if (/Version\/[\d]{1,2}(\.[\d]{1,2}){1}(\.(\d){1,2}){0,1} Safari/.test(navigator.userAgent)) {
                            element.webkitRequestFullscreen();
                        } else {
                            element.webkitRequestFullscreen(isKeyboardAvailbleOnFullScreen);
                        }
                    } else if (element.msRequestFullscreen) {
                        element.msRequestFullscreen();
                    }
                },
                cancel: function () {
                    if (document.cancelFullScreen) {
                        document.cancelFullScreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                },
                isEnabled: function () {
                    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
                    return fullscreenElement ? true : false;
                },
                toggleAll: function () {
                    serviceInstance.isEnabled() ? serviceInstance.cancel() : serviceInstance.all();
                },
                isSupported: function () {
                    var docElm = document.documentElement;
                    var requestFullscreen = docElm.requestFullScreen || docElm.mozRequestFullScreen || docElm.webkitRequestFullscreen || docElm.msRequestFullscreen;
                    return requestFullscreen ? true : false;
                }
            };

            return serviceInstance;
        }]);

        module.directive('fullscreen', ['Fullscreen', function (Fullscreen) {
            return {
                link: function ($scope, $element, $attrs) {
                    // Watch for changes on scope if model is provided
                    if ($attrs.fullscreen) {
                        $scope.$watch($attrs.fullscreen, function (value) {
                            var isEnabled = Fullscreen.isEnabled();
                            if (value && !isEnabled) {
                                Fullscreen.enable($element[0]);
                                $element.addClass('isInFullScreen');
                            } else if (!value && isEnabled) {
                                Fullscreen.cancel();
                                $element.removeClass('isInFullScreen');
                            }
                        });

                        // Listen on the `FBFullscreen.change`
                        // the event will fire when anything changes the fullscreen mode
                        var removeFullscreenHandler = Fullscreen.$on('FBFullscreen.change', function (evt, isFullscreenEnabled) {
                            if (!isFullscreenEnabled) {
                                $scope.$evalAsync(function () {
                                    $scope.$eval($attrs.fullscreen + '= false');
                                    $element.removeClass('isInFullScreen');
                                });
                            }
                        });

                        $scope.$on('$destroy', function () {
                            removeFullscreenHandler();
                        });

                    } else {
                        if ($attrs.onlyWatchedProperty !== undefined) {
                            return;
                        }

                        $element.on('click', function (ev) {
                            Fullscreen.enable($element[0]);
                        });
                    }
                }
            };
        }]);
        return module;
    };

    if (typeof define === "function" && define.amd) {
        define("FBAngular", ['angular'], function (angular) {
            return createModule(angular);
        });
    } else {
        createModule(window.angular);
    }
})(window);

/**
 * @license ng-bs-daterangepicker v0.0.5
 * (c) 2013 Luis Farzati http://github.com/luisfarzati/ng-bs-daterangepicker
 * License: MIT
 */
!function (a) {
    "use strict";
    a.module("ngBootstrap", []).directive("input", ["$compile", "$parse", "$filter", function (b, c, d) {
        return{restrict: "E", require: "?ngModel", link: function (b, e, f, g) {
            function h(a) {
                return moment.isMoment(a) ? a.toDate() : a
            }

            function i(a) {
                return moment.isMoment(a) ? a : moment(a)
            }

            function j(a) {
                return d("date")(h(a), l.format.replace(/Y/g, "y").replace(/D/g, "d"))
            }

            function k(a) {
                return[j(a.startDate), j(a.endDate)].join(l.separator)
            }

            if ("daterange" === f.type && null !== g) {
                var l = {};
                l.format = f.format || "YYYY-MM-DD", l.separator = f.separator || " - ", l.minDate = f.minDate && moment(f.minDate), l.maxDate = f.maxDate && moment(f.maxDate), l.dateLimit = f.limit && moment.duration.apply(this, f.limit.split(" ").map(function (a, b) {
                    return 0 === b && parseInt(a, 10) || a
                })), l.ranges = f.ranges && c(f.ranges)(b), l.locale = f.locale && c(f.locale)(b), l.opens = f.opens || c(f.opens)(b), f.enabletimepicker && (l.timePicker = !0, a.extend(l, c(f.enabletimepicker)(b))), g.$render = function () {
                    g.$viewValue && g.$viewValue.startDate && e.val(k(g.$viewValue))
                }, b.$watch(function () {
                    return f.ngModel
                }, function (a, c) {
                    return b[a] && b[a].startDate ? void(c === a && (e.data("daterangepicker").startDate = i(b[a].startDate), e.data("daterangepicker").endDate = i(b[a].endDate), e.data("daterangepicker").updateView(), e.data("daterangepicker").updateCalendars(), e.data("daterangepicker").updateInputText())) : void g.$setViewValue({startDate: moment().startOf("day"), endDate: moment().startOf("day")})
                }), e.daterangepicker(l, function (c, d, e) {
                    var f = g.$viewValue;
                    a.equals(c, f.startDate) && a.equals(d, f.endDate) || b.$apply(function () {
                        g.$setViewValue({startDate: moment.isMoment(f.startDate) ? c : c.toDate(), endDate: moment.isMoment(f.endDate) ? d : d.toDate()}), g.$render()
                    })
                })
            }
        }}
    }])
}(angular);
//# sourceMappingURL=ng-bs-daterangepicker.min.js.map
angular.module('truncate', [])
    .filter('characters', function () {
        return function (input, chars, breakOnWord) {
            if (isNaN(chars)) return input;
            if (chars <= 0) return '';
            if (input && input.length > chars) {
                input = input.substring(0, chars);

                if (!breakOnWord) {
                    var lastspace = input.lastIndexOf(' ');
                    //get last space
                    if (lastspace !== -1) {
                        input = input.substr(0, lastspace);
                    }
                } else {
                    while (input.charAt(input.length - 1) === ' ') {
                        input = input.substr(0, input.length - 1);
                    }
                }
                return input + 'â€¦';
            }
            return input;
        };
    })
    .filter('splitcharacters', function () {
        return function (input, chars) {
            if (isNaN(chars)) return input;
            if (chars <= 0) return '';
            if (input && input.length > chars) {
                var prefix = input.substring(0, chars / 2);
                var postfix = input.substring(input.length - chars / 2, input.length);
                return prefix + '...' + postfix;
            }
            return input;
        };
    })
    .filter('words', function () {
        return function (input, words) {
            if (isNaN(words)) return input;
            if (words <= 0) return '';
            if (input) {
                var inputWords = input.split(/\s+/);
                if (inputWords.length > words) {
                    input = inputWords.slice(0, words).join(' ') + 'â€¦';
                }
            }
            return input;
        };
    });

angular.module("uiSwitch", []).directive("switch", function () {
    return{restrict: "AE", replace: !0, transclude: !0, template: function (n, e) {
        var s = "";
        return s += "<span", s += ' class="switch' + (e.class ? " " + e.class : "") + '"', s += e.ngModel ? ' ng-click="' + e.disabled + " ? " + e.ngModel + " : " + e.ngModel + "=!" + e.ngModel + (e.ngChange ? "; " + e.ngChange + '()"' : '"') : "", s += ' ng-class="{ checked:' + e.ngModel + ", disabled:" + e.disabled + ' }"', s += ">", s += "<small></small>", s += '<input type="checkbox"', s += e.id ? ' id="' + e.id + '"' : "", s += e.name ? ' name="' + e.name + '"' : "", s += e.ngModel ? ' ng-model="' + e.ngModel + '"' : "", s += ' style="display:none" />', s += '<span class="switch-text">', s += e.on ? '<span class="on">' + e.on + "</span>" : "", s += e.off ? '<span class="off">' + e.off + "</span>" : " ", s += "</span>"
    }}
});
/*!
 * angular-aside - v1.3.2
 * https://github.com/dbtek/angular-aside
 * 2015-11-17
 * Copyright (c) 2015 Ä°smail Demirbilek
 * License: MIT
 */
!function () {
    "use strict";
    angular.module("ngAside", ["ui.bootstrap.modal"])
}(), function () {
    "use strict";
    angular.module("ngAside").factory("$aside", ["$uibModal", function (a) {
        var b = this.defaults = {placement: "left"}, c = {open: function (c) {
            var d = angular.extend({}, b, c);
            -1 === ["left", "right", "bottom", "top"].indexOf(d.placement) && (d.placement = b.placement);
            var e = -1 === ["left", "right"].indexOf(d.placement) ? "vertical" : "horizontal";
            return d.windowClass = "ng-aside " + e + " " + d.placement + (d.windowClass ? " " + d.windowClass : ""), delete d.placement, a.open(d)
        }}, d = angular.extend({}, a, c);
        return d
    }])
}();
/* global angular */
(function (window, document) {
    'use strict';

    /*
     * AngularJS Toaster
     * Version: 0.4.18
     *
     * Copyright 2013-2015 Jiri Kavulak.
     * All Rights Reserved.
     * Use, reproduction, distribution, and modification of this code is subject to the terms and
     * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
     *
     * Author: Jiri Kavulak
     * Related to project of John Papa, Hans FjÃ¤llemark and Nguyá»…n Thiá»‡n HÃ¹ng (thienhung1989)
     */

    angular.module('toaster', []).constant(
        'toasterConfig', {
            'limit': 0,                   // limits max number of toasts
            'tap-to-dismiss': true,

            /* Options:
             - Boolean false/true
             'close-button': true
             - object if not a boolean that allows you to
             override showing the close button for each
             icon-class value
             'close-button': { 'toast-error': true, 'toast-info': false }
             */
            'close-button': false,
            'close-html': '<button class="toast-close-button" type="button">&times;</button>',
            'newest-on-top': true,
            //'fade-in': 1000,            // done in css
            //'on-fade-in': undefined,    // not implemented
            //'fade-out': 1000,           // done in css
            //'on-fade-out': undefined,   // not implemented
            //'extended-time-out': 1000,  // not implemented
            'time-out': 5000, // Set timeOut and extendedTimeout to 0 to make it sticky
            'icon-classes': {
                error: 'toast-error',
                info: 'toast-info',
                wait: 'toast-wait',
                success: 'toast-success',
                warning: 'toast-warning'
            },
            'body-output-type': '', // Options: '', 'trustedHtml', 'template', 'templateWithData', 'directive'
            'body-template': 'toasterBodyTmpl.html',
            'icon-class': 'toast-info',
            'position-class': 'toast-top-right', // Options (see CSS):
            // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-center',
            // 'toast-top-left', 'toast-top-center', 'toast-top-right',
            // 'toast-bottom-left', 'toast-bottom-center', 'toast-bottom-right',
            'title-class': 'toast-title',
            'message-class': 'toast-message',
            'prevent-duplicates': false,
            'mouseover-timer-stop': true // stop timeout on mouseover and restart timer on mouseout
        }
    ).service(
        'toaster', [
            '$rootScope', 'toasterConfig', function ($rootScope, toasterConfig) {
                this.pop = function (type, title, body, timeout, bodyOutputType, clickHandler, toasterId, showCloseButton, toastId, onHideCallback) {
                    if (angular.isObject(type)) {
                        var params = type; // Enable named parameters as pop argument
                        this.toast = {
                            type: params.type,
                            title: params.title,
                            body: params.body,
                            timeout: params.timeout,
                            bodyOutputType: params.bodyOutputType,
                            clickHandler: params.clickHandler,
                            showCloseButton: params.showCloseButton,
                            closeHtml: params.closeHtml,
                            uid: params.toastId,
                            onHideCallback: params.onHideCallback,
                            directiveData: params.directiveData
                        };
                        toastId = params.toastId;
                        toasterId = params.toasterId;
                    } else {
                        this.toast = {
                            type: type,
                            title: title,
                            body: body,
                            timeout: timeout,
                            bodyOutputType: bodyOutputType,
                            clickHandler: clickHandler,
                            showCloseButton: showCloseButton,
                            uid: toastId,
                            onHideCallback: onHideCallback
                        };
                    }
                    $rootScope.$emit('toaster-newToast', toasterId, toastId);
                };

                this.clear = function (toasterId, toastId) {
                    $rootScope.$emit('toaster-clearToasts', toasterId, toastId);
                };

                // Create one method per icon class, to allow to call toaster.info() and similar
                for (var type in toasterConfig['icon-classes']) {
                    this[type] = createTypeMethod(type);
                }

                function createTypeMethod(toasterType) {
                    return function (title, body, timeout, bodyOutputType, clickHandler, toasterId, showCloseButton, toastId, onHideCallback) {
                        if (angular.isString(title)) {
                            this.pop(
                                toasterType,
                                title,
                                body,
                                timeout,
                                bodyOutputType,
                                clickHandler,
                                toasterId,
                                showCloseButton,
                                toastId,
                                onHideCallback);
                        } else { // 'title' is actually an object with options
                            this.pop(angular.extend(title, { type: toasterType }));
                        }
                    };
                }
            }]
    ).factory(
        'toasterEventRegistry', [
            '$rootScope', function ($rootScope) {
                var deregisterNewToast = null, deregisterClearToasts = null, newToastEventSubscribers = [], clearToastsEventSubscribers = [], toasterFactory;

                toasterFactory = {
                    setup: function () {
                        if (!deregisterNewToast) {
                            deregisterNewToast = $rootScope.$on(
                                'toaster-newToast', function (event, toasterId, toastId) {
                                    for (var i = 0, len = newToastEventSubscribers.length; i < len; i++) {
                                        newToastEventSubscribers[i](event, toasterId, toastId);
                                    }
                                });
                        }

                        if (!deregisterClearToasts) {
                            deregisterClearToasts = $rootScope.$on(
                                'toaster-clearToasts', function (event, toasterId, toastId) {
                                    for (var i = 0, len = clearToastsEventSubscribers.length; i < len; i++) {
                                        clearToastsEventSubscribers[i](event, toasterId, toastId);
                                    }
                                });
                        }
                    },

                    subscribeToNewToastEvent: function (onNewToast) {
                        newToastEventSubscribers.push(onNewToast);
                    },
                    subscribeToClearToastsEvent: function (onClearToasts) {
                        clearToastsEventSubscribers.push(onClearToasts);
                    },
                    unsubscribeToNewToastEvent: function (onNewToast) {
                        var index = newToastEventSubscribers.indexOf(onNewToast);
                        if (index >= 0) {
                            newToastEventSubscribers.splice(index, 1);
                        }

                        if (newToastEventSubscribers.length === 0) {
                            deregisterNewToast();
                            deregisterNewToast = null;
                        }
                    },
                    unsubscribeToClearToastsEvent: function (onClearToasts) {
                        var index = clearToastsEventSubscribers.indexOf(onClearToasts);
                        if (index >= 0) {
                            clearToastsEventSubscribers.splice(index, 1);
                        }

                        if (clearToastsEventSubscribers.length === 0) {
                            deregisterClearToasts();
                            deregisterClearToasts = null;
                        }
                    }
                };
                return {
                    setup: toasterFactory.setup,
                    subscribeToNewToastEvent: toasterFactory.subscribeToNewToastEvent,
                    subscribeToClearToastsEvent: toasterFactory.subscribeToClearToastsEvent,
                    unsubscribeToNewToastEvent: toasterFactory.unsubscribeToNewToastEvent,
                    unsubscribeToClearToastsEvent: toasterFactory.unsubscribeToClearToastsEvent
                };
            }]
    )
        .directive('directiveTemplate', ['$compile', '$injector', function ($compile, $injector) {
            return {
                restrict: 'A',
                scope: {
                    directiveName: '@directiveName',
                    directiveData: '@directiveData'
                },
                replace: true,
                link: function (scope, elm, attrs) {
                    scope.$watch('directiveName', function (directiveName) {
                        if (angular.isUndefined(directiveName) || directiveName.length <= 0)
                            throw new Error('A valid directive name must be provided via the toast body argument when using bodyOutputType: directive');

                        var directiveExists = $injector.has(attrs.$normalize(directiveName) + 'Directive');

                        if (!directiveExists)
                            throw new Error(directiveName + ' could not be found.');

                        if (scope.directiveData)
                            scope.directiveData = angular.fromJson(scope.directiveData);

                        var template = $compile('<div ' + directiveName + '></div>')(scope);

                        elm.append(template);
                    });
                }
            }
        }])
        .directive(
        'toasterContainer', [
            '$parse', '$rootScope', '$interval', '$sce', 'toasterConfig', 'toaster', 'toasterEventRegistry',
            function ($parse, $rootScope, $interval, $sce, toasterConfig, toaster, toasterEventRegistry) {
                return {
                    replace: true,
                    restrict: 'EA',
                    scope: true, // creates an internal scope for this directive (one per directive instance)
                    link: function (scope, elm, attrs) {
                        var id = 0, mergedConfig;

                        // Merges configuration set in directive with default one
                        mergedConfig = angular.extend({}, toasterConfig, scope.$eval(attrs.toasterOptions));

                        scope.config = {
                            toasterId: mergedConfig['toaster-id'],
                            position: mergedConfig['position-class'],
                            title: mergedConfig['title-class'],
                            message: mergedConfig['message-class'],
                            tap: mergedConfig['tap-to-dismiss'],
                            closeButton: mergedConfig['close-button'],
                            closeHtml: mergedConfig['close-html'],
                            animation: mergedConfig['animation-class'],
                            mouseoverTimer: mergedConfig['mouseover-timer-stop']
                        };

                        scope.$on(
                            "$destroy", function () {
                                toasterEventRegistry.unsubscribeToNewToastEvent(scope._onNewToast);
                                toasterEventRegistry.unsubscribeToClearToastsEvent(scope._onClearToasts);
                            }
                        );

                        function setTimeout(toast, time) {
                            toast.timeoutPromise = $interval(
                                function () {
                                    scope.removeToast(toast.id);
                                }, time, 1
                            );
                        }

                        scope.configureTimer = function (toast) {
                            var timeout = angular.isNumber(toast.timeout) ? toast.timeout : mergedConfig['time-out'];
                            if (typeof timeout === "object") timeout = timeout[toast.type];
                            if (timeout > 0) {
                                setTimeout(toast, timeout);
                            }
                        };

                        function addToast(toast, toastId) {
                            toast.type = mergedConfig['icon-classes'][toast.type];
                            if (!toast.type) {
                                toast.type = mergedConfig['icon-class'];
                            }

                            if (mergedConfig['prevent-duplicates'] === true) {
                                // Prevent adding duplicate toasts if it's set
                                if (isUndefinedOrNull(toastId)) {
                                    if (scope.toasters.length > 0 && scope.toasters[scope.toasters.length - 1].body === toast.body) {
                                        return;
                                    }
                                } else {
                                    var i, len;
                                    for (i = 0, len = scope.toasters.length; i < len; i++) {
                                        if (scope.toasters[i].uid === toastId) {
                                            removeToast(i);
                                            // update loop
                                            i--;
                                            len = scope.toasters.length;
                                        }
                                    }
                                }
                            }

                            toast.id = ++id;
                            // Sure uid defined
                            if (!isUndefinedOrNull(toastId)) {
                                toast.uid = toastId;
                            }

                            // set the showCloseButton property on the toast so that
                            // each template can bind directly to the property to show/hide
                            // the close button
                            var closeButton = mergedConfig['close-button'];

                            // if toast.showCloseButton is a boolean value,
                            // it was specifically overriden in the pop arguments
                            if (typeof toast.showCloseButton === "boolean") {

                            } else if (typeof closeButton === "boolean") {
                                toast.showCloseButton = closeButton;
                            } else if (typeof closeButton === "object") {
                                var closeButtonForType = closeButton[toast.type];

                                if (typeof closeButtonForType !== "undefined" && closeButtonForType !== null) {
                                    toast.showCloseButton = closeButtonForType;
                                }
                            } else {
                                // if an option was not set, default to false.
                                toast.showCloseButton = false;
                            }

                            if (toast.showCloseButton) {
                                toast.closeHtml = $sce.trustAsHtml(toast.closeHtml || scope.config.closeHtml);
                            }

                            // Set the toast.bodyOutputType to the default if it isn't set
                            toast.bodyOutputType = toast.bodyOutputType || mergedConfig['body-output-type'];
                            switch (toast.bodyOutputType) {
                                case 'trustedHtml':
                                    toast.html = $sce.trustAsHtml(toast.body);
                                    break;
                                case 'template':
                                    toast.bodyTemplate = toast.body || mergedConfig['body-template'];
                                    break;
                                case 'templateWithData':
                                    var fcGet = $parse(toast.body || mergedConfig['body-template']);
                                    var templateWithData = fcGet(scope);
                                    toast.bodyTemplate = templateWithData.template;
                                    toast.data = templateWithData.data;
                                    break;
                                case 'directive':
                                    toast.html = toast.body;
                                    break;
                            }

                            scope.configureTimer(toast);

                            if (mergedConfig['newest-on-top'] === true) {
                                scope.toasters.unshift(toast);
                                if (mergedConfig['limit'] > 0 && scope.toasters.length > mergedConfig['limit']) {
                                    scope.toasters.pop();
                                }
                            } else {
                                scope.toasters.push(toast);
                                if (mergedConfig['limit'] > 0 && scope.toasters.length > mergedConfig['limit']) {
                                    scope.toasters.shift();
                                }
                            }
                        }

                        scope.removeToast = function (id) {
                            var i, len;
                            for (i = 0, len = scope.toasters.length; i < len; i++) {
                                if (scope.toasters[i].id === id) {
                                    removeToast(i);
                                    break;
                                }
                            }
                        };

                        function removeToast(toastIndex) {
                            var toast = scope.toasters[toastIndex];
                            if (toast) {
                                if (toast.timeoutPromise) {
                                    $interval.cancel(toast.timeoutPromise);
                                }
                                scope.toasters.splice(toastIndex, 1);

                                if (angular.isFunction(toast.onHideCallback)) {
                                    toast.onHideCallback();
                                }
                            }
                        }

                        function removeAllToasts(toastId) {
                            for (var i = scope.toasters.length - 1; i >= 0; i--) {
                                if (isUndefinedOrNull(toastId)) {
                                    removeToast(i);
                                } else {
                                    if (scope.toasters[i].uid == toastId) {
                                        removeToast(i);
                                    }
                                }
                            }
                        }

                        scope.toasters = [];

                        function isUndefinedOrNull(val) {
                            return angular.isUndefined(val) || val === null;
                        }

                        scope._onNewToast = function (event, toasterId, toastId) {
                            // Compatibility: if toaster has no toasterId defined, and if call to display
                            // hasn't either, then the request is for us

                            if ((isUndefinedOrNull(scope.config.toasterId) && isUndefinedOrNull(toasterId)) || (!isUndefinedOrNull(scope.config.toasterId) && !isUndefinedOrNull(toasterId) && scope.config.toasterId == toasterId)) {
                                addToast(toaster.toast, toastId);
                            }
                        };
                        scope._onClearToasts = function (event, toasterId, toastId) {
                            // Compatibility: if toaster has no toasterId defined, and if call to display
                            // hasn't either, then the request is for us
                            if (toasterId == '*' || (isUndefinedOrNull(scope.config.toasterId) && isUndefinedOrNull(toasterId)) || (!isUndefinedOrNull(scope.config.toasterId) && !isUndefinedOrNull(toasterId) && scope.config.toasterId == toasterId)) {
                                removeAllToasts(toastId);
                            }
                        };

                        toasterEventRegistry.setup();

                        toasterEventRegistry.subscribeToNewToastEvent(scope._onNewToast);
                        toasterEventRegistry.subscribeToClearToastsEvent(scope._onClearToasts);
                    },
                    controller: [
                        '$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                            // Called on mouseover
                            $scope.stopTimer = function (toast) {
                                if ($scope.config.mouseoverTimer === true) {
                                    if (toast.timeoutPromise) {
                                        $interval.cancel(toast.timeoutPromise);
                                        toast.timeoutPromise = null;
                                    }
                                }
                            };

                            // Called on mouseout
                            $scope.restartTimer = function (toast) {
                                if ($scope.config.mouseoverTimer === true) {
                                    if (!toast.timeoutPromise) {
                                        $scope.configureTimer(toast);
                                    }
                                } else if (toast.timeoutPromise === null) {
                                    $scope.removeToast(toast.id);
                                }
                            };

                            $scope.click = function (toast, isCloseButton) {
                                if ($scope.config.tap === true || (toast.showCloseButton === true && isCloseButton === true)) {
                                    var removeToast = true;
                                    if (toast.clickHandler) {
                                        if (angular.isFunction(toast.clickHandler)) {
                                            removeToast = toast.clickHandler(toast, isCloseButton);
                                        } else if (angular.isFunction($scope.$parent.$eval(toast.clickHandler))) {
                                            removeToast = $scope.$parent.$eval(toast.clickHandler)(toast, isCloseButton);
                                        } else {
                                            console.log("TOAST-NOTE: Your click handler is not inside a parent scope of toaster-container.");
                                        }
                                    }
                                    if (removeToast) {
                                        $scope.removeToast(toast.id);
                                    }
                                }
                            };
                        }],
                    template: '<div id="toast-container" ng-class="[config.position, config.animation]">' +
                        '<div ng-repeat="toaster in toasters" class="toast" ng-class="toaster.type" ng-click="click(toaster)" ng-mouseover="stopTimer(toaster)" ng-mouseout="restartTimer(toaster)">' +
                        '<div ng-if="toaster.showCloseButton" ng-click="click(toaster, true)" ng-bind-html="toaster.closeHtml"></div>' +
                        '<div ng-class="config.title">{{toaster.title}}</div>' +
                        '<div ng-class="config.message" ng-switch on="toaster.bodyOutputType">' +
                        '<div ng-switch-when="trustedHtml" ng-bind-html="toaster.html"></div>' +
                        '<div ng-switch-when="template"><div ng-include="toaster.bodyTemplate"></div></div>' +
                        '<div ng-switch-when="templateWithData"><div ng-include="toaster.bodyTemplate"></div></div>' +
                        '<div ng-switch-when="directive"><div directive-template directive-name="{{toaster.html}}" directive-data="{{toaster.directiveData}}"></div></div>' +
                        '<div ng-switch-default >{{toaster.body}}</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>'
                };
            }]
    );
})(window, document);
/**
 * vAccordion - AngularJS multi-level accordion component
 * @version v1.2.9
 * @link http://lukaszwatroba.github.io/v-accordion
 * @author Åukasz WÄ…troba <l@lukaszwatroba.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

!function (e) {
    "use strict";
    function n() {
        return{restrict: "E", transclude: !0, controller: t, scope: {control: "=?", allowMultiple: "=?multiple", expandCb: "&?onexpand", collapseCb: "&?oncollapse"}, link: function (n, t, i, a, o) {
            function l() {
                e.forEach(d, function (e) {
                    if (n.control[e])throw new Error("The `" + e + "` method can not be overwritten")
                })
            }

            o(n.$parent, function (e) {
                t.append(e)
            });
            var d = ["toggle", "expand", "collapse", "expandAll", "collapseAll"];
            if (e.isDefined(n.allowMultiple) || (n.allowMultiple = e.isDefined(i.multiple)), i.$set("role", "tablist"), n.allowMultiple && i.$set("aria-multiselectable", "true"), e.isDefined(n.control)) {
                l();
                var c = e.extend({}, n.internalControl, n.control);
                n.control = n.internalControl = c
            } else n.control = n.internalControl
        }}
    }

    function t(n) {
        var t = this, i = !1;
        n.panes = [], n.expandCb = e.isFunction(n.expandCb) ? n.expandCb : e.noop, n.collapseCb = e.isFunction(n.collapseCb) ? n.collapseCb : e.noop, t.hasExpandedPane = function () {
            for (var e = !1, t = 0, i = n.panes.length; i > t; t++) {
                var a = n.panes[t];
                if (a.isExpanded) {
                    e = !0;
                    break
                }
            }
            return e
        }, t.getPaneByIndex = function (t) {
            var i;
            return e.forEach(n.panes, function (n) {
                n.$parent && e.isDefined(n.$parent.$index) && n.$parent.$index === t && (i = n)
            }), i ? i : n.panes[t]
        }, t.getPaneIndex = function (t) {
            var i;
            return e.forEach(n.panes, function (n) {
                n.$parent && e.isDefined(n.$parent.$index) && n === t && (i = n.$parent.$index)
            }), e.isDefined(i) ? i : n.panes.indexOf(t)
        }, t.disable = function () {
            i = !0
        }, t.enable = function () {
            i = !1
        }, t.addPane = function (e) {
            if (!n.allowMultiple && t.hasExpandedPane() && e.isExpanded)throw new Error("The `multiple` attribute can't be found");
            n.panes.push(e), e.isExpanded && n.expandCb({index: t.getPaneIndex(e), target: e})
        }, t.focusNext = function () {
            for (var e = n.panes.length, t = 0; e > t; t++) {
                var i = n.panes[t];
                if (i.isFocused) {
                    var a = t + 1;
                    a > n.panes.length - 1 && (a = 0);
                    var o = n.panes[a];
                    o.paneElement.find("v-pane-header")[0].focus();
                    break
                }
            }
        }, t.focusPrevious = function () {
            for (var e = n.panes.length, t = 0; e > t; t++) {
                var i = n.panes[t];
                if (i.isFocused) {
                    var a = t - 1;
                    0 > a && (a = n.panes.length - 1);
                    var o = n.panes[a];
                    o.paneElement.find("v-pane-header")[0].focus();
                    break
                }
            }
        }, t.toggle = function (e) {
            !i && e && (n.allowMultiple || t.collapseAll(e), e.isExpanded = !e.isExpanded, e.isExpanded ? n.expandCb({index: t.getPaneIndex(e)}) : n.collapseCb({index: t.getPaneIndex(e)}))
        }, t.expand = function (e) {
            !i && e && (n.allowMultiple || t.collapseAll(e), e.isExpanded || (e.isExpanded = !0, n.expandCb({index: t.getPaneIndex(e)})))
        }, t.collapse = function (e) {
            !i && e && e.isExpanded && (e.isExpanded = !1, n.collapseCb({index: t.getPaneIndex(e)}))
        }, t.expandAll = function () {
            if (!i) {
                if (!n.allowMultiple)throw new Error("The `multiple` attribute can't be found");
                e.forEach(n.panes, function (e) {
                    t.expand(e)
                })
            }
        }, t.collapseAll = function (a) {
            i || e.forEach(n.panes, function (e) {
                e !== a && t.collapse(e)
            })
        }, n.internalControl = {toggle: function (e) {
            t.toggle(t.getPaneByIndex(e))
        }, expand: function (e) {
            t.expand(t.getPaneByIndex(e))
        }, collapse: function (e) {
            t.collapse(t.getPaneByIndex(e))
        }, expandAll: t.expandAll, collapseAll: t.collapseAll}
    }

    function i() {
        return{restrict: "E", require: "^vPane", transclude: !0, template: "<div ng-transclude></div>", scope: {}, link: function (e, n, t) {
            t.$set("role", "tabpanel")
        }}
    }

    function a() {
        return{restrict: "E", require: ["^vPane", "^vAccordion"], transclude: !0, template: "<div ng-transclude></div>", scope: {}, link: function (e, n, t, i) {
            t.$set("role", "tab");
            var a = i[0], o = i[1];
            n.on("click", function () {
                e.$apply(function () {
                    a.toggle()
                })
            }), n[0].onfocus = function () {
                a.focusPane()
            }, n[0].onblur = function () {
                a.blurPane()
            }, n.on("keydown", function (n) {
                32 === n.keyCode || 13 === n.keyCode ? (e.$apply(function () {
                    a.toggle()
                }), n.preventDefault()) : 39 === n.keyCode ? (e.$apply(function () {
                    o.focusNext()
                }), n.preventDefault()) : 37 === n.keyCode && (e.$apply(function () {
                    o.focusPrevious()
                }), n.preventDefault())
            })
        }}
    }

    function o(n, t, i) {
        return{restrict: "E", require: "^vAccordion", transclude: !0, controller: l, scope: {isExpanded: "=?expanded", isDisabled: "=?ngDisabled"}, link: function (a, o, l, d, c) {
            function r() {
                d.disable(), f[0].style.maxHeight = "0px", u.attr({"aria-selected": "true", tabindex: "0"}), a.$emit("vAccordion:onExpand"), n(function () {
                    t.addClass(o, p.expanded).then(function () {
                        d.enable(), f[0].style.maxHeight = "none", a.$emit("vAccordion:onExpandAnimationEnd")
                    }), setTimeout(function () {
                        f[0].style.maxHeight = x[0].offsetHeight + "px"
                    }, 0)
                }, 0)
            }

            function s() {
                d.disable(), f[0].style.maxHeight = x[0].offsetHeight + "px", u.attr({"aria-selected": "false", tabindex: "-1"}), a.$emit("vAccordion:onCollapse"), n(function () {
                    t.removeClass(o, p.expanded).then(function () {
                        d.enable(), a.$emit("vAccordion:onCollapseAnimationEnd")
                    }), setTimeout(function () {
                        f[0].style.maxHeight = "0px"
                    }, 0)
                }, 0)
            }

            c(a.$parent, function (e) {
                o.append(e)
            }), e.isDefined(a.isExpanded) || (a.isExpanded = e.isDefined(l.expanded)), e.isDefined(l.disabled) && (a.isDisabled = !0);
            var p = i.states, u = o.find("v-pane-header"), f = o.find("v-pane-content"), x = f.find("div");
            if (!u[0])throw new Error("The `v-pane-header` directive can't be found");
            if (!f[0])throw new Error("The `v-pane-content` directive can't be found");
            a.$evalAsync(function () {
                d.addPane(a)
            }), a.paneElement = o, a.paneContentElement = f, a.paneInnerElement = x, a.accordionCtrl = d, a.isExpanded ? (o.addClass(p.expanded), f[0].style.maxHeight = "none", u.attr({"aria-selected": "true", tabindex: "0"})) : (f[0].style.maxHeight = "0px", u.attr({"aria-selected": "false", tabindex: "-1"})), a.$watch("isExpanded", function (e, n) {
                return e === n ? !0 : (e ? r() : s(), void 0)
            })
        }}
    }

    function l(e) {
        var n = this;
        n.toggle = function () {
            e.isAnimating || e.isDisabled || e.accordionCtrl.toggle(e)
        }, n.focusPane = function () {
            e.isFocused = !0
        }, n.blurPane = function () {
            e.isFocused = !1
        }
    }

    e.module("vAccordion.config", []).constant("accordionConfig", {states: {expanded: "is-expanded"}}), e.module("vAccordion.directives", []), e.module("vAccordion", ["vAccordion.config", "vAccordion.directives"]), e.module("vAccordion.directives").directive("vAccordion", n), t.$inject = ["$scope"], e.module("vAccordion.directives").directive("vPaneContent", i), e.module("vAccordion.directives").directive("vPaneHeader", a), e.module("vAccordion.directives").directive("vPane", o), o.$inject = ["$timeout", "$animate", "accordionConfig"], l.$inject = ["$scope"]
}(angular);
/**
 * vButton - AngularJS pressable button with a busy indicator
 * @version v1.1.1
 * @link http://lukaszwatroba.github.io/v-button
 * @author Åukasz WÄ…troba <l@lukaszwatroba.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

!function (e) {
    "use strict";
    function t(t, s) {
        return{restrict: "A", scope: {isBusy: "=vBusy", busyLabel: "@vBusyLabel", busyText: "@vBusyText"}, compile: function (t, n) {
            var u = e.element(t.find("span"));
            return u[0] || (t.html("<span>" + t.html() + "</span>"), u = e.element(t.find("span"))), function (e, t) {
                var o = u.html(), i = e.busyLabel || s.busyLabel, l = e.busyText;
                e.$watch("isBusy", function (e) {
                    e ? (t.addClass(s.states.busy), u.html(i)) : (t.removeClass(s.states.busy), u.html(l || o))
                }), n.$observe("vBusyLabel", function (e) {
                    i = e
                }), n.$observe("vBusyText", function (e) {
                    l = e
                })
            }
        }}
    }

    function s(t, s) {
        return{restrict: "A", link: function (n, u) {
            function o(s, n) {
                var o, i, l = u[0].getBoundingClientRect(), r = u[0].querySelector("v-ripple");
                e.element(r).remove(), r = t[0].createElement("v-ripple"), r.style.height = r.style.width = Math.max(l.width, l.height) + "px", u.append(r), i = s - l.left - r.offsetWidth / 2 - d[0].scrollLeft, o = n - l.top - r.offsetHeight / 2 - d[0].scrollTop, r.style.left = i + "px", r.style.top = o + "px"
            }

            function i(e) {
                o(e.pageX, e.pageY), u.addClass(s.states.pressed), d.bind(a, l)
            }

            function l() {
                u.removeClass(s.states.pressed), d.unbind(a, l)
            }

            var r = !("undefined" == typeof t[0].documentElement.ontouchstart), c = r ? "touchstart" : "mousedown", a = r ? "touchend" : "mouseup", d = e.element(t[0].body);
            u.bind(c, i)
        }}
    }

    e.module("vButton.config", []).constant("buttonConfig", {busyLabel: "Loading", states: {busy: "is-busy", pressed: "is-pressed"}}), e.module("vButton.directives", []), e.module("vButton", ["vButton.config", "vButton.directives"]), e.module("vButton.directives").directive("vBusy", t), t.$inject = ["$document", "buttonConfig"], e.module("vButton.directives").directive("vPressable", s), s.$inject = ["$document", "buttonConfig"]
}(angular);
"use strict";
angular.module("oitozero.ngSweetAlert", []).factory("SweetAlert", ["$timeout", function ($timeout) {
    var swal = window.swal, self = {swal: function (arg1, arg2, arg3) {
        $timeout(function () {
            "function" == typeof arg2 ? swal(arg1, function (isConfirm) {
                $timeout(function () {
                    arg2(isConfirm)
                })
            }, arg3) : swal(arg1, arg2, arg3)
        }, 200)
    }, success: function (title, message) {
        $timeout(function () {
            swal(title, message, "success")
        }, 200)
    }, error: function (title, message) {
        $timeout(function () {
            swal(title, message, "error")
        }, 200)
    }, warning: function (title, message) {
        $timeout(function () {
            swal(title, message, "warning")
        }, 200)
    }, info: function (title, message) {
        $timeout(function () {
            swal(title, message, "info")
        }, 200)
    }};
    return self
}]);
"use strict";
angular.module("angular-notification-icons", ["angular-notification-icons.tpls"]), angular.module("angular-notification-icons.tpls", []), angular.module("angular-notification-icons.tpls").run(["$templateCache", function (n) {
    n.put("template/notification-icon.html", '<div class="angular-notifications-container">\n    <div class="angular-notifications-icon overlay" ng-show="notification.visible"><div ng-hide="notification.hideCount">{{notification.count}}</div></div>\n    <div class="notification-inner">\n        <ng-transclude></ng-transclude>\n    </div>\n</div>')
}]), function () {
    var n = function (n, i, t) {
        var a = this;
        a.visible = !1, a.wideThreshold = a.wideThreshold || 100, a.alwaysShow = a.alwaysShow || !1;
        var o, e = {appear: a.appearAnimation || a.animation || "grow", update: a.updateAnimation || a.animation || "grow", disappear: a.disappearAnimation};
        a.getElement = function (n) {
            return angular.element(n[0].querySelector(".angular-notifications-icon"))
        }, a.init = function (i) {
            a.$element = a.getElement(i), a.clearTrigger && i.on(a.clearTrigger, function () {
                a.count = 0, n.$apply()
            })
        };
        var l = function (n) {
            return n ? (o && i.cancel(o), o = i.addClass(a.$element, n), o.then(function () {
                return a.$element.removeClass(n), t.when(!0)
            }), o) : t.when(!1)
        }, r = function () {
            a.visible = !0, l(e.appear)
        }, c = function () {
            l(e.disappear).then(function (i) {
                a.visible = !1, i && n.$apply()
            })
        }, u = function () {
            l(e.update)
        };
        n.$watch(function () {
            return a.count
        }, function () {
            a.visible === !1 && (a.alwaysShow || a.count > 0) ? r() : !a.alwaysShow && a.visible === !0 && a.count <= 0 ? c() : u(), Math.abs(a.count) >= a.wideThreshold ? a.$element.addClass("wide-icon") : a.$element.removeClass("wide-icon")
        })
    }, i = function () {
        return{restrict: "EA", scope: {count: "=", hideCount: "@", alwaysShow: "@", animation: "@", appearAnimation: "@", disappearAnimation: "@", updateAnimation: "@", clearTrigger: "@", wideThreshold: "@"}, controller: "NotificationDirectiveController", controllerAs: "notification", bindToController: !0, transclude: !0, templateUrl: "template/notification-icon.html", link: function (n, i, t, a) {
            a.init(i)
        }}
    };
    angular.module("angular-notification-icons").controller("NotificationDirectiveController", ["$scope", "$animate", "$q", n]).directive("notificationIcon", i)
}();
/*! angular-ladda 0.3.1 */
/*!function (e, t) {
    "use strict";
    if ("function" == typeof define && define.amd)define(["angular", "ladda"], t); else {
        if ("undefined" == typeof module || "object" != typeof module.exports)return t(e.angular, e.Ladda);
        module.exports = t(require("angular"), require("ladda"))
    }
}(this, function (e, t) {
    "use strict";
    var a = "angular-ladda";
    return e.module(a, []).provider("ladda", function () {
        var t = {style: "zoom-in"};
        return{setOption: function (a) {
            e.extend(t, a)
        }, $get: function () {
            return t
        }}
    }).directive("ladda", ["ladda", function (a) {
        return{restrict: "A", priority: -1, link: function (n, d, r) {
            if (d.addClass("ladda-button"), e.isUndefined(d.attr("data-style")) && d.attr("data-style", a.style || "zoom-in"), !d[0].querySelector(".ladda-label")) {
                var i = document.createElement("span");
                i.className = "ladda-label", e.element(i).append(d.contents()), d.append(i)
            }
            var l = t.create(d[0]);
            n.$watch(r.ladda, function (t) {
                return t || e.isNumber(t) ? (l.isLoading() || l.start(), void(e.isNumber(t) && l.setProgress(t))) : (l.stop(), void(r.ngDisabled && d.attr("disabled", n.$eval(r.ngDisabled))))
            })
        }}
    }]), a
});*/
/**
 * @license angular-awesome-slider - v2.4.4
 * (c) 2013 Julien VALERY https://github.com/darul75/angular-awesome-slider
 * License: MIT
 **/
!function (a) {
    "use strict";
    a.module("angularAwesomeSlider", []).directive("slider", ["$compile", "$templateCache", "$timeout", "$window", "slider", function (b, c, d, e, f) {
        return{restrict: "AE", require: "?ngModel", scope: {options: "=", ngDisabled: "="}, priority: 1, link: function (g, h, i, j) {
            function k() {
// window resize listener
                a.element(e).bind("resize", function (a) {
                    g.slider.onresize()
                })
            }

            if (j) {
                if (!g.options)throw new Error('You must provide a value for "options" attribute.');
                a.injector();
// options as inline variable
                a.isString(g.options) && (g.options = a.toJson(g.options)), g.mainSliderClass = "jslider", g.mainSliderClass += g.options.skin ? " jslider_" + g.options.skin : " ", g.mainSliderClass += g.options.vertical ? " vertical " : "", g.mainSliderClass += g.options.css ? " sliderCSS" : "", g.mainSliderClass += g.options.className ? " " + g.options.className : "",
// handle limit labels visibility
                    g.options.limits = a.isDefined(g.options.limits) ? g.options.limits : !0,
// compile template
                    h.after(b(c.get("ng-slider/slider-bar.tmpl.html"))(g, function (a, b) {
                        b.tmplElt = a
                    }));
// init
                var l = !1, m = function (b) {
                    g.from = "" + g.options.from, g.to = "" + g.options.to, g.options.calculate && a.isFunction(g.options.calculate) && (g.from = g.options.calculate(g.from), g.to = g.options.calculate(g.to));
                    var c = {from: g.options.round ? parseFloat(g.options.from) : parseInt(g.options.from, 10), to: g.options.round ? parseFloat(g.options.to) : parseInt(g.options.to, 10), step: g.options.step, smooth: g.options.smooth, limits: g.options.limits, round: g.options.round || !1, value: b || j.$viewValue, dimension: "", scale: g.options.scale, modelLabels: g.options.modelLabels, vertical: g.options.vertical, css: g.options.css, className: g.options.className, realtime: g.options.realtime, cb: n, threshold: g.options.threshold, heterogeneity: g.options.heterogeneity};
                    c.calculate = g.options.calculate || void 0, c.onstatechange = g.options.onstatechange || void 0,
// slider
                        g.slider = g.slider ? g.slider.init(h, g.tmplElt, c) : p(h, g.tmplElt, c), l || k();
// scale
                    var d = g.tmplElt.find("div")[7];
                    a.element(d).html(g.slider.generateScale()), g.slider.drawScale(d), g.ngDisabled && o(g.ngDisabled), l = !0
                };
// model -> view
                j.$render = function () {
                    if ((j.$viewValue || 0 === j.$viewValue) && ("number" == typeof j.$viewValue && (j.$viewValue = "" + j.$viewValue), j.$viewValue.split(";")[1] ? g.mainSliderClass = g.mainSliderClass.replace(" jslider-single", "") : g.mainSliderClass += " jslider-single", g.slider)) {
                        var a = j.$viewValue.split(";");
                        g.slider.getPointers()[0].set(a[0], !0), a[1] && (g.slider.getPointers()[1].set(a[1], !0),
//if moving left to right with two pointers
//we need to "finish" moving the first
                            parseInt(a[1]) > parseInt(a[0]) && g.slider.getPointers()[0].set(a[0], !0))
                    }
                }, g.$on("slider-value-update", function (a, b) {
                    m(b.value), d(function () {
                        g.slider.redrawPointers()
                    })
                });
// view -> model
                var n = function (a, b) {
                    g.disabled || (g.$apply(function () {
                        j.$setViewValue(a)
                    }), g.options.callback && g.options.callback(a, b))
                };
// watch options
                g.$watch("options", function (a) {
                    d(function () {
                        m()
                    })
                }, g.watchOptions || !0);
// disabling
                var o = function (a) {
                    g.disabled = a, g.slider && (g.tmplElt.toggleClass("disabled"), g.slider.disable(a))
                };
                g.$watch("ngDisabled", function (a) {
                    o(a)
                }), g.limitValue = function (b) {
                    return g.options.modelLabels ? a.isFunction(g.options.modelLabels) ? g.options.modelLabels(b) : void 0 !== g.options.modelLabels[b] ? g.options.modelLabels[b] : b : b
                };
                var p = function (a, b, c) {
                    return new f(a, b, c)
                }
            }
        }}
    }]).config(function () {
    }).run(function () {
    })
}(angular), function (a) {
    "use strict";
    a.module("angularAwesomeSlider").constant("sliderConstants", {SLIDER: {settings: {from: 1, to: 40, step: 1, smooth: !0, limits: !1, round: !1, value: "3", dimension: "", vertical: !1, calculate: !1, onstatechange: !1, callback: !1, realtime: !1}, className: "jslider", selector: ".jslider-", css: {visible: {visibility: "visible"}, hidden: {visibility: "hidden"}}}, EVENTS: {}})
}(angular), function (a) {
    "use strict";
    a.module("angularAwesomeSlider").factory("sliderUtils", ["$window", function (a) {
        return{offset: function (a) {
// try {return elm.offset();} catch(e) {} 
            var b = a[0], c = 0, d = 0, e = document.documentElement || document.body, f = window.pageXOffset || e.scrollLeft, g = window.pageYOffset || e.scrollTop;
            return c = b.getBoundingClientRect().left + f, d = b.getBoundingClientRect().top + g, {left: c, top: d}
        }, browser: function () {
// TODO finish browser detection and this case
            var b = a.navigator.userAgent, c = {mozilla: /mozilla/i, chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};
            for (var d in c)if (c[d].test(b))return d;
            return"unknown"
        }}
    }])
}(angular), function (a) {
    "use strict";
    a.module("angularAwesomeSlider").factory("sliderDraggable", ["sliderUtils", function (b) {
        function c() {
            this._init.apply(this, arguments)
        }

        return c.prototype.oninit = function () {
        }, c.prototype.events = function () {
        }, c.prototype.onmousedown = function () {
            this.ptr.css({position: "absolute"})
        }, c.prototype.onmousemove = function (a, b, c) {
            this.ptr.css({left: b, top: c})
        }, c.prototype.onmouseup = function () {
        }, c.prototype.isDefault = {drag: !1, clicked: !1, toclick: !0, mouseup: !1}, c.prototype._init = function () {
            if (arguments.length > 0) {
                if (this.ptr = arguments[0], this.label = arguments[3], this.parent = arguments[2], !this.ptr)return;
//this.outer = $(".draggable-outer");
                this.is = {}, a.extend(this.is, this.isDefault);
                var c = b.offset(this.ptr);
                this.d = {left: c.left, top: c.top, width: this.ptr[0].clientWidth, height: this.ptr[0].clientHeight}, this.oninit.apply(this, arguments), this._events()
            }
        }, c.prototype._getPageCoords = function (a) {
            return a.targetTouches && a.targetTouches[0] ? {x: a.targetTouches[0].pageX, y: a.targetTouches[0].pageY} : {x: a.pageX, y: a.pageY}
        }, c.prototype._bindEvent = function (a, b, c) {
// PS need to bind to touch and non-touch events for devices which support both
            this.supportTouches_ && a[0].addEventListener(this.events_[b].touch, c, !1), a.bind(this.events_[b].nonTouch, c)
        }, c.prototype._events = function () {
            var b = this;
            this.supportTouches_ = "ontouchend"in document, this.events_ = {click: {touch: "touchstart", nonTouch: "click"}, down: {touch: "touchstart", nonTouch: "mousedown"}, move: {touch: "touchmove", nonTouch: "mousemove"}, up: {touch: "touchend", nonTouch: "mouseup"}, mousedown: {touch: "mousedown", nonTouch: "mousedown"}};
            var c = a.element(window.document);
            this._bindEvent(c, "move", function (a) {
                b.is.drag && (a.stopPropagation(), a.preventDefault(), b.parent.disabled || b._mousemove(a))
            }), this._bindEvent(c, "down", function (a) {
                b.is.drag && (a.stopPropagation(), a.preventDefault())
            }), this._bindEvent(c, "up", function (a) {
                b._mouseup(a)
            }), this._bindEvent(this.label, "down", function (a) {
                return b._mousedown(a), !1
            }), this._bindEvent(this.label, "up", function (a) {
                b._mouseup(a)
            }), this._bindEvent(this.ptr, "down", function (a) {
                return b._mousedown(a), !1
            }), this._bindEvent(this.ptr, "up", function (a) {
                b._mouseup(a)
            }),
// TODO see if needed
                this.events()
        }, c.prototype._mousedown = function (b) {
            this.is.drag = !0, this.is.clicked = !1, this.is.mouseup = !1;
            var c = this._getPageCoords(b);
            this.cx = c.x - this.ptr[0].offsetLeft, this.cy = c.y - this.ptr[0].offsetTop, a.extend(this.d, {left: c.x, top: c.y, width: this.ptr[0].clientWidth, height: this.ptr[0].clientHeight}), this.outer && this.outer.get(0) && this.outer.css({height: Math.max(this.outer.height(), $(document.body).height()), overflow: "hidden"}), this.onmousedown(b)
        }, c.prototype._mousemove = function (a) {
            this.is.toclick = !1;
            var b = this._getPageCoords(a);
            this.onmousemove(a, b.x - this.cx, b.y - this.cy)
        }, c.prototype._mouseup = function (a) {
            if (this.is.drag) {
                this.is.drag = !1;
                var c = b.browser();
                this.outer && this.outer.get(0) && ("mozilla" === c ? this.outer.css({overflow: "hidden"}) : this.outer.css({overflow: "visible"}),
// TODO finish browser detection and this case, remove following line
                    this.outer.css({height: "auto"})), this.onmouseup(a)
            }
        }, c
    }])
}(angular), function (a) {
    "use strict";
    a.module("angularAwesomeSlider").factory("sliderPointer", ["sliderDraggable", "sliderUtils", function (b, c) {
        function d() {
            b.apply(this, arguments)
        }

        return d.prototype = new b, d.prototype.oninit = function (b, c, d, e, f) {
            this.uid = c, this.parent = f, this.value = {}, this.vertical = d, this.settings = a.copy(f.settings), this.threshold = this.settings.threshold
        }, d.prototype.onmousedown = function (a) {
            var b = c.offset(this.parent.domNode), d = {left: b.left, top: b.top, width: this.parent.domNode[0].clientWidth, height: this.parent.domNode[0].clientHeight};
            this._parent = {offset: d, width: d.width, height: d.height}, this.ptr.addClass("jslider-pointer-hover")
        }, d.prototype.onmousemove = function (b, c, d) {
            var e = this._getPageCoords(b);
            this._set(this.vertical ? this.calc(e.y) : this.calc(e.x)), this.settings.realtime && this.settings.cb && a.isFunction(this.settings.cb) && this.settings.cb.call(this.parent, this.parent.getValue(), !this.is.drag)
        }, d.prototype.onmouseup = function (b) {
            this.settings.cb && a.isFunction(this.settings.cb) && this.settings.cb.call(this.parent, this.parent.getValue(), !this.is.drag), this.is.drag || this.ptr.removeClass("jslider-pointer-hover")
        }, d.prototype.limits = function (a) {
            return this.parent.limits(a, this)
        }, d.prototype.calc = function (a) {
            return this.vertical ? this.limits(100 * (a - this._parent.offset.top) / this._parent.height) : this.limits(100 * (a - this._parent.offset.left) / this._parent.width)
        }, d.prototype.set = function (a, b) {
            this.value.origin = this.parent.round(a), this._set(this.parent.valueToPrc(a, this), b)
        }, d.prototype._set = function (a, b) {
            this.allowed = !0;
            var c = this.value.origin, d = this.value.prc;
// check threshold
            if (this.value.origin = this.parent.prcToValue(a), this.value.prc = a, this.threshold && this.parent.o.pointers[1]) {
                var e = this.value.origin, f = this.parent.o.pointers[0 === this.uid ? 1 : 0].value.origin;
                this.allowed = Math.abs(f - e) >= this.threshold, this.allowed || void 0 === c || void 0 === d || (this.value.origin = c, this.value.prc = d)
            }
            this.vertical ? this.ptr.css({top: this.value.prc + "%", marginTop: -5}) : this.ptr.css({left: this.value.prc + "%"}), this.parent.redraw(this)
        }, d
    }])
}(angular), function (a) {
    "use strict";
    a.module("angularAwesomeSlider").factory("slider", ["sliderPointer", "sliderConstants", "sliderUtils", function (b, c, d) {
        function e() {
            return this.init.apply(this, arguments)
        }

        return e.prototype.init = function (b, d, e) {
            return this.settings = e, this.inputNode = b, this.inputNode.addClass("ng-hide"), this.settings.interval = this.settings.to - this.settings.from, this.settings.calculate && a.isFunction(this.settings.calculate) && (this.nice = this.settings.calculate), this.settings.onstatechange && a.isFunction(this.settings.onstatechange) && (this.onstatechange = this.settings.onstatechange), this.css = c.SLIDER.css, this.is = {init: !1}, this.o = {}, this.initValue = {}, this.isAsc = e.from < e.to, this.create(d), this
        }, e.prototype.create = function (c) {
// set skin class
//   if( this.settings.skin && this.settings.skin.length > 0 )
//     this.setSkin( this.settings.skin );
            var e = this;
            this.domNode = c;
            var f = this.domNode.find("div"), g = this.domNode.find("i"), h = a.element, i = a.extend, j = a.forEach, k = h(f[1]), l = h(f[2]), m = h(f[5]), n = h(f[6]), o = h(g[0]), p = h(g[1]), q = h(g[2]), r = h(g[3]), s = h(g[4]), t = h(g[5]), u = h(g[6]), v = [m, n], w = [k, l], x = d.offset(this.domNode), y = {left: x.left, top: x.top, width: this.domNode[0].clientWidth, height: this.domNode[0].clientHeight}, z = e.settings.value.split(";");
            this.sizes = {domWidth: this.domNode[0].clientWidth, domHeight: this.domNode[0].clientHeight, domOffset: y},
// find some objects
                i(this.o, {pointers: {}, labels: {0: {o: m}, 1: {o: n}}, limits: {0: a.element(f[3]), 1: a.element(f[4])}, indicators: {0: r, 1: s, 2: t, 3: u}}), i(this.o.labels[0], {value: this.o.labels[0].o.find("span")}), i(this.o.labels[1], {value: this.o.labels[1].o.find("span")}),
// single pointer
                this.settings.single = !e.settings.value.split(";")[1], this.settings.single ? q.addClass("ng-hide") : q.removeClass("ng-hide"), j(w, function (c, f) {
                e.settings = a.copy(e.settings);
                var g, h, i, j, k, l = z[f];
                l && (e.o.pointers[f] = new b(c, f, e.settings.vertical, v[f], e), g = z[f - 1], h = g ? parseInt(g, 10) : void 0, l = e.settings.round ? parseFloat(l) : parseInt(l, 10), (g && e.isAsc ? h > l : l > h) && (l = g), i = e.isAsc ? l > e.settings.to : l < e.settings.to, j = i ? e.settings.to : l, e.o.pointers[f].set(j, !0), k = d.offset(e.o.pointers[f].ptr), e.o.pointers[f].d = {left: k.left, top: k.top})
            }), e.domNode.bind("mousedown", e.clickHandler.apply(e)), this.o.value = h(this.domNode.find("i")[2]), this.is.init = !0,
// CSS SKIN
                this.settings.css && (o.css(this.settings.css.background ? this.settings.css.background : {}), p.css(this.settings.css.background ? this.settings.css.background : {}), this.o.pointers[1] || (r.css(this.settings.css.before ? this.settings.css.before : {}), u.css(this.settings.css.after ? this.settings.css.after : {})), s.css(this.settings.css["default"] ? this.settings.css["default"] : {}), t.css(this.settings.css["default"] ? this.settings.css["default"] : {}), q.css(this.settings.css.range ? this.settings.css.range : {}), k.css(this.settings.css.pointer ? this.settings.css.pointer : {}), l.css(this.settings.css.pointer ? this.settings.css.pointer : {})), this.redrawPointers()
        }, e.prototype.clickHandler = function () {
            var b = this, c = function (a) {
                var c = b.o.pointers[0].ptr, e = b.o.pointers[1].ptr, f = d.offset(c), g = d.offset(e);
                b.o.pointers[0].d = {left: f.left, top: f.top, width: c[0].clientWidth, height: c[0].clientHeight}, b.o.pointers[1].d = {left: g.left, top: g.top, width: e[0].clientWidth, height: e[0].clientHeight}
            };
            return function (e) {
                if (!b.disabled) {
                    var f = b.settings.vertical, g = 0, h = d.offset(b.domNode), i = b.o.pointers[0], j = b.o.pointers[1] ? b.o.pointers[1] : null, k = e.originalEvent ? e.originalEvent : e, l = f ? k.pageY : k.pageX, m = f ? "top" : "left", n = {left: h.left, top: h.top, width: b.domNode[0].clientWidth, height: b.domNode[0].clientHeight}, o = b.o.pointers[g];
                    if (j) {
                        j.d.width || c();
                        var p = d.offset(i.ptr)[m], q = d.offset(j.ptr)[m], r = Math.abs((q - p) / 2), s = l >= q || l >= q - r;
                        s && (o = j)
                    }
                    o._parent = {offset: n, width: n.width, height: n.height};
                    var t = i._getPageCoords(e);
                    return o.cx = t.x - o.d.left, o.cy = t.y - o.d.top, o.onmousemove(e, t.x, t.y), o.onmouseup(), a.extend(o.d, {left: t.x, top: t.y}), b.redraw(o), !1
                }
            }
        }, e.prototype.disable = function (a) {
            this.disabled = a
        }, e.prototype.nice = function (a) {
            return a
        }, e.prototype.onstatechange = function () {
        }, e.prototype.limits = function (a, b) {
// smooth
            if (!this.settings.smooth) {
                var c = 100 * this.settings.step / this.settings.interval;
                a = Math.round(a / c) * c
            }
            if (b) {
                var d = this.o.pointers[1 - b.uid];
                d && b.uid && a < d.value.prc && (a = d.value.prc), d && !b.uid && a > d.value.prc && (a = d.value.prc)
            }
// base limit
            return 0 > a && (a = 0), a > 100 && (a = 100), Math.round(10 * a) / 10
        }, e.prototype.getPointers = function () {
            return this.o.pointers
        }, e.prototype.generateScale = function () {
            if (this.settings.scale && this.settings.scale.length > 0) {
                for (var
// FIX Big Scale Failure #34
// var prc = Math.round((100/(s.length-1))*10)/10;
                         b, c, d = "", e = this.settings.scale, f = {}, g = this.settings.vertical ? "top" : "left", h = 0; h < e.length; h++)a.isDefined(e[h].val) || (b = (100 / (e.length - 1)).toFixed(2), d += '<span style="' + g + ": " + h * b + '%">' + ("|" != e[h] ? "<ins>" + e[h] + "</ins>" : "") + "</span>"), e[h].val <= this.settings.to && e[h].val >= this.settings.from && !f[e[h].val] && (f[e[h].val] = !0, b = this.valueToPrc(e[h].val), c = e[h].label ? e[h].label : e[h].val, d += '<span style="' + g + ": " + b + '%"><ins>' + c + "</ins></span>");
                return d
            }
            return""
        }, e.prototype.onresize = function () {
            this.sizes = {domWidth: this.domNode[0].clientWidth, domHeight: this.domNode[0].clientHeight, domOffset: {left: this.domNode[0].offsetLeft, top: this.domNode[0].offsetTop, width: this.domNode[0].clientWidth, height: this.domNode[0].clientHeight}}, this.redrawPointers()
        }, e.prototype.update = function () {
            this.onresize(), this.drawScale()
        }, e.prototype.drawScale = function (b) {
            a.forEach(a.element(b).find("ins"), function (a, b) {
                a.style.marginLeft = -a.clientWidth / 2
            })
        }, e.prototype.redrawPointers = function () {
            a.forEach(this.o.pointers, function (a) {
                this.redraw(a)
            }, this)
        }, e.prototype.redraw = function (b) {
            if (!this.is.init)
// this.settings.single
                return this.o.pointers[0] && !this.o.pointers[1] ? (this.originValue = this.o.pointers[0].value.prc, this.o.indicators[0].css(this.settings.vertical ? {top: 0, height: this.o.pointers[0].value.prc + "%"} : {left: 0, width: this.o.pointers[0].value.prc + "%"}), this.o.indicators[1].css(this.settings.vertical ? {top: this.o.pointers[0].value.prc + "%"} : {left: this.o.pointers[0].value.prc + "%"}), this.o.indicators[3].css(this.settings.vertical ? {top: this.o.pointers[0].value.prc + "%"} : {left: this.o.pointers[0].value.prc + "%"})) : (this.o.indicators[2].css(this.settings.vertical ? {top: this.o.pointers[1].value.prc + "%"} : {left: this.o.pointers[1].value.prc + "%"}), this.o.indicators[0].css(this.settings.vertical ? {top: 0, height: "0"} : {left: 0, width: "0"}), this.o.indicators[3].css(this.settings.vertical ? {top: "0", height: "0"} : {left: "0", width: "0"})), !1;
            this.setValue();
            var c, d;
// redraw range line
            this.o.pointers[0] && this.o.pointers[1] && (c = this.settings.vertical ? {top: this.o.pointers[0].value.prc + "%", height: this.o.pointers[1].value.prc - this.o.pointers[0].value.prc + "%"} : {left: this.o.pointers[0].value.prc + "%", width: this.o.pointers[1].value.prc - this.o.pointers[0].value.prc + "%"}, this.o.value.css(c), this.o.pointers[0].value.prc === this.o.pointers[1].value.prc && this.o.pointers[1].ptr.css("z-index", 0 === this.o.pointers[0].value.prc ? "3" : "1")), this.o.pointers[0] && !this.o.pointers[1] && (d = this.o.pointers[0].value.prc - this.originValue, d >= 0 ? this.o.indicators[3].css(this.settings.vertical ? {height: d + "%"} : {width: d + "%"}) : this.o.indicators[3].css(this.settings.vertical ? {height: 0} : {width: 0}), this.o.pointers[0].value.prc < this.originValue ? this.o.indicators[0].css(this.settings.vertical ? {height: this.o.pointers[0].value.prc + "%"} : {width: this.o.pointers[0].value.prc + "%"}) : this.o.indicators[0].css(this.settings.vertical ? {height: this.originValue + "%"} : {width: this.originValue + "%"}));
            var e = this.nice(b.value.origin);
            this.settings.modelLabels && (e = a.isFunction(this.settings.modelLabels) ? this.settings.modelLabels(e) : void 0 !== this.settings.modelLabels[e] ? this.settings.modelLabels[e] : e), this.o.labels[b.uid].value.html(e),
// redraw position of labels
                this.redrawLabels(b)
        }, e.prototype.redrawLabels = function (a) {
            function b(a, b, d) {
                b.margin = -b.label / 2;
                var e = c.settings.vertical ? c.sizes.domHeight : c.sizes.domWidth;
                if (c.sizes.domWidth) {
// left limit
                    var f = b.border + b.margin;
                    0 > f && (b.margin -= f),
// right limit
                            c.sizes.domWidth > 0 && b.border + b.label / 2 > e ? (b.margin = 0, b.right = !0) : b.right = !1
                }
                return c.settings.vertical ? a.o.css({top: d + "%", marginLeft: "20px", marginTop: b.margin, bottom: "auto"}) : a.o.css({left: d + "%", marginLeft: b.margin + "px", right: "auto"}), b.right && c.sizes.domWidth > 0 && (c.settings.vertical ? a.o.css({top: "auto", bottom: 0}) : a.o.css({left: "auto", right: 0})), b
            }

            var c = this, d = this.o.labels[a.uid], e = a.value.prc,
// case hidden
                f = 0 === d.o[0].offsetWidth ? 7 * d.o[0].textContent.length : d.o[0].offsetWidth;
            this.sizes.domWidth = this.domNode[0].clientWidth, this.sizes.domHeight = this.domNode[0].clientHeight;
            var g, h, i = {label: c.settings.vertical ? d.o[0].offsetHeight : f, right: !1, border: e * (c.settings.vertical ? this.sizes.domHeight : this.sizes.domWidth) / 100}, j = 0 === a.uid ? 1 : 0;
            if (!this.settings.single && !this.settings.vertical) {
// glue if near;
                g = this.o.labels[j], h = this.o.pointers[j];
                var k = this.o.labels[0], l = this.o.labels[1], m = this.o.pointers[0], n = this.o.pointers[1], o = n.ptr[0].offsetLeft - m.ptr[0].offsetLeft, p = this.nice(h.value.origin);
                if (k.o.css(this.css.visible), l.o.css(this.css.visible), p = this.getLabelValue(p), o + 10 < k.o[0].offsetWidth + l.o[0].offsetWidth) {
                    if (g.o.css(this.css.hidden), g.value.html(p), e = (h.value.prc - e) / 2 + e, h.value.prc != a.value.prc) {
                        p = this.nice(this.o.pointers[0].value.origin);
                        var q = this.nice(this.o.pointers[1].value.origin);
                        p = this.getLabelValue(p), q = this.getLabelValue(q), d.value.html(p + "&nbsp;&ndash;&nbsp;" + q), i.label = d.o[0].offsetWidth, i.border = e * r / 100
                    }
                } else g.value.html(p), g.o.css(this.css.visible)
            }
            i = b(d, i, e);
            var r = c.settings.vertical ? c.sizes.domHeight : c.sizes.domWidth;
            /* draw second label */
            if (g) {
// case hidden
                var s = 0 === d.o[0].offsetWidth ? d.o[0].textContent.length / 2 * 7 : d.o[0].offsetWidth, t = {label: c.settings.vertical ? g.o[0].offsetHeight : s, right: !1, border: h.value.prc * this.sizes.domWidth / 100};
                i = b(g, t, h.value.prc)
            }
            this.redrawLimits()
        }, e.prototype.redrawLimits = function () {
            if (this.settings.limits) {
                var b = [!0, !0], c = 0;
                for (var d in this.o.pointers)if (!this.settings.single || 0 === d) {
                    var e = this.o.pointers[d], f = this.o.labels[e.uid], g = f.o[0].offsetLeft - this.sizes.domOffset.left, h = this.o.limits[0];
                    g < h[0].clientWidth && (b[0] = !1), h = this.o.limits[1], g + f.o[0].clientWidth > this.sizes.domWidth - h[0].clientWidth && (b[1] = !1)
                }
                for (; c < b.length; c++)b[c] ?// TODO animate
                    a.element(this.o.limits[c]).addClass("animate-show") : a.element(this.o.limits[c]).addClass("animate-hidde")
            }
        }, e.prototype.setValue = function () {
            var a = this.getValue();
            this.inputNode.attr("value", a), this.onstatechange.call(this, a, this.inputNode)
        }, e.prototype.getValue = function () {
            if (!this.is.init)return!1;
            var b = this, c = "";
            return a.forEach(this.o.pointers, function (a, d) {
                void 0 === a.value.prc || isNaN(a.value.prc) || (c += (d > 0 ? ";" : "") + b.prcToValue(a.value.prc))
            }), c
        }, e.prototype.getLabelValue = function (b) {
            return this.settings.modelLabels ? a.isFunction(this.settings.modelLabels) ? this.settings.modelLabels(b) : void 0 !== this.settings.modelLabels[b] ? this.settings.modelLabels[b] : b : b
        }, e.prototype.getPrcValue = function () {
            if (!this.is.init)return!1;
            var a = "";
// TODO remove jquery and see if % value is nice feature
            /*$.each(this.o.pointers, function(i){
             if(this.value.prc !== undefined && !isNaN(this.value.prc)) value += (i > 0 ? ";" : "") + this.value.prc;
             });*/
            return a
        }, e.prototype.prcToValue = function (a) {
            var b;
            if (this.settings.heterogeneity && this.settings.heterogeneity.length > 0)for (var c = this.settings.heterogeneity, d = 0, e = this.settings.round ? parseFloat(this.settings.from) : parseInt(this.settings.from, 10), f = this.settings.round ? parseFloat(this.settings.to) : parseInt(this.settings.to, 10), g = 0; g <= c.length; g++) {
                var h;
                h = c[g] ? c[g].split("/") : [100, f];
                var i = this.settings.round ? parseFloat(h[0]) : parseInt(h[0], 10), j = this.settings.round ? parseFloat(h[1]) : parseInt(h[1], 10);
                a >= d && i >= a && (b = e + (a - d) * (j - e) / (i - d)), d = i, e = j
            } else b = this.settings.from + a * this.settings.interval / 100;
            return this.round(b)
        }, e.prototype.valueToPrc = function (a, b) {
            var c, d = this.settings.round ? parseFloat(this.settings.from) : parseInt(this.settings.from, 10);
            if (this.settings.heterogeneity && this.settings.heterogeneity.length > 0)for (var e = this.settings.heterogeneity, f = 0, g = 0; g <= e.length; g++) {
                var h;
                h = e[g] ? e[g].split("/") : [100, this.settings.to];
                var i = this.settings.round ? parseFloat(h[0]) : parseInt(h[0], 10), j = this.settings.round ? parseFloat(h[1]) : parseInt(h[1], 10);
                a >= d && j >= a && (c = b ? b.limits(f + (a - d) * (i - f) / (j - d)) : this.limits(f + (a - d) * (i - f) / (j - d))), f = i, d = j
            } else c = b ? b.limits(100 * (a - d) / this.settings.interval) : this.limits(100 * (a - d) / this.settings.interval);
            return c
        }, e.prototype.round = function (a) {
            return a = Math.round(a / this.settings.step) * this.settings.step, a = this.settings.round ? Math.round(a * Math.pow(10, this.settings.round)) / Math.pow(10, this.settings.round) : Math.round(a)
        }, e
    }])
}(angular), function (a, b) {
    "use strict";
    a.module("angularAwesomeSlider").run(["$templateCache", function (a) {
        a.put("ng-slider/slider-bar.tmpl.html", '<span ng-class="mainSliderClass" id="{{sliderTmplId}}"><table><tr><td><div class="jslider-bg"><i class="left"></i><i class="right"></i><i class="range"></i><i class="before"></i><i class="default"></i><i class="default"></i><i class="after"></i></div><div class="jslider-pointer"></div><div class="jslider-pointer jslider-pointer-to"></div><div class="jslider-label" ng-show="options.limits"><span ng-bind="limitValue(options.from)"></span>{{options.dimension}}</div><div class="jslider-label jslider-label-to" ng-show="options.limits"><span ng-bind="limitValue(options.to)"></span>{{options.dimension}}</div><div class="jslider-value"><span></span>{{options.dimension}}</div><div class="jslider-value jslider-value-to"><span></span>{{options.dimension}}</div><div class="jslider-scale" id="{{sliderScaleDivTmplId}}"></div></td></tr></table></span>')
    }])
}(window.angular);
/*!
 * angular-slick-carousel
 * DevMark <hc.devmark@gmail.com>
 * https://github.com/devmark/angular-slick-carousel
 * Version: 3.1.4 - 2015-12-26T03:01:55.410Z
 * License: MIT
 */
"use strict";
angular.module("slickCarousel", []).constant("slickCarouselConfig", {method: {}, event: {}}).directive("slick", ["$timeout", "slickCarouselConfig", function (e, n) {
    var i, t;
    return i = ["slickGoTo", "slickNext", "slickPrev", "slickPause", "slickPlay", "slickAdd", "slickRemove", "slickFilter", "slickUnfilter", "unslick"], t = ["afterChange", "beforeChange", "breakpoint", "destroy", "edge", "init", "reInit", "setPosition", "swipe"], {scope: {settings: "=", enabled: "@", accessibility: "@", adaptiveHeight: "@", autoplay: "@", autoplaySpeed: "@", arrows: "@", asNavFor: "@", appendArrows: "@", prevArrow: "@", nextArrow: "@", centerMode: "@", centerPadding: "@", cssEase: "@", customPaging: "&", dots: "@", draggable: "@", fade: "@", focusOnSelect: "@", easing: "@", edgeFriction: "@", infinite: "@", initialSlide: "@", lazyLoad: "@", mobileFirst: "@", pauseOnHover: "@", pauseOnDotsHover: "@", respondTo: "@", responsive: "=?", rows: "@", slide: "@", slidesPerRow: "@", slidesToShow: "@", slidesToScroll: "@", speed: "@", swipe: "@", swipeToSlide: "@", touchMove: "@", touchThreshold: "@", useCSS: "@", variableWidth: "@", vertical: "@", verticalSwiping: "@", rtl: "@"}, restrict: "AE", link: function (t, o, s) {
        angular.element(o).css("display", "none");
        var r, a, l, d, u, c;
        return a = function () {
            r = angular.extend(angular.copy(n), {enabled: "false" !== t.enabled, accessibility: "false" !== t.accessibility, adaptiveHeight: "true" === t.adaptiveHeight, autoplay: "true" === t.autoplay, autoplaySpeed: null != t.autoplaySpeed ? parseInt(t.autoplaySpeed, 10) : 3e3, arrows: "false" !== t.arrows, asNavFor: t.asNavFor ? t.asNavFor : void 0, appendArrows: angular.element(t.appendArrows ? t.appendArrows : o), prevArrow: t.prevArrow ? angular.element(t.prevArrow) : void 0, nextArrow: t.nextArrow ? angular.element(t.nextArrow) : void 0, centerMode: "true" === t.centerMode, centerPadding: t.centerPadding || "50px", cssEase: t.cssEase || "ease", customPaging: s.customPaging ? function (e, n) {
                return t.customPaging({slick: e, index: n})
            } : void 0, dots: "true" === t.dots, draggable: "false" !== t.draggable, fade: "true" === t.fade, focusOnSelect: "true" === t.focusOnSelect, easing: t.easing || "linear", edgeFriction: t.edgeFriction || .15, infinite: "false" !== t.infinite, initialSlide: parseInt(t.initialSlide) || 0, lazyLoad: t.lazyLoad || "ondemand", mobileFirst: "true" === t.mobileFirst, pauseOnHover: "false" !== t.pauseOnHover, pauseOnDotsHover: "true" === t.pauseOnDotsHover, respondTo: null != t.respondTo ? t.respondTo : "window", responsive: t.responsive || void 0, rows: null != t.rows ? parseInt(t.rows, 10) : 1, slide: t.slide || "", slidesPerRow: null != t.slidesPerRow ? parseInt(t.slidesPerRow, 10) : 1, slidesToShow: null != t.slidesToShow ? parseInt(t.slidesToShow, 10) : 1, slidesToScroll: null != t.slidesToScroll ? parseInt(t.slidesToScroll, 10) : 1, speed: null != t.speed ? parseInt(t.speed, 10) : 300, swipe: "false" !== t.swipe, swipeToSlide: "true" === t.swipeToSlide, touchMove: "false" !== t.touchMove, touchThreshold: t.touchThreshold ? parseInt(t.touchThreshold, 10) : 5, useCSS: "false" !== t.useCSS, variableWidth: "true" === t.variableWidth, vertical: "true" === t.vertical, verticalSwiping: "true" === t.verticalSwiping, rtl: "true" === t.rtl}, t.settings)
        }, l = function () {
            var e = angular.element(o);
            return e.hasClass("slick-initialized") && (e.remove("slick-list"), e.slick("unslick")), e
        }, d = function () {
            a();
            var n = angular.element(o);
            if (angular.element(o).hasClass("slick-initialized")) {
                if (r.enabled)return n.slick("getSlick");
                l()
            } else {
                if (angular.element(o).css("display", "block"), !r.enabled)return;
                n.on("init", function (e, n) {
                    return"undefined" != typeof r.event.init && r.event.init(e, n), "undefined" != typeof c ? n.slideHandler(c) : void 0
                }), e(function () {
                    n.slick(r)
                })
            }
            t.internalControl = r.method || {}, i.forEach(function (e) {
                t.internalControl[e] = function () {
                    var i;
                    i = Array.prototype.slice.call(arguments), i.unshift(e), n.slick.apply(o, i)
                }
            }), n.on("afterChange", function (e, n, i, o) {
                c = i, "undefined" != typeof r.event.afterChange && t.$apply(function () {
                    r.event.afterChange(e, n, i, o)
                })
            }), n.on("beforeChange", function (e, n, i, o) {
                "undefined" != typeof r.event.beforeChange && t.$apply(function () {
                    r.event.beforeChange(e, n, i, o)
                })
            }), n.on("reInit", function (e, n) {
                "undefined" != typeof r.event.reInit && t.$apply(function () {
                    r.event.reInit(e, n)
                })
            }), "undefined" != typeof r.event.breakpoint && n.on("breakpoint", function (e, n, i) {
                t.$apply(function () {
                    r.event.breakpoint(e, n, i)
                })
            }), "undefined" != typeof r.event.destroy && n.on("destroy", function (e, n) {
                t.$apply(function () {
                    r.event.destroy(e, n)
                })
            }), "undefined" != typeof r.event.edge && n.on("edge", function (e, n, i) {
                t.$apply(function () {
                    r.event.edge(e, n, i)
                })
            }), "undefined" != typeof r.event.setPosition && n.on("setPosition", function (e, n) {
                t.$apply(function () {
                    r.event.setPosition(e, n)
                })
            }), "undefined" != typeof r.event.swipe && n.on("swipe", function (e, n, i) {
                t.$apply(function () {
                    r.event.swipe(e, n, i)
                })
            })
        }, u = function () {
            l(), d()
        }, o.one("$destroy", function () {
            l()
        }), t.$watch("settings", function (e, n) {
            return null !== e ? u() : void 0
        }, !0)
    }}
}]);
/**
 * declare 'packet' module with dependencies
 */
'use strict';
angular.module("packet", [
    'ngAnimate',
    'ngCookies',
    'ngStorage',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'ui.bootstrap',
    'angularMoment',
    'oc.lazyLoad',
    'swipe',
    'ngBootstrap',
    'truncate',
    'uiSwitch',
    'toaster',
    'ngAside',
    'vAccordion',
    'vButton',
    'oitozero.ngSweetAlert',
    'angular-notification-icons',
    'angular-ladda',
    'angularAwesomeSlider',
    'slickCarousel',
    'cfp.loadingBar',
    'ncy-angular-breadcrumb',
    'duScroll',
    'pascalprecht.translate',
    'FBAngular'
]);
var app = angular.module('app', ['packet']);
app.run(['$rootScope', '$state', '$stateParams',
    function ($rootScope, $state, $stateParams) {

        // Attach Fastclick for eliminating the 300ms delay between a physical tap and the firing of a click event on mobile browsers
        FastClick.attach(document.body);

        // Set some reference to access them from any scope
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        // GLOBAL APP SCOPE
        // set below basic information
        $rootScope.app = {
            name: 'Packet', // name of your project
            author: 'ClipTheme', // author's name or company name
            description: 'Angular Bootstrap Admin Template', // brief description
            version: '1.0', // current version
            year: ((new Date()).getFullYear()), // automatic current year (for copyright information)
            isMobile: (function () {// true if the browser is a mobile device
                var check = false;
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    check = true;
                }
                ;
                return check;
            })(),
            defaultLayout: {
                isNavbarFixed: true, //true if you want to initialize the template with fixed header
                isSidebarFixed: true, // true if you want to initialize the template with fixed sidebar
                isSidebarClosed: false, // true if you want to initialize the template with closed sidebar
                isFooterFixed: false, // true if you want to initialize the template with fixed footer
                isBoxedPage: false, // true if you want to initialize the template with boxed layout
                theme: 'lyt1-theme-1', // indicate the theme chosen for your project
                logo: 'assets/img/codertrustlogo.png', // relative path of the project logo
                logoCollapsed: 'assets/img/logo-collapsed.png' // relative path of the collapsed logo
            },
            layout: ''
        };
        $rootScope.app.layout = angular.copy($rootScope.app.defaultLayout);
        $rootScope.user = {
            name: 'Peter',
            job: 'ng-Dev',
            picture: 'app/img/user/02.jpg'
        };
    }]);
// translate config
app.config(['$translateProvider',
    function ($translateProvider) {

        // prefix and suffix information  is required to specify a pattern
        // You can simply use the static-files loader with this pattern:
        $translateProvider.useStaticFilesLoader({
            prefix: 'assets/i18n/',
            suffix: '.json'
        });

        // Since you've now registered more then one translation table, angular-translate has to know which one to use.
        // This is where preferredLanguage(langKey) comes in.
        $translateProvider.preferredLanguage('en');

        // Store the language in the local storage
        $translateProvider.useLocalStorage();

        // Enable sanitize
        $translateProvider.useSanitizeValueStrategy('sanitize');

    }]);
// Angular-Loading-Bar
// configuration
app.config(['cfpLoadingBarProvider',
    function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeBar = true;
        cfpLoadingBarProvider.includeSpinner = false;

    }]);
// Angular-breadcrumb
// configuration
app.config(function ($breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
        template: '<ul class="breadcrumb"><li><a href="/profile/dashboard"><i class="fa fa-home margin-right-5 text-large text-dark"></i>Home</a></li><li ng-repeat="step in steps">{{step.ncyBreadcrumbLabel}}</li></ul>'
    });
});
// ng-storage
//set a prefix to avoid overwriting any local storage variables
app.config(['$localStorageProvider',
    function ($localStorageProvider) {
        $localStorageProvider.setKeyPrefix('PacketLtr1');
    }]);
//filter to convert html to plain text
app.filter('htmlToPlaintext', function () {
        return function (text) {
            return String(text).replace(/<[^>]+>/gm, '');
        };
    }
);
//Custom UI Bootstrap Calendar Popup Template
app.run(["$templateCache", function ($templateCache) {
    $templateCache.put("uib/template/datepicker/popup.html",
            "<ul class=\"dropdown-menu clip-datepicker\"  ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\" ng-keydown=\"keydown($event)\">\n" +
            "	<li ng-transclude></li>\n" +
            "	<li ng-if=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
            "		<span class=\"btn-group pull-left\">\n" +
            "			<button type=\"button\" class=\"btn btn-sm btn-primary btn-o\" ng-click=\"select('today')\">{{ getText('current') }}</button>\n" +
            "			<button type=\"button\" class=\"btn btn-sm btn-primary btn-o\" ng-click=\"select(null)\">{{ getText('clear') }}</button>\n" +
            "		</span>\n" +
            "		<button type=\"button\" class=\"btn btn-sm btn-primary pull-right\" ng-click=\"close()\">{{ getText('close') }}</button>\n" +
            "	</li>\n" +
            "</ul>\n" +
            "");
}]);
