const ActivityLog = require('../models/ActivityLog');

/**
 * Service for logging user activities
 */
const activityLogService = {
  /**
   * Log a user activity
   * @param {Object} params Activity log parameters
   * @param {string} params.userId - User ID
   * @param {string} params.username - Username
   * @param {string} params.action - Action performed (must match enum in schema)
   * @param {string} params.description - Human readable description of the action
   * @param {Object} [params.details] - Additional details about the action
   * @param {string} [params.ipAddress] - IP address of the user
   * @param {string} [params.userAgent] - User agent string
   * @param {string} [params.resourceId] - ID of the related resource (if any)
   * @param {string} [params.resourceModel] - Model name of the related resource
   * @param {string} [params.status='SUCCESS'] - Status of the action
   * @returns {Promise<Object>} Created activity log entry
   */
  async logActivity({
    userId,
    username,
    action,
    description,
    details = {},
    ipAddress,
    userAgent,
    resourceId,
    resourceModel,
    status = 'SUCCESS'
  }) {
    try {
      const activityLog = new ActivityLog({
        userId,
        username,
        action,
        description,
        details,
        ipAddress,
        userAgent,
        resourceId,
        resourceModel,
        status
      });

      await activityLog.save();
      return activityLog;
    } catch (error) {
      console.error('Error logging activity:', error);
      // We don't want to throw here as logging failure shouldn't break the main flow
      return null;
    }
  },

  /**
   * Get activity logs for a specific user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} [options.limit=50] - Maximum number of logs to return
   * @param {number} [options.skip=0] - Number of logs to skip
   * @param {string} [options.action] - Filter by specific action
   * @param {string} [options.startDate] - Start date for filtering
   * @param {string} [options.endDate] - End date for filtering
   * @returns {Promise<Object[]>} Array of activity logs
   */
  async getUserActivities(userId, {
    limit = 50,
    skip = 0,
    action,
    startDate,
    endDate
  } = {}) {
    try {
      const query = { userId };

      if (action) {
        query.action = action;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      const logs = await ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return logs;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  },

  /**
   * Get system-wide activity logs (admin only)
   * @param {Object} options - Query options
   * @param {number} [options.limit=50] - Maximum number of logs to return
   * @param {number} [options.skip=0] - Number of logs to skip
   * @param {string} [options.username] - Filter by username
   * @param {string} [options.action] - Filter by specific action
   * @param {string} [options.startDate] - Start date for filtering
   * @param {string} [options.endDate] - End date for filtering
   * @returns {Promise<Object[]>} Array of activity logs
   */
  async getSystemActivities({
    limit = 50,
    skip = 0,
    username,
    action,
    startDate,
    endDate
  } = {}) {
    try {
      const query = {};

      if (username) {
        query.username = username;
      }

      if (action) {
        query.action = action;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      const logs = await ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return logs;
    } catch (error) {
      console.error('Error fetching system activities:', error);
      throw error;
    }
  },

  /**
   * Delete old activity logs
   * @param {number} daysToKeep - Number of days to keep logs for
   * @returns {Promise<Object>} Deletion result
   */
  async cleanupOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await ActivityLog.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      return result;
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      throw error;
    }
  }
};

module.exports = activityLogService;