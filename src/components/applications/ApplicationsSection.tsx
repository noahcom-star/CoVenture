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
import ProfileModal from '@/components/profile/ProfileModal';

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
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

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
          linkedin_url,
          github_url,
          portfolio_url,
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
            linkedin_url,
            github_url,
            portfolio_url,
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
      <div className="flex items-center justify-center h-[600px] bg-[var(--navy-light)]/30 backdrop-blur-lg rounded-xl p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Tab.Group>
        <Tab.List className="flex space-x-4 bg-[var(--navy-light)]/20 p-1.5 rounded-2xl">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full py-4 px-6 text-base font-medium rounded-xl transition-all duration-300',
                'focus:outline-none',
                selected
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)] shadow-lg shadow-[var(--accent)]/5'
                  : 'text-[var(--slate)] hover:text-[var(--white)] hover:bg-[var(--navy-dark)]/40'
              )
            }
          >
            <div className="flex items-center justify-center gap-2">
              <span>Sent Applications</span>
              <span className="px-2.5 py-1 text-sm bg-[var(--navy-dark)]/40 rounded-full">
                {sentApplications.length}
              </span>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full py-4 px-6 text-base font-medium rounded-xl transition-all duration-300',
                'focus:outline-none',
                selected
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)] shadow-lg shadow-[var(--accent)]/5'
                  : 'text-[var(--slate)] hover:text-[var(--white)] hover:bg-[var(--navy-dark)]/40'
              )
            }
          >
            <div className="flex items-center justify-center gap-2">
              <span>Received Applications</span>
              <span className="px-2.5 py-1 text-sm bg-[var(--navy-dark)]/40 rounded-full">
                {receivedApplications.length}
              </span>
            </div>
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <div className="space-y-8">
              {sentApplications.length === 0 ? (
                <div className="text-center py-20 bg-[var(--navy-light)]/20 rounded-2xl shadow-xl shadow-[var(--navy-dark)]/50">
                  <h3 className="text-2xl font-bold text-[var(--white)] mb-4">
                    No Applications Sent
                  </h3>
                  <p className="text-[var(--slate)]">
                    Start exploring projects and apply to ones that match your skills and interests.
                  </p>
                </div>
              ) : (
                sentApplications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-[var(--navy-light)]/20 rounded-2xl p-8 transition-all duration-300 hover:bg-[var(--navy-light)]/30 hover:shadow-2xl hover:shadow-[var(--accent)]/5 hover:-translate-y-1 shadow-xl shadow-[var(--navy-dark)]/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--white)] mb-4 group-hover:text-[var(--accent)] transition-colors">
                          {application.projects?.title}
                        </h3>
                        <p className="text-[var(--slate)] line-clamp-2 group-hover:text-[var(--light-slate)] transition-colors">
                          {application.projects?.description}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-medium ring-1 ${
                        application.status === 'pending' 
                          ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-400/30' 
                          : application.status === 'accepted' 
                          ? 'bg-green-500/10 text-green-400 ring-green-400/30' 
                          : 'bg-red-500/10 text-red-400 ring-red-400/30'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>

                    {/* Social Links Section */}
                    {(application.linkedin_url || application.github_url || application.portfolio_url) && (
                      <div className="flex flex-wrap gap-4 mt-6">
                        {application.linkedin_url && (
                          <a
                            href={application.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--navy-dark)]/40 rounded-lg text-sm text-[var(--slate)] hover:text-[var(--white)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </a>
                        )}
                        {application.github_url && (
                          <a
                            href={application.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--navy-dark)]/40 rounded-lg text-sm text-[var(--slate)] hover:text-[var(--white)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                          </a>
                        )}
                        {application.portfolio_url && (
                          <a
                            href={application.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--navy-dark)]/40 rounded-lg text-sm text-[var(--slate)] hover:text-[var(--white)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                            </svg>
                            Portfolio
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-[var(--navy-dark)]/40">
                      <button
                        onClick={() => setSelectedProfile(application.projects?.creator || null)}
                        className="flex items-center gap-3 group/profile"
                      >
                        {application.projects?.creator?.avatar_url ? (
                          <img
                            src={application.projects.creator.avatar_url}
                            alt={application.projects.creator.full_name || ''}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--accent)]/20 group-hover/profile:ring-[var(--accent)]/40 transition-all"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[var(--navy-dark)]/60 flex items-center justify-center ring-2 ring-[var(--accent)]/20 group-hover/profile:ring-[var(--accent)]/40 transition-all">
                            <UserCircleIcon className="w-6 h-6 text-[var(--slate)]" />
                          </div>
                        )}
                        <div>
                          <p className="text-[var(--white)] font-medium group-hover/profile:text-[var(--accent)] transition-colors">
                            {application.projects?.creator?.full_name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-[var(--slate)]">Project Creator</p>
                        </div>
                      </button>

                      {application.projects?.creator && (
                        <ChatButton
                          currentUser={currentUser}
                          otherUser={application.projects.creator}
                          projectId={application.project_id}
                          applicationId={application.id}
                        />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-8">
              {receivedApplications.length === 0 ? (
                <div className="text-center py-20 bg-[var(--navy-light)]/20 rounded-2xl shadow-xl shadow-[var(--navy-dark)]/50">
                  <h3 className="text-2xl font-bold text-[var(--white)] mb-4">
                    No Applications Received
                  </h3>
                  <p className="text-[var(--slate)]">
                    When someone applies to your projects, their applications will appear here.
                  </p>
                </div>
              ) : (
                receivedApplications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-[var(--navy-light)]/20 rounded-2xl p-8 transition-all duration-300 hover:bg-[var(--navy-light)]/30 hover:shadow-2xl hover:shadow-[var(--accent)]/5 hover:-translate-y-1 shadow-xl shadow-[var(--navy-dark)]/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--white)] mb-4 group-hover:text-[var(--accent)] transition-colors">
                          {application.projects?.title}
                        </h3>
                        <p className="text-[var(--slate)] line-clamp-2 group-hover:text-[var(--light-slate)] transition-colors">
                          {application.projects?.description}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-medium ring-1 ${
                        application.status === 'pending' 
                          ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-400/30' 
                          : application.status === 'accepted' 
                          ? 'bg-green-500/10 text-green-400 ring-green-400/30' 
                          : 'bg-red-500/10 text-red-400 ring-red-400/30'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>

                    {/* Social Links Section for Received Applications */}
                    {(application.linkedin_url || application.github_url || application.portfolio_url) && (
                      <div className="flex flex-wrap gap-4 mt-6">
                        {application.linkedin_url && (
                          <a
                            href={application.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--navy-dark)]/40 rounded-lg text-sm text-[var(--slate)] hover:text-[var(--white)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </a>
                        )}
                        {application.github_url && (
                          <a
                            href={application.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--navy-dark)]/40 rounded-lg text-sm text-[var(--slate)] hover:text-[var(--white)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                          </a>
                        )}
                        {application.portfolio_url && (
                          <a
                            href={application.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--navy-dark)]/40 rounded-lg text-sm text-[var(--slate)] hover:text-[var(--white)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                            </svg>
                            Portfolio
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-[var(--navy-dark)]/40">
                      <button
                        onClick={() => setSelectedProfile(application.profiles || null)}
                        className="flex items-center gap-3 group/profile"
                      >
                        {application.profiles?.avatar_url ? (
                          <img
                            src={application.profiles.avatar_url}
                            alt={application.profiles.full_name || ''}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--accent)]/20 group-hover/profile:ring-[var(--accent)]/40 transition-all"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[var(--navy-dark)]/60 flex items-center justify-center ring-2 ring-[var(--accent)]/20 group-hover/profile:ring-[var(--accent)]/40 transition-all">
                            <UserCircleIcon className="w-6 h-6 text-[var(--slate)]" />
                          </div>
                        )}
                        <div>
                          <p className="text-[var(--white)] font-medium group-hover/profile:text-[var(--accent)] transition-colors">
                            {application.profiles?.full_name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-[var(--slate)]">Applicant</p>
                        </div>
                      </button>

                      <div className="flex items-center gap-4">
                        {application.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'accepted')}
                              className="px-5 py-2.5 bg-green-500/10 text-green-400 rounded-xl font-medium hover:bg-green-500/20 transition-all ring-1 ring-green-400/30 hover:ring-green-400/50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'rejected')}
                              className="px-5 py-2.5 bg-red-500/10 text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-all ring-1 ring-red-400/30 hover:ring-red-400/50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {application.profiles && (
                          <ChatButton
                            currentUser={currentUser}
                            otherUser={application.profiles}
                            projectId={application.project_id}
                            applicationId={application.id}
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
        />
      )}
    </div>
  );
} 