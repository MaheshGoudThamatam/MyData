'use strict';

module.exports = function (Payment, app, auth, database) {

    var paymentCtrl = require('../controllers/payment')(Payment);

    app.route('/api/payment/payumoney/success')
        .post(paymentCtrl.successPayUMoney);

    app.route('/api/payment/payumoney/failure')
        .post(paymentCtrl.failurePayUMoney);

    app.route('/api/payment/payumoney/cancel')
        .post(paymentCtrl.cancelPayUMoney);
};
