'use strict';
var config = require('meanio').loadConfig();
var emoji = require('node-emoji');
module.exports = {
	booking_failure_email : function(actor, booking) {
		var email = {
			body : {
				greeting : 'Oh dear,',
				name : ' ' + booking.user.first_name + ' '
						+ emoji.emojify('🙁'),
				intro : 'We are sorry to inform you that your booking has not gone through. Your Credit/Debit card has not been charged.',
				action : {
					instructions : 'Click below to resume your search for the best deals in Temporary Offices.',
					button : {
						color : 'green',
						text : 'Resume Search',
						link : config.hostname
					}
				},
				outro : 'Thank you for using <b>mymatchbox</b><br/><b>P.S. Need help with your booking? Contact us on : bookings@mymatchbox.in or call '
						+ config.support.phone + '</b>'
			},
			subject : 'Booking Failure'
		}
		return email;
	},
	booking_failure_email_guest : function(actor, booking) {
		var email = {
			body : {
				greeting : 'Oh dear,',
				name : ' ' + booking.guestUser.first_name + ' '
						+ emoji.emojify('🙁'),
				intro : 'We are sorry to inform you that your booking has not gone through. Your Credit/Debit card has not been charged.',
				action : {
					instructions : 'Click below to resume your search for the best deals in Temporary Offices.',
					button : {
						color : 'green',
						text : 'Resume Search',
						link : config.hostname
					}
				},
				outro : 'Thank you for using mymatchbox<br/><b>P.S. Need help with your booking? Contact us on : admin@mymatchbox.in or call'
						+ config.support.phone + '</b>'
			},
			subject : 'Booking Failure'
		}
		return email;
	},
	attendee_email : function(attendee, req, room, space, booking,
			bookingsstartTime, bookingsendTime) {
		var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
				"Sep", "Oct", "Nov", "Dec" ];
		var bookingNewDate = new Date(booking.bookingDate);
		var bookingMonth = months[bookingNewDate.getMonth()];
		var bookingDate = bookingNewDate.getDate();
		var bookingYear = bookingNewDate.getFullYear();

		var email = {
			body : {
				greeting : 'Dear',
				name : ' ' + attendee.name,
				intro : 'Greetings from mymatchbox, your permanent solution for temporary offices!.<br/>You have been invited for a meeting by '
						+ booking.user.first_name + '<br>',
				table : {
					data : [
							{
								'Details' : 'Date',
								'' : bookingDate + ' ' + bookingMonth + ', '
										+ bookingYear
							},
							{
								'Details' : 'Time',
								'' : bookingsstartTime + ' - '
										+ bookingsendTime
							},
							{
								'Details' : 'Space',
								'' : space.name
							},
							{
								'Details' : 'Room Name',
								'' : room.name
							},
							{
								'Details' : 'Address',
								'' : space.address1 + '\n' + space.address2
										+ '\n' + space.city
							}, ],
					columns : {
						customWidth : {
							item : '15%',
							description : '20%'
						},
						customAlignment : {
							description : 'right'
						}
					}
				},
				outro : 'Did you know that first time users receive Rs.200 off on their first booking? Register now for the best deals in Temporary Offices.'
			},
			subject : booking.user.first_name + ' '
					+ 'has invited you for a meeting'
		}
		return email;
	},
	confirmation_email_guest : function(req, user, token) {
		var email = {
			body : {
				name : user.first_name + '	' + '!',
				intro : 'Thank you for registering with mymatchbox, your permanent solution for temporary office space'
						+ '	' + '!',
				action : {
					instructions : 'Please click below to get started.',
					button : {
						color : 'green',
						text : 'Click Here To Get Started',
						link : 'http://' + req.headers.host + '/api/confirm/'
								+ token
					}
				},
				outro : 'Thank you for using mymatchbox<br/><b>P.S. Need help with your booking? Contact us on : admin@mymatchbox.in or call'
						+ config.support.phone + '</b>'
			// signature: 'Thank you for using mymatchbox'
			},
			subject : 'Confirmation mail'
		}
		return email;
	},

	booking_email : function(actor, room, space, booking, bookingsstartTime,
			bookingsendTime, roomType) {
		if (roomType == 'Meeting Room' || roomType == 'Board Room') {
			var newURL = '/booking/success?booking_id=';
		}
		if (roomType == 'Hot Desk' || roomType == 'Training Room') {
			var newURL = '/booking/success/trainingRoom?booking_id=';
			var bookingsstartTime = booking.startTime;
			var bookingsendTime = booking.endTime;
		}
		var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
				"Sep", "Oct", "Nov", "Dec" ];
		var bookingNewDate = new Date(booking.bookingDate);
		var bookingMonth = months[bookingNewDate.getMonth()];
		var bookingDate = bookingNewDate.getDate();
		var bookingYear = bookingNewDate.getFullYear();

		var email = {
			body : {

				greeting : 'Thank you,',
				name : '	' + actor.first_name + '!' + ' Your' + ' ' + roomType
						+ '	 ' + 'booking is now confirmed',
				intro : 'Please take a moment to review the summary of your booking.',
				action : {
					instructions : 'Please carry valid ID proof (Passport, Driver\'s License, Aadhar Card, Voter ID, PAN Card)<br/><p style="text-align:center">Click below to view full details of your booking.</p>',
					button : {
						color : 'green',
						text : 'View Booking',
						link : config.hostname + newURL + booking._id + '&nord'
					}
				},
				table : {
					data : [
							{
								'Booking Details' : 'Space',
								'' : space.name
							},
							{
								'Booking Details' : 'Room Name',
								'' : room.name
							},
							{
								'Booking Details' : 'Room Address',
								'' : space.address1 + '\n' + space.address2
										+ '\n' + space.city + '<br>'
							},
							{
								'Booking Details' : 'Booking Date',
								'' : bookingDate + ' ' + bookingMonth + ', '
										+ bookingYear
							}, 
							{
								'Booking Details' : 'Booking From',
								'' : bookingsstartTime
							}, 
							{
								'Booking Details' : 'Booking To',
								'' : bookingsendTime
							}, 
							{
								'Booking Details' : 'Booked By',
								'' : booking.user.first_name
							} ],
					columns : {
						// Optionally, customize the column widths
						customWidth : {
							item : '20%',
							description : '20%'
						},
						// Optionally, change column text alignment
						customAlignment : {
							description : 'right'
						}
					}
				},
				outro : '<b>Important: This booking receipt is not an invoice. The invoice of your booking can be collected at the Business Centre / Hotel / Co-working space as per your Booking summary.<b><br/>'
						+ '<br/>Thank you for using <b>mymatchbox</b><br/><br/><b>P.S. Need help with your booking? Contact us on : bookings@mymatchbox.in or call '
						+ config.support.phone + '</b>'
			},
			subject : 'Your Booking Confirmation' + ' ' + ' '
					+ booking.bookingConfirmationId
		}

		if (booking.isWalkin) {
			email.body.table.data.splice(6, 1);
		}

		if (roomType == 'Hot Desk' && booking.feature != 'Event Calendar') {
			email.body.table.data.splice(1, 1);
			var relatedBookedRooms = '';
			for (var i = 0; i < booking.relatedBookedRooms.length; i++) {
				if (relatedBookedRooms === '') {
					relatedBookedRooms = booking.relatedBookedRooms[i].name;
				} else {
					relatedBookedRooms = relatedBookedRooms + ', '
							+ booking.relatedBookedRooms[i].name;
				}
			}
			var relatedRoomsBooked = {
				'Booking Details' : 'Room Names',
				'' : relatedBookedRooms
			}
			var relatedRoomsBookedCapacity = {
				'Booking Details' : 'No. of Desks',
				'' : booking.relatedBookedRooms.length
			}
			email.body.table.data.push(1, 0, relatedRoomsBooked);
			email.body.table.data.push(2, 0, relatedRoomsBookedCapacity);
		}

		if (roomType == 'Hot Desk' || roomType == 'Training Room') {
			if (roomType == 'Hot Desk') {
				//email.body.table.data.splice(4, 1);
				email.body.table.data.splice(2, 1);
			} else {
				//email.body.table.data.splice(3, 1);
				email.body.table.data.splice(2, 1);
			}
			var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
							"Sep", "Oct", "Nov", "Dec" ];
			
			var bookingNewDate = new Date(booking.fromDate);
			var bookingMonth = months[bookingNewDate.getMonth()];
			var bookingDate = bookingNewDate.getDate();
			var bookingYear = bookingNewDate.getFullYear();
			
			var bookingEndNewDate = new Date(booking.endDate);
			var bookingEndMonth = months[bookingEndNewDate.getMonth()];
			var bookingEndDate = bookingEndNewDate.getDate();
			var bookingEndYear = bookingEndNewDate.getFullYear();
			
			var bookingFromDate = {
				'Booking Details' : 'Booking From Date',
				'' : bookingDate + ' ' + bookingMonth + ', '+ bookingYear
			}
			var bookingEndDate = {
				'Booking Details' : 'Booking End Date',
				'' : bookingEndDate + ' ' + bookingEndMonth + ', '+ bookingEndYear
			}
			if (roomType == 'Hot Desk') {
				email.body.table.data.push(4, 0, bookingFromDate);
				email.body.table.data.push(5, 0, bookingEndDate);
			} else {
				email.body.table.data.push(3, 0, bookingFromDate);
				email.body.table.data.push(4, 0, bookingEndDate);
			}
		}

		return email;
	},
	
	booking_email_admin : function(actor, room, space, booking, bookingsstartTime,
			bookingsendTime, roomType) {
		if (roomType == 'Meeting Room' || roomType == 'Board Room') {
			var newURL = '/booking/success?booking_id=';
		}
		if (roomType == 'Hot Desk' || roomType == 'Training Room') {
			var newURL = '/booking/success/trainingRoom?booking_id=';
			var bookingsstartTime = booking.startTime;
			var bookingsendTime = booking.endTime;
		}
		var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
				"Sep", "Oct", "Nov", "Dec" ];
		var bookingNewDate = new Date(booking.bookingDate);
		var bookingMonth = months[bookingNewDate.getMonth()];
		var bookingDate = bookingNewDate.getDate();
		var bookingYear = bookingNewDate.getFullYear();

		var email = {
			body : {

				name : '	' + actor.first_name + ',' + ' A new' + ' ' + roomType
						+ '	 ' + 'has been booked',
				action : {
					button : {
						color : 'green',
						text : 'View Booking',
						link : config.hostname + newURL + booking._id + '&nord'
					}
				},
				table : {
					data : [
							{
								'Booking Details' : 'Space',
								'' : space.name
							},
							{
								'Booking Details' : 'Room Name',
								'' : room.name
							},
							{
								'Booking Details' : 'Room Address',
								'' : space.address1 + '\n' + space.address2
										+ '\n' + space.city + '<br>'
							},
							{
								'Booking Details' : 'Booking Date',
								'' : bookingDate + ' ' + bookingMonth + ', '
										+ bookingYear
							}, 
							{
								'Booking Details' : 'Booking From',
								'' : bookingsstartTime
							}, 
							{
								'Booking Details' : 'Booking To',
								'' : bookingsendTime
							}, 
							{
								'Booking Details' : 'Booked By',
								'' : booking.user.first_name
							} ],
					columns : {
						// Optionally, customize the column widths
						customWidth : {
							item : '20%',
							description : '20%'
						},
						// Optionally, change column text alignment
						customAlignment : {
							description : 'right'
						}
					}
				}
			},
			subject : 'New Booking has been made -' + ' ' + ' '
					+ booking.bookingConfirmationId
		}

		if (booking.isWalkin) {
			email.body.table.data.splice(6, 1);
		}

		if (roomType == 'Hot Desk' && booking.feature != 'Event Calendar') {
			email.body.table.data.splice(1, 1);
			var relatedBookedRooms = '';
			for (var i = 0; i < booking.relatedBookedRooms.length; i++) {
				if (relatedBookedRooms === '') {
					relatedBookedRooms = booking.relatedBookedRooms[i].name;
				} else {
					relatedBookedRooms = relatedBookedRooms + ', '
							+ booking.relatedBookedRooms[i].name;
				}
			}
			var relatedRoomsBooked = {
				'Booking Details' : 'Room Names',
				'' : relatedBookedRooms
			}
			var relatedRoomsBookedCapacity = {
				'Booking Details' : 'No. of Desks',
				'' : booking.relatedBookedRooms.length
			}
			email.body.table.data.push(1, 0, relatedRoomsBooked);
			email.body.table.data.push(2, 0, relatedRoomsBookedCapacity);
		}

		if (roomType == 'Hot Desk' || roomType == 'Training Room') {
			if (roomType == 'Hot Desk') {
				//email.body.table.data.splice(4, 1);
				email.body.table.data.splice(2, 1);
			} else {
				//email.body.table.data.splice(3, 1);
				email.body.table.data.splice(2, 1);
			}
			var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
							"Sep", "Oct", "Nov", "Dec" ];
			
			var bookingNewDate = new Date(booking.fromDate);
			var bookingMonth = months[bookingNewDate.getMonth()];
			var bookingDate = bookingNewDate.getDate();
			var bookingYear = bookingNewDate.getFullYear();
			
			var bookingEndNewDate = new Date(booking.endDate);
			var bookingEndMonth = months[bookingEndNewDate.getMonth()];
			var bookingEndDate = bookingEndNewDate.getDate();
			var bookingEndYear = bookingEndNewDate.getFullYear();
			
			var bookingFromDate = {
				'Booking Details' : 'Booking From Date',
				'' : bookingDate + ' ' + bookingMonth + ', '+ bookingYear
			}
			var bookingEndDate = {
				'Booking Details' : 'Booking End Date',
				'' : bookingEndDate + ' ' + bookingEndMonth + ', '+ bookingEndYear
			}
			if (roomType == 'Hot Desk') {
				email.body.table.data.push(4, 0, bookingFromDate);
				email.body.table.data.push(5, 0, bookingEndDate);
			} else {
				email.body.table.data.push(3, 0, bookingFromDate);
				email.body.table.data.push(4, 0, bookingEndDate);
			}
		}

		return email;
	},

	booking_email_guest : function(actor, room, space, booking,
			bookingsstartTime, bookingsendTime, roomType) {
		if (roomType == 'Meeting Room' || roomType == 'Board Room') {
			var newURL = '/booking/success?booking_id=';
		}
		if (roomType == 'Hot Desk' || roomType == 'Training Room') {
			var newURL = '/booking/success/trainingRoom?booking_id=';
		}
		var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
				"Sep", "Oct", "Nov", "Dec" ];
		var bookingNewDate = new Date(booking.bookingDate);
		var bookingMonth = months[bookingNewDate.getMonth()];
		var bookingDate = bookingNewDate.getDate();
		var bookingYear = bookingNewDate.getFullYear();

		var email = {
			body : {
				greeting : 'Thank you,',
				name : ' ' + actor.first_name + '!' + '<br>' + 'Your' + ' '
						+ roomType + '	 ' + 'booking is now confirmed',
				instructions : 'Click below to view full details of your booking.',
				action : {
					button : {
						color : 'green',
						text : 'View Booking',
						link : config.hostname + newURL + booking._id + '&nord'
					}
				},
				table : {
					data : [
							{
								'Booking Details' : 'Space',
								'' : space.name
							},
							{
								'Booking Details' : 'Room Name',
								'' : room.name
							},
							{
								'Booking Details' : 'Room Address',
								'' : space.address1 + '\n' + space.address2
										+ '\n' + space.city + '<br>'
							},
							{
								'Booking Details' : 'Booking Date',
								'' : bookingDate + ' ' + bookingMonth + ', '
										+ bookingYear
							},
							{
								'Booking Details' : 'Booking From',
								'' : bookingsstartTime
							},
							{
								'Booking Details' : 'Booking To:',
								'' : bookingsendTime
							},
							{
								'Booking Details' : 'Booked By',
								'' : booking.guestUser.first_name
							},
							{
								'Booking Details' : 'Please carry valid ID proof (Passport, Driver\'s License, Aadhar Card, Voter ID, PAN Card)'
							} ],
					columns : {
						// Optionally, customize the column widths
						customWidth : {
							item : '15%',
							description : '20%'
						},
						// Optionally, change column text alignment
						customAlignment : {
							description : 'right'
						}
					}
				},
				outro : '<b>Important: This booking receipt is not an invoice. The invoice of your booking can be collected at the Business Centre/Hotel/Co-working space as per your Booking summary.<b><br/>'
						+ 'Thank you for using <b>mymatchbox</b><br/><b>P.S. Need help with your booking? Contact us on : bookings@mymatchbox.in or call '
						+ config.support.phone + '</b>'
			},
			subject : 'Your Booking Confirmation' + ' ' + ' '
					+ booking.bookingConfirmationId
		}

		if (booking.isWalkin) {
			email.body.table.data.splice(6, 1);
		}

		if (roomType == 'Hot Desk' && booking.feature != 'Event Calendar') {
			email.body.table.data.splice(1, 1);
			var relatedBookedRooms = '';
			for (var i = 0; i < booking.relatedBookedRooms.length; i++) {
				if (relatedBookedRooms === '') {
					relatedBookedRooms = booking.relatedBookedRooms[i].name;
				} else {
					relatedBookedRooms = relatedBookedRooms + ', '
							+ booking.relatedBookedRooms[i].name;
				}
			}
			var relatedRoomsBooked = {
				'Booking Details' : 'Room Names',
				'' : relatedBookedRooms
			}
			var relatedRoomsBookedCapacity = {
				'Booking Details' : 'No. of Desks',
				'' : booking.relatedBookedRooms.length
			}
			email.body.table.data.push(1, 0, relatedRoomsBooked);
			email.body.table.data.push(2, 0, relatedRoomsBookedCapacity);
		}

		if (roomType == 'Hot Desk' || roomType == 'Training Room') {
			if (roomType == 'Hot Desk') {
				email.body.table.data.splice(2, 1);
			} else {
				email.body.table.data.splice(2, 1);
			}
			var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
							"Sep", "Oct", "Nov", "Dec" ];
			
			var bookingNewDate = new Date(booking.fromDate);
			var bookingMonth = months[bookingNewDate.getMonth()];
			var bookingDate = bookingNewDate.getDate();
			var bookingYear = bookingNewDate.getFullYear();
			
			var bookingEndNewDate = new Date(booking.endDate);
			var bookingEndMonth = months[bookingEndNewDate.getMonth()];
			var bookingEndDate = bookingEndNewDate.getDate();
			var bookingEndYear = bookingEndNewDate.getFullYear();
			
			var bookingFromDate = {
				'Booking Details' : 'Booking From Date',
				'' : bookingDate + ' ' + bookingMonth + ', '+ bookingYear
			}
			var bookingEndDate = {
				'Booking Details' : 'Booking End Date',
				'' : bookingEndDate + ' ' + bookingEndMonth + ', '+ bookingEndYear
			}
			if (roomType == 'Hot Desk') {
				email.body.table.data.push(4, 0, bookingFromDate);
				email.body.table.data.push(5, 0, bookingEndDate);
			} else {
				email.body.table.data.push(3, 0, bookingFromDate);
				email.body.table.data.push(4, 0, bookingEndDate);
			}
		}

		return email;
	},
	booking_cancellation : function(user, req, booking, bookingsstartTime,
			bookingsendTime, bookingMonth, bookingDate, bookingYear) {
		if (booking.room.roomtype.name == 'Hot Desk'
				|| booking.room.roomtype.name == 'Training Room') {
			var bookingsstartTime = booking.startTime;
		}
		if (booking.reasondescription != 'N/A') {
			var reason = booking.reasondescription;
		} else {
			var reason = booking.reason;
		}
		if (booking.status == 'TimedOut') {
			var reason = 'TimedOut';
		}
		var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
				"Sep", "Oct", "Nov", "Dec" ];
		var bookingNewDate = new Date(booking.bookingDate);
		var bookingMonth = months[bookingNewDate.getMonth()];
		var bookingDate = bookingNewDate.getDate();
		var bookingYear = bookingNewDate.getFullYear();
		var email = {
			body : {
				name : 'Hello ' + booking.user.first_name,
				intro : 'Your reservation for' + '		' + booking.room.name + '	'
						+ 'at ' + booking.space.name + ' ' + 'on '
						+ bookingMonth + ' ' + bookingDate + ',' + bookingYear
						+ ' at ' + bookingsstartTime + '	'
						+ 'has been cancelled.' + '<br/><br/><b>Reason:</b>'
						+ ' ' + reason,
				outro : '<b>Please see our Cancellation Policy for more details</b>'
						+ '<br/><br/>Thank you for using mymatchbox<br/><br/><b>P.S. Need help with your booking? Contact us on : admin@mymatchbox.in or call'
						+ config.support.phone + '</b>'
			},
			subject : 'Booking Cancelled'
		}
		return email;
	},
	
	booking_cancellation_admin : function(user, req, booking,
			bookingsstartTime, bookingsendTime, bookingMonth, bookingDate,
			bookingYear) {
		if (booking.reasondescription != 'N/A') {
			var reason = booking.reasondescription;
		} else {
			var reason = booking.reason;
		}
		var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
				"Sep", "Oct", "Nov", "Dec" ];
		var bookingNewDate = new Date(booking.bookingDate);
		var bookingMonth = months[bookingNewDate.getMonth()];
		var bookingDate = bookingNewDate.getDate();
		var bookingYear = bookingNewDate.getFullYear();
		var email = {
			body : {
				name : 'Hello ' + user.first_name,
				intro : 'Reservation for' + '     ' + booking.room.name + '   '
						+ 'at ' + booking.space.name + ' ' + 'on '
						+ bookingMonth + ' ' + bookingDate + ', ' + bookingYear
						+ ' at ' + bookingsstartTime + '    '
						+ 'has been cancelled.' + '<br/><br/><b>Reason:</b>'
						+ ' ' + reason
			},
			subject : 'Booking Cancelled'
		}
		return email;
	},
	
	booking_cancellation_guest : function(guestUser, req, booking,
			bookingsstartTime, bookingsendTime, bookingMonth, bookingDate,
			bookingYear) {
		if (booking.room.roomType.name == 'Hot Desk'
				|| booking.room.roomType.name == 'Training Room') {
			var bookingsstartTime = booking.startTime;
		}
		if (booking.reasondescription != 'N/A') {
			var reason = booking.reasondescription;
		} else {
			var reason = booking.reason;
		}
		if (booking.status == 'TimedOut') {
			var reason = 'TimedOut';
		}
		var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
				"Sep", "Oct", "Nov", "Dec" ];
		var bookingNewDate = new Date(booking.bookingDate);
		var bookingMonth = months[bookingNewDate.getMonth()];
		var bookingDate = bookingNewDate.getDate();
		var bookingYear = bookingNewDate.getFullYear();
		var email = {
			body : {
				name : 'Hello ' + guestUser.first_name,
				intro : 'Your reservation for' + '        ' + booking.room.name
						+ '   ' + 'at ' + booking.space.name + ' ' + 'on '
						+ bookingMonth + ' ' + bookingDate + ',' + bookingYear
						+ ' at ' + bookingsstartTime + '    '
						+ 'has been cancelled.' + '<br/><br/><b>Reason:</b>'
						+ ' ' + reason,
				outro : '<b>Please see our Cancellation Policy for more details</b>'
						+ 'Thank you for using mymatchbox<br/><b>P.S. Need help with your booking? Contact us on : admin@mymatchbox.in or call'
						+ config.support.phone + '</b>'
			},
			subject : 'Booking Cancelled'
		}
		return email;
	},
	booking_cancellation_partner_mail : function(user, req, booking,
			bookingsstartTime, bookingsendTime, bookingMonth, bookingDate,
			bookingYear) {
		if (booking.reasondescription != 'N/A') {
			var reason = booking.reasondescription;
		} else {
			var reason = booking.reason;
		}
		var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
				"Sep", "Oct", "Nov", "Dec" ];
		var bookingNewDate = new Date(booking.bookingDate);
		var bookingMonth = months[bookingNewDate.getMonth()];
		var bookingDate = bookingNewDate.getDate();
		var bookingYear = bookingNewDate.getFullYear();
		var email = {
			body : {
				name : 'Hello ' + booking.partner.first_name,
				intro : 'Reservation for' + '     ' + booking.room.name + '   '
						+ 'at ' + booking.space.name + ' ' + 'on '
						+ bookingMonth + ' ' + bookingDate + ', ' + bookingYear
						+ ' at ' + bookingsstartTime + '    '
						+ 'has been cancelled.' + '<br/><br/><b>Reason:</b>'
						+ ' ' + reason,
				outro : '<b>Please see our Cancellation Policy for more details</b>'
						+ '<br/><br/>Thank you for using mymatchbox<br/><br/><b>P.S. Need help with your booking? Contact us on : admin@mymatchbox.in or call'
						+ config.support.phone + '</b>'
			},
			subject : 'Booking Cancelled'
		}
		return email;
	},
	booking_unsuccessful : function(actor, room, space, booking,
			bookingsstartTime, bookingsendTime, roomType, retryBooking,
			timeout, url) {
		if (roomType == 'Hot Desk' || roomType == 'Training Room') {
			var bookingsstartTime = booking.startTime;
			var bookingsendTime = booking.endTime;
		}

		var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
				"Sep", "Oct", "Nov", "Dec" ];
		var bookingNewDate = new Date(booking.bookingDate);
		var bookingMonth = months[bookingNewDate.getMonth()];
		var bookingDate = bookingNewDate.getDate();
		var bookingYear = bookingNewDate.getFullYear();

		var email = {
			body : {

				// greeting: 'Thank you,',
				name : 'Hello	'
						+ actor.first_name
						+ '!'
						+ ' Your'
						+ ' '
						+ roomType
						+ '	 '
						+ 'booking is unsuccessful, please retry payment using link below',
				intro : '',
				action : {
					instructions : '<br/><p style="text-align:center">Click below to retry your booking.</p>',
					button : {
						color : 'green',
						text : 'View Booking',
						link : config.hostname + url + '&nord'
					}
				},
				table : {
					data : [
							{
								'Booking Details' : 'Space',
								'' : space.name
							},
							{
								'Booking Details' : 'Room Name',
								'' : room.name
							},
							{
								'Booking Details' : 'Room Address',
								'' : space.address1 + '\n' + space.address2
										+ '\n' + space.city + '<br>'
							},
							{
								'Booking Details' : 'Booking Date',
								'' : bookingDate + ' ' + bookingMonth + ', '
										+ bookingYear
							}, 
							{
								'Booking Details' : 'Booking From',
								'' : bookingsstartTime
							}, 
							{
								'Booking Details' : 'Booking To',
								'' : bookingsendTime
							}, 
							{
								'Booking Details' : 'Booked By',
								'' : booking.user.first_name
							} ],
					columns : {
						// Optionally, customize the column widths
						customWidth : {
							item : '25%',
							description : '25%'
						},
						// Optionally, change column text alignment
						customAlignment : {
							description : 'right'
						}
					}
				},
				outro : '<br/>'
						+ 'Thank you for using <b>mymatchbox</b><br/><br/><b>P.S. Need help with your booking? Contact us on : bookings@mymatchbox.in or call '
						+ config.support.phone + '</b>'
			},
			subject : 'Your unsuccessful booking'
		}

		if (roomType == 'Hot Desk') {
			email.body.table.data.splice(1, 1);
			var relatedBookedRooms = '';
			for (var i = 0; i < booking.relatedBookedRooms.length; i++) {
				if (relatedBookedRooms === '') {
					relatedBookedRooms = booking.relatedBookedRooms[i].name;
				} else {
					relatedBookedRooms = relatedBookedRooms + ', '
							+ booking.relatedBookedRooms[i].name;
				}
			}
			var relatedRoomsBooked = {
				'Booking Details' : 'Room Names',
				'' : relatedBookedRooms
			}
			var relatedRoomsBookedCapacity = {
				'Booking Details' : 'No. of Desks',
				'' : booking.relatedBookedRooms.length
			}
			email.body.table.data.push(1, 0, relatedRoomsBooked);
			email.body.table.data.push(2, 0, relatedRoomsBookedCapacity);
		}

		if (roomType == 'Hot Desk' || roomType == 'Training Room') {
			if (roomType == 'Hot Desk') {
				email.body.table.data.splice(2, 1);
			} else {
				email.body.table.data.splice(2, 1);
			}
			
			var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
							"Sep", "Oct", "Nov", "Dec" ];
			
			var bookingNewDate = new Date(booking.fromDate);
			var bookingMonth = months[bookingNewDate.getMonth()];
			var bookingDate = bookingNewDate.getDate();
			var bookingYear = bookingNewDate.getFullYear();
			
			var bookingEndNewDate = new Date(booking.endDate);
			var bookingEndMonth = months[bookingEndNewDate.getMonth()];
			var bookingEndDate = bookingEndNewDate.getDate();
			var bookingEndYear = bookingEndNewDate.getFullYear();
			
			var bookingFromDate = {
				'Booking Details' : 'Booking From Date',
				'' : bookingDate + ' ' + bookingMonth + ', '+ bookingYear
			}
			var bookingEndDate = {
				'Booking Details' : 'Booking End Date',
				'' : bookingEndDate + ' ' + bookingEndMonth + ', '+ bookingEndYear
			}
			if (roomType == 'Hot Desk') {
				email.body.table.data.push(4, 0, bookingFromDate);
				email.body.table.data.push(5, 0, bookingEndDate);
			} else {
				email.body.table.data.push(3, 0, bookingFromDate);
				email.body.table.data.push(4, 0, bookingEndDate);
			}
		}

		return email;
	},

	booking_unsuccessful_guest : function(actor, room, space, booking,
			bookingsstartTime, bookingsendTime, roomType, retryBooking,
			timeout, url) {
		var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
				"Sep", "Oct", "Nov", "Dec" ];
		var bookingNewDate = new Date(booking.bookingDate);
		var bookingMonth = months[bookingNewDate.getMonth()];
		var bookingDate = bookingNewDate.getDate();
		var bookingYear = bookingNewDate.getFullYear();

		var email = {
			body : {

				// greeting: 'Thank you,',
				name : 'Hello '
						+ actor.first_name
						+ '!'
						+ ' Your'
						+ ' '
						+ roomType
						+ '    '
						+ 'booking is unsuccessful, please retry payment using link below',
				intro : '',
				action : {
					instructions : '<br/><p style="text-align:center">Click below to retry your booking.</p>',
					button : {
						color : 'green',
						text : 'View Booking',
						link : config.hostname + url + '&nord'
					}
				//?search_lon=' +space.loc[0]+'&search_lat='+space.loc[1] + '&capacitymin='+booking.capacity+ '&capacitymax='+room.capacity+ '&start_time='+booking.bookingStartTime+ '&end_time='+bookingEndTime +'&roomType='+room.roomtype.name+'&place=''&from_date='+booking.bookingDate+'&end_date='+'&timeType='+'&dateselc='+booking.bookingDate+'&pageNo='
				},
				table : {
					data : [
							{
								'Booking Details' : 'Space',
								'' : space.name
							},
							{
								'Booking Details' : 'Room Name',
								'' : room.name
							},
							{
								'Booking Details' : 'Room Address',
								'' : space.address1 + '\n' + space.address2
										+ '\n' + space.city + '<br>'
							},
							{
								'Booking Details' : 'Booking Date',
								'' : bookingDate + ' ' + bookingMonth + ', '
										+ bookingYear
							}, 
							{
								'Booking Details' : 'Booking From',
								'' : bookingsstartTime
							}, 
							{
								'Booking Details' : 'Booking To',
								'' : bookingsendTime
							}, 
							{
								'Booking Details' : 'Booked By',
								'' : actor.first_name
							} ],
					columns : {
						// Optionally, customize the column widths
						customWidth : {
							item : '25%',
							description : '25%'
						},
						// Optionally, change column text alignment
						customAlignment : {
							description : 'right'
						}
					}
				},
				outro : '<br/>'
						+ 'Thank you for using <b>mymatchbox</b><br/><br/><b>P.S. Need help with your booking? Contact us on : bookings@mymatchbox.in or call '
						+ config.support.phone + '</b>'
			},
			subject : 'Your unsuccessful booking'
		}

		if (roomType == 'Hot Desk') {
			email.body.table.data.splice(1, 1);
			var relatedBookedRooms = '';
			for (var i = 0; i < booking.relatedBookedRooms.length; i++) {
				if (relatedBookedRooms === '') {
					relatedBookedRooms = booking.relatedBookedRooms[i].name;
				} else {
					relatedBookedRooms = relatedBookedRooms + ', '
							+ booking.relatedBookedRooms[i].name;
				}
			}
			var relatedRoomsBooked = {
				'Booking Details' : 'Room Names',
				'' : relatedBookedRooms
			}
			var relatedRoomsBookedCapacity = {
				'Booking Details' : 'No. of Desks',
				'' : booking.relatedBookedRooms.length
			}
			email.body.table.data.push(1, 0, relatedRoomsBooked);
			email.body.table.data.push(2, 0, relatedRoomsBookedCapacity);
		}

		if (roomType == 'Hot Desk' || roomType == 'Training Room') {
			if (roomType == 'Hot Desk') {
				email.body.table.data.splice(2, 1);
			} else {
				email.body.table.data.splice(2, 1);
			}
			
			var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
							"Sep", "Oct", "Nov", "Dec" ];
			
			var bookingNewDate = new Date(booking.fromDate);
			var bookingMonth = months[bookingNewDate.getMonth()];
			var bookingDate = bookingNewDate.getDate();
			var bookingYear = bookingNewDate.getFullYear();
			
			var bookingEndNewDate = new Date(booking.endDate);
			var bookingEndMonth = months[bookingEndNewDate.getMonth()];
			var bookingEndDate = bookingEndNewDate.getDate();
			var bookingEndYear = bookingEndNewDate.getFullYear();
			
			var bookingFromDate = {
				'Booking Details' : 'Booking From Date',
				'' : bookingDate + ' ' + bookingMonth + ', '+ bookingYear
			}
			var bookingEndDate = {
				'Booking Details' : 'Booking End Date',
				'' : bookingEndDate + ' ' + bookingEndMonth + ', '+ bookingEndYear
			}
			if (roomType == 'Hot Desk') {
				email.body.table.data.push(4, 0, bookingFromDate);
				email.body.table.data.push(5, 0, bookingEndDate);
			} else {
				email.body.table.data.push(3, 0, bookingFromDate);
				email.body.table.data.push(4, 0, bookingEndDate);
			}
		}

		return email;
	},
};
