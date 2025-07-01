const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Category = require('../models/Category');
const User = require('../models/User');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// const auth = require('../middleware/auth'); // Placeholder for auth middleware

const router = express.Router();

// Set up multer storage
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// GET /api/posts - Get all posts
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find().populate('category').populate('author', 'username');
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id - Get a specific post
router.get('/:id', [param('id').isMongoId()], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const post = await Post.findById(req.params.id).populate('category').populate('author', 'username');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id/comments - Get comments for a post
router.get('/:id/comments', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments.user', 'username');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post.comments);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts - Create a new post
router.post(
  '/',
  // auth,
  [
    body('title').notEmpty(),
    body('content').notEmpty(),
    body('category').isMongoId(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, content, category } = req.body;
      const post = new Post({
        title,
        content,
        category,
        // author: req.user.id, // Uncomment when auth is implemented
      });
      await post.save();
      await Category.findByIdAndUpdate(category, { $push: { posts: post._id } });
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/posts/:id - Update a post
router.put(
  '/:id',
  // auth,
  [
    param('id').isMongoId(),
    body('title').optional().notEmpty(),
    body('content').optional().notEmpty(),
    body('category').optional().isMongoId(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json(post);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', /*auth,*/ [param('id').isMongoId()], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await Category.findByIdAndUpdate(post.category, { $pull: { posts: post._id } });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/image - Upload featured image for a post
router.post(
  '/:id/image',
  upload.single('image'),
  async (req, res, next) => {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { featuredImage: req.file ? `/uploads/${req.file.filename}` : undefined },
        { new: true }
      );
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json(post);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/posts/:id/comments - Add a comment to a post
router.post(
  '/:id/comments',
  [param('id').isMongoId(), body('text').notEmpty(), body('user').isMongoId()],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { text, user } = req.body;
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      post.comments.push({ user, text });
      await post.save();
      await post.populate('comments.user', 'username');
      res.status(201).json(post.comments[post.comments.length - 1]);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router; 