'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, X, Loader2 } from 'lucide-react';

// 防抖 Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 高亮匹配文本
function highlightText(text, query) {
  if (!query || !text) return text || '';

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  // 使用 matchAll 找到所有匹配项
  const matches = [...text.matchAll(regex)];

  if (matches.length === 0) return text;

  // 构建高亮后的文本
  let lastIndex = 0;
  const result = [];

  matches.forEach((match, index) => {
    // 添加匹配前的文本
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    // 添加高亮的匹配文本
    result.push(
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-600/50 text-ink dark:text-gray-200 px-0.5 rounded">
        {match[0]}
      </mark>
    );
    lastIndex = match.index + match[0].length;
  });

  // 添加最后的文本
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

// 计算搜索相关性分数
function calculateRelevanceScore(post, query) {
  const queryLower = query.toLowerCase();
  const title = post.title?.toLowerCase() || '';
  const content = post.content?.toLowerCase() || '';

  let score = 0;

  // 标题完全匹配
  if (title === queryLower) score += 100;
  // 标题以查询开头
  else if (title.startsWith(queryLower)) score += 50;
  // 标题包含查询
  else if (title.includes(queryLower)) score += 25;

  // 标题中查询词的出现次数
  const titleMatches = (title.match(new RegExp(queryLower, 'g')) || []).length;
  score += titleMatches * 10;

  // 内容中查询词的出现次数
  const contentMatches = (content.match(new RegExp(queryLower, 'g')) || []).length;
  score += contentMatches * 2;

  return score;
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  const debouncedQuery = useDebounce(query, 150);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // 组件挂载后设置 isMounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 加载搜索历史
  useEffect(() => {
    if (!isMounted) return;

    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, [isMounted]);

  // 保存搜索历史
  const saveToHistory = useCallback((searchQuery) => {
    if (!searchQuery.trim() || !isMounted) return;

    setSearchHistory((prev) => {
      const newHistory = [searchQuery, ...prev.filter((q) => q !== searchQuery)].slice(0, 5);
      try {
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save search history:', e);
      }
      return newHistory;
    });
  }, [isMounted]);

  // 清除搜索历史
  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('searchHistory');
    } catch (e) {
      console.error('Failed to clear search history:', e);
    }
  };

  // 获取所有文章数据
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        setAllPosts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load posts:', err);
        setIsLoading(false);
      });
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (debouncedQuery.trim()) {
      const filtered = allPosts
        .map((post) => ({
          ...post,
          score: calculateRelevanceScore(post, debouncedQuery),
        }))
        .filter((post) => post.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      setResults(filtered);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [debouncedQuery, allPosts]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          setSelectedIndex((currentIndex) => {
            if (currentIndex >= 0 && results[currentIndex]) {
              window.location.href = `/posts/${encodeURIComponent(results[currentIndex].id)}`;
            }
            return currentIndex;
          });
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    setIsOpen(true);
    saveToHistory(searchQuery);
  };

  const handleResultClick = () => {
    saveToHistory(query);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 focus-within:border-gray-400">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div className="relative flex-1 ml-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
            }}
            placeholder="搜索文章..."
            className="w-full pr-8 py-1 text-sm bg-transparent focus:outline-none text-ink dark:text-gray-200 placeholder-gray-400"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />}
      </div>

      {/* 搜索结果下拉框 */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-80 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[100]">
          <div className="max-h-96 overflow-y-auto">
            {/* 搜索历史 */}
            {!debouncedQuery.trim() && searchHistory.length > 0 && (
              <div className="border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    搜索历史
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    清除
                  </button>
                </div>
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(item)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* 搜索结果 */}
            {debouncedQuery.trim() && results.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  找到 {results.length} 个结果
                </div>
                {results.map((post, index) => (
                  <a
                    key={post.id}
                    href={`/posts/${encodeURIComponent(post.id)}`}
                    onClick={handleResultClick}
                    className={`block px-4 py-3 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                      index === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="font-medium text-ink dark:text-gray-200 text-sm truncate">
                      {highlightText(post.title, debouncedQuery)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {highlightText(post.content.slice(0, 100), debouncedQuery)}
                      {post.content.length > 100 && '...'}
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* 无结果 */}
            {debouncedQuery.trim() && results.length === 0 && !isLoading && (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                没有找到相关文章
              </div>
            )}

            {/* 空状态 */}
            {!debouncedQuery.trim() && searchHistory.length === 0 && !isLoading && (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                输入关键词搜索文章
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
