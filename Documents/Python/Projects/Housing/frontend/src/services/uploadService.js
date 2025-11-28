import api from './api';

const uploadService = {
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post('/uploads', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return data.attachment;
    },
};

export default uploadService;
