import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  // 确保目录存在
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // 如果元信息中没有 title，从内容中提取
    let title = matterResult.data.title;
    if (!title) {
      // 查找第一个一级标题 (#)
      const h1Match = matterResult.content.match(/^#\s+(.+)$/m);
      if (h1Match) {
        title = h1Match[1].trim();
      } else {
        // 查找第一个二级标题 (##)
        const h2Match = matterResult.content.match(/^##\s+(.+)$/m);
        if (h2Match) {
          title = h2Match[1].trim();
        } else {
          // 都没有则为空
          title = '';
        }
      }
    }

    return {
      id,
      ...matterResult.data,
      title, // 使用提取或原始的 title
      content: matterResult.content, // 获取内容
      date: matterResult.data.date || new Date().toISOString(), // 建议在md里写date
    };
  });

  // 按日期降序
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) return 1;
    else return -1;
  });
}

export function getPostData(id) {
  // Decode the id - may be double-encoded due to how Next.js handles URL params
  // with output: 'export' mode and Chinese filenames
  let decodedId = id;
  try {
    // Try decoding once
    decodedId = decodeURIComponent(id);
    // If still contains encoded characters, decode again
    if (decodedId.includes('%')) {
      decodedId = decodeURIComponent(decodedId);
    }
  } catch (e) {
    // If decoding fails, use original id
    decodedId = id;
  }

  const fullPath = path.join(postsDirectory, `${decodedId}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    id,
    ...matterResult.data,
    content: matterResult.content,
  };
}
