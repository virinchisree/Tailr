import { Button, Modal } from '../../components';
import styles from './ConfirmSkillModal.module.css';

interface ConfirmSkillModalProps {
    skill: string | null;
    onCancel: () => void;
    onConfirm: () => void;
}

export function ConfirmSkillModal({ skill, onCancel, onConfirm }: ConfirmSkillModalProps) {
    return (
        <Modal
            open={skill !== null}
            onClose={onCancel}
            role="alertDialog"
            hideClose
            title={`Add ${skill ?? 'this skill'} to your resume?`}
            description="Only add skills you’ve actually used. Recruiters and interviewers will ask about anything on your resume."
        >
            <p className={styles.note}>It goes on your Skills line. You’ll only be asked this once.</p>
            <div className={styles.actions}>
                <Button onClick={onCancel}>Cancel</Button>
                <Button variant="primary" onClick={onConfirm}>I’ve used it, add it</Button>
            </div>
        </Modal>
    );
}