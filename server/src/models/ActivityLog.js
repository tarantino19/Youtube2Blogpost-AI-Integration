const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'REGISTER', 'UPDATE_PROFILE', 'CREATE_POST', 'UPDATE_POST', 'DELETE_POST', 'PROCESS_VIDEO', 'EXPORT_POST', 'UPDATE_SETTINGS', 'CREDIT_CHANGE']
  },
  description: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    // This can reference any model (User, BlogPost, etc.)
    refPath: 'resourceModel'
  },
  resourceModel: {
    type: String,
    enum: ['User', 'BlogPost'],
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'PENDING'],
    default: 'SUCCESS'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ username: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;