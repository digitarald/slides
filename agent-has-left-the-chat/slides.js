const S = (id, section, seconds, layout, data, notes, sources = [], cue = []) => ({
  id, section, seconds, layout, ...data, notes, sources, cue
});

const source = (label, href) => ({ label, href });
const SRC = {
  ahp: source('AHP overview', 'https://microsoft.github.io/agent-host-protocol/guide/what-is-ahp'),
  changelog: source('AHP changelog', 'https://github.com/microsoft/agent-host-protocol/blob/main/CHANGELOG.md'),
  multiChat: source('Multi-chat proposal', 'https://github.com/microsoft/agent-host-protocol/blob/main/docs/proposals/multi-chat.md'),
  mcp: source('MCP 2026-07-28 changes', 'https://modelcontextprotocol.io/specification/2026-07-28/changelog'),
  harness: source('GitHub Copilot harness benchmarks, June 25', 'https://github.blog/ai-and-ml/github-copilot/evaluating-performance-and-efficiency-of-the-github-copilot-agentic-harness-across-models-and-tasks/'),
  inspector: source('AHP Inspector', 'https://github.com/roblourens/ahp-inspector'),
  acp: source('ACP vs AHP discussion', 'https://github.com/microsoft/agent-host-protocol/issues/282'),
  gateway: source('AHP–ACP Gateway README', 'https://github.com/formulahendry/ahp-acp-gateway'),
  gatewayDocs: source('microsoft/agent-host-protocol#530: lists the gateway in the README and implementation guide', 'https://github.com/microsoft/agent-host-protocol/pull/530'),
  pr: (n) => source(`microsoft/vscode#${n}`, `https://github.com/microsoft/vscode/pull/${n}`),
  release: (v) => source(`VS Code 1.${v}`, `https://code.visualstudio.com/updates/v1_${v}`)
};

