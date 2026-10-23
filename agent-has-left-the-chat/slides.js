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
    "title": "The Agent Has Left the Chat",
    "subtitle": "How any app can join a running agent session",
    "by": "Harald Kirschner · VS Code, GitHub Copilot",
    "know": [
      "This is about choice of interface and environment. It is not an argument against chat or against running agents locally."
    ]
  }, [
    "\"I work on agents in VS Code. This talk is about where an agent session lives, and who gets to connect to it.\"",
    "Let the animation run. One agent breaks out of its chat and becomes a session that many clients can join. That loop is the whole talk."
  ]),

  S('problem', 'Opening', 45, 'problem', {
    "title": "Your agent is waiting on you, and you're on another machine",
    "lede": "Your session lives in the app that started it.",
    "app": "The app that started it",
    "clients": [
      "Your phone",
      "A browser",
      "Another machine"
    ],
    "know": [
      "Keep the problem broad. Closing a window is one symptom; the real limit is that no other app or machine can join the work."
    ]
  }, [
    "Agents now run for hours. They edit files, run terminals, and stop to ask for approval.",
    "Ask: \"Who has had an agent wait on an approval while you were away from the machine that started it?\"",
    "That session lives in one app, whether that's an editor window, a CLI, or a cloud job. Your phone, a browser, or your other machine can't open it.",
    "\"By the end: start an agent wherever you are, let it work where your code and tools live, and pick up the work from whatever interface you need.\"",
    "→ \"We've solved this kind of problem four times before.\""
  ]),

  S('s1-intro', 'Four standards', 25, 'section', {
    "title": "We've fixed this kind of problem four times already",
    "lede": "Each time, every app rebuilt the same integration until one standard replaced it.",
    "items": [
      {
        "h": "LSP",
        "p": "Language support"
      },
      {
        "h": "AGENTS.md and Skills",
        "p": "Team know-how"
      },
      {
        "h": "MCP",
        "p": "Tools and data"
      },
      {
        "h": "Agent Plugins",
        "p": "Bundled workflows"
      }
    ],
    "know": [
      "Dates if asked: LSP 2016, MCP November 2024, AGENTS.md and Agent Skills as open formats in 2025."
    ]
  }, [
    "Four standards, one pattern. For each, say what developers kept rebuilding and what the standard made reusable.",
    "→ Start with the one everyone knows."
  ]),

  S('lsp', 'Four standards', 45, 'psu', {
    "title": "LSP let one language server work in every editor",
    "math": "M × N → M + N",
    "problem": "Each editor built completion, navigation, and diagnostics for each language.",
    "spec": "Editors and language servers speak one protocol.",
    "unlocked": "A language team ships one server. Every editor uses it."
  }, [
    "You want good language support in the editor you use. Before LSP, every editor rebuilt it for every language.",
    "LSP separated the language smarts from the UI. One server, many editors.",
    "\"Remember this shape: the capability lives in one place, and any UI can use it. We're going to apply it to agent sessions.\""
  ]),

  S('know-how', 'Four standards', 50, 'knowhow', {
    "title": "AGENTS.md and Skills give every agent the same project docs and workflows",
    "specs": [
      {
        "h": "AGENTS.md",
        "what": "Project docs for agents",
        "when": "Read every time",
        "before": [
          "CLAUDE.md",
          ".cursorrules",
          "copilot-instructions.md"
        ],
        "rows": [
          "How to build and test",
          "Code style",
          "Repo conventions"
        ]
      },
      {
        "h": "Agent Skills",
        "what": "Reusable workflows",
        "when": "Loaded on demand",
        "before": [
          "Pasted prompts",
          "Custom commands",
          "Agent-specific workflows"
        ],
        "rows": [
          "review-pr/SKILL.md",
          "scripts/",
          "references/"
        ]
      }
    ],
    "agents": [
      "GitHub Copilot",
      "Codex",
      "Other agents"
    ],
    "footer": "Two open formats. Write them once, and every compatible agent reads them."
  }, [
    "Two standards for two kinds of know-how.",
    "AGENTS.md is the README for agents: how to build, test, and follow your conventions. It replaced a different instructions file for every agent.",
    "Skills are reusable workflows, like reviewing a PR. Before, they were pasted prompts or tool-specific commands. Only a skill's description loads up front. The instructions, scripts, and references load when the task needs them.",
    "\"Your project docs and your workflows now move between agents.\""
  ]),

  S('mcp', 'Four standards', 40, 'psu', {
    "title": "MCP lets you build a Slack integration once, sign-in included",
    "math": "M × N → M + N",
    "problem": "Every AI app built its own Slack, database, and browser integration, including sign-in.",
    "spec": "A server exposes tools, resources, and prompts over one protocol, with standard OAuth.",
    "unlocked": "You build the Slack server once, and every MCP client can use it.",
    "know": [
      "MCP authorization uses OAuth 2.1 for remote servers. Each client still signs in on its own; the server is built once."
    ]
  }, [
    "Same M × N story as LSP, one layer over. This time it's agents and the tools and data they act on.",
    "Sign-in is often the hard part of a real integration. MCP standardizes that too.",
    "→ \"And MCP keeps moving.\""
  ], [SRC.mcp]),

  S('mcp-next', 'Four standards', 45, 'list', {
    "title": "The next MCP spec drops protocol sessions",
    "items": [
      {
        "h": "No session handshake",
        "p": "Every request carries its own version and capabilities."
      },
      {
        "h": "Long-running work moves to Tasks",
        "p": "An official extension handles work that outlasts one request."
      },
      {
        "h": "Servers ask for input in the result",
        "p": "They return input_required instead of calling the client back."
      }
    ],
    "know": [
      "Details: no initialize handshake and no Mcp-Session-Id; Tasks moved into an official extension; servers return input_required instead of calling back into the client."
    ]
  }, [
    "People call it \"MCP 2.0\". The official name is the 2026-07-28 revision.",
    "The headline: MCP removed sessions from the protocol. Servers scale like stateless web services. Long-running work moves into Tasks.",
    "\"Tools got easier to scale. The agent calling them still holds the state.\" Hold that thought.",
    "→ \"Tools are portable. Next, whole workflows.\""
  ], [SRC.mcp]),

  S('plugins', 'Four standards', 50, 'psu', {
    "title": "Agent Plugins install a whole workflow in one step",
    "problem": "You set up skills, hooks, MCP servers, and custom agents one by one.",
    "spec": "One plugin installs them together.",
    "unlocked": "You get a review agent, the hook that enforces it, and its tools in one install.",
    "limit": "But you install it in one window, on one machine."
  }, [
    "Setup is the obvious problem. The bigger point is that useful workflows are combinations. A skill, an agent, a hook, and an MCP server together do what none of them does alone.",
    "Then the catch. You can share the package, but once installed it lives in one window on one machine.",
    "→ \"Step back and look at what we made portable.\""
  ]),

  S('boundary', 'Four standards', 40, 'split', {
    "title": "You can share your setup, but not a running session",
    "left": {
      "h": "You can share",
      "items": [
        "Instructions and skills",
        "MCP servers",
        "Plugins"
      ]
    },
    "right": {
      "h": "The app still owns",
      "items": [
        "Conversations and subagents",
        "Pending approvals",
        "Terminals and file changes"
      ]
    }
  }, [
    "\"You can share your setup, but not a running session.\"",
    "Pay off the MCP thought. Tools went stateless, so the state lives with the agent, and today that means inside one app.",
    "That's the problem from the start. No other app or machine can join the work. Editor, CLI, or cloud agent, it's the same wall.",
    "→ \"So we separated where the session runs from where you work with it.\""
  ]),

  S('s2-intro', 'Agent Host Protocol', 45, 'section', {
    "title": "Agent Host Protocol",
    "lede": "An open protocol that lets any app connect to agent sessions running on a host.",
    "items": [
      {
        "h": "Host",
        "p": "Runs your agent sessions"
      },
      {
        "h": "Harness",
        "p": "The agent itself, like Copilot or Claude"
      },
      {
        "h": "Clients",
        "p": "The apps you use to watch and steer"
      }
    ],
    "clients": [
      "Editor",
      "Agents window",
      "Browser",
      "Your client"
    ]
  }, [
    "AHP is an open protocol between a host that runs agent sessions and the clients that show and steer them.",
    "\"Where the agent runs and where you control it are now separate choices.\" That matters more than any new process.",
    "Clients include the editor, the Agents window, and a browser at vscode.dev/agents. The host can be your laptop, a dev box, a container, or the cloud.",
    "→ \"That gives you three choices.\""
  ], [SRC.ahp]),

  S('choices', 'Agent Host Protocol', 50, 'columns', {
    "title": "Choose the agent, where it runs, and how you work with it",
    "cols": [
      {
        "h": "Harness",
        "items": [
          "GitHub Copilot",
          "Claude",
          "Codex"
        ]
      },
      {
        "h": "Environment",
        "items": [
          "Laptop",
          "Dev Container",
          "Dev Box or cloud"
        ]
      },
      {
        "h": "Interface",
        "items": [
          "VS Code",
          "Agents window",
          "Browser",
          "Your own client"
        ]
      }
    ],
    "examples": [
      "Claude in a Dev Container on my desktop, used from VS Code on my laptop"
    ],
    "know": [
      "Harness choice stays conceptual. Remote continuity is the live proof."
    ]
  }, [
    "Point at the example. A Claude agent in a Dev Container on my desktop, used from VS Code on my laptop.",
    "Adapters map each agent into one session model, so a client doesn't have to support every harness.",
    "→ \"Start with the harness.\""
  ]),

  S('sdk', 'Agent Host Protocol', 55, 'radial', {
    "title": "Every Copilot product runs on the same agent harness",
    "surfaces": [
      "Copilot CLI",
      "Copilot app",
      "Code review",
      "VS Code",
      "Your app"
    ],
    "caption": "When we improve the harness, the CLI, the app, code review, and VS Code all get it."
  }, [
    "For Copilot, the harness is the Copilot SDK. VS Code, the CLI, the Copilot app, and code review all run it.",
    "The harness decides which files to read, which tools to call, what context to keep, and how to recover. Most of an agent's quality lives there.",
    "\"The SDK runs the agent. AHP connects the clients.\" AHP stays harness-agnostic, so Claude and Codex adapters use the same contract.",
    "→ \"Sharing a harness only helps if it's good. Same model, different harness:\""
  ], [SRC.harness]),

  S('bench', 'Agent Host Protocol', 60, 'benchmark', {
    "title": "Copilot CLI keeps up with Claude Code and Codex CLI on their own models",
    "src": "assets/resolution-rate-vs-cost-variance-noarrow.png",
    "alt": "TerminalBench 2 mean completion rate versus cost for Copilot CLI, Codex CLI, and Claude Code, with run-to-run variance.",
    "comparisons": [
      {
        "model": "GPT-5.5",
        "competitor": "Codex CLI",
        "completion": [
          "74%",
          "73%"
        ],
        "cost": [
          "$0.59",
          "$0.63"
        ]
      },
      {
        "model": "Opus 4.7",
        "competitor": "Claude Code",
        "completion": [
          "75%",
          "73%"
        ],
        "cost": [
          "$1.02",
          "$0.99"
        ]
      }
    ],
    "caption": "TerminalBench 2 · rounded from GitHub's chart · 5+ runs each · ellipses show run-to-run spread",
    "know": [
      "Numbers are rounded from the published chart. Ellipses overlap and runs vary, so do not claim a statistical win.",
      "TerminalBench 2, at least five runs per pairing, from the GitHub blog post of June 25."
    ]
  }, [
    "Up means more tasks solved. Left means cheaper.",
    "\"On the vendors' own models, a shared multi-model harness stays competitive.\"",
    "Point at the numbers. GPT-5.5 is about 74% vs 73%, and cheaper. Opus 4.7 is about 75% vs 73%, at a few cents more per task.",
    "→ \"Whichever harness you pick, the host runs the session. Here's how.\""
  ], [SRC.harness]),

  S('how', 'Agent Host Protocol', 60, 'host', {
    "title": "Any app can join a session running on the host",
    "harnesses": [
      "Copilot SDK",
      "Claude",
      "Codex"
    ],
    "state": [
      "Conversations",
      "Workspace and tools",
      "Approvals",
      "Terminals and changes"
    ],
    "clients": [
      "VS Code",
      "Agents window",
      "Browser",
      "Your client"
    ],
    "footer": "Every app sees the same state, because the host holds it.",
    "know": [
      "VS Code 1.135 shipped the Agent Host with the Copilot SDK harness. AHP itself does not require a local process or Electron. Timeline slide is in the appendix."
    ]
  }, [
    "The host owns the session state. The harness runs the agent loop. Clients subscribe and send actions.",
    "A new client, like a browser on another device, joins the existing work. It doesn't start another agent or copy the session.",
    "In VS Code, this meant moving agents out of the extension host, which lives and dies with a window. During the demo, say \"Close the editor. The work keeps going.\"",
    "→ \"Let me show you.\""
  ], [SRC.ahp, SRC.release(135)], [
    'Live continuity, about 2 minutes: start a session on the selected host, close the editor client, then join the same session from the Dev Box or second device through the prepared dev tunnel.',
    'Resolve a pending approval from the second client. Reopen the first client and show that it agrees.',
    'Keep the host running. Closing a client is not shutting down the machine that executes the agent.'
  ]),

  S('capabilities', 'Shared sessions', 60, 'section', {
    "title": "Every client gets the whole session",
    "lede": "See the work. Answer approvals. Review changes.",
    "items": [
      {
        "h": "Conversations",
        "p": "Turns, side chats, subagents"
      },
      {
        "h": "Workspace",
        "p": "Folders, setup, file changes"
      },
      {
        "h": "Tools",
        "p": "Calls, approvals, MCP status"
      },
      {
        "h": "Live work",
        "p": "Terminals and progress"
      }
    ]
  }, [
    "What you just saw needs more than a transcript. A client needs what's running, what changed, and what needs a person.",
    "AHP exposes each of these as a channel. Clients subscribe only to what they show.",
    "\"That's why a client you write can show which session needs you, without knowing which agent runs it.\"",
    "→ \"And it has to keep working when people come and go.\""
  ], [SRC.ahp]),

  S('shared-control', 'Shared sessions', 90, 'list', {
    "title": "Pick up a running session from any device, even after you drop off",
    "items": [
      {
        "h": "Join a session already running",
        "p": "You get a snapshot, then live updates."
      },
      {
        "h": "Answer from whatever device is handy",
        "p": "The host puts every action in order, so nobody answers an approval twice."
      },
      {
        "h": "Pick up after a dropped connection",
        "p": "You get what you missed, or a fresh snapshot."
      }
    ],
    "know": [
      "Tools contributed by a client still need that client to be connected.",
      "Do not promise transparent failover or exactly-once effects across host restarts."
    ]
  }, [
    "Three things make this work across devices.",
    "Join. A new client gets a snapshot, then ordered actions.",
    "Act. Clients apply actions locally, and the host orders them and rejects stale ones. An approval can't be answered twice.",
    "Reconnect. The host replays from the client's last sequence number, or sends a fresh snapshot.",
    "→ \"None of this was designed up front.\""
  ], [SRC.ahp, SRC.inspector], [
    'Inspector, 20–30 seconds within this explanation: open a clean captured log in ahp-inspector. Show one approval action and "State at this point". Connect it to what both clients displayed.',
    'Use a prepared capture without credentials or unrelated work. The inspector is a log viewer, not another live control client.'
  ]),

  S('s4-intro', 'How the spec changed', 45, 'timeline', {
    "title": "AHP went from 0.2 to 1.0 in four months",
    "items": [
      {
        "date": "May 28",
        "tag": "0.2",
        "text": "Channels"
      },
      {
        "date": "Jun 6",
        "tag": "0.3",
        "text": "MCP server state"
      },
      {
        "date": "Jun 19",
        "tag": "0.4",
        "text": "Chats split out of sessions",
        "hot": true
      },
      {
        "date": "Aug 28",
        "tag": "0.9",
        "text": "Automations and turn resume"
      },
      {
        "date": "Oct 2",
        "tag": "1.0",
        "text": "Changesets, chat moves, MCP startup"
      }
    ],
    "footer": "Every change came from a problem VS Code hit.",
    "know": [
      "Version numbers are context. The audience does not need to remember them."
    ]
  }, [
    "\"Every change came from a problem VS Code hit.\"",
    "Four quick stories, each a thing that broke. The last one is my favorite."
  ], [SRC.changelog]),

  S('split', 'How the spec changed', 60, 'split', {
    "title": "One session needed more than one conversation",
    "left": {
      "h": "One transcript",
      "items": [
        "Lead agent and workers in one stream",
        "Separate sessions lost shared context"
      ]
    },
    "right": {
      "h": "One session, separate chats",
      "items": [
        "One chat per agent",
        "One shared workspace and setup",
        "Fork or move a single chat"
      ]
    },
    "know": [
      "A single-chat harness still exposes one default chat. Harnesses do not have to delegate the same way."
    ]
  }, [
    "Subagents broke the model. One transcript becomes unreadable, and separate sessions lose shared context.",
    "Version 0.4 split chats out of sessions. That gave us side chats, forking, and moving a chat between sessions.",
    "→ \"The next one broke for a different reason.\""
  ], [SRC.multiChat, SRC.changelog]),

  S('mcp-state', 'How the spec changed', 60, 'list', {
    "title": "Every client needs to see MCP server status",
    "items": [
      {
        "h": "Starting or ready",
        "p": "The host reports live status, not only the config."
      },
      {
        "h": "Needs sign-in or failed",
        "p": "Any client can show what blocks the session."
      },
      {
        "h": "A turn waits for startup",
        "p": "The session shows the wait instead of looking stuck."
      }
    ],
    "know": [
      "Portable config has limits: interactive variables, env files, working directories, and OAuth config."
    ]
  }, [
    "A config entry cannot tell another machine that a server crashed or needs sign-in.",
    "MCP status became session state. Every client sees starting, ready, needs sign-in, or failed.",
    "The host owns the MCP connection. Clients do not open competing ones.",
    "→ \"And sometimes nobody is connected at all.\""
  ], [SRC.changelog]),

  S('automations', 'How the spec changed', 55, 'psu', {
    "title": "Automations run without an editor open",
    "labels": [
      "The problem",
      "What we changed",
      "What you get"
    ],
    "problem": "A scheduled task can't wait for someone to open an editor.",
    "spec": "The host owns schedules, runs, history, and recovery.",
    "unlocked": "Work starts on schedule. You review the result later, from any client.",
    "know": [
      "Local schedules still need the host running and the machine awake. GitHub cloud automations are a separate path."
    ]
  }, [
    "Scheduled work can't wait for an editor to open.",
    "The host owns schedules, runs, and history. You reconnect later, from any client, to review the result.",
    "→ \"The hardest one was getting your setup there in the first place.\""
  ], [SRC.pr(331796), SRC.pr(341542), SRC.pr(342037)]),

  S('customizations', 'How the spec changed', 65, 'psu', {
    "title": "Your setup has to reach the remote host",
    "labels": [
      "The problem",
      "What we changed",
      "What you get"
    ],
    "problem": "Your skills and agents live on your laptop. The session runs somewhere else.",
    "spec": "VS Code sends your setup to the host as content-hashed bundles.",
    "unlocked": "Your setup works remotely, and workspaces don't overwrite each other.",
    "know": [
      "Bundles are content-hashed. Workspace-scoped settings stay isolated so windows do not overwrite each other. Hooks keep harness-specific rules."
    ]
  }, [
    "Your skills and agents live on your laptop. The session runs somewhere else. Copying files was the easy part. Agreeing on identity and scope was the hard part.",
    "War story. One cloud quick chat produced 702 and 355 sync updates in a single turn. A publisher had mistaken the host's /root scratch folder for a workspace. The fix brought it to 5 and 10.",
    "\"The spec grew out of real product failures. Build on it, and you get those lessons for free.\"",
    "→ \"So where does AHP fit next to the other agent protocols?\""
  ], [SRC.pr(327946), SRC.pr(340564)]),

  S('s5-intro', 'Comparisons', 75, 'arrows', {
    "title": "Where AHP fits next to ACP and A2A",
    "rows": [
      {
        "proto": "ACP",
        "from": "One client",
        "to": "One agent harness",
        "diff": "Embeds one agent in one editor"
      },
      {
        "proto": "AHP",
        "from": "Many clients",
        "to": "A host running sessions",
        "diff": "Adds joining live work, shared approvals, and reconnecting",
        "hot": true
      },
      {
        "proto": "A2A",
        "from": "An agent",
        "to": "Another agent system",
        "diff": "Hands off a task and gets back results"
      }
    ],
    "know": [
      "This compares stable ACP v1. ACP v2 is a draft exploring multi-client observation. One ACP connection can manage several sessions; it is still one client.",
      "Don't mention any vendor's private plans.",
      "Detailed ACP vs AHP and A2A vs AHP tables are in the appendix for questions."
    ]
  }, [
    "Compare what each protocol connects, not feature lists.",
    "ACP is good at what it was built for: one agent in one editor. A second client needs more: joining live work, ordering actions from several clients, recovering after a disconnect. You can build that around ACP. AHP puts it in the contract.",
    "A2A hands work to an independent agent system. You get tasks and artifacts back, not its internals. AHP is for watching and steering your own sessions.",
    "\"They stack. And ACP agents don't have to pick a side.\"",
    "→ Gateway."
  ], [SRC.acp]),

  S('gateway', 'Comparisons', 45, 'gateway', {
    "title": "ACP agents can join an AHP workbench",
    "lede": "New in October: a community gateway, now listed in the AHP docs.",
    "chain": [
      "Clients",
      "AHP",
      "AHP–ACP Gateway",
      "ACP",
      "Existing ACP agent"
    ],
    "roles": [
      {
        "proto": "AHP",
        "text": "Shares sessions with every client"
      },
      {
        "proto": "ACP",
        "text": "Runs the existing agent"
      }
    ],
    "know": [
      "Community project, not Microsoft. Repository created October 15; microsoft/agent-host-protocol#530 added it to the README and implementation guide.",
      "Its README describes an AHP WebSocket server, SQLite-backed sessions, multi-client observation, reconnect with replay or snapshot, permissions and cancellation, and ACP subprocess lifecycle. It documents connecting from the VS Code Agents window.",
      "#530 is documentation, not a protocol change. I read the docs but have not run the gateway, so it is not a demo."
    ]
  }, [
    "Brand new. The AHP docs started listing this community project on October 16.",
    "\"You don't have to replace an agent's ACP integration. A gateway can use ACP to run the agent and AHP to expose its sessions to multiple clients.\"",
    "It proves the point of the talk: the agent and the interface are independent choices.",
    "→ \"Enough contract. Here is what it lets us build.\""
  ], [SRC.gateway, SRC.gatewayDocs]),

  S('s6-intro', 'Live demonstrations', 20, 'statement', {
    "title": "The next agent UI doesn't have to look like an editor",
    "lede": "Up next: the Agents window, a browser, a canvas, and a game."
  }, [
    "Same session, different interfaces.",
    "The Agents window, the browser, and the game are AHP clients. A canvas is UI inside a client."
  ], [SRC.pr(339596)], [
    'Live demonstrations, about 2–3 minutes total: show the Agents window across projects, then the existing canvas interaction.',
    'Finish in the completed 3D game. Show agent activity, and only show actions such as approval if the existing game supports them.',
    'No separate slides for these demos. Return directly to the closing slide.'
  ]),

  S('close', 'Close', 45, 'statement', {
    "title": "Your agent session doesn't belong to one app anymore",
    "commands": [
      "vscode.dev/agents",
      "microsoft/agent-host-protocol",
      "npx ahp-inspector"
    ],
    "know": [
      "To find a local host for your own client, run code-insiders agent endpoints. It prints connection credentials, so never show its output."
    ]
  }, [
    "LSP separated language smarts from the editor. AGENTS.md, Skills, MCP, and plugins made capabilities reusable. AHP does the same for the running session.",
    "If you use agents, try it today in the VS Code Agents window or at vscode.dev/agents.",
    "If you build tools or UIs, write an AHP client. The spec and the inspector are on screen.",
    "If you build software factories for your team or company, treat sessions as shared infrastructure. Run agents near the code, send approvals to the right person, and let people use whatever interface fits.",
    "\"Your editor is one way to meet your agent. It shouldn't decide where the work runs or which agent you use.\""
  ], [SRC.ahp, SRC.inspector]),

  S('appendix', 'Appendix', 0, 'statement', {
    "title": "Appendix",
    "lede": "Backup slides for questions and later versions of the talk."
  }, [
    "Stop at the close. These slides are for questions and future revisions."
  ]),

  S('acp', 'Appendix', 60, 'compare', {
    "title": "ACP vs AHP",
    "cols": [
      "",
      "ACP",
      "AHP"
    ],
    "rows": [
      [
        "Connection",
        "One client ↔ one harness",
        "Many clients ↔ one host"
      ],
      [
        "A second client joins",
        "Your app has to build it",
        "It gets a snapshot of the live session"
      ],
      [
        "Two clients act",
        "The app coordinates them",
        "The host orders and reconciles actions"
      ],
      [
        "Connection drops",
        "Load or resume the session",
        "Replay missed actions, or start from a snapshot"
      ]
    ],
    "know": [
      "This compares stable ACP v1. ACP v2 is a draft exploring multi-client observation.",
      "One ACP connection can manage several sessions; it is still one client.",
      "Do not mention any vendor's private plans."
    ]
  }, [
    "ACP is good at what it was built for: embedding an agent in an editor.",
    "AHP adds what a second client needs: joining live work, concurrent actions, recovery after a disconnect, shared approvals.",
    "You can build those around ACP. AHP puts them in the contract."
  ], [SRC.acp]),

  S('a2a', 'Appendix', 50, 'compare', {
    "title": "A2A vs AHP",
    "cols": [
      "",
      "A2A",
      "AHP"
    ],
    "rows": [
      [
        "Connects",
        "An agent to another agent system",
        "Clients to sessions on a host"
      ],
      [
        "Work",
        "Tasks, messages, artifacts",
        "Sessions, chats, approvals, changes"
      ],
      [
        "You see",
        "The Agent Card and task results",
        "The session state a client needs"
      ],
      [
        "Use it to",
        "Hand work to another system",
        "Watch and steer running work"
      ]
    ],
    "know": [
      "The AHP plus A2A combination is an architecture possibility, not a shipped integration."
    ]
  }, [
    "A2A delegates to an independent agent system. You get tasks and artifacts, not its internals.",
    "AHP is for observing and steering your own sessions.",
    "They stack: an agent in an AHP session can delegate to an A2A agent."
  ]),

  S('vscode-move', 'Appendix', 45, 'timeline', {
    "title": "VS Code moved agents out of the extension host",
    "items": [
      {
        "date": "Mar 6",
        "tag": "State",
        "text": "One shared session model"
      },
      {
        "date": "Mar 16",
        "tag": "Process",
        "text": "Agent Host runs as its own process"
      },
      {
        "date": "Mar 17",
        "tag": "Remote",
        "text": "Remote clients connect"
      },
      {
        "date": "Aug 5",
        "tag": "Sessions",
        "text": "Copilot CLI sessions move to the host"
      },
      {
        "date": "Aug 26",
        "tag": "1.135",
        "text": "Agent Host ships with the Copilot SDK",
        "hot": true
      }
    ],
    "footer": "Close the editor. The work keeps going.",
    "know": [
      "This is our implementation. AHP itself does not require a local process or Electron."
    ]
  }, [
    "In VS Code, this meant moving agents out of the extension host, which lives and dies with a window.",
    "Now the editor is just a client. VS Code 1.135 shipped the Agent Host with the Copilot SDK harness."
  ], [SRC.pr(299839), SRC.pr(296627), SRC.pr(301140), SRC.pr(328512), SRC.release(135)]),

  S('layers', 'Appendix', 45, 'compare', {
    "title": "Shared runtime, shared protocol, different jobs",
    "cols": [
      "",
      "Copilot SDK",
      "Agent Host Protocol"
    ],
    "rows": [
      [
        "Job",
        "Runs the agent loop",
        "Connects clients to sessions"
      ],
      [
        "Owns",
        "Tools, context, model calls",
        "The session state clients see"
      ],
      [
        "Gives you",
        "One harness for every Copilot product",
        "Any agent, any interface"
      ]
    ]
  }, [
    "Two layers, two jobs: the SDK runs the agent well; AHP makes the session reachable.",
    "AHP stays harness-agnostic. Claude and Codex adapters use the same contract without the Copilot runtime."
  ], [SRC.ahp, SRC.harness])
];
