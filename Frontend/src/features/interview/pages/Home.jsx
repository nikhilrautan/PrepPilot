import React, { useState, useRef, useEffect } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import bg from '../../../assets/vinland-bg.jpg'

const MAX_JOB_CHARS = 5000
const MAX_SELF_CHARS = 2000
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MIN_JOB_CHARS = 80   // a shorter description is too thin to build a plan from
const MIN_SELF_CHARS = 40

const BUILD_STEPS = [
    'Reading the job description…',
    'Mapping the gaps in your profile…',
    'Building your interview plan…',
]

const SAMPLES = {
    'Frontend engineer': "Senior Frontend Engineer\nWe’re looking for an engineer with strong React and TypeScript skills to own our web app. You will design reusable components, improve performance and accessibility, write tests, and collaborate with design and backend teams. Experience with large-scale system design, REST/GraphQL APIs and CI/CD is a plus.",
    'Data analyst': "Data Analyst\nTurn raw data into decisions. You will write SQL, build dashboards, run A/B test analyses, and present insights to product and marketing leads. Strong Excel, SQL and Python skills required; experience with Tableau or Power BI preferred.",
    'Product manager': "Product Manager\nOwn the roadmap for a growing consumer product. Define requirements, prioritise with data, work daily with engineering and design, and track success metrics. Strong communication, user research and stakeholder management skills are essential.",
}

const EXPERIENCE = [
    { label: 'Fresher', text: 'Fresher, 0–1 years of experience.' },
    { label: '1–3 yrs', text: '1–3 years of experience.' },
    { label: '3–5 yrs', text: '3–5 years of experience.' },
    { label: '5+ yrs', text: '5+ years of experience.' },
]

// Where the back button sends the user (change this if your landing page lives elsewhere)
const LANDING_PATH = '/'

