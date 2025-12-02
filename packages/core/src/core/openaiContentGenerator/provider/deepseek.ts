/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

import type OpenAI from 'openai';
import type { Config } from '../../../config/config.js';
import type { ContentGeneratorConfig } from '../../contentGenerator.js';
import { DefaultOpenAICompatibleProvider } from './default.js';

export class DeepSeekOpenAICompatibleProvider extends DefaultOpenAICompatibleProvider {
  constructor(
    contentGeneratorConfig: ContentGeneratorConfig,
    cliConfig: Config,
  ) {
    super(contentGeneratorConfig, cliConfig);
  }

  static isDeepSeekProvider(
    contentGeneratorConfig: ContentGeneratorConfig,
  ): boolean {
    const baseUrl = contentGeneratorConfig.baseUrl ?? '';

    return baseUrl.toLowerCase().includes('api.deepseek.com');
  }

  override buildRequest(
    request: OpenAI.Chat.ChatCompletionCreateParams,
    userPromptId: string,
  ): OpenAI.Chat.ChatCompletionCreateParams {
    const baseRequest = super.buildRequest(request, userPromptId);
    if (!baseRequest.messages?.length) {
      return baseRequest;
    }

    const messages = baseRequest.messages.map((message) => {
      // Ensure assistant messages include reasoning_content for DeepSeek reasoning models.
      const ensureReasoningContent = (
        updatedMessage: OpenAI.Chat.ChatCompletionMessageParam,
      ): OpenAI.Chat.ChatCompletionMessageParam => {
        if (updatedMessage.role !== 'assistant') {
          return updatedMessage;
        }

        const reasoningContent =
          (updatedMessage as { reasoning_content?: string }).reasoning_content;

        if (reasoningContent !== undefined) {
          return updatedMessage;
        }

        const contentString =
          typeof updatedMessage.content === 'string'
            ? updatedMessage.content
            : null;

        return {
          ...updatedMessage,
          reasoning_content: contentString ?? '',
        } as OpenAI.Chat.ChatCompletionMessageParam;
      };

      if (!('content' in message)) {
        return ensureReasoningContent(message);
      }

      const { content } = message;

      if (
        typeof content === 'string' ||
        content === null ||
        content === undefined
      ) {
        return ensureReasoningContent(message);
      }

      if (!Array.isArray(content)) {
        return message;
      }

      const text = content
        .map((part) => {
          if (part.type !== 'text') {
            throw new Error(
              `DeepSeek provider only supports text content. Found non-text part of type '${part.type}' in message with role '${message.role}'.`,
            );
          }

          return part.text ?? '';
        })
        .join('');

      const updatedMessage = {
        ...message,
        content: text,
      } as OpenAI.Chat.ChatCompletionMessageParam;

      return ensureReasoningContent(updatedMessage);
    });

    return {
      ...baseRequest,
      messages,
    };
  }
}
