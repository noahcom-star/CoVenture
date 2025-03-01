'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
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
        className="flex items-center gap-2 px-4 py-2 bg-[var(--navy-dark)] text-[var(--white)] rounded-lg hover:bg-[var(--navy-dark)]/80 transition-all transform hover:scale-105 font-medium shadow-lg hover:shadow-xl border border-[var(--accent)]/20"
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
        <span>Chat Now</span>
        <div className="relative group/tooltip">
          <InformationCircleIcon className="w-5 h-5 text-[var(--accent)]" />
          <div className="absolute bottom-full right-0 mb-2 w-max opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-[var(--navy-dark)] text-[var(--white)] text-sm py-1 px-2 rounded shadow-lg whitespace-nowrap border border-[var(--accent)]/20">
              Discuss project details
            </div>
            <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-[var(--navy-dark)]" />
          </div>
        </div>
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