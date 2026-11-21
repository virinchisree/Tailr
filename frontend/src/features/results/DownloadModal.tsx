import { Fragment, useState } from 'react';
import { Button, Modal, Pill, useToast } from '../../components';
import { ApiError } from '../../api/client';
import { exportResume, type ExportFormat } from '../../api/export';
import { cn } from '../../lib/cn';
import { resumeFileName, saveBlob } from '../../lib/download';
import { plural } from '../../lib/format';
import styles from './DownloadModal.module.css';

const BULLET = /^\s*[-•*]\s*/;
const SKILLS_LINE = /^\s*(technical\s+)?skills\s*:/i;

const FORMATS: { id: ExportFormat; label: string }[] = [
    { id: 'pdf', label: 'PDF' },
    { id: 'docx', label: 'Word (.docx)' },
];

interface DownloadModalProps {
    open: boolean;
    onClose: () => void;
    text: string;
    acceptedSuggestions: string[];
    addedSkills: string[];
}

export function DownloadModal({ open, onClose, text, acceptedSuggestions, addedSkills }: DownloadModalProps) {
    const toast = useToast();
    const [format, setFormat] = useState<ExportFormat>('pdf');
    const [busy, setBusy] = useState(false);
    const filename = resumeFileName(text, format);

    const download = async () => {
        setBusy(true);
        try {
            const { blob, filename: serverName } = await exportResume(text, format);
            const name = serverName ?? filename;
            saveBlob(blob, name);
            toast(`Downloading ${name}`);
        } catch (err) {
            toast(err instanceof ApiError ? err.message : 'Could not create the file.');
        } finally {
            setBusy(false);
        }
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            toast('Resume text copied');
        } catch {
            toast('Copying isn’t available in this browser');
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title="Download your resume"
            description="Check the final version before you download. Your changes are highlighted."
        >
            <div className={styles.summary}>
                <Pill tone={acceptedSuggestions.length ? 'good' : 'neutral'}>
                    {plural(acceptedSuggestions.length, 'rewrite')} accepted
                </Pill>
                <Pill tone={addedSkills.length ? 'accent' : 'neutral'}>{plural(addedSkills.length, 'skill')} added</Pill>
            </div>

            <ResumePreview text={text} accepted={acceptedSuggestions} added={addedSkills} />

            <div className={styles.footer}>
                <div className={styles.seg} role="group" aria-label="File format">
                    {FORMATS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            className={cn(styles.segBtn, format === f.id && styles.on)}
                            aria-pressed={format === f.id}
                            onClick={() => setFormat(f.id)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className={styles.right}>
                    <Button variant="ghost" onClick={copy}>Copy text</Button>
                    <Button variant="primary" loading={busy} onClick={download}>Download</Button>
                </div>
            </div>
            <p className={styles.filename}>{filename}</p>
        </Modal>
    );
}

function ResumePreview({ text, accepted, added }: { text: string; accepted: string[]; added: string[] }) {
    const acceptedSet = new Set(accepted.map((s) => s.trim()));
    const addedSet = new Set(added);
    const lines = text.split('\n');
    const nameIndex = lines.findIndex((l) => l.trim());

    return (
        <div className={styles.preview} aria-label="Resume preview">
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} className={styles.gap} />;
                if (i === nameIndex) return <div key={i} className={styles.name}>{line.trim()}</div>;

                const isBullet = BULLET.test(line);
                const content = line.replace(BULLET, '').trim();

                if (SKILLS_LINE.test(line) && addedSet.size > 0) {
                    const colon = line.indexOf(':');
                    const items = line.slice(colon + 1).split(',').map((s) => s.trim()).filter(Boolean);
                    return (
                        <div key={i}>
                            <strong>{line.slice(0, colon).trim()}:</strong>{' '}
                            {items.map((item, k) => (
                                <Fragment key={k}>
                                    {k > 0 && ', '}
                                    {addedSet.has(item) ? <mark>{item}</mark> : item}
                                </Fragment>
                            ))}
                        </div>
                    );
                }

                return (
                    <div key={i} className={cn(isBullet && styles.bullet)}>
                        <span className={cn(acceptedSet.has(content) && styles.changed)}>{content}</span>
                    </div>
                );
            })}
        </div>
    );
}