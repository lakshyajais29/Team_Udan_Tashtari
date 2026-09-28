/**
 * Artificial-horizon (AHRS) rendering. Draws onto a square canvas of logical size S.
 * state = { pitch, roll, heading, altitude } in degrees / metres.
 */
const PX_PER_DEG = 8;

function line(x, a, b, c, d) {
  x.beginPath();
  x.moveTo(a, b);
  x.lineTo(c, d);
  x.stroke();
}

export function drawAhrs(x, S, { pitch, roll, heading, altitude }) {
  const c = S / 2;
  const R = S * 0.46;
  const k = S / 640; // scale factor relative to the 640px design size
  const ppd = PX_PER_DEG * k;
  x.clearRect(0, 0, S, S);

  // Sky / ground, rotated by roll and shifted by pitch
  x.save();
  x.beginPath();
  x.arc(c, c, R, 0, Math.PI * 2);
  x.clip();
  x.translate(c, c);
  x.rotate((-roll * Math.PI) / 180);
  x.translate(0, pitch * ppd);
  let g = x.createLinearGradient(0, -S, 0, 0);
  g.addColorStop(0, '#031a30');
  g.addColorStop(1, '#0f6f9c');
  x.fillStyle = g;
  x.fillRect(-S, -S, S * 2, S);
  g = x.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#5b3b1b');
  g.addColorStop(1, '#1b1107');
  x.fillStyle = g;
  x.fillRect(-S, 0, S * 2, S);
  x.strokeStyle = '#e6edf7';
  x.lineWidth = 3 * k;
  line(x, -S, 0, S, 0);
  x.font = `600 ${20 * k}px "JetBrains Mono", monospace`;
  x.fillStyle = '#e6edf7';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  for (let p = -40; p <= 40; p += 5) {
    if (!p) continue;
    const y = -p * ppd;
    const w = (p % 10 === 0 ? 90 : 45) * k;
    x.lineWidth = 2 * k;
    line(x, -w, y, w, y);
    if (p % 10 === 0) {
      x.fillText(Math.abs(p), -w - 28 * k, y);
      x.fillText(Math.abs(p), w + 28 * k, y);
    }
  }
  x.restore();

  // Roll scale + pointer
  x.save();
  x.translate(c, c);
  x.strokeStyle = 'rgba(230,237,247,0.85)';
  x.lineWidth = 3 * k;
  [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].forEach((a) => {
    const r = ((a - 90) * Math.PI) / 180;
    const l = (a % 30 === 0 ? 30 : 16) * k;
    const o = R - 6 * k;
    line(x, Math.cos(r) * o, Math.sin(r) * o, Math.cos(r) * (o - l), Math.sin(r) * (o - l));
  });
  x.rotate((-roll * Math.PI) / 180);
  x.fillStyle = '#22d3ee';
  x.beginPath();
  x.moveTo(0, -R + 40 * k);
  x.lineTo(-14 * k, -R + 64 * k);
  x.lineTo(14 * k, -R + 64 * k);
  x.closePath();
  x.fill();
  x.restore();

  // Fixed aircraft reference
  x.strokeStyle = '#f5a524';
  x.lineWidth = 9 * k;
  x.lineCap = 'round';
  line(x, c - 160 * k, c, c - 60 * k, c);
  line(x, c - 60 * k, c, c - 30 * k, c + 28 * k);
  line(x, c + 160 * k, c, c + 60 * k, c);
  line(x, c + 60 * k, c, c + 30 * k, c + 28 * k);
  x.lineCap = 'butt';
  x.fillStyle = '#f5a524';
  x.beginPath();
  x.arc(c, c, 8 * k, 0, Math.PI * 2);
  x.fill();

  // Heading tape (bottom) and altitude readout (right)
  x.font = `600 ${18 * k}px "JetBrains Mono", monospace`;
  x.textAlign = 'center';
  x.fillStyle = 'rgba(2,6,14,0.75)';
  x.fillRect(c - 58 * k, c + R - 70 * k, 116 * k, 34 * k);
  x.fillStyle = '#22d3ee';
  x.fillText(`HDG ${String(Math.round(heading)).padStart(3, '0')}°`, c, c + R - 53 * k);
  x.fillStyle = 'rgba(2,6,14,0.75)';
  x.fillRect(c + R - 150 * k, c - 17 * k, 110 * k, 34 * k);
  x.fillStyle = '#f5a524';
  x.fillText(`${altitude.toFixed(1)} m`, c + R - 95 * k, c + 1 * k);

  // Bezel
  x.lineWidth = 6 * k;
  x.strokeStyle = '#1a2440';
  x.beginPath();
  x.arc(c, c, R, 0, Math.PI * 2);
  x.stroke();
  x.lineWidth = 2 * k;
  x.strokeStyle = 'rgba(34,211,238,0.6)';
  x.beginPath();
  x.arc(c, c, R + 8 * k, 0, Math.PI * 2);
  x.stroke();
}
