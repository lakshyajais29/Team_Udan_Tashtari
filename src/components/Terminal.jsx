import { useEffect, useRef, useState } from 'react';
import { useTerminal } from '../hooks/useTerminal.js';
import { useReveal } from '../hooks/useReveal.js';
import SimBadge from './ui/SimBadge.jsx';
import '../styles/simulator.css';

const TONE = {
  text: 'text-slate-300',
  muted: 'text-slate-500',
  cyan: 'text-cyan-300',
  green: 'text-emerald-300',
  amber: 'text-amber-300',
  red: 'text-rose-400',
  prompt: 'text-emerald-400',
  hb: 'text-slate-600',
};

const QUICK = ['help', 'heartbeat', 'status', 'telemetry', 'arm', 'mode AUTO', 'mission', 'version', 'clear'];

/** Simulated MAVLink console with history, timestamps, auto-scroll and a blinking cursor. */
export default function Terminal() {
  const [wrapRef, onScreen] = useReveal({ threshold: 0 });
  const { lines, history, execute } = useTerminal(onScreen);
  const [input, setInput] = useState('');
  const [hi, setHi] = useState(-1); // history index, -1 = new line
  const [focused, setFocused] = useState(false);
  const outRef = useRef(null);
  const inRef = useRef(null);

  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const submit = (cmd) => {
    execute(cmd);
    setInput('');
    setHi(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const n = hi === -1 ? history.length - 1 : Math.max(0, hi - 1);
      setHi(n);
      setInput(history[n]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hi === -1) return;
      const n = hi + 1;
      if (n >= history.length) {
        setHi(-1);
        setInput('');
      } else {
        setHi(n);
        setInput(history[n]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      submit('clear');
    }
  };

  return (
    <div ref={wrapRef}>
      <div className="terminal corner relative" onClick={() => inRef.current?.focus()}>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#13203a] font-mono text-[11px] text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 truncate">gcs@udan-tashtari — mavlink://telem2 · sysid 1 · compid 1</span>
          <SimBadge className="ml-auto shrink-0" />
        </div>

        <div ref={outRef} className="terminal-out font-mono p-4" role="log" aria-live="polite" aria-label="Console output">
          {lines.map((l) => (
            <div key={l.id} className={`terminal-line flex gap-3 ${TONE[l.tone] ?? TONE.text}`}>
              <span className="text-slate-700 shrink-0 hidden sm:inline select-none">{l.ts}</span>
              <span>{l.text}</span>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 px-4 py-3 border-t border-[#13203a] font-mono text-[13px] relative">
          <span className="text-emerald-400 shrink-0">gcs@udan-tashtari:~$</span>
          <span className="relative flex-1 min-w-0">
            {/* Visible mirror with blinking block cursor */}
            <span className="whitespace-pre text-slate-100" aria-hidden="true">
              {input}
              <span className={`inline-block w-[0.6em] h-[1.1em] align-[-0.2em] bg-cyan ${focused ? 'cursor-blink' : 'opacity-40'}`} />
            </span>
            <input
              ref={inRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-label="Type a MAVLink console command"
            />
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mt-3" aria-label="Quick commands">
        {QUICK.map((q) => (
          <button key={q} className="chip hover:border-cyan hover:text-white transition-colors min-h-[32px] px-3" onClick={() => submit(q)}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
