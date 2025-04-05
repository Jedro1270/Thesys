export interface AgentResponse {
  content: string;
  metadata?: Record<string, any>;
}

export interface SubsectionContent {
  id: string;
  title: string;
  content: string;
  references?: string[];
}

export interface ResearchContext {
  topic: string;
  subsection: SubsectionContent;
  previousContent?: string;
  requirements?: string[];
}
