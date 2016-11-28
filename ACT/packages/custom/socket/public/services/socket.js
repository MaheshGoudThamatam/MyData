(function() {
	'use strict';

	function Socket($http, $q, socketFactory, $location) {

		var myIoSocket = io('http://'+ $location.host() + ':3030');

		var mySocket = socketFactory({
			ioSocket: myIoSocket
		});
		mySocket.forward('notify');

		return mySocket;
	}

	angular
		.module('mean.socket')
		.factory('Socket', Socket);

	Socket.$inject = ['$http', '$q', 'socketFactory', '$location'];

})();