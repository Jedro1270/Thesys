import { ChatAnthropic } from "@langchain/anthropic";
import { AgentResponse, ResearchContext } from "./types";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";

export abstract class BaseAgent {
  protected model: ChatAnthropic;
  protected systemPrompt: string = "";
  
  constructor(
    apiKey: string,
    model = "claude-3-opus-20240229",
    temperature = 0.7
  ) {
    this.model = new ChatAnthropic({
      anthropicApiKey: apiKey,
      modelName: model,
      temperature,
    });
  }

  protected abstract getSystemPrompt(): string;

  protected async getResponse(
    messages: BaseMessage[],
    context: ResearchContext
  ): Promise<AgentResponse> {
    const response = await this.model.invoke([
      new SystemMessage(this.getSystemPrompt()),
      ...messages,
    ]);

    // Ensure content is always a string
    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);

    return {
      content,
      metadata: { context },
    };
  }
}
