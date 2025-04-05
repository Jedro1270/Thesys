import { useState, useEffect } from 'react';
import './App.css';
import ProjectForm from './components/ProjectForm';
import { ThesisProject } from './types/thesis';
import { getProjects, saveProject, deleteProject } from './utils/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Box, Container, Typography, AppBar, Toolbar } from '@mui/material';

function App() {
  const [projects, setProjects] = useState<ThesisProject[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<ThesisProject | null>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleSaveProject = (project: ThesisProject) => {
    saveProject(project);
    setProjects(getProjects());
    setIsCreating(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
      setProjects(getProjects());
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}>
            Thesys
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {(isCreating || editingProject) ? (
          <ProjectForm
            project={editingProject || undefined}
            onSave={handleSaveProject}
            onCancel={() => {
              setIsCreating(false);
              setEditingProject(null);
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            {projects.length === 0 ? (
              <Card sx={{ minHeight: 300, width: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 6 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No projects yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Create your first thesis project to get started
                    </Typography>
                    <Button
                      onClick={() => setIsCreating(true)}
                    >
                      Create Project
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              projects.map((project) => (
                <Card key={project.id} sx={{
                  transition: 'box-shadow 0.3s',
                  '&:hover': { boxShadow: 3 },
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="h6" component="h3">{project.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.description}
                        </Typography>
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        gap: 1,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '.MuiCard-root:hover &': { opacity: 1 },
                      }}>
                        <Button
                          onClick={() => setEditingProject(project)}
                          variant="ghost"
                          size="small"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteProject(project.id)}
                          variant="destructive"
                          size="small"
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', typography: 'body2' }}>
                      <span>{project.chapters.length} chapters</span>
                      <span>•</span>
                      <span>Last updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
