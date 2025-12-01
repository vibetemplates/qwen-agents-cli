/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import type { SlashCommand, MessageActionReturn } from './types.js';
import { CommandKind } from './types.js';
import { getCoreSystemPrompt } from '@ai-masters-community/qwen-code-core';
import { t } from '../../i18n/index.js';

/**
 * Resolves a path that may contain ~ to expand to user home directory.
 */
function resolvePath(filePath: string): string {
  if (filePath.startsWith('~/') || filePath === '~') {
    const home = os.homedir();
    return filePath === '~' ? home : path.join(home, filePath.slice(2));
  }
  return path.resolve(filePath);
}

/**
 * Gets the current system prompt from the chat session.
 */
function getCurrentSystemPrompt(
  config: import('@ai-masters-community/qwen-code-core').Config,
): string | undefined {
  try {
    const geminiClient = config.getGeminiClient();
    if (!geminiClient.isInitialized()) {
      return undefined;
    }
    const chat = geminiClient.getChat();
    return chat.getSystemInstruction();
  } catch {
    return undefined;
  }
}

export const systemPromptCommand: SlashCommand = {
  name: 'system-prompt',
  altNames: ['sysprompt'],
  get description() {
    return t('View or modify the system prompt');
  },
  kind: CommandKind.BUILT_IN,
  subCommands: [
    {
      name: 'show',
      get description() {
        return t('Display the current system prompt');
      },
      kind: CommandKind.BUILT_IN,
      action: (context, _args): MessageActionReturn => {
        const config = context.services.config;
        if (!config) {
          return {
            type: 'message',
            messageType: 'error',
            content: t('Configuration not available.'),
          };
        }

        const systemPrompt = getCurrentSystemPrompt(config);
        if (!systemPrompt) {
          return {
            type: 'message',
            messageType: 'error',
            content: t('Unable to retrieve system prompt. Chat may not be initialized.'),
          };
        }

        // Truncate for display if too long
        const maxDisplayLength = 2000;
        const truncated = systemPrompt.length > maxDisplayLength;
        const displayPrompt = truncated
          ? systemPrompt.substring(0, maxDisplayLength) + '\n\n... (truncated)'
          : systemPrompt;

        return {
          type: 'message',
          messageType: 'info',
          content: `**Current System Prompt** (${systemPrompt.length} chars):\n\n${displayPrompt}`,
        };
      },
    },
    {
      name: 'set',
      get description() {
        return t('Replace the system prompt with new text');
      },
      kind: CommandKind.BUILT_IN,
      action: async (context, args): Promise<MessageActionReturn> => {
        const config = context.services.config;
        if (!config) {
          return {
            type: 'message',
            messageType: 'error',
            content: t('Configuration not available.'),
          };
        }

        if (!args || args.trim().length === 0) {
          return {
            type: 'message',
            messageType: 'error',
            content: t('Usage: /system-prompt set <new system prompt text>'),
          };
        }

        try {
          const geminiClient = config.getGeminiClient();
          if (!geminiClient.isInitialized()) {
            return {
              type: 'message',
              messageType: 'error',
              content: t('Chat is not initialized.'),
            };
          }

          await geminiClient.resetChatWithSystemInstruction(args.trim());

          return {
            type: 'message',
            messageType: 'info',
            content: t(
              `System prompt updated (${args.trim().length} chars). Changes will take effect on the next message.`,
            ),
          };
        } catch (error) {
          return {
            type: 'message',
            messageType: 'error',
            content: t(`Failed to set system prompt: ${error}`),
          };
        }
      },
    },
    {
      name: 'append',
      get description() {
        return t('Append text to the current system prompt');
      },
      kind: CommandKind.BUILT_IN,
      action: async (context, args): Promise<MessageActionReturn> => {
        const config = context.services.config;
        if (!config) {
          return {
            type: 'message',
            messageType: 'error',
            content: t('Configuration not available.'),
          };
        }

        if (!args || args.trim().length === 0) {
          return {
            type: 'message',
            messageType: 'error',
            content: t('Usage: /system-prompt append <text to append>'),
          };
        }

        try {
          const geminiClient = config.getGeminiClient();
          if (!geminiClient.isInitialized()) {
            return {
              type: 'message',
              messageType: 'error',
              content: t('Chat is not initialized.'),
            };
          }

          const currentPrompt = getCurrentSystemPrompt(config) || '';
          const newPrompt = currentPrompt + '\n\n' + args.trim();

          await geminiClient.resetChatWithSystemInstruction(newPrompt);

          return {
            type: 'message',
            messageType: 'info',
            content: t(
              `Appended ${args.trim().length} chars to system prompt. Total: ${newPrompt.length} chars. Changes will take effect on the next message.`,
            ),
          };
        } catch (error) {
          return {
            type: 'message',
            messageType: 'error',
            content: t(`Failed to append to system prompt: ${error}`),
          };
        }
      },
    },
    {
      name: 'file',
      get description() {
        return t('Load system prompt from a file');
      },
      kind: CommandKind.BUILT_IN,
      action: async (context, args): Promise<MessageActionReturn> => {
        const config = context.services.config;
        if (!config) {
          return {
            type: 'message',
            messageType: 'error',
            content: t('Configuration not available.'),
          };
        }

        if (!args || args.trim().length === 0) {
          return {
            type: 'message',
            messageType: 'error',
            content: t('Usage: /system-prompt file <path/to/file>'),
          };
        }

        try {
          const filePath = resolvePath(args.trim());

          if (!fs.existsSync(filePath)) {
            return {
              type: 'message',
              messageType: 'error',
              content: t(`File not found: ${filePath}`),
            };
          }

          const fileContent = fs.readFileSync(filePath, 'utf-8');

          const geminiClient = config.getGeminiClient();
          if (!geminiClient.isInitialized()) {
            return {
              type: 'message',
              messageType: 'error',
              content: t('Chat is not initialized.'),
            };
          }

          await geminiClient.resetChatWithSystemInstruction(fileContent);

          return {
            type: 'message',
            messageType: 'info',
            content: t(
              `System prompt loaded from ${filePath} (${fileContent.length} chars). Changes will take effect on the next message.`,
            ),
          };
        } catch (error) {
          return {
            type: 'message',
            messageType: 'error',
            content: t(`Failed to load system prompt from file: ${error}`),
          };
        }
      },
      completion: async (_context, partialArg) => {
        // Basic file path completion
        try {
          const resolved = resolvePath(partialArg || '.');
          const dir = fs.statSync(resolved).isDirectory()
            ? resolved
            : path.dirname(resolved);
          const files = fs.readdirSync(dir);
          return files
            .filter(
              (f) =>
                f.endsWith('.md') || f.endsWith('.txt') || f.endsWith('.prompt'),
            )
            .map((f) => path.join(dir, f));
        } catch {
          return [];
        }
      },
    },
    {
      name: 'reset',
      get description() {
        return t('Reset to the default system prompt');
      },
      kind: CommandKind.BUILT_IN,
      action: async (context, _args): Promise<MessageActionReturn> => {
        const config = context.services.config;
        if (!config) {
          return {
            type: 'message',
            messageType: 'error',
            content: t('Configuration not available.'),
          };
        }

        try {
          const geminiClient = config.getGeminiClient();
          if (!geminiClient.isInitialized()) {
            return {
              type: 'message',
              messageType: 'error',
              content: t('Chat is not initialized.'),
            };
          }

          const defaultPrompt = getCoreSystemPrompt(
            config.getUserMemory(),
            config.getModel(),
          );

          await geminiClient.resetChatWithSystemInstruction(defaultPrompt);

          return {
            type: 'message',
            messageType: 'info',
            content: t(
              `System prompt reset to default (${defaultPrompt.length} chars). Changes will take effect on the next message.`,
            ),
          };
        } catch (error) {
          return {
            type: 'message',
            messageType: 'error',
            content: t(`Failed to reset system prompt: ${error}`),
          };
        }
      },
    },
  ],
  action: (context, args): MessageActionReturn => {
    // If no subcommand provided, show help
    if (!args || args.trim().length === 0) {
      return {
        type: 'message',
        messageType: 'info',
        content: `**System Prompt Commands:**

/system-prompt show    - Display the current system prompt
/system-prompt set <text>   - Replace the system prompt with new text
/system-prompt append <text> - Append text to the current system prompt
/system-prompt file <path>  - Load system prompt from a file
/system-prompt reset   - Reset to the default system prompt

**Note:** Changes take effect on the next message to the model.
The conversation history is preserved when changing the system prompt.`,
      };
    }

    // If args provided but not a known subcommand, treat as 'set'
    return {
      type: 'message',
      messageType: 'error',
      content: t(
        `Unknown subcommand: "${args.split(' ')[0]}". Use /system-prompt for available commands.`,
      ),
    };
  },
};
