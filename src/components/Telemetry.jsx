import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { rand, clamp } from '../utils/telemetry.js';
import SimBadge from './ui/SimBadge.jsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Filler, Tooltip, Legend);
ChartJS.defaults.color = '#8a97b3';
ChartJS.defaults.font.family = "'JetBrains Mono', monospace";
ChartJS.defaults.font.size = 11;

const GRID = 'rgba(138,151,179,0.12)';
const WINDOW = 30;

function seedSeries() {
  const labels = [];
  const volt = [];
  const load = [];
  for (let i = 0; i < WINDOW; i++) {
    labels.push(`${i}s`);
    volt.push(+(16.7 - i * 0.02 + rand(-0.02, 0.02)).toFixed(2));
    load.push(Math.round(55 + 18 * Math.sin(i / 4) + rand(-5, 5)));
  }
  return { labels, volt, load, t: WINDOW };
}

function useStreamingSeries() {
  const [series, setSeries] = useState(seedSeries);
  const visible = useRef(true);
  useEffect(() => {
    const onVis = () => (visible.current = !document.hidden);
    document.addEventListener('visibilitychange', onVis);
    const id = setInterval(() => {
      if (!visible.current) return;
      setSeries((s) => {
        let v = s.volt[s.volt.length - 1] - rand(0.01, 0.03);
        if (v < 14.6) v = 16.7;
        const t = s.t + 1;
        return {
          t,
          labels: [...s.labels.slice(1), `${t}s`],
          volt: [...s.volt.slice(1), +v.toFixed(2)],
          load: [...s.load.slice(1), Math.round(clamp(55 + 18 * Math.sin(t / 4) + rand(-6, 6), 5, 98))],
        };
      });
    }, 1000);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  return series;
}

function ChartCard({ title, children, className = '', height = 'h-[280px] sm:h-[300px]' }) {
  return (
    <div className={`panel p-5 ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="eyebrow">{title}</h3>
        <SimBadge />
      </div>
      <div className={`relative ${height}`}>{children}</div>
    </div>
  );
}

export default function Telemetry() {
  const s = useStreamingSeries();

  const lineData = {
    labels: s.labels,
    datasets: [
      { label: 'Battery voltage (V)', data: s.volt, yAxisID: 'v', borderColor: '#f5a524', backgroundColor: 'rgba(245,165,36,0.12)', fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 },
      { label: 'Compute load (%)', data: s.load, yAxisID: 'l', borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.08)', fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 },
    ],
  };
  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { boxWidth: 12 } } },
    scales: {
      x: { grid: { color: GRID }, ticks: { maxTicksLimit: 8 } },
      v: { position: 'left', min: 14, max: 17, grid: { color: GRID }, title: { display: true, text: 'Volts' } },
      l: { position: 'right', min: 0, max: 100, grid: { display: false }, title: { display: true, text: 'Load %' } },
    },
  };

  const barData = {
    labels: ['Jetson TensorRT', 'RPi5 TFLite', 'ToF Array'],
    datasets: [
      {
        label: 'Latency (ms)',
        data: [22, 110, 8],
        backgroundColor: ['rgba(34,211,238,0.75)', 'rgba(245,165,36,0.75)', 'rgba(52,211,153,0.75)'],
        borderRadius: 8,
      },
    ],
  };
  const barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.raw} ms (illustrative)` } } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: GRID }, title: { display: true, text: 'ms' } } },
  };

  const radarData = {
    labels: ['Flight Dynamics', 'Edge AI', 'Embedded Systems', 'RTOS Firmware', 'Mechanical Design', 'Research Management'],
    datasets: [
      {
        label: 'Team competency (self-assessed, /10)',
        data: [8, 9, 9, 8, 7, 8],
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.18)',
        pointBackgroundColor: '#f5a524',
        borderWidth: 2,
      },
    ],
  };
  const radarOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1400 },
    plugins: { legend: { labels: { boxWidth: 12 } } },
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { display: false, stepSize: 2 },
        grid: { color: GRID },
        angleLines: { color: GRID },
        pointLabels: { color: '#c7d2e8', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <ChartCard title="Battery voltage vs compute load" className="lg:col-span-2">
        <Line data={lineData} options={lineOpts} aria-label="Line chart of simulated battery voltage and compute load over the last 30 seconds" role="img" />
      </ChartCard>
      <ChartCard title="Inference / sensing latency">
        <Bar data={barData} options={barOpts} aria-label="Bar chart comparing illustrative latency: Jetson TensorRT 22 ms, RPi5 TFLite 110 ms, ToF array 8 ms" role="img" />
      </ChartCard>
      <ChartCard title="Team competency radar" height="h-[320px]">
        <Radar data={radarData} options={radarOpts} aria-label="Radar chart of self-assessed team competency across six domains" role="img" />
      </ChartCard>
      <p className="lg:col-span-2 text-xs text-slate-500">
        All chart values are simulated or illustrative and should be replaced with logged bench and flight data. The competency radar is a self-assessment.
      </p>
    </div>
  );
}
