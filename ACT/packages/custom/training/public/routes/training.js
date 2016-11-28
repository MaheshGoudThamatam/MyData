(function() {
    'use strict';
    angular.module('mean.training').config(Training);
    Training.$inject = ['$stateProvider', 'TRAINING'];

    function Training($stateProvider, TRAINING) {
        $stateProvider
            .state(TRAINING.STATE.TRAININGCREATE, {
                url: TRAINING.URL_PATH.TRAININGCREATE,
                templateUrl: TRAINING.FILE_PATH.TRAININGCREATE,
            })
            .state(TRAINING.STATE.TRAININGMANAGE, {
                url: TRAINING.URL_PATH.TRAININGMANAGE,
                templateUrl: TRAINING.FILE_PATH.TRAININGMANAGE,
            });
    }

})();
