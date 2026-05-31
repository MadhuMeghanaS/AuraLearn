import mongoose from 'mongoose';

const infographicSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    summary: { type: String },
    metrics: [{
        value: { type: String },
        label: { type: String },
        description: { type: String }
    }],
    concepts: [{
        term: { type: String },
        definition: { type: String },
        importance: { type: String }
    }],
    timeline: [{
        step: { type: String },
        title: { type: String },
        description: { type: String }
    }],
    takeaway: { type: String }
}, {
    timestamps: true
});

export default mongoose.model('Infographic', infographicSchema);
