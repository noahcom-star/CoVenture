'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Avatar, Button, Card, Dialog, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { Check as CheckIconMUI, Close as CloseIconMUI, Chat as ChatIconMUI } from '@mui/icons-material';
import Chat from './Chat';
import { ProjectApplication } from '@/types/profile';
import { LinkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import ChatButton from '@/components/chat/ChatButton';

interface ProjectApplicationsProps {
  projectId: string;
  currentUser: UserProfile;
}

export default function ProjectApplications({ projectId, currentUser }: ProjectApplicationsProps) {
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ProjectApplication | null>(null);

  useEffect(() => {
    fetchApplications();

    // Subscribe to application updates
    const channel = supabase
      .channel('applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_applications',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          console.log('Application change detected, refreshing...');
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [projectId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('Fetching applications for project:', projectId);

      const { data, error } = await supabase
        .from('project_applications')
        .select(`
          *,
          profiles:applicant_id (
            user_id,
            full_name,
            avatar_url
          ),
          project:project_id (
            title
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      console.log('Fetched applications:', data);
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('project_applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success(`Application ${status}`);
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  };

  const handleOpenChat = (application: ProjectApplication) => {
    setSelectedApplication(application);
    setShowChatModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-[var(--white)] mb-4">Applications</h3>
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--slate)]">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--navy-dark)]/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {application.profiles?.avatar_url ? (
                      <img
                        src={application.profiles.avatar_url}
                        alt={application.profiles?.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-[var(--accent)]" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-[var(--white)]">
                        {application.profiles?.full_name}
                      </h4>
                      <p className="text-sm text-[var(--slate)]">
                        Applied {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'accepted')}
                          className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <ChatButton
                      currentUser={currentUser}
                      otherUser={application.profiles!}
                      projectId={projectId}
                      applicationId={application.id}
                      projectTitle={application.project?.title || 'Untitled Project'}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {application.linkedin_url && (
                    <a
                      href={application.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-[var(--accent)] hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                  {application.github_url && (
                    <a
                      href={application.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-[var(--accent)] hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>GitHub Profile</span>
                    </a>
                  )}
                  {application.portfolio_url && (
                    <a
                      href={application.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-[var(--accent)] hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Portfolio</span>
                    </a>
                  )}
                </div>

                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      application.status === 'accepted'
                        ? 'bg-green-500/10 text-green-500'
                        : application.status === 'rejected'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={showChatModal}
        onClose={() => setShowChatModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Chat with {selectedApplication?.profiles?.full_name}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && selectedApplication.profiles && (
            <Chat
              projectId={projectId}
              applicationId={selectedApplication.id}
              currentUser={currentUser}
              otherUser={selectedApplication.profiles}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 