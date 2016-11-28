(function() {
    'use strict';

    function Socket($stateProvider) {
        $stateProvider.state('socket example page', {
            url: '/socket/example',
            templateUrl: 'socket/views/index.html'
        }).state('socket circles example', {
            url: '/socket/example/:circle',
            templateUrl: 'socket/views/example.html'
        });
    }

    angular
        .module('mean.socket')
        .config(Socket);

    Socket.$inject = ['$stateProvider'];

})();