window.SLIDES = [
  S('title', 'Opening', 30, 'title', {
    title: 'The Agent Has Left the Chat',
    subtitle: 'Run agents anywhere. Connect from anywhere.',
    by: 'Harald Kirschner · VS Code, GitHub Copilot',
    know: [
      "This is about choice of interface and environment. It is not an argument against chat or against running agents locally."
    ]
  }, [
    "\"I work on agents in VS Code. This talk is about where an agent session lives, and who gets to connect to it.\"",
    "Let the animation run. One agent breaks out of its chat and becomes a session that many clients can join. That is the whole talk in 20 seconds."
  ]),

  S('hook', 'Opening', 35, 'statement', {
    title: 'We standardized what agents know, what they call, and how that ships.',
    lede: 'The running session still belongs to the app that started it.'
  }, [
    "Skills made know-how reusable. MCP made tools reusable. Plugins package them together.",
    "But the running session still belongs to the app that started it: an editor window, a CLI, a cloud job.",
    "Ask: \"Who has had an agent wait on an approval while you were away from the machine that started it?\"",
    "\"By the end: start an agent wherever you are, let it work where your code and tools live, and pick up the work from whatever interface you need.\"",
    "→ \"To get there, start with standards that already solved this kind of problem.\""
  ]),

  S('s1-intro', 'Four standards', 25, 'section', {
    title: 'Four standards that removed duplicated work',
    lede: 'A shared capability, instead of a separate integration for every app.',
    items: [
      { h: 'LSP', p: 'Language intelligence' },
      { h: 'Agent Skills', p: 'Team know-how' },
      { h: 'MCP', p: 'Tools and data' },
      { h: 'Agent Plugins', p: 'Workflow packages' }
    ],
    know: [
      "Dates if asked: LSP 2016, MCP November 2024, Agent Skills as an open format late 2025."
    ]
  }, [
    "Same pattern four times: everyone rebuilt the same integration, until a shared contract made it reusable.",
    "For each one: what problem developers had, and what the contract made reusable.",
    "→ Start with the one everyone knows."
  ]),

  S('lsp', 'Four standards', 45, 'psu', {
    title: 'LSP: language tools in every editor',
    math: 'M × N → M + N',
    problem: 'Every editor rebuilt completion, navigation, and diagnostics for every language.',
    spec: 'One protocol between editors and language servers.',
    unlocked: 'Ship one language server. Reach many editors.'
  }, [
    "Problem: you want good language support in the editor you use. Every editor rebuilt it for every language.",
    "Fix: separate language smarts from the UI. One server, many editors.",
    "\"Remember this shape: the capability lives in one place, and any UI can use it. We are going to apply it to agent sessions.\""
  ]),

  S('skills', 'Four standards', 45, 'split', {
    title: 'Agent Skills make workflows transferable',
    left: {
      h: 'The problem',
      items: ['Team know-how scattered across agent-specific files', 'The same workflow explained again in every tool']
    },
    right: {
      h: 'The shared format',
      items: ['One SKILL.md folder', 'Instructions, scripts, and references', 'Loaded when the task needs them']
    },
    footer: 'Write the workflow once. Use it across compatible agents.'
  }, [
    "Problem: how your team works lived in each agent's own instructions file.",
    "Skills made workflows transferable: one folder, any compatible agent.",
    "Only the description loads up front. The rest loads when the task needs it."
  ]),

  S('mcp', 'Four standards', 40, 'psu', {
    title: 'MCP: stop rebuilding every tool integration',
    math: 'M × N → M + N',
    problem: 'Every AI app wrote its own GitHub, database, and browser integrations.',
    spec: 'Servers expose tools, resources, and prompts through one protocol.',
    unlocked: 'Build the integration once. Compatible clients can use it.'
  }, [
    "Same M × N story as LSP, one layer over: agents and the tools and data they act on.",
    "Write the integration once. Any MCP client can call it.",
    "→ \"And MCP keeps moving.\""
  ]),

  S('mcp-next', 'Four standards', 45, 'list', {
    title: 'MCP is evolving beyond the original connection model',
    items: [
      { h: 'Stateless requests', p: 'The July 2026 revision removes the initialize handshake and protocol-level sessions.' },
      { h: 'An extensions framework', p: 'Tasks handle long-running work outside the protocol core.' },
      { h: 'Multi round-trip requests', p: 'Servers return input_required when they need more information from the client.' }
    ],
    know: [
      "Details: no initialize handshake and no Mcp-Session-Id; Tasks moved into an official extension; servers return input_required instead of calling back into the client."
    ]
  }, [
    "People call it \"MCP 2.0\". The official name is the 2026-07-28 revision.",
    "The headline: MCP removed sessions from the protocol. Servers scale like stateless web services. Long-running work moves into Tasks.",
    "\"Tools got easier to scale. But the agent calling them is still stateful. Where does that state live?\""
  ], [SRC.mcp]),

  S('plugins', 'Four standards', 50, 'psu', {
    title: 'Agent Plugins package a complete workflow',
    problem: 'Skills, hooks, MCP servers, and custom agents each needed separate setup.',
    spec: 'One package. Install the pieces together.',
    unlocked: 'Combine a review agent, an enforcing hook, and the tools they need.',
    limit: 'The setup still belongs to one window, on one machine.'
  }, [
    "Base problem: setup. Bigger point: useful workflows are combinations, a skill, an agent, a hook, an MCP server, that do what no single piece does alone.",
    "The turn: the package is portable, but the installed setup lives in one window, on one machine."
  ]),

  S('boundary', 'Four standards', 40, 'split', {
    title: 'The capabilities are reusable. The running session is not.',
    left: {
      h: 'You can distribute',
      items: ['Skills and instructions', 'MCP integrations', 'Plugin packages']
    },
    right: {
      h: 'The app still owns',
      items: ['Conversations and subagents', 'Pending approvals', 'Terminals and file changes']
    }
  }, [
    "\"Capabilities are reusable. The running session is not.\"",
    "\"Close the window, the agent stops\" is the familiar symptom. The real limit: no other app or machine can join the work.",
    "Editor, CLI, cloud agent: same wall.",
    "→ \"So we separated where the session runs from where you work with it.\""
  ]),

  S('s2-intro', 'Agent Host Protocol', 45, 'section', {
    title: 'Agent Host Protocol',
    lede: 'Run agents anywhere. Connect from anywhere.',
    items: [
      { h: 'Host', p: 'Owns the running sessions' },
      { h: 'Harness', p: 'Runs each agent' },
      { h: 'Clients', p: 'Show and steer the work' }
    ]
  }, [
    "AHP is an open protocol between a host that runs agent sessions and the clients that show and steer them.",
    "\"The innovation is not a new process. It is that where the agent runs and where you control it become independent.\"",
    "The host can be your laptop, a dev box, a container, or the cloud."
  ], [SRC.ahp]),

  S('choices', 'Agent Host Protocol', 50, 'columns', {
    title: 'Choose the harness, environment, and interface separately',
    cols: [
      { h: 'Harness', items: ['GitHub Copilot', 'Claude', 'Codex'] },
      { h: 'Environment', items: ['Laptop', 'Dev Container', 'Dev Box or cloud'] },
      { h: 'Interface', items: ['VS Code', 'Agents window', 'Your own client'] }
    ],
    examples: ['Claude · Dev Container on my desktop · VS Code on my laptop'],
    know: [
      "Harness choice stays conceptual. Remote continuity is the live proof."
    ]
  }, [
    "Three separate decisions: which agent, which machine has your code and tools, which interface.",
    "Example: a Claude agent in a Dev Container on my desktop, driven from VS Code on my laptop.",
    "Adapters map each agent into one session model, so a client does not have to implement every harness."
  ]),

  S('how', 'Agent Host Protocol', 60, 'host', {
    title: 'The host runs the sessions. Any client can join.',
    harnesses: ['Copilot SDK', 'Claude', 'Codex'],
    state: ['Conversations', 'Workspace and tools', 'Approvals', 'Terminals and changes'],
    clients: ['VS Code editor', 'Agents window', 'Another machine', 'Your client'],
    footer: 'One authoritative state, synchronized across clients.'
  }, [
    "The host owns session state. The harness owns the agent loop. Clients subscribe and send actions.",
    "A second client joins the existing work. It does not start another agent or copy the session.",
    "→ \"Let me show you.\""
  ], [SRC.ahp], [
    'Live continuity, about 2 minutes: start a session on the selected host, close the editor client, then join the same session from the Dev Box or second device through the prepared dev tunnel.',
    'Resolve a pending approval from the second client. Reopen the first client and show that it agrees.',
    'Keep the host running. Closing a client is not shutting down the machine that executes the agent.'
  ]),

  S('vscode-move', 'Agent Host Protocol', 45, 'timeline', {
    title: 'VS Code moved agents out of the extension host',
    items: [
      { date: 'Mar 6', tag: 'State', text: 'A shared session model' },
      { date: 'Mar 16', tag: 'Process', text: 'Agent Host starts independently' },
      { date: 'Mar 17', tag: 'Remote', text: 'Other clients can connect' },
      { date: 'Aug 5', tag: 'Sessions', text: 'Copilot CLI sessions adopt the host' },
      { date: 'Aug 26', tag: '1.135', text: 'Agent Host with the Copilot SDK', hot: true }
    ],
    footer: 'The editor is a client, not the lifetime of the work.',
    know: [
      "This is our implementation. AHP itself does not require a local process or Electron."
    ]
  }, [
    "In VS Code, this meant moving agents out of the extension host, which lives and dies with a window.",
    "Now the editor is just a client. VS Code 1.135 shipped the Agent Host with the Copilot SDK harness.",
    "→ \"That move also put one harness behind all our Copilot experiences.\""
  ], [SRC.pr(299839), SRC.pr(296627), SRC.pr(301140), SRC.pr(328512), SRC.release(135)]),

  S('sdk', 'Agent Host Protocol', 45, 'radial', {
    title: 'Copilot SDK: one harness across Copilot experiences',
    surfaces: ['Copilot CLI', 'Copilot app', 'Code review', 'VS Code', 'Your app'],
    caption: 'Improve the harness once. Every surface built on it benefits.'
  }, [
    "The harness decides which files to read, which tools to call, what context to keep, and how to recover. Most of agent quality lives there.",
    "Copilot CLI, the Copilot app, code review, and VS Code share it. Improve it once, every surface benefits.",
    "→ \"Sharing only helps if it is good. Same model, different harness:\""
  ], [SRC.harness]),

  S('bench', 'Agent Host Protocol', 60, 'benchmark', {
    title: 'Same model. Copilot CLI vs the model vendors.',
    src: 'assets/resolution-rate-vs-cost-variance-noarrow.png',
    alt: 'TerminalBench 2 mean completion rate versus cost for Copilot CLI, Codex CLI, and Claude Code, with run-to-run variance.',
    comparisons: [
      { model: 'GPT-5.5', competitor: 'Codex CLI', completion: ['74%', '73%'], cost: ['$0.59', '$0.63'] },
      { model: 'Opus 4.7', competitor: 'Claude Code', completion: ['75%', '73%'], cost: ['$1.02', '$0.99'] }
    ],
    caption: 'TerminalBench 2 · approximate chart means · ≥5 runs · ellipses show ±1σ',
    know: [
      "Numbers are rounded from the published chart. Ellipses overlap and runs vary, so do not claim a statistical win.",
      "TerminalBench 2, at least five runs per pairing, from the GitHub blog post of June 25."
    ]
  }, [
    "How to read it: up means more tasks solved, left means cheaper.",
    "\"On the vendors' own models, a shared multi-model harness stays competitive.\"",
    "Point at the numbers: GPT-5.5, about 74% vs 73% and cheaper. Opus 4.7, about 75% vs 73%, a few cents more per task."
  ], [SRC.harness]),

  S('layers', 'Agent Host Protocol', 45, 'compare', {
    title: 'Shared runtime, shared protocol, different jobs',
    cols: ['', 'Copilot SDK', 'Agent Host Protocol'],
    rows: [
      ['Job', 'Runs the agent loop', 'Connects clients to sessions'],
      ['Owns', 'Tools, context, model calls', 'Shared client-facing state'],
      ['Enables', 'One harness across products', 'Different harnesses and interfaces']
    ]
  }, [
    "Two layers, two jobs: the SDK runs the agent well; AHP makes the session reachable.",
    "AHP stays harness-agnostic. Claude and Codex adapters use the same contract without the Copilot runtime.",
    "→ \"So what does a client actually get?\""
  ], [SRC.ahp, SRC.harness]),

  S('capabilities', 'Shared sessions', 60, 'section', {
    title: 'Every client gets the whole session',
    lede: 'See the work. Answer approvals. Review the changes.',
    items: [
      { h: 'Conversations', p: 'Turns, side chats, subagents' },
      { h: 'Workspace', p: 'Folders, setup, file changes' },
      { h: 'Tools', p: 'Calls, approvals, MCP status' },
      { h: 'Live work', p: 'Terminals and progress' }
    ]
  }, [
    "A transcript is not enough. A client needs what is running, what changed, and what needs a person.",
    "AHP exposes each of these as a channel. Clients subscribe only to what they show.",
    "\"That is why a client you write can show which session needs you, without knowing which agent runs it.\""
  ], [SRC.ahp]),

  S('shared-control', 'Shared sessions', 90, 'list', {
    title: 'Join midway. Act from either client. Reconnect.',
    items: [
      { h: 'Join a session already in progress', p: 'A snapshot gives the new client the current state.' },
      { h: 'Answer from whichever device is handy', p: 'Ordered actions keep clients in sync. Stale approvals are rejected.' },
      { h: 'Come back after a dropped connection', p: 'Replay missed actions, or receive a fresh snapshot.' }
    ],
    know: [
      "Tools contributed by a client still need that client to be connected.",
      "Do not promise transparent failover or exactly-once effects across host restarts."
    ]
  }, [
    "These three are what made the demo work.",
    "Join: a snapshot, then ordered actions.",
    "Act: clients apply actions locally; the host orders them and rejects stale ones. An approval cannot be answered twice.",
    "Reconnect: replay from the last sequence number, or a fresh snapshot.",
    "→ \"None of this was designed up front.\""
  ], [SRC.ahp, SRC.inspector], [
    'Inspector, 20–30 seconds within this explanation: open a clean captured log in ahp-inspector. Show one approval action and "State at this point". Connect it to what both clients displayed.',
    'Use a prepared capture without credentials or unrelated work. The inspector is a log viewer, not another live control client.'
  ]),

  S('s4-intro', 'How the spec changed', 50, 'timeline', {
    title: 'AHP 0.2 → 1.0, May to October',
    items: [
      { date: 'May 28', tag: '0.2', text: 'Channels' },
      { date: 'Jun 6', tag: '0.3', text: 'MCP server state' },
      { date: 'Jun 19', tag: '0.4', text: 'Sessions split from chats', hot: true },
      { date: 'Aug 28', tag: '0.9', text: 'Automations and turn resume' },
      { date: 'Oct 2', tag: '1.0', text: 'Changesets, chat moves, MCP startup' }
    ],
    footer: 'Each change answered a concrete session-management problem.',
    know: [
      "Version numbers are context. The audience does not need to remember them."
    ]
  }, [
    "\"Every break in the spec came from something VS Code could not represent.\"",
    "Four stories: multiple conversations, remote setup, MCP status, scheduled work."
  ], [SRC.changelog]),

  S('split', 'How the spec changed', 60, 'split', {
    title: 'One session needed more than one conversation',
    left: {
      h: 'One transcript',
      items: ['Lead agent and workers mixed together', 'Separate sessions lost shared context']
    },
    right: {
      h: 'Shared session, separate chats',
      items: ['A conversation per agent', 'Shared workspace and setup', 'Fork or move individual chats']
    },
    know: [
      "A single-chat harness still exposes one default chat. Harnesses do not have to delegate the same way."
    ]
  }, [
    "Problem: subagents. One transcript becomes unreadable; separate sessions lose shared context.",
    "Version 0.4 split chats out of sessions. That enabled side chats, forking, and moving chats."
  ], [SRC.multiChat, SRC.changelog]),

  S('customizations', 'How the spec changed', 60, 'psu', {
    title: 'Your setup has to reach the remote host',
    labels: ['The problem', 'The change', 'The capability'],
    problem: 'Skills and custom agents live on your laptop. The session runs somewhere else.',
    spec: 'Clients send content-hashed customization bundles to the host.',
    unlocked: 'Use your setup remotely without letting unrelated workspaces overwrite each other.',
    know: [
      "Bundles are content-hashed. Workspace-scoped settings stay isolated so windows do not overwrite each other. Hooks keep harness-specific rules."
    ]
  }, [
    "Problem: your skills and agents live on your laptop. The session runs somewhere else.",
    "Copying files was the easy part. Agreeing on identity and scope was the hard part.",
    "War story: one cloud quick chat produced 702 and 355 sync updates in a single turn, because the host's /root scratch folder was mistaken for a workspace. The fix brought it to 5 and 10."
  ], [SRC.pr(327946), SRC.pr(340564)]),

  S('mcp-state', 'How the spec changed', 60, 'list', {
    title: 'Every client needs to see MCP server status',
    items: [
      { h: 'Starting or ready', p: 'The host reports live state, not just a config entry.' },
      { h: 'Needs sign-in or has failed', p: 'Clients can explain what is blocking the session.' },
      { h: 'A turn is waiting for startup', p: 'The session exposes the wait instead of appearing stuck.' }
    ],
    know: [
      "Portable config has limits: interactive variables, env files, working directories, and OAuth config."
    ]
  }, [
    "A config entry cannot tell another machine that a server crashed or needs sign-in.",
    "MCP status became session state. Every client sees starting, ready, needs sign-in, or failed.",
    "The host owns the MCP connection. Clients do not open competing ones."
  ], [SRC.changelog]),

  S('automations', 'How the spec changed', 55, 'psu', {
    title: 'Automations run without an editor connected',
    labels: ['The problem', 'The change', 'The capability'],
    problem: 'A scheduled task cannot depend on an open editor or its tools.',
    spec: 'The host owns schedules, execution, run history, and recovery.',
    unlocked: 'Start work on schedule. Reconnect later to review the result.',
    know: [
      "Local schedules still need the host running and the machine awake. GitHub cloud automations are a separate path."
    ]
  }, [
    "Scheduled work cannot wait for an editor to open.",
    "The host owns schedules, runs, and history. You reconnect later to review the result.",
    "\"The spec grew out of real product failures. Build on it, and you get those lessons for free.\"",
    "→ \"So how does this compare to other agent protocols?\""
  ], [SRC.pr(331796), SRC.pr(341542), SRC.pr(342037)]),

  S('s5-intro', 'Comparisons', 30, 'arrows', {
    title: 'Which part are you connecting?',
    rows: [
      { proto: 'ACP', from: 'One client', to: 'One agent harness' },
      { proto: 'AHP', from: 'Many clients', to: 'A host running sessions', hot: true },
      { proto: 'A2A', from: 'An agent', to: 'Another agent system' }
    ]
  }, [
    "Compare boundaries, not feature lists.",
    "ACP: one client to one agent. AHP: many clients around shared sessions. A2A: an agent to another agent system.",
    "→ Start with the closest one, ACP."
  ]),

  S('acp', 'Comparisons', 60, 'compare', {
    title: 'ACP vs AHP',
    cols: ['', 'ACP', 'AHP'],
    rows: [
      ['Connection', 'One client ↔ one harness', 'Many clients ↔ one host'],
      ['A client joins', 'Application supplies shared access', 'Snapshot of the live session'],
      ['Concurrent actions', 'Application coordinates clients', 'Ordered, reconciled shared actions'],
      ['Connection drops', 'Load or resume the session', 'Replay missed actions or replace state']
    ],
    know: [
      "This compares stable ACP v1. ACP v2 is a draft exploring multi-client observation.",
      "One ACP connection can manage several sessions; it is still one client.",
      "Do not mention any vendor's private plans."
    ]
  }, [
    "ACP is good at what it was built for: embedding an agent in an editor.",
    "AHP adds what a second client needs: joining live work, concurrent actions, recovery after a disconnect, shared approvals.",
    "You can build those around ACP. AHP puts them in the contract.",
    "→ \"And the two combine.\""
  ], [SRC.acp]),

  S('gateway', 'Comparisons', 45, 'gateway', {
    title: 'ACP agents can join an AHP workbench',
    lede: 'Just landed: a community gateway, now in the AHP implementation guide.',
    chain: ['Clients', 'AHP', 'AHP–ACP Gateway', 'ACP', 'Existing ACP agent'],
    roles: [
      { proto: 'AHP', text: 'Exposes shared sessions to clients' },
      { proto: 'ACP', text: 'Connects the gateway to the harness' }
    ],
    know: [
      "Community project, not Microsoft. Repository created October 15; microsoft/agent-host-protocol#530 added it to the README and implementation guide.",
      "Its README describes an AHP WebSocket server, SQLite-backed sessions, multi-client observation, reconnect with replay or snapshot, permissions and cancellation, and ACP subprocess lifecycle. It documents connecting from the VS Code Agents window.",
      "#530 is documentation, not a protocol change. I read the docs but have not run the gateway, so it is not a demo."
    ]
  }, [
    "Just landed: a community-built gateway, listed in the AHP docs on October 16.",
    "\"You don't have to replace an agent's ACP integration. A gateway can use ACP to run the agent and AHP to expose its sessions to multiple clients.\"",
    "It proves the point of the talk: the agent and the interface are independent choices."
  ], [SRC.gateway, SRC.gatewayDocs]),

  S('a2a', 'Comparisons', 50, 'compare', {
    title: 'A2A vs AHP',
    cols: ['', 'A2A', 'AHP'],
    rows: [
      ['Connects', 'Agent to independent agent system', 'Clients to sessions on a host'],
      ['Work', 'Tasks, messages, artifacts', 'Sessions, chats, approvals, changes'],
      ['Visibility', 'Agent Card and task outputs', 'Client-facing session state'],
      ['Purpose', 'Delegate work to another system', 'Observe and steer running work']
    ],
    know: [
      "The AHP plus A2A combination is an architecture possibility, not a shipped integration."
    ]
  }, [
    "A2A delegates to an independent agent system. You get tasks and artifacts, not its internals.",
    "AHP is for observing and steering your own sessions.",
    "They stack: an agent in an AHP session can delegate to an A2A agent.",
    "→ \"Enough contract. Here is what it lets us build.\""
  ]),

  S('s6-intro', 'Live demonstrations', 20, 'statement', {
    title: 'The next client does not have to look like an editor.',
    lede: 'An Agents window. A canvas. A game. Your client next.'
  }, [
    "Same session, different interfaces.",
    "The Agents window and the game are AHP clients. A canvas is UI inside a client."
  ], [SRC.pr(339596)], [
    'Live demonstrations, about 2–3 minutes total: show the Agents window across projects, then the existing canvas interaction.',
    'Finish in the completed 3D game. Show agent activity, and only show actions such as approval if the existing game supports them.',
    'No separate slides for these demos. Return directly to the closing slide.'
  ]),

  S('close', 'Close', 45, 'statement', {
    title: 'Run agents anywhere. Connect from anywhere.',
    commands: ['microsoft/agent-host-protocol', 'npx ahp-inspector', 'code-insiders agent endpoints'],
    know: [
      "code-insiders agent endpoints prints connection credentials. Never show its output."
    ]
  }, [
    "Callback: LSP separated language smarts from the editor. Skills, MCP, and plugins made capabilities reusable. AHP does the same for the running session.",
    "If you use agents: try it today in the VS Code Agents window.",
    "If you build tools or UIs: write an AHP client. The spec and the inspector are on screen.",
    "If you build software factories for your team or company: treat sessions as infrastructure. Run agents near the code, route attention to the right person, and let people use whatever interface fits.",
    "\"Your editor is one way to meet your agent. It shouldn't decide where the work runs or which agent you use.\""
  ], [SRC.ahp, SRC.inspector])
];
