import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  Box,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import { generateSubsectionContent } from "../lib/agents/thesis-graph";
import GenerationProgress from "./GenerationProgress";
import { SubsectionContent } from "../lib/agents/types";

export interface Section {
  id: string;
  title: string;
  content: string;
  subsections: Section[];
  isGenerating?: boolean;
  generationStatus?:
    | "researching"
    | "writing"
    | "proofreading"
    | "reviewing"
    | "complete";
}

interface ChapterModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (chapter: {
    id?: string;
    title: string;
    content: string;
    subsections: Section[];
  }) => void;
  initialChapter?: {
    id: string;
    title: string;
    content: string;
    subsections: Section[];
  };
  projectTitle: string;
  projectDescription: string;
}

interface SubsectionItemProps {
  section: Section;
  onUpdate: (updatedSection: Section) => void;
  onDelete: () => void;
  onGenerate?: () => Promise<void>;
}

const SubsectionItem = ({
  section,
  onUpdate,
  onDelete,
  onGenerate,
}: SubsectionItemProps) => {
  const [newSubsectionTitle, setNewSubsectionTitle] = useState("");

  const handleAddSubsection = () => {
    if (newSubsectionTitle.trim()) {
      const newSection: Section = {
        id: crypto.randomUUID(),
        title: newSubsectionTitle,
        content: "",
        subsections: [],
      };
      onUpdate({
        ...section,
        subsections: [...section.subsections, newSection],
      });
      setNewSubsectionTitle("");
    }
  };

  const handleUpdateSubsection = (index: number, updatedSection: Section) => {
    const newSubsections = [...section.subsections];
    newSubsections[index] = updatedSection;
    onUpdate({ ...section, subsections: newSubsections });
  };

  const handleDeleteSubsection = (index: number) => {
    onUpdate({
      ...section,
      subsections: section.subsections.filter((_, i) => i !== index),
    });
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1">{section.title}</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {onGenerate && (
            <IconButton
              size="small"
              onClick={onGenerate}
              disabled={section.isGenerating}
              color="primary"
            >
              {section.isGenerating ? (
                <CircularProgress size={20} />
              ) : (
                <AutoAwesomeIcon />
              )}
            </IconButton>
          )}
          <IconButton size="small" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {section.isGenerating && section.generationStatus && (
        <GenerationProgress status={section.generationStatus} />
      )}

      <TextField
        label="Content"
        value={section.content}
        onChange={(e) => onUpdate({ ...section, content: e.target.value })}
        multiline
        rows={4}
        fullWidth
        variant="outlined"
        size="small"
      />

      {section.subsections.length > 0 && (
        <List sx={{ pl: 2, borderLeft: "1px solid", borderColor: "divider" }}>
          {section.subsections.map((subsection, index) => (
            <ListItem
              key={subsection.id}
              sx={{
                flexDirection: "column",
                alignItems: "stretch",
                gap: 1,
                p: 2,
              }}
            >
              <SubsectionItem
                section={subsection}
                onUpdate={(updated) => handleUpdateSubsection(index, updated)}
                onDelete={() => handleDeleteSubsection(index)}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          label="New Subsection Title"
          value={newSubsectionTitle}
          onChange={(e) => setNewSubsectionTitle(e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
        />
        <IconButton
          onClick={handleAddSubsection}
          color="primary"
          disabled={!newSubsectionTitle.trim()}
          size="small"
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

const getSubsectionsContent = (
  sections: Section[],
  level: number = 0
): string => {
  const indent = "  ".repeat(level);

  return sections
    .map((section) => {
      const contentLines = section.content
        .split("\n")
        .map((line) => `${indent}  ${line}`)
        .join("\n");

      const subsectionContent =
        section.subsections.length > 0
          ? getSubsectionsContent(section.subsections, level + 1)
          : "";

      return `${indent}${section.title}:\n${contentLines}${
        subsectionContent ? `\n${subsectionContent}` : ""
      }`;
    })
    .join("\n\n");
};

export default function ChapterModal({
  open,
  onClose,
  onSave,
  initialChapter,
  projectTitle,
  projectDescription,
}: ChapterModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subsections, setSubsections] = useState<Section[]>([]);
  const [isAutoUpdatingContent, setIsAutoUpdatingContent] = useState(false);
  const [newSubsectionTitle, setNewSubsectionTitle] = useState("");

  useEffect(() => {
    if (open && initialChapter) {
      setTitle(initialChapter.title);
      setContent(initialChapter.content);
      setSubsections(initialChapter.subsections);
    }
  }, [open, initialChapter]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setContent("");
      setSubsections([]);
      setNewSubsectionTitle("");
      setIsAutoUpdatingContent(false);
    }
  }, [open]);

  useEffect(() => {
    if (isAutoUpdatingContent) {
      const updatedContent = getSubsectionsContent(subsections);
      setContent(updatedContent);
    }
  }, [subsections, isAutoUpdatingContent]);

  const handleUpdateSection = (updatedSection: Section) => {
    setSubsections((prevSubsections) =>
      prevSubsections.map((section) =>
        section.id === updatedSection.id ? updatedSection : section
      )
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    setSubsections((prevSubsections) =>
      prevSubsections.filter((section) => section.id !== sectionId)
    );
  };

  const handleAddSubsection = () => {
    if (newSubsectionTitle.trim()) {
      const newSection: Section = {
        id: crypto.randomUUID(),
        title: newSubsectionTitle,
        content: "",
        subsections: [],
      };
      setSubsections([...subsections, newSection]);
      setNewSubsectionTitle("");
    }
  };

  useEffect(() => {
    if (initialChapter) {
      setTitle(initialChapter.title);
      setContent(initialChapter.content);
      setSubsections(initialChapter.subsections || []);
      setIsAutoUpdatingContent(false);
    } else {
      setTitle("");
      setContent("");
      setSubsections([]);
      setIsAutoUpdatingContent(true);
    }
  }, [initialChapter]);

  useEffect(() => {
    if (isAutoUpdatingContent && subsections.length > 0) {
      const subsectionsContent = getSubsectionsContent(subsections, 0);
      setContent(subsectionsContent);
    }
  }, [subsections, isAutoUpdatingContent]);

  const handleGenerate = async (section: Section) => {

    const updatedSection = {
      ...section,
      isGenerating: true,
      generationStatus: "researching" as const,
    };
    handleUpdateSection(updatedSection);

    try {
      const subsectionContent: SubsectionContent = {
        id: section.id,
        title: section.title,
        content: "",
      };

      const result = await generateSubsectionContent(
        "", // API key not needed for Llama
        title,
        subsectionContent,
        [], // requirements
        projectTitle, // research title
        projectDescription, // research description
      );

      handleUpdateSection({
        ...section,
        content: result.content,
        isGenerating: false,
        generationStatus: "complete" as const,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      handleUpdateSection({
        ...section,
        isGenerating: false,
      });
    }
  };

  const handleSave = () => {
    onSave({
      id: initialChapter?.id,
      title,
      content,
      subsections,
    });
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setSubsections([]);
    setNewSubsectionTitle("");
    setIsAutoUpdatingContent(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialChapter ? "Edit" : "Add New"} Chapter</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Chapter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
          />

          <Typography variant="h6" sx={{ mt: 2 }}>
            Subsections
          </Typography>

          <List>
            {subsections.map((subsection) => (
              <ListItem
                key={subsection.id}
                sx={{
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <SubsectionItem
                  key={subsection.id}
                  section={subsection}
                  onUpdate={handleUpdateSection}
                  onDelete={() => handleDeleteSection(subsection.id)}
                  onGenerate={() => handleGenerate(subsection)}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
            <TextField
              label="New Subsection Title"
              value={newSubsectionTitle}
              onChange={(e) => setNewSubsectionTitle(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
            <IconButton
              onClick={handleAddSubsection}
              color="primary"
              disabled={!newSubsectionTitle.trim()}
            >
              <AddIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAutoUpdatingContent}
                  onChange={(e) => {
                    setIsAutoUpdatingContent(e.target.checked);
                    if (e.target.checked && subsections.length > 0) {
                      const subsectionsContent = getSubsectionsContent(
                        subsections,
                        0
                      );
                      setContent(subsectionsContent);
                    }
                  }}
                />
              }
              label="Auto-update content from subsections"
            />
            <TextField
              label="Chapter Content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setIsAutoUpdatingContent(false);
              }}
              multiline
              minRows={6}
              maxRows={Infinity}
              fullWidth
              variant="outlined"
              disabled={isAutoUpdatingContent}
              helperText={
                isAutoUpdatingContent
                  ? "Content is automatically updated based on subsections"
                  : "Manual content editing mode"
              }
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!title.trim()}
        >
          Save Chapter
        </Button>
      </DialogActions>
    </Dialog>
  );
}
