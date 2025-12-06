# Messaging System Documentation

## Overview
The messaging system allows employees to communicate with each other and HR to broadcast announcements to all employees.

## Features

### 1. Direct Messaging
- **Send Messages**: Employees can send direct messages to any other employee
- **Inbox**: View received messages with unread indicators
- **Sent Messages**: View all sent messages
- **Message Threads**: View conversation history with replies
- **Reply to Messages**: Reply directly to received messages
- **Delete Messages**: Remove messages from inbox or sent folder
- **Search**: Search messages by subject, content, or sender/recipient

### 2. Announcements (HR Only)
- **Create Announcements**: HR can broadcast messages to all employees
- **Priority Levels**: 
  - **Urgent** (Red): Critical announcements
  - **High** (Orange): Important announcements
  - **Normal** (Blue): Regular announcements
  - **Low** (Gray): Informational announcements
- **Manage Announcements**: Edit or delete existing announcements
- **View History**: See all past announcements

## Components

### User Components

#### Inbox (`Inbox.jsx`)
- Displays all received messages
- Shows unread count badge
- Filter by unread messages
- Search functionality
- Click to view message thread

#### ComposeMessage (`ComposeMessage.jsx`)
- Select recipient from employee list
- Search/filter employees by name or department
- Enter subject and message body
- Character counter for message body
- Send or cancel message

#### MessageView (`MessageView.jsx`)
- View complete message thread
- See all replies in chronological order
- Reply to messages inline
- Delete message option
- Navigate back to inbox

#### SentMessages (`SentMessages.jsx`)
- View all sent messages
- See recipient and date
- View reply count
- Search sent messages
- Delete sent messages

#### Announcements (`Announcements.jsx`)
- View all active announcements
- Color-coded by priority
- Shows author and timestamp
- Automatic refresh

### HR Components

#### ManageAnnouncements (`ManageAnnouncements.jsx`)
- Create new announcements
- Set priority level
- Edit existing announcements
- Delete announcements
- View all announcements (active and past)

### Alternative Components

#### MessagingDashboard (`MessagingDashboard.jsx`)
Alternative unified messaging interface with:
- Sidebar navigation
- Integrated compose, inbox, sent, and announcements
- Single-page experience
- Tab-based navigation

#### MessageThread (`MessageThread.jsx`)
Standalone thread viewer component for detailed message conversations

## API Service

### messagingService.js

#### Message Operations
```javascript
// Get inbox messages
messagingService.getInbox()

// Get sent messages
messagingService.getSentMessages()

// Send new message
messagingService.sendMessage({
  recipient: userId,
  subject: "Subject",
  body: "Message body"
})

// Get message thread
messagingService.getMessageThread(messageId)

// Reply to message
messagingService.replyToMessage(messageId, {
  body: "Reply text"
})

// Mark as read
messagingService.markAsRead(messageId)

// Delete message
messagingService.deleteMessage(messageId)

// Get unread count
messagingService.getUnreadCount()

// Get contacts
messagingService.getContacts()
```

#### Announcement Operations (HR Only)
```javascript
// Get all announcements
messagingService.getAnnouncements()

// Get active announcements only
messagingService.getActiveAnnouncements()

// Create announcement
messagingService.createAnnouncement({
  title: "Title",
  content: "Content",
  priority: "normal"  // urgent, high, normal, low
})

// Update announcement
messagingService.updateAnnouncement(announcementId, {
  title: "Updated Title",
  content: "Updated Content",
  priority: "high"
})

// Delete announcement
messagingService.deleteAnnouncement(announcementId)
```

## Routes

```javascript
/messaging                      // Inbox (all users)
/messaging/compose             // Compose new message (all users)
/messaging/view/:id            // View message thread (all users)
/messaging/sent                // Sent messages (all users)
/messaging/announcements       // Manage announcements (HR only)
```

## Styling

### CSS Classes (Messaging.css)

#### Layout
- `.messaging-dashboard` - Main container
- `.messaging-container` - Content wrapper
- `.messaging-sidebar` - Navigation sidebar
- `.messaging-content` - Main content area

#### Messages
- `.message-list` - Message list container
- `.message-item` - Individual message row
- `.message-item.unread` - Unread message styling
- `.message-avatar` - User avatar icon
- `.message-details` - Message content
- `.message-preview` - Message excerpt

#### Thread View
- `.message-thread` - Thread container
- `.thread-messages` - Messages list
- `.thread-message` - Individual message in thread
- `.thread-message.sent` - Sent message (right-aligned)
- `.thread-message.received` - Received message (left-aligned)
- `.reply-form` - Reply input form

#### Announcements
- `.announcements-list` - Announcements container
- `.announcement-card` - Individual announcement
- `.priority-urgent` - Urgent priority styling (red)
- `.priority-high` - High priority styling (orange)
- `.priority-normal` - Normal priority styling (blue)
- `.priority-low` - Low priority styling (gray)

