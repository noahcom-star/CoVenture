import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { TextField, Button, Container, Typography, Paper, Box, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

export default function CreateProject() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    team_size: '',
    timeline: '',
    required_skills: [] as string[],
    newSkill: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleAddSkill = () => {
    const skill = formData.newSkill.trim();
    if (skill && !formData.required_skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill],
        newSkill: ''
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      setError('You must be logged in to create a project');
      setLoading(false);
      return;
    }

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.team_size) {
        throw new Error('Team size is required');
      }
      if (!formData.timeline.trim()) {
        throw new Error('Timeline is required');
      }
      if (formData.required_skills.length === 0) {
        throw new Error('At least one required skill is needed');
      }

      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        team_size: parseInt(formData.team_size),
        timeline: formData.timeline.trim(),
        required_skills: formData.required_skills,
        creator_id: user.id,
        status: 'open'
      };

      console.log('Creating project with data:', projectData);

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw projectError;
      }

      console.log('Project created successfully:', project);

      // Add creator as a project member
      if (project) {
        const { error: memberError } = await supabase
          .from('project_members')
          .insert({
            project_id: project.id,
            user_id: user.id,
            role: 'creator'
          });

        if (memberError) {
          console.error('Error adding project member:', memberError);
          toast.error('Project created but failed to add you as a member');
        }
      }

      toast.success('Project created successfully!');
      router.push('/projects');
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.message || 'Failed to create project. Please try again.');
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" className="py-8">
        <Paper className="p-6">
          <Typography variant="h6" align="center" color="error">
            Please sign in to create a project
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="py-8">
      <Paper className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            fullWidth
            label="Project Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={4}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Team Size"
              type="number"
              value={formData.team_size}
              onChange={(e) => setFormData(prev => ({ ...prev, team_size: e.target.value }))}
              required
            />

            <TextField
              label="Timeline"
              value={formData.timeline}
              onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
              placeholder="e.g., 3 months"
              required
            />
          </div>

          <div>
            <Typography variant="subtitle1" gutterBottom>
              Required Skills
            </Typography>
            <div className="flex gap-2 mb-2">
              {formData.required_skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  className="bg-blue-100"
                />
              ))}
            </div>
            <div className="flex gap-2">
              <TextField
                label="Add Skill"
                value={formData.newSkill}
                onChange={(e) => setFormData(prev => ({ ...prev, newSkill: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <IconButton onClick={handleAddSkill} color="primary">
                <AddIcon />
              </IconButton>
            </div>
          </div>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Box className="flex justify-end space-x-4">
            <Button
              variant="outlined"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
} 