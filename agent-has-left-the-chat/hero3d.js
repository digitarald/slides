/*
  Title-slide hero: a single agent session breaks out of a chat window,
  becomes one of several sessions on an agent host, and clients (including
  the chat) connect to it from orbit. Plain canvas 2D with a small 3D
  projection; no dependencies. The breakout plays once on entry; the orbit
  loops while the slide is visible. Reduced motion, print, and the notes
  page get a single settled frame.
*/
(() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (v) => 1 - Math.pow(1 - clamp(v), 3);
  const easeInOut = (v) => { v = clamp(v); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
  const lerp = (a, b, k) => a + (b - a) * k;
  const lerp3 = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) });
  const frac = (v) => v - Math.floor(v);
  const rng = (seed) => () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

  const MINT = [79, 214, 195];
  const BLUE = [74, 163, 255];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a)})`;
  const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

  const W = 1600, H = 900, CX = 1085, CY = 455, F = 1450, D = 1500;
  const WIN = { w: 440, h: 320 };
  const IMPACT = { x: 70, y: -58 };
  const BREAK = 1.55;
  const STATIC_T = 7.4;
  // Looping: scene time runs at SLOW x real time. Each cycle builds the scene,
  // holds the orbit, fades out from OUT0 to OUT1, and restarts at CYCLE.
  const SLOW = 0.6;
  const OUT0 = 13, OUT1 = 14.6, CYCLE = 15.2;
  let FADE = 1;
  const outro = (t) => easeInOut(seg(t, OUT0, OUT1));
  const HOST_R = 150;
  const CLIENT_R = 378;
  const RING_TILT = 0.14;

  const CLIENTS = [
    { name: 'Chat', kind: 'chat', y: 0 },
    { name: 'VS Code', kind: 'code', y: 0 },
    { name: 'Agents window', kind: 'grid', y: 0 },
    { name: 'Phone', kind: 'phone', y: 0 },
    { name: 'Browser', kind: 'browser', y: 0 },
    { name: 'Game', kind: 'game', y: 0 }
  ];
  const SESSIONS = ['Copilot', 'Claude', 'Codex'];

  /* ------------------------------------------------- Fixed geometry */
  const SCENE = (() => {
    const r = rng(11);
    const stars = Array.from({ length: 260 }, () => {
      const u = r() * 2 - 1, th = r() * TAU, rad = 700 + r() * 900, s = Math.sqrt(1 - u * u);
      return { x: rad * s * Math.cos(th), y: rad * u * 0.55, z: rad * s * Math.sin(th), a: 0.12 + r() * 0.4 };
    });
    const cols = 7, rows = 5, grid = [];
    for (let j = 0; j <= rows; j++) {
      grid[j] = [];
      for (let i = 0; i <= cols; i++) {
        let x = -WIN.w / 2 + (i * WIN.w) / cols, y = -WIN.h / 2 + (j * WIN.h) / rows;
        if (i > 0 && i < cols) x += (r() - 0.5) * 38;
        if (j > 0 && j < rows) y += (r() - 0.5) * 30;
        grid[j][i] = { x, y };
      }
    }
    const shards = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], d = grid[j + 1][i];
        const tris = (i + j) % 2 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
        for (const tri of tris) {
          const cx = (tri[0].x + tri[1].x + tri[2].x) / 3, cy = (tri[0].y + tri[1].y + tri[2].y) / 3;
          let dx = cx - IMPACT.x, dy = cy - IMPACT.y;
          const len = Math.hypot(dx, dy) || 1;
          dx /= len; dy /= len;
          const near = 1 - clamp(len / 330);
          const sp = 320 + r() * 420;
          shards.push({
            c: { x: cx, y: cy },
            pts: tri.map((p) => ({ x: p.x - cx, y: p.y - cy })),
            v: { x: dx * sp, y: dy * sp + 70, z: -(180 + r() * 380 + near * 420) },
            rx: (r() - 0.5) * 7, ry: (r() - 0.5) * 7,
            delay: (1 - near) * 0.14 + r() * 0.05,
            glint: r() < 0.25
          });
        }
      }
    }
    const cracks = Array.from({ length: 9 }, (_, k) => {
      const ang = (k / 9) * TAU + r() * 0.5;
      const pts = [{ ...IMPACT }];
      let x = IMPACT.x, y = IMPACT.y;
      const n = 5 + Math.floor(r() * 3);
      for (let s = 0; s < n; s++) {
        const a = ang + (r() - 0.5) * 0.9, l = 20 + r() * 36;
        x = clamp(x + Math.cos(a) * l, -WIN.w / 2, WIN.w / 2);
        y = clamp(y + Math.sin(a) * l, -WIN.h / 2, WIN.h / 2);
        pts.push({ x, y });
      }
      return pts;
    });
    return { stars, shards, cracks };
  })();

  /* --------------------------------------------------------- Camera */
  const camera = (t) => {
    const turn = easeInOut(seg(t, 2.0, 4.4));
    const ramp = t < 3 ? 0 : t < 5 ? ((t - 3) ** 2) / 4 : 1 + (t - 5);
    return { yaw: -0.24 + turn * 0.6 + ramp * 0.12, pitch: 0.06 + turn * 0.5 };
  };
  const project = (p, cam) => {
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    const x = p.x * cy - p.z * sy;
    let z = p.x * sy + p.z * cy;
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    const y = p.y * cp - z * sp;
    z = p.y * sp + z * cp;
    const k = F / (z + D);
    return { x: CX + x * k, y: CY - y * k, k, z };
  };
  const depthAlpha = (z) => clamp(1.15 - (z + 450) / 1000, 0.35, 1);

  /* ---------------------------------------------------------- World */
  const corePos = (t) => {
    const start = { x: IMPACT.x, y: IMPACT.y, z: -14 * seg(t, 0.6, BREAK) };
    return lerp3(start, { x: 0, y: 0, z: 0 }, easeInOut(seg(t, BREAK, 2.7)));
  };
  const sessionPos = (i, t) => {
    const a = (i * TAU) / 3 + t * 0.65;
    const r = 98 * ease(seg(t, 2.6, 3.7));
    const orbit = { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.42, z: Math.sin(a) * r };
    return i === 0 ? lerp3(corePos(t), orbit, ease(seg(t, 2.6, 3.7))) : orbit;
  };
  const clientPos = (i, t) => {
    const c = CLIENTS[i];
    const a = (i * TAU) / CLIENTS.length + 0.55;
    const k = ease(seg(t, 3.2 + i * 0.16, 4.3 + i * 0.16));
    const flat = { x: Math.cos(a) * CLIENT_R, y: c.y, z: Math.sin(a) * CLIENT_R };
    const slot = { x: flat.x * Math.cos(RING_TILT) - flat.y * Math.sin(RING_TILT), y: flat.x * Math.sin(RING_TILT) + flat.y * Math.cos(RING_TILT), z: flat.z };
    // The chat window re-forms where it shattered and drifts out to become a client.
    const from = i === 0 ? { x: 0, y: 0, z: 0 } : { x: slot.x * 1.12, y: slot.y * 1.12 - 60, z: slot.z * 1.12 };
    const drift = 1 + 0.2 * outro(t);
    return { pos: { x: lerp(from.x, slot.x, k) * drift, y: lerp(from.y, slot.y, k) * drift, z: lerp(from.z, slot.z, k) * drift }, alpha: k };
  };

  /* ----------------------------------------------------- Primitives */
  const poly = (ctx, pts) => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
  };
  const rrect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  };
  const glow = (ctx, x, y, r, c, a) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(c, a));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  const orb = (ctx, p, radius, c, a, label) => {
    const r = radius * p.k;
    glow(ctx, p.x, p.y, r * 3.4, c, 0.32 * a);
    const g = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.35, r * 0.1, p.x, p.y, r);
    g.addColorStop(0, `rgba(230,255,251,${a})`);
    g.addColorStop(0.45, rgba(c, a));
    g.addColorStop(1, rgba(c.map((v) => v * 0.45), a));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, TAU);
    ctx.fill();
    if (label) {
      ctx.font = `600 ${Math.round(18 * p.k)}px ${SANS}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(MINT, a * 0.95);
      ctx.fillText(label, p.x, p.y + r + 22 * p.k);
    }
  };

  /* ---------------------------------------------------------- Parts */
  const drawWindow = (ctx, cam, t) => {
    const a = ease(seg(t, 0, 0.5));
    const P = (x, y) => project({ x, y, z: 0 }, cam);
    const corners = [P(-WIN.w / 2, WIN.h / 2), P(WIN.w / 2, WIN.h / 2), P(WIN.w / 2, -WIN.h / 2), P(-WIN.w / 2, -WIN.h / 2)];
    poly(ctx, corners);
    ctx.fillStyle = `rgba(14,21,31,${0.94 * a})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(96,118,145,${a})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const bar = [P(-WIN.w / 2, WIN.h / 2 - 42), P(WIN.w / 2, WIN.h / 2 - 42)];
    ctx.beginPath(); ctx.moveTo(bar[0].x, bar[0].y); ctx.lineTo(bar[1].x, bar[1].y);
    ctx.strokeStyle = `rgba(52,70,92,${a})`; ctx.stroke();
    [22, 40, 58].forEach((o) => {
      const d = P(-WIN.w / 2 + o, WIN.h / 2 - 21);
      ctx.fillStyle = `rgba(80,98,120,${a})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 4.5 * d.k, 0, TAU); ctx.fill();
    });
    const title = P(0, WIN.h / 2 - 28);
    ctx.font = `500 ${Math.round(17 * title.k)}px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(169,180,194,${a})`;
    ctx.fillText('Chat', title.x, title.y);
    const bubbles = [[-180, 82, 250, 30, [40, 52, 68]], [-10, 38, 190, 30, [27, 66, 112]], [-180, -6, 170, 30, [40, 52, 68]]];
    bubbles.forEach(([x, y, w, h, c]) => {
      poly(ctx, [P(x, y), P(x + w, y), P(x + w, y - h), P(x, y - h)]);
      ctx.fillStyle = rgba(c, a);
      ctx.fill();
    });
    const pc = seg(t, 0.95, 1.5);
    if (pc > 0) {
      ctx.lineCap = 'round';
      SCENE.cracks.forEach((pts) => {
        const n = (pts.length - 1) * pc;
        ctx.beginPath();
        for (let s = 0; s <= Math.ceil(n); s++) {
          const i = Math.min(s, pts.length - 1);
          let q = pts[i];
          if (s > n && i > 0) q = { x: lerp(pts[i - 1].x, pts[i].x, n - (s - 1)), y: lerp(pts[i - 1].y, pts[i].y, n - (s - 1)) };
          const p = P(q.x, q.y);
          s ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
        }
        ctx.strokeStyle = rgba(MINT, 0.25 + pc * 0.6);
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.strokeStyle = `rgba(225,255,250,${0.5 * pc})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    }
    const lp = P(IMPACT.x, IMPACT.y - 46);
    ctx.font = `600 ${Math.round(20 * lp.k)}px ${SANS}`;
    ctx.fillStyle = rgba(MINT, a);
    ctx.fillText('Agent session', lp.x, lp.y);
  };

  const shardItems = (cam, t) => {
    const out = [];
    for (const s of SCENE.shards) {
      const u = t - BREAK - s.delay;
      if (u < 0) continue;
      const alpha = 1 - seg(u, 0.25, 1.5);
      if (alpha <= 0) continue;
      const travel = (1 - Math.exp(-2.1 * u)) / 2.1;
      const pos = { x: s.c.x + s.v.x * travel, y: s.c.y + s.v.y * travel - 90 * u * u, z: s.v.z * travel };
      const ax = s.rx * u, ay = s.ry * u;
      const pts = s.pts.map((p) => {
        const y1 = p.y * Math.cos(ax), z1 = p.y * Math.sin(ax);
        const x2 = p.x * Math.cos(ay) + z1 * Math.sin(ay), z2 = -p.x * Math.sin(ay) + z1 * Math.cos(ay);
        return project({ x: pos.x + x2, y: pos.y + y1, z: pos.z + z2 }, cam);
      });
      const z = (pts[0].z + pts[1].z + pts[2].z) / 3;
      out.push({ z, draw: (ctx) => {
        poly(ctx, pts);
        ctx.fillStyle = `rgba(16,25,38,${0.88 * alpha})`;
        ctx.fill();
        ctx.strokeStyle = s.glint ? rgba(MINT, 0.85 * alpha) : `rgba(130,175,230,${0.5 * alpha})`;
        ctx.lineWidth = s.glint ? 1.6 : 1;
        ctx.stroke();
      } });
    }
    return out;
  };

  const drawShockwave = (ctx, cam, t) => {
    const u = seg(t, BREAK, BREAK + 0.75);
    if (u <= 0 || u >= 1) return;
    const c = project({ x: IMPACT.x, y: IMPACT.y, z: 0 }, cam);
    glow(ctx, c.x, c.y, 180 * (1 - u) + 40, [225, 255, 250], 0.75 * (1 - u));
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 40 + 300 * ease(u), (40 + 300 * ease(u)) * 0.82, 0, 0, TAU);
    ctx.strokeStyle = rgba(MINT, 0.6 * (1 - u));
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  const hostItems = (cam, t) => {
    const a = ease(seg(t, 2.3, 3.3));
    if (a <= 0) return [];
    const items = [];
    const center = project({ x: 0, y: 0, z: 0 }, cam);
    items.push({ z: 400, draw: (ctx) => glow(ctx, center.x, center.y, 260 * center.k, BLUE, 0.22 * a) });
    const tilts = [0, 1.05, -1.05];
    tilts.forEach((tilt, k) => {
      const spin = t * (0.22 + k * 0.08);
      let prev = null;
      for (let i = 0; i <= 72; i++) {
        const th = (i / 72) * TAU + spin;
        const x = Math.cos(th) * HOST_R, z0 = Math.sin(th) * HOST_R;
        const p = project({ x, y: z0 * Math.sin(tilt), z: z0 * Math.cos(tilt) }, cam);
        if (prev) {
          const q = prev;
          const z = (p.z + q.z) / 2;
          items.push({ z, draw: (ctx) => {
            ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = rgba(BLUE, a * depthAlpha(z) * 0.85);
            ctx.lineWidth = 2 * p.k;
            ctx.stroke();
          } });
        }
        prev = p;
      }
    });
    const lbl = project({ x: 0, y: -HOST_R - 40, z: 0 }, cam);
    items.push({ z: -999, draw: (ctx) => {
      ctx.font = `650 ${Math.round(21 * lbl.k)}px ${SANS}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba([150, 200, 255], a);
      ctx.fillText('Agent host', lbl.x, lbl.y);
    } });
    return items;
  };

  const sessionItems = (cam, t) => SESSIONS.map((name, i) => {
    const a = i === 0 ? 1 : ease(seg(t, 2.9, 3.8));
    const p = project(sessionPos(i, t), cam);
    const before = t < BREAK;
    const pulse = before ? 1 + 0.12 * seg(t, 0.4, BREAK) * Math.sin(t * 9) : 1 + 0.05 * Math.sin(t * 3 + i);
    const radius = (before ? 16 + 6 * seg(t, 0.4, BREAK) : lerp(24, 21, seg(t, 2.6, 3.7))) * pulse;
    const showLabel = t > 3.4;
    return { z: p.z, draw: (ctx) => {
      if (a > 0) orb(ctx, p, radius, MINT, a * (showLabel ? 1 : 1), showLabel ? name : '');
    } };
  });

  const CONTENT = {
    chat: (ctx) => {
      ctx.fillStyle = '#28354a'; rrect(ctx, -60, -18, 84, 12, 6); ctx.fill();
      ctx.fillStyle = '#1b4270'; rrect(ctx, -4, 2, 64, 12, 6); ctx.fill();
      ctx.fillStyle = '#28354a'; rrect(ctx, -60, 22, 60, 12, 6); ctx.fill();
    },
    code: (ctx) => {
      [[-60, 70, BLUE], [-48, 52, MINT], [-48, 80, [120, 135, 155]], [-36, 46, MINT], [-60, 34, BLUE]].forEach(([x, w, c], i) => {
        ctx.fillStyle = rgba(c, 0.9); rrect(ctx, x, -20 + i * 11, w, 6, 3); ctx.fill();
      });
    },
    grid: (ctx) => {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
        ctx.fillStyle = i === 1 && j === 0 ? rgba(MINT, 0.85) : '#1e2a3a';
        rrect(ctx, -60 + i * 42, -18 + j * 30, 36, 24, 5); ctx.fill();
      }
    },
    phone: (ctx) => {
      rrect(ctx, -18, -24, 36, 62, 8); ctx.strokeStyle = '#5d7590'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = rgba(MINT, 0.9); rrect(ctx, -10, -10, 20, 8, 4); ctx.fill();
      ctx.fillStyle = '#28354a'; rrect(ctx, -10, 4, 20, 8, 4); ctx.fill();
    },
    browser: (ctx) => {
      rrect(ctx, -66, -24, 132, 16, 8); ctx.fillStyle = '#0b121b'; ctx.fill();
      ctx.strokeStyle = '#2f4a68'; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = `500 9px ${SANS}`; ctx.textAlign = 'left'; ctx.fillStyle = '#8fb3d9';
      ctx.fillText('vscode.dev/agents', -58, -13);
      [0, 1, 2].forEach((i) => {
        ctx.fillStyle = i === 1 ? rgba(MINT, 0.85) : '#1e2a3a';
        rrect(ctx, -62 + i * 43, 2, 37, 30, 5); ctx.fill();
      });
    },
    game: (ctx, t) => {
      [0, 1].forEach((k) => {
        ctx.beginPath(); ctx.moveTo(0, -18 + k * 22); ctx.lineTo(40, 2 + k * 22); ctx.lineTo(0, 22 + k * 22); ctx.lineTo(-40, 2 + k * 22); ctx.closePath();
        ctx.fillStyle = '#17222f'; ctx.fill(); ctx.strokeStyle = '#3b5672'; ctx.lineWidth = 1.5; ctx.stroke();
      });
      ctx.fillStyle = rgba(MINT, 1);
      ctx.beginPath(); ctx.arc(Math.sin(t * 1.4) * 16, 2 + Math.cos(t * 1.4) * 6, 6, 0, TAU); ctx.fill();
    }
  };

  const clientItems = (cam, t) => {
    const host = { x: 0, y: 0, z: 0 };
    const items = [];
    CLIENTS.forEach((c, i) => {
      const { pos, alpha } = clientPos(i, t);
      if (alpha <= 0) return;
      const p = project(pos, cam);
      const da = depthAlpha(p.z);
      const beam = ease(seg(t, 3.9 + i * 0.12, 4.7 + i * 0.12));
      if (beam > 0) {
        const end = project(lerp3(pos, host, beam * 0.86), cam);
        items.push({ z: (p.z + end.z) / 2 + 60, draw: (ctx) => {
          const g = ctx.createLinearGradient(p.x, p.y, end.x, end.y);
          g.addColorStop(0, rgba(BLUE, 0.55 * da * alpha));
          g.addColorStop(1, rgba(BLUE, 0.12));
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = g; ctx.lineWidth = 2.2 * p.k; ctx.setLineDash([6 * p.k, 10 * p.k]);
          ctx.lineDashOffset = -t * 40; ctx.stroke(); ctx.setLineDash([]);
        } });
      }
      if (t > 4.7) {
        [[frac((t - 4.7) * 0.45 + i * 0.17), MINT, true], [frac((t - 4.7) * 0.33 + i * 0.29 + 0.5), BLUE, false]].forEach(([u, col, out]) => {
          const q = project(out ? lerp3(host, pos, 0.14 + u * 0.86) : lerp3(pos, host, u * 0.86), cam);
          const fade = Math.sin(u * Math.PI);
          items.push({ z: q.z, draw: (ctx) => {
            glow(ctx, q.x, q.y, 16 * q.k, col, 0.55 * fade);
            ctx.fillStyle = rgba(col, fade);
            ctx.beginPath(); ctx.arc(q.x, q.y, 4.2 * q.k, 0, TAU); ctx.fill();
          } });
        });
      }
      items.push({ z: p.z, draw: (ctx) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.k * 0.98, p.k * 0.98);
        ctx.globalAlpha = alpha * da * FADE;
        ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
        rrect(ctx, -82, -56, 164, 112, 13);
        ctx.fillStyle = '#0f1621'; ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = c.kind === 'chat' ? rgba(MINT, 0.9) : rgba(BLUE, 0.75);
        ctx.lineWidth = 1.6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-82, -34); ctx.lineTo(82, -34); ctx.strokeStyle = '#26374b'; ctx.lineWidth = 1; ctx.stroke();
        [-68, -56, -44].forEach((x) => { ctx.fillStyle = '#4b5d72'; ctx.beginPath(); ctx.arc(x, -45, 3.5, 0, TAU); ctx.fill(); });
        ctx.save(); ctx.translate(0, 8); CONTENT[c.kind](ctx, t); ctx.restore();
        ctx.font = `650 20px ${SANS}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#eef3f9';
        ctx.fillText(c.name, 0, 84);
        ctx.restore();
      } });
    });
    return items;
  };

  const drawStars = (ctx, cam, t) => {
    const a = 0.45 + 0.55 * ease(seg(t, 1.6, 3.5)) * (1 - outro(t));
    for (const s of SCENE.stars) {
      const p = project(s, cam);
      if (p.z < -D + 50) continue;
      ctx.fillStyle = `rgba(170,200,235,${s.a * a * depthAlpha(p.z)})`;
      ctx.fillRect(p.x, p.y, 1.6 * p.k, 1.6 * p.k);
    }
  };

  const drawOrbit = (ctx, cam, t) => {
    const a = ease(seg(t, 3.4, 4.6));
    if (a <= 0) return;
    let prev = null;
    for (let i = 0; i <= 120; i++) {
      const th = (i / 120) * TAU;
      const x0 = Math.cos(th) * CLIENT_R;
      const p = project({ x: x0 * Math.cos(RING_TILT), y: x0 * Math.sin(RING_TILT), z: Math.sin(th) * CLIENT_R }, cam);
      if (prev && i % 2) {
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = rgba(BLUE, 0.18 * a * depthAlpha(p.z));
        ctx.lineWidth = 1.4; ctx.stroke();
      }
      prev = p;
    }
  };

  /* ---------------------------------------------------------- Frame */
  const draw = (ctx, t) => {
    ctx.clearRect(0, 0, W, H);
    // Ease the camera home during the fade so the next cycle starts seamlessly.
    const o = outro(t), c1 = camera(t), c0 = camera(0);
    const cam = { yaw: lerp(c1.yaw, c0.yaw, o), pitch: lerp(c1.pitch, c0.pitch, o) };
    FADE = 1 - o;
    drawStars(ctx, cam, t);
    ctx.globalAlpha = FADE;
    drawOrbit(ctx, cam, t);
    if (t < BREAK) drawWindow(ctx, cam, t);
    const items = [...shardItems(cam, t), ...hostItems(cam, t), ...sessionItems(cam, t), ...clientItems(cam, t)];
    items.sort((a, b) => b.z - a.z).forEach((item) => item.draw(ctx));
    drawShockwave(ctx, cam, t);
    ctx.globalAlpha = 1;
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  window.Hero3D = {
    mount(canvas) {
      const ctx = canvas.getContext('2d');
      let raf = 0, t0 = 0, running = false;
      const size = (boost = 1) => {
        const wrap = canvas.closest('.frame-wrap');
        const s = (wrap ? wrap.getBoundingClientRect().width : W) / W || 0.5;
        const dpr = Math.min(2, window.devicePixelRatio || 1) * boost;
        const bw = Math.max(1, Math.round(W * s * dpr)), bh = Math.max(1, Math.round(H * s * dpr));
        if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
        ctx.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
      };
      const tick = (now) => {
        if (!running) return;
        size();
        draw(ctx, (((now - t0) / 1000) * SLOW) % CYCLE);
        raf = requestAnimationFrame(tick);
      };
      const api = {
        start() {
          if (reduce.matches) { api.still(); return; }
          cancelAnimationFrame(raf);
          running = true;
          t0 = performance.now();
          raf = requestAnimationFrame(tick);
        },
        stop() { running = false; cancelAnimationFrame(raf); api.still(); },
        get running() { return running; },
        still(boost) { size(boost); draw(ctx, STATIC_T); }
      };
      return api;
    }
  };
})();
