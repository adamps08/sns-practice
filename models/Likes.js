const likeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    createdAt: { type: Date, default: Date.now },
  });