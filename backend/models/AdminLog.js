import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_BAN',
      'USER_UNBAN',
      'USER_VERIFY',
      'LISTING_DELETE',
      'LISTING_APPROVE',
      'REPORT_RESOLVE',
      'IMPERSONATE_USER',
      'SYSTEM_CONFIG_UPDATE',
      'SEND_ANNOUNCEMENT',
      'DELETE_POST'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: ['User', 'Listing', 'Report', 'System']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  details: {
    type: Object, // Flexible field for storing relevant changes (e.g., { reason: "spam" })
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for quick lookup of logs by admin or target
adminLogSchema.index({ admin: 1, createdAt: -1 });
adminLogSchema.index({ targetId: 1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

export default AdminLog;
