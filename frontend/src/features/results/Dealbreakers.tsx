import { Card, Pill } from '../../components';
import type { CheckStatus, MatchResponse } from '../../types/match';
import { StatusList, type StatusKind } from './StatusList';

const KIND: Record<CheckStatus, StatusKind> = {
    MET: 'ok',
    MISSING: 'fail',
    UNCLEAR: 'warn',
    NOT_REQUIRED: 'warn', // never shown as a row
};

export function Dealbreakers({ items }: { items: MatchResponse['dealbreakers'] }) {
    if (items.length === 0) return null;

    const active = items.filter((i) => i.status !== 'NOT_REQUIRED');
    const skipped = items.filter((i) => i.status === 'NOT_REQUIRED');
    const issues = active.filter((i) => i.status !== 'MET').length;

    return (
        <Card
            title="Dealbreaker check"
            padded={false}
            aside={
                active.length > 0 && (
                    <Pill tone={issues ? 'warn' : 'good'}>{issues ? `${issues} to check` : 'All clear'}</Pill>
                )
            }
        >
            <StatusList
                items={active.map((i) => ({ label: i.label, status: KIND[i.status], detail: i.detail }))}
                footnote={skipped.length > 0 && `Not mentioned in this job: ${skipped.map((s) => s.label).join(', ')}`}
            />
        </Card>
    );
}