<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import gsap from "gsap";
import { useI18n } from "../composables/useI18n";
import LocaleSwitcher from "./LocaleSwitcher.vue";
import ClippyHelper from "./ClippyHelper.vue";

const emit = defineEmits<{ (e: "done"): void }>();
const { t } = useI18n();

const root = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const diving = ref(false);
const pointer = ref({ nx: 0, ny: 0 });

let raf = 0;
let running = true;

// ── Circuit board background (ASUS PRIME B250M style) ────────────────────────

interface Trace { points: [number, number][]; }
interface Signal { traceIdx: number; t: number; speed: number; tail: number; hue: number; }

const CU   = "rgba(184,138,0,0.85)";   // copper trace
const CU_D = "rgba(184,138,0,0.4)";    // dim copper
const SILK = "rgba(235,235,235,0.75)"; // silkscreen
const PAD  = "#c8980a";                // gold pad

let traces: Trace[] = [];
let signals: Signal[] = [];
let staticCanvas: HTMLCanvasElement | null = null;
let circuitRaf = 0;

function silk(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size = 9, align: CanvasTextAlign = "left") {
  ctx.fillStyle = SILK; ctx.font = `${size}px monospace`; ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function pad(ctx: CanvasRenderingContext2D, x: number, y: number, r = 3.5) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.fillStyle = PAD; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI*2);
  ctx.fillStyle = "#1a1000"; ctx.fill();
}

function via(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2);
  ctx.fillStyle = PAD; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2);
  ctx.fillStyle = "#0a1a0a"; ctx.fill();
}

function capacitor(ctx: CanvasRenderingContext2D, x: number, y: number, r = 9) {
  // Body
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
  const cg = ctx.createRadialGradient(x-2, y-2, 1, x, y, r);
  cg.addColorStop(0, "#c8a020"); cg.addColorStop(0.5, "#8b6010"); cg.addColorStop(1, "#4a3008");
  ctx.fillStyle = cg; ctx.fill();
  ctx.strokeStyle = "#d4a824"; ctx.lineWidth = 1; ctx.stroke();
  // Stripe (negative marker)
  ctx.fillStyle = "rgba(20,10,0,0.75)";
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI*0.7, Math.PI*1.3); ctx.lineTo(x, y); ctx.fill();
  // Top highlight
  ctx.fillStyle = "rgba(255,220,100,0.25)";
  ctx.beginPath(); ctx.ellipse(x-2, y-3, r*0.55, r*0.35, -0.3, 0, Math.PI*2); ctx.fill();
  // Pads
  pad(ctx, x, y - r - 4); pad(ctx, x, y + r + 4);
}

function mosfet(ctx: CanvasRenderingContext2D, x: number, y: number, w = 18, h = 18) {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  // Pin marks
  ctx.fillStyle = SILK; ctx.font = "6px monospace"; ctx.textAlign = "center";
  // 3 legs at bottom
  for (let i = 0; i < 3; i++) {
    const px = x + w * 0.2 + i * w * 0.3;
    ctx.fillStyle = PAD; ctx.fillRect(px - 1.5, y + h, 3, 5);
  }
}

function smallIC(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label = "", legs = 8) {
  ctx.fillStyle = "#111111"; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(80,80,80,0.8)"; ctx.lineWidth = 0.8; ctx.strokeRect(x, y, w, h);
  // Notch
  ctx.beginPath(); ctx.arc(x + w/2, y, 4, 0, Math.PI); ctx.fillStyle = "#222"; ctx.fill();
  // Pin 1 dot
  ctx.beginPath(); ctx.arc(x+4, y+4, 1.5, 0, Math.PI*2); ctx.fillStyle = PAD; ctx.fill();
  // Legs
  const spacing = w / (legs/2 + 1);
  for (let i = 0; i < legs/2; i++) {
    const px = x + spacing * (i+1);
    ctx.fillStyle = "#c8a820";
    ctx.fillRect(px-1.5, y-5, 3, 6);
    ctx.fillRect(px-1.5, y+h-1, 3, 6);
  }
  if (label) silk(ctx, label, x + w/2, y + h/2 + 3, 7, "center");
}

function ramSlot(ctx: CanvasRenderingContext2D, x: number, y: number, len: number) {
  // Body
  ctx.fillStyle = "#0d0d0f"; ctx.fillRect(x, y, len, 14);
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.strokeRect(x, y, len, 14);
  // Keying notch
  const notch = x + len * 0.58;
  ctx.fillStyle = "#1a1a1f"; ctx.fillRect(notch - 2, y, 4, 14);
  // Contacts
  for (let i = 0; i < 30; i++) {
    const cx2 = x + 6 + i * (len - 12) / 30;
    ctx.fillStyle = "#c8a020"; ctx.fillRect(cx2, y + 2, 2, 4);
    ctx.fillRect(cx2, y + 8, 2, 4);
  }
  // Retention clips
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(x - 4, y - 2, 5, 18); ctx.fillRect(x + len - 1, y - 2, 5, 18);
  ctx.strokeStyle = "#555"; ctx.lineWidth = 0.5;
  ctx.strokeRect(x - 4, y - 2, 5, 18); ctx.strokeRect(x + len - 1, y - 2, 5, 18);
}

function pcieSlot(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, isX16 = false) {
  ctx.fillStyle = isX16 ? "#0a0a0f" : "#111115"; ctx.fillRect(x, y, len, 12);
  ctx.strokeStyle = isX16 ? "#334" : "#333"; ctx.lineWidth = 1; ctx.strokeRect(x, y, len, 12);
  // Contacts
  for (let i = 0; i < Math.floor(len / 5); i++) {
    const cx2 = x + 4 + i * 5;
    if (cx2 + 3 > x + len) break;
    ctx.fillStyle = "#c8a020"; ctx.fillRect(cx2, y + 2, 2, 3); ctx.fillRect(cx2, y + 7, 2, 3);
  }
  // Lock tab
  ctx.fillStyle = "#1a1a22"; ctx.fillRect(x + len - 10, y - 3, 10, 18);
  ctx.strokeStyle = "#445"; ctx.lineWidth = 0.5; ctx.strokeRect(x + len - 10, y - 3, 10, 18);
}

