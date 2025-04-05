import { useState } from "react";
import { ThesisProject, ThesisChapter } from "../types/thesis";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
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
  const [chapters, setChapters] = useState<ThesisChapter[]>(
    project?.chapters || []
  );
  const [newChapterTitle, setNewChapterTitle] = useState("");

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

  const addChapter = () => {
    if (!newChapterTitle.trim()) return;

    const now = new Date().toISOString();
    const newChapter: ThesisChapter = {
      id: crypto.randomUUID(),
      title: newChapterTitle,
      content: "",
      createdAt: now,
      updatedAt: now,
    };

    setChapters([...chapters, newChapter]);
    setNewChapterTitle("");
  };

  const removeChapter = (chapterId: string) => {
    setChapters(chapters.filter((chapter) => chapter.id !== chapterId));
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-8">
      <Card sx={{ maxWidth: "md", mx: "auto" }}>
        <CardHeader>
          <CardTitle>{project ? "Edit Project" : "New Project"}</CardTitle>
          <CardDescription>
            Create a new thesis project and organize your chapters
          </CardDescription>
        </CardHeader>
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
                <TextField
                  fullWidth
                  size="small"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="Enter chapter title"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addChapter();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addChapter}
                  variant="secondary"
                  startIcon={<AddIcon />}
                >
                  Add Chapter
                </Button>
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
