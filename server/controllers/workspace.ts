import type { Response } from 'express';
import type { AuthedRequest } from '../routes.js';
import { supabaseAdmin } from '../lib/supabaseClient.js';
import type { CareerChatSummary, DocumentGeneration, ProfileData } from '../../types.js';
import { createNewProfile, DEFAULT_TOKEN_BALANCE } from '../../workspaceDefaults.js';

type WorkspacePayload = {
  profile: ProfileData | null;
  documentHistory: DocumentGeneration[];
  careerChatHistory: CareerChatSummary[];
  tokens: number;
};

const sanitizeWorkspace = (payload: WorkspacePayload): WorkspacePayload => ({
  profile: payload.profile,
  documentHistory: Array.isArray(payload.documentHistory) ? payload.documentHistory : [],
  careerChatHistory: Array.isArray(payload.careerChatHistory) ? payload.careerChatHistory : [],
  tokens: typeof payload.tokens === 'number' ? payload.tokens : DEFAULT_TOKEN_BALANCE,
});

export const handleGetWorkspace = async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('profile, document_history, career_chat_history, tokens')
    .eq('id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch workspace from Supabase:', error);
    return res.status(500).json({ error: 'Failed to load workspace.' });
  }

  if (!data) {
    const defaultProfile = createNewProfile(req.user?.email ?? 'My First Profile');
    const insertPayload = {
      id: userId,
      profile: defaultProfile,
      document_history: [],
      career_chat_history: [],
      tokens: DEFAULT_TOKEN_BALANCE,
    };

    const { error: insertError } = await supabaseAdmin.from('profiles').insert(insertPayload);
    if (insertError) {
      console.error('Failed to seed workspace row:', insertError);
      return res.status(500).json({ error: 'Failed to initialize workspace.' });
    }

    return res.json(
      sanitizeWorkspace({
        profile: defaultProfile,
        documentHistory: [],
        careerChatHistory: [],
        tokens: DEFAULT_TOKEN_BALANCE,
      })
    );
  }

  return res.json(
    sanitizeWorkspace({
      profile: data.profile,
      documentHistory: data.document_history ?? [],
      careerChatHistory: data.career_chat_history ?? [],
      tokens: data.tokens ?? DEFAULT_TOKEN_BALANCE,
    })
  );
};

export const handleUpsertWorkspace = async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = sanitizeWorkspace(req.body as WorkspacePayload);

  const { error } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    profile: payload.profile,
    document_history: payload.documentHistory,
    career_chat_history: payload.careerChatHistory,
    tokens: payload.tokens,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to persist workspace:', error);
    return res.status(500).json({ error: 'Failed to save workspace.' });
  }

  return res.json(payload);
};
