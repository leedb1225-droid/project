'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, Mail, UserPlus, Users, Search, 
  Check, X, Heart, Send, CheckCircle2, AlertCircle, Trash2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'add' | 'requests'>('profile');
  
  // Profile settings state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [profileError, setProfileError] = useState('');

  // Friends state
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [incoming, setIncoming] = useState<UserProfile[]>([]);
  const [outgoing, setOutgoing] = useState<UserProfile[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Search friend state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Load initial data
  const loadProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data: UserProfile = await res.json();
        setProfile(data);
        setName(data.name);
        setPhone(data.phone || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadFriends = async () => {
    setLoadingFriends(true);
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
        setIncoming(data.incoming || []);
        setOutgoing(data.outgoing || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadProfile();
      loadFriends();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[450px]">
        <div className="w-10 h-10 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">불러오는 중...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-pink-100 rounded-3xl shadow-xl p-8 space-y-6">
          <div className="w-16 h-16 bg-pink-50 text-primary rounded-2xl flex items-center justify-center mx-auto text-3xl border border-pink-100">
            🔒
          </div>
          <h1 className="text-xl font-bold text-foreground">로그인이 필요한 페이지입니다</h1>
          <p className="text-sm text-foreground/75 break-keep">
            프로필 설정 및 친구 관리 서비스를 이용하시려면 Google 로그인이 필요합니다.
          </p>
          <Link
            href="/"
            className="w-full inline-block bg-primary hover:bg-pink-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow transition-all duration-300"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    );
  }

  // Handle profile update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setProfileError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const data = await res.json();
        setProfileError(data.error || '저장 중 오류가 발생했습니다.');
        setSaveStatus('error');
      }
    } catch (e) {
      setProfileError('서버 연결 중 오류가 발생했습니다.');
      setSaveStatus('error');
    }
  };

  // Search User
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);
    setRequestStatus('idle');

    try {
      const response = await fetch(`/api/friends?search=${encodeURIComponent(searchQuery.trim())}`);
      if (response.ok) {
        const data = await response.json();
        if (data.searchResult) {
          setSearchResult(data.searchResult);
        } else {
          setSearchError('해당 이메일이나 연락처를 사용하는 사용자를 찾을 수 없습니다.');
        }
      } else {
        setSearchError('사용자 검색 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setSearchError('서버 통신 오류가 발생했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Friend Request Action
  const handleFriendAction = async (action: 'request' | 'accept' | 'decline' | 'remove', targetEmail: string) => {
    if (action === 'request') setRequestStatus('sending');

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target: targetEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (action === 'request') {
          setRequestStatus('sent');
        }
        // Reload friends lists
        await loadFriends();
      } else {
        if (action === 'request') {
          setSearchError(data.error || '요청 실패');
          setRequestStatus('error');
        } else {
          alert(data.error || '작업 실패');
        }
      }
    } catch (e) {
      console.error(e);
      if (action === 'request') setRequestStatus('error');
    }
  };

  // Check relationship for search result card
  const getRelationStatus = (email: string) => {
    if (!profile) return 'none';
    if (friends.some(f => f.email === email)) return 'friend';
    if (incoming.some(f => f.email === email)) return 'incoming';
    if (outgoing.some(f => f.email === email)) return 'outgoing';
    return 'none';
  };

  const pendingRequestsCount = incoming.length;

  return (
    <div className="flex-1 bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            <span>메인으로</span>
          </Link>
          <div className="text-right">
            <span className="text-[10px] font-black text-primary bg-pink-100/60 px-3 py-1 rounded-full border border-pink-200/40">
              MY ACCOUNT
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-gradient-to-r from-white to-pink-50 border border-pink-100 rounded-3xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          {/* Subtle Glow background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300/10 rounded-full blur-2xl pointer-events-none" />
          
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || 'User'} 
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-pink-100 object-cover shadow-md"
            />
          ) : (
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-pink-50 text-primary flex items-center justify-center border border-pink-100 text-3xl shadow-inner">
              🥠
            </div>
          )}

          <div className="text-center sm:text-left flex-1 space-y-1">
            <h2 className="text-2xl font-bold text-foreground">
              {profile?.name || session.user?.name || '사용자'}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs text-foreground/75 font-semibold">
              <span className="flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-primary" />
                {session.user?.email}
              </span>
              {profile?.phone && (
                <span className="flex items-center justify-center sm:justify-start gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  {profile.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-pink-100 overflow-x-auto pb-px gap-2">
          {[
            { id: 'profile', label: '내 프로필', icon: User },
            { id: 'friends', label: '친구 목록', icon: Users, count: friends.length },
            { id: 'add', label: '친구 찾기', icon: UserPlus },
            { id: 'requests', label: '친구 요청', icon: Send, count: pendingRequestsCount },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all shrink-0 -mb-px outline-none ${
                  isActive 
                    ? 'border-primary text-primary font-semibold' 
                    : 'border-transparent text-foreground/60 hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-primary text-white' : 'bg-pink-50 text-primary border border-pink-100'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="bg-white border border-pink-100 rounded-3xl shadow-sm p-6 min-h-[350px]">
          <AnimatePresence mode="wait">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-foreground">내 정보 설정</h3>
                  <p className="text-xs text-foreground/70 mt-1">포춘쿠키 알림 및 본인 인증에 필요한 정보를 업데이트합니다.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">로그인 이메일</label>
                    <input 
                      type="text" 
                      value={session.user?.email || ''} 
                      disabled 
                      className="w-full bg-pink-50/30 text-foreground/50 border border-pink-100 py-3.5 px-4 rounded-2xl text-sm font-semibold opacity-60 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">이름 / 닉네임</label>
                    <input 
                      type="text" 
                      placeholder="내 이름이나 닉네임을 입력해 주세요"
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      maxLength={20}
                      className="w-full bg-white border border-pink-150 py-3.5 px-4 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-pink-500/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">연락처 (휴대폰 번호)</label>
                    <input 
                      type="text" 
                      placeholder="예: 010-1234-5678"
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      maxLength={15}
                      className="w-full bg-white border border-pink-150 py-3.5 px-4 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-pink-500/20 focus:border-primary outline-none transition-all"
                    />
                    <p className="text-[11px] text-foreground/70 leading-normal pl-1">
                      💡 휴대폰 번호를 등록하면 친구들이 이메일을 작성할 필요 없이, 이 번호만 적어 보내도 내 포춘쿠키 보관함으로 포춘쿠키가 바로 배달되어 알림이 와요!
                    </p>
                  </div>

                  {profileError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-500 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className="w-full bg-primary hover:bg-pink-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saveStatus === 'saving' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : saveStatus === 'saved' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>저장 완료되었습니다</span>
                      </>
                    ) : (
                      <span>내 프로필 저장</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-foreground">내 친구 목록</h3>
                  <p className="text-xs text-foreground/70 mt-1">포춘쿠키를 빠르게 보낼 수 있는 내 서로 친구들입니다.</p>
                </div>

                {loadingFriends ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : friends.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="text-5xl opacity-70">🤝</div>
                    <p className="text-sm font-bold text-foreground/80">등록된 친구가 없습니다</p>
                    <p className="text-xs text-foreground/60 max-w-[280px] mx-auto break-keep">
                      '친구 찾기' 탭에서 이메일이나 연락처로 친구를 등록해 서로 추가해보세요!
                    </p>
                    <button 
                      onClick={() => setActiveTab('add')}
                      className="py-2 px-4 bg-pink-50 hover:bg-pink-100 border border-pink-100 text-primary rounded-xl text-xs font-bold transition-all"
                    >
                      친구 찾으러 가기
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-pink-100">
                    {friends.map((friend) => {
                      const warmth = friend.warmth ?? 36.5;
                      const percent = (warmth / 99.9) * 100;
                      return (
                        <li key={friend.email} className="py-5 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 border-b border-pink-50 last:border-b-0">
                          <div className="flex items-start gap-3 w-full sm:w-auto">
                            {friend.avatar_url ? (
                              <img 
                                src={friend.avatar_url} 
                                alt={friend.name} 
                                className="w-11 h-11 rounded-xl object-cover border border-pink-100"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-pink-50 text-primary flex items-center justify-center border border-pink-100 text-base font-bold">
                                {friend.name[0]}
                              </div>
                            )}
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm text-foreground">{friend.name}</h4>
                              <p className="text-[11px] text-foreground/70 font-medium">
                                {friend.email} {friend.phone ? `| ${friend.phone}` : ''}
                              </p>
                              
                              {/* Thermometer Status Bar */}
                              <div className="flex flex-col gap-1 w-48 pt-1">
                                <div className="flex justify-between items-center text-[10px] font-semibold text-primary">
                                  <span className="flex items-center gap-0.5">🌡️ 마음 온도</span>
                                  <span>{warmth.toFixed(1)}°C</span>
                                </div>
                                <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>

                            </div>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto self-end sm:self-center">
                            <button
                              onClick={() => router.push(`/create?email=${encodeURIComponent(friend.email)}`)}
                              className="flex-1 sm:flex-initial py-2 px-4 bg-primary hover:bg-pink-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-all text-center"
                            >
                              🥠 쿠키 보내기
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`${friend.name} 님을 친구 목록에서 삭제하시겠습니까?`)) {
                                  handleFriendAction('remove', friend.email);
                                }
                              }}
                              className="py-2 px-3 border border-pink-200 hover:bg-pink-50 text-primary rounded-xl transition-all"
                              title="친구 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            )}

            {/* Add Friend Tab */}
            {activeTab === 'add' && (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-foreground">친구 추가하기</h3>
                  <p className="text-xs text-foreground/70 mt-1">상대방의 이메일 주소 또는 가입 시 등록한 연락처로 검색하세요.</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 w-4.5 h-4.5" />
                    <input 
                      type="text" 
                      placeholder="이메일 또는 연락처(예: 01012345678) 입력..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-pink-150 py-3.5 pl-11 pr-4 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-pink-500/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="bg-primary hover:bg-pink-600 text-white font-semibold px-6 rounded-2xl flex items-center justify-center gap-1.5 transition-all text-xs shadow-sm"
                  >
                    {searchLoading ? '검색 중...' : '검색'}
                  </button>
                </form>

                {searchError && (
                  <div className="p-4 bg-pink-50/20 rounded-2xl border border-pink-100 text-foreground/70 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}

                {searchResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 border border-pink-100 bg-gradient-to-r from-white to-pink-50 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {searchResult.avatar_url ? (
                        <img 
                          src={searchResult.avatar_url} 
                          alt={searchResult.name} 
                          className="w-12 h-12 rounded-xl object-cover shadow-sm border border-pink-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-pink-100 text-primary flex items-center justify-center border font-bold text-lg shadow-inner">
                          {searchResult.name[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          {searchResult.name}
                        </h4>
                        <p className="text-xs text-foreground/70 font-semibold mt-0.5">{searchResult.email}</p>
                      </div>
                    </div>

                    <div>
                      {(() => {
                        const status = getRelationStatus(searchResult.email);
                        if (status === 'friend') {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-xs text-foreground/60 font-bold bg-pink-100/40 px-4 py-2.5 rounded-2xl">
                              <Check className="w-3.5 h-3.5 text-primary" />
                              이미 친구입니다 (🌡️ {(searchResult.warmth ?? 36.5).toFixed(1)}°C)
                            </span>
                          );
                        }
                        if (status === 'outgoing') {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-xs text-foreground/60 font-bold bg-pink-100/40 px-4 py-2.5 rounded-2xl">
                              요청 승인 대기 중
                            </span>
                          );
                        }
                        if (status === 'incoming') {
                          return (
                            <button
                              onClick={() => handleFriendAction('accept', searchResult.email)}
                              className="py-2.5 px-5 bg-primary hover:bg-pink-600 text-white font-semibold text-xs rounded-2xl shadow transition-all"
                            >
                              친구 요청 수락
                            </button>
                          );
                        }
                        
                        return (
                          <button
                            onClick={() => handleFriendAction('request', searchResult.email)}
                            disabled={requestStatus === 'sending'}
                            className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-primary hover:bg-pink-600 text-white font-semibold text-xs rounded-2xl shadow transition-all disabled:opacity-50"
                          >
                            {requestStatus === 'sending' ? (
                              '전송 중...'
                            ) : requestStatus === 'sent' ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>요청 완료</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>친구 신청</span>
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Friend Requests Tab */}
            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Incoming Requests */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span>받은 친구 요청</span>
                      {incoming.length > 0 && (
                        <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                          {incoming.length}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-foreground/70 mt-1">상대방이 나를 친구로 추가하고 수락을 대기하는 요청입니다.</p>
                  </div>

                  {incoming.length === 0 ? (
                    <div className="py-6 text-center text-xs text-foreground/60 font-semibold border border-dashed border-pink-100 rounded-2xl">
                      받은 요청이 없습니다.
                    </div>
                  ) : (
                    <ul className="divide-y divide-pink-100 border border-pink-100 rounded-3xl p-4 bg-gradient-to-r from-white to-pink-50/30">
                      {incoming.map((req) => (
                        <li key={req.email} className="py-3.5 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            {req.avatar_url ? (
                              <img 
                                src={req.avatar_url} 
                                alt={req.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-pink-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-pink-100 text-primary flex items-center justify-center border font-bold text-sm">
                                {req.name[0]}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{req.name}</h4>
                              <p className="text-[10px] text-foreground/70">{req.email}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleFriendAction('accept', req.email)}
                              className="flex-1 sm:flex-initial py-2 px-4 bg-primary hover:bg-pink-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                            >
                              수락
                            </button>
                            <button
                              onClick={() => handleFriendAction('decline', req.email)}
                              className="flex-1 sm:flex-initial py-2 px-4 bg-pink-50 hover:bg-pink-100 border border-pink-100 text-primary font-bold text-xs rounded-xl transition-all"
                            >
                              거절
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Outgoing Requests */}
                <div className="space-y-4 pt-4 border-t border-pink-100">
                  <div>
                    <h3 className="text-base font-bold text-foreground">보낸 친구 요청</h3>
                    <p className="text-xs text-foreground/70 mt-1">내가 상대방에게 친구 신청을 하고 수락을 기다리는 목록입니다.</p>
                  </div>

                  {outgoing.length === 0 ? (
                    <div className="py-6 text-center text-xs text-foreground/60 font-semibold border border-dashed border-pink-100 rounded-2xl">
                      보낸 요청이 없습니다.
                    </div>
                  ) : (
                    <ul className="divide-y divide-pink-100 border border-pink-100 rounded-3xl p-4 bg-gradient-to-r from-white to-pink-50/30">
                      {outgoing.map((req) => (
                        <li key={req.email} className="py-3.5 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            {req.avatar_url ? (
                              <img 
                                src={req.avatar_url} 
                                alt={req.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-pink-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-pink-100 text-primary flex items-center justify-center border font-bold text-sm">
                                {req.name[0]}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{req.name}</h4>
                              <p className="text-[10px] text-foreground/70">{req.email}</p>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex justify-end">
                            <button
                              onClick={() => handleFriendAction('decline', req.email)}
                              className="w-full sm:w-auto py-2 px-4 bg-pink-50 hover:bg-pink-100 border border-pink-100 text-primary font-bold text-xs rounded-xl transition-all"
                            >
                              요청 취소
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
