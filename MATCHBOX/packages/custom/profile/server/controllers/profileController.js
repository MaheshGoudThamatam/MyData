'use strict';
require('../../../plugNplay/server/models/plugNplay.js');
require('../../../role/server/models/role.js');
require('../../../../core/users/server/models/user.js');
var mongoose = require('mongoose'),
	 nodemailer = require('nodemailer'), 
	    templates = require('../template'), 
	    config = require('meanio').loadConfig(),
	    RoleModel = mongoose.model('Role'),
	    UserModel = mongoose.model('User'),
	    Mailgen = require('mailgen'),
	    mail = require('../../../../core/system/server/services/mailService.js'),
	    async = require('async'),
       _ = require('lodash');





module.exports = function(profile) {
	return {
		contactPage:function (req, res) {
			var data = req.body;
			var emailConfigArr = config.email_config('contactUs');

			for (var i = 0; i < emailConfigArr.length; i++) {
					if(emailConfigArr[i].city == 'All'){
				for (var j = 0; j < emailConfigArr[i].emails.length; j++) {
							var user_name = emailConfigArr[i].emails[j].name;
							var user = emailConfigArr[i].emails[j].email_addr;
							var email = templates.contact_page(data, user_name);
							mail.mailService(email,user);
					}
				}
			}

			// 	var user = "rajesh.kumaravel+support@tarento.com";
			// 	var email = templates.contact_page(data);
			// 	mail.mailService(email,user)
			// }





				res.send(200);
	  	}
	}

}
