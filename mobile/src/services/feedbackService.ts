import api from './api';

export interface Feedback {
    _id: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        profilePhoto?: string;
    };
    text: string;
    category: 'bug' | 'feature' | 'general' | 'ui';
    likes: string[];
    likeCount: number;
    status: 'pending' | 'reviewed' | 'implemented' | 'closed';
    createdAt: string;
}

export interface FeedbackResponse {
    feedback: Feedback[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

const feedbackService = {
    getFeedback: async (page = 1, limit = 20): Promise<FeedbackResponse> => {
        const response = await api.get(`/feedback?page=${page}&limit=${limit}`);
        return response.data;
    },

    createFeedback: async (text: string, category: string = 'general'): Promise<Feedback> => {
        const response = await api.post('/feedback', { text, category });
        return response.data;
    },

    toggleLike: async (feedbackId: string): Promise<Feedback> => {
        const response = await api.post(`/feedback/${feedbackId}/like`);
        return response.data;
    },

    deleteFeedback: async (feedbackId: string): Promise<void> => {
        await api.delete(`/feedback/${feedbackId}`);
    },
};

export default feedbackService;
