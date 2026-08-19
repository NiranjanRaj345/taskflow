const mongoose = require('mongoose');
const crypto = require('crypto');

const teamInvitationSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    token: {
      type: String,
      unique: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

teamInvitationSchema.index({ team: 1, user: 1 });
teamInvitationSchema.index({ user: 1, status: 1 });

teamInvitationSchema.pre('save', async function (next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  if (!this.expiresAt) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    this.expiresAt = expires;
  }
  next();
});

module.exports = mongoose.model('TeamInvitation', teamInvitationSchema);
