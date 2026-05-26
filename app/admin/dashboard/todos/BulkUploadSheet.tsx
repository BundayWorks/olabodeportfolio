'use client';
import { useRef, useState } from 'react';
import Papa from 'papaparse';
import {
  validateBulkRow,
  buildTemplateCsv,
  type BulkRowInput,
  type CommitmentRef,
  type ValidatedRow,
} from '@/lib/bulk-todos';

interface Props {
  commitments: CommitmentRef[];
  onClose: () => void;
  onImported: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function downloadTemplate() {
  const csv = buildTemplateCsv();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'todos-template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function BulkUploadSheet({ commitments, onClose, onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setParseError(null);
    setRows([]);
    setServerMsg(null);

    Papa.parse<BulkRowInput>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().toLowerCase(),
      complete: (result) => {
        if (result.errors.length > 0) {
          setParseError(result.errors[0].message);
          return;
        }
        const today = todayIso();
        const validated = result.data.map((r, i) =>
          validateBulkRow(r, i + 1, commitments, today),
        );
        setRows(validated);
      },
      error: (err) => setParseError(err.message),
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const validRows = rows.filter(r => r.resolved && r.errors.length === 0);
  const invalidRows = rows.filter(r => !r.resolved || r.errors.length > 0);

  const importValid = async () => {
    if (validRows.length === 0) return;
    setSubmitting(true);
    setServerMsg(null);
    try {
      const res = await fetch('/api/todos/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows.map(r => r.raw) }),
      });
      const json = await res.json();
      if (json.ok) {
        setServerMsg(`Imported ${json.inserted} todo${json.inserted === 1 ? '' : 's'}. Refreshing…`);
        setTimeout(onImported, 700);
      } else {
        setServerMsg(`Import failed: ${json.error}${json.detail ? ` — ${json.detail}` : ''}`);
        setSubmitting(false);
      }
    } catch {
      setServerMsg('Import failed: network error');
      setSubmitting(false);
    }
  };

  const reset = () => {
    setRows([]); setFileName(null); setParseError(null); setServerMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="sheet"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="sheet__handle" />
        <div className="sheet__title">Bulk upload todos</div>

        {/* Step 1: template */}
        <div style={{
          padding: '0.85rem 1rem', borderRadius: 8, background: 'var(--admin-blue-soft, #eef5ff)',
          marginBottom: '1rem',
        }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            1. Download the template
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--a-text2)', marginBottom: '0.6rem', lineHeight: 1.5 }}>
            Use this CSV format. Columns: <code>title, notes, scope, due_date, commitment, project</code>.
            Scope is <code>day</code> or <code>week</code>. Dates are <code>YYYY-MM-DD</code>.
            Commitment and project must match existing names exactly.
          </p>
          <button
            onClick={downloadTemplate}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}
          >
            ↓ Download template.csv
          </button>
        </div>

        {/* Step 2: upload */}
        <div style={{
          padding: '0.85rem 1rem', borderRadius: 8, border: '1.5px dashed var(--a-border)',
          marginBottom: '1rem',
        }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            2. Upload your CSV
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFileChange}
            style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}
          />
          {fileName && (
            <p style={{ fontSize: '0.75rem', color: 'var(--a-text3)', marginTop: '0.4rem' }}>
              {fileName} · {rows.length} row{rows.length === 1 ? '' : 's'} parsed
            </p>
          )}
          {parseError && (
            <p className="form-error" style={{ marginTop: '0.5rem' }}>CSV error: {parseError}</p>
          )}
        </div>

        {/* Preview */}
        {rows.length > 0 && (
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', border: '1px solid var(--a-border)', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--a-surface)', zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', borderBottom: '1px solid var(--a-border)' }}>#</th>
                  <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', borderBottom: '1px solid var(--a-border)' }}>Title</th>
                  <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', borderBottom: '1px solid var(--a-border)' }}>Scope</th>
                  <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', borderBottom: '1px solid var(--a-border)' }}>Due</th>
                  <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', borderBottom: '1px solid var(--a-border)' }}>Commitment / Project</th>
                  <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', borderBottom: '1px solid var(--a-border)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const ok = r.resolved && r.errors.length === 0;
                  return (
                    <tr key={r.rowNumber} style={{ background: ok ? 'transparent' : 'rgba(204, 0, 0, 0.04)' }}>
                      <td style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid var(--a-border)' }}>{r.rowNumber}</td>
                      <td style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid var(--a-border)' }}>{r.raw.title || <em style={{ color: 'var(--a-text3)' }}>—</em>}</td>
                      <td style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid var(--a-border)' }}>{r.raw.scope || <em style={{ color: 'var(--a-text3)' }}>—</em>}</td>
                      <td style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid var(--a-border)' }}>{r.raw.due_date || <em style={{ color: 'var(--a-text3)' }}>today</em>}</td>
                      <td style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid var(--a-border)' }}>
                        {r.raw.commitment || <em style={{ color: 'var(--a-text3)' }}>—</em>}
                        {r.raw.project && <> / {r.raw.project}</>}
                      </td>
                      <td style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid var(--a-border)' }}>
                        {ok ? (
                          <span style={{ color: 'var(--a-green, #0c7a3a)', fontWeight: 600 }}>OK</span>
                        ) : (
                          <div>
                            {r.errors.map((e, i) => (
                              <div key={i} style={{ color: '#a02a2a', fontWeight: 500 }}>{e}</div>
                            ))}
                            {r.suggestion && (
                              <div style={{ color: 'var(--a-text2)', marginTop: 2, fontStyle: 'italic' }}>
                                Did you mean &ldquo;{r.suggestion.didYouMean}&rdquo;?
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary + actions */}
        {rows.length > 0 && (
          <div style={{ marginTop: '0.85rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--a-text2)', marginBottom: '0.6rem' }}>
              <strong>{validRows.length}</strong> valid · <strong>{invalidRows.length}</strong> with errors
              {invalidRows.length > 0 && ' (will be skipped)'}
            </p>
            {serverMsg && (
              <p style={{ fontSize: '0.8rem', marginBottom: '0.6rem', color: serverMsg.startsWith('Imported') ? 'var(--a-green, #0c7a3a)' : '#a02a2a' }}>
                {serverMsg}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                className="btn btn-primary"
                onClick={importValid}
                disabled={submitting || validRows.length === 0}
                style={{ flex: 1 }}
              >
                {submitting ? 'Importing…' : `Import ${validRows.length} todo${validRows.length === 1 ? '' : 's'}`}
              </button>
              <button className="btn btn-secondary" onClick={reset} disabled={submitting}>
                Reset
              </button>
              <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {rows.length === 0 && (
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ marginLeft: 'auto' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
