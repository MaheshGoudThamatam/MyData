'use strict';

var sha512 = require('js-sha512');

module.exports = {
    getPayUMoneyPayload: function (booking,user) {
        var surl = 'http://localhost:3000/api/payment/payumoney/success';
        var furl = 'http://localhost:3000/api/payment/payumoney/failure';
        var curl = 'http://localhost:3000/api/payment/payumoney/cancle';
        var marchentKey = 'tXHkfWEU';
        var salt='BykDHa4qBj';
        var txnid = booking._id;
        var amount = booking.price;
        var produnctInfo = 'Booking for room';
        var firstname = user.first_name;
        var email = user.email;
        var phone = '123423233';
        var service_provider = 'payu_paisa';
        var string = marchentKey + '|' + txnid + '|' + amount + '|' + produnctInfo + '|' + firstname + '|' + email + '|||||||||||' + salt;
        var hash = sha512.sha512(string);
        var data = {
            hash: hash,
            key: marchentKey,
            txnid: txnid,
            amount: amount,
            productinfo: produnctInfo,
            firstname: firstname,
            email: email,
            phone: phone,
            surl: surl,
            furl: furl,
            curl: curl,
            service_provider: service_provider
        };
        return data;
    }
};