'use strict';

module.exports = {
    forgot_password_email: function (user, req, token, mailOptions) {
        mailOptions.html = [
            
            'Forgot your password ?',
            'We have received a request to reset the password for this e-mail address.',
            'To reset your password please click on the below link:',
            '<a href="http://' + req.headers.host + '/reset/' + token+'" >Click here</a>',
            'This link will take you to a secure page where you can change your password.',
            'If you don’t want to reset the password, please ignore this message. Your password  will not be reset.',
            'Thanks and Regards',
            'CodersTrust'
        ].join('<br><br>');
        mailOptions.subject = 'Resetting the password';
        mailOptions.createTextFromHtml= true;
        return mailOptions;
    },
    verification_email: function (user, req, token, mailOptions) {
        mailOptions.html = [
                'Dear ' + user.name + ',',
            'Thank you for signing up with CodersTrust. We are delighted to have you with us.',
            'To be able to sign in to your account, please verify your email address first by clicking the following link:',
            '<a href="http://' + req.headers.host + '/api/user/confirm/' + token+'" >Click here</a>',
            
            'Thanks,',
            'Team CodersTrust'
        ].join('<br><br>');
        mailOptions.createTextFromHtml= true;
        mailOptions.subject = 'CodersTrust: User confirmation email';
        return mailOptions;
    },
    admin_create_user_email: function (user, req, token, mailOptions) {
        mailOptions.html = [
                'Dear ' + user.name + ',',
            'Your account at CodersTrust has been created. Before you can login, you will need to choose a new password.',
            'To set your password please click on the below link:',
            '<a href="http://' + req.headers.host + '/reset/' + token+'" >Click here</a>',
            'This link will take you to a secure page where you can set your password.',
            'Thanks and Regards',
            'CodersTrust'
        ].join('<br><br>');
        mailOptions.subject = 'Your new CodersTrust account';
        mailOptions.createTextFromHtml= true;
        return mailOptions;
    },
    verification_email_change: function (user, req, token, mailOptions) {
        mailOptions.html = [
                'Dear ' + user.name + ',',
            'Your email account in the CodersTrust account has been changed.',
            'You will need to confirm your email address again before you will be able to login . To confirm this email please click on the link below:',
            '<a href="http://' + req.headers.host + '/api/user/confirm/' + token+'" >Click here</a>',
            
            'Thanks,',
            'Team CodersTrust'
        ].join('<br><br>');
        mailOptions.createTextFromHtml= true;
        mailOptions.subject = 'CodersTrust: User confirmation email';
        return mailOptions;
    },
};
