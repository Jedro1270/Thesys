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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

export interface Section {
  id: string;
  title: string;
  content: string;
  subsections: Section[];
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
}

const SubsectionItem = ({
  section,
  onUpdate,
  onDelete,
}: {
  section: Section;
  onUpdate: (updatedSection: Section) => void;
  onDelete: () => void;
}) => {
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
        <IconButton edge="end" onClick={onDelete} color="error" size="small">
          <DeleteIcon />
        </IconButton>
      </Box>

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

const getSubsectionsContent = (sections: Section[], level: number = 0): string => {
  const indent = '  '.repeat(level);
  const contentIndent = '  '.repeat(level + 1);
  
  return sections
    .map((section) => {
      const subsectionContent = getSubsectionsContent(section.subsections, level + 1);
      const contentLines = section.content
        .split('\n')
        .map(line => `${contentIndent}${line}`)
        .join('\n');
      
      return `${indent}${section.title}:
${contentLines}${subsectionContent ? `\n${subsectionContent}` : ''}`;
    })
    .join('\n\n');
};

export default function ChapterModal({
  open,
  onClose,
  onSave,
  initialChapter,
}: ChapterModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subsections, setSubsections] = useState<Section[]>([]);
  const [newSubsectionTitle, setNewSubsectionTitle] = useState("");
  const [isAutoUpdatingContent, setIsAutoUpdatingContent] = useState(false);

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

  const handleAddSubsection = () => {
    if (newSubsectionTitle.trim()) {
      setSubsections([
        ...subsections,
        {
          id: crypto.randomUUID(),
          title: newSubsectionTitle,
          content: "",
          subsections: [],
        },
      ]);
      setNewSubsectionTitle("");
    }
  };

  const handleUpdateSubsection = (index: number, updatedSection: Section) => {
    const newSubsections = [...subsections];
    newSubsections[index] = updatedSection;
    setSubsections(newSubsections);
  };

  const handleDeleteSubsection = (index: number) => {
    setSubsections(subsections.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      id: initialChapter?.id,
      title,
      content,
      subsections,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setSubsections([]);
    setNewSubsectionTitle("");
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth 
    >
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
            {subsections.map((subsection, index) => (
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
                  section={subsection}
                  onUpdate={(updated) => handleUpdateSubsection(index, updated)}
                  onDelete={() => handleDeleteSubsection(index)}
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAutoUpdatingContent}
                  onChange={(e) => {
                    setIsAutoUpdatingContent(e.target.checked);
                    if (e.target.checked && subsections.length > 0) {
                      const subsectionsContent = getSubsectionsContent(subsections, 0);
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
