'use client';
import { useMemo, useRef, useState } from 'react';
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

type Filter = 'all' | 'valid' | 'errors';

export default function BulkUploadSheet({ commitments, onClose, onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setParseError(null);
    setRows([]);
    setServerMsg(null);
    setFilter('all');

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
        const validated = result.data.map((r, i) => validateBulkRow(r, i + 1, commitments, today));
        setRows(validated);
      },
      error: (err) => setParseError(err.message),
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const validRows = useMemo(() => rows.filter(r => r.resolved && r.errors.length === 0), [rows]);
  const invalidRows = useMemo(() => rows.filter(r => !r.resolved || r.errors.length > 0), [rows]);

  const visibleRows = useMemo(() => {
    if (filter === 'valid') return validRows;
    if (filter === 'errors') return invalidRows;
    return rows;
  }, [rows, filter, validRows, invalidRows]);

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
        setServerMsg({
          kind: 'success',
          text: `Imported ${json.inserted} todo${json.inserted === 1 ? '' : 's'}.`,
        });
        setTimeout(onImported, 700);
      } else {
        setServerMsg({
          kind: 'error',
          text: `Import failed: ${json.error}${json.detail ? ` — ${json.detail}` : ''}`,
        });
        setSubmitting(false);
      }
    } catch {
      setServerMsg({ kind: 'error', text: 'Import failed: network error' });
      setSubmitting(false);
    }
  };

  const reset = () => {
    setRows([]); setFileName(null); setParseError(null); setServerMsg(null); setFilter('all');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Subcomponents ─────────────────────────────────────────────────────────
  const ZeroState = () => (
    <div
      onDragEnter={e => { e.preventDefault(); setDragging(true); }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        borderRadius: 12,
        border: `2px dashed ${dragging ? 'var(--a-blue, #2563eb)' : 'var(--a-border)'}`,
        background: dragging ? 'rgba(37, 99, 235, 0.06)' : 'var(--a-bg, transparent)',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: 'var(--admin-blue-soft, rgba(37, 99, 235, 0.12))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem',
      }}>
        📥
      </div>
      <div>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--a-text)', marginBottom: '0.3rem' }}>
          Drop a CSV here, or pick one
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--a-text2)', maxWidth: 380, lineHeight: 1.5 }}>
          Excel-exported CSVs work. Dates can be <code>YYYY-MM-DD</code> or US format like <code>5/27/2026</code>.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.82rem' }}
        >
          Choose CSV file
        </button>
        <button
          onClick={downloadTemplate}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.82rem' }}
        >
          ↓ Download template
        </button>
      </div>
      {parseError && (
        <div style={{
          marginTop: '0.5rem', padding: '0.6rem 0.9rem', borderRadius: 8,
          background: 'rgba(204, 0, 0, 0.08)', color: '#c33',
          fontSize: '0.82rem', maxWidth: 420,
        }}>
          Couldn&apos;t read the CSV: {parseError}
        </div>
      )}
      <p style={{ fontSize: '0.72rem', color: 'var(--a-text3)', marginTop: '0.5rem' }}>
        Columns: title · notes · scope · due_date · commitment · project
      </p>
    </div>
  );

  const SummaryBar = () => {
    const total = rows.length;
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.65rem',
        alignItems: 'center',
        padding: '0.85rem 1rem',
        background: 'var(--a-surface, #f7f7f7)',
        borderRadius: 10,
        border: '1px solid var(--a-border)',
        marginBottom: '0.85rem',
      }}>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center', flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--a-text2)' }}>
            <strong style={{ color: 'var(--a-text)' }}>{fileName}</strong> · {total} row{total === 1 ? '' : 's'}
          </span>
          <button
            onClick={reset}
            style={{
              fontSize: '0.72rem', padding: '0.2rem 0.6rem',
              background: 'transparent', border: '1px solid var(--a-border)',
              borderRadius: 999, color: 'var(--a-text2)', cursor: 'pointer',
            }}
          >
            Replace file
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['all', 'valid', 'errors'] as Filter[]).map(f => {
            const count = f === 'all' ? total : f === 'valid' ? validRows.length : invalidRows.length;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: '0.74rem', fontWeight: 600,
                  padding: '0.3rem 0.7rem', borderRadius: 999,
                  border: `1px solid ${active ? 'var(--a-text)' : 'var(--a-border)'}`,
                  background: active ? 'var(--a-text)' : 'transparent',
                  color: active ? 'var(--white, #fff)' : 'var(--a-text2)',
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  textTransform: 'capitalize',
                }}
              >
                {f === 'all' ? 'All' : f === 'valid' ? 'Ready' : 'Errors'}
                <span style={{
                  fontSize: '0.68rem', padding: '0.05rem 0.4rem', borderRadius: 999,
                  background: active ? 'rgba(255,255,255,0.25)' : 'var(--a-border)',
                  color: 'inherit',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const RowCard = ({ r }: { r: ValidatedRow }) => {
    const ok = r.resolved && r.errors.length === 0;
    const hasWarnings = (r.warnings?.length ?? 0) > 0;
    const statusColor = ok ? (hasWarnings ? '#b07b00' : '#0c7a3a') : '#a02a2a';
    const statusBg = ok
      ? (hasWarnings ? 'rgba(176, 123, 0, 0.10)' : 'rgba(12, 122, 58, 0.10)')
      : 'rgba(160, 42, 42, 0.10)';
    const statusLabel = ok ? (hasWarnings ? 'Ready · auto-fixed' : 'Ready') : 'Needs fixing';

    return (
      <div style={{
        padding: '0.8rem 0.95rem',
        borderRadius: 10,
        border: '1px solid var(--a-border)',
        background: ok ? 'var(--a-bg, transparent)' : 'rgba(160, 42, 42, 0.025)',
        marginBottom: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <span style={{
            fontSize: '0.66rem', fontWeight: 700, color: 'var(--a-text3)',
            minWidth: 24, paddingTop: 2,
          }}>
            #{r.rowNumber}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.9rem', fontWeight: 600, color: 'var(--a-text)',
              wordBreak: 'break-word', lineHeight: 1.35,
            }}>
              {r.raw.title || <em style={{ color: 'var(--a-text3)', fontWeight: 400 }}>No title</em>}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              {r.raw.scope && (
                <span style={{ fontSize: '0.7rem', color: 'var(--a-text2)' }}>
                  Scope: <strong style={{ color: 'var(--a-text)' }}>{r.raw.scope}</strong>
                </span>
              )}
              {r.raw.due_date && (
                <span style={{ fontSize: '0.7rem', color: 'var(--a-text2)' }}>
                  Due: <strong style={{ color: 'var(--a-text)' }}>{r.raw.due_date}</strong>
                </span>
              )}
              {(r.raw.commitment || r.raw.project) && (
                <span style={{ fontSize: '0.7rem', color: 'var(--a-text2)' }}>
                  {r.raw.commitment || '—'}{r.raw.project ? ` / ${r.raw.project}` : ''}
                </span>
              )}
            </div>
          </div>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, padding: '0.18rem 0.6rem',
            borderRadius: 999, background: statusBg, color: statusColor,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {statusLabel}
          </span>
        </div>

        {r.errors.length > 0 && (
          <ul style={{
            margin: '0.45rem 0 0 1.7rem', padding: 0, listStyle: 'disc',
            color: '#a02a2a', fontSize: '0.76rem', lineHeight: 1.5,
          }}>
            {r.errors.map((e, i) => <li key={i}>{e}</li>)}
            {r.suggestion && (
              <li style={{ color: 'var(--a-text2)', listStyle: 'none', marginLeft: '-1rem', fontStyle: 'italic' }}>
                💡 Did you mean &ldquo;{r.suggestion.didYouMean}&rdquo;?
              </li>
            )}
          </ul>
        )}
        {r.warnings && r.warnings.length > 0 && ok && (
          <ul style={{
            margin: '0.45rem 0 0 1.7rem', padding: 0, listStyle: 'disc',
            color: '#b07b00', fontSize: '0.74rem', lineHeight: 1.5,
          }}>
            {r.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="sheet"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 760,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', borderBottom: '1px solid var(--a-border)',
        }}>
          <div>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--a-text)' }}>
              Bulk upload todos
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--a-text2)', marginTop: '0.1rem' }}>
              Import many todos at once from a CSV file.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none', border: 'none', fontSize: '1.4rem',
              color: 'var(--a-text2)', cursor: 'pointer', padding: '0.2rem 0.4rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </header>

        {/* Hidden file input — triggered by button in zero-state or Replace */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />

        {/* Body */}
        <div style={{
          flex: 1, minHeight: 0,
          overflow: 'auto',
          padding: '1rem 1.25rem',
          display: 'flex', flexDirection: 'column',
        }}>
          {rows.length === 0 ? (
            <ZeroState />
          ) : (
            <>
              <SummaryBar />
              <div style={{ flex: 1, minHeight: 0 }}>
                {visibleRows.length === 0 ? (
                  <div style={{
                    padding: '2rem 1rem', textAlign: 'center',
                    color: 'var(--a-text3)', fontSize: '0.85rem',
                  }}>
                    No rows match the {filter} filter.
                  </div>
                ) : (
                  visibleRows.map(r => <RowCard key={r.rowNumber} r={r} />)
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {rows.length > 0 && (
          <footer style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--a-border)',
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              {serverMsg ? (
                <p style={{
                  fontSize: '0.82rem', fontWeight: 600,
                  color: serverMsg.kind === 'success' ? '#0c7a3a' : '#a02a2a',
                }}>
                  {serverMsg.text}
                </p>
              ) : invalidRows.length > 0 ? (
                <p style={{ fontSize: '0.78rem', color: 'var(--a-text2)' }}>
                  {invalidRows.length} row{invalidRows.length === 1 ? '' : 's'} will be skipped.
                  Fix the errors above or re-upload after editing the CSV.
                </p>
              ) : (
                <p style={{ fontSize: '0.78rem', color: 'var(--a-text2)' }}>
                  Everything looks good. Ready to import.
                </p>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
              style={{ fontSize: '0.82rem' }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={importValid}
              disabled={submitting || validRows.length === 0}
              style={{ fontSize: '0.82rem', minWidth: 160 }}
            >
              {submitting
                ? 'Importing…'
                : validRows.length === 0
                  ? 'No rows to import'
                  : `Import ${validRows.length} todo${validRows.length === 1 ? '' : 's'}`}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
