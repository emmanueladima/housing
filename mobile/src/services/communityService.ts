import api from './api';

export interface Post {
    _id: string;
    title: string;
    content: string;
    channel: string;
    intent?: string;
    author: {
        _id: string;
        name: string;
        profilePhoto?: string;
    };
    images?: string[];
    likes: number;
    commentCount: number;
    isLiked?: boolean;
    createdAt: string;
    tags?: string[];
}

export interface Comment {
    _id: string;
    content: string;
    author: {
        _id: string;
        name: string;
        profilePhoto?: string;
    };
    likes: number;
    createdAt: string;
}

export interface PostFilters {
    channel?: string;
    intent?: string;
    search?: string;
    page?: number;
    limit?: number;
}

const communityService = {
    // Get posts with filters
    async getPosts(filters: PostFilters = {}): Promise<{ posts: Post[]; total: number }> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                params.append(key, String(value));
            }
        });
        const response = await api.get(`/community/posts?${params.toString()}`);
        return response.data;
    },

    // Get single post by ID
    async getPostById(id: string): Promise<Post> {
        const response = await api.get(`/community/posts/${id}`);
        return response.data.post;
    },

    // Create a new post
    async createPost(postData: { title: string; content: string; channel: string; intent?: string }): Promise<Post> {
        const response = await api.post('/community/posts', postData);
        return response.data.post;
    },

    // Get comments for a post
    async getComments(postId: string, page: number = 1): Promise<{ comments: Comment[]; total: number }> {
        const response = await api.get(`/community/posts/${postId}/comments?page=${page}`);
        return response.data;
    },

    // Add a comment
    async addComment(postId: string, content: string): Promise<Comment> {
        const response = await api.post(`/community/posts/${postId}/comments`, { content });
        return response.data.comment;
    },

    // Like a post
    async likePost(postId: string): Promise<{ likes: number; isLiked: boolean }> {
        const response = await api.post(`/community/posts/${postId}/like`);
        return response.data;
    },
};

export default communityService;
