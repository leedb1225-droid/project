'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Edit3, CreditCard, Gift } from 'lucide-react';
import FortuneCookieIcon from '../components/FortuneCookieIcon';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  const cardVariants = {
    hover: {
      y: -6,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col justify-between overflow-hidden">
      
      {/* Hero Section with Beautiful Soft Gradient */}
      <section className="relative w-full bg-gradient-to-br from-pink-100 via-orange-50 to-yellow-50/30 py-20 md:py-28 px-6 sm:px-12 lg:px-24 flex flex-col items-center text-center shadow-sm">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center max-w-5xl mx-auto"
        >
          {/* Custom Cookie Icon */}
          <motion.div
            variants={itemVariants}
            className="mb-6 relative w-24 h-24 flex items-center justify-center bg-white rounded-3xl shadow-lg border border-pink-100"
            whileHover={{ rotate: 12, scale: 1.05 }}
          >
            <FortuneCookieIcon className="w-14 h-14 animate-pulse" fill="url(#homeCookieGradient)" />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="homeCookieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B9D" />
                  <stop offset="50%" stopColor="#FFA07A" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute -top-1 -right-1 text-xl">✨</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-foreground mb-6 break-keep"
          >
            마음을 전하는 특별한 방법,<br />
            <span className="text-primary font-semibold">포춘쿠키</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base font-normal text-foreground/80 max-w-xl mb-10 leading-relaxed break-keep"
          >
            친구와 안부 메시지나 선물 쿠폰을 담아 포춘쿠키를 나눠보세요.<br/>
            쿠키와 답장을 주고받을수록 <span className="text-primary font-semibold">마음 온도</span>가 올라가고, 더 다채롭고 예쁜 쿠키를 구울 수 있어요!
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3.5 w-full justify-center px-4 max-w-md">
            <Link
              href="/create"
              className="flex-1 bg-primary hover:bg-pink-600 text-white font-semibold text-base py-3.5 px-6 rounded-2xl shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>✍️</span> 메시지 보내기
            </Link>
            <Link
              href="/inbox"
              className="flex-1 bg-white hover:bg-pink-50 text-foreground font-semibold text-base py-3.5 px-6 rounded-2xl border border-pink-200 shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Gift className="w-4.5 h-4.5 text-primary" />
              받은 선물함
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Section (3 Cards with white-to-pink-50 gradient) */}
      <section className="bg-background py-16 px-6 border-t border-pink-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 tracking-tight text-foreground">
            포춘쿠키는 이렇게 작동해요
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-r from-white to-pink-50 border border-pink-100 p-6.5 rounded-2xl shadow-sm flex flex-col items-center text-center cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-100 text-primary flex items-center justify-center mb-4.5">
                <Edit3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base mb-1.5 text-foreground">1. ✍️ 메시지 작성</h3>
              <p className="text-foreground/75 text-sm font-normal leading-relaxed break-keep">
                친구를 선택하고 축하와 마음을 담아 메시지를 작성하세요
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-r from-white to-pink-50 border border-pink-100 p-6.5 rounded-2xl shadow-sm flex flex-col items-center text-center cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-100 text-primary flex items-center justify-center mb-4.5">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base mb-1.5 text-foreground">2. 💳 소액 결제</h3>
              <p className="text-foreground/75 text-sm font-normal leading-relaxed break-keep">
                카페 쿠폰과 원하는 쿠키 디자인 스킨을 골라 전송
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-r from-white to-pink-50 border border-pink-100 p-6.5 rounded-2xl shadow-sm flex flex-col items-center text-center cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-100 text-primary flex items-center justify-center mb-4.5">
                <FortuneCookieIcon className="w-6 h-6 text-primary" fill="currentColor" />
              </div>
              <h3 className="font-bold text-base mb-1.5 text-foreground">3. 🍪 3D 쿠키 열기</h3>
              <p className="text-foreground/75 text-sm font-normal leading-relaxed break-keep">
                쿠키가 맛있게 쪼개지며 메시지와 선물을 획득하고 마음 온도가 상승!
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
