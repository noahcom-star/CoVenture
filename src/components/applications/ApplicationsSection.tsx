import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile, ProjectApplication } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import ChatButton from '@/components/chat/ChatButton';

interface ApplicationsSectionProps {
  currentUser: UserProfile;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ApplicationsSection({ currentUser }: ApplicationsSectionProps) {
  const [sentApplications, setSentApplications] = useState<ProjectApplication[]>([]);
  const [receivedApplications, setReceivedApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();

    // Set up real-time subscription
    const applicationsSubscription = supabase
      .channel('applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_applications'
        },
        () => {
          console.log('Application change detected, refreshing...');
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      applicationsSubscription.unsubscribe();
    };
  }, [currentUser]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('Fetching applications for user:', currentUser.user_id);

      // Fetch sent applications
      const { data: sentData, error: sentError } = await supabase
        .from('project_applications')
        .select(`
          *,
          projects:project_id (*)
        `)
        .eq('applicant_id', currentUser.user_id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      // For each sent application, fetch the project creator's profile
      if (sentData) {
        const sentWithCreators = await Promise.all(
          sentData.map(async (app) => {
            if (app.projects) {
              const { data: creatorData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', app.projects.creator_id)
                .single();
              
              return {
                ...app,
                projects: {
                  ...app.projects,
                  creator: creatorData
                }
              };
            }
            return app;
          })
        );
        console.log('Sent applications:', sentWithCreators);
        setSentApplications(sentWithCreators);
      }

      // Fetch received applications
      const { data: userProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('creator_id', currentUser.user_id);

      if (userProjects && userProjects.length > 0) {
        const { data: receivedData, error: receivedError } = await supabase
          .from('project_applications')
          .select(`
            *,
            projects:project_id (*)
          `)
          .in('project_id', userProjects.map(p => p.id))
          .order('created_at', { ascending: false });

        if (receivedError) throw receivedError;

        // For each received application, fetch the applicant's profile
        if (receivedData) {
          const receivedWithProfiles = await Promise.all(
            receivedData.map(async (app) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', app.applicant_id)
                .single();
              
              return {
                ...app,
                profiles: profileData
              };
            })
          );
          console.log('Received applications:', receivedWithProfiles);
          setReceivedApplications(receivedWithProfiles);
        }
      } else {
        setReceivedApplications([]);
      }
    } catch (error) {
      console.error('Error in fetchApplications:', error);
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

      if (status === 'accepted') {
        // Add the applicant as a project member
        const application = receivedApplications.find(app => app.id === applicationId);
        if (application) {
          const { error: memberError } = await supabase
            .from('project_members')
            .insert({
              project_id: application.project_id,
              user_id: application.applicant_id,
              role: 'member'
            });

          if (memberError) throw memberError;
          
          // Show success message with chat prompt
          toast.success(
            <div>
              <p>Application accepted! 🎉</p>
              <p className="text-sm mt-1">Click the chat button to discuss project details</p>
            </div>
          );
        }
      } else {
        toast.success(`Application ${status}`);
      }
      
      await fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tab.Group>
        <Tab.List className="flex space-x-4 bg-[var(--navy-light)]/50 backdrop-blur-lg p-2 rounded-xl mb-6">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full py-3 px-4 text-sm font-medium rounded-lg transition-all',
                'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[var(--navy-dark)] ring-[var(--accent)]/50',
                selected
                  ? 'bg-[var(--accent)] text-[var(--navy-dark)]'
                  : 'text-[var(--slate)] hover:text-[var(--white)] hover:bg-[var(--accent)]/10'
              )
            }
          >
            Sent Applications ({sentApplications.length})
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full py-3 px-4 text-sm font-medium rounded-lg transition-all',
                'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[var(--navy-dark)] ring-[var(--accent)]/50',
                selected
                  ? 'bg-[var(--accent)] text-[var(--navy-dark)]'
                  : 'text-[var(--slate)] hover:text-[var(--white)] hover:bg-[var(--accent)]/10'
              )
            }
          >
            Received Applications ({receivedApplications.length})
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent)]" />
                </div>
              ) : sentApplications.length > 0 ? (
                sentApplications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6 hover:bg-[var(--navy-light)] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-[var(--white)]">
                          {application.projects?.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-[var(--slate)]">
                          <div className="flex items-center space-x-2">
                            <UserCircleIcon className="w-4 h-4" />
                            <span>Created by {application.projects?.creator?.full_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={classNames(
                          'px-3 py-1 rounded-full text-sm font-medium',
                          application.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          application.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                          'bg-red-500/10 text-red-500'
                        )}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        {application.status === 'accepted' && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ChatButton
                              currentUser={currentUser}
                              otherUser={application.projects?.creator as UserProfile}
                              projectId={application.project_id}
                              applicationId={application.id}
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl">
                  <p className="text-[var(--slate)]">You haven't sent any applications yet.</p>
                </div>
              )}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent)]" />
                </div>
              ) : receivedApplications.length > 0 ? (
                receivedApplications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6 hover:bg-[var(--navy-light)] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-[var(--white)]">
                          {application.projects?.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-[var(--slate)]">
                          <div className="flex items-center space-x-2">
                            <UserCircleIcon className="w-4 h-4" />
                            <span>From {application.profiles?.full_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>Received {new Date(application.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {application.status === 'pending' ? (
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpdateStatus(application.id, 'accepted')}
                              className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpdateStatus(application.id, 'rejected')}
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </motion.button>
                          </div>
                        ) : (
                          <span className={classNames(
                            'px-3 py-1 rounded-full text-sm font-medium',
                            application.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          )}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        )}

                        {application.status === 'accepted' && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ChatButton
                              currentUser={currentUser}
                              otherUser={application.profiles as UserProfile}
                              projectId={application.project_id}
                              applicationId={application.id}
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {application.status === 'pending' && (
                      <div className="mt-4 p-4 bg-[var(--navy-dark)] rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-[var(--white)]">Application Details</h4>
                            {application.linkedin_url && (
                              <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" 
                                 className="block text-sm text-[var(--accent)] hover:underline">
                                LinkedIn Profile
                              </a>
                            )}
                            {application.github_url && (
                              <a href={application.github_url} target="_blank" rel="noopener noreferrer"
                                 className="block text-sm text-[var(--accent)] hover:underline">
                                GitHub Profile
                              </a>
                            )}
                            {application.portfolio_url && (
                              <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer"
                                 className="block text-sm text-[var(--accent)] hover:underline">
                                Portfolio
                              </a>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-[var(--slate)]">Review this application</p>
                            <p className="text-xs text-[var(--slate)]">Use the buttons above to accept or reject</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl">
                  <p className="text-[var(--slate)]">No applications received yet.</p>
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 