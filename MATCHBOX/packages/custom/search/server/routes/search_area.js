'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
module.exports = function (Search, app, auth, database) {

	var area = require('../controllers/search_area')(Search);
	
	// Area APIs
	app.route('/api/city/search-area')
		.get(area.location);
	
	app.route('/api/location/city/search-area')
		.get(area.allCityDetail);
	
	app.route('/api/city/search-area/:areaId')
		.put(area.updateLatLong);
	
	app.route('/api/search-area')
		.post(area.create)
		.get(area.all);
	
	app.route('/api/search-area/:areaId')
		.get(area.get)
		.put(area.update)
		.delete(area.delete);
	
	// City APIs
	app.route('/api/location/city')
		.post(area.createCity)
		.get(area.allCity);
	
	app.route('/api/location/city/:cityId')
		.get(area.getCity)
		.put(area.updateCity);
	
	app.route('/api/city/:cityName/location/lat-long')
		.get(area.updateLocality);
	
	app.param('cityId', area.city);
	app.param('areaId', area.area);
	app.param('cityName', area.cityName);
	
 };

