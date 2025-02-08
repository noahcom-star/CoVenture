'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';

interface ChatSectionProps {
  currentUser: UserProfile;
}

interface ChatPartner extends UserProfile {
  lastMessage?: string;
  lastMessageTime?: string;
}

export default function ChatSection({ currentUser }: ChatSectionProps) {
  const [connectedUsers, setConnectedUsers] = useState<ChatPartner[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnectedUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id);
    }
  }, [selectedUser]);

  const fetchConnectedUsers = async () => {
    try {
      setLoading(true);
      // Fetch users who have accepted connections with the current user
      const { data: connections, error } = await supabase
        .from('matches')
        .select('*, profiles!matches_user1_id_fkey(*), profiles!matches_user2_id_fkey(*)')
        .or(`user1_id.eq.${currentUser.user_id},user2_id.eq.${currentUser.user_id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      const connectedProfiles = connections.map(conn => {
        const profile = conn.user1_id === currentUser.user_id 
          ? conn.profiles.user2_id_fkey 
          : conn.profiles.user1_id_fkey;
        return {
          ...profile,
          matchId: conn.id
        };
      });

      setConnectedUsers(connectedProfiles);
    } catch (error) {
      console.error('Error fetching connected users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(from_id.eq.${currentUser.user_id},to_id.eq.${partnerId}),and(from_id.eq.${partnerId},to_id.eq.${currentUser.user_id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          from_id: currentUser.user_id,
          to_id: selectedUser.user_id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedUser.user_id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl">
      <div className="grid grid-cols-3 h-full">
        {/* Connected Users List */}
        <div className="border-r border-[var(--navy-dark)] p-4">
          <h3 className="text-xl font-semibold text-[var(--white)] mb-4">Messages</h3>
          {connectedUsers.length > 0 ? (
            <div className="space-y-2">
              {connectedUsers.map((user) => (
                <motion.button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-[var(--accent)]/20'
                      : 'hover:bg-[var(--navy-dark)]'
                  }`}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                      <span className="text-lg text-[var(--accent)]">
                        {user.full_name[0]}
                      </span>
                    </div>
                  )}
                  <div className="ml-3 text-left">
                    <h4 className="text-[var(--white)] font-medium">{user.full_name}</h4>
                    <p className="text-sm text-[var(--slate)] truncate">
                      {user.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center text-[var(--slate)]">
              <p>No connected users yet.</p>
              <p className="text-sm mt-2">Connect with others to start chatting!</p>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="col-span-2 flex flex-col h-full">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--navy-dark)]">
                <div className="flex items-center">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                      <span className="text-lg text-[var(--accent)]">
                        {selectedUser.full_name[0]}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <h4 className="text-[var(--white)] font-medium">{selectedUser.full_name}</h4>
                    <p className="text-sm text-[var(--slate)]">{selectedUser.project_status === 'looking' ? 'Looking for Projects' : 'Has Project Idea'}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.from_id === currentUser.user_id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.from_id === currentUser.user_id
                          ? 'bg-[var(--accent)] text-[var(--navy-dark)]'
                          : 'bg-[var(--navy-dark)] text-[var(--white)]'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-[var(--navy-dark)]">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[var(--navy-dark)] text-[var(--white)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--slate)]">
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 