/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  type CommandContext,
  type SlashCommand,
  type MessageActionReturn,
  type SlashCommandActionReturn,
} from './types.js';
import { CommandKind } from './types.js';
import { Storage } from '@ai-masters-community/qwen-agents-code-core';
import { t } from '../../i18n/index.js';

type PresetSource =
  | { kind: 'global' }
  | { kind: 'project'; filePath: string };

interface PresetEntry {
  name: string;
  prompt: string;
  source: PresetSource;
}

const PRESETS_FILENAME = 'sp-presets.json';
const MAX_DISPLAY_LENGTH = 2000;

function getGlobalPresetsPath(): string {
  return path.join(Storage.getGlobalQwenDir(), PRESETS_FILENAME);
}

function ensureDirExists(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function loadGlobalPresets(): Record<string, string> {
  const filePath = getGlobalPresetsPath();
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.presets) {
      return parsed.presets as Record<string, string>;
    }
    if (parsed && typeof parsed === 'object') {
      // Backward compatible shape if we ever wrote just the map
      return parsed as Record<string, string>;
    }
  } catch {
    // Ignore and treat as empty
  }
  return {};
}

function saveGlobalPresets(presets: Record<string, string>): void {
  const filePath = getGlobalPresetsPath();
  ensureDirExists(filePath);
  fs.writeFileSync(
    filePath,
    JSON.stringify({ presets }, null, 2),
    'utf-8',
  );
}

function loadProjectPresets(projectRoot?: string): PresetEntry[] {
  if (!projectRoot) return [];
  const spDir = path.join(projectRoot, 'sp');
  if (!fs.existsSync(spDir) || !fs.statSync(spDir).isDirectory()) {
    return [];
  }

  const entries: PresetEntry[] = [];
  for (const entry of fs.readdirSync(spDir)) {
    const fullPath = path.join(spDir, entry);
    try {
      const stat = fs.statSync(fullPath);
      if (!stat.isFile()) continue;
      const prompt = fs.readFileSync(fullPath, 'utf-8');
      const name = path.parse(entry).name;
      entries.push({
        name,
        prompt,
        source: { kind: 'project', filePath: fullPath },
      });
    } catch {
      // Ignore unreadable entries
    }
  }
  return entries;
}

function loadAllPresets(config: CommandContext['services']['config']): Map<
  string,
  PresetEntry
> {
  const merged = new Map<string, PresetEntry>();

  const globalPresets = loadGlobalPresets();
  for (const [name, prompt] of Object.entries(globalPresets)) {
    merged.set(name, { name, prompt, source: { kind: 'global' } });
  }

  const projectPresets = loadProjectPresets(config?.getProjectRoot());
  for (const preset of projectPresets) {
    merged.set(preset.name, preset);
  }

  return merged;
}

function truncateForDisplay(text: string): { display: string; truncated: boolean } {
  if (text.length <= MAX_DISPLAY_LENGTH) {
    return { display: text, truncated: false };
  }
  return {
    display: `${text.slice(0, MAX_DISPLAY_LENGTH)}\n\n... (truncated)`,
    truncated: true,
  };
}

function parseNameAndPrompt(raw: string): { name: string; prompt: string } | undefined {
  const trimmed = raw.trim();
  const firstSpace = trimmed.indexOf(' ');
  if (firstSpace === -1) {
    return undefined;
  }
  const name = trimmed.slice(0, firstSpace).trim();
  const prompt = trimmed.slice(firstSpace + 1).trim();
  if (!name || !prompt) return undefined;
  return { name, prompt };
}

function validateName(name: string): string | undefined {
  if (!/^[A-Za-z0-9._-]+$/.test(name)) {
    return t('Preset names may only contain letters, numbers, ., _, and -. Got "{{name}}".', {
      name,
    });
  }
  return undefined;
}

function addPreset(args: string): MessageActionReturn {
  const parsed = parseNameAndPrompt(args);
  if (!parsed) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('Usage: /sp add <name> <system prompt text>'),
    };
  }
  const nameError = validateName(parsed.name);
  if (nameError) {
    return {
      type: 'message',
      messageType: 'error',
      content: nameError,
    };
  }

  const presets = loadGlobalPresets();
  presets[parsed.name] = parsed.prompt;
  try {
    saveGlobalPresets(presets);
    return {
      type: 'message',
      messageType: 'info',
      content: t(
        `Saved system prompt preset "{{name}}" (${parsed.prompt.length} chars) to {{path}}.`,
        { name: parsed.name, path: getGlobalPresetsPath() },
      ),
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: t(`Failed to save preset: ${error}`),
    };
  }
}

function removePreset(args: string): MessageActionReturn {
  const name = args.trim();
  if (!name) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('Usage: /sp remove <name>'),
    };
  }
  const presets = loadGlobalPresets();
  if (!presets[name]) {
    return {
      type: 'message',
      messageType: 'error',
      content: t(`Preset "{{name}}" not found in global presets.`, { name }),
    };
  }
  delete presets[name];
  try {
    saveGlobalPresets(presets);
    return {
      type: 'message',
      messageType: 'info',
      content: t(`Removed preset "{{name}}" from {{path}}.`, {
        name,
        path: getGlobalPresetsPath(),
      }),
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: t(`Failed to remove preset: ${error}`),
    };
  }
}

