import { Box, LinearProgress, Typography } from "@mui/material";
import {
  Book as BookIcon,
  Edit as EditIcon,
  Spellcheck as SpellcheckIcon,
  RateReview as ReviewIcon,
} from "@mui/icons-material";

type GenerationStatus = "researching" | "writing" | "proofreading" | "reviewing" | "complete";

interface GenerationProgressProps {
  status: GenerationStatus;
}

const steps = [
  { label: "Research", icon: BookIcon, value: "researching" },
  { label: "Write", icon: EditIcon, value: "writing" },
  { label: "Proofread", icon: SpellcheckIcon, value: "proofreading" },
  { label: "Review", icon: ReviewIcon, value: "reviewing" },
];

const getProgress = (status: GenerationStatus) => {
  const index = steps.findIndex((step) => step.value === status);
  if (status === "complete") return 100;
  return ((index + 1) / steps.length) * 100;
};

export default function GenerationProgress({ status }: GenerationProgressProps) {
  const progress = getProgress(status);

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        {steps.map(({ label, icon: Icon, value }) => {
          const isActive = value === status || status === "complete";
          const isPast =
            steps.findIndex((step) => step.value === value) <
            steps.findIndex((step) => step.value === status);

          return (
            <Box
              key={value}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: isActive || isPast ? 1 : 0.5,
              }}
            >
              <Icon
                color={isActive ? "primary" : isPast ? "success" : "disabled"}
                sx={{ mb: 0.5 }}
              />
              <Typography
                variant="caption"
                color={isActive ? "primary" : isPast ? "success" : "text.secondary"}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
}
