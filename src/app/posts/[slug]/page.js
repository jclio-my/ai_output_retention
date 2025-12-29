import { getSortedPostsData, getPostData } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';

// 生成静态路径
export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.id,
  }));
}

export default function Post({ params }) {
  const post = getPostData(params.slug);

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none pb-24">
      <ReactMarkdown>{post.content}</ReactMarkdown>
    </article>
  );
}
