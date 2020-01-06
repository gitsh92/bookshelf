/* eslint-disable object-shorthand, func-names */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Profile = require('./Profile');
const Avatar = require('./Avatar');

const { Schema } = mongoose;

const userSchema = new Schema({
  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  },
  name: {
    type: String,
    required: [true, 'A name is required.'],
    maxlength: [40, 'Your name cannot be greater than 40 characters.']
  },

  email: {
    type: String,
    required: [true, 'You must have an email to register.'],
    unique: true,
    validate: [validator.default.isEmail, 'Email is invalid'],
    maxlength: [100, 'Your email cannot be greater than 100 characters.']
  },
  password: {
    type: String,
    required: [true, 'Your account must have a password'],
    minlength: [8, 'Your password must be at least 8 characters.'],
    maxlength: [40, 'Your password cannot be greater than 40 characters.'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirmation needed.'],
    validate: {
      validator: function(pwc) {
        return pwc === this.password;
      },
      message: "Your passwords don't match."
    },
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  dateCreated: {
    type: Date,
    default: Date.now
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

userSchema.pre('save', function(next) {
  this.wasNew = this.isNew;
  next();
});

userSchema.pre('save', async function(next) {
  // skip middleware if password was not modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // ensures new auth token gets issued after password changed
  next();
});

userSchema.post('save', async function(doc, next) {
  if (this.wasNew) {
    await Profile.create({
      user: doc._id,
      firstName: doc.name
    });
  }
  next();
});

userSchema.post('remove', async function(doc, next) {
  const profile = await Profile.findById(doc.profile);
  profile.remove();
  next();
});

userSchema.methods.correctPassword = async function(
  submittedPassword,
  userPassword
) {
  return bcrypt.compare(submittedPassword, userPassword);
};

// jwt iat timestamp in seconds
userSchema.methods.changedPasswordAfterTokenIssued = function(tokenTimestamp) {
  if (this.passwordChangedAt) {
    // timestamp for password change date in milliseconds
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime(), 10);

    return tokenTimestamp * 1000 < changedTimestamp;
  }
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); // TODO: make asynchronous with promisify??

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // expires in 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
