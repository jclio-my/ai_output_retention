import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function ListPage() {
  const posts = getSortedPostsData();

  return (
    // 使用 CSS Columns 实现简易瀑布流
    <div className="columns-1 sm:columns-2 gap-6 space-y-6">
      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.id}`} className="block break-inside-avoid">
          <div className="bg-gray-50 dark:bg-[#1e1e1e] p-6 rounded-sm hover:shadow-lg transition-shadow duration-300 border border-transparent dark:border-gray-800">
            <h2 className="text-xl font-bold text-ink dark:text-white mb-3">
              {post.title}
            </h2>
            {/* 摘要显示 (截取部分内容) */}
            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-6">
              <ReactMarkdown>
                {post.content.slice(0, 200) + "..."}
              </ReactMarkdown>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
