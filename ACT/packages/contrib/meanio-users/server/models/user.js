'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('lodash');
var softremove = require('mongoose-soft-remove');

/**
 * Validations
 */
var validatePresenceOf = function(value) {
    // If you are authenticating by any of the oauth strategies, don't validate.
    return (this.provider && this.provider !== 'local') || (value && value.length);
};

var validateUniqueEmail = function(value, callback) {
    var User = mongoose.model('User');
    User.find({
        $and: [{
            email: {
                $regex: new RegExp(value, 'i')
            }
        }, {
            _id: {
                $ne: this._id
            }
        }]
    }, function(err, user) {
        callback(err || user.length === 0);
    });
};

/**
 * Getter
 */
var escapeProperty = function(value) {
    return _.escape(value);
};

/**
 * User Schema
 */

var UserSchema = new Schema({
    firstname: {
        type: String,
        trim: true,
        get: escapeProperty
    },
    lastname: {
        type: String,
        trim: true,
        get: escapeProperty
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: [validateUniqueEmail, 'Email already exists']
    },
    roles: [],
    hashed_password: {
        type: String,
        validate: [validatePresenceOf, 'Password cannot be blank']
    },
    locations: [{
        type: Schema.ObjectId
    }],
    buildings: [{
        type: Schema.ObjectId
    }],
    trainings: [{
        type: Schema.ObjectId
    }],
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },
    role: {
        type: Schema.ObjectId,
        ref: 'Role'
    },
    addressLine1: {
        type: String,
        trim: true
    },
    addressLine2: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    pin: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    },
    firstLogin: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    provider: {
        type: String,
        default: 'local'
    },
    profile: {
        DOB: Date,
        phone: String
    },
    title:{
    	type:String
    },
    profileImage : {
        type: String
    },
    confirmationToken: String,

    salt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    facebook: {},
    twitter: {},
    github: {},
    google: {},
    linkedin: {}

});

/**
 * Enabling soft delete
 * Added pre-remove hook to change the email of the user so that it will be available for re-use.
 * To undo soft-delete and restore user use the 'revive' function and NOT 'restore'.
 */
UserSchema.plugin(softremove);

UserSchema.pre('remove', function(next) {
    this.email = 'removed;;' + new Date().getTime() + ';;' + this.email;
    next();
});

UserSchema.statics.revive = function(user, callback) {
    var userEmail = user.email.split(';;').pop();
    this.find({
        email: {
            $regex: new RegExp(userEmail, 'i')
        }
    }, function(err, data) {
        if (err) {
            callback(err, null);
        }
        if (data.length > 0) {
            callback(new Error('Email is already in use.'), null);
        } else {
            user.restore(function() {
                user.update({
                    email: userEmail,
                }, callback);
            });
        }
    });
};

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.hashPassword(password);
}).get(function() {
    return this._password;
});

/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
        return next(new Error('Invalid password'));
    next();
});

/**
 * Methods
 */

/**
 * HasRole - check if the user has required role
 *
 * @param {String} plainText
 * @return {Boolean}
 * @api public
 */
UserSchema.methods.hasRole = function(role) {
    var roles = this.roles;
    return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
};

/**
 * IsAdmin - check if the user is an administrator
 *
 * @return {Boolean}
 * @api public
 */
UserSchema.methods.isAdmin = function() {
    return this.roles.indexOf('admin') !== -1;
};

/**
 * Authenticate - check if the passwords are the same
 *
 * @param {String} plainText
 * @return {Boolean}
 * @api public
 */
UserSchema.methods.authenticate = function(plainText) {
    return this.hashPassword(plainText) === this.hashed_password;
};

/**
 * Make salt
 *
 * @return {String}
 * @api public
 */
UserSchema.methods.makeSalt = function() {
    return crypto.randomBytes(16).toString('base64');
};

/**
 * Hash password
 *
 * @param {String} password
 * @return {String}
 * @api public
 */
UserSchema.methods.hashPassword = function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
};

/**
 * Hide security sensitive fields
 *
 * @returns {*|Array|Binary|Object}
 */
UserSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
};

UserSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).populate('company').populate('role').exec(callback);
};

mongoose.model('User', UserSchema);