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
    by: 'Harald Kirschner · VS Code, GitHub Copilot'
  }, [
    '"I work on agents in VS Code. This talk is about where an agent session lives, and who gets to connect to it."',
    'The title is about choice of interface and execution environment. It is not an argument against chat or against running agents locally.'
  ]),

  S('hook', 'Opening', 35, 'statement', {
    title: 'We standardized what agents know, what they call, and how that ships.',
    lede: 'The running session still belongs to the app that started it.'
  }, [
    'Skills made know-how reusable. MCP made integrations reusable. Agent Plugins bundle them into workflows.',
    'But the session still belongs to an editor, a CLI, or a cloud job. Opening that same live work in another interface usually means building a custom bridge.',
    '"Who has had an agent wait for approval while you were away from the machine that started it?"'
  ]),

  S('s1-intro', 'Four standards', 25, 'section', {
    title: 'Four standards that removed duplicated work',
    lede: 'A shared capability, instead of a separate integration for every app.',
    items: [
      { h: 'LSP', p: 'Language intelligence' },
      { h: 'Agent Skills', p: 'Team know-how' },
      { h: 'MCP', p: 'Tools and data' },
      { h: 'Agent Plugins', p: 'Workflow packages' }
    ]
  }, [
    'Each standard answers two questions: what problem did developers have, and what shared contract removed the repeated work?',
    'Start with language servers. They are the familiar version of the separation we are about to make for agents.'
  ]),

  S('lsp', 'Four standards', 45, 'psu', {
    title: 'LSP: language tools in every editor',
    math: 'M × N → M + N',
    problem: 'Every editor rebuilt completion, navigation, and diagnostics for every language.',
    spec: 'One protocol between editors and language servers.',
    unlocked: 'Ship one language server. Reach many editors.'
  }, [
    'The user problem was simple: I need good language support in the editor I use.',
    'The integration problem was expensive: each editor implemented support for each language. LSP separated language intelligence from the UI.',
    'A language team could ship one server instead of rebuilding completion, navigation, and diagnostics for every editor.'
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
    'An agent needs to know how your team does the task. That knowledge used to live in tool-specific instructions and repeated prompts.',
    'Skills make the workflow transferable between agents. The same folder can be used by compatible Copilot, Claude Code, and Codex clients.',
    'The description is available up front. The full instructions, scripts, and references load when needed, rather than filling every prompt.'
  ]),

  S('mcp', 'Four standards', 40, 'psu', {
    title: 'MCP: stop rebuilding every tool integration',
    math: 'M × N → M + N',
    problem: 'Every AI app wrote its own GitHub, database, and browser integrations.',
    spec: 'Servers expose tools, resources, and prompts through one protocol.',
    unlocked: 'Build the integration once. Compatible clients can use it.'
  }, [
    'Agents need access to the systems where work happens. Tool vendors should not have to build a separate integration for every AI application.',
    'MCP puts that integration behind a common server contract. It is the same duplication problem as LSP, applied to tools and data.',
    'And the protocol has kept evolving beyond its original connection model.'
  ]),

  S('mcp-next', 'Four standards', 45, 'list', {
    title: 'MCP is evolving beyond the original connection model',
    items: [
      { h: 'Stateless requests', p: 'The July 2026 revision removes the initialize handshake and protocol-level sessions.' },
      { h: 'An extensions framework', p: 'Tasks handle long-running work outside the protocol core.' },
      { h: 'Multi round-trip requests', p: 'Servers return input_required when they need more information from the client.' }
    ]
  }, [
    'People sometimes call this "MCP 2.0". The official revision is 2026-07-28.',
    'Requests carry their version and capabilities. Servers no longer depend on an initialize handshake or Mcp-Session-Id.',
    'Long-running state moves into explicit task handles. Sampling and elicitation use input-required results and retries, rather than server-initiated calls.',
    'The tool connection is getting easier to scale. The agent session calling those tools is still stateful. Where does that state live?'
  ], [SRC.mcp]),

  S('plugins', 'Four standards', 50, 'psu', {
    title: 'Agent Plugins package a complete workflow',
    problem: 'Skills, hooks, MCP servers, and custom agents each needed separate setup.',
    spec: 'One package. Install the pieces together.',
    unlocked: 'Combine a review agent, an enforcing hook, and the tools they need.',
    limit: 'The setup still belongs to one window, on one machine.'
  }, [
    'Packaging is the base problem. The bigger change is that useful workflows are combinations of capabilities.',
    'A skill describes a review process. An agent performs it. A hook enforces a step. An MCP server supplies the evidence. Together they do something none of the pieces does alone.',
    'The package is reusable, but the active setup is still attached to the application and machine where you installed it.'
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
    'An editor window is one example, not the whole problem. The same boundary exists around a CLI or a cloud agent.',
    '"Close the window, the agent stops" is the familiar symptom. The bigger limitation is that another app or machine cannot just join the work.',
    'We want the session to be reachable without making its execution environment and its UI the same thing.'
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
    'AHP is an open protocol between a host that runs agent sessions and the clients that interact with them.',
    'The important change is not a new process on your laptop. It is independence between where an agent runs and where you control it.',
    'A host can be local, on a dev box, in a container, or remote. More than one client can connect to the same session.'
  ], [SRC.ahp]),

  S('choices', 'Agent Host Protocol', 50, 'columns', {
    title: 'Choose the harness, environment, and interface separately',
    cols: [
      { h: 'Harness', items: ['GitHub Copilot', 'Claude', 'Codex'] },
      { h: 'Environment', items: ['Laptop', 'Dev Container', 'Dev Box or cloud'] },
      { h: 'Interface', items: ['VS Code', 'Agents window', 'Your own client'] }
    ],
    examples: ['Claude · Dev Container on my desktop · VS Code on my laptop']
  }, [
    'These are three different decisions. The agent you want, the machine that has your code and tools, and the interface you want to use.',
    'For example, a Claude agent in a Dev Container on a desktop, controlled from VS Code on a laptop.',
    'Harness adapters translate the different agents into the same client-facing session model. The client does not need to implement every harness.'
  ]),

  S('how', 'Agent Host Protocol', 60, 'host', {
    title: 'The host runs the sessions. Any client can join.',
    harnesses: ['Copilot SDK', 'Claude', 'Codex'],
    state: ['Conversations', 'Workspace and tools', 'Approvals', 'Terminals and changes'],
    clients: ['VS Code editor', 'Agents window', 'Another machine', 'Your dashboard'],
    footer: 'One authoritative state, synchronized across clients.'
  }, [
    'The host owns the session state. Each client receives the state it needs and can send actions back.',
    'The agent harness owns the agent loop. Adapters expose its conversations, tool calls, approvals, and file changes through AHP.',
    'A second client joins the existing work. It does not start another agent or invent its own copy of the session.'
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
    footer: 'The editor is a client, not the lifetime of the work.'
  }, [
    'The extension host is tied to a VS Code window. Long-running sessions needed a different owner.',
    'VS Code introduced the Agent Host, remote connections, and a shared state model. Copilot sessions moved to the SDK-backed harness.',
    'This is the VS Code implementation of the separation. AHP does not require an Electron utility process or a local machine.'
  ], [SRC.pr(299839), SRC.pr(296627), SRC.pr(301140), SRC.pr(328512), SRC.release(135)]),

  S('sdk', 'Agent Host Protocol', 45, 'radial', {
    title: 'Copilot SDK: one harness across Copilot experiences',
    surfaces: ['Copilot CLI', 'Copilot app', 'Code review', 'VS Code', 'Your app'],
    caption: 'Improve the harness once. Every surface built on it benefits.'
  }, [
    'The harness decides which files to read, which tools to call, how to manage context, and how to recover after a failed command.',
    'VS Code runs Copilot sessions through the same SDK-backed harness as the CLI.',
    'An improvement to that harness benefits the experiences built on it. Sharing a runtime is useful only if it performs well, so let us compare the same models in different harnesses.'
  ], [SRC.harness]),

  S('bench', 'Agent Host Protocol', 60, 'benchmark', {
    title: 'Same model. Copilot CLI vs the model vendors.',
    src: 'assets/resolution-rate-vs-cost-variance-noarrow.png',
    alt: 'TerminalBench 2 mean completion rate versus cost for Copilot CLI, Codex CLI, and Claude Code, with run-to-run variance.',
    comparisons: [
      { model: 'GPT-5.5', competitor: 'Codex CLI', completion: ['74%', '73%'], cost: ['$0.59', '$0.63'] },
      { model: 'Opus 4.7', competitor: 'Claude Code', completion: ['75%', '73%'], cost: ['$1.02', '$0.99'] }
    ],
    caption: 'TerminalBench 2 · approximate chart means · ≥5 runs · ellipses show ±1σ'
  }, [
    'This is the former C comparison. Each point uses the same model in a different harness. Up means more tasks completed. Left means lower cost.',
    'Rounded from the chart: with GPT-5.5, Copilot CLI completes about 74% at $0.59 per task, versus about 73% at $0.63 for Codex CLI.',
    'With Opus 4.7, Copilot CLI completes about 75% at $1.02, versus about 73% at $0.99 for Claude Code. This pairing is slightly more expensive, not cheaper.',
    'These are approximate means read from the published chart, not a raw results table. Ellipses overlap, so describe this as competitive performance, not a statistically established win.',
    'The point for this talk: a shared, multi-model harness can remain competitive with the vendors on their own models.'
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
    'The SDK and AHP solve different problems. The SDK is how we run the Copilot harness. AHP is how clients watch and steer the sessions.',
    'AHP stays harness-agnostic. Claude and Codex adapters can expose the same session contract without adopting the Copilot runtime.'
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
    'A transcript alone cannot support an agent interface. A client also needs to know what is running, what changed, and what needs a person.',
    'AHP exposes these as subscribable resources, called channels. Clients load only what they show.',
    'The developer benefit is a common representation. A dashboard can show attention across sessions without understanding every harness or replaying all of its history.'
  ], [SRC.ahp]),

  S('shared-control', 'Shared sessions', 90, 'list', {
    title: 'Join midway. Act from either client. Reconnect.',
    items: [
      { h: 'Join a session already in progress', p: 'A snapshot gives the new client the current state.' },
      { h: 'Answer from whichever device is handy', p: 'Ordered actions keep clients in sync. Stale approvals are rejected.' },
      { h: 'Come back after a dropped connection', p: 'Replay missed actions, or receive a fresh snapshot.' }
    ]
  }, [
    'These are the capabilities behind the cross-device demo, not three different product features bolted onto a transcript.',
    'A joining client receives a snapshot and then sequenced actions. Host and clients apply the same reducers.',
    'Clients can apply actions optimistically. The host accepts or rejects them and orders the authoritative stream. If another client already resolved an approval, a stale answer cannot resolve it again.',
    'On reconnect the client supplies its last-seen sequence. The host replays the gap or replaces it with a snapshot. Client-contributed tools still depend on that client being available.'
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
    footer: 'Each change answered a concrete session-management problem.'
  }, [
    'The spec and VS Code implementation evolved together. Features exposed places where the original session model was too small.',
    'The next examples follow that pattern: multiple conversations, remote setup, live tool status, and scheduled work.',
    'Release numbers explain the sequence. The audience does not need to memorize them.'
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
    }
  }, [
    'The multi-chat proposal identifies a modeling failure: flatten everything into one transcript and it becomes unreadable. Split everything into independent sessions and the related work loses its shared context.',
    'Version 0.4 moved conversation fields out of SessionState into chat channels. A single-chat harness can still expose just one default chat.',
    'That split supported side chats, chat-level forking, and later moving chats between sessions. It did not require every harness to implement delegation identically.'
  ], [SRC.multiChat, SRC.changelog]),

  S('customizations', 'How the spec changed', 60, 'psu', {
    title: 'Your setup has to reach the remote host',
    labels: ['The problem', 'The change', 'The capability'],
    problem: 'Skills and custom agents live on your laptop. The session runs somewhere else.',
    spec: 'Clients send content-hashed customization bundles to the host.',
    unlocked: 'Use your setup remotely without letting unrelated workspaces overwrite each other.'
  }, [
    'Copying the files was only part of the problem. Clients and hosts also had to agree on workspace scope and bundle identity.',
    'Default locations can be discovered by the host. Non-default client files become contributed bundles. Workspace-scoped settings stay isolated. Hooks retain harness-specific rules.',
    'A concrete bug: a workspace-less quick chat received the host scratch directory, /root. A publisher mistook it for a workspace, so two publishers alternated bundle identities and retried failed loads.',
    'One turn produced 702 active-client records and 355 customization-change records. Preserving empty roots and deduplicating unchanged publications reduced the next run to 5 and 10. Identity and ownership mattered more than file transfer.'
  ], [SRC.pr(327946), SRC.pr(340564)]),

  S('mcp-state', 'How the spec changed', 60, 'list', {
    title: 'Every client needs to see MCP server status',
    items: [
      { h: 'Starting or ready', p: 'The host reports live state, not just a config entry.' },
      { h: 'Needs sign-in or has failed', p: 'Clients can explain what is blocking the session.' },
      { h: 'A turn is waiting for startup', p: 'The session exposes the wait instead of appearing stuck.' }
    ]
  }, [
    'A config entry cannot tell another machine whether a server started, crashed, or needs authorization.',
    'MCP server customizations became typed session state in 0.3. State changes travel through the same authoritative action stream. Version 1.0 adds the state for a turn waiting on startup.',
    'The host owns the MCP connection. Another client does not create a competing connection just to understand the status.',
    'Authorization-required state includes the resource and scopes. Portable configuration still has limits, including interactive variables, env files, working directories, and OAuth configuration.'
  ], [SRC.changelog]),

  S('automations', 'How the spec changed', 55, 'psu', {
    title: 'Automations run without an editor connected',
    labels: ['The problem', 'The change', 'The capability'],
    problem: 'A scheduled task cannot depend on an open editor or its tools.',
    spec: 'The host owns schedules, execution, run history, and recovery.',
    unlocked: 'Start work on schedule. Reconnect later to review the result.'
  }, [
    'Automation catalog and run channels arrived in 0.9. VS Code moved execution into the host instead of relying on an editor client.',
    'A scheduled run has a synthetic active client that contributes no editor tools. The run cannot assume an extension will wake up to handle a call.',
    'Follow-up fixes waited for a machine to finish waking and allowed overlapping scheduled occurrences. They are examples of the ownership problem continuing beyond the first implementation.',
    'A local schedule still needs its host running and its machine available. GitHub cloud automations are a separate execution path.'
  ], [SRC.pr(331796), SRC.pr(341542), SRC.pr(342037)]),

  S('s5-intro', 'Comparisons', 30, 'arrows', {
    title: 'Which part are you connecting?',
    rows: [
      { proto: 'ACP', from: 'One client', to: 'One agent harness' },
      { proto: 'AHP', from: 'Many clients', to: 'A host running sessions', hot: true },
      { proto: 'A2A', from: 'An agent', to: 'Another agent system' }
    ]
  }, [
    'These protocols sit at different boundaries. Compare the connection they standardize before comparing feature names.',
    'ACP connects a client to a harness. AHP coordinates clients around shared sessions. A2A delegates work to another agent system.',
    'Start with the closer comparison, ACP.'
  ]),

  S('acp', 'Comparisons', 60, 'compare', {
    title: 'ACP vs AHP',
    cols: ['', 'ACP', 'AHP'],
    rows: [
      ['Connection', 'One client ↔ one harness', 'Many clients ↔ one host'],
      ['A client joins', 'Application supplies shared access', 'Snapshot of the live session'],
      ['Concurrent actions', 'Application coordinates clients', 'Ordered, reconciled shared actions'],
      ['Connection drops', 'Load or resume the session', 'Replay missed actions or replace state']
    ]
  }, [
    'Stable ACP v1 is designed around a client-to-harness connection. One connection can manage multiple sessions, so do not confuse one connection with one session.',
    'Its session list, load, and resume capabilities are useful. They do not define the same shared authority, multi-client reconciliation, or gap-aware recovery contract as AHP.',
    'A product can build those things around ACP. AHP includes them in the client-facing contract.',
    'ACP v2 explores multi-client observation. This comparison uses stable ACP v1, not draft goals.'
  ], [SRC.acp]),

  S('gateway', 'Comparisons', 45, 'gateway', {
    title: 'ACP agents can join an AHP workbench',
    lede: 'Just landed: a community gateway, now in the AHP implementation guide.',
    chain: ['Clients', 'AHP', 'AHP–ACP Gateway', 'ACP', 'Existing ACP agent'],
    roles: [
      { proto: 'AHP', text: 'Exposes shared sessions to clients' },
      { proto: 'ACP', text: 'Connects the gateway to the harness' }
    ]
  }, [
    'Open with the news: this is freshly in. The gateway repository appeared on October 15, and the AHP README and implementation guide started listing it on October 16. It is a community project, not a Microsoft one.',
    '"You don\u2019t have to replace an agent\u2019s ACP integration. A gateway can use ACP to run the agent and AHP to expose its sessions to multiple clients."',
    'The two protocols work at different boundaries. ACP stays between the gateway and the harness. AHP sits in front of it, so VS Code and other AHP clients share the same sessions.',
    'The AHP–ACP Gateway README describes an AHP WebSocket server, persistent SQLite-backed session state, multi-client observation, bounded reconnect and replay with snapshot fallback, permissions and cancellation, and lifecycle management for the ACP agent subprocess. It documents connecting from the VS Code Agents window to configured ACP providers.',
    'microsoft/agent-host-protocol#530, merged October 16, added the gateway to the README and implementation guide. That is ecosystem documentation, not a new wire-protocol feature.',
    'Treat this as evidence that harness, environment, and interface choices are independent. It is not a demo: I inspected the documentation but have not run the gateway.'
  ], [SRC.gateway, SRC.gatewayDocs]),

  S('a2a', 'Comparisons', 50, 'compare', {
    title: 'A2A vs AHP',
    cols: ['', 'A2A', 'AHP'],
    rows: [
      ['Connects', 'Agent to independent agent system', 'Clients to sessions on a host'],
      ['Work', 'Tasks, messages, artifacts', 'Sessions, chats, approvals, changes'],
      ['Visibility', 'Agent Card and task outputs', 'Client-facing session state'],
      ['Purpose', 'Delegate work to another system', 'Observe and steer running work']
    ]
  }, [
    'A2A is for working with an independent agent system. An Agent Card describes what it can do; tasks produce messages and artifacts.',
    'AHP lets interfaces observe and steer a host session. It exposes the state needed by a client, rather than promising visibility into every private harness detail.',
    'They can coexist. An agent inside an AHP session could delegate to an A2A service. That is an architectural combination, not a claim of a shipped integration.'
  ]),

  S('s6-intro', 'Live demonstrations', 20, 'statement', {
    title: 'The next client does not have to look like an editor.',
    lede: 'An Agents window. A canvas. A dashboard. A game.'
  }, [
    'We have covered the contract and how it changed. Now return to the interfaces that contract makes possible.',
    'An Agents window and a custom dashboard are clients of the session. A canvas is UI within an existing client. Keep that distinction clear.',
    'The game is the final reveal. Show it working without explaining its implementation.'
  ], [SRC.pr(339596)], [
    'Live demonstrations, about 2–3 minutes total: show the Agents window across projects, then the existing canvas interaction.',
    'Open the prepared dashboard and show the same session state. If its build was started before the talk, this is the payoff.',
    'Finish in the completed 3D game. Show agent activity, and only show actions such as approval if the existing game supports them.',
    'No separate slides for these demos. Return directly to the closing slide.'
  ]),

  S('close', 'Close', 45, 'statement', {
    title: 'Run agents anywhere. Connect from anywhere.',
    commands: ['microsoft/agent-host-protocol', 'npx ahp-inspector', 'code-insiders agent endpoints']
  }, [
    'LSP separated language intelligence from the editor. Skills, MCP, and plugins made agent capabilities reusable.',
    'AHP applies that separation to the running session. Choose the harness, choose where the work runs, and connect with the interface you need.',
    'Read the spec, inspect a clean log, or build a client against your own host. Endpoint discovery returns connection credentials, so keep its output private.'
  ], [SRC.ahp, SRC.inspector])
];
