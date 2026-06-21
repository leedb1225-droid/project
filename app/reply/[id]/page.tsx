'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { fortuneService, FortuneMessage } from '../../../lib/fortuneService';

interface ReplyPageProps {
  params: Promise<{ id: string }>;
}

export default function ReplyPage({ params }: ReplyPageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [message, setMessage] = useState<FortuneMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const data = await fortuneService.getMessage(id);
        if (data) {
          setMessage(data);
          if (data.reply) {
            setReplyText(data.reply);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return alert('답장 메시지를 입력해주세요.');

    setSubmitting(true);
    try {
      const success = await fortuneService.saveReply(id, replyText.trim());
      if (success) {
        alert('답장이 성공적으로 전송되었습니다!');
        router.push(`/open/${id}`);
      } else {
        alert('답장을 저장하지 못했습니다.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('답장 전송 중 문제가 발생했습니다.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">포춘쿠키를 찾을 수 없습니다</h1>
        <Link href="/" className="py-2.5 px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold shadow transition-all">
          홈으로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 py-12 px-6">
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Link href={`/open/${id}`} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">따뜻한 답장 보내기</span>
          <div className="w-5" />
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target Info */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80">
            <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              상대방이 보낸 행운 메시지
            </div>
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 italic">
              "{message.message_content}"
            </p>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 text-right font-medium">
              From. {message.sender_nickname || '익명'}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex justify-between">
              <span>{message.sender_nickname || '익명'} 님에게 전할 말</span>
              <span className="text-[10px] font-semibold text-zinc-400">
                {replyText.length} / 150 자
              </span>
            </label>
            <textarea
              maxLength={150}
              placeholder={`포춘쿠키를 보내준 ${message.sender_nickname || '익명'} 님에게 고마운 마음이나 간단한 안부를 적어 답장해보세요.`}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className="w-full h-36 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl shadow-sm focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 outline-none resize-none transition-all text-sm font-semibold leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4.5 h-4.5" />
            <span>{submitting ? '답장 전송 중...' : '답장 전송하기'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
