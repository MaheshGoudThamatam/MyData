angular.module('mean.system').constant('LOCALES', {
    'locales': {
        'ru_RU': 'Русский',
        'en_US': 'English'
    },
    'preferredLocale': 'en_US'
});

// define custom handler
angular.module('mean.system').factory('myCustomHandlerFactory', function () {
    // has to return a function which gets a tranlation id
    return function (translationID) {
        // do something with dep1 and dep2
    };
});

angular.module('mean.system').config(function ($translateProvider) {
    $translateProvider.useMissingTranslationHandler('myCustomHandlerFactory');
    $translateProvider.useStaticFilesLoader({
        prefix: '/system/assets/i18n/',// path to translations files
        suffix: '.json'// suffix, currently- extension of the translations
    });
    $translateProvider.preferredLanguage('en_US');// is applied on first load
    $translateProvider.useLocalStorage();// saves selected language to localStorage
});

