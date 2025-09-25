import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Loader from '../components/Loader.jsx';
import PostCard from '../components/PostCard.jsx';
import RichContent from '../components/RichContent.jsx';
import TagList from '../components/TagList.jsx';
import { api, resolveMediaUrl } from '../utils/api.js';
import { formatDate } from '../utils/format.js';

const RELATED_POSTS_LIMIT = 3;

const PostDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');

    const fetchPost = async () => {
      try {
        const response = await api.getPublicPost(slug);
        const postData = response?.data?.post;
        setPost(postData);
        if (postData?.title) {
          document.title = `${postData.title} — Posto`;
        }
      } catch (err) {
        setError(err.message || 'Post not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await api.getPublicPosts({ limit: RELATED_POSTS_LIMIT + 1 });
        const items = Array.isArray(response.data) ? response.data : [];
        const filtered = items.filter((item) => item.slug !== slug).slice(0, RELATED_POSTS_LIMIT);
        setRelated(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRelated();
  }, [slug]);

  if (loading) {
    return <Loader message="Loading post…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!post) {
    return <EmptyState title="Post not found" description="The post you are looking for might have moved." />;
  }

  const coverUrl = resolveMediaUrl(post.coverImage?.url);
  const authorName = post.authorId?.name || post.guestAuthor?.name;
  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null;
  const updatedDate = post.updatedAt ? new Date(post.updatedAt) : null;
  const showUpdated =
    !!(updatedDate && publishedDate && updatedDate.getTime() !== publishedDate.getTime());

  return (
    <article className="space-y-12">
      <div className="flex flex-col gap-6">
        <div className="space-y-2 text-sm text-muted">
          <Link to="/" className="text-secondary hover:text-heading">
            ← Back to posts
          </Link>
          {post.categoryId?.name && (
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">{post.categoryId.name}</p>
          )}
        </div>
        <h1 className="text-3xl font-semibold text-heading sm:text-4xl lg:text-5xl">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          {authorName && <span>By {authorName}</span>}
          {publishedDate && <span>Published {formatDate(publishedDate, true)}</span>}
          {showUpdated && <span>Updated {formatDate(updatedDate, true)}</span>}
        </div>
        {coverUrl && (
          <div className="overflow-hidden rounded-3xl border border-muted">
            <img src={coverUrl} alt={post.title} className="w-full object-cover" />
          </div>
        )}
      </div>

      <div className="space-y-12">
        <RichContent html={post.content} />
        <TagList tags={post.tagIds} />
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-heading">More stories</h2>
          <Link to="/" className="text-sm text-secondary hover:text-heading">
            View all
          </Link>
        </div>
        {related.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.slug || item._id} post={item} />
            ))}
          </div>
        ) : (
          <EmptyState title="No related posts yet" />
        )}
      </section>
    </article>
  );
};

export default PostDetailPage;
