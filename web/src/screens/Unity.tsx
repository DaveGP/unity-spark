import { useState, type FormEvent, type ReactNode } from 'react'
import type { User } from '../components/Shell'

/*
 * The Unity ecosystem screens the flow starts from: the unity.com/spark landing page
 * (a capture, with "Join the waitlist" swapped for "Sign up and try now") and Unity ID sign-in.
 */

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="landing">
      <div className="proto-banner" role="note"><strong>Prototype</strong> A concept for Unity Spark. This page is a mock-up, not unity.com.</div>
      <div className="landing__page">
        <img src="assets/spark-landing.jpg" alt="Unity Spark: make games by describing them" />
        <span className="landing__cover landing__cover--cta" />
        <span className="landing__cover landing__cover--cursor" />
        <button className="landing__cta" onClick={onStart}>Sign up and try now</button>
        <button className="landing__hotspot" onClick={onStart} aria-label="Get started" />
      </div>
    </div>
  )
}

/** "sam.rivera@studio.com" → Sam Rivera */
export function userFromEmail(email: string): User {
  const local = email.split('@')[0] || 'sam'
  const parts = local.split(/[._-]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  const name = parts[0] || 'Sam'
  return { name, fullName: parts.length > 1 ? parts.slice(0, 2).join(' ') : parts[0] === 'Sam' ? 'Sam Rivera' : name, email }
}

const DEMO_EMAIL = 'sam@studio.com'

const SOCIAL = ['Continue with Google', 'Continue with Apple', 'Continue with Facebook', 'Continue with SSO']

function Chrome({ children }: { children: ReactNode }) {
  return (
    <div className="unity">
      <div className="proto-banner" role="note">
        <strong>Prototype</strong> This isn’t a real Unity sign-in. Nothing you see here is sent anywhere; a demo account is filled in for you.
      </div>
      <main className="unity__col">
        <img className="unity__logo" src="assets/unity-logo.png" alt="Unity" width={126} height={48} />
        {children}
      </main>
      <footer className="unity__foot">
        <nav>
          {['Legal', 'Privacy Policy', 'Cookies', 'Cookie Settings', 'Do Not Sell or Share My Personal Information'].map((l) => <a key={l}>{l}</a>)}
        </nav>
        <img src="assets/unity-lang.png" alt="English" width={141} height={33} />
      </footer>
    </div>
  )
}

export function UnitySignIn({ onDone }: { onDone: (u: User) => void }) {
  const [step, setStep] = useState<'email' | 'password'>('email')
  // Demo account only: the fields are filled in and read-only so nobody types real credentials.
  const email = DEMO_EMAIL
  const next = (e: FormEvent) => { e.preventDefault(); setStep('password') }
  const signIn = (e: FormEvent) => { e.preventDefault(); onDone(userFromEmail(email)) }
  const social = () => onDone({ name: 'Sam', fullName: 'Sam Rivera', email: DEMO_EMAIL })

  if (step === 'password') {
    return (
      <Chrome>
        <h1 className="unity__h">Enter password</h1>
        <button className="unity__account" onClick={() => setStep('email')}>
          <span aria-hidden>←</span> {email}
        </button>
        <form onSubmit={signIn} className="unity__form">
          <label className="unity__label" htmlFor="pw">Password <b>*</b></label>
          <div className="unity__field">
            <input id="pw" type="password" value="demo-password" readOnly tabIndex={-1} aria-describedby="demo-note" />
          </div>
          <p className="unity__demo" id="demo-note">Demo password filled in for you.</p>
          <button className="unity__btn" type="submit" autoFocus>Sign in</button>
        </form>
        <a className="unity__link">Reset your password</a>
        <button className="unity__link" onClick={() => setStep('email')}>Sign into a different account</button>
      </Chrome>
    )
  }

  return (
    <Chrome>
      <h1 className="unity__h">Sign in</h1>
      <p className="unity__sub">to continue to Unity</p>
      <form onSubmit={next} className="unity__form">
        <div className="unity__field">
          <input type="email" value={email} readOnly tabIndex={-1} aria-label="Email" aria-describedby="demo-email" />
        </div>
        <p className="unity__demo" id="demo-email">Demo account filled in for you.</p>
        <button className="unity__btn" type="submit" autoFocus>Continue</button>
      </form>
      <p className="unity__new">New to Unity? <a onClick={social}>Create an account</a></p>
      <div className="unity__or"><span />or<span /></div>
      <div className="unity__social">
        <img src="assets/unity-social.png" alt="" width={329} height={198} />
        {SOCIAL.map((s, i) => <button key={s} style={{ top: 1 + i * 52 }} onClick={social} aria-label={s} />)}
      </div>
    </Chrome>
  )
}
