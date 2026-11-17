import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

const MAX_JOB_CHARS = 5000
const MAX_SELF_CHARS = 2000
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const formatFileSize = (bytes) =>
    bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ isDragging, setIsDragging ] = useState(false)
    const [ error, setError ] = useState("")
    const resumeInputRef = useRef(null)

    const navigate = useNavigate()

    const hasJobDescription = jobDescription.trim().length > 0
    const hasProfile = Boolean(resumeFile) || selfDescription.trim().length > 0
    const canSubmit = hasJobDescription && hasProfile && !loading

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

    const handleGenerateReport = async () => {
        if (!hasJobDescription) {
            setError("Paste the job description so we know which role to prepare you for.")
            return
        }
        if (!hasProfile) {
            setError("Upload your resume or write a short self-description.")
            return
        }

        setError("")
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })

        if (!data?._id) {
            setError("We couldn't generate your plan. Check your connection and try again.")
            return
        }

        navigate(`/interview/${data._id}`)
    }

    if (loading) {
        return (
            <main className='loading-screen' role='status' aria-live='polite'>
                <span className='spinner' aria-hidden='true' />
                <h1>Building your interview plan</h1>
                <p>Reading the job description and your profile. This usually takes about 30 seconds.</p>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Paste a job description and add your profile. We'll build a prep plan around the gaps between them.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2><label htmlFor='jobDescription'>Target Job Description</label></h2>
                            <span className='badge badge--required'>Required</span>
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
                        <div className={`char-counter ${jobDescription.length > MAX_JOB_CHARS * 0.9 ? 'char-counter--warn' : ''}`}>
                            {jobDescription.length} / {MAX_JOB_CHARS} chars
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
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <span className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
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
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                maxLength={MAX_SELF_CHARS}
                            />
                            <div className='char-counter'>{selfDescription.length} / {MAX_SELF_CHARS} chars</div>
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
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
                        className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate my interview plan
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports?.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
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
    )
}

export default Home