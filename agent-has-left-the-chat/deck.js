/*
  Renders the final deck and the separate speaker-notes page.
  Every slide has an authored diagram. Motion runs only while a slide is
  visible, replays on revisit, and collapses to the final state for reduced
  motion, print, and the notes page.
*/
(() => {
  document.documentElement.classList.add('js');
  const slides = window.SLIDES;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const esc = (value) => String(value).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  /* ------------------------------------------------ SVG vocabulary */
  const t = (x, y, s, cls = 'lbl', anchor = 'middle') =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${esc(s)}</text>`;
  const wrap = (s, max) => String(s).split(' ').reduce((out, word) => {
    if (out.length && `${out.at(-1)} ${word}`.length <= max) out[out.length - 1] += ` ${word}`;
    else out.push(word);
    return out;
  }, []);
  const tl = (x, y, s, max, cls = 'lbl', anchor = 'middle', lh = 34) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${wrap(s, max)
      .map((line, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(line)}</tspan>`).join('')}</text>`;
  const r = (x, y, w, h, cls = 'n', rx = 14) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${cls}"/>`;
  const c = (x, y, rad, cls = '') => `<circle cx="${x}" cy="${y}" r="${rad}" class="${cls}"/>`;
  const p = (d, cls = 'w') => `<path d="${d}" class="${cls}"/>`;
  const A = (inner, d = 0, cls = '', style = '') => `<g class="a ${cls}" style="--d:${d}ms;${style}">${inner}</g>`;
  const M = (inner, d, dx, dy, cls = '') => `<g class="sort ${cls}" style="--d:${d}ms;--dx:${dx}px;--dy:${dy}px">${inner}</g>`;
  const draw = (d, cls = 'w', delay = 0, dur = 900) =>
    `<path d="${d}" pathLength="1" class="draw ${cls}" style="--d:${delay}ms;--t:${dur}ms"/>`;
  const flow = (d, cls = '', delay = 0) => `<path d="${d}" class="w"/><path d="${d}" class="fl ${cls}" style="--d:${delay}ms"/>`;
  const pk = (d, cls = '', delay = 0, dur = 2400, rad = 7) =>
    `<circle r="${rad}" class="pk ${cls}" style="offset-path:path('${d}');--d:${delay}ms;--t:${dur}ms"/>`;
  const box = (x, y, w, h, label, sub = '', cls = '', lcls = 'lbl') => r(x, y, w, h, `n ${cls}`) +
    (sub ? t(x + w / 2, y + h / 2 - 5, label, lcls) + t(x + w / 2, y + h / 2 + 26, sub, 'sub')
      : t(x + w / 2, y + h / 2 + 9, label, lcls));
  const win = (x, y, w, h, title, cls = '') => `<g class="${cls}">${r(x, y, w, h, 'win', 16)}${p(`M${x} ${y + 44}H${x + w}`, 'hair')}` +
    `${[22, 40, 58].map((o) => c(x + o, y + 22, 5, 'wdot')).join('')}${t(x + w / 2, y + 30, title, 'sub')}</g>`;
  const lock = (x, y) => `<g class="lock">${p(`M${x + 5} ${y + 11}v-4a6 6 0 0 1 12 0v4`, 'lock-arc')}${r(x, y + 10, 22, 17, 'lock-body', 3)}</g>`;
  const session = (x, y, w = 300, h = 124, title = 'Agent session', sub = 'Still working') => `<g class="work">` +
    `${r(x, y, w, h, 'work-card', 16)}${c(x + 30, y + 36, 7, 'pulse')}${t(x + 50, y + 45, title, 'lbl', 'start')}` +
    `${t(x + 24, y + 82, sub, 'sub mintt', 'start')}${r(x + 24, y + h - 26, w - 48, 6, 'track', 3)}${r(x + 24, y + h - 26, w - 48, 6, 'prog', 3)}</g>`;
  const svg = (vb, label, inner, cls = '') =>
    `<svg class="scene ${cls}" viewBox="0 0 ${vb}" role="img" aria-label="${esc(label)}">${inner}</svg>`;

  /* -------------------------------------------- HTML scaffolding */
  const h2 = (s) => `<h2>${s.title}</h2>`;
  const lede = (s) => (s.lede ? `<p class="lede">${s.lede}</p>` : '');
  const footer = (s, cls = '') => (s.footer ? `<p class="footer-line ${cls}">${s.footer}</p>` : '');
  const stage = (s, inner, after = '', before = '') => `<div class="l-stage">${h2(s)}${before}${inner}${after}</div>`;
  const side = (copy, scene, cls = '') => `<div class="l-side ${cls}"><div class="side-copy">${copy}</div>${scene}</div>`;
  const caps = (labels, texts, cls = '') => `<div class="caps ${cls}">${texts.map((text, i) =>
    `<div class="a" style="--d:${500 + i * 200}ms"><h3 class="k${i}">${labels[i]}</h3><p>${text}</p></div>`).join('')}</div>`;
  const miniList = (items) => `<ol class="mini">${items.map((item, i) =>
    `<li class="a" style="--d:${200 + i * 180}ms"><h3>${item.h}</h3><p>${item.p}</p></li>`).join('')}</ol>`;
  const psuCaps = (s) => caps(s.labels || ['The problem', 'The shared contract', 'What it enables'], [s.problem, s.spec, s.unlocked]);
  const Z = [0, 485, 971];

  const tangle = (x1, ys1, x2, ys2, delay = 0, cls = 'tg') =>
    ys1.flatMap((a, i) => ys2.map((b, j) => draw(`M${x1} ${a}L${x2} ${b}`, cls, delay + (i * 3 + j) * 40, 500))).join('');

  /* ------------------------------------------------------ Scenes */
  const scenes = {
    title: (s) => `<div class="l-title">
        <canvas class="hero3d" role="img" aria-label="A single agent session breaks out of a chat window and joins other sessions on an agent host. Clients, including the chat, connect to the host from all around."></canvas>
        <div class="title-copy"><h1>${s.title}</h1><p class="subtitle">${s.subtitle}</p><p class="by">${s.by}</p></div>
      </div>`,

    hook: (s) => side(`${h2(s)}${lede(s)}`,
      svg('832 700', 'Skills, MCP, and plugins move out of the app. The running session stays inside it.', `
        ${A(t(20, 165, 'Portable', 'hd mintt', 'start'), 900)}
        ${['Skills', 'MCP', 'Plugins'].map((label, i) =>
          M(box(20, 200 + i * 110, 150, 64, label, '', 'mint'), 500 + i * 160, 330, 0)).join('')}
        ${win(250, 160, 520, 430, 'The app that started it', 'ownframe')}
        ${session(330, 330, 360, 124, 'Running session', 'Owned by this app')}
        ${A(lock(670, 312), 1300)}
        ${A(t(510, 640, 'Still owned here', 'hd ambert'), 1400)}`)),

    's1-intro': (s) => stage(s, svg('1408 330', 'Four standards that replaced many-to-many integrations with one shared contract.',
      s.items.map((item, i) => {
        const x = 14 + i * 360;
        const ys = [40, 120, 200];
        const d = i * 260;
        return `<g class="fadeT" style="--d:${d + 900}ms">${tangle(x + 40, ys, x + 260, ys, d)}</g>` +
          ys.map((y) => draw(`M${x + 40} ${y}L${x + 150} 120M${x + 260} ${y}L${x + 150} 120`, 'spoke', d + 1000, 600)).join('') +
          ys.map((y) => c(x + 40, y, 9, 'nd') + c(x + 260, y, 9, 'nd')).join('') +
          A(c(x + 150, 120, 24, 'hub'), d + 1100) +
          A(t(x + 150, 272, item.h, 'big') + t(x + 150, 310, item.p, 'sub'), d + 300);
      }).join('')), '', lede(s)),

    lsp: (s) => stage(s, svg('1408 380', 'Every editor rebuilt every language, until one protocol connected editors to language servers.', `
        ${['VS Code', 'Neovim', 'Emacs'].map((e, i) => box(0, 40 + i * 110, 150, 56, e)).join('')}
        ${['Python', 'Rust', 'Go'].map((e, i) => box(287, 40 + i * 110, 150, 56, e)).join('')}
        ${tangle(150, [68, 178, 288], 287, [68, 178, 288], 100)}
        ${A(t(Z[1] + 218, 60, s.math, 'math'), 900)}
        ${A(box(Z[1], 150, 140, 64, 'Editor'), 700)}
        ${flow(`M${Z[1] + 140} 182H${Z[1] + 297}`, '', 1100)}
        ${pk(`M${Z[1] + 140} 176H${Z[1] + 297}`, '', 1300)}${pk(`M${Z[1] + 297} 188H${Z[1] + 140}`, 'mint', 2500)}
        ${A(r(Z[1] + 168, 142, 100, 80, 'n blue') + t(Z[1] + 218, 194, 'LSP', 'big mono bluet'), 900)}
        ${A(box(Z[1] + 297, 150, 140, 64, 'Server'), 1100)}
        ${A(t(Z[1] + 218, 270, 'JSON-RPC', 'sub mono'), 1200)}
        ${A(box(Z[2], 150, 214, 64, 'Python server', '', 'mint'), 1500)}
        ${['VS Code', 'Neovim', 'Emacs', 'Zed'].map((e, i) => {
          const y = 20 + i * 82;
          const d = `M${Z[2] + 214} 182C${Z[2] + 252} 182 ${Z[2] + 248} ${y + 28} ${Z[2] + 287} ${y + 28}`;
          return A(box(Z[2] + 287, y, 150, 56, e), 1700 + i * 120) + flow(d, 'mint', 1700) + pk(d, 'mint', 1900 + i * 300);
        }).join('')}`, 'fixed'), psuCaps(s)),

    skills: (s) => stage(s, svg('1408 470', 'Agent-specific instruction files converge into one SKILL.md folder that compatible agents can use.', `
        ${['CLAUDE.md', '.cursorrules', 'copilot-instructions.md'].map((doc, i) => {
          const y = 40 + i * 120;
          const d = `M370 ${y + 30}C450 ${y + 30} 440 230 520 230`;
          return A(box(0, y, 370, 60, doc, '', '', 'lbl mono'), i * 150) + flow(d, '', 600) + pk(d, '', 700 + i * 350);
        }).join('')}
        ${A(`${r(520, 70, 380, 320, 'n blue', 18)}${p('M520 116H900', 'hair')}${t(552, 104, 'review-pr/', 'sub mono', 'start')}
          ${t(552, 170, 'SKILL.md', 'big mono', 'start')}
          ${['instructions', 'scripts/', 'references/'].map((row, i) => c(566, 222 + i * 52, 6, 'nd mintfill') + t(586, 230 + i * 52, row, 'lbl mono', 'start')).join('')}`, 700)}
        ${['GitHub Copilot', 'Claude Code', 'Codex'].map((agent, i) => {
          const y = 40 + i * 120;
          const d = `M900 230C1010 230 1010 ${y + 30} 1130 ${y + 30}`;
          return flow(d, 'mint', 1200) + pk(d, 'mint', 1400 + i * 300) + A(box(1130, y, 278, 60, agent), 1300 + i * 150);
        }).join('')}
        ${A(t(185, 440, 'Scattered per agent', 'sub') + t(710, 440, 'One shared folder', 'sub') + t(1269, 440, 'Any compatible agent', 'sub'), 1700)}`),
      footer(s)),

    mcp: (s) => stage(s, svg('1408 380', 'Every AI app rebuilt every tool integration, until MCP servers exposed tools through one protocol.', `
        ${['Chat app', 'IDE', 'CLI agent'].map((e, i) => box(0, 40 + i * 110, 150, 56, e)).join('')}
        ${['GitHub', 'Postgres', 'Browser'].map((e, i) => box(287, 40 + i * 110, 150, 56, e)).join('')}
        ${tangle(150, [68, 178, 288], 287, [68, 178, 288], 100)}
        ${A(t(Z[1] + 218, 60, s.math, 'math'), 900)}
        ${A(box(Z[1], 150, 140, 64, 'Client'), 700)}
        ${flow(`M${Z[1] + 140} 182H${Z[1] + 297}`, '', 1100)}
        ${pk(`M${Z[1] + 140} 176H${Z[1] + 297}`, '', 1300)}${pk(`M${Z[1] + 297} 188H${Z[1] + 140}`, 'mint', 2500)}
        ${A(r(Z[1] + 160, 142, 116, 80, 'n blue') + t(Z[1] + 218, 194, 'MCP', 'big mono bluet'), 900)}
        ${A(r(Z[1] + 297, 96, 140, 180, 'n') + t(Z[1] + 367, 132, 'Server', 'lbl') +
          ['tools', 'resources', 'prompts'].map((row, i) => t(Z[1] + 367, 176 + i * 36, row, 'sub mono')).join(''), 1100)}
        ${A(box(Z[2], 150, 214, 64, 'GitHub server', '', 'mint'), 1500)}
        ${['VS Code', 'Claude', 'Codex', 'Your agent'].map((e, i) => {
          const y = 20 + i * 82;
          const d = `M${Z[2] + 214} 182C${Z[2] + 252} 182 ${Z[2] + 248} ${y + 28} ${Z[2] + 287} ${y + 28}`;
          return A(box(Z[2] + 287, y, 150, 56, e), 1700 + i * 120) + flow(d, 'mint', 1700) + pk(d, 'mint', 1900 + i * 300);
        }).join('')}`, 'fixed'), psuCaps(s)),

    'mcp-next': (s) => side(`${h2(s)}${miniList(s.items)}`,
      svg('832 700', 'A client sends self-describing requests that any stateless server instance can answer.', `
        ${A(t(695, 80, 'Any instance can answer', 'sub'), 300)}
        ${[110, 310, 510].map((y, i) => A(box(590, y, 220, 84, 'Server', `instance ${i + 1}`), 200 + i * 150)).join('')}
        ${[110, 310, 510].map((y) => flow(`M220 352C400 352 420 ${y + 42} 590 ${y + 42}`)).join('')}
        ${pk('M220 352C400 352 420 152 590 152', '', 600)}
        ${pk('M220 352C400 352 420 552 590 552', '', 1400)}
        ${pk('M220 352C400 352 420 352 590 352', '', 2200)}
        ${pk('M590 366C420 366 400 366 220 366', 'amber', 3000)}
        ${A(t(405, 410, 'input_required', 'sub mono ambert'), 1600)}
        ${box(30, 310, 190, 84, 'Client')}
        ${A(t(125, 440, '_meta on every request', 'sub mono'), 900)}`)),

    plugins: (s) => {
      const chips = [['Skill', 20, 40], ['Hook', 250, 110], ['MCP server', 20, 190], ['Custom agent', 200, 270]];
      return stage(s, svg('1408 380', 'A skill, hook, MCP server, and custom agent are bundled into one plugin, installed in one window on one machine.', `
        ${chips.map(([label, x, y]) => `<g class="ghost">${r(x, y, label.length * 14 + 50, 56, 'n loose')}${t(x + (label.length * 14 + 50) / 2, y + 37, label)}</g>`).join('')}
        ${A(r(Z[1] + 60, 20, 320, 330, 'n mint', 18) + t(Z[1] + 220, 68, 'Agent Plugin', 'big'), 300)}
        ${chips.map(([label, x, y], i) => {
          const fy = 100 + i * 60;
          return M(r(Z[1] + 90, fy, 260, 46, 'row', 10) + t(Z[1] + 220, fy + 31, label), 700 + i * 180, x - (Z[1] + 90), y - fy);
        }).join('')}
        ${A(win(Z[2] + 10, 30, 420, 310, 'VS Code · your laptop'), 1600)}
        ${A(r(Z[2] + 110, 150, 220, 96, 'n mint', 14) + t(Z[2] + 220, 206, 'Agent Plugin') + lock(Z[2] + 316, 134), 1900)}`, 'fixed'),
      psuCaps(s) + `<p class="limit a" style="--d:2200ms">${s.limit}</p>`);
    },

    boundary: (s) => stage(s, svg('1408 520', 'Capabilities flow freely to many apps. The running session stays locked in the app that started it.', `
        ${A(t(40, 44, s.left.h, 'hd mintt', 'start'), 100)}
        ${s.left.items.map((item, i) => {
          const y = 90 + i * 130;
          return A(box(40, y, 360, 66, item, '', 'mint'), 200 + i * 150) +
            ['Editor', 'CLI', 'Cloud agent'].map((app, j) => flow(`M400 ${y + 33}C440 ${y + 33} 430 ${123 + j * 130} 470 ${123 + j * 130}`, 'mint thin', 700)).join('');
        }).join('')}
        ${['Editor', 'CLI', 'Cloud agent'].map((app, j) => A(box(470, 90 + j * 130, 170, 66, app), 900 + j * 120)).join('')}
        ${A(win(740, 30, 668, 470, s.right.h, 'ownframe'), 1100)}
        ${s.right.items.map((item, i) => {
          const y = 120 + i * 120;
          return A(r(780, y, 590, 84, 'n amber-soft') + t(816, y + 51, item, 'lbl', 'start') + lock(1324, y + 28), 1300 + i * 180);
        }).join('')}`)),

    's2-intro': (s) => side(`<h2>${s.title}</h2><p class="lede">${s.lede}</p>`,
      svg('832 700', 'Clients connect to a host that owns running sessions; a harness runs each agent.', `
        ${A(t(416, 64, `${s.items[2].h} · ${s.items[2].p}`, 'sub'), 200)}
        ${['Editor', 'Agents window', 'Your client'].map((label, i) => A(box(20 + i * 276, 100, 240, 76, label), 300 + i * 160)).join('')}
        ${[140, 416, 692].map((x, i) => {
          const d = `M${x} 176C${x} 250 416 236 416 300`;
          return draw(d, 'w', 800 + i * 150, 700) + `<path d="${d}" class="fl" style="--d:1500ms"/>` + pk(`M416 300C416 236 ${x} 250 ${x} 176`, '', 1700 + i * 400);
        }).join('')}
        ${A(r(186, 300, 460, 180, 'n blue host-core', 22) + t(416, 378, s.items[0].h, 'big') + t(416, 420, s.items[0].p, 'sub'), 600)}
        ${flow('M416 480V580', 'mint', 1300)}
        ${A(box(236, 580, 360, 90, s.items[1].h, s.items[1].p, 'mint'), 1300)}`), 'l-reveal'),

    choices: (s) => {
      const picks = [1, 1, 0];
      const xs = [0, 494, 988];
      return stage(s, svg('1408 470', 'Harness, environment, and interface are chosen independently: Claude in a Dev Container, used from VS Code.', `
        ${s.cols.map((col, i) => A(t(xs[i], 44, col.h, 'hd bluet', 'start'), i * 150) + col.items.map((item, j) => {
          const picked = picks[i] === j;
          return `<g class="${picked ? 'pick' : ''}" style="--d:${700 + i * 450}ms">${A(box(xs[i], 80 + j * 90, 420, 64, item), 150 + i * 150 + j * 80)}</g>`;
        }).join('')).join('')}
        ${draw('M420 202H494M914 202C951 202 951 112 988 112', 'route', 600, 1700)}
        ${A(t(704, 410, s.examples[0], 'lbl mintt'), 2100)}`));
    },

    how: (s) => {
      const cy = [40, 140, 240, 340];
      return stage(s, svg('1408 470', 'Harnesses feed one host that owns session state; several clients connect, including one that joins later.', `
        ${A(t(150, 44, 'Harnesses', 'sub'), 0)}
        ${s.harnesses.map((h, i) => {
          const y = 80 + i * 100;
          return A(box(0, y, 300, 64, h, '', i === 0 ? 'mint' : ''), 100 + i * 120) + flow(`M300 ${y + 32}H440`, 'mint', 500) + pk(`M300 ${y + 32}H440`, 'mint', 700 + i * 500);
        }).join('')}
        ${A(r(440, 30, 520, 410, 'n blue host-core', 22) + t(700, 82, 'Agent host', 'hd'), 200)}
        ${s.state.map((row, i) => A(r(480, 110 + i * 78, 440, 60, 'row', 12) + t(700, 149 + i * 78, row, 'lbl'), 400 + i * 120)).join('')}
        ${s.clients.map((cl, i) => {
          const y = cy[i];
          const late = i === 2;
          const out = `M960 ${y + 32}H1100`;
          return A(box(1100, y, 308, 64, cl, '', late ? 'blue' : ''), late ? 1900 : 700 + i * 120) +
            (late ? draw(out, 'w', 1800, 500) + pk(out, 'snap once', 2200, 900, 10) + A(t(1030, y + 18, 'snapshot', 'sub mono bluet'), 2300)
              : flow(out, '', 900) + pk(out, '', 1000 + i * 600) + pk(`M1100 ${y + 40}H960`, 'mint', 2000 + i * 500));
        }).join('')}`), footer(s));
    },

    'vscode-move': (s) => stage(s, svg('1408 300', 'The agent session moves out of the VS Code extension host into a separate Agent Host; the window becomes a client.', `
        ${win(0, 10, 600, 280, 'VS Code window')}
        ${r(30, 70, 540, 200, 'n dimbox')}${t(300, 104, 'Extension host', 'sub')}
        ${A(r(830, 20, 578, 260, 'n blue host-core', 20) + t(1119, 64, 'Agent Host', 'hd bluet'), 300)}
        ${M(session(970, 100, 300, 120, 'Agent session', 'Still working'), 700, -760, 20)}
        ${draw('M600 150H830', 'w', 1700, 500)}${`<path d="M600 150H830" class="fl" style="--d:2100ms"/>`}
        ${A(t(300, 250, 'Now a client', 'lbl mintt'), 2100)}`, 'fixed short'),
      `<div class="tl compact">${s.items.map((item, i) => `
        <div class="tl-item a${item.hot ? ' hot' : ''}" style="--d:${600 + i * 140}ms"><span class="tdot" aria-hidden="true"></span>
          <p class="date">${item.date}</p><h3>${item.tag}</h3><p>${item.text}</p></div>`).join('')}</div>${footer(s)}`),

    sdk: (s) => {
      const spots = [[60, 60], [1048, 60], [40, 410], [1068, 410], [554, 470]];
      return stage(s, svg('1408 560', 'One Copilot agent harness, from the Copilot SDK, powers the CLI, the Copilot app, code review, VS Code, and your app.', `
        ${s.surfaces.map((label, i) => {
          const [x, y] = spots[i];
          const d = `M704 280L${x + 150} ${y + 36}`;
          return draw(d, 'spoke', 500 + i * 120, 700) + pk(d, 'mint', 1300 + i * 380) +
            A(box(x, y, 300, 72, label, '', i === 4 ? 'dash' : ''), 700 + i * 120);
        }).join('')}
        ${A(r(514, 200, 380, 160, 'n mint host-core', 22) + t(704, 268, 'Copilot agent harness', 'big') + t(704, 310, 'Copilot SDK', 'sub mono'), 100)}`),
      `<p class="caption-line a" style="--d:1700ms">${s.caption}</p>`);
    },

    bench: (s) => {
      const delta = (pair) => {
        const pts = parseFloat(pair.completion[0]) - parseFloat(pair.completion[1]);
        const cost = parseFloat(pair.cost[0].slice(1)) - parseFloat(pair.cost[1].slice(1));
        return `<p class="delta ${cost > 0 ? 'more' : 'less'}">Copilot CLI: +${pts} pt${pts === 1 ? '' : 's'}, $${Math.abs(cost).toFixed(2)} ${cost > 0 ? 'more' : 'less'} per task</p>`;
      };
      return stage(s, `<div class="benchmark-body">
          <figure class="chart a" style="--d:100ms"><img src="${s.src}" alt="${s.alt}"></figure>
          <div class="benchmark-callouts">${s.comparisons.map((pair, k) => `
            <section class="benchmark-pair a" style="--d:${400 + k * 300}ms" aria-label="${pair.model} comparison">
              <h3>${pair.model}</h3>
              <table>
                <thead><tr><td></td><th scope="col">Copilot CLI</th><th scope="col">${pair.competitor}</th></tr></thead>
                <tbody>
                  <tr><th scope="row">Completed</th>${pair.completion.map((v) => `<td data-count="${v}">${v}</td>`).join('')}</tr>
                  <tr><th scope="row">Cost / task</th>${pair.cost.map((v) => `<td data-count="${v}">${v}</td>`).join('')}</tr>
                </tbody>
              </table>${delta(pair)}
            </section>`).join('')}</div>
        </div>`, `<p class="chart-caption">${s.caption}</p>`);
    },

    layers: (s) => stage(s, svg('1408 500', 'Clients connect through the Agent Host Protocol to a host; harnesses such as the Copilot SDK run each agent.', `
        ${A(r(0, 10, 940, 90, 'n') + ['VS Code', 'Agents window', 'Your client'].map((l, i) => box(20 + i * 310, 25, 280, 60, l, '', 'inner')).join(''), 100)}
        ${A(r(0, 130, 940, 60, 'n blue band') + t(470, 169, 'Agent Host Protocol', 'lbl bluet'), 300)}
        ${A(r(0, 220, 940, 100, 'n') + t(470, 262, 'Agent host', 'lbl') + t(470, 294, 'Shared session state', 'sub'), 500)}
        ${A(box(0, 350, 310, 110, 'Copilot SDK', 'Copilot harness', 'mint') + box(325, 350, 290, 110, 'Claude', 'Adapter') + box(630, 350, 310, 110, 'Codex', 'Adapter'), 700)}
        ${[160, 470, 785].map((x, i) => flow(`M${x} 100V130M${x} 190V220M${x} 320V350`, '', 900) + pk(`M${x} 350V100`, i ? '' : 'mint', 1100 + i * 500)).join('')}
        ${A(p('M968 130h18V320h-18', 'bracket blue') + t(1010, 176, s.cols[2], 'hd bluet', 'start') +
          t(1010, 218, s.rows[0][2], 'lbl', 'start') + t(1010, 254, s.rows[1][2], 'sub', 'start') + t(1010, 288, s.rows[2][2], 'sub', 'start'), 1200)}
        ${A(p('M968 350h18V460h-18', 'bracket mint') + t(1010, 384, s.cols[1], 'hd mintt', 'start') +
          t(1010, 418, s.rows[0][1], 'lbl', 'start') + t(1010, 450, s.rows[1][1], 'sub', 'start') + t(1010, 480, s.rows[2][1], 'sub', 'start'), 1400)}`)),

    capabilities: (s) => stage(s, svg('1408 430', 'One session holds conversations, workspace changes, tool calls and approvals, and live terminal work.', `
        ${r(0, 0, 1408, 430, 'sessbound', 22)}${t(28, 38, 'session', 'sub mono bluet', 'start')}
        ${s.items.map((item, i) => {
          const x = 28 + i * 345;
          const ill = [
            r(x + 28, 132, 170, 26, 'bubble', 8) + r(x + 28, 170, 130, 26, 'bubble me', 8) + r(x + 28, 208, 180, 26, 'bubble', 8) +
              draw(`M${x + 60} 236C${x + 60} 270 ${x + 190} 256 ${x + 190} 290`, 'w', 900, 600) +
              r(x + 170, 296, 120, 22, 'bubble mintf', 8) + r(x + 170, 326, 90, 22, 'bubble mintf', 8),
            ['src/', '  host.ts', '  chat.ts', '  state.ts'].map((f, k) => t(x + 32, 160 + k * 44, f, 'sub mono', 'start') +
              (k ? r(x + 200, 148 + k * 44, [70, 40, 96][k - 1], 12, k === 2 ? 'diff del' : 'diff add', 3) : '')).join(''),
            r(x + 24, 130, 277, 50, 'row', 10) + t(x + 44, 162, 'run_tests', 'sub mono', 'start') +
              `<g class="ask">${r(x + 24, 202, 168, 50, 'appr', 25)}${t(x + 108, 234, 'Approve', 'lbl ambert')}</g>` +
              r(x + 24, 276, 230, 44, 'okpill', 22) + t(x + 46, 305, 'github · ready', 'sub mono mintt', 'start'),
            r(x + 24, 124, 277, 186, 'term', 12) + t(x + 46, 166, '$ npm test', 'sub mono', 'start') +
              t(x + 46, 204, 'running', 'sub mono mintt', 'start') + r(x + 46, 240, 233, 8, 'track', 4) + r(x + 46, 240, 233, 8, 'prog', 4)
          ][i];
          return A(r(x, 60, 325, 345, 'n panel', 16) + t(x + 24, 104, item.h, 'lbl', 'start') + ill + t(x + 24, 382, item.p, 'sub', 'start'), 200 + i * 220);
        }).join('')}`), '', lede(s)),

    'shared-control': (s) => stage(s, svg('1408 400', 'Clients join midway with a snapshot, act concurrently with stale actions rejected, and reconnect with replayed actions.', [0, 484, 968].map((x, i) => {
        const hA = `M${x + 220} 94C${x + 220} 190 ${x + 95} 190 ${x + 95} 280`;
        const hB = `M${x + 220} 94C${x + 220} 190 ${x + 345} 190 ${x + 345} 280`;
        const rev = (d0) => d0.replace(/^M(\S+) (\S+)C(\S+) (\S+) (\S+) (\S+) (\S+) (\S+)$/, 'M$7 $8C$5 $6 $3 $4 $1 $2');
        const base = r(x, 0, 440, 400, 'n panel', 18) + box(x + 150, 30, 140, 64, 'Host', '', 'blue') + box(x + 20, 280, 150, 64, 'Client A');
        const parts = [
          flow(hA) + A(box(x + 270, 280, 150, 64, 'Client B'), 800) + draw(hB, 'w', 900, 500) +
            pk(hB, 'snap once', 1400, 1000, 10) + A(t(x + 345, 374, 'snapshot', 'sub mono bluet'), 1500),
          box(x + 270, 280, 150, 64, 'Client B') + flow(hA) + flow(hB) + pk(rev(hA), 'mint', 300) + pk(rev(hB), 'amber', 700) +
            A(c(x + 318, 214, 18, 'rej') + p(`M${x + 311} ${207}l14 14m0 -14l-14 14`, 'rx'), 1500) + A(t(x + 345, 374, 'stale: rejected', 'sub redt'), 1600),
          box(x + 270, 280, 150, 64, 'Client B') + flow(hA) + p(hB, 'broken') + draw(hB, 'w solid', 1000, 600) +
            [0, 1, 2].map((k) => pk(hB, 'snap once', 1500 + k * 260, 900)).join('') + A(t(x + 345, 374, 'replay', 'sub mono mintt'), 1800)
        ];
        return A(base, i * 200) + `<g>${parts[i]}</g>`;
      }).join('')), caps(s.items.map((item) => item.h), s.items.map((item) => item.p), 'tight')),

    's4-intro': (s) => {
      const xs = [130, 417, 704, 991, 1278];
      return stage(s, svg('1408 340', 'AHP versions 0.2 through 1.0, May to October, with the 0.4 session and chat split highlighted.', `
        ${draw('M40 170H1368', 'tl-line', 0, 1600)}
        ${s.items.map((item, i) => A(
          t(xs[i], 84, item.date, 'sub mono') + t(xs[i], 136, item.tag, `ver${item.hot ? ' ambert' : ''}`) +
          (item.hot ? c(xs[i], 170, 28, 'ring') : '') + c(xs[i], 170, 14, `tdot${item.hot ? ' hot' : ''}`) +
          tl(xs[i], 230, item.text, 16, 'lbl'), 250 + i * 260)).join('')}`), footer(s));
    },

    split: (s) => {
      const lanes = [600, 870, 1140];
      const kinds = ['b', 'm', 'a'];
      const widths = [280, 200, 240, 180, 260, 210, 230, 190, 250];
      return stage(s, svg('1408 470', 'One mixed transcript sorts into separate chats per agent inside one shared session.', `
        ${t(210, 40, s.left.h, 'hd')}${r(20, 64, 380, 380, 'n dimbox', 16)}
        ${widths.map((w, i) => r(50, 98 + i * 36, w, 16, `ln ${kinds[i % 3]} ghost`, 8)).join('')}
        ${draw('M428 254H526', 'w', 300, 500)}${p('M512 242l14 12l-14 12', 'arrowhead')}
        ${A(r(560, 20, 848, 440, 'sessbound', 22) + t(592, 62, s.right.h, 'hd bluet', 'start'), 200)}
        ${lanes.map((x, k) => A(r(x, 92, 240, 250, 'lane', 14) + t(x + 120, 124, ['Lead', 'Worker', 'Worker'][k], 'sub'), 400 + k * 100)).join('')}
        ${widths.map((w, i) => {
          const k = i % 3;
          const j = Math.floor(i / 3);
          const fx = lanes[k] + 20;
          const fy = 150 + j * 60;
          return M(r(fx, fy, Math.min(w, 200), 16, `ln ${kinds[k]}`, 8), 900 + i * 90, 50 - fx, 98 + i * 36 - fy);
        }).join('')}
        ${A(r(592, 370, 784, 64, 'n', 12) + t(984, 410, 'Shared workspace and setup', 'lbl'), 1900)}`),
      `<div class="caps two">${[s.left, s.right].map((col, i) => `<div class="a" style="--d:${1500 + i * 200}ms"><ul>${col.items.map((item) => `<li>${item}</li>`).join('')}</ul></div>`).join('')}</div>`);
    },

    customizations: (s) => stage(s, svg('1408 380', 'Customization bundles from a laptop travel to a remote host, where each workspace keeps its own setup.', `
        ${win(0, 30, 270, 260, 'Your laptop')}
        ${['skills/review', 'agents/triage.md', 'instructions.md'].map((f, i) => t(24, 116 + i * 46, f, 'sub mono', 'start')).join('')}
        ${r(300, 96, 137, 180, 'n dash', 14)}${t(368, 140, 'Remote', 'sub')}${t(368, 166, 'host', 'sub')}${t(368, 234, '?', 'big dimt')}
        ${A(box(Z[1], 150, 130, 64, 'Client'), 400)}
        ${A(box(Z[1] + 307, 150, 130, 64, 'Host', '', 'blue'), 500)}
        ${flow(`M${Z[1] + 130} 182H${Z[1] + 307}`, 'mint', 700)}
        ${A(r(Z[1] + 112, 72, 212, 50, 'n mint', 12) + t(Z[1] + 218, 104, 'sha256:9f2c…', 'sub mono mintt'), 800)}
        ${pk(`M${Z[1] + 130} 182H${Z[1] + 307}`, 'mint', 1000, 1800, 9)}
        ${A(r(Z[2], 20, 437, 330, 'n blue', 18) + t(Z[2] + 218, 60, 'Remote host', 'lbl'), 1300)}
        ${['Workspace A', 'Workspace B'].map((w, i) => A(r(Z[2] + 20 + i * 207, 84, 190, 240, 'n', 14) + t(Z[2] + 115 + i * 207, 122, w, 'sub') +
          ['skills', 'agents'].map((chip, k) => r(Z[2] + 40 + i * 207, 150 + k * 60, 150, 44, 'n mint', 10) + t(Z[2] + 115 + i * 207, 179 + k * 60, chip, 'sub mono mintt')).join(''), 1500 + i * 200)).join('')}`, 'fixed'),
      psuCaps(s)),

    'mcp-state': (s) => {
      const states = [['starting', 'st-blue'], ['ready', 'st-mint'], ['needs sign-in', 'st-amber'], ['failed', 'st-red']];
      const pill = (x, y, w, h, base, small = false) => states.map(([label, cls], i) =>
        `<g class="st${i === 1 ? ' on' : ''}" style="--d:${base + i * 2000}ms">${r(x, y, w, h, cls, h / 2)}${t(x + w / 2, y + h / 2 + (small ? 8 : 10), label, small ? 'sub' : 'lbl')}</g>`).join('');
      return side(`${h2(s)}${miniList(s.items)}`, svg('832 700', 'An MCP server status cycles through starting, ready, needs sign-in, and failed; every client shows the same state.', `
        ${A(r(30, 40, 772, 280, 'n blue host-core', 20) + t(60, 92, 'Agent host', 'hd bluet', 'start'), 0)}
        ${A(r(70, 130, 692, 150, 'row', 14) + t(110, 218, 'github', 'big mono', 'start') + pill(440, 172, 290, 68, 0), 200)}
        ${['M210 320V430', 'M622 320V430'].map((d, i) => flow(d, '', 500) + pk(d, '', 600 + i * 400)).join('')}
        ${A(win(30, 430, 360, 230, 'Laptop') + t(60, 560, 'github', 'lbl mono', 'start') + pill(178, 526, 190, 52, 300, true), 400)}
        ${A(win(442, 430, 360, 230, 'Another machine') + t(472, 560, 'github', 'lbl mono', 'start') + pill(590, 526, 190, 52, 300, true), 600)}`));
    },

    automations: (s) => stage(s, svg('1408 380', 'A schedule fires with no editor connected; the host runs and records each run; a client reviews the result later.', `
        ${c(110, 180, 92, 'clock')}${[0, 90, 180, 270].map((deg) => `<path d="M110 100V112" class="tick" transform="rotate(${deg} 110 180)"/>`).join('')}
        <g class="hand">${p('M110 180V122', 'hand-l')}</g>${p('M110 180H156', 'hand-s')}${c(110, 180, 6, 'mintfill')}
        ${r(240, 80, 197, 200, 'n dash', 14)}${t(338, 170, 'No editor', 'sub')}${t(338, 198, 'connected', 'sub')}
        ${A(r(Z[1], 20, 437, 330, 'n blue', 18) + t(Z[1] + 218, 62, 'Agent host', 'lbl'), 300)}
        ${['Mon 09:00', 'Tue 09:00', 'Wed 09:00'].map((d, i) => A(r(Z[1] + 24, 90 + i * 80, 389, 60, 'row', 10) + t(Z[1] + 44, 128 + i * 80, d, 'sub mono', 'start') +
          (i < 2 ? t(Z[1] + 392, 128 + i * 80, 'done', 'sub mintt', 'end') : r(Z[1] + 220, 116 + i * 80, 170, 8, 'track', 4) + r(Z[1] + 220, 116 + i * 80, 170, 8, 'prog', 4)), 600 + i * 250)).join('')}
        ${A(win(Z[2] + 20, 20, 400, 330, 'Later, any client'), 1500)}
        ${A(c(Z[2] + 220, 180, 46, 'okc'), 1700)}${draw(`M${Z[2] + 198} 182l16 16l30 -32`, 'chk', 1900, 500)}
        ${A(t(Z[2] + 220, 278, 'Review the result', 'lbl'), 2000)}`, 'fixed'),
      psuCaps(s)),

    's5-intro': (s) => stage(s, svg('1408 480', 'ACP connects one client to one harness; AHP connects many clients to a host; A2A connects an agent to another agent system.', s.rows.map((row, i) => {
        const y = 20 + i * 155;
        const yc = y + 65;
        const topo = [
          c(560, yc, 16, 'nd') + flow(`M576 ${yc}H824`) + pk(`M576 ${yc}H824`, '', 600) + c(840, yc, 16, 'nd'),
          [-40, 0, 40].map((o, k) => {
            const d = `M573 ${yc + o}C690 ${yc + o} 700 ${yc} 810 ${yc}`;
            return c(560, yc + o, 13, 'nd') + flow(d) + pk(d, '', 700 + k * 450);
          }).join('') + r(810, yc - 32, 74, 64, 'n blue', 12),
          c(560, yc, 16, 'nd') + flow(`M576 ${yc}H810`) + pk(`M576 ${yc}H810`, '', 900) + r(810, yc - 32, 74, 64, 'opaque', 12) + t(847, yc + 10, '?', 'lbl dimt')
        ][i];
        return A((row.hot ? r(0, y, 1408, 130, 'hotrow', 18) : '') + t(40, yc + 13, row.proto, `ver${row.hot ? '' : ' dimt'}`, 'start') +
          t(200, yc + 9, row.from, 'lbl', 'start') + topo + t(940, yc + 9, row.to, 'lbl', 'start'), i * 260);
      }).join(''))),

  };

  const icons = {
    ACP: svg('120 50', '', `${c(14, 25, 8, 'nd')}${p('M22 25H98', 'w')}${c(106, 25, 8, 'nd')}`, 'icon'),
    AHP: svg('120 50', '', `${[9, 25, 41].map((y) => c(14, y, 6, 'nd') + p(`M20 ${y}C60 ${y} 60 25 92 25`, 'w')).join('')}${r(92, 12, 26, 26, 'n blue', 6)}`, 'icon'),
    A2A: svg('120 50', '', `${c(14, 25, 8, 'nd')}${p('M22 25H90', 'w')}${r(90, 10, 28, 30, 'opaque', 6)}`, 'icon')
  };
  const compare = (s) => stage(s, `<table class="cmp">
      <thead><tr>${s.cols.map((col, i) => `<th scope="col"${col === 'AHP' ? ' class="hot"' : ''}>${i ? `${icons[col] || ''}<span>${col}</span>` : ''}</th>`).join('')}</tr></thead>
      <tbody>${s.rows.map((row, k) => `<tr class="arow" style="--d:${300 + k * 160}ms">${row.map((cell, i) =>
        i === 0 ? `<th scope="row">${cell}</th>` : `<td${s.cols[i] === 'AHP' ? ' class="hot"' : ''}>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`);
  scenes.gateway = (s) => {
    const xs = [0, 330, 600, 940, 1160];
    const ws = [250, 0, 260, 0, 248];
    const node = (i, y, h) => {
      if (i === 0) return box(xs[0], y, ws[0], h / 2 - 8, 'VS Code', '', '', 'lbl') + box(xs[0], y + h / 2 + 8, ws[0], h / 2 - 8, 'Another AHP client');
      if (i === 2) return r(xs[2], y - 20, ws[2], h + 40, 'n blue host-core', 20) + tl(xs[2] + 130, y + h / 2 - 8, 'AHP–ACP Gateway', 12, 'hd', 'middle', 36);
      return box(xs[4], y, ws[4], h, 'Existing', 'ACP agent', 'mint');
    };
    const y = 110, h = 150;
    const mid = y + h / 2;
    const link = (x1, x2, proto, cls, d) => flow(`M${x1} ${mid}H${x2}`, cls, d) +
      pk(`M${x1} ${mid - 6}H${x2}`, cls, d + 300) + pk(`M${x2} ${mid + 6}H${x1}`, cls === 'mint' ? '' : 'mint', d + 1300) +
      A(r((x1 + x2) / 2 - 52, mid - 66, 104, 44, `n ${cls === 'mint' ? 'mint' : 'blue'}`, 22) +
        t((x1 + x2) / 2, mid - 36, proto, `lbl mono ${cls === 'mint' ? 'mintt' : 'bluet'}`), d);
    return stage(s, svg('1408 380', 'VS Code and other AHP clients connect over AHP to an AHP–ACP Gateway, which uses ACP to run an existing ACP agent.', `
      ${link(250, 600, 'AHP', '', 700)}
      ${link(860, 1160, 'ACP', 'mint', 1100)}
      ${A(node(0, y, h), 100)}
      ${A(node(2, y, h), 400)}
      ${A(node(4, y, h), 900)}
      ${A(t(125, 330, 'Shared sessions', 'sub') + t(730, 330, 'Bridges both', 'sub') + t(1284, 330, 'Integration unchanged', 'sub mintt'), 1500)}`, 'fixed'),
      `<div class="caps two-roles">${s.roles.map((role, i) => `<div class="a" style="--d:${1700 + i * 200}ms">
        <h3 class="${role.proto === 'AHP' ? 'k1' : 'k2'}">${role.proto}</h3><p>${role.text}</p></div>`).join('')}</div>`,
      `<p class="lede fresh a" style="--d:200ms"><span class="new-dot" aria-hidden="true"></span>${s.lede}</p>`);
  };
  scenes.acp = compare;
  scenes.a2a = compare;

  scenes['s6-intro'] = (s) => stage(s, svg('1408 430', 'One session shown in four clients: an Agents window, a canvas, a game, and a client you write.', `
      ${[[40, 20, 'Agents window'], [40, 240, 'Canvas'], [1048, 20, 'Your client'], [1048, 240, 'Game']].map(([x, y, label], i) => {
        const inside = [
          [0, 1, 2].flatMap((col) => [0, 1].map((row) => r(x + 28 + col * 92, y + 66 + row * 52, 80, 40, row + col === 1 ? 'tile hot' : 'tile', 8))).join(''),
          c(x + 90, y + 110, 34, 'shape') + r(x + 150, y + 76, 70, 70, 'shape sq', 10) + p(`M${x + 250} ${y + 146}l34 -66l34 66z`, 'shape'),
          [56, 92, 70, 120, 104].map((h, k) => r(x + 40 + k * 50, y + 160 - h, 32, h, k === 3 ? 'bar hot' : 'bar', 4)).join(''),
          [0, 1, 2].map((k) => p(`M${x + 160} ${y + 70 + k * 26}l60 30l-60 30l-60 -30z`, 'iso')).join('') + `<g class="walker">${c(x + 160, y + 118, 11, 'pulse')}</g>`
        ][i];
        const side = x < 700 ? `M554 ${210}C470 210 460 ${y + 90} 360 ${y + 90}` : `M854 210C940 210 950 ${y + 90} 1048 ${y + 90}`;
        return flow(side, 'mint', 900) + pk(side, 'mint', 1100 + i * 350) + A(win(x, y, 320, 180, label) + inside, 300 + i * 220);
      }).join('')}
      ${A(session(554, 150, 300, 124, 'Same session', 'Every client'), 0)}`), '', lede(s));

  scenes.close = (s) => side(`${h2(s)}<ul class="cmds">${s.commands.map((cmd, i) =>
      `<li class="a" style="--d:${900 + i * 180}ms"><code>${cmd}</code></li>`).join('')}</ul>`,
    svg('832 700', 'The agent session now lives outside the chat window and connects to many clients.', `
      <g class="ghostwin">${win(20, 470, 240, 190, 'Chat')}</g>
      ${draw('M250 500C300 470 320 440 330 414', 'trail', 300, 700)}
      ${[[30, 60, 'VS Code'], [310, 20, 'Agents window'], [590, 90, 'Your client'], [560, 520, 'Game']].map(([x, y, label], i) => {
        const d = `M416 352L${x + 110} ${y + 36}`;
        return draw(d, 'w', 500 + i * 140, 600) + `<path d="${d}" class="fl mint" style="--d:1200ms"/>` + pk(d, 'mint', 1300 + i * 400) +
          A(box(x, y, 220, 72, label), 700 + i * 140);
      }).join('')}
      ${session(266, 290, 300, 124, 'Agent session', 'Running on the host')}`), 'l-close');

  /* --------------------------------------------- Frame + pages */
  const frame = (slide) => {
    const render = scenes[slide.id];
    if (!render) throw new Error(`No scene for slide "${slide.id}"`);
    return `<div class="frame-wrap"><div class="frame f-${slide.id}"><div class="frame-inner">${render(slide)}</div></div></div>`;
  };

  const notesRoot = document.getElementById('speaker-notes');
  const root = document.getElementById('slides');
  const minutes = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  if (notesRoot) {
    const total = slides.reduce((sum, slide) => sum + slide.seconds, 0);
    document.getElementById('notes-summary').textContent =
      `${slides.length} slides · ${minutes(total)} speaking estimate · live demos add 3–5 minutes`;
    notesRoot.innerHTML = slides.map((slide, i) => `
      <article class="speaker-slide" id="${slide.id}">
        <header><p>${String(i + 1).padStart(2, '0')} · ${slide.section} · ${minutes(slide.seconds)}</p>
          <h2><a href="index.html#${slide.id}">${slide.title}</a></h2></header>
        ${frame(slide)}
        <div class="speaker-copy">${slide.notes.map((note) => {
            const cls = note.startsWith('"') ? 'say' : note.startsWith('→') ? 'next' : '';
            return `<p${cls ? ` class="${cls}"` : ''}>${note}</p>`;
          }).join('')}
          ${slide.cue.length ? `<aside class="demo-cue"><h3>Live demo</h3><ul>${slide.cue.map((cue) => `<li>${cue}</li>`).join('')}</ul></aside>` : ''}
          ${slide.know?.length ? `<aside class="know"><h3>Know</h3><ul>${slide.know.map((k) => `<li>${k}</li>`).join('')}</ul></aside>` : ''}
          ${slide.sources.length ? `<div class="sources"><h3>Sources</h3><ul>${slide.sources.map((item) =>
            `<li><a href="${item.href}" target="_blank" rel="noopener">${item.label}</a></li>`).join('')}</ul></div>` : ''}
        </div>
      </article>`).join('');
  } else if (root) {
    root.innerHTML = slides.map((slide) =>
      `<section class="slide" id="${slide.id}" aria-label="${esc(slide.title)}">${frame(slide)}</section>`).join('');
  } else {
    throw new Error('Missing presentation or speaker-notes container.');
  }

  const heroes = new Map();
  if (window.Hero3D) document.querySelectorAll('canvas.hero3d').forEach((canvas) => heroes.set(canvas, window.Hero3D.mount(canvas)));
  const heroOf = (el) => heroes.get(el.querySelector('canvas.hero3d'));
  // Print the settled frame, then resume whatever was animating.
  let resume = [];
  window.addEventListener('beforeprint', () => {
    resume = [...heroes.values()].filter((hero) => hero.running);
    heroes.forEach((hero) => { hero.stop(); hero.still(2); });
  });
  window.addEventListener('afterprint', () => { resume.forEach((hero) => hero.start()); resume = []; });

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) entry.target.style.setProperty('--s', entry.contentRect.width / 1600);
  });
  document.querySelectorAll('.frame-wrap').forEach((wrap) => resizeObserver.observe(wrap));
  if (notesRoot) requestAnimationFrame(() => heroes.forEach((hero) => hero.still()));

  const countUp = (page) => {
    if (reduce.matches) return;
    page.querySelectorAll('[data-count]').forEach((el) => {
      const [, pre, num, suf] = el.dataset.count.match(/^([^\d]*)([\d.]+)(.*)$/);
      const decimals = (num.split('.')[1] || '').length;
      const end = parseFloat(num);
      const start = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - start) / 1000);
        el.textContent = `${pre}${(end * (1 - (1 - k) ** 3)).toFixed(decimals)}${suf}`;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };

  if (root) {
    const pages = [...root.querySelectorAll('.slide')];
    const currentIndex = () => pages.reduce((nearest, page, index) =>
      Math.abs(page.getBoundingClientRect().top) < Math.abs(pages[nearest].getBoundingClientRect().top) ? index : nearest, 0);
    const goTo = (index) => {
      const page = pages[Math.max(0, Math.min(pages.length - 1, index))];
      page.scrollIntoView({ behavior: 'instant', block: 'start' });
      history.replaceState(null, '', `#${page.id}`);
    };
    const interactive = (target) => target instanceof Element &&
      (target.closest('a,button,input,textarea,select,[role="button"],[role="textbox"]') ||
        target.closest('[contenteditable]:not([contenteditable="false"])'));

    document.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || interactive(event.target)) return;
      let index;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
        index = currentIndex() + (event.key === ' ' && event.shiftKey ? -1 : 1);
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
        index = currentIndex() - 1;
      } else if (event.key === 'Home') {
        index = 0;
      } else if (event.key === 'End') {
        index = pages.length - 1;
      } else {
        return;
      }
      event.preventDefault();
      goTo(index);
    });
    root.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
          event.altKey || event.shiftKey || interactive(event.target) || window.getSelection()?.toString()) return;
      goTo(currentIndex() + 1);
    });

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const was = entry.target.classList.contains('visible');
        entry.target.classList.toggle('visible', entry.isIntersecting);
        if (entry.isIntersecting && !was) countUp(entry.target);
        const hero = heroOf(entry.target);
        if (hero && entry.isIntersecting && !was) hero.start();
        else if (hero && !entry.isIntersecting && was) hero.stop();
      }
      // Entries may describe a previous frame during rapid keyboard navigation.
      const page = pages[currentIndex()];
      if (Math.abs(page.getBoundingClientRect().top) < window.innerHeight / 2) {
        history.replaceState(null, '', `#${page.id}`);
      }
    }, { threshold: 0.5 });
    pages.forEach((page) => observer.observe(page));
    const followHash = () => {
      const index = pages.findIndex((page) => `#${page.id}` === location.hash);
      if (index >= 0) goTo(index);
    };
    window.addEventListener('hashchange', followHash);
    followHash();
  }
})();
