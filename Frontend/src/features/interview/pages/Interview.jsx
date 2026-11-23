import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import bg from '../../../assets/vinland-bg.jpg'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

const scoreTone = (score) => (score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low')

const scoreMessage = (score) =>
    score >= 80
        ? 'Strong match for this role'
        : score >= 60
            ? 'Good match. A few gaps to close'
            : 'Early stage. Focus on the gaps below'

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`}>
            <button
                type='button'
                className='q-card__header'
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
            >
                <span className='q-card__index'>Q{index + 1}</span>
                <span className='q-card__question'>{item.question}</span>
                <span className='q-card__chevron' aria-hidden='true'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </button>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

// Match score as a glowing arc that fills on load
const ScoreGauge = ({ score }) => {
    const [ shown, setShown ] = useState(0)
    useEffect(() => {
        const t = setTimeout(() => setShown(score), 150)
        return () => clearTimeout(t)
    }, [ score ])

    const R = 44
    const C = 2 * Math.PI * R

    return (
        <div className={`gauge gauge--${scoreTone(score)}`} role='img' aria-label={`Match score ${score} percent`}>
            <svg viewBox='0 0 100 100' aria-hidden='true'>
                <circle className='gauge__track' cx='50' cy='50' r={R} />
                <circle
                    className='gauge__arc' cx='50' cy='50' r={R}
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - shown / 100)}
                />
            </svg>
            <div className='gauge__value'>
                <strong>{score}</strong>
                <span>%</span>
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { report, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    const background = (
        <>
            <div className='interview-bg' style={{ backgroundImage: `url(${bg})` }} aria-hidden='true' />
            <div className='interview-shade' aria-hidden='true' />
        </>
    )

    // Wait for the right report (the context may still hold a previous one)
    const isStale = report && interviewId && report._id && report._id !== interviewId

    if (!report || isStale) {
        return (
            <div className='interview-page'>
                {background}
                <main className='interview-loading' role='status' aria-live='polite'>
                    <span className='rising-sun' aria-hidden='true' />
                    <h1>Loading your interview plan…</h1>
                </main>
            </div>
        )
    }

    const technical = report.technicalQuestions ?? []
    const behavioral = report.behavioralQuestions ?? []
    const plan = report.preparationPlan ?? []
    const gaps = report.skillGaps ?? []
    const score = Number(report.matchScore) || 0

    return (
        <div className='interview-page'>
            {background}

            <div className='interview-shell'>
                <button type='button' className='back-link' onClick={() => navigate('/')}>
                    ← My plans
                </button>

                <div className='interview-layout'>

                    {/* ── Left Nav ── */}
                    <nav className='interview-nav' aria-label='Plan sections'>
                        <div className='nav-content'>
                            <p className='interview-nav__label'>Sections</p>
                            {NAV_ITEMS.map(item => (
                                <button
                                    key={item.id}
                                    type='button'
                                    aria-current={activeNav === item.id ? 'page' : undefined}
                                    className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                    onClick={() => setActiveNav(item.id)}
                                >
                                    <span className='interview-nav__icon'>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <button
                            type='button'
                            onClick={() => { getResumePdf(interviewId) }}
                            disabled={loading}
                            className='resume-btn'>
                            <svg height={"0.8rem"} style={{ marginRight: "0.6rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                            {loading ? 'Preparing resume…' : 'Download resume'}
                        </button>
                    </nav>

                    <div className='interview-divider' />

                    {/* ── Center Content ── */}
                    <main className='interview-content'>
                        {activeNav === 'technical' && (
                            <section>
                                <div className='content-header'>
                                    <h2>Technical questions</h2>
                                    <span className='content-header__count'>{technical.length} questions</span>
                                </div>
                                <div className='q-list'>
                                    {technical.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeNav === 'behavioral' && (
                            <section>
                                <div className='content-header'>
                                    <h2>Behavioral questions</h2>
                                    <span className='content-header__count'>{behavioral.length} questions</span>
                                </div>
                                <div className='q-list'>
                                    {behavioral.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeNav === 'roadmap' && (
                            <section>
                                <div className='content-header'>
                                    <h2>Preparation road map</h2>
                                    <span className='content-header__count'>{plan.length}-day plan</span>
                                </div>
                                <div className='roadmap-list'>
                                    {plan.map((day) => (
                                        <RoadMapDay key={day.day} day={day} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    <div className='interview-divider' />

                    {/* ── Right Sidebar ── */}
                    <aside className='interview-sidebar'>

                        {/* Match Score */}
                        <div className='match-score'>
                            <p className='match-score__label'>Match score</p>
                            <ScoreGauge score={score} />
                            <p className={`match-score__sub match-score__sub--${scoreTone(score)}`}>{scoreMessage(score)}</p>
                        </div>

                        <div className='sidebar-divider' />

                        {/* Skill Gaps */}
                        <div className='skill-gaps'>
                            <p className='skill-gaps__label'>Skill gaps</p>
                            <div className='skill-gaps__list'>
                                {gaps.map((gap, i) => (
                                    <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                        {gap.skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    )
}

export default Interview