function listPresets(context: CommandContext): MessageActionReturn {
  const presets = loadAllPresets(context.services.config);
  if (presets.size === 0) {
    return {
      type: 'message',
      messageType: 'info',
      content: t('No system prompt presets found. Add one with `/sp add <name> <system prompt>`.'),
    };
  }

  let content = t('Available system prompt presets:') + '\n\n';
  for (const preset of Array.from(presets.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const sourceLabel =
      preset.source.kind === 'project'
        ? t('project ({{path}})', { path: preset.source.filePath })
        : t('global');
    content += `- ${preset.name} (${preset.prompt.length} chars, ${sourceLabel})\n`;
  }
  content +=
    '\n' +
    t(
      'Usage: `/sp <name> <prompt>` to use a preset. Add/remove with `/sp add` or `/sp remove`. Project presets are loaded from ./sp/*.'
    );

  return {
    type: 'message',
    messageType: 'info',
    content,
  };
}

function showPreset(context: CommandContext, args: string): MessageActionReturn {
  const name = args.trim();
  if (!name) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('Usage: /sp show <name>'),
    };
  }
  const presets = loadAllPresets(context.services.config);
  const preset = presets.get(name);
  if (!preset) {
    return {
      type: 'message',
      messageType: 'error',
      content: t(`Preset "{{name}}" not found.`, { name }),
    };
  }

  const { display, truncated } = truncateForDisplay(preset.prompt);
  const sourceLabel =
    preset.source.kind === 'project'
      ? t('project ({{path}})', { path: preset.source.filePath })
      : t('global');
  const header = t('Preset "{{name}}" ({{len}} chars, {{source}}):', {
    name,
    len: String(preset.prompt.length),
    source: sourceLabel,
  });

  return {
    type: 'message',
    messageType: 'info',
    content: `${header}\n\n${display}${truncated ? '' : ''}`,
  };
}

async function usePreset(
  context: CommandContext,
  args: string,
): Promise<SlashCommandActionReturn> {
  const parsed = parseNameAndPrompt(args);
  if (!parsed) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('Usage: /sp <name> <prompt>'),
    };
  }
  const presets = loadAllPresets(context.services.config);
  const preset = presets.get(parsed.name);
  if (!preset) {
    return {
      type: 'message',
      messageType: 'error',
      content: t(
        `Preset "{{name}}" not found. Add it with "/sp add {{name}} <system prompt>" or place a file in ./sp.`,
        { name: parsed.name },
      ),
    };
  }

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

    const identityClause = `\n\nWhen asked who you are or what you do, always answer as the "${preset.name}" persona.`;
    const effectivePrompt = `${preset.prompt}${identityClause}`;

    // Recreate chat with the new system prompt while preserving history/tools.
    await geminiClient.resetChatWithSystemInstruction(effectivePrompt);
    context.ui.addItem(
      {
        type: 'info',
        text: t('Applied system prompt preset "{{name}}" then sent your prompt.', {
          name: parsed.name,
        }),
      },
      Date.now(),
    );

    return {
      type: 'submit_prompt',
      content: parsed.prompt,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: t(`Failed to apply preset: ${error}`),
    };
  }
}

export const spCommand: SlashCommand = {
  name: 'sp',
  description: 'Use and manage system prompt presets.',
  kind: CommandKind.BUILT_IN,
  action: (context, args): SlashCommandActionReturn | Promise<SlashCommandActionReturn> => {
    const trimmed = args?.trim() ?? '';
    if (!trimmed) {
      return {
        type: 'message',
        messageType: 'info',
        content:
          '**System Prompt Presets**\n\n' +
          '- /sp <name> <prompt> — Apply preset <name> and send <prompt>\n' +
          '- /sp add <name> <system prompt text> — Save a global preset\n' +
          '- /sp remove <name> — Delete a global preset\n' +
          '- /sp show <name> — Display preset contents\n' +
          '- /sp list — Show available presets (global + ./sp)\n' +
          '\nProject presets are auto-loaded from ./sp/*. Files are named by their basename.',
      };
    }

    const [verb] = trimmed.split(/\s+/, 2);
    switch (verb) {
      case 'add':
        return addPreset(trimmed.slice(verb.length).trim());
      case 'remove':
        return removePreset(trimmed.slice(verb.length).trim());
      case 'list':
        return listPresets(context);
      case 'show':
        return showPreset(context, trimmed.slice(verb.length).trim());
      default:
        return usePreset(context, trimmed);
    }
  },
  completion: async (context, partial) => {
    const trimmed = partial.trim();
    if (!trimmed || trimmed === 'list' || trimmed === 'add' || trimmed === 'remove') {
      return [];
    }

    const [verb, namePart] = trimmed.split(/\s+/, 2);
    if (verb === 'show' || verb === 'remove') {
      const presets = loadAllPresets(context.services.config);
      return Array.from(presets.keys()).filter((name) =>
        name.startsWith(namePart ?? ''),
      );
    }

    // Default: suggest preset names for /sp <name> ...
    const presets = loadAllPresets(context.services.config);
    return Array.from(presets.keys()).filter((name) =>
      name.startsWith(verb ?? ''),
    );
  },
};
