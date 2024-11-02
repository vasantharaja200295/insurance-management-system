const mongoose = require('mongoose');

const coverageSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['HEALTH', 'LIFE', 'AUTO', 'HOME', 'DISABILITY']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  deductible: {
    type: Number,
    required: true,
    min: 0
  },
  details: {
    type: Map,
    of: String
  }
});

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  coverage: [coverageSchema],
  premium: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    frequency: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'ANNUALLY'],
      default: 'MONTHLY'
    }
  },
  term: {
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['MONTHS', 'YEARS'],
      default: 'YEARS'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documents: [{
    name: String,
    url: String,
    required: Boolean
  }],
  eligibilityCriteria: {
    minAge: Number,
    maxAge: Number,
    occupation: [String],
    location: [String]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });


module.exports = mongoose.model('Plan', planSchema);