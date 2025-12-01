import type OpenAI from 'openai';
import type { Config } from '../../../config/config.js';
import type { ContentGeneratorConfig } from '../../contentGenerator.js';
import { DefaultOpenAICompatibleProvider } from './default.js';

/**
 * Provider for Anthropic's OpenAI-compatible API
 * Handles Claude model-specific constraints like not allowing both temperature and top_p
 */
export class AnthropicOpenAICompatibleProvider extends DefaultOpenAICompatibleProvider {
  constructor(
    contentGeneratorConfig: ContentGeneratorConfig,
    cliConfig: Config,
  ) {
    super(contentGeneratorConfig, cliConfig);
  }

  static isAnthropicProvider(
    contentGeneratorConfig: ContentGeneratorConfig,
  ): boolean {
    const baseURL = contentGeneratorConfig.baseUrl || '';
    return baseURL.includes('anthropic.com');
  }

  static isClaudeModel(model: string): boolean {
    const lowerModel = model.toLowerCase();
    return lowerModel.includes('claude');
  }

  override buildRequest(
    request: OpenAI.Chat.ChatCompletionCreateParams,
    userPromptId: string,
  ): OpenAI.Chat.ChatCompletionCreateParams {
    const result = { ...request };

    // Claude models don't support both temperature and top_p simultaneously
    // If both are present, keep temperature and remove top_p
    if (result.temperature !== undefined && result.top_p !== undefined) {
      delete result.top_p;
    }

    return result;
  }
}
