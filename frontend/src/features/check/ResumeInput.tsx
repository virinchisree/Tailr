import { useId, useState } from 'react';
import { Button, Card } from '../../components';
import { cn } from '../../lib/cn';
import { formatBytes } from '../../lib/format';
import { wordCount } from '../../lib/text';
import styles from './InputCard.module.css';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['pdf', 'docx', 'txt'];

interface ResumeInputProps {
    text: string;
    onTextChange: (value: string) => void;
    file: File | null;
    onFileChange: (file: File | null) => void;
    onUseSample: () => void;
    error?: string;
    disabled?: boolean;
}

export function ResumeInput({ text, onTextChange, file, onFileChange, onUseSample, error, disabled }: ResumeInputProps) {
    const inputId = useId();
    const errorId = useId();
    const [dragging, setDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const message = fileError ?? error;

    const handleFile = async (f: File) => {
        setFileError(null);
        const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
        if (!ALLOWED.includes(ext)) {
            setFileError('Use a PDF, DOCX or TXT file.');
            return;
        }
        if (f.size > MAX_BYTES) {
            setFileError('That file is larger than 5 MB.');
            return;
        }
        if (ext === 'txt') {
            // plain text can be read here; PDF and DOCX are parsed on the server
            onFileChange(null);
            onTextChange(await f.text());
            return;
        }
        onFileChange(f);
    };

    const clear = () => {
        onFileChange(null);
        onTextChange('');
        setFileError(null);
    };

    return (
        <Card
            title="Resume"
            aside={<Button variant="ghost" size="sm" onClick={onUseSample} disabled={disabled}>Use sample</Button>}
            padded={false}
            className={styles.card}
            bodyClassName={styles.body}
        >
            <label
                htmlFor={inputId}
                className={cn(styles.upload, dragging && styles.dragging)}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f) void handleFile(f);
                }}
            >
                <input
                    id={inputId}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="visually-hidden"
                    disabled={disabled}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleFile(f);
                        e.target.value = ''; // allow choosing the same file again
                    }}
                />
                <span className={styles.uploadIcon} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 11V3m0 0L5 6m3-3l3 3M3 11v1.5A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                <span>
                    <strong>Upload a file</strong> or drag it here
                    <small>PDF, DOCX or TXT · up to 5 MB</small>
                </span>
            </label>

            {file ? (
                <div className={styles.file}>
                    <div className={styles.fileIcon} aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                            <path d="M4 2.5h5.5L12 5v8.5H4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.fileMeta}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{formatBytes(file.size)} · text is read on the server</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onFileChange(null)} disabled={disabled}>Remove</Button>
                </div>
            ) : (
                <>
                    <div className={styles.or}>or paste text</div>
                    <textarea
                        className={styles.textarea}
                        value={text}
                        onChange={(e) => onTextChange(e.target.value)}
                        placeholder="Paste your resume here…"
                        aria-label="Resume text"
                        aria-invalid={message ? true : undefined}
                        aria-describedby={message ? errorId : undefined}
                        disabled={disabled}
                        spellCheck={false}
                    />
                </>
            )}

            {message && <p id={errorId} className={styles.error}>{message}</p>}

            <div className={styles.footer}>
                <span>{file ? '1 file' : `${wordCount(text)} words`}</span>
                <Button variant="ghost" size="sm" onClick={clear} disabled={disabled || (!file && !text)}>Clear</Button>
            </div>
        </Card>
    );
}