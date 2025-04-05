import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RunnableSequence } from "@langchain/core/runnables";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ResearchContext, SubsectionContent } from "./types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (error instanceof Error && error.message.includes('429')) {
        // Exponential backoff: wait 2^i * 1000ms before retrying
        const delay = Math.pow(2, i) * 1000;
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

// Define our state types
type ThesisState = {
  context: ResearchContext;
  researchFindings?: string;
  initialDraft?: string;
  proofreadContent?: string;
  finalContent?: string;
  status: "researching" | "writing" | "proofreading" | "reviewing" | "complete";
  researchTitle?: string;
  researchDescription?: string;
};

// Create agents with their specific prompts
const createResearchAgent = (_apiKey: string) => {
  const model = new ChatOllama({
    model: "llama2",
    temperature: 0.7,
    baseUrl: "http://localhost:11434",
  });

  const searchTool = new TavilySearchResults({
    apiKey: import.meta.env.VITE_TAVILY_API_KEY,
  });

  const systemPrompt = `You are an expert academic researcher. Your role is to:
1. Analyze research topics and subsections
2. Identify key areas that need investigation
3. Provide detailed, academically-sound research findings
4. Include relevant citations and references
5. Focus on accuracy and scholarly merit`;

  return async (state: ThesisState) => {
    // First, search for relevant information
    // TODO: Improve
    const searchQuery = `${state.researchTitle || state.context.topic} ${state.context.subsection.title} ${state.researchDescription || ''} academic research`;
    const searchResults = await searchTool.invoke(searchQuery);

    console.log("searchQuery", searchQuery)

    console.log("Search results", searchResults)

    const response = await withRetry(() => model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Research the following topic for a thesis subsection:
Topic: ${state.context.topic}
Subsection: ${state.context.subsection.title}
Requirements: ${state.context.requirements?.join(", ") || "None specified"}

Here are some relevant search results to incorporate:
${JSON.stringify(searchResults, null, 2)}

Please provide comprehensive research findings that can be used to write this subsection, incorporating the search results above.`),
    ]));

    return {
      ...state,
      researchFindings: response.content.toString(),
      status: "writing" as const,
    };
  };
};

const createWriterAgent = (_apiKey: string) => {
  const model = new ChatOllama({
    model: "llama2",
    temperature: 0.7,
    baseUrl: import.meta.env.VITE_OLLAMA_URL,
  });

  const systemPrompt = `You are an expert academic writer. Your role is to:
1. Transform research findings into well-structured content
2. Maintain academic writing standards
3. Ensure logical flow and coherence
4. Use appropriate academic language
5. Follow academic formatting guidelines`;

  return async (state: ThesisState) => {
    const response = await withRetry(() => model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Write a thesis subsection based on these research findings:
${state.researchFindings}

Topic: ${state.context.topic}
Subsection: ${state.context.subsection.title}
Requirements: ${state.context.requirements?.join(", ") || "None specified"}`),
    ]));

    return {
      ...state,
      initialDraft: response.content.toString(),
      status: "proofreading" as const,
    };
  };
};

const createProofreaderAgent = (_apiKey: string) => {
  const model = new ChatOllama({
    model: "llama2",
    temperature: 0.7,
    baseUrl: import.meta.env.VITE_OLLAMA_URL,
  });

  const systemPrompt = `You are an expert academic proofreader. Your role is to:
1. Check grammar and punctuation
2. Verify academic writing style
3. Ensure clarity and conciseness
4. Check formatting consistency
5. Suggest improvements`;

  return async (state: ThesisState) => {
    const response = await withRetry(() => model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Proofread and improve this thesis subsection:
${state.initialDraft}

Topic: ${state.context.topic}
Subsection: ${state.context.subsection.title}
Requirements: ${state.context.requirements?.join(", ") || "None specified"}`),
    ]));

    return {
      ...state,
      proofreadContent: response.content.toString(),
      status: "reviewing" as const,
    };
  };
};

const createReviewerAgent = (_apiKey: string) => {
  const model = new ChatOllama({
    model: "llama2",
    temperature: 0.7,
    baseUrl: import.meta.env.VITE_OLLAMA_URL,
  });

  const systemPrompt = `You are a thesis writing supervisor. Your role is to:
1. Review academic quality and rigor
2. Verify argument strength and logic
3. Check citation usage and integration
4. Assess overall contribution
5. Provide final improvements`;

  return async (state: ThesisState) => {
    const response = await withRetry(() => model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Review and finalize this thesis subsection:
${state.proofreadContent}

Topic: ${state.context.topic}
Subsection: ${state.context.subsection.title}
Requirements: ${state.context.requirements?.join(", ") || "None specified"}`),
    ]));

    return {
      ...state,
      finalContent: response.content.toString(),
      status: "complete" as const,
    };
  };
};

// Create the thesis generation workflow
export const createThesisWorkflow = (apiKey: string) => {
  const researchAgent = createResearchAgent(apiKey);
  const writerAgent = createWriterAgent(apiKey);
  const proofreaderAgent = createProofreaderAgent(apiKey);
  const reviewerAgent = createReviewerAgent(apiKey);

  return RunnableSequence.from([
    researchAgent,
    writerAgent,
    proofreaderAgent,
    reviewerAgent,
  ]);
};

// Function to generate subsection content
export const generateSubsectionContent = async (
  apiKey: string,
  topic: string,
  subsection: SubsectionContent,
  requirements?: string[],
  researchTitle?: string,
  researchDescription?: string
): Promise<SubsectionContent> => {
  const workflow = createThesisWorkflow(apiKey);
  const initialState: ThesisState = {
    context: {
      topic,
      subsection,
      requirements,
    },
    status: "researching",
    researchTitle,
    researchDescription,
  };

  const result = await workflow.invoke(initialState);

  return {
    ...subsection,
    content: result.finalContent || "",
  };
};
