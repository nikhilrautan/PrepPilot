import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import AuthBackdrop from '../components/AuthBackdrop'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const result = await handleRegister({ username, email, password })
        if (result.success) {
            navigate("/")
        } else {
            setError(result.message || "Registration failed. Try again.")
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
                <p className="rune-line" aria-hidden="true">ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ</p>
                <h1>Register</h1>
                <p className="form-tagline">Join the crew and set sail.</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            value={username}
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text" id="username" name='username' autoComplete="username"
                            placeholder='Enter username' required />
                    </div>
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
                            type="password" id="password" name='password' autoComplete="new-password"
                            placeholder='Enter password' required />
                    </div>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <button className='button primary-button'>Register</button>
                </form>

                <p className="form-switch">Already have an account? <Link to={"/login"}>Login</Link></p>
            </div>
        </main>
    )
}

export default Register