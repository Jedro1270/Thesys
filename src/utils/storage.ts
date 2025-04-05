import { ThesisProject } from '../types/thesis';

const STORAGE_KEY = 'thesys_projects';

export const saveProjects = (projects: ThesisProject[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const getProjects = (): ThesisProject[] => {
  const projects = localStorage.getItem(STORAGE_KEY);
  return projects ? JSON.parse(projects) : [];
};

export const saveProject = (project: ThesisProject): void => {
  const projects = getProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  
  saveProjects(projects);
};

export const deleteProject = (projectId: string): void => {
  const projects = getProjects();
  const filteredProjects = projects.filter(p => p.id !== projectId);
  saveProjects(filteredProjects);
};
