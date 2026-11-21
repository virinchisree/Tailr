import { Pill } from '../../components';
import type { MatchResponse } from '../../types/match';
import { Collapsible } from './Collapsible';
import { StatusList } from './StatusList';

export function AtsChecks({ checks }: { checks: MatchResponse['atsChecks'] }) {
    if (checks.length === 0) return null;
    const failing = checks.filter((c) => !c.passed).length;

    return (
        <Collapsible
            title="ATS readability"
            flush
            aside={<Pill tone={failing ? 'warn' : 'good'}>{failing ? `${failing} to fix` : 'Looks good'}</Pill>}
        >
            <StatusList
                items={checks.map((c) => ({ label: c.label, status: c.passed ? 'ok' : 'warn', detail: c.detail }))}
                footnote="ATS systems are the software many companies use to filter resumes before a person reads them."
            />
        </Collapsible>
    );
}