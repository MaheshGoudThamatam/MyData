'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Loan.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

module.exports = function(Loan, app, auth, database) {

 var Loancontroller = require('../controllers/loan')(Loan, app);

  app.route('/api/loans/createloan').get(Loancontroller.createloan);
  app.route('/api/loans/retreiveparticulerloan').get(Loancontroller.getpartculerloan);
  app.route('/api/loans/approveloan').get(Loancontroller.approveloan);
  app.route('/api/loans/rejectloan').get(Loancontroller.rejectloan);
  app.route('/api/loans/undoapproval').get(Loancontroller.undoapproval);


};
