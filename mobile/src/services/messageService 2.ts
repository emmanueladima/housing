import api from './api';

export interface Thread {
    _id: string;
    type: 'dm' | 'listing' | 'group';
    participants: {
        _id: string;
        name: string;
        profilePhoto?: string;
    }[];
    lastMessage?: {
        content: string;
        sender: string;
        createdAt: string;
    };
    unreadCount: number;
    listing?: {
        _id: string;
        title: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string;
    threadId: string;
    sender: {
        _id: string;
        name: string;
        profilePhoto?: string;
    };
    content: string;
    attachments?: string[];
    createdAt: string;
    isRead: boolean;
}

const messageService = {
    // Get all threads
    async getThreads(page: number = 1, limit: number = 20): Promise<{ threads: Thread[]; total: number }> {
        const response = await api.get(`/threads?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Get single thread
    async getThread(threadId: string): Promise<Thread> {
        const response = await api.get(`/threads/${threadId}`);
        return response.data.thread || response.data;
    },

    // Create or get existing thread
    async createThread(data: {
        type: 'dm' | 'listing' | 'group';
        participantIds: string[];
        listingId?: string;
        groupId?: string;
    }): Promise<Thread> {
        const response = await api.post('/threads', data);
        return response.data.thread || response.data;
    },

    // Get messages for a thread
    async getMessages(threadId: string, cursor?: string, limit: number = 50): Promise<{ messages: Message[]; hasMore: boolean }> {
        let url = `/messages/${threadId}?limit=${limit}`;
        if (cursor) url += `&cursor=${cursor}`;
        const response = await api.get(url);
        return response.data;
    },

    // Send a message
    async sendMessage(threadId: string, content: string): Promise<Message> {
        const response = await api.post('/messages', { threadId, content });
        return response.data.message || response.data;
    },

    // Mark thread as read
    async markThreadRead(threadId: string): Promise<void> {
        await api.put(`/threads/${threadId}/read`);
    },

    // Get unread count
    async getUnreadCount(): Promise<number> {
        const response = await api.get('/messages/unread/count');
        return response.data.count;
    },
};

export default messageService;
