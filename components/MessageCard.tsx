'use client';

import React, { useState } from 'react';
import { Heart, Coffee, Utensils, Sparkles, MessageSquare, ThumbsUp, Calendar, Gift } from 'lucide-react';
import { FortuneMessage, fortuneService } from '../lib/fortuneService';

interface MessageCardProps {
  message: FortuneMessage;
  allowLike?: boolean;
}

export default function MessageCard({ message, allowLike = true }: MessageCardProps) {
  const [likes, setLikes] = useState(message.likes);
  const [liked, setLiked] = useState(false);

  const getCouponConfig = (type: string) => {
    switch (type) {
      case 'coffee':
        return {
          icon: <Coffee className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />,
          bgColor: 'bg-zinc-100 dark:bg-zinc-800/40',
          borderColor: 'border-zinc-200 dark:border-zinc-800',
          textColor: 'text-zinc-700 dark:text-zinc-300',
          label: '☕ 커피 쿠폰',
        };
      case 'dessert':
        return {
          icon: <Gift className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />,
          bgColor: 'bg-zinc-100 dark:bg-zinc-800/40',
          borderColor: 'border-zinc-200 dark:border-zinc-800',
          textColor: 'text-zinc-700 dark:text-zinc-300',
          label: '🍰 디저트 쿠폰',
        };
      case 'meal':
        return {
          icon: <Utensils className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />,
          bgColor: 'bg-zinc-100 dark:bg-zinc-800/40',
          borderColor: 'border-zinc-200 dark:border-zinc-800',
          textColor: 'text-zinc-700 dark:text-zinc-300',
          label: '🍜 식사 쿠폰',
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />,
          bgColor: 'bg-zinc-100 dark:bg-zinc-800/40',
          borderColor: 'border-zinc-200 dark:border-zinc-800',
          textColor: 'text-zinc-700 dark:text-zinc-300',
          label: '✨ 일반 쿠키',
        };
    }
  };

  const config = getCouponConfig(message.coupon_type);

  const handleLike = async () => {
    if (liked || !allowLike) return;
    setLiked(true);
    setLikes(prev => prev + 1);
    try {
      await fortuneService.toggleLike(message.id);
    } catch (e) {
      console.error(e);
    }
  };

  const formattedDate = new Date(message.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Top Tag & Date */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
          {config.icon}
          {config.label}
        </span>
        <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </span>
      </div>

      {/* Main Fortune Content */}
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          {/* Sender & Receiver Info */}
          <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="text-zinc-800 dark:text-zinc-200 font-bold">{message.sender_nickname || '익명'}</span> 님이{' '}
            <span className="text-zinc-800 dark:text-zinc-200 font-bold">{message.receiver_name || '받는 사람'}</span> 님에게 보낸 쿠키
          </div>

          {/* Fortune Text */}
          <div className="relative my-4 py-4 px-2">
            <div className="absolute top-0 left-0 text-4xl text-zinc-200/50 font-serif">“</div>
            <p className="text-zinc-800 dark:text-zinc-100 font-semibold text-lg md:text-xl text-center leading-relaxed break-keep">
              {message.is_opened ? message.message_content : '아직 개봉하지 않은 포춘쿠키입니다.'}
            </p>
            <div className="absolute bottom-0 right-0 text-4xl text-zinc-200/50 font-serif">”</div>
          </div>
        </div>

        {/* Action (Likes & Interactions) */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={handleLike}
            disabled={liked || !allowLike}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 py-1.5 px-3 rounded-lg ${
              liked
                ? 'text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800'
                : allowLike
                ? 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                : 'text-zinc-400 dark:text-zinc-600'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 transition-transform duration-300 ${liked ? 'scale-125 fill-zinc-500' : ''}`} />
            <span>좋아요 {likes}</span>
          </button>

          {message.is_opened && !message.reply && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">답변을 기다리는 중...</span>
          )}
          {message.reply && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              답변 도착 완료
            </span>
          )}
        </div>
      </div>

      {/* Reply Section */}
      {message.reply && (
        <div className="bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 p-6">
          <div className="flex items-start gap-3">
            <div className="bg-zinc-200 dark:bg-zinc-800 p-2 rounded-xl text-zinc-800 dark:text-zinc-200 font-bold shrink-0">
              답장
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  {message.receiver_name} 님
                </span>
                {message.replied_at && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {new Date(message.replied_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed break-keep">
                {message.reply}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
