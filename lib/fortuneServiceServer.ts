import fs from 'fs';
import path from 'path';

export interface FortuneMessage {
  id: string;
  sender_nickname?: string;
  sender_email?: string | null;
  receiver_name?: string;
  receiver_email?: string | null;
  receiver_phone?: string | null;
  message_content: string;
  coupon_type: string;
  payment_status: 'pending' | 'paid';
  is_opened: boolean;
  opened_at?: string | null;
  reply?: string | null;
  replied_at?: string | null;
  is_public: boolean;
  likes: number;
  created_at: string;
  cookie_skin?: string | null;
  unlock_at?: string | null;
}

export interface AppNotification {
  id: string;
  user_email: string;
  user_phone?: string | null;
  message_id: string;
  sender_nickname: string;
  coupon_type: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface UserProfile {
  email: string;
  name: string;
  phone?: string | null;
  avatar_url?: string | null;
  friends: string[];            // 친구들의 email 목록
  friendWarmth?: Record<string, number>; // 친구별 마음 온도 매핑
  incomingRequests: string[];   // 친구 요청을 보낸 이들의 email 목록
  outgoingRequests: string[];   // 친구 요청을 받은 이들의 email 목록
}

// ──────────────────────────────────────────────────────────────
// File-based store helpers
// ──────────────────────────────────────────────────────────────

const MESSAGES_FILE = 'cookies_db.json';
const NOTIFICATIONS_FILE = 'notifications_db.json';

function getFilePath(filename: string) {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), filename);
}

// --- Messages ---

let memoryStore: FortuneMessage[] = [
  {
    id: 'fortune-mock-1',
    message_content: '새로운 바람이 불어오고 있어요. 당신의 도전을 응원합니다!',
    sender_nickname: '우주',
    receiver_name: '당신',
    coupon_type: 'coffee',
    payment_status: 'paid',
    is_opened: true,
    opened_at: new Date().toISOString(),
    reply: '따뜻한 격려 감사합니다!',
    replied_at: new Date().toISOString(),
    is_public: true,
    likes: 12,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'fortune-mock-2',
    message_content: '가장 가까운 곳에 있는 사람이 당신의 행운의 열쇠를 쥐고 있습니다.',
    sender_nickname: '비밀친구',
    receiver_name: '행운아',
    coupon_type: 'dessert',
    payment_status: 'paid',
    is_opened: true,
    opened_at: new Date().toISOString(),
    reply: '설마 내 옆자리 대리님...?',
    replied_at: new Date().toISOString(),
    is_public: true,
    likes: 42,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'fortune-mock-3',
    message_content: '머지않아 노력한 만큼의 달콤한 결실을 맺게 될 것입니다. 힘내세요!',
    sender_nickname: '열정멘토',
    receiver_name: '도전자',
    coupon_type: 'meal',
    payment_status: 'paid',
    is_opened: false,
    is_public: true,
    likes: 27,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  }
];

