'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('lodash');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

/**
 * Validations
 */
var validatePresenceOf = function (value) {
    // If you are authenticating by any of the oauth strategies, don't validate.
    return (this.provider && this.provider !== 'local') || (value && value.length);
};

var validateUniqueEmail = function (value, callback) {
    var User = mongoose.model('User');
    User.find({
        $and: [
            {
                email: value
            },
            {
                _id: {
                    $ne: this._id
                }
            }
        ]
    }, function (err, user) {
        callback(err || user.length === 0);
    });
};

var validateUniqueUserName = function (value, callback) {
    var User = mongoose.model('User');
    User.find({
        $and: [
            {
                username: { $regex: new RegExp('/^' + value + '$/', "i") }
            },
            {
                _id: {
                    $ne: this._id
                }
            }
        ]
    }, function (err, role) {
        callback(err || role.length === 0);
    });
};

/**
 * Getter
 */
var escapeProperty = function (value) {
    return _.escape(value);
};

/**
 * User Schema
 */

var UserSchema = new Schema({

    name: {
        type: String,
        required: true,
        get: escapeProperty
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,

        // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
        /* match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],*/

        validate: [validateUniqueEmail, 'E-mail address is already in-use']
    },
    username: {
        type: String,
        unique: true,
        required: true,
        get: escapeProperty,
        validate: [validateUniqueUserName, 'User name is already in-use']
    },

    roles: {
        type: Array,
        default: ['authenticated', 'anonymous']
    },
    skills: {
        type: [
            {type: Schema.ObjectId, ref: 'Skill'}
        ]
    },
    role: {
        type: [
            {type: Schema.ObjectId, ref: 'Role'}
        ]
    },

    profilePicture: {
        type: String
    },
    qualification_details: {
        type: [
            {type: Schema.ObjectId, ref: 'QualificationDetail'}
        ]
    },

    Resume: {
        type: String
    },

    additional_documents: {
        type: [
            {type: Schema.ObjectId, ref: 'AdditionalDocument'}
        ]
    },
    experience_details: {
        type: [
            {type: Schema.ObjectId, ref: 'ExperienceDetail'}
        ]
    },
    references: {
        type: [
            {type: Schema.ObjectId, ref: 'Reference'}
        ]
    },
    address: {
        type: [
            {type: Schema.ObjectId, ref: 'Address'}
        ]
    },
    country: {
        type: [
            {type: Schema.ObjectId, ref: 'Country'}
        ]
    },
    zone: {
        type: [
            {type: Schema.ObjectId, ref: 'Zone'}
        ]
    },
    city: {
        type: [
            {type: Schema.ObjectId, ref: 'City'}
        ]
    },
    branch: {
        type: [
            {type: Schema.ObjectId, ref: 'Branch'}
        ]
    },

    hashed_password: {
        type: String,
        validate: [validatePresenceOf, 'Password cannot be blank']
    },
    provider: {
        type: String,
        default: 'local'
    },
    salt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profile: {},
    facebook: {},
    twitter: {},
    github: {},
    google: {},
    linkedin: {},
    socialAccounts: [],
    confirmed: {
        type: Boolean,
        default: false
    },
    confirmationToken: String,
    confirmationExpires: Date,

    confirmedAt: Date,
    userType: {
        type: String
    },
    gender: {
        type: String,
        default: 'male'
    },
    dob: {
        type: Date
    },
    country_user: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    thumbprofilePicture: {
        type: String
    },
    thumb150profilePicture: {
        type: String
    },
    hobbies: {
        type: String
    },
    isMentor: {
        type: Boolean,
        default: false
    },
    project: {
        type: Schema.ObjectId,
        ref: 'Mentorproject'
    },
    phonePre: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    form_submitted: {
        type: Boolean,
        default: false
    },
    profileUpdated: {
        type: Boolean,
        default: false
    }
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.hashPassword(password);
}).get(function () {
    return this._password;
});
UserSchema.statics.loadUserByToken = function (token, callback) {
    this.findOne({
        confirmationToken: token
    }).exec(callback);
};

/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
    if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
        return next(new Error('Invalid password'));
    next();
});

/**
 * Methods
 */
UserSchema.methods = {

    /**
     * HasRole - check if the user has required role
     *
     * @param {String}
     *            plainText
     * @return {Boolean}
     * @api public
     */
    hasRole: function (role) {
        var roles = this.roles;
        return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
    },

    /**
     * IsAdmin - check if the user is an administrator
     *
     * @return {Boolean}
     * @api public
     */
    isAdmin: function () {
        return this.roles.indexOf('admin') !== -1;
    },

    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String}
     *            plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function (plainText) {
        return this.hashPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function () {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Hash password
     *
     * @param {String}
     *            password
     * @return {String}
     * @api public
     */
    hashPassword: function (password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    },

    /**
     * Hide security sensitive fields
     *
     * @returns {*|Array|Binary|Object}
     */
    toJSON: function () {
        var obj = this.toObject();
        delete obj.hashed_password;
        delete obj.salt;
        return obj;
    }

};

UserSchema.plugin(deepPopulate, {whitelist: [
    'role',
    'role.features',
    'role.features.feature',
    'role.features.feature.name'
]});

UserSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('role', 'name').deepPopulate('role.features.feature', 'name', 'url').populate('qualification_details', 'examination')
        .populate('country', 'countryName').exec(callback);
};
UserSchema.statics.loadUser = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('qualification_details', 'examination').populate('role', 'name').deepPopulate('role.features.feature', 'name', 'url').populate('country', 'countryName').exec(callback);
};
UserSchema.statics.filterByRole = function (id, callback) {
    this.find({
        role: {$elemMatch: {$in: [id] }}
    }).populate('role', 'name').exec(callback);
};

UserSchema.statics.filterByCountry = function (id, callback) {
    this.find({
        country: {$elemMatch: {$in: [id] }}
    }).populate('role', 'name').populate('country', 'name').exec(callback);
};

UserSchema.statics.filterByZone = function (id, callback) {
    this.find({
        zone: {$elemMatch: {$in: [id] }}
    }).populate('role', 'name').populate('zone', 'name').exec(callback);
};

UserSchema.statics.filterByCity = function (id, callback) {
    this.find({
        city: {$elemMatch: {$in: [id] }}
    }).populate('role', 'name').populate('city', 'name').exec(callback);
};

UserSchema.statics.filterByBranch = function (id, callback) {
    this.find({
        branch: {$elemMatch: {$in: [id] }}
    }).populate('role', 'name').populate('branch', 'name').exec(callback);
};

UserSchema.statics.loadUserBasedonSkills = function (ids, callback) {
     this.find({
        skills: { 
            $in : ids 
        } 
    }).populate('skill').sort({ name: 'asc' }).exec(callback);
};

mongoose.model('User', UserSchema);
