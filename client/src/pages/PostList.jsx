import React, { useEffect, useState } from 'react';
import { postService, categoryService } from '../services/api';
import { Link } from 'react-router-dom';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchPosts = () => {
    setLoading(true);
    postService.getAllPosts(page, limit, category, search)
      .then(data => {
        setPosts(Array.isArray(data?.posts) ? data.posts : []);
        setTotal(typeof data?.total === 'number' ? data.total : 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    categoryService.getAllCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [page, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Blog Posts</h2>
      <Link to="/posts/new">Create New Post</Link>
      <form onSubmit={handleSearch} style={{ margin: '16px 0' }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {(Array.isArray(categories) ? categories : []).map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit">Search</button>
      </form>
      <ul>
        {(Array.isArray(posts) ? posts : []).map((post) => (
          <li key={post._id}>
            <Link to={`/posts/${post._id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16 }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            disabled={page === i + 1}
            style={{ margin: 2 }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PostList; 