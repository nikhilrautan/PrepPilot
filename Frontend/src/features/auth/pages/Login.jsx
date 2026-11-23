import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import AuthBackdrop from '../components/AuthBackdrop'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ showPassword, setShowPassword ] = useState(false)
    const [ error, setError ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const result = await handleLogin({ email, password })
        if (result.success) {
            navigate('/')
        } else {
            setError(result.message || "Login failed. Try again.")
        }
    }

    if (loading) {
        return (
            <main className="auth-page">
                <AuthBackdrop />
                <div className="auth-loading" role="status" aria-live="polite">
                    <span className="rising-sun" aria-hidden="true" />
                    <h1>One moment…</h1>
                </div>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <AuthBackdrop />
            <div className="form-container">
                <span className="brand-sun" aria-hidden="true" />
                <h1>Login</h1>
                <p className="form-tagline">Welcome back. Your next interview is waiting.</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' autoComplete="email"
                            placeholder='Enter email address' required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-field">
                            <input
                                value={password}
                                onChange={(e) => { setPassword(e.target.value) }}
                                type={showPassword ? 'text' : 'password'} id="password" name='password'
                                autoComplete="current-password"
                                placeholder='Enter password' required />
                            <button type="button" className="toggle-password"
                                onClick={() => setShowPassword(s => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}>
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {error && <p className="form-error" role="alert">{error}</p>}

                    <button className='button primary-button'>Login</button>
                </form>

                <p className="form-switch">Don't have an account? <Link to={"/register"}>Register</Link></p>
            </div>
        </main>
    )
}

export default Login