
'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
module.exports = function (Space, app, auth, database) {

	var space = require('../controllers/space')(Space);
	
	app.route('/api/space/pagination')
		.get(space.pagination);
	
	app.route('/api/space')
		.post(space.create);
	
	app.route('/api/partner/:partnerId/space')
		.get(space.loadPartnersSpace);
	
	app.route('/api/space/partner')
		.get(space.loadPartners);
	
	app.route('/api/space/:spaceId')
		.get(space.get)
		.put(space.update)
		.delete(space.delete);
	
	app.route('/api/partner/team/:userId/space')
		.get(space.getSpaceAddress);

	/* Routes for rating & reviews */

	app.route('/api/space/review/:bookingId')
		.post(space.createReview);

	app.route('/api/space/review/:reviewId')
		.get(space.getReview)
		.put(space.updateReview)
		.delete(space.deleteReview);

	app.route('/api/space/reviews/:userId')
		.get(space.getUserReviews);

	app.route('/api/space/:spaceId/reviews')
		.get(space.getSpaceReviews);
	app.route('/api/getSpaceRoomDetail/:roomId')
		.get(space.getSpaceDetail);
	
	app.route('/api/getSpaceBackOffice')
	    .get(space.loadSpaceBackOffice);

	app.route('/api/fetchRole')
	   .get(space.fetchRoleName);

	app.route('/api/space/admin/spaceSendToAdminApproval')
     .put(space.spaceSendToAdminApproval); 
	
	app.route('/api/event-scheduler/space/role')
    	.get(space.spaceByRole); 

    	
	app.param('spaceId', space.space);
	app.param('userId', space.user);
	app.param('partnerId', space.user);
	app.param('reviewId', space.review);
	app.param('roomId', space.room);
	
 };

