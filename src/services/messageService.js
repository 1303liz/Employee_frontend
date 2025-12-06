import api from './api';

const messageService = {
  // Get all conversations for the current user
  getConversations: async () => {
    const response = await api.get('/api/messaging/conversations/');
    return response.data;
  },

  // Get messages in a specific conversation
  getMessages: async (conversationId) => {
    const response = await api.get(`/api/messaging/conversations/${conversationId}/messages/`);
    return response.data;
  },

  // Send a new message
  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/api/messaging/conversations/${conversationId}/messages/`, {
      content
    });
    return response.data;
  },

  // Start a new conversation
  startConversation: async (participantIds, subject) => {
    const response = await api.post('/api/messaging/conversations/', {
      participants: participantIds,
      subject
    });
    return response.data;
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    const response = await api.patch(`/api/messaging/messages/${messageId}/`, {
      is_read: true
    });
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/api/messaging/unread-count/');
    return response.data;
  },

  // Get all employees (for starting new conversations)
  getEmployees: async () => {
    const response = await api.get('/api/employees/');
    return response.data;
  }
};

export default messageService;
