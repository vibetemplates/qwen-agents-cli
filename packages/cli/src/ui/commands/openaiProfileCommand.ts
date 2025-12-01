/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AuthEvent,
  AuthType,
  clearCachedCredentialFile,
  getErrorMessage,
  logAuth,
} from '@ai-masters-community/qwen-code-core';
import {
  type CommandContext,
  type MessageActionReturn,
  type SlashCommand,
  type SlashCommandActionReturn,
} from './types.js';
import { CommandKind } from './types.js';
import { SettingScope } from '../../config/settings.js';
import { t } from '../../i18n/index.js';

type OpenAIProfile = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
};

type ProfileMap = Record<string, OpenAIProfile>;

const USAGE = [
  t('Manage saved OpenAI credential profiles.'),
  '',
  t('Usage:'),
  '/openai-profile list',
  '/openai-profile save <name> <apiKey> <baseUrl> <model>',
  '/openai-profile use <name>',
  '/openai-profile delete <name>',
].join('\n');

function message(
  messageType: MessageActionReturn['messageType'],
  content: string,
): MessageActionReturn {
  return { type: 'message', messageType, content };
}

function loadProfiles(context: CommandContext): ProfileMap {
  return (
    (context.services.settings.merged.security?.auth
      ?.openaiProfiles as ProfileMap | undefined) ?? {}
  );
}

function persistProfiles(
  context: CommandContext,
  profiles: ProfileMap,
): void {
  context.services.settings.setValue(
    SettingScope.User,
    'security.auth.openaiProfiles',
    profiles,
  );
}

async function switchProfile(
  context: CommandContext,
  name: string,
  profile: OpenAIProfile,
): Promise<SlashCommandActionReturn> {
  const { config, settings } = context.services;

  if (!config) {
    return message('error', t('Configuration not available.'));
  }

  try {
    // Persist credentials
    settings.setValue(SettingScope.User, 'security.auth.apiKey', profile.apiKey);
    settings.setValue(
      SettingScope.User,
      'security.auth.baseUrl',
      profile.baseUrl ?? undefined,
    );
    settings.setValue(
      SettingScope.User,
      'model.name',
      profile.model ?? undefined,
    );
    settings.setValue(
      SettingScope.User,
      'security.auth.selectedType',
      AuthType.USE_OPENAI,
    );

    // Update live config and refresh auth
    config.updateCredentials({
      apiKey: profile.apiKey,
      baseUrl: profile.baseUrl,
      model: profile.model,
    });
    await clearCachedCredentialFile();
    await config.refreshAuth(AuthType.USE_OPENAI);

    const authEvent = new AuthEvent(AuthType.USE_OPENAI, 'manual', 'success');
    logAuth(config, authEvent);

    return message(
      'info',
      t('Switched to OpenAI profile "{{name}}".', { name }),
    );
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const authEvent = new AuthEvent(
      AuthType.USE_OPENAI,
      'manual',
      'error',
      errorMessage,
    );
    logAuth(config, authEvent);

    return message(
      'error',
      t('Failed to switch profile "{{name}}": {{error}}', {
        name,
        error: errorMessage,
      }),
    );
  }
}

export const openaiProfileCommand: SlashCommand = {
  name: 'openai-profile',
  altNames: ['openai'],
  get description() {
    return t('Save and switch between OpenAI credential profiles');
  },
  kind: CommandKind.BUILT_IN,
  action: async (
    context: CommandContext,
    args: string,
  ): Promise<SlashCommandActionReturn> => {
    const trimmedArgs = args.trim();
    const [subcommand, ...rest] = trimmedArgs.split(/\s+/).filter(Boolean);

    if (!subcommand) {
      return message('error', USAGE);
    }

    const profiles = loadProfiles(context);

    switch (subcommand.toLowerCase()) {
      case 'list': {
        const names = Object.keys(profiles);
        if (names.length === 0) {
          return message('info', t('No saved OpenAI profiles.'));
        }

        const lines = names.map((name) => {
          const profile = profiles[name];
          const model = profile.model ? `model=${profile.model}` : '';
          const baseUrl = profile.baseUrl ? `baseUrl=${profile.baseUrl}` : '';
          const details = [model, baseUrl].filter(Boolean).join(' ');
          return details
            ? `- ${name} (${details})`
            : `- ${name} (${t('apiKey set')})`;
        });

        return message(
          'info',
          [t('Saved OpenAI profiles:'), ...lines].join('\n'),
        );
      }
      case 'save': {
        const [name, apiKey, baseUrl, model] = rest;
        if (!name || !apiKey) {
          return message(
            'error',
            t(
              'Usage: /openai-profile save <name> <apiKey> <baseUrl> <model>',
            ),
          );
        }

        profiles[name] = {
          apiKey,
          baseUrl: baseUrl || undefined,
          model: model || undefined,
        };
        persistProfiles(context, profiles);

        return message(
          'info',
          t('Saved OpenAI profile "{{name}}".', { name }),
        );
      }
      case 'use': {
        const [name] = rest;
        if (!name) {
          return message('error', t('Usage: /openai-profile use <name>'));
        }

        const profile = profiles[name];
        if (!profile) {
          return message(
            'error',
            t('Profile "{{name}}" not found.', { name }),
          );
        }

        return switchProfile(context, name, profile);
      }
      case 'delete': {
        const [name] = rest;
        if (!name) {
          return message('error', t('Usage: /openai-profile delete <name>'));
        }

        if (!profiles[name]) {
          return message(
            'error',
            t('Profile "{{name}}" not found.', { name }),
          );
        }

        delete profiles[name];
        persistProfiles(context, profiles);

        return message(
          'info',
          t('Deleted OpenAI profile "{{name}}".', { name }),
        );
      }
      default:
        return message('error', USAGE);
    }
  },
};
