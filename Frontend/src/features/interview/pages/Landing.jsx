import React from 'react'
import "../style/landing.scss"
import { useNavigate } from 'react-router'
import bg from '../../../assets/vinland-bg.jpg'

const STEPS = [
    { title: 'Paste the job', text: 'Drop in the job description for the role you want.' },
    { title: 'Add your profile', text: 'Upload your resume or write a quick self-description.' },
    { title: 'Get your plan', text: 'We map the gaps and build a prep plan around them.' },
]

const Landing = () => {
    const navigate = useNavigate()

    return (
        <div className='landing-page'>
            <div className='landing-bg' style={{ backgroundImage: `url(${bg})` }} aria-hidden='true' />
            <div className='landing-shade' aria-hidden='true' />

            <div className='landing-content'>

                <nav className='landing-nav'>
                    <span className='landing-logo'>
                        <span className='landing-logo__sun' aria-hidden='true' />
                        PrepPilot
                    </span>
                    <div className='landing-nav__actions'>
                        <button type='button' className='landing-link' onClick={() => navigate('/login')}>Log in</button>
                        <button type='button' className='landing-link landing-link--solid' onClick={() => navigate('/register')}>Sign up</button>
                    </div>
                </nav>

                <header className='landing-hero'>
                    <h1>Walk into every interview prepared</h1>
                    <p>Paste a job description, add your profile, and get a custom prep plan built around the gaps between them.</p>
                    <button type='button' className='landing-cta' onClick={() => navigate('/create')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden='true'><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Create my interview plan
                    </button>
                    <span className='landing-note'>Takes about 30 seconds</span>
                </header>

                <section className='landing-steps'>
                    {STEPS.map((step, i) => (
                        <div className='landing-step' key={step.title}>
                            <span className='landing-step__num'>{i + 1}</span>
                            <h2>{step.title}</h2>
                            <p>{step.text}</p>
                        </div>
                    ))}
                </section>

            </div>
        </div>
    )
}

export default Landing