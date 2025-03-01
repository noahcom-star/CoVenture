'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CalendarIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@mui/material';

interface ProjectsProps {
  currentUser: UserProfile;
}

interface Project {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  required_skills: string[];
  team_size: number;
  timeline: string;
  status: 'open' | 'in_progress' | 'completed';
  created_at: string;
  creator?: UserProfile;
}

interface ProjectApplication {
  id: string;
  project_id: string;
  applicant_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  project?: Project;
  applicant?: UserProfile;
}

export default function Projects({ currentUser }: ProjectsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyProjects, setShowMyProjects] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState<{ projectId: string } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchApplications();

    // Subscribe to project updates
    const projectsSubscription = supabase
      .channel('projects_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Project change received:', payload);
          fetchProjects();
        }
      )
      .subscribe((status) => {
        console.log('Project subscription status:', status);
      });

    // Subscribe to application updates
    const applicationsSubscription = supabase
      .channel('applications_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_applications'
        },
        (payload) => {
          console.log('Application change received:', payload);
          fetchApplications();
        }
      )
      .subscribe((status) => {
        console.log('Application subscription status:', status);
      });

    return () => {
      projectsSubscription.unsubscribe();
      applicationsSubscription.unsubscribe();
    };
  }, [currentUser.user_id]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching projects for user:', currentUser.user_id);

      // First, get all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (
            user_id,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw projectsError;
      }

      // Then, get the creator profiles for these projects
      if (projectsData && projectsData.length > 0) {
        const creatorIds = projectsData.map(project => project.creator_id);
        const { data: creatorsData, error: creatorsError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', creatorIds);

        if (creatorsError) {
          console.error('Error fetching creators:', creatorsError);
          throw creatorsError;
        }

        // Merge the creator data with the projects
        const projectsWithCreators = projectsData.map(project => ({
          ...project,
          creator: creatorsData?.find(creator => creator.user_id === project.creator_id)
        }));

        console.log('Fetched projects with creators:', projectsWithCreators);
        setProjects(projectsWithCreators);
      } else {
        console.log('No projects found in the database');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications for user:', currentUser.user_id);
      
      // First, get the applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('project_applications')
        .select(`
          *,
          project:projects (*)
        `)
        .eq('applicant_id', currentUser.user_id);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        throw applicationsError;
      }

      // Then, get the creators for these projects
      if (applicationsData && applicationsData.length > 0) {
        const creatorIds = applicationsData.map(app => app.project?.creator_id).filter(Boolean);
        
        if (creatorIds.length > 0) {
          const { data: creatorsData, error: creatorsError } = await supabase
            .from('profiles')
            .select('*')
            .in('user_id', creatorIds);

          if (creatorsError) {
            console.error('Error fetching creators:', creatorsError);
            throw creatorsError;
          }

          // Merge the creator data with the applications
          const applicationsWithCreators = applicationsData.map(app => ({
            ...app,
            project: app.project ? {
              ...app.project,
              creator: creatorsData?.find(creator => creator.user_id === app.project.creator_id)
            } : null
          }));

          console.log('Fetched applications with creators:', applicationsWithCreators);
          setApplications(applicationsWithCreators);
        } else {
          setApplications(applicationsData);
        }
      } else {
        console.log('No applications found');
        setApplications([]);
      }
    } catch (error) {
      console.error('Error in fetchApplications:', error);
      toast.error('Failed to load applications');
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'creator_id' | 'status' | 'created_at'>) => {
    try {
      const projectToCreate = {
        ...projectData,
        creator_id: currentUser.user_id,
        status: 'open'
      };
      
      console.log('Attempting to create project:', projectToCreate);
      
      // First, create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(projectToCreate)
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw projectError;
      }

      console.log('Successfully created project:', project);

      // Then, add the creator as a project member
      if (project) {
        const memberData = {
          project_id: project.id,
          user_id: currentUser.user_id,
          role: 'creator'
        };
        
        console.log('Adding creator as project member:', memberData);
        
        const { error: memberError } = await supabase
          .from('project_members')
          .insert(memberData);

        if (memberError) {
          console.error('Project member creation error:', memberError);
          toast.error('Project created but failed to add you as a member');
        } else {
          console.log('Successfully added creator as project member');
          toast.success('Project created successfully!');
          await fetchProjects(); // Refresh the projects list
          setShowCreateModal(false);
        }
      }
    } catch (error) {
      console.error('Error in handleCreateProject:', error);
      toast.error('Failed to create project');
    }
  };

  const handleApplyToProject = async (projectId: string) => {
    // Check if user has already applied
    const existingApplication = applications.find(app => app.project_id === projectId);
    if (existingApplication) {
      toast.error('You have already applied to this project');
      return;
    }

    setShowApplicationModal({ projectId });
  };

  const handleSubmitApplication = async (projectId: string, linkedin?: string, github?: string, website?: string) => {
    try {
      if (!currentUser?.user_id) {
        toast.error('You must be logged in to apply');
        return;
      }

      console.log('Starting application submission with data:', {
        projectId,
        applicantId: currentUser.user_id,
        linkedin,
        github,
        website
      });

      const applicationData = {
        project_id: projectId,
        applicant_id: currentUser.user_id,
        status: 'pending',
        linkedin_url: linkedin || null,
        github_url: github || null,
        portfolio_url: website || null
      };

      console.log('Submitting application with data:', applicationData);

      const { data, error } = await supabase
        .from('project_applications')
        .insert([applicationData])
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Failed to submit application: ${error.message}`);
        return;
      }

      console.log('Application submitted successfully:', data);
      toast.success('Application submitted successfully!');
      setShowApplicationModal(null);
      await fetchApplications();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error?.message || 'Failed to submit application. Please try again.');
    }
  };

  const filteredProjects = projects.filter(project => {
    if (showMyProjects && project.creator_id !== currentUser.user_id) return false;
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      project.required_skills.some(skill => skill.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--navy-light)]/30 p-6 rounded-xl">
        <div className="flex-1 w-full">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--slate)]" />
            <input
              type="text"
              placeholder="Search projects by title, skills, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--navy-dark)]/50 border border-[var(--accent)]/20 rounded-lg text-black placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => setShowMyProjects(!showMyProjects)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all ${
              showMyProjects
                ? 'bg-transparent text-[var(--accent)] border-2 border-[var(--accent)]'
                : 'bg-transparent text-[var(--slate)] border-2 border-[var(--slate)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
          >
            {showMyProjects ? 'Show All Projects' : 'My Projects'}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-medium hover:opacity-90 transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Project</span>
          </motion.button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-[300px] bg-[var(--navy-light)]/30 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {projects
              .filter(project => 
                (!showMyProjects || project.creator_id === currentUser.user_id) &&
                (searchQuery === '' || 
                  project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  project.required_skills.some(skill => 
                    skill.toLowerCase().includes(searchQuery.toLowerCase())
                  ))
              )
              .map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-[var(--navy-light)]/30 hover:bg-[var(--navy-light)]/50 rounded-xl p-6 transition-all duration-300 border border-transparent hover:border-[var(--accent)]/20"
                >
                  {/* Project Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'open' 
                        ? 'bg-green-500/10 text-green-500' 
                        : project.status === 'in_progress'
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>

                  {/* Project Title and Description */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[var(--white)] mb-2 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-[var(--slate)] line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Required Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.required_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-[var(--navy-dark)]/60 text-[var(--slate)] hover:text-[var(--light-slate)] rounded-full transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="flex items-center justify-between text-sm text-[var(--slate)] mb-4">
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{project.team_size} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{project.timeline}</span>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <button 
                    onClick={() => project.creator && setShowProfileModal(project.creator)}
                    className="flex items-center gap-3 mb-4 hover:bg-[var(--navy-dark)]/50 p-3 -ml-2 rounded-lg transition-all duration-200 group/profile border border-transparent hover:border-[var(--accent)]/20"
                  >
                    {project.creator?.avatar_url ? (
                      <img
                        src={project.creator.avatar_url}
                        alt={project.creator.full_name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--accent)]/30 group-hover/profile:ring-[var(--accent)] transition-all duration-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/10 flex items-center justify-center ring-2 ring-[var(--accent)]/30 group-hover/profile:ring-[var(--accent)] transition-all duration-200 shadow-lg">
                        <UserGroupIcon className="w-6 h-6 text-[var(--accent)]" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-[var(--white)] font-medium line-clamp-1 group-hover/profile:text-[var(--accent)] transition-colors duration-200">
                        {project.creator?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-[var(--slate)] group-hover/profile:text-[var(--light-slate)] transition-colors duration-200">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>

                  {/* Action Button */}
                  {project.creator_id !== currentUser.user_id && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowApplicationModal({ projectId: project.id })}
                      disabled={applications.some(app => app.project_id === project.id)}
                      className="w-full py-2 px-4 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/button relative"
                    >
                      {applications.some(app => app.project_id === project.id)
                        ? (
                          <div className="flex items-center justify-center gap-2">
                            <span>Already Applied</span>
                          </div>
                        )
                        : 'Apply Now'}
                    </motion.button>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}

      {/* No Projects Message */}
      {!loading && projects.filter(project => 
        (!showMyProjects || project.creator_id === currentUser.user_id) &&
        (searchQuery === '' || 
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.required_skills.some(skill => 
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          ))
      ).length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-[var(--white)] mb-2">
            {showMyProjects ? 'No Projects Created Yet' : 'No Projects Found'}
          </h3>
          <p className="text-[var(--slate)] mb-6">
            {showMyProjects 
              ? 'Create your first project to get started!'
              : 'Try adjusting your search or check back later for new projects.'}
          </p>
          {showMyProjects && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-medium hover:opacity-90 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Project</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateProject}
          />
        )}
        {showApplicationModal && (
          <ApplicationModal
            onClose={() => setShowApplicationModal(null)}
            onSubmit={(linkedin, github, website) => 
              handleSubmitApplication(showApplicationModal.projectId, linkedin, github, website)
            }
          />
        )}
        {showProfileModal && (
          <ProfileModal
            onClose={() => setShowProfileModal(null)}
            user={showProfileModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (project: Omit<Project, 'id' | 'creator_id' | 'status' | 'created_at'>) => void;
}

function CreateProjectModal({ onClose, onCreate }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    team_size: 2,
    timeline: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.required_skills.trim()) {
      setError('Required skills are required');
      return;
    }
    if (formData.team_size < 1) {
      setError('Team size must be at least 1');
      return;
    }
    if (!formData.timeline.trim()) {
      setError('Timeline is required');
      return;
    }

    onCreate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
      team_size: formData.team_size,
      timeline: formData.timeline.trim()
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-[var(--navy-dark)] rounded-xl p-6 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-[var(--white)] mb-6">Create New Project</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--light-slate)] mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
              placeholder="Enter project title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--light-slate)] mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
              placeholder="Describe your project idea..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--light-slate)] mb-1">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.required_skills}
              onChange={(e) => setFormData(prev => ({ ...prev, required_skills: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
              placeholder="e.g., React, Node.js, UI/UX Design"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--light-slate)] mb-1">
              Team Size
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={formData.team_size}
              onChange={(e) => setFormData(prev => ({ ...prev, team_size: parseInt(e.target.value) || 1 }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--light-slate)] mb-1">
              Timeline
            </label>
            <input
              type="text"
              value={formData.timeline}
              onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
              placeholder="e.g., 3 months, 6 weeks"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--slate)] hover:text-[var(--white)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-medium hover:opacity-90 transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

interface ApplicationModalProps {
  onClose: () => void;
  onSubmit: (linkedin?: string, github?: string, website?: string) => void;
}

function ApplicationModal({ onClose, onSubmit }: ApplicationModalProps) {
  const [formData, setFormData] = useState({
    linkedin: '',
    github: '',
    website: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData.linkedin, formData.github, formData.website);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-[var(--navy-dark)] rounded-xl p-6 w-full max-w-lg"
      >
        <h3 className="text-xl font-semibold text-[var(--white)] mb-6">Apply to Project</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--slate)] mb-1">
              LinkedIn
            </label>
            <input
              type="text"
              value={formData.linkedin}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--slate)] mb-1">
              GitHub
            </label>
            <input
              type="text"
              value={formData.github}
              onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--slate)] mb-1">
              Website
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--slate)] hover:text-[var(--white)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-medium hover:opacity-90 transition-colors"
            >
              Submit Application
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

interface ProfileModalProps {
  onClose: () => void;
  user: UserProfile;
}

function ProfileModal({ onClose, user }: ProfileModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-[var(--navy-dark)] rounded-xl p-6 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[var(--white)]">Profile</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--navy-light)]/30 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-[var(--slate)]" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || ''}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-[var(--accent)]/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center ring-4 ring-[var(--accent)]/20">
                <UserGroupIcon className="w-8 h-8 text-[var(--accent)]" />
              </div>
            )}
            <div>
              <h4 className="text-lg font-semibold text-[var(--white)]">
                {user.full_name || 'Anonymous'}
              </h4>
              {user.bio && (
                <p className="text-[var(--slate)] mt-1">{user.bio}</p>
              )}
            </div>
          </div>

          {/* Skills */}
          {user.skills?.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-[var(--light-slate)] mb-2">Skills</h5>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 text-xs bg-[var(--navy-dark)]/60 text-[var(--slate)] rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(user.linkedin_url || user.github_url || user.portfolio_url) && (
            <div>
              <h5 className="text-sm font-medium text-[var(--light-slate)] mb-2">Links</h5>
              <div className="flex flex-wrap gap-4">
                {user.linkedin_url && (
                  <a
                    href={user.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors"
                  >
                    LinkedIn Profile
                  </a>
                )}
                {user.github_url && (
                  <a
                    href={user.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors"
                  >
                    GitHub Profile
                  </a>
                )}
                {user.portfolio_url && (
                  <a
                    href={user.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors"
                  >
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 