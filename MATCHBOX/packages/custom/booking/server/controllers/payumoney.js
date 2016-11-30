'use strict';

//require('../../../../../config/env/development.js');
var sha512 = require('js-sha512'),
config = require('meanio').loadConfig();

module.exports = {
	getPayUMoneyPayload : function(booking, user) {
		var surl = config.hostname +'/api/payment/payumoney/success';
		var furl = config.hostname + '/api/payment/payumoney/failure';
		var curl = config.hostname + '/api/payment/payumoney/cancle';
		var sMobileurl=config.hostname +'/api/payment/payumoneyMobile/success';
		var fMobileurl=config.hostname +'/api/payment/payumoneyMobile/failure';
     	var marchentKey = config.payUMoney.merchantKey;
		var salt = config.payUMoney.salt;
		var txnid = booking._id;
		var amount = booking.price;
		var produnctInfo = 'Booking for room';
		var firstname = user.first_name;
		var email = user.email;
		var phone = user.phone;
		var service_provider =config.payUMoney.service_provider;
		var string = marchentKey + '|' + txnid + '|' + amount + '|'
				+ produnctInfo + '|' + firstname + '|' + email + '|||||||||||'
				+ salt;
		var hash = sha512.sha512(string);
		var data = {
			hash : hash,
			key : marchentKey,
			txnid : txnid,
			amount : amount,
			productinfo : produnctInfo,
			firstname : firstname,
			email : email,
			phone : phone,
			surl : surl,
			furl : furl,
			curl : curl,
			service_provider : service_provider
		};
		return data;
	}
};