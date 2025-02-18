'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import ChatModal from './ChatModal';
import { UserCircleIcon, ClockIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

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
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
}

export default function ChatSection({ currentUser }: ChatSectionProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatRooms();
    
    // Subscribe to both chat rooms and messages updates
    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          console.log('Chat room update:', payload);
          fetchChatRooms();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          console.log('New chat message:', payload);
          // Update the chat room's last message and timestamp
          fetchChatRooms();
        }
      )
      .subscribe((status) => {
        console.log('Chat updates subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser.user_id]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching chat rooms for user:', currentUser.user_id);
      
      // First, get the latest message for each chat room
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
        .or(`project->creator->user_id.eq.${currentUser.user_id},application->applicant->user_id.eq.${currentUser.user_id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // For each room, get its latest message
      const roomsWithLatestMessages = await Promise.all(
        (rooms || []).map(async (room) => {
          const { data: messages, error: msgError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (msgError && msgError.code !== 'PGRST116') {
            console.error('Error fetching latest message:', msgError);
          }

          return {
            ...room,
            last_message: messages || null
          };
        })
      );

      console.log('Fetched chat rooms:', roomsWithLatestMessages);
      setChatRooms(roomsWithLatestMessages);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (room: ChatRoom): UserProfile => {
    if (room.project.creator.user_id === currentUser.user_id) {
      return room.application.applicant;
    }
    return room.project.creator;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Chat rooms list */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <ChatBubbleLeftRightIcon className="w-8 h-8 mb-2" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {chatRooms.map((room) => {
              const otherUser = getOtherUser(room);
              const isSelected = selectedRoom?.id === room.id;
              const lastMessage = room.last_message;
              
              return (
                <li
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full"
                          src={otherUser?.avatar_url || '/default-avatar.png'}
                          alt={otherUser?.full_name || 'User avatar'}
                        />
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {otherUser?.full_name || 'Unknown User'}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {lastMessage ? (
                              <>
                                {lastMessage.sender_id === currentUser.user_id ? 'You: ' : ''}
                                {lastMessage.content}
                              </>
                            ) : (
                              'No messages yet'
                            )}
                          </p>
                        </div>
                      </div>
                      {lastMessage && (
                        <div className="flex-shrink-0 text-xs text-gray-500">
                          {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Chat messages area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <ChatModal
            roomId={selectedRoom.id}
            otherUser={getOtherUser(selectedRoom)}
            projectTitle={selectedRoom.project.title}
            onClose={() => setSelectedRoom(null)}
            currentUser={currentUser}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ChatBubbleLeftRightIcon className="w-12 h-12 mb-4" />
            <p className="text-lg">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
} 