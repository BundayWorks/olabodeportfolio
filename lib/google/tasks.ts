// Google Tasks API client (read-only)

interface TaskList {
  id: string;
  title: string;
}

export interface GoogleTask {
  id: string;
  title?: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;          // RFC3339 (date-only-ish — Google stores time as midnight UTC)
  completed?: string;    // RFC3339
  updated?: string;
}

const API = 'https://tasks.googleapis.com/tasks/v1';

async function gfetch<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tasks API ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

export async function listTaskLists(accessToken: string): Promise<TaskList[]> {
  const data = await gfetch<{ items?: TaskList[] }>('/users/@me/lists', accessToken);
  return data.items ?? [];
}

export async function listTasks(accessToken: string, listId: string): Promise<GoogleTask[]> {
  const data = await gfetch<{ items?: GoogleTask[] }>(
    `/lists/${encodeURIComponent(listId)}/tasks?showCompleted=true&showHidden=false&maxResults=100`,
    accessToken,
  );
  return data.items ?? [];
}
