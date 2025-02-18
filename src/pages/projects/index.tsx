import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Badge,
} from '@mui/material';
import ProjectSwipe from '@/components/projects/ProjectSwipe';
import ProjectApplications from '@/components/projects/ProjectApplications';
import { Project, UserProfile, ProjectApplication } from '@/types/profile';

export default function Projects() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userApplications, setUserApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProjects();
      fetchUserApplications();
    }
  }, [user]);

  const fetchUserProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          creator:creator_id (
            id,
            user_id,
            full_name,
            avatar_url
          ),
          project_members (
            user_id
          ),
          project_applications (
            id,
            status
          )
        `)
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserProjects(data || []);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      toast.error('Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('project_applications')
        .select(`
          *,
          project:project_id (
            id,
            title,
            description,
            creator:creator_id (
              id,
              user_id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('applicant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserApplications(data || []);
    } catch (error) {
      console.error('Error fetching user applications:', error);
      toast.error('Failed to load your applications');
    }
  };

  const handleCreateProject = () => {
    router.push('/projects/create');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'accepted':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-slate-500';
    }
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center h-96">
          <CircularProgress />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateProject}
        >
          Create Project
        </Button>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="project tabs"
        >
          <Tab label="Discover" />
          <Tab 
            label={
              <Badge 
                badgeContent={userProjects.reduce((acc: number, project: Project) => 
                  acc + ((project.project_applications?.filter((app: ProjectApplication) => app.status === 'pending').length) || 0), 0)
                } 
                color="primary"
              >
                My Projects
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={userApplications.length} 
                color="primary"
              >
                My Applications
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {activeTab === 0 && user && (
        <ProjectSwipe currentUser={user as UserProfile} />
      )}

      {activeTab === 1 && (
        <div className="space-y-6">
          {userProjects.map((project) => (
            <div key={project.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Typography variant="h6" gutterBottom>
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {project.description}
                  </Typography>
                </div>
                <div className="text-right">
                  <div className="text-sm mb-2">
                    <span className="text-yellow-500">⏳ Pending: {project.project_applications?.filter((a: ProjectApplication) => a.status === 'pending').length || 0}</span>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="text-green-500">✓ Accepted: {project.project_applications?.filter((a: ProjectApplication) => a.status === 'accepted').length || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Team Size: {project.team_size} • Timeline: {project.timeline}
                </div>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setActiveTab(2)}
                >
                  View Applications
                </Button>
              </div>
            </div>
          ))}

          {userProjects.length === 0 && (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <Typography color="textSecondary">
                You haven't created any projects yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateProject}
                className="mt-4"
              >
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userApplications.map((application) => (
              <div key={application.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Typography variant="h6" gutterBottom>
                      {application.projects?.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {application.projects?.description}
                    </Typography>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {application.projects?.required_skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-200 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    Applied on: {new Date(application.created_at).toLocaleDateString()}
                  </div>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      toast.success('Chat feature coming soon!');
                    }}
                  >
                    Message Creator
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {userApplications.length === 0 && (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <Typography color="textSecondary">
                You haven't applied to any projects yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveTab(0)}
                className="mt-4"
              >
                Discover Projects
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 2 && user && userProjects.map((project) => (
        <div key={project.id} className="mb-8">
          <Typography variant="h6" gutterBottom>
            {project.title}
          </Typography>
          <ProjectApplications
            projectId={project.id}
            currentUser={user as UserProfile}
          />
        </div>
      ))}
    </Container>
  );
} 