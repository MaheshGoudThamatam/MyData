'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var searchRooms = {
    'spec': {
      description: 'Search operations',
      path: '/search/rooms',
      method: 'POST',
      summary: 'Search rooms',
      notes: '',
      type: 'Rooms',
      nickname: 'searchRooms',
      produces: ['application/json'],
      parameters: [{
        name: 'body',
        in: 'body',
        description: "Search object that contains parameter in order to query and fetch the rooms."/* + " Like : {
    		'capacity': {
    			'min': '1',
    			'max': '2'
    		},
    		'lon': '77.62704859999997',
    		'lat': '12.9377272',
    		'etime': '02:30 PM',
    		'stime': '10:30 AM',
    		'roomType': 'Hot Desk',
    		'timeType': 'undefined',
    		'place': 'Ejipura (Koramangala)',
    		'date': 'undefined',
    		'timeZoneOffset': '-330',
    		'fromDate': '11/08/2016',
    		'endDate': '11/10/2016',
    		'excludeHoliday': 'true',
    		'excludeSunday': 'true'
    	}"*/,
        required: true,
        type: 'Rooms',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  swagger.addPost(searchRooms);

};
