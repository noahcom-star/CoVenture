'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import ChatModal from './ChatModal';

interface ChatButtonProps {
  currentUser: UserProfile;
  otherUser: UserProfile;
  projectId: string;
  applicationId: string;
}

export default function ChatButton({ currentUser, otherUser, projectId, applicationId }: ChatButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  const handleOpenChat = async () => {
    try {
      // First try to find an existing chat room
      const { data: existingRoom, error: findError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('project_id', projectId)
        .eq('application_id', applicationId)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existingRoom) {
        setChatRoomId(existingRoom.id);
      } else {
        // Create a new chat room if one doesn't exist
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert([
            {
              project_id: projectId,
              application_id: applicationId,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        if (newRoom) setChatRoomId(newRoom.id);
      }

      setIsModalOpen(true);
    } catch (error) {
      console.error('Error handling chat:', error);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenChat}
        className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/20 transition-colors"
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
      </button>

      {isModalOpen && chatRoomId && (
        <ChatModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          chatRoomId={chatRoomId}
          currentUser={currentUser}
          otherUser={otherUser}
        />
      )}
    </>
  );
} 