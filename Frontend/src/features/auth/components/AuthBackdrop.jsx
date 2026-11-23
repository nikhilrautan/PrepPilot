import React, { useRef, useEffect } from 'react'
import bg from '../../../assets/vinland-bg.jpg'

// Blurred sunset background with a soft shade and a gentle mouse parallax.
const AuthBackdrop = () => {
    const ref = useRef(null)

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const move = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * -18
            const y = (e.clientY / window.innerHeight - 0.5) * -12
            if (ref.current) ref.current.style.transform = `translate(${x}px, ${y}px)`
        }
        window.addEventListener('mousemove', move)
        return () => window.removeEventListener('mousemove', move)
    }, [])

    return (
        <>
            <div className="auth-bg" ref={ref} style={{ backgroundImage: `url(${bg})` }} aria-hidden="true" />
            <div className="auth-shade" aria-hidden="true" />
        </>
    )
}

export default AuthBackdrop