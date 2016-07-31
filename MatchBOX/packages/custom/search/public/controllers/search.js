'use strict';

/* jshint -W098 */
var myApp = angular.module('mean.search');

myApp.directive('googleplace', function() {
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, model) {
			var options = {
					types: [],
					componentRestrictions: {}
			};
			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
			google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
				scope.$apply(function() {
					model.$setViewValue(element.val());                
				});
			});
		}
	};
});
//myApp.factory('myService', function() {});


myApp.controller('SearchController', ['$scope', 'Global', 'SearchService', 'URLFactory','$location', '$rootScope', 'SEARCH', '$timeout','flash', 'MESSAGES',
                                      function($scope, Global, SearchService, URLFactory, $location, $rootScope, SEARCH, $timeout, flash, MESSAGES) {
	$scope.global = Global;
	$scope.package = {
			name: 'search'
	};
	$scope.hideEndTimeBox = false;
	$scope.gPlace;
	flashmessageOn($rootScope, $scope,flash);
	$scope.init = function() {
		$timeout(function() {
			$("#date").datepicker({
				minDate : 0
			});
			/*	$('#meetingcheckin').datetimepicker({
				format : 'LT',


			});
			$('#meetingcheckout').datetimepicker({
				format : 'LT'
			});
			$('#boardcheckin').datetimepicker({
				format : 'LT'
			});
			$('#boardcheckout').datetimepicker({
				format : 'LT'
			});*/
		})

	}

	/*	
	$("#meetingcheckin").on('focusout', function(){
		var timeArr = document.getElementById("meetingcheckin").value;
		timeArr = timeArr.split(" ");
		var minTime = timeArr[0].split(":");
		console.log(minTime);
		var minHrs = parseInt(minTime[0]);
		var minMins = parseInt(minTime[1]);
		console.log(minHrs);

		$('#meetingcheckout').datetimepicker("destroy");
		$scope.$apply(function () {
			$('#meetingcheckout').datetimepicker({
				min :
			});
		});

	});*/


	/*	
	var autocompleteService = new google.maps.places.AutocompleteService();

	getPlacePredictions(document.getElementById('destination').value);

	function getPlacePredictions(search) {

	    autocompleteService.getPlacePredictions({
	        input: search,
	        types: ['establishment', 'geocode']
	    });
	}*/


	$scope.timeSet = [{data : '12:00 AM'}, {data :'12:30 AM'}, {data :'01:00 AM'}, {data :'01:30 AM'}, {data :'02:00 AM'}, {data :'02:30 AM'}, {data :'03:00 AM'}, {data :'03:30 AM'}, 
	                  {data :'04:00 AM'}, {data :'04:30 AM'}, {data :'05:00 AM'}, {data :'05:30 AM'}, {data :'06:00 AM'}, {data :'06:30 AM'}, {data :'07:00 AM'}, {data :'07:30 AM'}, 
	                  {data :'08:00 AM'}, {data :'08:30 AM'}, {data :'09:00 AM'}, {data :'09:30 AM'}, {data :'10:00 AM'}, {data :'10:30 AM'}, {data :'11:00 AM'}, {data :'11:30 AM'}, 
	                  {data :'12:00 PM'}, {data :'12:30 PM'}, {data :'01:00 PM'}, {data :'01:30 PM'}, {data :'02:00 PM'}, {data :'02:30 PM'}, {data :'03:00 PM'}, {data :'03:30 PM'}, 
	                  {data :'04:00 PM'}, {data :'04:30 PM'}, {data :'05:00 PM'}, {data :'05:30 PM'}, {data :'06:00 PM'}, {data :'06:30 PM'}, {data :'07:00 PM'}, {data :'07:30 PM'}, 
	                  {data :'08:00 PM'}, {data :'08:30 PM'}, {data :'09:00 PM'}, {data :'09:30 PM'}, {data :'10:00 PM'}, {data :'10:30 PM'}, {data :'11:00 PM'}, {data :'11:30 PM'}];

	$scope.endTimeSet = $scope.timeSet;

	$scope.timeTypes = [{data : 'Hourly'}, {data: 'Half Day'}, {data: 'Full Day'}];

	$scope.trainingTimeTypes = [{data: 'Half Day'}, {data: 'Full Day'}];

	$scope.meetingRoomCapacity = [{data : '02'}, {data: '03'}, {data: '04'},{data : '05'}, {data: '06'}, {data: '07'},{data : '08'}];

	$scope.boardRoomCapacity = [{data : '08'}, {data: '09'}, {data: '10'},{data : '11'}, {data: '12'},{data : '13'}, {data: '14'}, {data: '15'},{data : '16'}, {data: '17'}, {data: '18'},{data : '19'}, {data: '20'}];
	
	$scope.hotDeskCapacity = [{data : '01'}, {data: '02'}, {data : '03'}, {data: '04'}, {data: '05'}, {data : '06'}, {data: '07'}, {data: '08'}, {data : '09'}, {data: '10'}, 
	                          {data : '11'}, {data: '12'}, {data : '13'}, {data: '14'}, {data: '15'}, {data : '16'}, {data: '17'}, {data: '18'}, {data : '19'}, {data: '20'},
	                          {data : '21'}, {data: '22'}, {data : '23'}, {data: '24'}, {data: '25'}, {data : '26'}, {data: '27'}, {data: '28'}, {data : '29'}, {data: '30'},
	                          {data : '31'}, {data: '32'}, {data : '33'}, {data: '34'}, {data: '35'}, {data : '36'}, {data: '37'}, {data: '38'}, {data : '39'}, {data: '40'},
	                          {data : '41'}, {data: '42'}, {data : '43'}, {data: '44'}, {data: '45'}, {data : '46'}, {data: '47'}, {data: '48'}, {data : '49'}, {data: '50'}];

	$scope.occupancyRange = [{range : '01 - 10'}, {range : '11 - 20'}, {range : '21 - 30'}, {range : '31 - 40'}, {range : '41 - 50'}];


	//validation for time
	$scope.setEndTimeList = function(room){
		var index;
		for(var i = 0; i < $scope.timeSet.length; i++){
			if(room.startTime === $scope.timeSet[i].data){
				index = i;
				break;
			}
		}
		$scope.endTimeSet = [];
		for(var j = index + 2; j < $scope.timeSet.length; j++){
			$scope.endTimeSet.push($scope.timeSet[j]);
		}
	};

	$scope.hideEndTime = function(roomObj){
		$scope.endTimeSet = $scope.timeSet;
		$scope.timeType = roomObj.timeType;
		delete roomObj.startTime;
		delete roomObj.endTime;
		if(roomObj.timeType === 'Half Day'){
			$scope.hideEndTimeBox = true;
		} else if(roomObj.timeType === 'Full Day'){
			$scope.hideEndTimeBox = true;
		} else {
			$scope.hideEndTimeBox = false;
		}
	};


	$scope.setEndTime = function(room){
		if(room.timeType === 'Half Day'){
			//	console.log(room.timeType);
			for(var i = 0; i < $scope.timeSet.length; i++){
				if($scope.timeSet[i].data === room.startTime){
					if(i > 40) {
						room.endTime = $scope.timeSet[i % 40].data;	
					} else { 
						room.endTime = $scope.timeSet[i+8].data;	

					}
				}
			}
		} else if(room.timeType === 'Full Day'){
			//	console.log(room.timeType);
			for(var i = 0; i < $scope.timeSet.length; i++){

				if($scope.timeSet[i].data === room.startTime){
					if(i > 40) {
						room.endTime = $scope.timeSet[(i % 40) + 8].data;	
					} else { 
						room.endTime = $scope.timeSet[i+16].data;	

					}
				}
			}
		} else{
			//console.log(room.timeType);
		}
		return room.endTime;
	};

	$scope.searchService = function(searchElement){
		//console.log($scope.searchElements);
		if($scope.searchElements.roomType == SEARCH.CONSTANT.MEETING_ROOM){
			var search = new SearchService.search(searchElement);
			search.$save({
				perPage : 6,
				page : 0
			}, function(searchedList){
				if(!angular.isUndefined(searchedList.rooms)){
					$scope.searchedList = searchedList.rooms;
					if($scope.searchedList.length > 0){
						$rootScope.searchedList = $scope.searchedList;
						$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.selectedStartTime+ '&end_time='+$scope.selectedEndTime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date+'&pageNo='+0);
					}else{
						flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
					}
				}else{
					flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
				}
			}, function(error){
				console.log(error);
			});
		} else if($scope.searchElements.roomType == SEARCH.CONSTANT.BOARD_ROOM) {
			var search = new SearchService.search(searchElement);
			search.$save({
				perPage : 6,
				page : 0
			}, function(searchedList){
				if(!angular.isUndefined(searchedList.rooms)){
					$scope.searchedList = searchedList.rooms;
					if($scope.searchedList.length > 0){
						$rootScope.searchedList = $scope.searchedList;
						$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date+'&pageNo='+0);
					}else{
						flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
					}
				}else{
					flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
				}
			}, function(error){
				console.log(error);
			});
		} else if($scope.searchElements.roomType == SEARCH.CONSTANT.TRAINING_ROOM) {
			var search = new SearchService.search(searchElement);
			search.$save({
				perPage : 6,
				page : 0
			}, function(searchedList){
				//console.log(searchedList);
				if(!angular.isUndefined(searchedList.rooms)){
					$scope.searchedList = searchedList.rooms;
					if($scope.searchedList.length > 0){
						$rootScope.searchedList = $scope.searchedList;
						$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date+'&pageNo='+0);
					}else{
						flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
					}
				}else{
					flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
				}
			}, function(error){
				console.log(error);
			});
		} else if($scope.searchElements.roomType == SEARCH.CONSTANT.HOT_DESK) {
			console.log(searchElement);
			var search = new SearchService.search(searchElement);
			search.$save({
				perPage : 6,
				page : 0
			}, function(searchedList){
				//console.log(searchedList);
				if(!angular.isUndefined(searchedList.rooms)){
					$scope.searchedList = searchedList.rooms;
					if($scope.searchedList.length > 0){
						$rootScope.searchedList = $scope.searchedList;
						$location.url(SEARCH.URL_PATH.SEARCH_LIST+'?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+'&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date);
					}else{
						flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
					}
				}else{
					flash.setMessage(MESSAGES.ROOM_NOT_FOUND,MESSAGES.ERROR);
				}
			}, function(error){
				console.log(error);
			});
		}
	}

	$scope.getLatitudeLongitude = function(address) {
		// If adress is not supplied, use default value 'Ferrol, Galicia, Spain'
		address = address || 'Bangalore';
		// Initialize the Geocoder
		var geocoder = new google.maps.Geocoder();
		if (geocoder) {
			geocoder.geocode({
				'address': address
			}, function (results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					/*console.log(results);
					console.log("center" + results[0].geometry.bounds.getCenter());
					console.log("lat" + results[0].geometry.location.lat());
					console.log("lng" + results[0].geometry.location.lng());*/
				}
				$scope.searchElements.lon = results[0].geometry.location.lng();
				$scope.searchElements.lat = results[0].geometry.location.lat();
				$rootScope.searchObj = angular.copy($scope.searchElements);

				$scope.searchService($scope.searchElements);
			});
		}
	};

	$scope.defineSearchObject = function(roomObj, roomType){
		if(SEARCH.CONSTANT.MEETING_ROOM === roomType){
			var roomcapacity = {
					min : roomObj.capacity,
					max : 8
			}
			$scope.searchElements.capacity = roomcapacity;
			$scope.searchElements.roomType = SEARCH.CONSTANT.MEETING_ROOM;
		} else if(SEARCH.CONSTANT.BOARD_ROOM === roomType){
			var roomcapacity = {
					min : roomObj.capacity,
					max : 30
			}
			$scope.searchElements.capacity = roomcapacity;
			$scope.searchElements.roomType = SEARCH.CONSTANT.BOARD_ROOM;
		} else if(SEARCH.CONSTANT.TRAINING_ROOM === roomType){
			var roomcapacity = {
					min : parseInt(roomObj.capacity.split(' ')[0]),
					max : 50
			}
			$scope.searchElements.capacity = roomcapacity;
			$scope.searchElements.roomType = SEARCH.CONSTANT.TRAINING_ROOM;
		} else if(SEARCH.CONSTANT.HOT_DESK === roomType){
			var roomcapacity = {
					min : 1,
					max : parseInt(roomObj.capacity)
			}
			$scope.searchElements.capacity = roomcapacity;
			$scope.searchElements.roomType = SEARCH.CONSTANT.HOT_DESK;
		}

	};

	/**
	 * Search Meeting Room
	 */
	$scope.searchMeetingRoom = function(roomObj, roomType) {

		if(roomType === 'Meeting Room'){
			roomObj.date = document.getElementById("date").value;
			roomObj.startTime = $('#meetingcheckin').val();
			roomObj.endTime = $('#meetingcheckout').val();
		}else if(roomType === 'Board Room'){
			roomObj.date = document.getElementById("boarddate").value;
			roomObj.startTime = $('#boardroomcheckin').val();
			roomObj.endTime = $('#boardroomcheckout').val();
		}
		//console.log(roomObj);


		$scope.selectedStartTime = roomObj.date + " " + roomObj.startTime;
			var selectedStartTime = new Date($scope.selectedStartTime);

		$scope.selectedEndTime = roomObj.date + " " + roomObj.endTime;
			var selectedEndTime = new Date($scope.selectedEndTime);

		$rootScope.dateObj = {
				date : roomObj.date,
				sTime : roomObj.startTime,
				etime : roomObj.endTime,
				timeType : $scope.timeType
		}

		$scope.searchElements = {
				place: roomObj.address,
				stime: selectedStartTime,
				etime: selectedEndTime
		};

		$scope.defineSearchObject(roomObj, roomType);

		$scope.getLatitudeLongitude(roomObj.address);
	};

	/**
	 * Search Training Room
	 */
	$scope.searchTrainingRoom = function(roomObj, roomType) {
		roomObj.startTime = $('#trainingroomcheckin').val();
		if(roomObj.startTime){
			roomObj.endTime = $scope.setEndTime(roomObj);
		}
		roomObj.fromDate = document.getElementById("fromDate").value;
		roomObj.endDate = document.getElementById("endDate").value;

		var selectedStartTime = roomObj.fromDate + " " + roomObj.startTime;
		//var selectedStartTime = new Date(selectedStartTime);

		var selectedEndTime = roomObj.endDate + " " + roomObj.endTime;
		//var selectedEndTime = new Date(selectedEndTime);

		$rootScope.dateObj = {
				fromDate : selectedStartTime,
				endDate : selectedEndTime,
				sTime : roomObj.startTime,
				etime : roomObj.endTime,
				timeType : $scope.timeType,
				roomType: SEARCH.CONSTANT.TRAINING_ROOM
		}

		$scope.searchElements = {
				place: roomObj.address,
				stime: roomObj.startTime,
				etime: roomObj.endTime,
				fromDate: roomObj.fromDate,
				endDate: roomObj.endDate
		};

		$scope.defineSearchObject(roomObj, roomType);

		$scope.getLatitudeLongitude(roomObj.address);
	};
	
	/**
	 * Hot Desk
	 */
	$scope.searchHotDesk = function(roomObj, roomType) {
		roomObj.startTime = $('#hotdeskcheckin').val();
		if(roomObj.startTime){
			roomObj.endTime = $scope.setEndTime(roomObj);
		}
		roomObj.fromDate = document.getElementById("fromDate").value;
		roomObj.endDate = document.getElementById("endDate").value;

		var selectedStartTime = roomObj.fromDate + " " + roomObj.startTime;
		//var selectedStartTime = new Date(selectedStartTime);

		var selectedEndTime = roomObj.endDate + " " + roomObj.endTime;
		//var selectedEndTime = new Date(selectedEndTime);

		$rootScope.dateObj = {
			fromDate : selectedStartTime,
			endDate : selectedEndTime,
			sTime : roomObj.startTime,
			etime : roomObj.endTime,
			timeType : $scope.timeType,
			roomType: SEARCH.CONSTANT.TRAINING_ROOM
		};

		$scope.searchElements = {
			place: roomObj.address,
			stime: roomObj.startTime,
			etime: roomObj.endTime,
			fromDate: roomObj.fromDate,
			endDate: roomObj.endDate
		};

		$scope.defineSearchObject(roomObj, roomType);

		$scope.getLatitudeLongitude(roomObj.address);
	};
	
	