function sataPort(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // L-shaped SATA connector
  ctx.fillStyle = "#222"; ctx.fillRect(x, y, 15, 22);
  ctx.strokeStyle = "#555"; ctx.lineWidth = 0.8; ctx.strokeRect(x, y, 15, 22);
  ctx.fillStyle = "#1a1a1a"; ctx.fillRect(x+2, y+2, 11, 18);
  // 7 contacts
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = PAD; ctx.fillRect(x+2+i*1.5, y+2, 1.2, 18);
  }
  // Connector notch
  ctx.fillStyle = "#333"; ctx.fillRect(x+4, y, 7, 3);
}

function atxPower(ctx: CanvasRenderingContext2D, x: number, y: number, cols: number, rows: number) {
  const pw = cols * 10 + 4, ph = rows * 10 + 4;
  ctx.fillStyle = "#111"; ctx.fillRect(x, y, pw, ph);
  ctx.strokeStyle = "#444"; ctx.lineWidth = 1; ctx.strokeRect(x, y, pw, ph);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const px2 = x + 2 + c * 10 + 5, py2 = y + 2 + r * 10 + 5;
    ctx.beginPath(); ctx.arc(px2, py2, 3.5, 0, Math.PI*2);
    ctx.fillStyle = "#1a1000"; ctx.fill();
    ctx.strokeStyle = PAD; ctx.lineWidth = 0.8; ctx.stroke();
  }
}

function cpuSocket(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  // Outer frame
  const bg2 = ctx.createLinearGradient(x, y, x+size, y+size);
  bg2.addColorStop(0, "#2a2a1e"); bg2.addColorStop(1, "#1a1a14");
  ctx.fillStyle = bg2; ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "#666"; ctx.lineWidth = 2; ctx.strokeRect(x, y, size, size);

  // Retention bracket (silver)
  const bx = x+10, by = y+10, bs = size-20;
  const bgrad = ctx.createLinearGradient(bx, by, bx+bs, by+bs);
  bgrad.addColorStop(0,"#888"); bgrad.addColorStop(0.5,"#bbb"); bgrad.addColorStop(1,"#777");
  ctx.fillStyle = bgrad; ctx.fillRect(bx, by, bs, bs);
  ctx.strokeStyle = "#555"; ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, bs, bs);

  // Inner socket die area
  const dSize = bs * 0.65;
  const dx = bx + (bs-dSize)/2, dy = by + (bs-dSize)/2;
  const dg = ctx.createLinearGradient(dx, dy, dx+dSize, dy+dSize);
  dg.addColorStop(0,"#c8a020"); dg.addColorStop(0.3,"#e4bc30"); dg.addColorStop(0.7,"#b89018"); dg.addColorStop(1,"#a07810");
  ctx.fillStyle = dg; ctx.fillRect(dx, dy, dSize, dSize);

  // LGA pin array (tiny dots)
  const pinStep = dSize / 16;
  for (let pr = 1; pr < 16; pr++) for (let pc2 = 1; pc2 < 16; pc2++) {
    if ((pr + pc2) % 2 === 0) {
      ctx.beginPath(); ctx.arc(dx + pc2*pinStep, dy + pr*pinStep, 0.8, 0, Math.PI*2);
      ctx.fillStyle = "rgba(100,60,0,0.8)"; ctx.fill();
    }
  }

  // Retention lever
  ctx.fillStyle = "#888"; ctx.fillRect(x + size - 6, y + size * 0.2, 8, size * 0.3);
  ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1; ctx.strokeRect(x + size - 6, y + size * 0.2, 8, size * 0.3);

  // Corner screw holes
  for (const [ox, oy] of [[-18,-18],[size+18,-18],[-18,size+18],[size+18,size+18]] as [number,number][]) {
    ctx.beginPath(); ctx.arc(x+ox, y+oy, 7, 0, Math.PI*2);
    ctx.fillStyle = "#1a3a1a"; ctx.fill();
    ctx.strokeStyle = "#4a8a4a"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(x+ox, y+oy, 3, 0, Math.PI*2);
    ctx.fillStyle = "#2a5a2a"; ctx.fill();
  }

  // Label
  silk(ctx, "LGA1151", x + size/2, y + size + 14, 9, "center");
}

