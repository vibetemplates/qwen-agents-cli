import { describe, it, expect, beforeEach, vi } from 'vitest';
import type OpenAI from 'openai';
import { AnthropicOpenAICompatibleProvider } from './anthropic.js';
import { DefaultOpenAICompatibleProvider } from './default.js';
import type { ContentGeneratorConfig } from '../../contentGenerator.js';
import type { Config } from '../../../config/config.js';

describe('AnthropicOpenAICompatibleProvider', () => {
  let provider: AnthropicOpenAICompatibleProvider;
  let mockContentGeneratorConfig: ContentGeneratorConfig;
  let mockCliConfig: Config;

  beforeEach(() => {
    // Create mock CLI config
    mockCliConfig = {
      getCliVersion: vi.fn().mockReturnValue('1.0.0'),
    } as unknown as Config;

    // Create mock content generator config
    mockContentGeneratorConfig = {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3.5-sonnet',
    } as ContentGeneratorConfig;

    provider = new AnthropicOpenAICompatibleProvider(
      mockContentGeneratorConfig,
      mockCliConfig,
    );
  });

  describe('constructor', () => {
    it('should extend DefaultOpenAICompatibleProvider', () => {
      expect(provider).toBeInstanceOf(DefaultOpenAICompatibleProvider);
      expect(provider).toBeInstanceOf(AnthropicOpenAICompatibleProvider);
    });
  });

  describe('isAnthropicProvider', () => {
    it('should return true for anthropic.com URLs', () => {
      const testCases = [
        { baseUrl: 'https://api.anthropic.com/v1' },
        { baseUrl: 'https://anthropic.com/api' },
        { baseUrl: 'http://api.anthropic.com' },
      ];

      testCases.forEach((config) => {
        expect(
          AnthropicOpenAICompatibleProvider.isAnthropicProvider(
            config as ContentGeneratorConfig,
          ),
        ).toBe(true);
      });
    });

    it('should return false for non-anthropic URLs', () => {
      const testCases = [
        { baseUrl: 'https://api.openai.com/v1' },
        { baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
        { baseUrl: 'https://openrouter.ai/api/v1' },
        { baseUrl: 'https://example.com/api/v1' },
        { baseUrl: '' },
        { baseUrl: undefined },
      ];

      testCases.forEach((config) => {
        expect(
          AnthropicOpenAICompatibleProvider.isAnthropicProvider(
            config as ContentGeneratorConfig,
          ),
        ).toBe(false);
      });
    });
  });

  describe('isClaudeModel', () => {
    it('should return true for Claude models', () => {
      const claudeModels = [
        'claude-3.5-sonnet',
        'claude-3-opus',
        'claude-3-haiku',
        'claude-2.1',
        'anthropic/claude-3.5-sonnet',
        'CLAUDE-3.5-SONNET',
        'Claude-3-Opus',
      ];

      claudeModels.forEach((model) => {
        expect(AnthropicOpenAICompatibleProvider.isClaudeModel(model)).toBe(
          true,
        );
      });
    });

    it('should return false for non-Claude models', () => {
      const nonClaudeModels = [
        'gpt-4',
        'gpt-3.5-turbo',
        'qwen3-coder-plus',
        'deepseek-chat',
        'llama-3',
      ];

      nonClaudeModels.forEach((model) => {
        expect(AnthropicOpenAICompatibleProvider.isClaudeModel(model)).toBe(
          false,
        );
      });
    });
  });

  describe('buildRequest', () => {
    it('should remove top_p when both temperature and top_p are set', () => {
      const mockRequest: OpenAI.Chat.ChatCompletionCreateParams = {
        model: 'claude-3.5-sonnet',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
        top_p: 0.9,
      };

      const result = provider.buildRequest(mockRequest, 'test-prompt-id');

      expect(result.temperature).toBe(0.7);
      expect(result.top_p).toBeUndefined();
    });

    it('should keep temperature when only temperature is set', () => {
      const mockRequest: OpenAI.Chat.ChatCompletionCreateParams = {
        model: 'claude-3.5-sonnet',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
      };

      const result = provider.buildRequest(mockRequest, 'test-prompt-id');

      expect(result.temperature).toBe(0.7);
      expect(result.top_p).toBeUndefined();
    });

    it('should keep top_p when only top_p is set', () => {
      const mockRequest: OpenAI.Chat.ChatCompletionCreateParams = {
        model: 'claude-3.5-sonnet',
        messages: [{ role: 'user', content: 'Hello' }],
        top_p: 0.9,
      };

      const result = provider.buildRequest(mockRequest, 'test-prompt-id');

      expect(result.temperature).toBeUndefined();
      expect(result.top_p).toBe(0.9);
    });

    it('should pass through request when neither is set', () => {
      const mockRequest: OpenAI.Chat.ChatCompletionCreateParams = {
        model: 'claude-3.5-sonnet',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const result = provider.buildRequest(mockRequest, 'test-prompt-id');

      expect(result.temperature).toBeUndefined();
      expect(result.top_p).toBeUndefined();
    });

    it('should preserve other request parameters', () => {
      const mockRequest: OpenAI.Chat.ChatCompletionCreateParams = {
        model: 'claude-3.5-sonnet',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000,
        stream: true,
      };

      const result = provider.buildRequest(mockRequest, 'test-prompt-id');

      expect(result.max_tokens).toBe(1000);
      expect(result.stream).toBe(true);
      expect(result.model).toBe('claude-3.5-sonnet');
      expect(result.messages).toEqual([{ role: 'user', content: 'Hello' }]);
    });
  });
});
