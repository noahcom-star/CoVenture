'use client';

import { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '@/types/profile';
import dynamic from 'next/dynamic';

const ChatModal = dynamic(() => import('./ChatModal'), {
  ssr: false,
});

interface ChatButtonProps {
  currentUser: UserProfile;
  otherUser: UserProfile;
  projectId: string;
  applicationId: string;
  projectTitle: string;
}

export default function ChatButton({
  currentUser,
  otherUser,
  projectId,
  applicationId,
  projectTitle
}: ChatButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const roomId = `${projectId}_${applicationId}`;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/20 transition-colors"
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
      </button>

      {showModal && (
        <ChatModal
          roomId={roomId}
          otherUser={otherUser}
          projectTitle={projectTitle}
        />
      )}
    </>
  );
} 