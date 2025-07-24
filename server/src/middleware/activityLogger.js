const activityLogService = require('../services/activityLogService');

/**
 * Create a middleware for logging activities
 * @param {Object} options - Logger options
 * @param {string} options.action - Action to log (must match ActivityLog schema enum)
 * @param {Function} [options.getDescription] - Function to generate description (receives req object)
 * @param {Function} [options.getDetails] - Function to generate additional details (receives req object)
 * @param {Function} [options.getResourceId] - Function to get related resource ID (receives req object)
 * @param {string} [options.resourceModel] - Name of the related resource model
 * @returns {Function} Express middleware
 */
const createActivityLogger = ({
  action,
  getDescription,
  getDetails,
  getResourceId,
  resourceModel
}) => {
  return async (req, res, next) => {
    // Store the original end function
    const originalEnd = res.end;

    // Override the end function
    res.end = async function(...args) {
      try {
        const userId = req.user?._id;
        const username = req.user?.username;

        // Skip logging if no user is authenticated
        if (!userId || !username) {
          return originalEnd.apply(res, args);
        }

        const description = typeof getDescription === 'function'
          ? getDescription(req)
          : `User ${username} performed ${action}`;

        const details = typeof getDetails === 'function'
          ? getDetails(req)
          : {};

        const resourceId = typeof getResourceId === 'function'
          ? getResourceId(req)
          : undefined;

        // Get status based on response
        const status = res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS';

        await activityLogService.logActivity({
          userId,
          username,
          action,
          description,
          details,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          resourceId,
          resourceModel,
          status
        });
      } catch (error) {
        // Log error but don't block the response
        console.error('Error in activity logger middleware:', error);
      }

      // Call the original end function
      originalEnd.apply(res, args);
    };

    next();
  };
};

/**
 * Helper function to create an activity logger for authentication actions
 */
const authActivityLogger = (action) => createActivityLogger({
  action,
  getDescription: (req) => `User ${req.body.username || 'unknown'} attempted ${action.toLowerCase()}`,
  getDetails: (req) => ({
    username: req.body.username,
    success: true, // This will be overridden by status based on response code
    ip: req.ip
  }),
  resourceModel: 'User'
});

/**
 * Helper function to create an activity logger for blog post actions
 */
const blogPostActivityLogger = (action) => createActivityLogger({
  action,
  getDescription: (req) => `User ${req.user.username} ${action.toLowerCase()} blog post`,
  getResourceId: (req) => req.params.id || req.body.postId,
  getDetails: (req) => ({
    postId: req.params.id || req.body.postId,
    changes: req.body
  }),
  resourceModel: 'BlogPost'
});

module.exports = {
  createActivityLogger,
  authActivityLogger,
  blogPostActivityLogger
};