## User Flow

### Sending a Message
1. Click "Compose Message" or "✉️ New Message"
2. Search/select recipient from dropdown
3. Enter subject
4. Type message body
5. Click "Send Message"
6. Redirected to sent messages or inbox

### Reading Messages
1. Navigate to messaging/inbox
2. Unread messages highlighted in blue
3. Click on message to view full thread
4. Message automatically marked as read
5. Can reply inline or delete

### Viewing Announcements
1. Navigate to messaging inbox
2. Click "Announcements" tab
3. View all announcements sorted by date
4. Color-coded by priority
5. Most important announcements at top

### Creating Announcements (HR)
1. Navigate to "Manage Announcements"
2. Click "New Announcement"
3. Enter title and content
4. Select priority level
5. Click "Publish"
6. Visible to all employees immediately

## Features & Benefits

### Real-time Communication
- Instant message delivery
- Unread count updates
- Quick reply functionality

### Organization
- Threaded conversations
- Search and filter capabilities
- Separate inbox and sent folders

### Priority Management
- Color-coded announcements
- Priority levels for important updates
- Visual indicators for urgency

### User Experience
- Clean, modern interface
- Responsive design
- Intuitive navigation
- Loading states and error handling

## Security

### Authentication
- All endpoints require authentication
- Token-based security via API service

### Authorization
- Employees can only send messages to other employees
- HR-only routes protected with role checks
- Users can only delete their own messages
- Announcement management restricted to HR

### Privacy
- Users can only view their own conversations
- No access to other users' messages
- Deleted messages removed from both sender and recipient

## Error Handling

### User-Friendly Messages
- "Failed to load messages" - API error
- "Failed to send message" - Send error
- "Failed to delete message" - Delete error
- "All fields are required" - Validation error

### Loading States
- Loader component during data fetch
- "Sending..." button state
- Disabled inputs during submission

## Future Enhancements

### Potential Features
1. **Attachments**: Allow file uploads with messages
2. **Group Messages**: Send to multiple recipients
3. **Message Templates**: Pre-written message templates
4. **Read Receipts**: Show when messages are read
5. **Notifications**: Browser/email notifications for new messages
6. **Archive**: Archive old messages instead of deleting
7. **Message Categories**: Tag messages by category
8. **Scheduled Announcements**: Schedule future announcements
9. **Rich Text Editor**: Formatting options for messages
10. **Mobile App**: Native mobile application

## Troubleshooting

### Common Issues

1. **Messages not loading**
   - Check API connection
   - Verify authentication token
   - Check network tab for errors

2. **Cannot send message**
   - Verify recipient is selected
   - Check all required fields
   - Ensure user has permission

3. **Announcements not visible (HR)**
   - Verify user role is HR
   - Check route permissions
   - Refresh authentication

4. **Unread count not updating**
   - Refresh the page
   - Check WebSocket connection (if implemented)
   - Verify mark_read API call

## Testing

### Manual Testing Checklist
- [ ] Send message to another user
- [ ] Receive and read message
- [ ] Reply to message
- [ ] Delete message
- [ ] Search messages
- [ ] Filter unread messages
- [ ] View sent messages
- [ ] Create announcement (HR)
- [ ] Edit announcement (HR)
- [ ] Delete announcement (HR)
- [ ] View announcements (all users)
- [ ] Check unread count badge
- [ ] Test responsive design

## Development Notes

### Dependencies
- React Router DOM (routing)
- Axios (API calls via api.js)
- Font Awesome (icons)
- Custom hooks (useAuth)

### File Structure
```
src/
├── pages/
│   └── messaging/
│       ├── Inbox.jsx
│       ├── ComposeMessage.jsx
│       ├── MessageView.jsx
│       ├── MessageList.jsx
│       ├── SentMessages.jsx
│       ├── Announcements.jsx
│       ├── ManageAnnouncements.jsx
│       ├── MessagingDashboard.jsx
│       ├── MessageThread.jsx
│       ├── Messaging.css
│       └── index.js
├── services/
│   └── messagingService.js
└── routes/
    └── AppRoutes.jsx (messaging routes added)
```

### Backend API Endpoints (Expected)
```
GET    /api/messaging/inbox/
GET    /api/messaging/sent/
POST   /api/messaging/messages/
GET    /api/messaging/messages/:id/thread/
POST   /api/messaging/messages/:id/reply/
POST   /api/messaging/messages/:id/mark_read/
DELETE /api/messaging/messages/:id/
GET    /api/messaging/unread_count/
GET    /api/messaging/contacts/
GET    /api/messaging/announcements/
GET    /api/messaging/announcements/active/
POST   /api/messaging/announcements/
PUT    /api/messaging/announcements/:id/
DELETE /api/messaging/announcements/:id/
```
