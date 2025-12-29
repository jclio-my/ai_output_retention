import { getSortedPostsData } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const posts = getSortedPostsData();
  const latestPost = posts[0];

  if (!latestPost) {
    return <div className="text-center mt-20 text-ink dark:text-gray-200">暂无内容</div>;
  }

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-ink dark:text-white mb-8">
        {latestPost.title}
      </h1>
      <div className="text-ink dark:text-gray-300 leading-relaxed font-sans">
        <ReactMarkdown>{latestPost.content}</ReactMarkdown>
      </div>
    </article>
  );
}
