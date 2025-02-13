'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import ChatModal from './ChatModal';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useUser } from '@/lib/hooks/useUser';

interface ChatSectionProps {
  currentUser: UserProfile;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  title: string;
  otherUser: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export default function ChatSection({ currentUser }: ChatSectionProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchChatRooms();
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up chat updates subscription');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user]);

  const fetchChatRooms = async () => {
    if (!user) return;

    try {
      const { data: projectChats, error: projectError } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          title,
          creator_id,
          creator:profiles(user_id, full_name, avatar_url)
        `)
        .eq('creator_id', user.id);

      const { data: applicationChats, error: applicationError } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          applicant_id,
          applicant:profiles(user_id, full_name, avatar_url)
        `)
        .eq('applicant_id', user.id);

      if (projectError) throw projectError;
      if (applicationError) throw applicationError;

      const allChats = [
        ...(projectChats || []).map(chat => ({
          id: chat.id,
          title: chat.title,
          otherUser: {
            user_id: chat.creator[0]?.user_id,
            full_name: chat.creator[0]?.full_name,
            avatar_url: chat.creator[0]?.avatar_url
          }
        })),
        ...(applicationChats || []).map(chat => ({
          id: chat.id,
          title: 'Application Chat',
          otherUser: {
            user_id: chat.applicant[0]?.user_id,
            full_name: chat.applicant[0]?.full_name,
            avatar_url: chat.applicant[0]?.avatar_url
          }
        }))
      ];

      setChatRooms(allChats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load chat rooms');
    }
  };

  const setupRealtimeSubscription = async () => {
    try {
      // Clean up existing subscription if any
      if (channelRef.current) {
        await channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      // Create new subscription
      const channel = supabase.channel('chat_updates', {
        config: {
          broadcast: { self: true },
          presence: { key: user?.id },
        },
      });

      channel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `creator_id=eq.${user?.id}`,
        }, () => {
          console.log('Chat room changes detected, refreshing...');
          fetchChatRooms();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `applicant_id=eq.${user?.id}`,
        }, () => {
          console.log('Chat room changes detected, refreshing...');
          fetchChatRooms();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to chat updates');
          } else {
            console.log('Subscription status:', status);
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      toast.error('Failed to connect to chat updates');
    }
  };

  const getOtherUser = (room: ChatRoom) => {
    const isCreator = room.project.creator.user_id === currentUser.user_id;
    return isCreator ? room.application.applicant : room.project.creator;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl">
      <div className="grid grid-cols-3 h-full">
        {/* Chat Rooms List */}
        <div className="border-r border-[var(--navy-dark)] p-4">
          <h3 className="text-xl font-semibold text-[var(--white)] mb-4">Messages</h3>
          {chatRooms.length > 0 ? (
            <div className="space-y-2">
              {chatRooms.map((room) => {
                const otherUser = getOtherUser(room);
                return (
                  <motion.button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      selectedRoom?.id === room.id
                        ? 'bg-[var(--accent)]/20'
                        : 'hover:bg-[var(--navy-dark)]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                      <span className="text-lg text-[var(--accent)]">
                        {otherUser.full_name?.[0] || '?'}
                      </span>
                    </div>
                    <div className="ml-3 text-left">
                      <h4 className="text-[var(--white)] font-medium">{otherUser.full_name}</h4>
                      <p className="text-sm text-[var(--slate)] truncate">
                        {room.project.title}
                      </p>
                      {room.last_message && (
                        <p className="text-xs text-[var(--slate)] mt-1">
                          {new Date(room.last_message.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-[var(--slate)]">
              <p>No messages yet.</p>
              <p className="text-sm mt-2">Your chat conversations will appear here.</p>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="col-span-2">
          {selectedRoom ? (
            <ChatModal
              isOpen={true}
              onClose={() => setSelectedRoom(null)}
              chatRoomId={selectedRoom.id}
              currentUser={currentUser}
              otherUser={getOtherUser(selectedRoom)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--slate)]">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 