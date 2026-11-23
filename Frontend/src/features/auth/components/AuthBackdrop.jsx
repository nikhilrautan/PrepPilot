import React from 'react'

// Painterly, desaturated Norse-plains scene (SVG filters add brush edges,
// soft clouds and film grain so it reads less like flat vector art).
//
// Want it even more realistic? Pass your own painting/photo:
//   import bg from '../../../assets/vinland-bg.jpg'
//   <AuthBackdrop image={bg} />
const mid = Array.from({ length: 180 }, (_, i) => ({
    x: (i * 41) % 1640 - 20,
    y: 770 + ((i * 19) % 110),
    h: 26 + ((i * 53) % 46),
    lean: ((i * 29) % 30) - 15,
    c: ['#8a7a47', '#4f5a35', '#6b6a3c'][i % 3],
}))

const front = Array.from({ length: 46 }, (_, i) => ({
    x: (i * 83) % 1640 - 20,
    y: 905,
    h: 90 + ((i * 47) % 90),
    lean: ((i * 31) % 50) - 25,
}))

const AuthBackdrop = ({ image }) => (
    <>
        {image ? (
            <div
                className="auth-backdrop auth-backdrop-img"
                style={{ backgroundImage: `url(${image})` }}
                aria-hidden="true"
            />
        ) : (
            <svg
                className="auth-backdrop"
                viewBox="0 0 1600 900"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id="vs-sky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#0b1215" />
                        <stop offset=".45" stopColor="#1f2d32" />
                        <stop offset=".78" stopColor="#4d6061" />
                        <stop offset="1" stopColor="#b9ab8a" />
                    </linearGradient>
                    <radialGradient id="vs-glow">
                        <stop offset="0" stopColor="#f6e6b8" stopOpacity=".8" />
                        <stop offset=".4" stopColor="#d9c48e" stopOpacity=".28" />
                        <stop offset="1" stopColor="#d9c48e" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="vs-vig" cx=".5" cy=".5" r=".75">
                        <stop offset=".45" stopColor="#000" stopOpacity="0" />
                        <stop offset="1" stopColor="#000" stopOpacity=".7" />
                    </radialGradient>
                    <filter id="vs-soft" x="-20%" y="-50%" width="140%" height="200%">
                        <feGaussianBlur stdDeviation="22" />
                    </filter>
                    <filter id="vs-haze"><feGaussianBlur stdDeviation="1.4" /></filter>
                    <filter id="vs-brush" x="-5%" y="-5%" width="110%" height="110%">
                        <feTurbulence type="fractalNoise" baseFrequency=".014" numOctaves="3" seed="7" result="n" />
                        <feDisplacementMap in="SourceGraphic" in2="n" scale="16" />
                    </filter>
                </defs>

                <rect width="1600" height="900" fill="url(#vs-sky)" />
                <circle cx="1150" cy="500" r="340" fill="url(#vs-glow)" />

                {/* soft volumetric storm clouds */}
                <g fill="#080f12" filter="url(#vs-soft)">
                    <ellipse cx="260" cy="120" rx="420" ry="90" opacity=".85" />
                    <ellipse cx="760" cy="170" rx="380" ry="70" opacity=".7" />
                    <ellipse cx="1280" cy="130" rx="400" ry="80" opacity=".8" />
                    <ellipse cx="520" cy="300" rx="300" ry="50" opacity=".45" />
                    <ellipse cx="1000" cy="310" rx="340" ry="46" opacity=".4" />
                </g>

                {/* far ridge + sea with atmospheric haze */}
                <g filter="url(#vs-brush)">
                    <path d="M-30 620 L150 570 L320 610 L500 540 L680 600 L840 560 L1010 615 L1220 580 L1430 620 L1640 570 V900 H-30Z" fill="#3c5154" opacity=".75" />
                </g>
                <rect x="780" y="602" width="830" height="26" fill="#5c7573" opacity=".55" filter="url(#vs-haze)" />

                {/* distant longship, hazy and muted */}
                <g fill="#0a1012" opacity=".9" filter="url(#vs-haze)" transform="translate(40 14) scale(.92)">
                    <path d="M900 605 Q960 636 1090 636 Q1200 636 1262 585 L1274 552 L1262 556 Q1200 598 1090 600 Q980 600 912 560 L900 562 Q910 584 900 605Z" />
                    <rect x="1086" y="462" width="4" height="140" />
                    <path d="M1036 474 H1144 L1136 556 H1044Z" fill="#2c2420" />
                </g>

                {/* rolling fields, brushed edges */}
                <g filter="url(#vs-brush)">
                    <path d="M-30 700 Q300 660 640 700 T1260 690 T1640 702 V900 H-30Z" fill="#2c3624" />
                    <path d="M-30 770 Q380 730 760 772 T1640 765 V900 H-30Z" fill="#1d2619" />
                    <path d="M-30 840 Q500 812 1000 842 T1640 836 V900 H-30Z" fill="#0f160e" />
                </g>

                {/* mid-field wheat */}
                <g strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".75">
                    {mid.map((b, i) => (
                        <path key={i} d={`M${b.x} ${b.y} q${b.lean / 2} ${-b.h / 2} ${b.lean} ${-b.h}`} stroke={b.c} />
                    ))}
                </g>

                {/* dark out-of-focus foreground grass for depth */}
                <g strokeWidth="4" strokeLinecap="round" fill="none" stroke="#050806" filter="url(#vs-haze)">
                    {front.map((b, i) => (
                        <path key={i} d={`M${b.x} ${b.y} q${b.lean / 2} ${-b.h / 2} ${b.lean} ${-b.h}`} />
                    ))}
                </g>

                <rect width="1600" height="900" fill="url(#vs-vig)" />
            </svg>
        )}

        <div className="auth-vignette" aria-hidden="true" />
        <svg className="auth-grain" aria-hidden="true">
            <filter id="vs-grain">
                <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#vs-grain)" />
        </svg>
        <div className="auth-fog" aria-hidden="true" />
    </>
)

export default AuthBackdrop