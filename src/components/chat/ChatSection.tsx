'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import ChatModal from './ChatModal';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatSectionProps {
  currentUser: UserProfile;
}

interface ChatRoom {
  id: string;
  title: string;
  updated_at: string;
  otherUser: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

export default function ChatSection({ currentUser }: ChatSectionProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchChatRooms = async () => {
    try {
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          updated_at,
          project:projects!inner(
            title,
            creator:profiles!inner(user_id, full_name, avatar_url)
          ),
          application:project_applications!inner(
            applicant:profiles!inner(user_id, full_name, avatar_url)
          ),
          chat_messages:chat_messages(
            content,
            created_at
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const processedRooms: ChatRoom[] = (rooms || []).map(room => {
        const isCreator = room.project.creator.user_id === currentUser.user_id;
        const otherUser = isCreator ? room.application.applicant : room.project.creator;
        const lastMessage = room.chat_messages?.[0];

        return {
          id: room.id,
          title: room.project.title,
          updated_at: room.updated_at,
          otherUser: {
            user_id: otherUser.user_id,
            full_name: otherUser.full_name,
            avatar_url: otherUser.avatar_url
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            created_at: lastMessage.created_at
          } : undefined
        };
      });

      setChatRooms(processedRooms);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load chat rooms');
    }
  };

  const setupRealtimeSubscription = async () => {
    try {
      if (channelRef.current) {
        await channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      const channel = supabase.channel('chat_updates', {
        config: {
          broadcast: { self: true },
          presence: { key: currentUser.user_id },
        },
      });

      channel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        }, () => {
          console.log('Chat message changes detected, refreshing rooms...');
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

  useEffect(() => {
    fetchChatRooms();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up chat updates subscription');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [currentUser.user_id]);

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
              {chatRooms.map((room) => (
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
                      {room.otherUser.full_name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="ml-3 text-left">
                    <h4 className="text-[var(--white)] font-medium">{room.otherUser.full_name}</h4>
                    <p className="text-sm text-[var(--slate)] truncate">
                      {room.title}
                    </p>
                    {room.lastMessage && (
                      <p className="text-xs text-[var(--slate)] mt-1">
                        {new Date(room.lastMessage.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
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
              otherUser={selectedRoom.otherUser}
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