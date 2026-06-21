// Client-side fortune service — communicates via API routes only.
// No direct DB access or Supabase dependency.

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

export const fortuneService = {
  async getMessage(id: string): Promise<FortuneMessage | null> {
    try {
      const res = await fetch(`/api/messages/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('Error fetching message from API:', err);
      return null;
    }
  },

  async markAsPaid(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsPaid' }),
      });
      return res.ok;
    } catch (err) {
      console.error('Error marking as paid via API:', err);
      return false;
    }
  },

  async markAsOpened(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsOpened' }),
      });
      return res.ok;
    } catch (err) {
      console.error('Error marking message as opened via API:', err);
      return false;
    }
  },

  async saveReply(id: string, reply: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveReply', reply }),
      });
      return res.ok;
    } catch (err) {
      console.error('Error saving reply via API:', err);
      return false;
    }
  },

  async toggleLike(id: string): Promise<number> {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleLike' }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.likes;
      }
      return 0;
    } catch (err) {
      console.error('Error toggling like via API:', err);
      return 0;
    }
  },

  async getPublicMessages(): Promise<FortuneMessage[]> {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error('Error fetching public messages via API:', err);
      return [];
    }
  },

  async getReceivedMessages(): Promise<FortuneMessage[]> {
    try {
      const res = await fetch('/api/messages/inbox');
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error('Error fetching received messages via API:', err);
      return [];
    }
  },

  async getSentMessages(): Promise<FortuneMessage[]> {
    try {
      const res = await fetch('/api/messages/sent');
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error('Error fetching sent messages via API:', err);
      return [];
    }
  }
};
