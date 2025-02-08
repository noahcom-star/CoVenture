import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, Project } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Avatar, Button, Card, CardContent, CardActions, Typography, Chip, IconButton } from '@mui/material';
import { Close as CloseIcon, Check as CheckIcon, Info as InfoIcon } from '@mui/icons-material';
import Link from 'next/link';

interface ProjectSwipeProps {
  currentUser: UserProfile;
}

export default function ProjectSwipe({ currentUser }: ProjectSwipeProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    fetchProjects();

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
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      projectsSubscription.unsubscribe();
    };
  }, [currentUser.id]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching projects for user:', currentUser.id);
      
      // First, get the projects the user has already applied to
      const { data: applications, error: applicationsError } = await supabase
        .from('project_applications')
        .select('project_id')
        .eq('applicant_id', currentUser.id);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        throw applicationsError;
      }

      console.log('User applications:', applications);
      const appliedProjectIds = applications?.map(app => app.project_id) || [];
      
      // Then, fetch projects excluding the ones the user has applied to
      let query = supabase
        .from('projects')
        .select(`
          *,
          creator:profiles!inner (
            id,
            user_id,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'open')
        .neq('creator_id', currentUser.id);

      // Only add the not-in filter if there are applied projects
      if (appliedProjectIds.length > 0) {
        query = query.not('id', 'in', `(${appliedProjectIds.join(',')})`);
      }

      const { data: projectsData, error: projectsError } = await query
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw projectsError;
      }

      console.log('Fetched projects:', projectsData);
      setProjects(projectsData || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      handleApply();
    } else {
      // Skip to next project
      setCurrentIndex((prev: number) => Math.min(prev + 1, projects.length));
    }
  };

  const handleApply = async () => {
    const project = projects[currentIndex];
    if (!project) return;

    try {
      const { error } = await supabase
        .from('project_applications')
        .insert({
          project_id: project.id,
          applicant_id: currentUser.id,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Application submitted!');
      setCurrentIndex((prev: number) => Math.min(prev + 1, projects.length));
    } catch (error) {
      console.error('Error applying to project:', error);
      toast.error('Failed to submit application');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  if (projects.length === 0 || currentIndex >= projects.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px]">
        <Typography variant="h6" gutterBottom>
          No more projects to show
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Check back later for new opportunities!
        </Typography>
      </div>
    );
  }

  const currentProject = projects[currentIndex];

  return (
    <div className="h-[600px] relative">
      <AnimatePresence>
        <motion.div
          key={currentProject.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Card className="h-full flex flex-col">
            <CardContent className="flex-grow">
              <div className="flex items-center space-x-2 mb-4">
                <Avatar src={currentProject.creator?.avatar_url} />
                <div>
                  <Typography variant="subtitle1">
                    {currentProject.creator?.full_name || 'Anonymous'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Posted {new Date(currentProject.created_at).toLocaleDateString()}
                  </Typography>
                </div>
              </div>

              <Typography variant="h5" gutterBottom>
                {currentProject.title}
              </Typography>

              <div className="mb-4">
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Required Skills:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {currentProject.required_skills.map((skill, index) => (
                    <Chip key={index} label={skill} size="small" />
                  ))}
                </div>
              </div>

              <Typography
                variant="body2"
                color="textSecondary"
                className={showDetails ? '' : 'line-clamp-3'}
              >
                {currentProject.description}
              </Typography>

              {!showDetails && (
                <Button
                  startIcon={<InfoIcon />}
                  onClick={() => setShowDetails(true)}
                  className="mt-2"
                >
                  Show More
                </Button>
              )}
            </CardContent>

            <CardActions className="justify-center space-x-4 p-4">
              <IconButton
                className="bg-red-100 hover:bg-red-200"
                onClick={() => handleSwipe('left')}
              >
                <CloseIcon className="text-red-600" />
              </IconButton>
              <IconButton
                className="bg-green-100 hover:bg-green-200"
                onClick={() => handleSwipe('right')}
              >
                <CheckIcon className="text-green-600" />
              </IconButton>
            </CardActions>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 