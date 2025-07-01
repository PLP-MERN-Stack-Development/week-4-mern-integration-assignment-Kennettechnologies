import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postService, categoryService } from '../services/api';
import api from '../services/api';

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories);
    if (id) {
      setLoading(true);
      postService.getPost(id)
        .then((post) => {
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category?._id || '');
          setImagePreview(post.featuredImage || null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let postId = id;
      if (id) {
        await postService.updatePost(id, { title, content, category });
      } else {
        const post = await postService.createPost({ title, content, category });
        postId = post._id;
      }
      // Handle image upload
      if (image && postId) {
        const formData = new FormData();
        formData.append('image', image);
        await api.post(`/posts/${postId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{id ? 'Edit Post' : 'Create Post'}</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label>Title:</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>Content:</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} required />
      </div>
      <div>
        <label>Category:</label>
        <select value={category} onChange={e => setCategory(e.target.value)} required>
          <option value="">Select category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Featured Image:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: 200, display: 'block', marginTop: 8 }} />}
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
    </form>
  );
};

export default PostForm; 