import api from './api';

const communityService = {
    // Get posts with filters and pagination
    getPosts: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.channel) params.append('channel', filters.channel);
        if (filters.intent) params.append('intent', filters.intent);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.search) params.append('search', filters.search);

        const { data } = await api.get(`/community/posts?${params.toString()}`);
        return data;
    },

    // Get single post by ID
    getPostById: async (id) => {
        const { data } = await api.get(`/community/posts/${id}`);
        return data.post;
    },

    // Create a new post
    createPost: async (postData, images = []) => {
        const formData = new FormData();

        // Add text fields
        Object.keys(postData).forEach(key => {
            if (postData[key] !== undefined && postData[key] !== null) {
                if (Array.isArray(postData[key])) {
                    formData.append(key, JSON.stringify(postData[key]));
                } else {
                    formData.append(key, postData[key]);
                }
            }
        });

        // Add images
        images.forEach(image => {
            formData.append('images', image);
        });

        const { data } = await api.post('/community/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.post;
    },

    // Update a post
    updatePost: async (id, postData, newImages = []) => {
        const formData = new FormData();

        Object.keys(postData).forEach(key => {
            if (postData[key] !== undefined && postData[key] !== null) {
                if (Array.isArray(postData[key])) {
                    formData.append(key, JSON.stringify(postData[key]));
                } else {
                    formData.append(key, postData[key]);
                }
            }
        });

        newImages.forEach(image => {
            formData.append('images', image);
        });

        const { data } = await api.put(`/community/posts/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.post;
    },

    // Delete a post
    deletePost: async (id) => {
        const { data } = await api.delete(`/community/posts/${id}`);
        return data;
    },

    // Get comments for a post
    getComments: async (postId, page = 1, limit = 20) => {
        const { data } = await api.get(`/community/posts/${postId}/comments?page=${page}&limit=${limit}`);
        return data;
    },

    // Add a comment
    addComment: async (postId, content) => {
        const { data } = await api.post(`/community/posts/${postId}/comments`, { content });
        return data.comment;
    },

    // Report a post
    reportPost: async (postId, reason) => {
        const { data } = await api.post(`/community/posts/${postId}/report`, { reason });
        return data;
    }
};

export default communityService;
