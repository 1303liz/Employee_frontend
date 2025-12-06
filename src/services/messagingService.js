import api from './api';

const messagingService = {
  // Messages
  getInbox: async () => {
    const response = await api.get('/messaging/messages/inbox/');
    return response.data;
  },

  getSentMessages: async () => {
    const response = await api.get('/messaging/messages/sent/');
    return response.data;
  },

  getMessage: async (messageId) => {
    const response = await api.get(`/messaging/messages/${messageId}/`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/messaging/messages/', messageData);
    return response.data;
  },

  replyToMessage: async (messageId, replyData) => {
    const response = await api.post(`/messaging/messages/${messageId}/reply/`, replyData);
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await api.post(`/messaging/messages/${messageId}/mark_read/`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/messaging/messages/unread_count/');
    return response.data;
  },

  getContacts: async () => {
    const response = await api.get('/messaging/messages/contacts/');
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messaging/messages/${messageId}/`);
    return response.data;
  },

  getMessageThread: async (messageId) => {
    const response = await api.get(`/messaging/messages/${messageId}/thread/`);
    return response.data;
  },

  // Announcements
  getAnnouncements: async () => {
    const response = await api.get('/messaging/announcements/');
    return response.data;
  },

  getActiveAnnouncements: async () => {
    const response = await api.get('/messaging/announcements/active/');
    return response.data;
  },

  createAnnouncement: async (announcementData) => {
    const response = await api.post('/messaging/announcements/', announcementData);
    return response.data;
  },

  updateAnnouncement: async (announcementId, announcementData) => {
    const response = await api.put(`/messaging/announcements/${announcementId}/`, announcementData);
    return response.data;
  },

  deleteAnnouncement: async (announcementId) => {
    const response = await api.delete(`/messaging/announcements/${announcementId}/`);
    return response.data;
  },
};

export default messagingService;