const formatFileSize = (bytes) =>
    bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ experience, setExperience ] = useState(null)
    const [ isDragging, setIsDragging ] = useState(false)
    const [ error, setError ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)
    const [ stepIndex, setStepIndex ] = useState(0)
    const [ pulse, setPulse ] = useState(false)
    const resumeInputRef = useRef(null)
    const bgRef = useRef(null)

    const navigate = useNavigate()

    const jobLength = jobDescription.trim().length
    const selfLength = selfDescription.trim().length
    const hasJobDescription = jobLength >= MIN_JOB_CHARS
    const hasProfile = Boolean(resumeFile) || selfLength >= MIN_SELF_CHARS
    const canSubmit = hasJobDescription && hasProfile && !submitting

    // Sunrise progress: half for the job description, half for the profile
    const jobPart = hasJobDescription ? 50 : Math.round(Math.min(jobLength, MIN_JOB_CHARS) / MIN_JOB_CHARS * 50)
    const profilePart = hasProfile ? 50 : Math.round(Math.min(selfLength, MIN_SELF_CHARS) / MIN_SELF_CHARS * 35)
    const progress = Math.min(100, jobPart + profilePart)
    const progressLabel = !hasJobDescription
        ? 'Add the job description'
        : !hasProfile
            ? 'Now add your profile'
            : 'Ready. Your sun is up.'

    // Pulse the button once when the form becomes ready
    useEffect(() => {
        if (!canSubmit) return
        setPulse(true)
        const t = setTimeout(() => setPulse(false), 900)
        return () => clearTimeout(t)
    }, [ canSubmit ])

    // Cycle the build messages while the plan is generated
    useEffect(() => {
        if (!submitting) return
        setStepIndex(0)
        const t = setInterval(() => setStepIndex((s) => Math.min(s + 1, BUILD_STEPS.length - 1)), 8000)
        return () => clearInterval(t)
    }, [ submitting ])

    // Gentle parallax on the background
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const move = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * -18
            const y = (e.clientY / window.innerHeight - 0.5) * -12
            if (bgRef.current) bgRef.current.style.transform = `translate(${x}px, ${y}px)`
        }
        window.addEventListener('mousemove', move)
        return () => window.removeEventListener('mousemove', move)
    }, [])

    /* Validate and store the chosen file. Only PDFs work because the backend uses pdf-parse. */
    const acceptFile = (file) => {
        if (!file) return

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setError("Only PDF files are supported. Export your resume as a PDF and try again.")
            return
        }
        if (file.size > MAX_FILE_SIZE) {
            setError(`That file is ${formatFileSize(file.size)}. Please upload a PDF under 5 MB.`)
            return
        }

        setError("")
        setResumeFile(file)
    }

    const handleFileChange = (e) => {
        acceptFile(e.target.files[ 0 ])
        e.target.value = "" // lets the user pick the same file again after removing it
    }

    const handleRemoveFile = () => {
        setResumeFile(null)
        setError("")
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => setIsDragging(false)

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        acceptFile(e.dataTransfer.files[ 0 ])
    }

    const handleSelfChange = (e) => {
        setSelfDescription(e.target.value)
        setExperience(null)
    }

    // Experience chips prepend a line to the self-description; click again to undo
    const handleExperience = (item) => {
        let text = selfDescription
        if (experience) text = text.replace(experience.text, '').trim()
        if (experience?.label === item.label) {
            setExperience(null)
        } else {
            text = `${item.text} ${text}`.trim()
            setExperience(item)
        }
        setSelfDescription(text.slice(0, MAX_SELF_CHARS))
    }

    const handleGenerateReport = async () => {
        if (!hasJobDescription) {
            setError(`Paste the job description (at least ${MIN_JOB_CHARS} characters) so we know which role to prepare you for.`)
            return
        }
        if (!hasProfile) {
            setError(`Upload your resume or write a short self-description (at least ${MIN_SELF_CHARS} characters).`)
            return
        }

        setError("")
        setSubmitting(true)
        let data = null
        try {
            data = await generateReport({ jobDescription, selfDescription, resumeFile })
        } finally {
            setSubmitting(false)
        }

        if (!data?._id) {
            setError("We couldn't generate your plan. Check your connection and try again.")
            return
        }

        navigate(`/interview/${data._id}`)
    }

    const background = (
        <>
            <div className='home-bg' ref={bgRef} style={{ backgroundImage: `url(${bg})` }} aria-hidden='true' />
            <div className='home-shade' aria-hidden='true' />
        </>
    )

    // Only show the full-screen builder while a plan is being generated
    // (the hook's `loading` is also true while the recent plans load).
    if (submitting) {
        return (
            <div className='home-page'>
                {background}
                <main className='loading-screen' role='status' aria-live='polite'>
                    <span className='rising-sun' aria-hidden='true' />
                    <h1>Building your interview plan</h1>
                    <p className='loading-step'>{BUILD_STEPS[ stepIndex ]}</p>
                    <p className='loading-note'>This usually takes about 30 seconds. Please keep this tab open.</p>
                </main>
            </div>
        )
    }

    return (
        <div className='home-page'>
            {background}

            <div className='home-content'>

                {/* Back to landing page */}
                <button type='button' className='back-btn' onClick={() => navigate(LANDING_PATH)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    Back
                </button>

                {/* Page Header */}
                <header className='page-header'>
                    <h1>Create your custom interview plan</h1>
                    <p>Paste a job description and add your profile. We'll build a prep plan around the gaps between them.</p>
                </header>

                {/* Main Card */}
                <div className='interview-card'>

                    {/* Sunrise progress */}
                    <div className={`horizon ${progress === 100 ? 'horizon--done' : ''}`}>
                        <div className='horizon__track'>
                            <div className='horizon__fill' style={{ width: `${progress}%` }} />
                            <div className='horizon__sun' style={{ left: `${progress}%` }} />
                        </div>
                        <div className='horizon__status'>
                            <span>{progressLabel}</span>
                            <span>{progress}% ready</span>
                        </div>
                    </div>

                    <div className='interview-card__body'>

                        {/* Left Panel - Job Description */}
                        <div className='panel panel--left'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                </span>
                                <h2><label htmlFor='jobDescription'>Target job description</label></h2>
                                <span className='badge badge--required'>Required</span>
                            </div>

                            <p className='section-hint'>Try a sample:</p>
                            <div className='chips'>
                                {Object.keys(SAMPLES).map((name) => (
                                    <button key={name} type='button' className='chip'
                                        onClick={() => setJobDescription(SAMPLES[ name ])}>
                                        {name}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                id='jobDescription'
                                name='jobDescription'
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className='panel__textarea'
                                placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                                maxLength={MAX_JOB_CHARS}
                            />
                            <div className='char-row'>
                                <span className='char-hint'>
                                    {jobLength > 0 && jobLength < MIN_JOB_CHARS
                                        ? `Add a little more detail (${MIN_JOB_CHARS - jobLength} characters to go)`
                                        : ''}
                                </span>
                                <span className={`char-counter ${jobDescription.length > MAX_JOB_CHARS * 0.9 ? 'char-counter--warn' : ''}`}>
                                    {jobDescription.length} / {MAX_JOB_CHARS} chars
                                </span>
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className='panel-divider' />

                        {/* Right Panel - Profile */}
                        <div className='panel panel--right'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </span>
                                <h2>Your profile</h2>
                                <span className={`badge ${hasProfile ? 'badge--best' : 'badge--required'}`}>
                                    {hasProfile ? 'Added' : 'Pick one'}
                                </span>
                            </div>

                            {/* Upload Resume */}
                            <div className='upload-section'>
                                <span className='section-label'>
                                    Upload resume
                                    <span className='badge badge--best'>Best results</span>
                                </span>

                                {resumeFile ? (
                                    <div className='file-selected'>
                                        <span className='file-selected__icon' aria-hidden='true'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        </span>
                                        <span className='file-selected__info'>
                                            <span className='file-selected__name'>{resumeFile.name}</span>
                                            <span className='file-selected__size'>{formatFileSize(resumeFile.size)}</span>
                                        </span>
                                        <button
                                            type='button'
                                            className='file-selected__remove'
                                            onClick={handleRemoveFile}
                                            aria-label={`Remove ${resumeFile.name}`}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
                                        htmlFor='resume'
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <span className='dropzone__icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                        </span>
                                        <p className='dropzone__title'>
                                            {isDragging ? 'Drop your resume here' : 'Click to upload or drag & drop'}
                                        </p>
                                        <p className='dropzone__subtitle'>PDF only, up to 5 MB</p>
                                    </label>
                                )}

                                {/* Visually hidden (not display:none) so it stays keyboard-focusable */}
                                <input
                                    ref={resumeInputRef}
                                    className='visually-hidden'
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    accept='application/pdf,.pdf'
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* OR Divider */}
                            <div className='or-divider'><span>OR</span></div>

                            {/* Quick Self-Description */}
                            <div className='self-description'>
                                <label className='section-label' htmlFor='selfDescription'>Quick self-description</label>
                                <div className='chips'>
                                    {EXPERIENCE.map((item) => (
                                        <button key={item.label} type='button' className='chip'
                                            aria-pressed={experience?.label === item.label}
                                            onClick={() => handleExperience(item)}>
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={selfDescription}
                                    onChange={handleSelfChange}
                                    id='selfDescription'
                                    name='selfDescription'
                                    className='panel__textarea panel__textarea--short'
                                    placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                    maxLength={MAX_SELF_CHARS}
                                />
                                <div className='char-row'>
                                    <span />
                                    <span className='char-counter'>{selfDescription.length} / {MAX_SELF_CHARS} chars</span>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className='info-box'>
                                <span className='info-box__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#2b1408" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#2b1408" strokeWidth="2" /></svg>
                                </span>
                                <p>Add a <strong>resume</strong> or a <strong>self-description</strong>. Either one is enough to build your plan.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className='interview-card__footer'>
                        <div className='footer-status'>
                            {error ? (
                                <p className='form-error' role='alert'>{error}</p>
                            ) : (
                                <span className='footer-info'>Takes about 30 seconds</span>
                            )}
                        </div>
                        <button
                            type='button'
                            onClick={handleGenerateReport}
                            disabled={!canSubmit}
                            className={`generate-btn ${pulse ? 'generate-btn--pulse' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                            Generate my interview plan
                        </button>
                    </div>
                </div>

                {/* Recent Reports List */}
                {reports?.length > 0 && (
                    <section className='recent-reports'>
                        <h2>My recent interview plans</h2>
                        <ul className='reports-list'>
                            {reports.map(report => {
                                const score = Number(report.matchScore)
                                const hasScore = Number.isFinite(score)
                                const scoreClass = score >= 80 ? 'score--high' : score >= 60 ? 'score--mid' : 'score--low'

                                return (
                                    <li key={report._id}>
                                        <button
                                            type='button'
                                            className='report-item'
                                            onClick={() => navigate(`/interview/${report._id}`)}
                                        >
                                            <h3>{report.title || 'Untitled position'}</h3>
                                            <p className='report-meta'>
                                                Created {new Date(report.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                            {hasScore && (
                                                <p className={`match-score ${scoreClass}`}>Match score: {score}%</p>
                                            )}
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </section>
                )}

                {/* Page Footer */}
                <footer className='page-footer'>
                    <a href='#'>Privacy Policy</a>
                    <a href='#'>Terms of Service</a>
                    <a href='#'>Help Center</a>
                </footer>
            </div>
        </div>
    )
}

export default Home