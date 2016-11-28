
'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
module.exports = function (SpaceHoliday, app, auth, database) {

	var spaceHoliday = require('../controllers/space_holiday')(SpaceHoliday);
	
	  app.route('/api/space/holiday')
    	.post(spaceHoliday.create)
    	.get(spaceHoliday.all);
	  
	  app.route('/api/space/holiday/year')
	    .get(spaceHoliday.loadHolidayBasedOnYear);
	  
	  app.route('/api/space/holiday/:holidayId')
	    .get(spaceHoliday.show)
	    .put(spaceHoliday.update)
	    .delete(spaceHoliday.destroy);
  
	  app.param('holidayId', spaceHoliday.holiday);
	
 };