function loadMessages() {
  const filePath = getFilePath(MESSAGES_FILE);
  try {
    if (fs.existsSync(filePath)) {
      memoryStore = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } else {
      fs.writeFileSync(filePath, JSON.stringify(memoryStore, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error loading messages:', err);
  }
}

function saveMessages() {
  try {
    fs.writeFileSync(getFilePath(MESSAGES_FILE), JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving messages:', err);
  }
}

// --- Notifications ---

let notificationsStore: AppNotification[] = [];

function loadNotifications() {
  const filePath = getFilePath(NOTIFICATIONS_FILE);
  try {
    if (fs.existsSync(filePath)) {
      notificationsStore = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } else {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error loading notifications:', err);
  }
}

function saveNotifications() {
  try {
    fs.writeFileSync(getFilePath(NOTIFICATIONS_FILE), JSON.stringify(notificationsStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
}

// --- Users ---

const USERS_FILE = 'users_db.json';
let usersStore: UserProfile[] = [];

function loadUsers() {
  const filePath = getFilePath(USERS_FILE);
  try {
    if (fs.existsSync(filePath)) {
      usersStore = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } else {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error loading users:', err);
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(getFilePath(USERS_FILE), JSON.stringify(usersStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

// Initial load
loadMessages();
loadNotifications();
loadUsers();

// ──────────────────────────────────────────────────────────────
// Service
// ──────────────────────────────────────────────────────────────

export const fortuneServiceServer = {
  async getMessage(id: string): Promise<FortuneMessage | null> {
    loadMessages();
    return memoryStore.find(m => m.id === id) || null;
  },

  async createMessage(params: Omit<FortuneMessage, 'id' | 'payment_status' | 'is_opened' | 'likes' | 'created_at'>): Promise<FortuneMessage> {
    loadMessages();
    const id = 'c_' + Math.random().toString(36).substring(2, 9);
    const newMessage: FortuneMessage = {
      ...params,
      id,
      payment_status: 'pending',
      is_opened: false,
      likes: 0,
      created_at: new Date().toISOString(),
    };
    memoryStore.push(newMessage);
    saveMessages();
    return newMessage;
  },

  async markAsPaid(id: string): Promise<boolean> {
    loadMessages();
    const message = memoryStore.find(m => m.id === id);
    if (message) {
      message.payment_status = 'paid';
      saveMessages();
      return true;
    }
    return false;
  },

  async markAsOpened(id: string): Promise<boolean> {
    const opened_at = new Date().toISOString();
    loadMessages();
    const message = memoryStore.find(m => m.id === id);
    if (message) {
      message.is_opened = true;
      message.opened_at = opened_at;
      saveMessages();
      return true;
    }
    return false;
  },

  async saveReply(id: string, reply: string): Promise<boolean> {
    const replied_at = new Date().toISOString();
    loadMessages();
    const message = memoryStore.find(m => m.id === id);
    if (message) {
      message.reply = reply;
      message.replied_at = replied_at;
      saveMessages();
      return true;
    }
    return false;
  },

  async toggleLike(id: string): Promise<number> {
    loadMessages();
    const message = memoryStore.find(m => m.id === id);
    if (message) {
      message.likes = (message.likes || 0) + 1;
      saveMessages();
      return message.likes;
    }
    return 0;
  },

  async getPublicMessages(): Promise<FortuneMessage[]> {
    loadMessages();
    return memoryStore
      .filter(m => m.payment_status === 'paid' && m.is_public)
      .sort((a, b) => b.likes - a.likes);
  },

  // ── Notification methods (file-based) ──

  async createNotification(params: {
    user_email?: string | null;
    user_phone?: string | null;
    message_id: string;
    sender_nickname: string;
    coupon_type: string;
    type?: string;
  }): Promise<boolean> {
    loadNotifications();

    let targetEmail = params.user_email || '';
    if (!targetEmail && params.user_phone) {
      loadUsers();
      const normalizedPhone = params.user_phone.replace(/[^0-9]/g, '');
      const user = usersStore.find(u => u.phone && u.phone.replace(/[^0-9]/g, '') === normalizedPhone);
      if (user) {
        targetEmail = user.email;
      }
    }

    const newNotif: AppNotification = {
      id: 'n_' + Math.random().toString(36).substring(2, 11),
      user_email: targetEmail,
      user_phone: params.user_phone || null,
      message_id: params.message_id,
      sender_nickname: params.sender_nickname,
      coupon_type: params.coupon_type,
      type: params.type || 'fortune_cookie',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notificationsStore.unshift(newNotif);
    saveNotifications();
    return true;
  },

  async getNotifications(userEmail: string, userPhone?: string | null): Promise<AppNotification[]> {
    loadNotifications();
    const normalizedPhone = userPhone ? userPhone.replace(/[^0-9]/g, '') : null;
    let hasChanges = false;

    const userNotifs = notificationsStore.filter(n => {
      const emailMatch = n.user_email === userEmail;
      const phoneMatch = normalizedPhone && n.user_phone && n.user_phone.replace(/[^0-9]/g, '') === normalizedPhone;

      if (phoneMatch && !emailMatch) {
        n.user_email = userEmail; // claim it!
        hasChanges = true;
      }

      return emailMatch || phoneMatch;
    });

    if (hasChanges) {
      saveNotifications();
    }

    return userNotifs.slice(0, 30);
  },

  async markNotificationRead(notificationId: string): Promise<boolean> {
    loadNotifications();
    const notif = notificationsStore.find(n => n.id === notificationId);
    if (notif) {
      notif.is_read = true;
      saveNotifications();
      return true;
    }
    return false;
  },

  async markAllNotificationsRead(userEmail: string): Promise<boolean> {
    loadNotifications();
    notificationsStore
      .filter(n => n.user_email === userEmail && !n.is_read)
      .forEach(n => { n.is_read = true; });
    saveNotifications();
    return true;
  },

  // ── User Profiles ──

  async getUserProfile(email: string, defaults?: Partial<UserProfile>): Promise<UserProfile> {
    loadUsers();
    let user = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        email,
        name: defaults?.name || email.split('@')[0],
        phone: defaults?.phone || null,
        avatar_url: defaults?.avatar_url || null,
        friends: [],
        incomingRequests: [],
        outgoingRequests: [],
      };
      usersStore.push(user);
      saveUsers();
    } else {
      // Keep avatar up-to-date if provided
      if (defaults?.avatar_url && user.avatar_url !== defaults.avatar_url) {
        user.avatar_url = defaults.avatar_url;
        saveUsers();
      }
    }
    return user;
  },

  async updateUserProfile(email: string, params: { name: string; phone?: string | null }): Promise<UserProfile> {
    loadUsers();
    let user = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        email,
        name: params.name,
        phone: params.phone || null,
        friends: [],
        incomingRequests: [],
        outgoingRequests: [],
      };
      usersStore.push(user);
    } else {
      user.name = params.name;
      user.phone = params.phone || null;
    }
    saveUsers();
    return user;
  },

  // ── Friends Management ──

  async searchUser(query: string): Promise<UserProfile | null> {
    loadUsers();
    const cleanQuery = query.trim();
    if (!cleanQuery) return null;

    const normalizedQueryPhone = cleanQuery.replace(/[^0-9]/g, '');

    return usersStore.find(u => {
      const emailMatch = u.email.toLowerCase() === cleanQuery.toLowerCase();
      const phoneMatch = normalizedQueryPhone && u.phone && u.phone.replace(/[^0-9]/g, '') === normalizedQueryPhone;
      return emailMatch || phoneMatch;
    }) || null;
  },

  async sendFriendRequest(senderEmail: string, targetQuery: string): Promise<{ success: boolean; error?: string }> {
    loadUsers();
    const sender = usersStore.find(u => u.email.toLowerCase() === senderEmail.toLowerCase());
    if (!sender) return { success: false, error: '보내는 사용자를 찾을 수 없습니다.' };

    const target = await this.searchUser(targetQuery);
    if (!target) return { success: false, error: '대상을 찾을 수 없습니다. 등록된 이메일이나 연락처를 정확히 입력해주세요.' };

    if (target.email.toLowerCase() === senderEmail.toLowerCase()) {
      return { success: false, error: '자기 자신에게는 친구 요청을 보낼 수 없습니다.' };
    }

    if (!sender.friends) sender.friends = [];
    if (!sender.outgoingRequests) sender.outgoingRequests = [];
    if (!sender.incomingRequests) sender.incomingRequests = [];
    if (!target.friends) target.friends = [];
    if (!target.incomingRequests) target.incomingRequests = [];
    if (!target.outgoingRequests) target.outgoingRequests = [];

    if (sender.friends.includes(target.email)) {
      return { success: false, error: '이미 친구로 등록되어 있습니다.' };
    }

    if (sender.outgoingRequests.includes(target.email)) {
      return { success: false, error: '이미 친구 요청을 보냈습니다.' };
    }

    if (sender.incomingRequests.includes(target.email)) {
      // Mutual accept
      await this.acceptFriendRequest(senderEmail, target.email);
      return { success: true };
    }

    sender.outgoingRequests.push(target.email);
    target.incomingRequests.push(sender.email);

    saveUsers();
    return { success: true };
  },

  async acceptFriendRequest(receiverEmail: string, senderEmail: string): Promise<boolean> {
    loadUsers();
    const receiver = usersStore.find(u => u.email.toLowerCase() === receiverEmail.toLowerCase());
    const sender = usersStore.find(u => u.email.toLowerCase() === senderEmail.toLowerCase());

    if (!receiver || !sender) return false;

    receiver.incomingRequests = (receiver.incomingRequests || []).filter(e => e.toLowerCase() !== senderEmail.toLowerCase());
    sender.outgoingRequests = (sender.outgoingRequests || []).filter(e => e.toLowerCase() !== receiverEmail.toLowerCase());

    if (!receiver.friends) receiver.friends = [];
    if (!sender.friends) sender.friends = [];

    if (!receiver.friends.includes(sender.email)) receiver.friends.push(sender.email);
    if (!sender.friends.includes(receiver.email)) sender.friends.push(receiver.email);

    // Initialize friendship warmth to 36.5°C
    if (!receiver.friendWarmth) receiver.friendWarmth = {};
    if (!sender.friendWarmth) sender.friendWarmth = {};
    if (receiver.friendWarmth[sender.email] === undefined) receiver.friendWarmth[sender.email] = 36.5;
    if (sender.friendWarmth[receiver.email] === undefined) sender.friendWarmth[receiver.email] = 36.5;

    saveUsers();
    return true;
  },

  async declineFriendRequest(receiverEmail: string, senderEmail: string): Promise<boolean> {
    loadUsers();
    const receiver = usersStore.find(u => u.email.toLowerCase() === receiverEmail.toLowerCase());
    const sender = usersStore.find(u => u.email.toLowerCase() === senderEmail.toLowerCase());

    if (!receiver || !sender) return false;

    receiver.incomingRequests = (receiver.incomingRequests || []).filter(e => e.toLowerCase() !== senderEmail.toLowerCase());
    sender.outgoingRequests = (sender.outgoingRequests || []).filter(e => e.toLowerCase() !== receiverEmail.toLowerCase());

    saveUsers();
    return true;
  },

  async removeFriend(userEmail: string, friendEmail: string): Promise<boolean> {
    loadUsers();
    const user = usersStore.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    const friend = usersStore.find(u => u.email.toLowerCase() === friendEmail.toLowerCase());

    if (!user || !friend) return false;

    user.friends = (user.friends || []).filter(e => e.toLowerCase() !== friendEmail.toLowerCase());
    friend.friends = (friend.friends || []).filter(e => e.toLowerCase() !== userEmail.toLowerCase());

    // Clean up warmth records
    if (user.friendWarmth) delete user.friendWarmth[friend.email];
    if (friend.friendWarmth) delete friend.friendWarmth[user.email];

    saveUsers();
    return true;
  },

  async getMutualFriends(userEmail: string): Promise<UserProfile[]> {
    loadUsers();
    const user = usersStore.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (!user || !user.friends) return [];

    return usersStore.filter(u => user.friends.includes(u.email));
  },

  async getReceivedMessages(email: string, phone?: string | null): Promise<FortuneMessage[]> {
    loadMessages();
    const normalizedPhone = phone ? phone.replace(/[^0-9]/g, '') : null;

    return memoryStore
      .filter(m => 
        m.payment_status === 'paid' && 
        (
          (m.receiver_email && m.receiver_email.toLowerCase() === email.toLowerCase()) ||
          (normalizedPhone && m.receiver_phone && m.receiver_phone.replace(/[^0-9]/g, '') === normalizedPhone)
        )
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getSentMessages(email: string): Promise<FortuneMessage[]> {
    loadMessages();
    return memoryStore
      .filter(m => 
        m.payment_status === 'paid' && 
        m.sender_email && m.sender_email.toLowerCase() === email.toLowerCase()
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async increaseWarmth(emailA: string, emailB: string, amount: number): Promise<void> {
    loadUsers();
    const userA = usersStore.find(u => u.email.toLowerCase() === emailA.toLowerCase());
    const userB = usersStore.find(u => u.email.toLowerCase() === emailB.toLowerCase());

    if (userA && userB) {
      if (!userA.friendWarmth) userA.friendWarmth = {};
      if (!userB.friendWarmth) userB.friendWarmth = {};

      const currentA = userA.friendWarmth[userB.email] ?? 36.5;
      const newWarmth = Math.min(99.9, Math.max(36.5, currentA + amount));
      
      userA.friendWarmth[userB.email] = Number(newWarmth.toFixed(1));
      userB.friendWarmth[userA.email] = Number(newWarmth.toFixed(1));

      saveUsers();
    }
  },
};
