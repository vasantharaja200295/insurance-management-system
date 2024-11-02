const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: 'Start time must be in HH:mm format'
        }
    },
    endTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: 'End time must be in HH:mm format'
        }
    }
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    slots: [slotSchema]
}, { _id: false });

const agentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        required: true,
        maxLength: 255
    },
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    availability: [availabilitySchema],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave'],
        default: 'active'
    }
}, {
    timestamps: true
});

agentSchema.pre('save', function(next) {
    // Validate that each day appears only once
    const days = this.availability.map(a => a.day);
    const uniqueDays = new Set(days);
    if (days.length !== uniqueDays.size) {
        next(new Error('Each day can only appear once in availability'));
    }
    next();
});

module.exports = mongoose.model('Agent', agentSchema);