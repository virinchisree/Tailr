import styles from './LandingPage.module.css'
import { cn } from '../../lib/cn';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ButtonLink, Reveal, SiteFooter } from '../../components';
import { ProductPreview } from './ProductPreview';
import { PLANS, PRINCIPLES, STEPS } from './content';

function CheckIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className={styles.checkIcon}>
            <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function LandingPage() {
    const { hash } = useLocation();

    useEffect(() => {
        if (!hash) return;
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [hash]);

    return (
        <>
            <section className={styles.hero}>
                <div className={cn('container', styles.heroInner)}>
                    <div className={styles.badge}>
                        <span>Free</span> 3 checks per day no account needed
                    </div>
                    <h1 className={styles.headline}>
                        Know if you fit <span className={styles.muted}>before you apply.</span>
                    </h1>
                    <p className={styles.lede}>
                        Upload or paste your resume and a job description. Tailr shows how closely they match, which required skills are
                        missing, and how to word your experience in the job’s language.
                    </p>
                    <div className={styles.ctaRow}>
                        <ButtonLink to="/check" variant="accent" size="lg">Check my resume</ButtonLink>
                        <ButtonLink to="/check?sample=1" variant="secondary" size="lg">See an example</ButtonLink>
                    </div>
                    <p className={styles.note}>Takes about 10 seconds. Your resume isn’t stored.</p>
                    <ProductPreview className={styles.preview} />
                </div>
            </section>
            <section id="how" className={styles.section}>
                <div className="container">
                    <Reveal><p className={styles.eyebrow}>How it works</p></Reveal>
                    <Reveal delay={70}><h2 className={styles.title}>Three steps, one screen.</h2></Reveal>
                    <Reveal delay={140}>
                        <p className={styles.lead}>No dashboards or profiles. Tailr answers one question: does this resume match this job?</p>
                    </Reveal>
                    <ol className={styles.steps}>
                        {STEPS.map((step, i) => (
                            <li key={step.title} className={styles.stepItem}>
                                <Reveal delay={i * 70} className={styles.step}>
                                    <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
                                    <h3 className={styles.stepTitle}>{step.title}</h3>
                                    <p className={styles.stepBody}>{step.body}</p>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
            <section className={styles.section}>
                <div className={cn('container', styles.split)}>
                    <div>
                        <Reveal><p className={styles.eyebrow}>Honest by design</p></Reveal>
                        <Reveal delay={70}><h2 className={styles.title}>It rewrites your experience. It never invents it.</h2></Reveal>
                        <Reveal delay={140}>
                            <p className={styles.lead}>
                                Many resume tools add skills you don’t have to raise your score. That gets you into interviews you
                                can’t pass. Tailr only rewords what’s already true.
                            </p>
                        </Reveal>
                    </div>
                    <ul className={styles.principles}>
                        {PRINCIPLES.map((p, i) => (
                            <li key={p.title}>
                                <Reveal delay={i * 70} className={styles.principle}>
                                    <CheckIcon />
                                    <p><strong>{p.title}</strong> <span>{p.body}</span></p>
                                </Reveal>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
            <section id="pricing" className={styles.section}>
                <div className="container">
                    <Reveal><p className={styles.eyebrow}>Pricing</p></Reveal>
                    <Reveal delay={70}><h2 className={styles.title}>Free to try. Cheap to keep.</h2></Reveal>
                    <div className={styles.plans}>
                        {PLANS.map((plan, i) => (
                            <Reveal key={plan.id} delay={i * 70} className={cn(styles.plan, plan.highlighted && styles.planPro)}>
                                <h3 className={styles.planName}>{plan.name}</h3>
                                <p className={styles.price}>
                                    {plan.price}
                                    {plan.period && <small> {plan.period}</small>}
                                </p>
                                <p className={styles.planDesc}>{plan.description}</p>
                                <ul className={styles.features}>
                                    {plan.features.map((f) => <li key={f}>{f}</li>)}
                                </ul>
                                {/* TODO: Pro should open sign-in, then Razorpay checkout, once auth exists */}
                                <ButtonLink to="/check" variant={plan.highlighted ? 'primary' : 'secondary'} fullWidth>
                                    {plan.cta}
                                </ButtonLink>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>
            <section className={cn(styles.section, styles.ctaBand)}>
                <div className="container">
                    <Reveal><h2 className={styles.title}>Your next application could be the one that gets a reply.</h2></Reveal>
                    <Reveal delay={70}>
                        <ButtonLink to="/check" variant="accent" size="lg">Check my resume</ButtonLink>
                    </Reveal>
                </div>
            </section>
            <SiteFooter />
        </>
    );
}