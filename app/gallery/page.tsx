'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Heart, Briefcase, GraduationCap, ArrowLeft, RefreshCw } from 'lucide-react';
import { fortuneService, FortuneMessage } from '../../lib/fortuneService';
import MessageCard from '../../components/MessageCard';

export default function GalleryPage() {
  const [messages, setMessages] = useState<FortuneMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<FortuneMessage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await fortuneService.getPublicMessages();
      setMessages(data);
      setFilteredMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Filter logic
  useEffect(() => {
    let list = [...messages];
    
    if (selectedCategory !== 'all') {
      list = list.filter(m => m.coupon_type === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        m =>
          (m.message_content && m.message_content.toLowerCase().includes(query)) ||
          (m.sender_nickname && m.sender_nickname.toLowerCase().includes(query)) ||
          (m.receiver_name && m.receiver_name.toLowerCase().includes(query))
      );
    }

    setFilteredMessages(list);
  }, [searchQuery, selectedCategory, messages]);

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header navigation & title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors uppercase tracking-wider mb-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              메인화면으로
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              인기 포춘쿠키 갤러리 ✨
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              사람들이 구운 따뜻하고 힘이 되는 행운의 메시지들을 함께 나누어 보세요.
            </p>
          </div>
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="self-start md:self-center p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all text-zinc-500 dark:text-zinc-300 disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search & Categories bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="메시지 또는 닉네임 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-3 pl-11 pr-4 rounded-xl shadow-sm focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-md'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setSelectedCategory('general')}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                selectedCategory === 'general'
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-md'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              종합
            </button>
            <button
              onClick={() => setSelectedCategory('love')}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                selectedCategory === 'love'
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-md'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              연애
            </button>
            <button
              onClick={() => setSelectedCategory('career')}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                selectedCategory === 'career'
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-md'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-500" />
              직장/사업
            </button>
            <button
              onClick={() => setSelectedCategory('study')}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                selectedCategory === 'study'
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-md'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              학업
            </button>
          </div>
        </div>

        {/* Message Cards List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMessages.map(msg => (
              <MessageCard key={msg.id} message={msg} allowLike={true} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-inner flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="text-4xl mb-4">🍪</div>
            <h3 className="font-extrabold text-zinc-800 dark:text-zinc-200 text-lg mb-1">표시할 메시지가 없습니다</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 break-keep">
              검색 필터를 변경해보거나 직접 첫 번째 행운의 쿠키를 구워 갤러리에 공개해 보세요!
            </p>
            <Link
              href="/create"
              className="mt-6 py-2.5 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold rounded-xl text-xs transition-all shadow"
            >
              첫 쿠키 굽기 🥠
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
