'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, User, Coffee, Utensils, Gift, ArrowLeft, Phone, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface CouponOption {
  id: string;
  emoji: string;
  name: string;
  price: number;
  description: string;
}

const COUPON_OPTIONS: CouponOption[] = [
  {
    id: 'coffee',
    emoji: '☕',
    name: '커피 쿠폰',
    price: 3000,
    description: '따뜻한 하루를 선물하세요',
  },
  {
    id: 'dessert',
    emoji: '🍰',
    name: '디저트 쿠폰',
    price: 4000,
    description: '달콤한 휴식을 선물하세요',
  },
  {
    id: 'meal',
    emoji: '🍜',
    name: '식사 쿠폰',
    price: 5000,
    description: '든든한 한 끼를 대접하세요',
  },
];

interface UserProfile {
  email: string;
  name: string;
  phone?: string | null;
  avatar_url?: string | null;
  friends: string[];
  incomingRequests: string[];
  outgoingRequests: string[];
  warmth?: number;
}

interface SkinOption {
  id: string;
  name: string;
  minWarmth: number;
  colorLabel: string;
  gradientClass: string;
}

const SKINS: SkinOption[] = [
  { id: 'original', name: '기본 황금', minWarmth: 36.5, colorLabel: '황금빛 쿠키', gradientClass: 'from-[#FDE68A] via-[#F59E0B] to-[#B45309]' },
  { id: 'pink', name: '디저트 핑크', minWarmth: 40.0, colorLabel: '딸기 마카롱', gradientClass: 'from-[#FCE7F3] via-[#FF6B9D] to-[#C2185B]' },
  { id: 'coral', name: '메이플 코랄', minWarmth: 50.0, colorLabel: '가을 코랄', gradientClass: 'from-[#FFE0B2] via-[#FFA07A] to-[#E64A19]' },
  { id: 'gold', name: '행운의 골드', minWarmth: 70.0, colorLabel: '순금 메탈릭', gradientClass: 'from-[#FFF59D] via-[#FFD700] to-[#FF8F00]' },
];

function CreateCookieContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [senderNickname, setSenderNickname] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [couponType, setCouponType] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedSkin, setSelectedSkin] = useState('original');
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState('');
  const [minDateString, setMinDateString] = useState('');

  // Recipient methods and friends lists
  const [recipientMethod, setRecipientMethod] = useState<'friend' | 'manual'>('manual');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [selectedFriendEmail, setSelectedFriendEmail] = useState('');

  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [showLocalDraftBanner, setShowLocalDraftBanner] = useState(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMinDateString(tomorrow.toISOString().split('T')[0]);
  }, []);

  // 1. Restore draft on mount
  useEffect(() => {
    try {
      const sessionDraftStr = sessionStorage.getItem('create_cookie_draft_session');
      if (sessionDraftStr) {
        const draft = JSON.parse(sessionDraftStr);
        if (draft.senderNickname !== undefined) setSenderNickname(draft.senderNickname);
        if (draft.receiverName !== undefined) setReceiverName(draft.receiverName);
        if (draft.receiverEmail !== undefined) setReceiverEmail(draft.receiverEmail);
        if (draft.receiverPhone !== undefined) setReceiverPhone(draft.receiverPhone);
        if (draft.couponType !== undefined) setCouponType(draft.couponType);
        if (draft.messageContent !== undefined) setMessageContent(draft.messageContent);
        if (draft.selectedSkin !== undefined) setSelectedSkin(draft.selectedSkin);
        if (draft.isTimeCapsule !== undefined) setIsTimeCapsule(draft.isTimeCapsule);
        if (draft.unlockDate !== undefined) setUnlockDate(draft.unlockDate);
        if (draft.recipientMethod !== undefined) setRecipientMethod(draft.recipientMethod);
        if (draft.selectedFriendEmail !== undefined) setSelectedFriendEmail(draft.selectedFriendEmail);
      }
    } catch (e) {
      console.error('Failed to restore session draft', e);
    }

    try {
      const localDraftStr = localStorage.getItem('create_cookie_draft_local');
      if (localDraftStr) {
        setShowLocalDraftBanner(true);
      }
    } catch (e) {
      console.error('Failed to check local draft', e);
    }

    setIsDraftRestored(true);
  }, []);

  // 2. Auto-save to sessionStorage
  useEffect(() => {
    if (!isDraftRestored) return;

    try {
      const draft = {
        senderNickname,
        receiverName,
        receiverEmail,
        receiverPhone,
        couponType,
        messageContent,
        selectedSkin,
        isTimeCapsule,
        unlockDate,
        recipientMethod,
        selectedFriendEmail,
      };
      sessionStorage.setItem('create_cookie_draft_session', JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save session draft', e);
    }
  }, [
    isDraftRestored,
    senderNickname,
    receiverName,
    receiverEmail,
    receiverPhone,
    couponType,
    messageContent,
    selectedSkin,
    isTimeCapsule,
    unlockDate,
    recipientMethod,
    selectedFriendEmail,
  ]);

  const handleSaveDraft = () => {
    try {
      const draft = {
        senderNickname,
        receiverName,
        receiverEmail,
        receiverPhone,
        couponType,
        messageContent,
        selectedSkin,
        isTimeCapsule,
        unlockDate,
        recipientMethod,
        selectedFriendEmail,
      };
      localStorage.setItem('create_cookie_draft_local', JSON.stringify(draft));
      alert('작성 중인 내용이 임시 저장되었습니다.');
      setShowLocalDraftBanner(false);
    } catch (e) {
      console.error('Failed to save local draft', e);
      alert('임시 저장에 실패했습니다.');
    }
  };

  const handleLoadLocalDraft = () => {
    try {
      const localDraftStr = localStorage.getItem('create_cookie_draft_local');
      if (localDraftStr) {
        const draft = JSON.parse(localDraftStr);
        if (draft.senderNickname !== undefined) setSenderNickname(draft.senderNickname);
        if (draft.receiverName !== undefined) setReceiverName(draft.receiverName);
        if (draft.receiverEmail !== undefined) setReceiverEmail(draft.receiverEmail);
        if (draft.receiverPhone !== undefined) setReceiverPhone(draft.receiverPhone);
        if (draft.couponType !== undefined) setCouponType(draft.couponType);
        if (draft.messageContent !== undefined) setMessageContent(draft.messageContent);
        if (draft.selectedSkin !== undefined) setSelectedSkin(draft.selectedSkin);
        if (draft.isTimeCapsule !== undefined) setIsTimeCapsule(draft.isTimeCapsule);
        if (draft.unlockDate !== undefined) setUnlockDate(draft.unlockDate);
        if (draft.recipientMethod !== undefined) setRecipientMethod(draft.recipientMethod);
        if (draft.selectedFriendEmail !== undefined) setSelectedFriendEmail(draft.selectedFriendEmail);
        alert('임시 저장된 내용을 불러왔습니다.');
      }
    } catch (e) {
      console.error('Failed to load local draft', e);
      alert('임시 저장 불러오기에 실패했습니다.');
    } finally {
      setShowLocalDraftBanner(false);
    }
  };

  const handleDeleteLocalDraft = () => {
    try {
      localStorage.removeItem('create_cookie_draft_local');
      alert('임시 저장 내용이 삭제되었습니다.');
    } catch (e) {
      console.error('Failed to delete local draft', e);
    } finally {
      setShowLocalDraftBanner(false);
    }
  };



  // Form validation: requires message, coupon, and recipient (friend chosen or phone entered)
  const isFormValid = messageContent.trim().length > 0 && 
                      couponType !== '' && 
                      (recipientMethod === 'friend' ? selectedFriendEmail !== '' : receiverPhone.trim() !== '') &&
                      (!isTimeCapsule || unlockDate !== '');

  // Load friends and handle prefilled search parameters (email or phone)
  useEffect(() => {
    const fetchFriendsAndParams = async () => {
      try {
        const res = await fetch('/api/friends');
        let friendsList: UserProfile[] = [];
        if (res.ok) {
          const data = await res.json();
          friendsList = data.friends || [];
          setFriends(friendsList);
        }

        const emailParam = searchParams.get('email');
        const phoneParam = searchParams.get('phone');

        if (emailParam) {
          const foundFriend = friendsList.find(
            f => f.email.toLowerCase() === emailParam.toLowerCase()
          );
          if (foundFriend) {
            setRecipientMethod('friend');
            setSelectedFriendEmail(foundFriend.email);
            setReceiverName(foundFriend.name);
            setReceiverEmail(foundFriend.email);
            setReceiverPhone(foundFriend.phone || '');
          } else {
            setRecipientMethod('manual');
            setReceiverEmail(emailParam);
          }
        } else if (phoneParam) {
          const foundFriend = friendsList.find(
            f => f.phone && f.phone.replace(/[^0-9]/g, '') === phoneParam.replace(/[^0-9]/g, '')
          );
          if (foundFriend) {
            setRecipientMethod('friend');
            setSelectedFriendEmail(foundFriend.email);
            setReceiverName(foundFriend.name);
            setReceiverEmail(foundFriend.email);
            setReceiverPhone(foundFriend.phone || '');
          } else {
            setRecipientMethod('manual');
            setReceiverPhone(phoneParam);
          }
        } else if (friendsList.length > 0 && typeof window !== 'undefined' && !sessionStorage.getItem('create_cookie_draft_session')) {
          setRecipientMethod('friend');
        }
      } catch (e) {
        console.error('Error loading friends for create page:', e);
      }
    };

    fetchFriendsAndParams();
  }, [searchParams]);

  const handleSelectFriend = (email: string) => {
    setSelectedFriendEmail(email);
    const friend = friends.find(f => f.email === email);
    if (friend) {
      setReceiverName(friend.name);
      setReceiverEmail(friend.email);
      setReceiverPhone(friend.phone || '');
      
      // Auto-reset skin if new friend warmth doesn't satisfy current selection
      const friendWarmth = friend.warmth ?? 36.5;
      const currentSkinMeta = SKINS.find(s => s.id === selectedSkin);
      if (currentSkinMeta && friendWarmth < currentSkinMeta.minWarmth) {
        setSelectedSkin('original');
      }
    } else {
      setReceiverName('');
      setReceiverEmail('');
      setReceiverPhone('');
      setSelectedSkin('original');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/messages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_nickname: senderNickname.trim() || '익명',
          receiver_name: receiverName.trim() || '받는 사람',
          receiver_email: recipientMethod === 'friend' ? receiverEmail.trim() : null,
          receiver_phone: receiverPhone.trim() || null,
          message_content: messageContent.trim(),
          coupon_type: couponType,
          is_public: isPublic,
          cookie_skin: selectedSkin,
          unlock_at: isTimeCapsule && unlockDate ? new Date(unlockDate).toISOString() : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message_id) {
        sessionStorage.removeItem('create_cookie_draft_session');
        localStorage.removeItem('create_cookie_draft_local');
        router.push(`/pay/${data.message_id}`);
      } else {
        alert(data.error || '쿠키 생성 중 오류가 발생했습니다.');
        setSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert('쿠키를 굽는 도중 에러가 발생했습니다.');
      setSubmitting(false);
    }
  };

  const getSelectedFriendWarmth = () => {
    const friend = friends.find(f => f.email === selectedFriendEmail);
    return friend ? (friend.warmth ?? 36.5) : 36.5;
  };

  const currentWarmth = getSelectedFriendWarmth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 bg-background text-foreground py-12 px-6 sm:px-12 lg:px-24 flex flex-col justify-between"
    >
      <div className="max-w-2xl mx-auto w-full">
        {/* Header navigation & title */}
        <div className="mb-8 flex items-center gap-2">
          <Link href="/" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">돌아가기</span>
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-center mb-2 tracking-tight text-foreground">
          행운의 포춘쿠키 굽기 🥠
        </h1>
        <p className="text-foreground/80 text-center mb-10 text-base font-normal break-keep">
          따뜻한 메시지와 선물 쿠폰을 담은 쿠키를 구워보세요.
        </p>

        {showLocalDraftBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-pink-55/80 border border-pink-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <span className="font-semibold text-foreground/85">이전에 임시 저장한 작성 내용이 있습니다.</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleLoadLocalDraft}
                className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-pink-600 text-white rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                불러오기
              </button>
              <button
                type="button"
                onClick={handleDeleteLocalDraft}
                className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-250 text-foreground/60 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                삭제
              </button>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          
          {/* Names Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">
                보내는 사람 닉네임
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="익명, 친구A 등 (선택사항)"
                  maxLength={20}
                  value={senderNickname}
                  onChange={e => setSenderNickname(e.target.value)}
                  className="w-full bg-white border border-pink-150 py-3.5 pl-11 pr-4 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-500/20 focus:border-primary outline-none transition-all text-sm font-semibold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">
                보내는 이름 미리보기
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/55">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  disabled
                  value={senderNickname || '익명'}
                  className="w-full bg-pink-50/30 border border-pink-100 py-3.5 pl-11 pr-4 rounded-2xl text-sm font-semibold opacity-60 cursor-not-allowed text-foreground/50"
                />
              </div>
            </div>
          </div>

          {/* Recipient Selection Section */}
          <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-4 shadow-sm">
            <label className="text-xs font-bold text-foreground/75 uppercase tracking-wider block">
              받는 사람 정보 <span className="text-primary font-bold">*</span>
            </label>

            {/* Selector tabs */}
            <div className="flex bg-pink-50/50 p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setRecipientMethod('friend');
                  setReceiverName('');
                  setReceiverEmail('');
                  setReceiverPhone('');
                  setSelectedFriendEmail('');
                  setSelectedSkin('original');
                }}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all outline-none ${
                  recipientMethod === 'friend'
                    ? 'bg-white text-primary shadow-sm border border-pink-100'
                    : 'text-foreground/50 hover:text-primary'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                친구 목록에서 선택
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecipientMethod('manual');
                  setReceiverName('');
                  setReceiverEmail('');
                  setReceiverPhone('');
                  setSelectedFriendEmail('');
                  setSelectedSkin('original');
                }}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all outline-none ${
                  recipientMethod === 'manual'
                    ? 'bg-white text-primary shadow-sm border border-pink-100'
                    : 'text-foreground/50 hover:text-primary'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                연락처 직접 입력
              </button>
            </div>

            {/* Friend Selector Content */}
            {recipientMethod === 'friend' && (
              <div className="space-y-3">
                {!session ? (
                  <div className="text-center py-4 bg-pink-50/20 rounded-2xl border border-pink-100">
                    <p className="text-xs text-foreground/60 font-bold">친구 목록을 불러오려면 로그인이 필요합니다.</p>
                    <button
                      type="button"
                      onClick={() => router.push('/auth')}
                      className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      로그인하러 가기 ➔
                    </button>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-4 bg-pink-50/20 rounded-2xl border border-pink-100">
                    <p className="text-xs text-foreground/60 font-bold">서로 추가된 친구가 아직 없습니다.</p>
                    <Link
                      href="/profile"
                      className="mt-2 inline-block text-xs font-bold text-primary hover:underline"
                    >
                      프로필에서 친구 추가하러 가기 ➔
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest pl-1">친구 선택</label>
                    <select
                      value={selectedFriendEmail}
                      onChange={e => handleSelectFriend(e.target.value)}
                      className="w-full bg-white border border-pink-150 py-3.5 px-4 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-pink-500/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="">친구를 선택해 주세요</option>
                      {friends.map(f => (
                        <option key={f.email} value={f.email}>
                          {f.name} ({f.email})
                        </option>
                      ))}
                    </select>

                    {selectedFriendEmail && (
                      <div className="p-3.5 bg-pink-50/20 rounded-2xl border border-pink-100 text-xs font-bold text-foreground/80 space-y-1.5">
                        <div className="flex justify-between">
                          <span>받는 사람 이름:</span>
                          <span className="text-foreground font-bold">{receiverName}</span>
                        </div>
                        {receiverPhone && (
                          <div className="flex justify-between">
                            <span>받는 사람 연락처:</span>
                            <span className="text-foreground font-bold">{receiverPhone}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-pink-100 pt-1.5 mt-1 text-primary">
                          <span>서로의 마음 온도:</span>
                          <span className="font-extrabold">🌡️ {currentWarmth.toFixed(1)}°C</span>
                        </div>
                        <p className="text-[10px] text-primary pt-1 font-semibold leading-normal">
                          🔔 결제 완료 시 상대방의 보관함에 즉시 배달되어 알림이 갑니다!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Manual Phone Input Content */}
            {recipientMethod === 'manual' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest pl-1">받는 사람 이름</label>
                  <input
                    type="text"
                    placeholder="받는 사람 이름을 입력해 주세요"
                    maxLength={20}
                    value={receiverName}
                    onChange={e => setReceiverName(e.target.value)}
                    className="w-full bg-white border border-pink-150 py-3.5 pl-4 pr-4 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-pink-500/20 focus:border-primary outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest pl-1">받는 사람 연락처 (휴대폰 번호)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="예: 010-1234-5678"
                      maxLength={15}
                      value={receiverPhone}
                      onChange={e => setReceiverPhone(e.target.value)}
                      className="w-full bg-white border border-pink-150 py-3.5 pl-11 pr-4 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-pink-500/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-foreground/60 font-medium pl-1 leading-normal">
                    받는 분이 서비스에 가입하여 연락처를 등록하면 해당 포춘쿠키를 바로 열 수 있고 알림이 가요! 🔔
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cookie Skin Selector */}
          <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-foreground/75 uppercase tracking-wider block">
                쿠키 비주얼 스킨 선택
              </label>
              <p className="text-[11px] text-foreground/75 mt-0.5 leading-normal">
                {recipientMethod === 'manual' ? (
                  '💡 연락처를 직접 입력할 경우 오리지널 스킨만 이용하실 수 있습니다. 친구 추가 후 마음 온도가 올라가면 특별한 스킨들이 열려요!'
                ) : (
                  '🌡️ 선택된 친구와의 마음 온도에 맞춰 예쁘고 다양한 쿠키 디자인을 선택해 보낼 수 있습니다.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SKINS.map(skin => {
                const isLocked = recipientMethod === 'manual' ? skin.minWarmth > 36.5 : currentWarmth < skin.minWarmth;
                const isSelected = selectedSkin === skin.id;
                return (
                  <button
                    key={skin.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => setSelectedSkin(skin.id)}
                    className={`relative p-3 rounded-2xl border text-center flex flex-col items-center justify-between h-28 transition-all outline-none ${
                      isLocked
                        ? 'bg-pink-50/10 border-pink-100/50 text-foreground/40 opacity-55 cursor-not-allowed'
                        : isSelected
                          ? 'border-primary bg-pink-50 text-primary shadow-sm ring-2 ring-pink-500/20'
                          : 'border-pink-100 bg-white hover:bg-pink-50/50 text-foreground'
                    }`}
                  >
                    {/* Visual Color Circle */}
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${skin.gradientClass} border border-white shadow-sm flex items-center justify-center`}>
                      {isLocked && <span className="text-[10px]">🔒</span>}
                    </div>
                    
                    <div className="mt-2 text-center w-full">
                      <div className="text-xs font-bold truncate">{skin.name}</div>
                      <div className="text-[9px] text-foreground/60 mt-0.5">
                        {isLocked ? `🌡️ ${skin.minWarmth.toFixed(1)}°C` : skin.colorLabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Capsule Reservation (Optional) */}
          <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">타임캡슐 포춘쿠키로 굽기 ⏳</span>
                <span className="text-xs text-foreground/60">원하는 미래의 특정 날짜가 되기 전까지 쿠키를 열 수 없게 만듭니다.</span>
              </div>
              <input
                type="checkbox"
                checked={isTimeCapsule}
                onChange={e => {
                  setIsTimeCapsule(e.target.checked);
                  if (!e.target.checked) {
                    setUnlockDate('');
                  }
                }}
                className="w-5 h-5 text-primary accent-primary rounded focus:ring-pink-500 cursor-pointer"
              />
            </div>

            {isTimeCapsule && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-2 pt-2 border-t border-pink-100"
              >
                <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest pl-1">개봉 가능한 날짜 선택</label>
                <input
                  type="date"
                  min={minDateString}
                  value={unlockDate}
                  onChange={e => setUnlockDate(e.target.value)}
                  className="w-full bg-white border border-pink-150 py-3 px-4 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-pink-500/20 focus:border-primary outline-none transition-all text-foreground cursor-pointer"
                  required={isTimeCapsule}
                />
                <p className="text-[10px] text-primary font-semibold leading-normal pl-1">
                  💡 예약한 날짜의 오전 0시(00:00)부터 상대방이 쿠키를 열 수 있습니다.
                </p>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-foreground/65 uppercase tracking-wider">
              선물 쿠폰 선택 <span className="text-primary font-bold">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COUPON_OPTIONS.map(opt => {
                const isSelected = couponType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCouponType(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-32 outline-none ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-md ring-2 ring-pink-500/20'
                        : 'border-pink-100 bg-white hover:bg-pink-50/50 text-foreground'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-pink-50 text-primary border border-pink-100'
                      }`}>
                        선택
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{opt.name}</h4>
                      <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-foreground/70'}`}>
                        {opt.description}
                      </p>
                    </div>
                    <div className="text-xs font-bold self-end mt-1">
                      {opt.price.toLocaleString()}원
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Content Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-foreground/65 uppercase tracking-wider flex justify-between">
              <span>행운 메시지 작성 <span className="text-primary font-bold">*</span></span>
              <span className="text-[11px] font-semibold text-foreground/60">
                {messageContent.length} / 300 자
              </span>
            </label>
            <textarea
              maxLength={300}
              placeholder="응원의 메시지를 작성해주세요..."
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              className="w-full h-36 bg-white border border-pink-150 p-4 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-500/20 focus:border-primary outline-none resize-none transition-all text-sm font-semibold leading-relaxed text-foreground"
            />
          </div>

          {/* Live Preview */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-foreground/65 uppercase tracking-wider">
              실시간 미리보기
            </label>
            <div className="border border-pink-100 bg-pink-50/20 rounded-2xl p-6 relative flex flex-col items-center text-center shadow-inner">
              <div className="absolute inset-1 border border-dashed border-pink-200/50 rounded-lg pointer-events-none" />
              <div className="text-[10px] font-bold text-primary mb-1 tracking-wider">★ FORTUNE COOKIE ★</div>
              <p className="text-foreground font-bold text-base max-w-md break-keep min-h-[24px]">
                {messageContent ? `"${messageContent}"` : '메시지를 작성하면 여기에 미리 보입니다.'}
              </p>
              <div className="text-[10px] text-foreground/60 mt-2 italic font-semibold">
                From. {senderNickname || '익명'} ➔ To. {receiverName || '받는 사람'}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex-1 bg-white hover:bg-pink-50 border border-pink-200 text-primary font-semibold py-4 px-6 rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>임시 저장</span>
            </button>
            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className="flex-[2] bg-primary hover:bg-pink-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{submitting ? '포춘쿠키 굽는 중...' : '다음 단계: 결제하기'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Bottom Navigation */}
        <div className="mt-12 pt-6 border-t border-pink-100 flex flex-col items-center gap-3">
          <Link
            href="/inbox"
            className="text-xs font-bold text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span>내가 받은 선물함 바로가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function CreateCookie() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center min-h-[450px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-foreground/60">로딩 중...</span>
      </div>
    }>
      <CreateCookieContent />
    </Suspense>
  );
}
