import { useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

import weblogo from './assets/weblogo.png'
import hero from './assets/Abstraction.png'
import google from './assets/google.png'
import facebook from './assets/facebook.png'
import lock from './assets/lock.png'

/* ---------- Component 1: reusable input (takes props) ---------- */
function FormInput({ id, type = 'text', placeholder, value, onChange, icon, iconAlt = '' }) {
  return (
    <div className="input-wrap">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={onChange}
        className={icon ? 'has-icon' : ''}
      />
      {icon && <img src={icon} alt={iconAlt} className="input-icon" />}
    </div>
  )
}

/* ---------- Component 2: social sign-up button (takes props) ---------- */
function SocialButton({ icon, label }) {
  return (
    <button type="button" className="social-btn">
      <img src={icon} alt="" />
      <span>{label}</span>
    </button>
  )
}

/* ---------- Component 3: left panel ---------- */
function LeftPanel() {
  return (
    <section className="left">
      <img src={weblogo} alt="Logo" className="weblogo" />
      <h1 className="hero-title">Getting Started With VR Creation</h1>
      <img src={hero} alt="Abstract 3D shapes" className="hero-img" />
    </section>
  )
}

/* ---------- Component 4: the form with the Supabase logic ---------- */
function SignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit =
    fullName.trim() !== '' &&
    email.trim() !== '' &&
    password.length >= 6 &&
    !loading

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    })

    if (signUpError) {
      setErrorMessage(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setErrorMessage('Account created, but email confirmation is on. Ask your teacher.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('users').insert({
      id: data.user.id,
      full_name: fullName.trim(),
      email: email.trim(),
    })

    if (insertError) {
      setErrorMessage('Account created, but saving your profile failed: ' + insertError.message)
      setLoading(false)
      return
    }

    setMessage(`Welcome, ${fullName.trim()}! Your account was created.`)
    setFullName('')
    setEmail('')
    setPassword('')
    setLoading(false)
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Create Account</h2>

      <div className="button-row">
        <SocialButton icon={google} label="Signup with Google" />
        <SocialButton icon={facebook} label="Signup with Facebook" />
      </div>

      <p className="or">- OR -</p>

      <div className="inputs">
        <FormInput
          id="fullName"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <FormInput
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormInput
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={lock}
          iconAlt="Lock"
        />
      </div>

      <button type="submit" className="create-btn" disabled={!canSubmit}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {message && <p className="success">{message}</p>}

      <p className="login-text">
        Already have an account? <a href="#">Log In</a>
      </p>
    </form>
  )
}

/* ---------- App: puts the pieces together ---------- */
function App() {
  return (
    <div className="page">
      <LeftPanel />

      <main className="right">
        <div className="select-right">
          <select name="language" aria-label="Language">
            <option value="en-GB">English (UK)</option>
          </select>
        </div>

        <SignupForm />
      </main>
    </div>
  )
}

export default App