function chipset(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = "#0d0d12"; ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "rgba(100,150,255,0.4)"; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, size, size);
  ctx.fillStyle = "rgba(80,120,200,0.08)"; ctx.fillRect(x+2,y+2,size-4,size-4);
  // Inner square pattern
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(80,120,200,${0.06 + i*0.04})`; ctx.lineWidth = 0.5;
    ctx.strokeRect(x+4+i*5, y+4+i*5, size-8-i*10, size-8-i*10);
  }
  // Legs on all 4 sides
  const legs = 8, legStep = size / (legs+1);
  for (let i = 0; i < legs; i++) {
    const lp = i * legStep + legStep;
    ctx.fillStyle = PAD;
    ctx.fillRect(x + lp - 1.5, y - 5, 3, 6);
    ctx.fillRect(x + lp - 1.5, y + size - 1, 3, 6);
    ctx.fillRect(x - 5, y + lp - 1.5, 6, 3);
    ctx.fillRect(x + size - 1, y + lp - 1.5, 6, 3);
  }
  silk(ctx, "PCH", x + size/2, y + size/2 + 3, 9, "center");
}

function battery(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI*2);
  const bg3 = ctx.createRadialGradient(x-6, y-6, 2, x, y, 22);
  bg3.addColorStop(0,"#d0d0d0"); bg3.addColorStop(0.5,"#a0a0a0"); bg3.addColorStop(1,"#606060");
  ctx.fillStyle = bg3; ctx.fill();
  ctx.strokeStyle = "#888"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath(); ctx.ellipse(x-5, y-5, 10, 7, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
  ctx.fillText("CR2032", x, y + 3);
  silk(ctx, "BAT1", x, y + 30, 8, "center");
}

function ioPanel(ctx: CanvasRenderingContext2D, x: number, y: number, h: number) {
  // IO shield background
  ctx.fillStyle = "#181818"; ctx.fillRect(x, y, 50, h);
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.strokeRect(x, y, 50, h);

  // Ports stacked
  const ports = [
    { label:"VGA", h2:28, col:"#222244" },
    { label:"DVI", h2:22, col:"#222244" },
    { label:"HDMI", h2:16, col:"#111" },
    { label:"DP", h2:14, col:"#111" },
    { label:"USB3", h2:14, col:"#113399" },
    { label:"USB3", h2:14, col:"#113399" },
    { label:"LAN", h2:16, col:"#223322" },
    { label:"USB3", h2:14, col:"#113399" },
    { label:"USB3", h2:14, col:"#113399" },
    { label:"AUD", h2:12, col:"#332211" },
  ];
  let py2 = y + 8;
  for (const p of ports) {
    ctx.fillStyle = p.col; ctx.fillRect(x+3, py2, 44, p.h2);
    ctx.strokeStyle = "#444"; ctx.lineWidth = 0.5; ctx.strokeRect(x+3, py2, 44, p.h2);
    ctx.fillStyle = "rgba(200,200,200,0.6)"; ctx.font = "6px monospace"; ctx.textAlign = "center";
    ctx.fillText(p.label, x+25, py2 + p.h2/2 + 2);
    py2 += p.h2 + 4;
    if (py2 > y + h - 20) break;
  }
}

function traceH(x1: number, y: number, x2: number): Trace { return { points: [[x1,y],[x2,y]] }; }
function traceV(x: number, y1: number, y2: number): Trace { return { points: [[x,y1],[x,y2]] }; }
function traceManhattan(x1: number, y1: number, x2: number, y2: number, goHFirst = true): Trace {
  if (goHFirst) return { points: [[x1,y1],[x2,y1],[x2,y2]] };
  return { points: [[x1,y1],[x1,y2],[x2,y2]] };
}

function buildTraces(W: number, H: number) {
  traces = [];
  const s = (xp: number) => xp * W;
  const t = (yp: number) => yp * H;

  // CPU → RAM bus (DDR4 bus, parallel traces)
  const cpuRight = s(0.44), cpuTop = t(0.17);
  const ramLeft  = s(0.67), ramY   = t(0.06);
  for (let i = 0; i < 12; i++) {
    const oy = i * 5;
    traces.push({ points: [[cpuRight, cpuTop+oy],[ramLeft, cpuTop+oy],[ramLeft, ramY+oy]] });
  }

  // CPU → Chipset bus
  const cpuBot  = t(0.42), chTop = t(0.52);
  const cpuCx   = s(0.37);
  for (let i = 0; i < 8; i++) {
    const ox = i * 5;
    traces.push({ points: [[cpuCx+ox, cpuBot],[cpuCx+ox, chTop]] });
  }

  // CPU → PCIe bus (to slots below)
  const pcieY = t(0.62);
  for (let i = 0; i < 10; i++) {
    const ox = i * 6;
    traces.push({ points: [[s(0.25)+ox, cpuBot],[s(0.25)+ox, pcieY]] });
  }

  // VRM → CPU power traces (top area)
  for (let i = 0; i < 6; i++) {
    traces.push(traceH(s(0.14)+i*8, t(0.06)+i*4, s(0.28)));
    traces.push(traceManhattan(s(0.22), t(0.04)+i*6, s(0.30), t(0.15)+i*4));
  }

  // Chipset → SATA
  const chRight = s(0.56), satLeft = s(0.83);
  for (let i = 0; i < 6; i++) {
    traces.push(traceH(chRight, t(0.54)+i*7, satLeft));
  }

  // Random fill traces (dense PCB look)
  const anchors: [number,number][] = [
    [s(0.1),t(0.3)],[s(0.15),t(0.6)],[s(0.6),t(0.7)],[s(0.75),t(0.55)],
    [s(0.88),t(0.2)],[s(0.45),t(0.1)],[s(0.5),t(0.8)],[s(0.2),t(0.85)],
    [s(0.6),t(0.45)],[s(0.3),t(0.65)],[s(0.7),t(0.85)],[s(0.8),t(0.35)],
  ];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [ax,ay] = anchors[i], [bx,by] = anchors[(i+1)%anchors.length];
    traces.push(traceManhattan(ax, ay, bx, by, i%2===0));
    // Extra branches
    traces.push(traceH(ax, ay + 8, ax + (bx-ax)*0.4));
    traces.push(traceV(ax + (bx-ax)*0.4, ay + 8, ay + (by-ay)*0.5));
  }

  // USB/audio traces bottom
  for (let i = 0; i < 5; i++) {
    traces.push({ points: [[s(0.45)+i*12, t(0.88)],[s(0.45)+i*12, t(0.95)],[s(0.55)+i*8, t(0.95)]] });
    traces.push({ points: [[s(0.1)+i*15, t(0.92)],[s(0.1)+i*15, t(0.98)]] });
  }

  // IO → VRM traces
  for (let i = 0; i < 4; i++) {
    traces.push(traceH(s(0.06), t(0.12)+i*10, s(0.2)+i*8));
    traces.push(traceManhattan(s(0.06), t(0.25)+i*12, s(0.18), t(0.35)+i*8));
  }

  // 24-pin ATX → caps
  for (let i = 0; i < 5; i++) {
    traces.push(traceH(s(0.86), t(0.08)+i*12, s(0.92)));
  }

  signals = [];
  for (let i = 0; i < 28; i++) spawnSignal();
}

function spawnSignal() {
  if (!traces.length) return;
  signals.push({
    traceIdx: Math.floor(Math.random() * traces.length),
    t: 0,
    speed: 0.003 + Math.random() * 0.007,
    tail: 0.2 + Math.random() * 0.4,
    hue: Math.random() < 0.65 ? 45 + Math.random() * 20 : 140 + Math.random() * 30,
  });
}

function pointAlongTrace(trace: Trace, t: number): [number, number] {
  const pts = trace.points;
  const segs = pts.length - 1;
  const raw = t * segs;
  const i = Math.min(Math.floor(raw), segs - 1);
  const f = raw - i;
  return [pts[i][0]+(pts[i+1][0]-pts[i][0])*f, pts[i][1]+(pts[i+1][1]-pts[i][1])*f];
}

function drawStaticBoard(cvs: HTMLCanvasElement) {
  const ctx = cvs.getContext("2d")!;
  const W = cvs.width, H = cvs.height;
  ctx.clearRect(0, 0, W, H);

  const s = (xp: number) => xp * W;
  const t = (yp: number) => yp * H;

  // ── PCB substrate ─────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,   "#1e6228"); bg.addColorStop(0.3, "#236b2c");
  bg.addColorStop(0.6, "#1d5f26"); bg.addColorStop(1,   "#184f20");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Subtle fibre texture
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < H; i += 3) {
    ctx.fillStyle = i%6===0 ? "#ffffff" : "#000000";
    ctx.fillRect(0, i, W, 1.5);
  }
  ctx.globalAlpha = 1;

  // Board edge & copper pour
  ctx.strokeStyle = "rgba(200,160,0,0.5)"; ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, W-8, H-8);
  ctx.strokeStyle = "rgba(200,160,0,0.25)"; ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, W-28, H-28);

  // Mounting holes
  for (const [hx,hy] of [[28,28],[W-28,28],[28,H-28],[W-28,H-28]] as [number,number][]) {
    ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI*2);
    ctx.strokeStyle = "rgba(200,160,0,0.55)"; ctx.lineWidth = 8; ctx.stroke();
    ctx.fillStyle = "#0a1a0a"; ctx.fill();
    ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI*2);
    ctx.fillStyle = "#000"; ctx.fill();
  }

  // ── Static copper traces ──────────────────────────────────────────────────
  ctx.lineCap = "square"; ctx.lineJoin = "miter";
  ctx.strokeStyle = CU_D; ctx.lineWidth = 1.2;
  for (const trace of traces) {
    ctx.beginPath();
    ctx.moveTo(trace.points[0][0], trace.points[0][1]);
    for (let i = 1; i < trace.points.length; i++) ctx.lineTo(trace.points[i][0], trace.points[i][1]);
    ctx.stroke();
  }
  // Vias at bends
  for (const trace of traces) {
    for (let i = 1; i < trace.points.length-1; i++) via(ctx, trace.points[i][0], trace.points[i][1]);
  }

  // ── IO Panel (left edge) ──────────────────────────────────────────────────
  ioPanel(ctx, s(0.0), t(0.04), H * 0.72);
  silk(ctx, "I/O", s(0.06), t(0.78), 8, "center");

  // ── ATX 24-pin (right edge) ───────────────────────────────────────────────
  atxPower(ctx, s(0.91), t(0.04), 2, 12);
  silk(ctx, "ATX24", s(0.89), t(0.04)-8, 8);

  // ── EPS 12V (top, near CPU) ───────────────────────────────────────────────
  atxPower(ctx, s(0.19), t(0.02), 2, 4);
  silk(ctx, "ATX12V", s(0.19), t(0.02)-8, 8);

  // ── CPU Socket ───────────────────────────────────────────────────────────
  const cpuX = s(0.28), cpuY = t(0.1), cpuSz = Math.min(W,H) * 0.28;
  cpuSocket(ctx, cpuX, cpuY, cpuSz);

  // VRM MOSFETs (around CPU top and left)
  const vrmPos = [
    [s(0.14),t(0.04)],[s(0.175),t(0.04)],[s(0.21),t(0.04)],[s(0.245),t(0.04)],
    [s(0.28),t(0.04)],[s(0.315),t(0.04)],[s(0.35),t(0.04)],[s(0.385),t(0.04)],
    [s(0.14),t(0.13)],[s(0.14),t(0.18)],[s(0.14),t(0.23)],[s(0.14),t(0.28)],
  ];
  for (const [mx,my] of vrmPos) mosfet(ctx, mx, my);
  silk(ctx, "VRM", s(0.14), t(0.38), 8);

  // Capacitors around CPU
  const capPos = [
    [s(0.15),t(0.06)],[s(0.42),t(0.06)],[s(0.48),t(0.06)],[s(0.54),t(0.06)],
    [s(0.15),t(0.20)],[s(0.15),t(0.30)],[s(0.15),t(0.40)],
    [s(0.62),t(0.15)],[s(0.62),t(0.24)],[s(0.62),t(0.33)],
    [s(0.10),t(0.55)],[s(0.10),t(0.65)],[s(0.10),t(0.75)],
    [s(0.88),t(0.18)],[s(0.88),t(0.28)],[s(0.88),t(0.38)],
    [s(0.20),t(0.70)],[s(0.20),t(0.80)],[s(0.75),t(0.80)],
  ];
  for (const [cx,cy] of capPos) capacitor(ctx, cx, cy, 9);

  // Small caps (SMD)
  const smdCapPos = [
    [s(0.25),t(0.52)],[s(0.30),t(0.52)],[s(0.35),t(0.52)],
    [s(0.45),t(0.44)],[s(0.50),t(0.44)],[s(0.60),t(0.44)],
    [s(0.70),t(0.52)],[s(0.80),t(0.52)],[s(0.85),t(0.60)],
    [s(0.40),t(0.72)],[s(0.50),t(0.72)],[s(0.60),t(0.72)],
  ];
  for (const [cx,cy] of smdCapPos) capacitor(ctx, cx, cy, 5);

  // ── RAM Slots ─────────────────────────────────────────────────────────────
  const ramSlotLen = W * 0.22;
  const ramX = s(0.66), ramColors = ["#334","#334","#1a2a3a","#1a2a3a"];
  for (let r = 0; r < 4; r++) {
    const ry = t(0.04) + r * (H * 0.115);
    ctx.fillStyle = ramColors[r];
    ramSlot(ctx, ramX, ry, ramSlotLen);
    silk(ctx, `DIMM${r+1}`, ramX + ramSlotLen + 6, ry + 8, 7);
    // Pin pads on ends
    pad(ctx, ramX - 8, ry + 7); pad(ctx, ramX + ramSlotLen + 8, ry + 7);
  }
  silk(ctx, "DDR4", ramX + ramSlotLen/2, t(0.545), 8, "center");

  // ── Chipset ───────────────────────────────────────────────────────────────
  const chSz = Math.min(W,H) * 0.09;
  chipset(ctx, s(0.48), t(0.52), chSz);

  // ── PCIe Slots ────────────────────────────────────────────────────────────
  const pcieLen = W * 0.44;
  const pcieX = s(0.1);
  pcieSlot(ctx, pcieX, t(0.625), pcieLen, true);
  silk(ctx, "PCIEX16_1", pcieX, t(0.61), 7);

  pcieSlot(ctx, pcieX, t(0.695), W*0.16, false);
  silk(ctx, "PCIEX1", pcieX, t(0.683), 7);

  pcieSlot(ctx, pcieX, t(0.765), pcieLen, true);
  silk(ctx, "PCIEX16_2", pcieX, t(0.753), 7);

  pcieSlot(ctx, pcieX, t(0.835), W*0.16, false);
  pcieSlot(ctx, pcieX, t(0.875), W*0.12, false);
  pcieSlot(ctx, pcieX, t(0.915), W*0.10, false);

  // ── SATA Ports ────────────────────────────────────────────────────────────
  for (let i = 0; i < 6; i++) {
    sataPort(ctx, s(0.852), t(0.32) + i * 30);
    silk(ctx, `SATA${i}`, s(0.875), t(0.32) + i * 30 + 15, 7);
  }

  // ── M.2 Slots ─────────────────────────────────────────────────────────────
  ctx.fillStyle = "#111"; ctx.fillRect(s(0.42), t(0.615), W*0.2, 8);
  ctx.strokeStyle = CU; ctx.lineWidth = 1; ctx.strokeRect(s(0.42), t(0.615), W*0.2, 8);
  for (let i = 0; i < 20; i++) { pad(ctx, s(0.42)+8+i*10, t(0.619), 2); }
  silk(ctx, "M.2_1 (SOCKET3)", s(0.42), t(0.61)-3, 7);

  ctx.fillStyle = "#111"; ctx.fillRect(s(0.42), t(0.80), W*0.2, 8);
  ctx.strokeStyle = CU; ctx.lineWidth = 1; ctx.strokeRect(s(0.42), t(0.80), W*0.2, 8);
  for (let i = 0; i < 20; i++) { pad(ctx, s(0.42)+8+i*10, t(0.803), 2); }
  silk(ctx, "M.2_2 (SOCKET3)", s(0.42), t(0.80)-3, 7);

  // ── CMOS Battery ──────────────────────────────────────────────────────────
  battery(ctx, s(0.44), t(0.70));

  // ── Small ICs ──────────────────────────────────────────────────────────────
  smallIC(ctx, s(0.09), t(0.50), 52, 36, "NCT6793D", 14);
  smallIC(ctx, s(0.77), t(0.68), 40, 28, "ASM1142", 10);
  smallIC(ctx, s(0.42), t(0.48), 32, 22, "RTL8111", 8);
  smallIC(ctx, s(0.62), t(0.60), 28, 20, "IT8665", 8);
  smallIC(ctx, s(0.08), t(0.86), 44, 30, "ALC887", 12);

  // ── Fan headers ────────────────────────────────────────────────────────────
  const fanH: [number, number, string][] = [
    [s(0.35),t(0.02),"CPU_FAN"],[s(0.55),t(0.02),"SYS_FAN1"],
    [s(0.65),t(0.02),"SYS_FAN2"],[s(0.89),t(0.56),"CHA_FAN"],
    [s(0.07),t(0.62),"AIO_PUMP"],
  ];
  for (const [fx, fy, fl] of fanH) {
    atxPower(ctx, fx, fy, 1, 4);
    silk(ctx, fl, fx, fy - 4, 7);
  }

  // ── USB/Front panel headers ──────────────────────────────────────────────
  const hdrs: [number, number, number, number, string][] = [
    [s(0.10),t(0.94),20,10,"USB2_34"],[s(0.22),t(0.94),20,10,"USB2_56"],
    [s(0.75),t(0.94),20,10,"USB3_910"],[s(0.54),t(0.94),14,10,"F_PANEL"],
  ];
  for (const [hx, hy, hw, hh, hl] of hdrs) {
    ctx.fillStyle="#111"; ctx.fillRect(hx, hy, hw, hh);
    ctx.strokeStyle="#444"; ctx.lineWidth=0.8; ctx.strokeRect(hx, hy, hw, hh);
    for (let r=0;r<2;r++) for (let c=0;c<Math.floor(hw/5);c++) {
      pad(ctx, hx+4+c*5, hy+3+r*5, 1.8);
    }
    silk(ctx, hl, hx, hy - 4, 7);
  }

  // ── Silkscreen text labels ────────────────────────────────────────────────
  ctx.fillStyle = "rgba(235,235,235,0.6)"; ctx.font = "bold 24px monospace"; ctx.textAlign = "center";
  ctx.fillText("PRIME B250M-C", s(0.45), t(0.59));
  ctx.fillStyle = "rgba(235,235,235,0.35)"; ctx.font = "14px monospace";
  ctx.fillText("REV. 1.01", s(0.52), t(0.61));

  // PCB info top
  silk(ctx, "PCB MADE IN CHINA", s(0.3), t(0.01), 8, "center");
  silk(ctx, "E148299", s(0.38), t(0.035), 7, "center");
  silk(ctx, "FCC  CE  RCM", s(0.1), t(0.5), 8, "center");
  silk(ctx, "CAN ICES-3(B)/NMB-3(B)", s(0.64), t(0.73), 7, "center");

  // Resistor networks (arrays of tiny SMD)
  for (const [rx,ry] of [[s(0.25),t(0.08)],[s(0.55),t(0.08)],[s(0.20),t(0.46)],[s(0.65),t(0.46)],[s(0.30),t(0.84)]] as [number,number][]) {
    for (let i=0;i<4;i++) {
      ctx.fillStyle="#2a1a08"; ctx.fillRect(rx+i*10,ry,8,5);
      ctx.fillStyle=PAD; ctx.fillRect(rx+i*10-2,ry,3,5); ctx.fillRect(rx+i*10+7,ry,3,5);
    }
  }

  // Extra scattered pads / test points
  for (let i=0;i<30;i++) {
    const tp_x = s(0.08+Math.sin(i*1.7)*0.8*0.9), tp_y = t(0.05+Math.cos(i*2.3)*0.4+0.45);
    pad(ctx, tp_x, tp_y, 2);
  }
}

function drawCircuit() {
  const cvs = canvas.value;
  if (!cvs || !staticCanvas) return;
  const ctx = cvs.getContext("2d");
  if (!ctx) return;
  const w = cvs.width, h = cvs.height;

  // Blit static board
  ctx.drawImage(staticCanvas, 0, 0);

  // Animate signals
  for (let i = signals.length - 1; i >= 0; i--) {
    const sig = signals[i];
    const trace = traces[sig.traceIdx];
    if (!trace || trace.points.length < 2) { signals.splice(i, 1); spawnSignal(); continue; }

    sig.t += sig.speed;
    if (sig.t > 1 + sig.tail) { signals.splice(i, 1); spawnSignal(); continue; }

    const tHead = Math.min(sig.t, 1);
    const tTail = Math.max(0, sig.t - sig.tail);
    const [hx, hy] = pointAlongTrace(trace, tHead);
    const [tx, ty] = pointAlongTrace(trace, tTail);

    // Glow tail
    const grad = ctx.createLinearGradient(tx, ty, hx, hy);
    grad.addColorStop(0, `hsla(${sig.hue},100%,60%,0)`);
    grad.addColorStop(1, `hsla(${sig.hue},100%,75%,0.95)`);

    ctx.beginPath();
    ctx.moveTo(tx, ty);
    const steps = 16;
    for (let s = 1; s <= steps; s++) {
      const st = tTail + (tHead - tTail) * (s / steps);
      const [sx, sy] = pointAlongTrace(trace, st);
      ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.shadowBlur = 10;
    ctx.shadowColor = `hsla(${sig.hue},100%,70%,0.9)`;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Head dot glow
    if (tHead < 1) {
      ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${sig.hue},100%,92%,1)`;
      ctx.shadowBlur = 16;
      ctx.shadowColor = `hsla(${sig.hue},100%,70%,1)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  circuitRaf = requestAnimationFrame(drawCircuit);
}

function initCircuit() {
  const cvs = canvas.value;
  if (!cvs) return;
  cvs.width = window.innerWidth;
  cvs.height = window.innerHeight;

  // Off-screen canvas for static board (drawn once)
  staticCanvas = document.createElement("canvas");
  staticCanvas.width = cvs.width;
  staticCanvas.height = cvs.height;

  buildTraces(cvs.width, cvs.height);
  drawStaticBoard(staticCanvas);
  drawCircuit();
}

const onMove = (e: PointerEvent) => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  pointer.value = {
    nx: (e.clientX / w) * 2 - 1,
    ny: (e.clientY / h) * 2 - 1
  };
};

const tick = () => {
  if (!running || diving.value) return;

  const { nx, ny } = pointer.value;

  const cam = root.value?.querySelector(".cam") as HTMLElement | null;
  const screen = root.value?.querySelector(
    ".screenInner"
  ) as HTMLElement | null;

  const glare = root.value?.querySelector(".glare") as HTMLElement | null;

  const desk = root.value?.querySelector(".desk") as HTMLElement | null;

  const cup = root.value?.querySelector(".cup") as HTMLElement | null;

  const keyboard = root.value?.querySelector(".keyboard") as HTMLElement | null;
  const mouse = root.value?.querySelector(".mouse") as HTMLElement | null;
  const cat   = root.value?.querySelector(".cat")   as HTMLElement | null;

  if (cam) {
    cam.style.transform =
      `translateX(-50%) translate3d(${nx * 10}px, ${ny * 8}px, 0) scale(0.96)`;
  }

  if (screen) {
    screen.style.transform =
      `translate3d(${nx * 6}px, ${ny * 5}px, 0)`;
  }

  if (glare) {
    glare.style.opacity = "0.24";

    glare.style.transform =
      `translate3d(${nx * 18}px, ${ny * 12}px, 0)`;
  }

  if (desk) {
    desk.style.transform =
      `translate3d(${nx * 8}px, ${ny * 6}px, 0)`;
  }

  if (cup) {
    cup.style.transform =
      `translate3d(${nx * 12}px, ${ny * 8}px, 0)`;
  }

  if (keyboard) {
    keyboard.style.transform =
      `translate3d(${nx * 9}px, ${ny * 6}px, 0)`;
  }

  if (mouse) {
    mouse.style.transform =
      `translate3d(${nx * 11}px, ${ny * 7}px, 0)`;
  }

  if (cat) {
    cat.style.transform =
      `translate3d(${nx * 13}px, ${ny * 8}px, 0)`;
  }

  raf = requestAnimationFrame(tick);
};

const enterDesktop = () => {
  if (diving.value) return;

  diving.value = true;
  running = false;

  const cam = root.value?.querySelector(".cam") as HTMLElement | null;

  const wrap = root.value;

  gsap
    .timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => emit("done")
    })
    .to(cam, { scale: 1.2, duration: 1.05 })
    .to(wrap, { opacity: 0, duration: 0.35 }, "-=0.15");
};

onMounted(() => {
  window.addEventListener("pointermove", onMove, { passive: true });
  raf = requestAnimationFrame(tick);
  initCircuit();
});

onUnmounted(() => {
  running = false;
  cancelAnimationFrame(raf);
  cancelAnimationFrame(circuitRaf);
  window.removeEventListener("pointermove", onMove);
});
</script>

<template>
  <div class="wrap" ref="root">
    <canvas class="circuit-bg" ref="canvas"></canvas>
    <LocaleSwitcher />
    <ClippyHelper />

    <div class="scene">
      <div class="stage">
        <div class="desk" aria-hidden="true"></div>

        <div class="cam">
          <div class="bezel">
            <button
              class="screen"
              type="button"
              :disabled="diving"
              @click="enterDesktop"
              :aria-label="t.intro.cta"
            >
              <div class="screenInner">
                <div class="screenBg"></div>

                <div class="glare"></div>

                <span class="hint">
                  {{ diving ? t.intro.powering : t.intro.cta }}
                </span>
              </div>
            </button>
          </div>

          <div class="stand"></div>
        </div>

        <div class="keyboard" aria-hidden="true">
          <div class="kb-row kb-row--fn">
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span>
          </div>
          <div class="kb-row kb-row--num">
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="kb-row kb-row--qwerty">
            <span class="kb-key--tab"></span>
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span>
          </div>
          <div class="kb-row kb-row--asdf">
            <span class="kb-key--caps"></span>
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span>
            <span></span><span class="kb-key--enter"></span>
          </div>
          <div class="kb-row kb-row--zxcv">
            <span class="kb-key--shift"></span>
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span class="kb-key--shift-r"></span>
          </div>
          <div class="kb-row kb-row--bottom">
            <span class="kb-key--ctrl"></span>
            <span class="kb-key--alt"></span>
            <span class="kb-key--space"></span>
            <span class="kb-key--alt"></span>
            <span class="kb-key--ctrl"></span>
          </div>
        </div>

        <div class="mouse" aria-hidden="true">
          <div class="mouse-btn mouse-btn--left"></div>
          <div class="mouse-btn mouse-btn--right"></div>
          <div class="mouse-wheel"></div>
        </div>

        <div class="cat" aria-hidden="true">
          <svg class="cat-svg" viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg">
            <!-- Pillow -->
            <ellipse cx="82" cy="90" rx="68" ry="18" fill="#c8940a" stroke="#7a5500" stroke-width="2.2"/>
            <ellipse cx="82" cy="88" rx="62" ry="13" fill="#e0a820"/>
            <!-- Pillow corners -->
            <ellipse cx="22" cy="92" rx="10" ry="7" fill="#c8940a" stroke="#7a5500" stroke-width="1.8" transform="rotate(-20 22 92)"/>
            <ellipse cx="142" cy="92" rx="10" ry="7" fill="#c8940a" stroke="#7a5500" stroke-width="1.8" transform="rotate(20 142 92)"/>
            <!-- Pillow shine -->
            <ellipse cx="60" cy="84" rx="14" ry="5" fill="rgba(255,220,100,0.35)" transform="rotate(-10 60 84)"/>

            <!-- Body (curled up) -->
            <ellipse cx="95" cy="72" rx="48" ry="28" fill="#888" stroke="#3a2a4a" stroke-width="2.2"/>
            <!-- Body stripes -->
            <path d="M80 48 Q88 56 82 66" stroke="#5a5a5a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M92 46 Q100 54 96 65" stroke="#5a5a5a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M104 50 Q110 58 108 68" stroke="#5a5a5a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M115 56 Q120 64 118 74" stroke="#5a5a5a" stroke-width="2.5" fill="none" stroke-linecap="round"/>

            <!-- Tail -->
            <path d="M138 80 Q152 70 148 86 Q144 96 134 90" fill="#888" stroke="#3a2a4a" stroke-width="2" stroke-linejoin="round"/>
            <!-- Tail stripe -->
            <path d="M141 78 Q150 72 148 82" stroke="#5a5a5a" stroke-width="2" fill="none" stroke-linecap="round"/>

            <!-- Head -->
            <ellipse cx="52" cy="62" rx="32" ry="28" fill="#888" stroke="#3a2a4a" stroke-width="2.2"/>
            <!-- Head stripes -->
            <path d="M36 42 Q40 52 38 60" stroke="#5a5a5a" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M46 38 Q50 48 48 58" stroke="#5a5a5a" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M56 38 Q60 48 58 58" stroke="#5a5a5a" stroke-width="2" fill="none" stroke-linecap="round"/>

            <!-- Ears -->
            <polygon points="28,42 20,20 42,34" fill="#888" stroke="#3a2a4a" stroke-width="2" stroke-linejoin="round"/>
            <polygon points="28,40 23,25 38,33" fill="#e8a0a0"/>
            <polygon points="62,38 70,18 78,34" fill="#888" stroke="#3a2a4a" stroke-width="2" stroke-linejoin="round"/>
            <polygon points="64,38 70,22 76,34" fill="#e8a0a0"/>

            <!-- White muzzle -->
            <ellipse cx="50" cy="72" rx="18" ry="14" fill="#e8e8e0" stroke="#3a2a4a" stroke-width="1.5"/>

            <!-- Eyes closed -->
            <path d="M36 57 Q42 53 48 57" stroke="#3a2a4a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
            <path d="M56 58 Q62 54 68 58" stroke="#3a2a4a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
            <!-- Eyelash bottom -->
            <path d="M36 58 Q42 62 48 58" stroke="#3a2a4a" stroke-width="1" fill="rgba(58,42,74,0.3)" stroke-linecap="round"/>
            <path d="M56 59 Q62 63 68 59" stroke="#3a2a4a" stroke-width="1" fill="rgba(58,42,74,0.3)" stroke-linecap="round"/>

            <!-- Nose -->
            <path d="M47 69 L50 66 L53 69 Q50 72 47 69Z" fill="#c87890" stroke="#3a2a4a" stroke-width="0.8"/>
            <!-- Mouth -->
            <path d="M50 71 Q46 76 42 74" stroke="#3a2a4a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <path d="M50 71 Q54 76 58 74" stroke="#3a2a4a" stroke-width="1.5" fill="none" stroke-linecap="round"/>

            <!-- Front paw -->
            <ellipse cx="38" cy="86" rx="14" ry="7" fill="#999" stroke="#3a2a4a" stroke-width="1.8"/>
            <ellipse cx="30" cy="87" rx="5" ry="4" fill="#e8e8e0" stroke="#3a2a4a" stroke-width="1.2"/>
            <!-- Paw toes -->
            <ellipse cx="37" cy="91" rx="4" ry="3" fill="#e8e8e0" stroke="#3a2a4a" stroke-width="1"/>
            <ellipse cx="45" cy="90" rx="4" ry="3" fill="#e8e8e0" stroke="#3a2a4a" stroke-width="1"/>
          </svg>

          <!-- ZZZ floating outside SVG so they can animate freely -->
          <span class="cat-z cat-z--1">z</span>
          <span class="cat-z cat-z--2">z</span>
          <span class="cat-z cat-z--3">Z</span>
        </div>

        <div class="cup" aria-hidden="true">
          <div class="steam" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="vignette"></div>
  </div>
</template>

<style scoped>
.wrap {
  position: fixed;
  inset: 0;
  background: #1a5520;
  perspective: 900px;
  overflow: hidden;
}

.circuit-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.85;
}

.callout {
  position: absolute;
  left: 24px;
  top: 24px;
  z-index: 5;
  max-width: min(440px, 90vw);
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 12, 18, 0.55);
  backdrop-filter: blur(14px);
}

.callout-close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 150ms, background 150ms;
}

.callout-close:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

h1 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.sub {
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.45;
  font-size: 14px;
}

.detail {
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 13px;
  line-height: 1.5;
}

.cta {
  margin: 0;
  font-size: 12px;
  color: rgba(120, 200, 255, 0.9);
  letter-spacing: 0.02em;
}

.scene {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 5vh;
  position: relative;
  z-index: 1;
}

/* One box: desk + monitor + cup share the same coordinates */
.stage {
  position: relative;
  width: min(1100px, 94vw);
  height: min(480px, 52vh);
}

.desk {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 42%;
  border-radius: 18px;
  background:
    radial-gradient(
      900px 220px at 50% 0%,
      rgba(255, 220, 170, 0.22),
      transparent 60%
    ),
    linear-gradient(90deg, #4a2f1a, #7a4e2b, #5b3a20);
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.75);
  z-index: 1;
  will-change: transform;
}

.cam {
  position: absolute;
  left: 50%;
  bottom: 34%;
  width: 92%;
  z-index: 3;
  transform: translateX(-50%);
  transform-style: preserve-3d;
  will-change: transform;
}

.bezel {
  border-radius: 18px;
  padding: 14px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1),
    rgba(0, 0, 0, 0.55)
  );

  border: 1px solid rgba(255, 255, 255, 0.1);

  box-shadow: 0 50px 140px rgba(0, 0, 0, 0.75);
}

.screen {
  position: relative;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 21 / 9;
  cursor: pointer;
  background: #02030a;
  transition: box-shadow 200ms ease;
}

.screen:hover:not(:disabled) {
  box-shadow:
    0 0 0 2px rgba(120, 200, 255, 0.35),
    0 0 40px rgba(120, 200, 255, 0.15);
}

.screen:disabled {
  cursor: wait;
}

.screenInner {
  position: absolute;
  inset: 0;
  will-change: transform;
}

.screenBg {
  position: absolute;
  inset: 0;
  background-color: #008080;
  background-image: url("/windows98-flag.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.glare {
  position: absolute;
  inset: -30%;
  background: linear-gradient(
    115deg,
    transparent 42%,
    rgba(255, 255, 255, 0.2),
    transparent 58%
  );

  mix-blend-mode: screen;
  pointer-events: none;
}

.hint {
  position: absolute;
  left: 16px;
  bottom: 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.65);
  pointer-events: none;
}

.stand {
  margin: 10px auto 0;
  width: min(360px, 55vw);
  height: 18px;
  border-radius: 10px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1),
    rgba(0, 0, 0, 0.55)
  );

  border: 1px solid rgba(255, 255, 255, 0.08);
}

.keyboard {
  position: absolute;
  left: 31%;
  bottom: 6%;
  transform: translateX(-50%);
  width: min(360px, 46vw);
  z-index: 2;
  border-radius: 8px 8px 12px 12px;
  background: linear-gradient(180deg, #1a3d1a 0%, #0f2610 100%);
  border: 1px solid rgba(80, 200, 80, 0.35);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.65),
    0 0 20px rgba(40, 160, 40, 0.15),
    inset 0 1px 0 rgba(120, 255, 120, 0.12);
  padding: 7px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  will-change: transform;
}

.kb-row {
  display: flex;
  gap: 3px;
  align-items: center;
}

.kb-row span,
.kb-row [class^="kb-key--"] {
  display: block;
  flex: 1;
  height: 11px;
  border-radius: 2px;
  background: linear-gradient(180deg, #2a5c2a, #1a3a1a);
  border: 1px solid rgba(80, 200, 80, 0.25);
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(120, 255, 120, 0.1);
}

.kb-row--fn span { height: 9px; }

.kb-key--tab    { flex: 1.6; }
.kb-key--caps   { flex: 1.8; }
.kb-key--enter  { flex: 1.9; }
.kb-key--shift  { flex: 2.2; }
.kb-key--shift-r { flex: 2.6; }
.kb-key--ctrl   { flex: 1.4; }
.kb-key--alt    { flex: 1.2; }
.kb-key--space  { flex: 5; }

.mouse {
  position: absolute;
  left: calc(50% + min(195px, 25vw));
  bottom: 6%;
  transform: none;
  width: min(44px, 5.5vw);
  height: min(66px, 8vh);
  z-index: 2;
  border-radius: 22px 22px 18px 18px;
  background: linear-gradient(180deg, #2a2a2a, #111);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1);
  overflow: hidden;
  will-change: transform;
}

.mouse-btn {
  position: absolute;
  top: 0;
  height: 44%;
  width: 46%;
  background: linear-gradient(180deg, #3a3a3a, #222);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mouse-btn--left  { left: 0; border-right: 1px solid rgba(255,255,255,0.08); border-radius: 22px 0 0 0; }
.mouse-btn--right { right: 0; border-radius: 0 22px 0 0; }

.mouse-wheel {
  position: absolute;
  left: 50%;
  top: 18%;
  transform: translateX(-50%);
  width: 6px;
  height: 14px;
  border-radius: 3px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.1);
}

.cat {
  position: absolute;
  left: calc(50% + min(255px, 33vw));
  bottom: 6%;
  z-index: 3;
  width: min(290px, 36vw);
  will-change: transform;
}

.cat-svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,0.55));
  animation: cat-breathe 3.4s ease-in-out infinite;
  transform-origin: center 80%;
}

.cat-z {
  position: absolute;
  font-weight: 800;
  font-family: monospace;
  color: #fff;
  text-shadow: 0 0 10px rgba(180,210,255,0.8);
  animation: zzz-float 3s ease-in-out infinite;
  pointer-events: none;
}

.cat-z--1 {
  font-size: min(10px, 1.4vw);
  bottom: 72%;
  left: 4%;
  animation-delay: 0s;
}

.cat-z--2 {
  font-size: min(13px, 1.8vw);
  bottom: 82%;
  left: 10%;
  animation-delay: 0.7s;
}

.cat-z--3 {
  font-size: min(17px, 2.3vw);
  bottom: 94%;
  left: 2%;
  animation-delay: 1.4s;
}

@keyframes cat-breathe {
  0%, 100% { transform: scaleY(1) scaleX(1);       }
  50%       { transform: scaleY(1.04) scaleX(1.01); }
}

@keyframes zzz-float {
  0%   { transform: translate(0, 0)       scale(0.7); opacity: 0;   }
  15%  { opacity: 1; }
  85%  { opacity: 0.9; }
  100% { transform: translate(-10px, -26px) scale(1.15); opacity: 0; }
}

.cup {
  position: absolute;
  left: 10%;
  bottom: 22%;
  width: 56px;
  height: 46px;
  z-index: 4;
  border-radius: 10px 10px 14px 14px;

  background: linear-gradient(180deg, #cc2222, #8b0000);

  border: 1px solid rgba(255, 100, 100, 0.5);

  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.6), 0 0 18px rgba(200, 30, 30, 0.3);

  will-change: transform;
}

/* optional: saucer under cup */
.cup::after {
  content: "";
  position: absolute;
  left: -8px;
  bottom: -6px;
  width: 72px;
  height: 10px;
  border-radius: 50%;
  background: #6b1010;
  border: 1px solid rgba(200, 60, 60, 0.4);
}

.steam {
  position: absolute;
  left: 18px;
  top: -34px;
  width: 30px;
  height: 40px;
}

.steam span {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.18);
  animation: steam 2.8s ease-in-out infinite;
}

.steam span:nth-child(1) {
  left: 2px;
  animation-delay: 0s;
}

.steam span:nth-child(2) {
  left: 12px;
  opacity: 0.75;
  animation-delay: 0.35s;
}

.steam span:nth-child(3) {
  left: 20px;
  opacity: 0.55;
  animation-delay: 0.7s;
}

@keyframes steam {
  0% {
    transform: translateY(10px) scale(0.85);
    opacity: 0;
  }

  20% {
    opacity: 0.55;
  }

  100% {
    transform: translateY(-34px) scale(1.25);
    opacity: 0;
  }
}

.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;

  background: radial-gradient(
    circle at 50% 45%,
    transparent 40%,
    rgba(0, 0, 0, 0.55) 100%
  );
}
</style>