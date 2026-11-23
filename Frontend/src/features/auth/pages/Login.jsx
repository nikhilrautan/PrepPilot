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
                <div className="auth-loading" role="status">
                    <span className="rune-pulse" aria-hidden="true">ᚠ</span>
                    <h1>Loading...</h1>
                </div>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <AuthBackdrop />
            <div className="form-container">
                <p className="rune-line" aria-hidden="true">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ</p>
                <h1>Login</h1>
                <p className="form-tagline">Return to the hearth, traveler.</p>

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
                        <input
                            value={password}
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' autoComplete="current-password"
                            placeholder='Enter password' required />
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