'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import ChatModal from './ChatModal';

interface ChatSectionProps {
  currentUser: UserProfile;
}

interface ChatRoom {
  id: string;
  project_id: string;
  application_id: string;
  created_at: string;
  updated_at: string;
  project: {
    title: string;
    creator: UserProfile;
  };
  application: {
    applicant: UserProfile;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

export default function ChatSection({ currentUser }: ChatSectionProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatRooms();
    
    // Subscribe to chat rooms updates
    const channel = supabase
      .channel(`user_chats:${currentUser.user_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `id=in.(${chatRooms.map(room => room.id).join(',')})`
        },
        (payload) => {
          console.log('Chat room update:', payload);
          if (payload.eventType === 'UPDATE') {
            setChatRooms(prev => 
              prev.map(room => 
                room.id === payload.new.id 
                  ? { ...room, ...payload.new }
                  : room
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          console.log('New message:', payload);
          const roomId = payload.new.room_id;
          // Fetch the updated chat room to get the last message
          const { data: updatedRoom } = await supabase
            .from('chat_rooms')
            .select(`
              *,
              project:projects!inner (
                title,
                creator:profiles!projects_creator_id_fkey (*)
              ),
              application:project_applications!inner (
                applicant:profiles!project_applications_applicant_id_fkey (*)
              ),
              last_message:chat_messages (
                content,
                created_at
              )
            `)
            .eq('id', roomId)
            .single();

          if (updatedRoom) {
            setChatRooms(prev => 
              prev.map(room => 
                room.id === roomId 
                  ? { ...room, last_message: { 
                      content: payload.new.content,
                      created_at: payload.new.created_at
                    }}
                  : room
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.user_id, chatRooms.map(room => room.id).join(',')]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching chat rooms for user:', currentUser.user_id);
      
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          project:projects!inner (
            title,
            creator:profiles!projects_creator_id_fkey (
              user_id,
              full_name,
              avatar_url
            )
          ),
          application:project_applications!inner (
            applicant:profiles!project_applications_applicant_id_fkey (
              user_id,
              full_name,
              avatar_url
            )
          ),
          last_message:chat_messages (
            content,
            created_at,
            sender_id
          )
        `)
        .or(`project->creator_id.eq.${currentUser.user_id},application->applicant_id.eq.${currentUser.user_id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched chat rooms:', rooms);
      setChatRooms(rooms || []);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (room: ChatRoom) => {
    const isCreator = room.project.creator.user_id === currentUser.user_id;
    return isCreator ? room.application.applicant : room.project.creator;
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
        <div className="col-span-2 relative">
          {selectedRoom ? (
            <div className="absolute inset-0">
              <ChatModal
                isOpen={!!selectedRoom}
                onClose={() => setSelectedRoom(null)}
                chatRoomId={selectedRoom.id}
                currentUser={currentUser}
                otherUser={getOtherUser(selectedRoom)}
              />
            </div>
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