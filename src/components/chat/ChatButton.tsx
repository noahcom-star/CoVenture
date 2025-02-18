'use client';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '@/types/profile';

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
  return (
    <button
      onClick={() => {
        // Create a chat room ID using project ID and application ID
        const roomId = `${projectId}_${applicationId}`;
        
        // Open the chat modal with the room ID and project title
        const chatModal = document.createElement('chat-modal');
        chatModal.setAttribute('room-id', roomId);
        chatModal.setAttribute('project-title', projectTitle);
        document.body.appendChild(chatModal);
      }}
      className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/20 transition-colors"
    >
      <ChatBubbleLeftRightIcon className="w-5 h-5" />
    </button>
  );
} 