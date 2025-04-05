import { useState } from "react";
import { ThesisProject, ThesisChapter } from "../types/thesis";
import { Section } from "./ChapterModal";
import { saveProject } from "../utils/storage";
import ChapterModal from "./ChapterModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  TextField,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Book as BookIcon,
  Description as DescriptionIcon,
  Edit,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectFormProps {
  project?: ThesisProject;
  onSave: (project: ThesisProject) => void;
  onCancel: () => void;
}

export default function ProjectForm({
  project,
  onSave,
  onCancel,
}: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [chapters, setChapters] = useState<ThesisChapter[]>(project?.chapters || []);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ThesisChapter | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    const updatedProject: ThesisProject = {
      id: project?.id || crypto.randomUUID(),
      title,
      description,
      chapters,
      createdAt: project?.createdAt || now,
      updatedAt: now,
    };

    onSave(updatedProject);
  };

  const addOrUpdateChapter = (chapterData: { id?: string; title: string; content: string; subsections: Section[] }) => {
    const addTimestampsToSubsections = (sections: Section[]): ThesisChapter[] => {
      const now = new Date().toISOString();
      return sections.map(section => ({
        id: section.id,
        title: section.title,
        content: section.content,
        subsections: addTimestampsToSubsections(section.subsections),
        createdAt: now,
        updatedAt: now,
      }));
    };
    const now = new Date().toISOString();

    if (chapterData.id) {
      // Update existing chapter
      const updatedChapters = chapters.map(ch => 
        ch.id === chapterData.id 
          ? {
              ...ch,
              title: chapterData.title,
              content: chapterData.content,
              subsections: addTimestampsToSubsections(chapterData.subsections),
              updatedAt: now,
            }
          : ch
      );
      setChapters(updatedChapters);
      
      // Save to storage
      if (project) {
        saveProject({
          ...project,
          chapters: updatedChapters,
          updatedAt: now,
        });
      }
    } else {
      // Add new chapter
      const newChapter: ThesisChapter = {
        id: crypto.randomUUID(),
        title: chapterData.title,
        content: chapterData.content,
        subsections: addTimestampsToSubsections(chapterData.subsections),
        createdAt: now,
        updatedAt: now,
      };
      const updatedChapters = [...chapters, newChapter];
      setChapters(updatedChapters);
      
      // Save to storage
      if (project) {
        saveProject({
          ...project,
          chapters: updatedChapters,
          updatedAt: now,
        });
      }
    }
    
    setEditingChapter(null);
  };

  const removeChapter = (chapterId: string) => {
    const updatedChapters = chapters.filter((chapter) => chapter.id !== chapterId);
    setChapters(updatedChapters);
    
    // Save to storage
    if (project) {
      saveProject({
        ...project,
        chapters: updatedChapters,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-8">
      <Card sx={{ maxWidth: "md", mx: "auto" }}>
        <CardTitle>{project ? "Edit Project" : "New Project"}</CardTitle>
        <CardDescription>
          Create a new thesis project and organize your chapters
        </CardDescription>
        <CardContent>
          <Stack spacing={3}>
            {/* Title Field */}
            <TextField
              fullWidth
              id="title"
              label="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your thesis title"
              required
              InputProps={{
                startAdornment: <BookIcon sx={{ mr: 1 }} />,
              }}
            />

            {/* Description Field */}
            <TextField
              fullWidth
              id="description"
              label="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your thesis project"
              required
              multiline
              rows={4}
              InputProps={{
                startAdornment: (
                  <DescriptionIcon
                    sx={{ mr: 1, alignSelf: "flex-start", mt: 1 }}
                  />
                ),
              }}
            />
            {/* Chapters Section */}
            <Box sx={{ mt: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <BookIcon fontSize="small" />
                  Chapters
                </Typography>
                <Chip
                  label={`${chapters.length} ${
                    chapters.length === 1 ? "chapter" : "chapters"
                  }`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>

              {/* Add Chapter Form */}
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Button onClick={() => {
                  setEditingChapter(null);
                  setChapterModalOpen(true);
                }}>
                  Add Chapter
                </Button>
                <ChapterModal
                  open={chapterModalOpen}
                  onClose={() => {
                    setChapterModalOpen(false);
                    setEditingChapter(null);
                  }}
                  onSave={addOrUpdateChapter}
                  initialChapter={editingChapter || undefined}
                />
              </Box>

              {/* Chapters List */}
              <AnimatePresence>
                {chapters.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Box
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      {chapters.map((chapter, index) => (
                        <motion.div
                          key={chapter.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 2,
                              borderBottom: index < chapters.length - 1 ? 1 : 0,
                              borderColor: "divider",
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Chip
                                label={index + 1}
                                color="primary"
                                size="small"
                                variant="outlined"
                              />
                              <Typography>{chapter.title}</Typography>
                            </Box>
                            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingChapter(chapter);
                                  setChapterModalOpen(true);
                                }}
                                sx={{
                                  opacity: 0,
                                  transition: "0.2s",
                                  "&:hover": { color: "primary.main" },
                                  ".MuiBox-root:hover &": { opacity: 1 },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => removeChapter(chapter.id)}
                                sx={{
                                  opacity: 0,
                                  transition: "0.2s",
                                  "&:hover": { color: "error.main" },
                                  ".MuiBox-root:hover &": { opacity: 1 },
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </motion.div>
                      ))}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Stack>

          {/* Form Actions */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 4 }}
          >
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              color="error"
            >
              Cancel
            </Button>
            <Button type="submit" startIcon={<AddIcon />}>
              {project ? "Update" : "Create"} Project
            </Button>
          </Box>
        </CardContent>
      </Card>
    </form>
  );
}
