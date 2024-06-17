import mongoose, { Schema } from 'mongoose';

const faqSchema = new Schema({
  faqTitle: String,
  faqAnswer: String,
  moderatorID: String,
  dateSet: Date,
});

export const FAQ = mongoose.model('FAQ', faqSchema);
