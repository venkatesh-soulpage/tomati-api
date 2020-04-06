import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 2629800,
    }
})

const Token = mongoose.model('Token', tokenSchema);

export default Token;