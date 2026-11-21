export const STEPS = [
    { title: 'Add your resume', body: 'Upload a PDF or DOCX, or paste the text.' },
    { title: 'Paste the job post', body: 'Copy the full description, including required and nice-to-have skills.' },
    { title: 'Review and improve', body: 'See your score and gaps, then accept the rewrites you agree with.' },
] as const;

export const PRINCIPLES = [
    { title: 'Explains every score.', body: 'You see which requirements matched and which didn’t.' },
    { title: 'You approve each change.', body: 'Nothing goes into your resume unless you accept it.' },
    { title: 'Separates required from nice-to-have.', body: 'So you know which gaps actually matter.' },
    { title: 'Private by default.', body: 'Resumes are processed and then discarded.' },
] as const;

export interface Plan {
    id: 'free' | 'pro';
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    cta: string;
    highlighted?: boolean;
}

export const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'FREE',
        price: '₹0',
        description: 'For the ocassional application.',
        features: ['3 checks per day', 'Match score and missing skills', 'up to 3 rewrites per check', 'Download as PDF or word'],
        cta: 'Start free',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '₹199',
        period: '/ month',
        description: 'For an active job search.',
        features: ['Unlimited checks', 'Unlimited rewrites', 'Saved history across jobs', 'Skill patterns across your checks'],
        cta: 'Get Pro',
        highlighted: true,
    },
]