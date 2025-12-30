import { getSortedPostsData, getPostData } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';
import CopyPostButton from '@/components/CopyPostButton';

// 生成静态路径
export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: encodeURIComponent(post.id),
  }));
}

export default function Post({ params }) {
  // 解码 URL 中的中文字符
  const decodedSlug = decodeURIComponent(params.slug);
  const post = getPostData(decodedSlug);

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none pb-24 relative">
      <ReactMarkdown>{post.content}</ReactMarkdown>
      <CopyPostButton content={post.content} />
    </article>
  );
}
