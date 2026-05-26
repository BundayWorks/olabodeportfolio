// Shared types and validation for CSV bulk-upload of todos.
// Used by both the client preview and the server endpoint.

export interface BulkRowInput {
  title?: string;
  notes?: string;
  scope?: string;
  due_date?: string;
  commitment?: string;
  project?: string;
}

export interface CommitmentRef {
  id: string;
  name: string;
  projects: { id: string; name: string }[];
}

export interface ValidatedRow {
  rowNumber: number;          // 1-indexed for human display (skips header)
  raw: BulkRowInput;
  resolved?: {
    title: string;
    notes: string | null;
    scope: 'day' | 'week';
    due_date: string | null;
    commitment_id: string | null;
    project_id: string | null;
  };
  errors: string[];
  warnings: string[];
  suggestion?: {
    field: 'commitment' | 'project';
    didYouMean: string;
  };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// US-style M/D/YYYY or MM/DD/YYYY (Excel's default on a US locale). Single or
// double digit month/day both accepted.
const US_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

function pad2(n: number) { return n < 10 ? `0${n}` : `${n}`; }

// Returns ISO date string, or null if input isn't a date we understand.
// Sets `converted` flag when the input wasn't ISO but we managed to coerce it.
function parseDate(raw: string): { iso: string | null; converted: boolean; reason?: string } {
  if (ISO_DATE.test(raw)) {
    // Light sanity check — Date() will accept things like 2026-13-45 silently
    const [y, m, d] = raw.split('-').map(Number);
    if (m < 1 || m > 12 || d < 1 || d > 31) {
      return { iso: null, converted: false, reason: `Out-of-range month or day in "${raw}"` };
    }
    return { iso: raw, converted: false };
  }
  const us = US_DATE.exec(raw);
  if (us) {
    const month = Number(us[1]);
    const day = Number(us[2]);
    const year = Number(us[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return { iso: null, converted: false, reason: `Out-of-range month or day in "${raw}"` };
    }
    return { iso: `${year}-${pad2(month)}-${pad2(day)}`, converted: true };
  }
  return {
    iso: null, converted: false,
    reason: `Unrecognised date format "${raw}" — use YYYY-MM-DD or M/D/YYYY`,
  };
}

// Damerau-Levenshtein-lite — fine for short strings like commitment names.
function distance(a: string, b: string): number {
  const al = a.length, bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const dp: number[][] = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) dp[i][0] = i;
  for (let j = 0; j <= bl; j++) dp[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[al][bl];
}

function closestMatch(needle: string, haystack: string[]): string | undefined {
  if (!needle || haystack.length === 0) return undefined;
  const target = needle.toLowerCase();
  let best: string | undefined;
  let bestDist = Infinity;
  for (const candidate of haystack) {
    const d = distance(target, candidate.toLowerCase());
    if (d < bestDist) { bestDist = d; best = candidate; }
  }
  // Only suggest if reasonably close (≤ 40% of the longer string)
  if (!best) return undefined;
  const tolerance = Math.max(2, Math.ceil(Math.max(needle.length, best.length) * 0.4));
  return bestDist <= tolerance ? best : undefined;
}

export function validateBulkRow(
  row: BulkRowInput,
  rowNumber: number,
  commitments: CommitmentRef[],
  todayIso: string,
): ValidatedRow {
  const result: ValidatedRow = { rowNumber, raw: row, errors: [], warnings: [] };

  const title = (row.title ?? '').trim();
  if (!title) result.errors.push('Title is required');

  const scopeRaw = (row.scope ?? '').trim().toLowerCase();
  let scope: 'day' | 'week' | null = null;
  if (!scopeRaw) {
    result.errors.push('Scope is required (day or week)');
  } else if (scopeRaw === 'day' || scopeRaw === 'today') {
    scope = 'day';
  } else if (scopeRaw === 'week' || scopeRaw === 'this week') {
    scope = 'week';
  } else {
    result.errors.push(`Invalid scope "${row.scope}" — expected day or week`);
  }

  const dueRaw = (row.due_date ?? '').trim();
  let due_date: string | null = null;
  if (dueRaw) {
    const parsed = parseDate(dueRaw);
    if (parsed.iso) {
      due_date = parsed.iso;
      if (parsed.converted) {
        result.warnings.push(`Converted "${dueRaw}" → ${parsed.iso} (US format detected)`);
      }
    } else {
      result.errors.push(parsed.reason ?? `Invalid due_date "${dueRaw}"`);
    }
  } else {
    due_date = todayIso;
    result.warnings.push('No due_date — defaulted to today');
  }

  // Commitment lookup (case-insensitive exact match)
  const commitmentName = (row.commitment ?? '').trim();
  let commitment_id: string | null = null;
  let matchedCommitment: CommitmentRef | undefined;
  if (commitmentName) {
    matchedCommitment = commitments.find(
      c => c.name.toLowerCase() === commitmentName.toLowerCase(),
    );
    if (matchedCommitment) {
      commitment_id = matchedCommitment.id;
    } else {
      const suggestion = closestMatch(commitmentName, commitments.map(c => c.name));
      result.errors.push(`Unknown commitment "${commitmentName}"`);
      if (suggestion) {
        result.suggestion = { field: 'commitment', didYouMean: suggestion };
      }
    }
  }

  // Project lookup — must belong to the matched commitment
  const projectName = (row.project ?? '').trim();
  let project_id: string | null = null;
  if (projectName) {
    if (!matchedCommitment) {
      result.errors.push('Project requires a valid commitment');
    } else {
      const matchedProject = matchedCommitment.projects.find(
        p => p.name.toLowerCase() === projectName.toLowerCase(),
      );
      if (matchedProject) {
        project_id = matchedProject.id;
      } else {
        const suggestion = closestMatch(projectName, matchedCommitment.projects.map(p => p.name));
        result.errors.push(`Unknown project "${projectName}" under "${matchedCommitment.name}"`);
        if (suggestion && !result.suggestion) {
          result.suggestion = { field: 'project', didYouMean: suggestion };
        }
      }
    }
  }

  if (result.errors.length === 0 && scope) {
    result.resolved = {
      title,
      notes: (row.notes ?? '').trim() || null,
      scope,
      due_date,
      commitment_id,
      project_id,
    };
  }

  return result;
}

export function buildTemplateCsv(): string {
  const today = new Date().toISOString().slice(0, 10);
  const inAWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const lines = [
    'title,notes,scope,due_date,commitment,project',
    `"Write Q2 product roadmap","First draft for the leadership review",week,${inAWeek},"",""`,
    `"Reply to recruiter email","",day,${today},"",""`,
    `"30-min sync with Lydia","Cover GTM and Q3 hiring",day,${today},"",""`,
  ];
  return lines.join('\n') + '\n';
}
