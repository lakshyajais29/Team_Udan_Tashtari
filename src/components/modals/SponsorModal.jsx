import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { SPONSOR_INTERESTS, formatINR } from '../../data/sponsor.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sponsorship inquiry form.
 * FRONTEND ONLY: submission is simulated — nothing is sent anywhere.
 * To go live, replace `submitInquiry` with a call to your form backend (see README).
 */
async function submitInquiry(data) {
  await new Promise((r) => setTimeout(r, 900));
  return { ok: true, ref: `INQ-${Date.now().toString(36).toUpperCase()}`, data };
}

export default function SponsorModal({ amount, onClose }) {
  const [form, setForm] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    interest: SPONSOR_INTERESTS[0],
    message: amount ? `Proposed contribution: ${formatINR(amount)}` : '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [ref, setRef] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!form.organization.trim()) e.organization = 'Please enter your organisation.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email address.';
    if (form.phone && !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) e.phone = 'Please enter a valid phone number.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    const res = await submitInquiry(form);
    setRef(res.ref);
    setStatus('done');
  };

  if (status === 'done') {
    return (
      <div className="text-center py-6">
        <CheckCircle2 size={56} className="mx-auto text-emerald-300" aria-hidden="true" />
        <h3 id="modal-title" className="text-2xl font-semibold mt-4 font-mono tracking-wider">
          INQUIRY RECEIVED
        </h3>
        <p className="text-slate-400 mt-2">Thank you, {form.name}. Reference {ref}.</p>
        <p className="text-[12px] text-amber-300/90 mt-4 max-w-md mx-auto">
          Demo mode: this form is not connected to a backend, so no message has actually been sent.
        </p>
        <button className="btn btn-primary mt-6" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  const Field = ({ id, label, required, children }) => (
    <label className="text-sm block" htmlFor={id}>
      <span className="font-mono text-[11px] text-slate-500">
        {label.toUpperCase()}
        {required && ' *'}
      </span>
      <div className="mt-1">{children}</div>
      {errors[id] && <span className="text-xs text-rose-400 mt-1 block">{errors[id]}</span>}
    </label>
  );

  return (
    <>
      <p className="eyebrow pr-12">Partner / sponsor inquiry</p>
      <h3 id="modal-title" className="text-2xl font-semibold mt-2">
        Back Team Udan-Tashtari
      </h3>
      <p className="text-sm text-slate-400 mt-2">Tell us how you'd like to support the team.</p>

      <form onSubmit={onSubmit} className="mt-6 grid sm:grid-cols-2 gap-4" noValidate>
        {Field({ id: 'name', label: 'Name', required: true, children: <input id="name" className="field" value={form.name} onChange={set('name')} autoComplete="name" /> })}
        {Field({ id: 'organization', label: 'Organization', required: true, children: <input id="organization" className="field" value={form.organization} onChange={set('organization')} autoComplete="organization" /> })}
        {Field({ id: 'email', label: 'Email', required: true, children: <input id="email" type="email" className="field" value={form.email} onChange={set('email')} autoComplete="email" /> })}
        {Field({ id: 'phone', label: 'Phone', children: <input id="phone" type="tel" className="field" value={form.phone} onChange={set('phone')} autoComplete="tel" /> })}
        <div className="sm:col-span-2">
          {Field({
            id: 'interest',
            label: 'Sponsorship interest',
            children: (
              <select id="interest" className="field" value={form.interest} onChange={set('interest')}>
                {SPONSOR_INTERESTS.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            ),
          })}
        </div>
        <div className="sm:col-span-2">
          {Field({ id: 'message', label: 'Message', children: <textarea id="message" rows={4} className="field" value={form.message} onChange={set('message')} /> })}
        </div>
        <button type="submit" className="btn btn-amber sm:col-span-2 font-mono tracking-wider" disabled={status === 'sending'}>
          <Send size={16} aria-hidden="true" /> {status === 'sending' ? 'SUBMITTING…' : 'SUBMIT INQUIRY'}
        </button>
        <p className="sm:col-span-2 text-[11px] text-slate-500">Demo form — submissions are simulated and not stored or sent.</p>
      </form>
    </>
  );
}
