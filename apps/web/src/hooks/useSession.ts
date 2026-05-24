// ─── useSession Hook ─────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { createSession, deleteSession, getSession } from '../lib/api';
import type { SessionWithHistory } from '../lib/types';
import { toast } from 'sonner';

export function useSession() {
  const create = useCallback(async (): Promise<string | null> => {
    try {
      const data = await createSession();
      return data.sessionId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Failed to create session: ${error.message}`);
      return null;
    }
  }, []);

  const get = useCallback(async (sessionId: string): Promise<SessionWithHistory | null> => {
    try {
      return await getSession(sessionId);
    } catch {
      return null;
    }
  }, []);

  const remove = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      await deleteSession(sessionId);
      toast.success('Session deleted');
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Failed to delete session: ${error.message}`);
      return false;
    }
  }, []);

  return { create, get, remove };
}
