import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true, // MIME type
    },
    filename: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true, // Bytes
    },
    width: Number, // For images
    height: Number, // For images
    thumbnailUrl: String,
    checksum: String, // For integrity
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

const Attachment = mongoose.model('Attachment', attachmentSchema);

export default Attachment;
