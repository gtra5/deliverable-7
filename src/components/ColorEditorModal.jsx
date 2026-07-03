import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Shuffle } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function hexToRgba(hex) {
  const clean = hex.replace('#', '');
  const full  = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(8, 'ff').slice(0, 8);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const a = full.length >= 8 ? Math.round((parseInt(full.slice(6, 8), 16) / 255) * 100) : 100;
  return { r, g, b, a };
}

function rgbaToHex(r, g, b, a = 100) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  const alpha = Math.round((a / 100) * 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha < 255 ? toHex(alpha) : ''}`;
}

function rgbaToHsl(r, g, b) {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break;
      case gg: h = ((bb - rr) / d + 2) / 6; break;
      default: h = ((rr - gg) / d + 4) / 6;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

function randomHex() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ─── Color Wheel ────────────────────────────────────────────────────────────

function ColorWheel({ hue, saturation, lightness, onChange }) {
  const canvasRef = useRef(null);
  const size = 160;
  const cx = size / 2, cy = size / 2, radius = size / 2 - 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    for (let angle = 0; angle < 360; angle++) {
      const start = ((angle - 1) * Math.PI) / 180;
      const end   = ((angle + 1) * Math.PI) / 180;
      const grad  = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `hsl(${angle}, 0%, ${lightness}%)`);
      grad.addColorStop(1, `hsl(${angle}, 100%, ${lightness}%)`);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    const lGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    lGrad.addColorStop(0, `rgba(255,255,255,${lightness < 50 ? (50 - lightness) / 50 : 0})`);
    lGrad.addColorStop(1, `rgba(0,0,0,${lightness < 50 ? (50 - lightness) / 50 : 0})`);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = lGrad;
    ctx.fill();
  }, [lightness, size, cx, cy, radius]);

  const handleInteract = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top  - cy;
    const dist = Math.sqrt(x * x + y * y);
    if (dist > radius) return;
    const angle = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    const sat   = clamp((dist / radius) * 100, 0, 100);
    onChange({ h: angle, s: sat });
  }, [cx, cy, radius, onChange]);

  const angle    = (hue * Math.PI) / 180;
  const dist     = (saturation / 100) * radius;
  const dotX     = cx + dist * Math.cos(angle);
  const dotY     = cy + dist * Math.sin(angle);
  const dotColor = hslToRgb(hue, saturation, lightness);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full cursor-crosshair touch-none"
        onClick={handleInteract}
        onMouseMove={(e) => { if (e.buttons === 1) handleInteract(e); }}
        onTouchMove={(e) => { e.preventDefault(); handleInteract(e); }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 18, height: 18,
          left: dotX - 9, top: dotY - 9,
          backgroundColor: `rgb(${dotColor.r},${dotColor.g},${dotColor.b})`,
          border: '2px solid #F5F3FF',
          boxShadow: '0 0 0 2px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  );
}

// ─── Flat slider (no gradients) ──────────────────────────────────────────────
// Shows a solid track using the Quantus border color, with a Violet thumb.

function FlatSlider({ value, min = 0, max = 100, onChange, label, displayValue }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--q-muted)' }}>
          {label}
        </span>
        <span className="text-xs font-mono font-medium" style={{ color: 'var(--q-violet)' }}>
          {displayValue ?? Math.round(value)}
        </span>
      </div>

      {/* Custom track + thumb built from divs — zero gradients */}
      <div className="relative h-3 rounded-full" style={{ backgroundColor: 'var(--q-haiti-lite)' }}>
        {/* Filled portion — solid Violet */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: 'var(--q-violet)' }}
        />
        {/* Turbo tick at current position */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 pointer-events-none"
          style={{
            left: `calc(${pct}% - 8px)`,
            backgroundColor: 'var(--q-turbo)',
            borderColor: 'var(--q-haiti)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}
        />
        {/* Invisible range input on top for interaction */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          aria-label={label}
        />
      </div>
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

export default function ColorEditorModal({ tileName, initialColor, recentColors, onSave, onClose }) {
  const { r: ir, g: ig, b: ib, a: ia } = hexToRgba(initialColor);
  const { h: ih, s: is, l: il } = rgbaToHsl(ir, ig, ib);

  const [hue,        setHue]        = useState(ih);
  const [saturation, setSaturation] = useState(is);
  const [lightness,  setLightness]  = useState(il);
  const [alpha,      setAlpha]      = useState(ia);
  const [hexInput,   setHexInput]   = useState(
    initialColor.replace('#', '').slice(0, 6).toUpperCase()
  );

  const { r, g, b } = hslToRgb(hue, saturation, lightness);
  const currentHex  = rgbaToHex(r, g, b, alpha);
  const previewBg   = `rgba(${r},${g},${b},${alpha / 100})`;

  useEffect(() => {
    setHexInput(rgbaToHex(r, g, b).replace('#', '').toUpperCase());
  }, [r, g, b]);

  const applyHex = useCallback((raw) => {
    const clean = raw.replace('#', '');
    if (clean.length === 6) {
      const { r: nr, g: ng, b: nb } = hexToRgba('#' + clean);
      const { h, s, l } = rgbaToHsl(nr, ng, nb);
      setHue(h); setSaturation(s); setLightness(l);
    }
  }, []);

  const handleWheelChange = useCallback(({ h, s }) => {
    setHue(h); setSaturation(s);
  }, []);

  const goRandom = () => {
    const hex = randomHex();
    const { r: nr, g: ng, b: nb } = hexToRgba(hex);
    const { h, s, l } = rgbaToHsl(nr, ng, nb);
    setHue(h); setSaturation(s); setLightness(l); setAlpha(100);
    setHexInput(hex.replace('#', '').toUpperCase());
  };

  const applyRecent = (hex) => {
    const { r: nr, g: ng, b: nb } = hexToRgba(hex);
    const { h, s, l } = rgbaToHsl(nr, ng, nb);
    setHue(h); setSaturation(s); setLightness(l);
    setHexInput(hex.replace('#', '').slice(0, 6).toUpperCase());
  };

  // Shared input style
  const inputStyle = {
    backgroundColor: 'var(--q-haiti-lite)',
    color: 'var(--q-chalk)',
    border: '1px solid var(--q-border)',
  };
  const inputFocusStyle = { outline: 'none', borderColor: 'var(--q-violet)' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(24,16,43,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative rounded-t-2xl sm:rounded-2xl w-full sm:w-80 max-h-[92vh]
                   overflow-y-auto p-5 flex flex-col gap-5 scrollbar-thin"
        style={{
          backgroundColor: 'var(--q-haiti-mid)',
          border: '1px solid var(--q-border)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center -mt-1 mb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--q-border)' }} />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--q-chalk)' }}>
            Color Editor
            <span className="ml-2 font-normal capitalize" style={{ color: 'var(--q-muted)' }}>
              / {tileName}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 transition"
            style={{ color: 'var(--q-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--q-chalk)'; e.currentTarget.style.backgroundColor = 'var(--q-haiti-lite)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--q-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Preview + Wheel ── */}
        <div className="flex items-center justify-center gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-xl"
              style={{
                backgroundColor: previewBg,
                border: '1px solid var(--q-border)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            />
            <span className="text-xs" style={{ color: 'var(--q-muted)' }}>Preview</span>
          </div>

          <ColorWheel
            hue={hue}
            saturation={saturation}
            lightness={lightness}
            onChange={handleWheelChange}
          />
        </div>

        {/* ── Go Random ── */}
        <button
          type="button"
          onClick={goRandom}
          className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition"
          style={{ backgroundColor: 'var(--q-haiti-lite)', color: 'var(--q-chalk)', border: '1px solid var(--q-border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--q-violet)'; e.currentTarget.style.color = 'var(--q-violet)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--q-border)'; e.currentTarget.style.color = 'var(--q-chalk)'; }}
        >
          <Shuffle size={14} />
          Go Random
        </button>

        {/* ── Lightness slider (flat, no gradient) ── */}
        <FlatSlider
          label="Lightness"
          value={Math.round(lightness)}
          min={0}
          max={100}
          onChange={setLightness}
          displayValue={`${Math.round(lightness)}%`}
        />

        {/* ── Opacity slider (flat, no gradient) ── */}
        <FlatSlider
          label="Opacity"
          value={alpha}
          min={0}
          max={100}
          onChange={setAlpha}
          displayValue={`${alpha}%`}
        />

        {/* ── HEX + R G B inputs ── */}
        <div className="grid grid-cols-5 gap-2">
          {/* HEX */}
          <div className="col-span-2 flex flex-col gap-1">
            <input
              type="text"
              value={hexInput}
              maxLength={6}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');
                setHexInput(v);
                applyHex(v);
              }}
              className="text-xs text-center rounded-lg px-2 py-2 font-mono w-full"
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e)  => { e.target.style.borderColor = 'var(--q-border)'; e.target.style.outline = 'none'; }}
              aria-label="Hex color"
            />
            <span className="text-xs text-center" style={{ color: 'var(--q-muted)' }}>HEX</span>
          </div>

          {[
            { ch: 'R', val: r, onChange: (v) => { const { h: nh, s: ns, l: nl } = rgbaToHsl(v, g, b); setHue(nh); setSaturation(ns); setLightness(nl); } },
            { ch: 'G', val: g, onChange: (v) => { const { h: nh, s: ns, l: nl } = rgbaToHsl(r, v, b); setHue(nh); setSaturation(ns); setLightness(nl); } },
            { ch: 'B', val: b, onChange: (v) => { const { h: nh, s: ns, l: nl } = rgbaToHsl(r, g, v); setHue(nh); setSaturation(ns); setLightness(nl); } },
          ].map(({ ch, val, onChange }) => (
            <div key={ch} className="flex flex-col gap-1">
              <input
                type="number"
                min={0}
                max={255}
                value={val}
                onChange={(e) => onChange(Number(e.target.value))}
                className="text-xs text-center rounded-lg px-1 py-2 w-full"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e)  => { e.target.style.borderColor = 'var(--q-border)'; e.target.style.outline = 'none'; }}
                aria-label={ch === 'R' ? 'Red' : ch === 'G' ? 'Green' : 'Blue'}
              />
              <span className="text-xs text-center" style={{ color: 'var(--q-muted)' }}>{ch}</span>
            </div>
          ))}
        </div>

        {/* ── Recent colors ── */}
        {recentColors.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--q-muted)' }}>
              Recent {recentColors.length}
            </span>
            <div className="flex gap-2 flex-wrap">
              {recentColors.map((hex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyRecent(hex)}
                  title={hex}
                  className="w-7 h-7 rounded-full transition"
                  style={{
                    backgroundColor: hex,
                    border: '2px solid var(--q-border)',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--q-violet)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--q-border)'; }}
                  aria-label={`Recent color ${hex}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Save ── */}
        <button
          type="button"
          onClick={() => onSave(currentHex)}
          className="rounded-xl py-2.5 text-sm font-bold transition"
          style={{ backgroundColor: 'var(--q-violet)', color: 'var(--q-chalk)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--q-violet-dim)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--q-violet)'; }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