//	Timepicker Initialize - Meeting Room.
//	Variable:
//	cinTime  : Check In Time
//	coutTime : Check Out Time
	$scope.meetingRoomTimeUI = function(){
		var cinTime = $('#meetingcheckin');
		var coutTime = $('#meetingcheckout');
		$(function () {
			$('#meetingcheckin').datetimepicker({
				format: 'LT',
				stepping: '30'
			});
		});
		cinTime.on('dp.change', function (e){
			coutTime.data('DateTimePicker').minDate(e.date.add(1, 'hours'));
		});

		$(function () {
			$('#meetingcheckout').datetimepicker({
				format: 'LT',
				stepping: '30'
			});
		});
	};


	$scope.boardRoomTimeUI = function(){
		var cinTime = $('#boardroomcheckin');
		var coutTime = $('#boardroomcheckout');
		$(function () {
			$('#boardroomcheckin').datetimepicker({
				format: 'LT',
				stepping: '30'
			});
		});
		cinTime.on('dp.change', function (e){
			coutTime.data('DateTimePicker').minDate(e.date.add(1, 'hours'));
		});

		$(function () {
			$('#boardroomcheckout').datetimepicker({
				format: 'LT',
				stepping: '30'
			});
		});
	};

	//	Timepicker Initialize - Hot Desk.
	//	Variable:
	//	cinTime  : Check In Time
	//	coutTime : Check Out Time
	$scope.hotDeskTimeUI = function(){
		var cinTime = $('#hotdeskcheckin');
		$(function () {
			$('#hotdeskcheckin').datetimepicker({
				format: 'LT',
				stepping: '30'
			});
		});
	};

	//	Timepicker Initialize - Hot Desk Module.
	//	Variable:
	//	cinTime  : Check In Time
	//	coutTime : Check Out Time
	$scope.virtualOfficetimeUI = function(){
		$(function () {
			$('#virtualofficecheckin').datetimepicker({
				format: 'LT',
				stepping: '30'
			});
		});
	};

	//	Timepicker Initialize - Training Room Module.
	//	Variable:
	//	cinTime  : Check In Time
	//	coutTime : Check Out Time
	$scope.virtualOfficetimeUI = function(){
		$(function () {
			$('#trainingroomcheckin').datetimepicker({
				format: 'LT',
				stepping: '30'
			});
		});
	};



	$timeout(function(){
		Calendar();
	},10000);
}
]);

function initializeEndtime() {
	console.log("end time");
}


