import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Create axios instance with auth header
const createAuthConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

/**
 * Get all threads for the current user
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Threads data with pagination
 */
export const getThreads = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_URL}/threads?page=${page}&limit=${limit}`, createAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching threads:', error);
    throw error;
  }
};

/**
 * Get a single thread with details
 * @param {string} threadId - The ID of the thread
 * @returns {Promise<Object>} Thread details
 */
export const getThread = async (threadId) => {
  try {
    const response = await axios.get(`${API_URL}/threads/${threadId}`, createAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching thread:', error);
    throw error;
  }
};

/**
 * Create a new thread or get existing one
 * @param {Object} data - Thread creation data
 * @param {string} data.type - 'dm', 'listing', or 'group'
 * @param {Array} data.participantIds - Array of user IDs
 * @param {string} [data.listingId] - Optional listing ID
 * @param {string} [data.groupId] - Optional group ID
 * @returns {Promise<Object>} The created/found thread
 */
export const createThread = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/threads`, data, createAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

/**
 * Get messages for a specific thread
 * @param {string} threadId - The ID of the thread
 * @param {string} [cursor] - Timestamp cursor for pagination
 * @param {number} [limit] - Number of messages to fetch
 * @returns {Promise<Object>} Messages data
 */
export const getMessages = async (threadId, cursor = null, limit = 50) => {
  try {
    let url = `${API_URL}/messages/${threadId}?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    const response = await axios.get(url, createAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a message to a thread
 * @param {string} threadId - The ID of the thread
 * @param {string} content - The message content
 * @param {Array} [attachments] - Optional array of attachment IDs
 * @param {Object} [metadata] - Optional metadata
 * @returns {Promise<Object>} The created message object
 */
export const sendMessage = async (threadId, content, attachments = [], metadata = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/messages`,
      { threadId, content, attachments, metadata },
      createAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark a thread as read
 * @param {string} threadId - The ID of the thread
 * @returns {Promise<Object>} Success response
 */
export const markThreadRead = async (threadId) => {
  try {
    const response = await axios.put(
      `${API_URL}/threads/${threadId}/read`,
      {},
      createAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error marking thread as read:', error);
    throw error;
  }
};

/**
 * Get unread message count (global)
 * @returns {Promise<number>} Number of unread messages
 */
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages/unread/count`, createAuthConfig());
    return response.data.count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};



/**
 * Block a user
 * @param {string} userId - ID of the user to block
 * @returns {Promise<Object>} Success response
 */
export const blockUser = async (userId) => {
  try {
    const response = await axios.post(`${API_URL}/users/${userId}/block`, {}, createAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

/**
 * Unblock a user
 * @param {string} userId - ID of the user to unblock
 * @returns {Promise<Object>} Success response
 */
export const unblockUser = async (userId) => {
  try {
    const response = await axios.post(`${API_URL}/users/${userId}/unblock`, {}, createAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};

/**
 * Report a user
 * @param {string} userId - ID of the user to report
 * @param {Object} data - Report data
 * @param {string} data.reason - Reason for reporting
 * @param {string} data.description - Description of the issue
 * @returns {Promise<Object>} The created report
 */
export const reportUser = async (userId, data) => {
  try {
    const response = await axios.post(`${API_URL}/users/${userId}/report`, data, createAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error reporting user:', error);
    throw error;
  }
};

/**
 * Upload a file
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} The uploaded attachment
 */
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const config = createAuthConfig();
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(`${API_URL}/uploads`, formData, config);
    return response.data.attachment;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export default {
  getThreads,
  getThread,
  createThread,
  getMessages,
  sendMessage,
  markThreadRead,
  getUnreadCount,
  blockUser,
  unblockUser,
  reportUser,
  uploadFile,
};
