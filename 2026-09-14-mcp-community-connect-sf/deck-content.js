(() => {
  const spec = "https://modelcontextprotocol.io/specification/2026-07-28/changelog";
  const caitie = seconds => `https://www.youtube.com/watch?v=lP93VxU76aI&t=${seconds}s`;
  const ahp = "https://code.visualstudio.com/blogs/2026/08/26/agent-host-architecture";
  const text = (x, y, value, cls = "", anchor = "start") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${value}</text>`;
  const box = (x, y, w, h, cls = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="${cls}"/>`;
  const wire = (d, cls = "") => `<path d="${d}" class="wire ${cls}"/>`;
  const packet = (d, delay = "0s", cls = "") => `<circle r="5" class="packet ${cls}" style="offset-path:path('${d}');animation-delay:${delay}"/>`;
  const svg = (label, body, height = 340) => `<svg class="diagram" viewBox="0 0 1200 ${height}" role="img" aria-label="${label}">${body}</svg>`;
  const source = (label, url) => ({ label, url });
  const cap = value => `<div class="eyebrow">${value}</div>`;
  const head = (first, second = "") => `<h1>${first}${second ? `<br><em>${second}</em>` : ""}</h1>`;
  const metric = (value, label, detail) => `<div class="metric"><strong>${value}</strong><span>${label}</span><small>${detail}</small></div>`;
  const pillars = values => `<div class="pillars">${values.map(([title, body]) => `<div><h3>${title}</h3><p>${body}</p></div>`).join("")}</div>`;

  function routing(after) {
    const paths = ["M616 170H744V62H902", "M616 170H902", "M616 170H744V278H902"];
    return `<div class="console"><div class="console-label">${after ? "SUCCESSIVE CALLS / INDEPENDENT ROUTING" : "SESSION-AFFINE DEPLOYMENT / ILLUSTRATION"}</div>${svg(
      after ? "Independent requests may route to any replica." : "Requests for session s-17 must reach the replica holding its state.",
      wire("M254 170H443", "bright") +
      paths.map((d, i) => wire(d, after || i === 0 ? "bright" : "dormant")).join("") +
      box(34, 115, 220, 111, "client-box") + text(56, 144, "MCP CLIENT", "tiny") + text(56, 181, "tools/call", "code") + text(56, 207, "search(query)", "minor") +
      box(267, 69, 173, after ? 66 : 42, "meta-box") + text(280, 94, after ? "version" : "session: s-17", "code small-code") + (after ? text(280, 119, "+ capabilities", "code small-code") : "") +
      box(444, 125, 172, 90, "gateway") + text(530, 164, "LOAD", "label", "middle") + text(530, 188, "BALANCER", "label", "middle") +
      [20, 128, 236].map((y, i) => `<g class="${after || i === 0 ? "replica active-replica" : "replica faded"}">${box(920, y, 247, 84)}${box(935, y + 17, 31, 48, "rack")}${wire(`M942 ${y + 28}H959M942 ${y + 38}H959M942 ${y + 48}H954`)}${text(982, y + 34, `REPLICA ${"ABC"[i]}`, "label")}${text(982, y + 60, after ? "can answer" : i === 0 ? "holds s-17" : "no session state", "minor")}</g>`).join("") +
      packet("M254 170H443") + paths.map((d, i) => after || i === 0 ? packet(d, `${i * .9}s`) : "").join("")
    )}</div>`;
  }

  function handles() {
    return svg("A create call returns basket b-42; a later independent add-item call references the same application state.",
      wire("M370 80H857", "bright arrow") + wire("M857 166H630V234H370", "gold-wire arrow") + wire("M370 280H857", "bright arrow") +
      box(25, 20, 345, 111, "client-box") + text(46, 49, "01 / CREATE", "tiny") + text(46, 88, "CreateBasket()", "code") +
      box(25, 215, 345, 110, "client-box") + text(46, 244, "02 / USE THE HANDLE", "tiny") + text(46, 286, "AddItem(b-42, item)", "code") +
      box(450, 126, 309, 69, "handle-box") + text(474, 151, "RETURNED TO THE CALLER", "tiny dark-text") + text(474, 180, "basketId: b-42", "code dark-text") +
      box(857, 17, 318, 308, "storage-box") + text(884, 58, "MCP SERVER", "label") + box(881, 91, 268, 122, "inner-box") + text(903, 120, "APPLICATION STORAGE", "tiny") + text(903, 154, "b-42", "code gold-text") + text(903, 188, "items: […]", "code") + text(884, 249, "Tool handlers own state.", "minor") + text(884, 277, "Independent MCP requests.", "minor") +
      packet("M370 80H857V166H630V234H370V280H857", "0s", "gold-packet")
    );
  }

  function mrtr() {
    return svg("The server returns input_required; the client asks the user, then retries with inputResponses.",
      [160, 600, 1040].map((x, i) => box(x - 120, 0, 240, 49, i === 1 ? "user-box" : "client-box") + text(x, 32, ["MCP CLIENT", "USER", "MCP SERVER"][i], "label", "middle") + wire(`M${x} 58V350`, "lifeline")).join("") +
      wire("M160 99H1040", "bright arrow") + text(570, 88, "01  tools/call", "code small-code", "middle") +
      wire("M1040 163H160", "gold-wire arrow") + text(790, 150, '02  resultType: "input_required"', "code small-code", "middle") +
      wire("M160 217H600", "purple-wire arrow") + text(390, 204, "03a  ask the user", "code small-code", "middle") +
      wire("M600 263H160", "purple-wire arrow") + text(390, 250, "03b  user's answer", "code small-code", "middle") +
      wire("M160 324H1040", "bright arrow") + text(680, 311, "04  retry + inputResponses", "code small-code", "middle") +
      packet("M160 99H1040V163H160V217H600V263H160V324H1040")
    , 360);
  }

  function hostDiagram() {
    return svg("Editor, Agents window and browser share one Agent Host session over AHP. The harness calls capability services over MCP.",
      wire("M225 61H305V148H419M225 159H419M225 257H305V176H419", "purple-wire") +
      wire("M760 161H850M1008 161H1064", "bright") +
      [25, 123, 221].map((y, i) => box(15, y, 210, 73, `client-box ${i === 2 ? "reconnecting" : ""}`) + text(35, y + 40, ["EDITOR", "AGENTS WINDOW", "BROWSER"][i], "label") + (i === 2 ? text(35, y + 61, "RECONNECT / SAME SESSION", "tiny") : "")).join("") +
      text(332, 122, "AHP", "protocol purple-text") + box(419, 32, 341, 269, "host-box") + text(445, 74, "AGENT HOST", "label") + text(445, 101, "Owns the persistent session", "minor") +
      box(444, 124, 291, 138, "inner-box") + text(462, 156, "SESSION / S-42", "code small-code gold-text") + wire("M465 193H713", "purple-wire") +
      [465, 547, 630, 713].map(x => `<circle cx="${x}" cy="193" r="4" class="dot"/>`).join("") + text(462, 235, "HISTORY · APPROVALS · WORK", "tiny") +
      box(850, 108, 158, 106, "client-box") + text(870, 147, "HARNESS", "label") + text(870, 179, "SDK / agent loop", "tiny") +
      text(1018, 140, "MCP", "protocol") + box(1064, 112, 122, 98, "storage-box") + text(1081, 151, "TOOLS", "label") + text(1081, 180, "+ DATA", "label") +
      packet("M225 257H305V176H419", "0s", "purple-packet") + packet("M419 148H305V61H225", "1.8s", "purple-packet")
    );
  }

  function authDiagram() {
    return svg("The MCP client obtains a token from an authorization server, then uses it with the intended MCP resource server.",
      box(30, 137, 265, 141, "client-box") + text(60, 181, "MCP CLIENT", "label") + text(60, 218, "User consent", "minor") + text(60, 247, "Issuer validation", "minor") +
      box(480, 0, 320, 121, "host-box") + text(510, 46, "AUTHORIZATION SERVER", "label") + text(510, 84, "Existing identity provider", "minor") +
      box(904, 137, 265, 141, "storage-box") + text(929, 182, "MCP SERVER", "label") + text(929, 218, "Protected resource", "minor") + text(929, 247, "Validate token + scope", "minor") +
      wire("M170 137V61H480", "purple-wire arrow") + wire("M640 121V205H295", "gold-wire arrow") + wire("M295 260H904", "bright arrow") +
      text(221, 48, "SIGN IN / AUTHORIZE", "tiny") + box(456, 240, 348, 46, "meta-box") + text(475, 270, "token for this MCP resource", "code small-code") +
      text(525, 170, "ISSUED TOKEN", "tiny gold-text") +
      packet("M295 260H904")
    , 340);
  }

  const branches = [
    { id: "foundation", name: "Foundation", x: 2400, y: 2270, color: "#f7cd8c", summary: "Protocol + clients + ecosystem", start: "launch" },
    { id: "runtime", name: "Transport", x: 500, y: 1430, color: "#78e5e8", summary: "Operate at scale", start: "runtime-map" },
    { id: "clients", name: "Clients", x: 1425, y: 1430, color: "#b9b0fa", summary: "Implement. Learn. Revise.", start: "clients-map" },
    { id: "trust", name: "Trust", x: 2350, y: 1430, color: "#f4b798", summary: "Identity + authority", start: "authorization" },
    { id: "ecosystem", name: "Ecosystem", x: 3275, y: 1430, color: "#a9d79f", summary: "Build on each other", start: "ecosystem-map" },
    { id: "agents", name: "Agent runtime", x: 4200, y: 1430, color: "#9abaff", summary: "The layer around MCP", start: "agent-host" }
  ];
  const slides = [
    { id: "start", branch: "foundation", layout: "title", title: "The MCP skill tree", body: `
      ${cap("MCP COMMUNITY CONNECT / SAN FRANCISCO / 14 SEPTEMBER 2026")}
      <div class="title-layout"><div><h1>The MCP<br><em>skill tree.</em></h1><p class="title-deck">What changed.<br>Why it had to.<br>What it cost.</p></div><div class="title-network" aria-hidden="true"><div class="title-core">MCP</div><span class="tn a">TRANSPORT</span><span class="tn b">CLIENTS</span><span class="tn c">TRUST</span><span class="tn d">ECOSYSTEM</span><span class="tn e">AGENT RUNTIME</span><svg viewBox="0 0 600 510"><path d="M300 255L130 80M300 255L485 90M300 255L520 320M300 255L360 455M300 255L90 355"/></svg></div></div>`,
      notes: ["Less than two years of implementation feedback.", "Focus on transports and clients. What changed, why, and at what cost.", "Skill tree as the map. Not every server needs every branch."] },
    { id: "launch", branch: "foundation", layout: "loadout", title: "MCP at launch", body: `
      ${cap("25 NOVEMBER 2024 / PUBLIC LAUNCH")}${head("MCP", "at launch.")}
      <div class="loadout">${metric("02","SDKs","TypeScript · Python")}${metric("02","TRANSPORTS","stdio · HTTP + SSE")}${metric("03","SERVER PRIMITIVES","Tools · Resources · Prompts")}</div>
      <blockquote>"We have a long long way to go<br>and much ground to cover."</blockquote>`,
      sources: [source("David Soria Parra / launch-day Hacker News comment", "https://news.ycombinator.com/item?id=42240901")],
      notes: ["Anthropic, November 25, 2024. Creators: David Soria Parra and Justin Spahr-Summers.", "TypeScript + Python. stdio + HTTP/SSE. Tools, resources, prompts.", "Claude Desktop made local integration familiar; remote transport already existed.", "No auth specification yet. Sampling and progress were already present."] },
    { id: "growth", branch: "foundation", layout: "growth", title: "514M SDK package downloads in July", body: `
      ${cap("SDK PACKAGE DOWNLOADS / JULY 2026")}
      <div class="growth-layout"><div>${head("514M")}<p class="large-copy">SDK package downloads<br>in one month.</p><span class="growth-multiple">13× July 2025</span></div><div id="download-chart" class="chart-surface"></div></div>
      <p class="qualification">npm + PyPI + NuGet. Includes repeat installs and CI. Not a count of people.</p>`,
      sources: [source("npm / TypeScript SDK","https://www.npmjs.com/package/@modelcontextprotocol/sdk"),source("PyPI / Python SDK","https://pypi.org/project/mcp/"),source("NuGet / C# SDK","https://www.nuget.org/packages/ModelContextProtocol")],
      provenance: "Monthly registry series supplied in Den Delimarsky's Two Years of MCP deck, collected 2026-08-08. Preserved in material/2026-09-10-state-of-mcp-caitie-mccaffrey.md. Package pages identify the sources; they are not historical snapshots.",
      notes: ["TypeScript, Python, C#. July 2026, 13× July 2025.", "Includes CI and repeat installs. Distribution, not unique developers.", "Next: the platforms committing to MCP."] },
    { id: "convergence", branch: "foundation", layout: "timeline", title: "Competing platforms picked MCP", body: `
      ${cap("26 MARCH → 9 APRIL 2025")}${head("Competing platforms", "picked MCP.")}
      <div class="date-line"><div><time>26 MAR</time><h3>OpenAI</h3><p>MCP support announced.</p></div><div><time>04 APR</time><h3>VS Code 1.99</h3><p>MCP tools in Stable.</p></div><div><time>09 APR</time><h3>Google DeepMind</h3><p>Gemini support committed.</p></div></div>
      <p class="large-note">In two weeks, competing platforms committed to the same protocol.</p>`,
      sources: [source("OpenAI announcement / 26 March", "https://x.com/sama/status/1904957253456941061"),source("VS Code 1.99 / 4 April","https://code.visualstudio.com/updates/v1_99"),source("Google DeepMind / 9 April","https://x.com/demishassabis/status/1910107859041271977")],
      notes: ["March 26: OpenAI support announcement.", "April 4: MCP tools in VS Code Stable.", "April 9: Gemini models and SDK commitment.", "More implementations exposed more production problems."] },
    { id: "runtime-map", branch: "runtime", map: true, title: "Remote servers exposed new problems.", subtitle: "Connections. Routing. Session state.", notes: ["Local: client owns the server process and lifetime.", "Remote: shared service, multiple callers, routing and state.", "Stdio remains a valid local option."] },
    { id: "pressure", branch: "runtime", layout: "pressure", title: "Half the messages were protocol overhead", body: `
      ${cap("REMOTE SERVER MEASUREMENTS")}
      <div class="pressure-layout"><div class="massive-stat">50<span>%+</span></div><div>${head("Half the messages were", "protocol overhead.")}<p class="large-copy">Initialization and tool listing consumed half<br>the traffic or more in some measurements.</p></div></div>
      ${pillars([["Connections","Persistent streams or sticky routing."],["Tools","Most observed servers exposed stateless tools."],["Session scope","Different hosts interpreted it differently."]])}`,
      sources: [source("Reported server measurements / State of MCP, September 2026", caitie(343))],
      provenance: "Caitie McCaffrey reported internal observations from some server implementations at 05:43–06:24. No underlying public dataset or named deployment was supplied. This is not an ecosystem-wide estimate.",
      notes: ["Initialization, tool listing, and other protocol traffic.", "Persistent connections or routing back to session state.", "Most observed servers exposed stateless tools.", "Session scope behaved differently across hosts."] },
    { id: "session-bound", branch: "runtime", layout: "routing", title: "This request needs the same replica", body: `
      ${cap("BEFORE / A SESSION-AFFINE REMOTE DEPLOYMENT")}<div class="heading-row">${head("This request needs", "the same replica.")}<p>Connection state determines<br>which replica can answer.</p></div>
      <div class="old-routing">${routing(false)}</div><p class="takeaway">The protocol session creates a routing dependency.</p>`,
      sources: [source("Illustrative session-affine deployment / July changelog", spec)],
      notes: ["s-17 lives on replica A. Its requests must return there.", "Alternative: shared session storage, another dependency.", "Operational cost even for tools that need no session."] },
    { id: "sessionless", branch: "runtime", layout: "routing", title: "Stateless requests can reach any replica", body: `
      ${cap("UNLOCK / 2026-07-28 STATELESS CORE")}<div class="heading-row">${head("Stateless requests.", "Any replica.")}<p>Version and capabilities<br>travel with each request.</p></div>
      ${routing(true)}<p class="takeaway">No initialization handshake. No <code>Mcp-Session-Id</code>.</p>`,
      sources: [source("MCP 2026-07-28 / independently routable requests", spec)],
      notes: ["July revision removes initialization and Mcp-Session-Id.", "Version + capabilities travel with each request.", "Successive calls reach different replicas.", "Discovery, routing headers, cache hints. Ordinary web infrastructure.", "Next: what happens to the shopping basket?"] },
    { id: "explicit-state", branch: "runtime", layout: "state-flow", title: "Tool calls pass explicit state handles", body: `
      ${cap("TRADEOFF / APPLICATION DESIGN")}<div class="heading-row">${head("Tool calls pass", "explicit state handles.")}<p>A handle connects the calls.<br>The application owns its lifetime.</p></div>
      ${handles()}<div class="dual-note"><span><b>GAIN</b> Multiple baskets. Independent calls.</span><span><b>COST</b> Explicit state and access management.</span></div>`,
      sources: [source("MCP July release / explicit state handles", "https://blog.modelcontextprotocol.io/posts/2026-07-28/")],
      notes: ["CreateBasket returns an ID. AddItem passes it back.", "Several baskets per caller, independent of connections.", "Application owns storage, lifetime, and access. ID ≠ permission.", "Next: interactions that need another round trip."] },
    { id: "mrtr", branch: "runtime", layout: "sequence", title: "Elicitation works without a protocol session", body: `
      ${cap("MULTI ROUND-TRIP REQUESTS")}${head("Elicitation works", "without a protocol session.")}
      ${mrtr()}<p class="takeaway">The server asks. The client gathers input. The request continues.</p>`,
      sources: [source("MRTR / InputRequiredResult and inputResponses", spec)],
      notes: ["Deployment needs an environment. Return input_required.", "Client asks the user, then retries with inputResponses.", "SDK handles the exchange. Server avoids duplicate side effects.", "Next: the client has to build that interaction."] },
    { id: "clients-map", branch: "clients", map: true, title: "Clients implement MCP's capabilities", subtitle: "Input, permissions, progress, and UI.", notes: ["The specification defines the capability. Clients build the experience.", "VS Code, Goose, and others implemented while the spec evolved."] },
    { id: "client-tree", branch: "clients", layout: "capabilities", title: "Client implementations shape the spec", body: `
      ${cap("CLIENT IMPLEMENTATION → REAL USE → SPEC FEEDBACK")}${head("Client implementations", "shape the spec.")}
      <div class="capability-lanes"><div><small>EARLY FOUNDATIONS</small><h3>Context + tools</h3><p>Resources · Prompts · Roots<br>Sampling · Progress</p></div><div><small>USER PARTICIPATION</small><h3>Ask + show</h3><p>Elicitation · Structured output<br>MCP Apps</p></div><div><small>LONGER-LIVED WORK</small><h3>Wait + return</h3><p>Experimental Tasks<br>→ official extension</p></div></div>
      <div class="client-band"><strong>VS Code</strong><span>+</span><strong>Goose</strong><span>+</span><p>other early implementers</p><small>EARLY CLIENT EXAMPLES · CAPABILITIES AND TIMING DIFFER BY CLIENT</small></div>`,
      sources: [source("VS Code / then-current full spec support, June 2025", "https://code.visualstudio.com/blogs/2025/06/12/full-mcp-spec-support")],
      notes: ["VS Code: roots, sampling, progress, elicitation, experimental Tasks.", "Goose and other clients brought different use cases.", "Unsettled decisions: input UI, sampling model, cancellation.", "User feedback shapes revisions. Early clients pay migration costs.", "Next: MCP Apps makes the client contribution visible."] },
    { id: "apps", branch: "clients", layout: "app", title: "MCP Apps make tool results interactive", body: `
      ${cap("MCP APPS / INTERACTIVE TOOL RESULTS")}<div class="app-layout"><div>${head("MCP Apps make<br>tool results", "interactive.")}<p class="large-copy">Find the hot path.<br>Zoom into the stack.<br>No prompt needed for each click.</p><p class="annotation">Illustrative CPU profile,<br>not a live MCP connection.</p></div><div class="demo-app flame-app"><div class="app-bar"><span>CPU PROFILE / FLAME GRAPH</span><small>ILLUSTRATIVE DATA</small></div><div class="flame-summary"><div><strong>1,000</strong><small>CPU samples</small></div><div class="hot-path"><span>HOT PATH</span><b>render → layout → measureText</b></div></div><div class="flame-toolbar"><span id="flame-scope">All stacks</span><button id="flame-reset" disabled>Reset zoom ↺</button></div><div id="flame-graph" role="group" aria-label="CPU flame graph. Frame width represents inclusive sample count. Click a frame to zoom."></div><div class="flame-axis"><span>0%</span><span>SHARE OF VISIBLE SAMPLES · NOT ELAPSED TIME</span><span>100%</span></div><div class="flame-detail" aria-live="polite"><strong id="flame-name">all stacks</strong><span id="flame-value">1,000 samples · 100% of profile</span></div><div class="app-bottom">Click a frame to inspect its callers and descendants.</div></div></div>`,
      sources: [source("VS Code MCP Apps support", "https://code.visualstudio.com/blogs/2026/01/26/mcp-apps-support")],
      notes: ["Width = CPU samples. Height = call-stack depth.", "Click layout → measureText → reset. No extra prompt.", "Tool returns profile data + UI resource. Host mediates interaction.", "Text fallback for clients without Apps.", "Next: extensions let capabilities evolve separately."] },
    { id: "feedback", branch: "clients", layout: "loop", title: "Client feedback changes the specification", body: `
      ${cap("IMPLEMENTATION FEEDBACK")}${head("Client feedback", "changes the specification.")}
      ${svg("Draft capability is implemented in a client, real use reveals constraints, and feedback informs the next revision.",
        [30,440,850].map((x,i)=>box(x,95,320,133,i===1?"host-box":"client-box")+text(x+26,132,["DRAFT CAPABILITY","CLIENT EXPERIENCE","SPEC FEEDBACK"][i],"label")+text(x+26,173,["A proposed contract","Real users and constraints","Revise or retire"][i],"minor")).join("")+
        wire("M350 162H440M760 162H850","bright arrow")+wire("M1010 95V30H190V95","gold-wire arrow")+text(600,20,"IMPLEMENTATION EVIDENCE","tiny gold-text","middle")
      ,270)}
      <div class="quote-inline">Real implementations expose the missing decisions.<small>Early clients also carry the migration work.</small></div>`,
      sources: [source("MCP / extension implementation and review process", "https://modelcontextprotocol.io/extensions/overview")],
      notes: ["Product questions expose gaps in the spec.", "Input location, sampling model, cancellation behavior.", "Feedback can require redesigning a feature already shipped."] },
    { id: "retiring", branch: "clients", layout: "status", title: "Removed. Deprecated. Moved to extensions", body: `
      ${cap("MIGRATION + EXTENSIONS")}${head("Removed. Deprecated.", "Moved to extensions.")}
      <div class="status-columns"><div><span class="status-label removed">REMOVED FROM THE NEW CORE</span><h3>Protocol sessions<br>Initialization</h3><p>Requests become self-describing.</p></div><div><span class="status-label deprecated">DEPRECATED, STILL SPECIFIED</span><h3>Roots · Sampling<br>Logging · DCR</h3><p>Migrate during the documented window.</p></div><div><span class="status-label moved">MOVED TO AN EXTENSION</span><h3>Tasks</h3><p>Redesigned for explicit,<br>long-running work.</p></div></div>
      <div class="extension-strip"><span>EXTENSIONS EVOLVE SEPARATELY</span><b>Apps</b><b>Tasks</b><b>Managed authorization</b></div>`,
      sources: [source("MCP feature lifecycle", "https://modelcontextprotocol.io/specification/2026-07-28/deprecated"),source("MCP extensions","https://modelcontextprotocol.io/extensions/overview")],
      notes: ["Removed: sessions and initialization.", "Deprecated, still specified: Roots, Sampling, Logging, DCR.", "Moved: Tasks. Apps and managed auth also use extensions.", "Opt-in support gives teams room to experiment.", "Next: remote access also changed authorization."] },
    { id: "trust-map", branch: "trust", map: true, title: "Who's calling? What can they do?", subtitle: "Identity and permissions for shared services.", notes: ["Local: choose which process to run.", "Remote: distinguish callers and permissions.", "Hosting remotely doesn't solve trust."] },
    { id: "authorization-detail", branch: "trust", layout: "auth", title: "Reuse your identity provider", body: `
      ${cap("AUTHORIZATION / RESOURCE-SERVER SEPARATION")}${head("Reuse your", "identity provider.")}
      ${authDiagram()}<div class="small-milestones"><span>Launch: no auth spec</span><b>→</b><span>OAuth</span><b>→</b><span>Resource + issuer binding</span><b>→</b><span>CIMD / managed auth</span></div>`,
      sources: [source("MCP July authorization hardening", "https://blog.modelcontextprotocol.io/posts/2026-07-28/")],
      notes: ["Identity provider issues the token; MCP server validates access.", "Token targets the intended resource. Credentials stay bound to their issuer.", "CIMD simplifies client registration. EMA adds enterprise-managed authorization."] },
    { id: "authorization", branch: "trust", layout: "trust-summary", title: "Reuse your identity provider. Keep control of the action", body: `
      ${cap("REMOTE ACCESS / SERVER + CLIENT")}${head("Reuse your identity provider.", "Keep control of the action.")}
      <div class="trust-pair"><div><small>SERVER SIDE</small><h3>Use your identity provider.</h3><div class="trust-path"><span>Existing identity</span><b>→</b><span>Scoped MCP access</span></div><p>No need to build an identity system<br>inside every tool server.</p></div><div><small>CLIENT SIDE</small><h3>Decide what can happen.</h3><div class="trust-path"><span>Trust server</span><b>→</b><span>Approve action</span></div><p>Apply consent, isolation,<br>and enterprise policy.</p></div></div>
      <p class="takeaway">Signing in isn't permission for every action.</p>`,
      sources: [source("MCP authorization","https://blog.modelcontextprotocol.io/posts/2026-07-28/"),source("MCP security and consent","https://modelcontextprotocol.io/specification/2026-07-28")],
      notes: ["Launch: no authorization spec. Today: reuse existing identity providers.", "Client controls server trust, action approval, isolation, and policy.", "More in today's enterprise-security session.", "Next: give implementers time to handle protocol changes."] },
    { id: "consent", branch: "trust", layout: "boundaries", title: "Signing in isn't permission for every action", body: `
      ${cap("THREE DECISIONS / NOT ONE TRUST TOGGLE")}${head("Signing in isn't permission", "for every action.")}
      <div class="decision-flow"><div><span>01</span><h3>Run this server?</h3><p>Trust the code or endpoint.</p></div><b>→</b><div><span>02</span><h3>Access this resource?</h3><p>Authenticate and authorize.</p></div><b>→</b><div><span>03</span><h3>Perform this action?</h3><p>Apply consent and host policy.</p></div></div>
      <p class="takeaway">Annotations describe intent. They do not enforce safety.</p>`,
      sources: [source("MCP security and consent principles", "https://modelcontextprotocol.io/specification/2026-07-28")],
      notes: ["Resource access and action approval are separate.", "Client handles trust, approval, isolation, and policy.", "readOnlyHint describes intent. It doesn't enforce safety."] },
    { id: "governance", branch: "ecosystem", layout: "governance", title: "Give implementers time to upgrade", body: `
      ${cap("GOVERNANCE / COMPATIBILITY")}${head("Give implementers", "time to upgrade.")}
      <div class="governance-layout"><div class="window-stat"><strong>12<span>months</span></strong><p>Minimum deprecation window<br>before removal eligibility.</p></div><div class="stability-stack"><div><b>CONFORMANCE TESTS</b><p>Independent implementations need the same contract.</p></div><div><b>LONGER RC PERIODS</b><p>SDK and client maintainers need time to respond.</p></div><div><b>CONTRIBUTION PATHS</b><p>More trust, more scope, clearer ownership.</p></div></div></div>`,
      sources: [source("Feature lifecycle policy", "https://modelcontextprotocol.io/community/feature-lifecycle"),source("Caitie / conformance and RC process",caitie(1070))],
      notes: ["At least 12 months from deprecation to removal eligibility.", "Conformance tests catch differences across implementations.", "Longer RC periods give SDKs and clients time to respond.", "Next: compatibility also matters in discovery and packaging."] },
    { id: "ecosystem-map", branch: "ecosystem", map: true, title: "We build on each other's SDKs", subtitle: "Compatibility · Implementations · Distribution", notes: ["Cross-team dependencies make compatibility essential.", "Protocol changes need coordinated SDK and client upgrades."] },
    { id: "sdks", branch: "ecosystem", layout: "sdk", title: "One protocol. Many implementations", body: `
      ${cap("SDK ECOSYSTEM / JULY 2026 SNAPSHOT")}${head("One protocol.", "Many implementations.")}
      <div class="sdk-layout"><div class="sdk-grid"><span>TypeScript<small>TIER 1</small></span><span>Python<small>TIER 1</small></span><span>Go<small>TIER 1</small></span><span>C#<small>TIER 1</small></span><span class="rust">Rust<small>JULY REVISION SUPPORT: BETA AT RELEASE</small></span></div><div class="contributors"><strong>2,558</strong><p>commit-author identities<br>across 42 repositories</p><small>MCP Git history · 8 August 2026.<br>One person may use multiple identities.</small></div></div>`,
      sources: [source("MCP July release / SDK support", "https://blog.modelcontextprotocol.io/posts/2026-07-28/"),source("MCP GitHub repositories","https://github.com/modelcontextprotocol")],
      provenance: "Commit-author count compiled by Den Delimarsky from all 42 MCP repositories, collected 2026-08-08. About 1,847 distinct GitHub logins. Full methodology is preserved in the material capture.",
      notes: ["July Tier 1: TypeScript, Python, Go, C#. Rust support in beta.", "August snapshot: 2,558 commit-author identities.", "Conformance keeps independent implementations interoperable."] },
    { id: "distribution", branch: "ecosystem", layout: "distribution", title: "AI Catalog describes what clients can discover", body: `
      ${cap("AI CATALOG + AGENT PLUGINS")}${head("Find the capability.", "Install the package.")}
      <div class="distribution-lanes"><div class="discovery-lane"><div><small>DISCOVERY / AI CATALOG · DRAFT SPEC</small><h3>Names, types, and URLs</h3><code>application/ai-catalog+json</code></div><span>→</span><p>Discover MCP servers, agents,<br>plugins, and other AI artifacts.</p></div><div class="packaging-lane"><div><small>PACKAGING / AGENT PLUGINS</small><h3>A portable package</h3><code>plugin.json · skills/ · mcp.json</code></div><span>→</span><p>Compatible clients load<br>the bundled components.</p></div></div>
      <p class="qualification">AI Catalog describes available artifacts. Agent Plugins packages reusable components.</p>`,
      sources: [source("AI Catalog draft specification", "https://ai-catalog.io/spec/"),source("Agent Plugins 1.0", "https://agent-plugins.org/")],
      provenance: "Speaker's client-adoption assessment: the earlier MCP Registry specification did not gain client adoption. Registry publication volume is not evidence of client adoption. AI Catalog is a separate draft specification, not an already-adopted replacement.",
      notes: ["The MCP Registry attempt didn't gain client adoption.", "AI Catalog: names, types, and URLs for servers, agents, plugins, and other artifacts.", "Agent Plugins handles the package. Discovery and packaging remain separate.", "Next: we're changing our own client implementation too."] },
    { id: "extensions", branch: "ecosystem", layout: "extensions", title: "Try it as an extension first", body: `
      ${cap("EXTENSION-FIRST DEVELOPMENT")}${head("Try it as", "an extension first.")}
      <div class="extension-orbit"><div class="extension-core">MCP CORE<small>COMMON CONTRACT</small></div><div class="extension-arm"><span>MCP Apps</span><span>Tasks</span><span>Managed authorization</span></div><svg viewBox="0 0 1100 235" aria-hidden="true"><path d="M275 118H505V39H650M505 118H650M505 118V199H650"/></svg></div>
      <blockquote class="short-quote">"If you can implement it as an extension first ... please do that."</blockquote>`,
      sources: [source("Caitie McCaffrey / State of MCP, 14:50",caitie(890)),source("MCP extensions", "https://modelcontextprotocol.io/extensions/overview")],
      notes: ["Test features through implementations before requiring broad adoption.", "Apps, Tasks, managed auth evolve separately.", "Client and server opt into shared extension support."] },
    { id: "agents-map", branch: "agents", map: true, title: "Agent sessions can outlive the editor window", subtitle: "The Agent Host owns the running work.", notes: ["MCP calls are independent. The agent's work continues across them.", "VS Code previously tied that work to one editor window."] },
    { id: "sdk-runtime", branch: "ecosystem", layout: "stack sdk-combined", title: "VS Code is adopting the Copilot SDK", body: `
      ${cap("SDK ECOSYSTEM / OUR OWN MIGRATION")}${head("VS Code is adopting", "the Copilot SDK.")}
      <div class="sdk-context"><p>TypeScript · Python · Go · C# · Rust</p><div><strong>2,558</strong><span>commit-author identities / 42 MCP repositories<small>8 August 2026 · identities are not unique people</small></span></div></div>
      <div class="runtime-stack"><div><small>USER INTERFACE</small><strong>VS Code</strong></div><b>↓</b><div><small>SESSION OWNER</small><strong>Agent Host</strong></div><b>↓</b><div><small>HARNESS</small><strong>Copilot SDK / runtime</strong></div><b>↓</b><div class="stack-accent"><small>MCP IMPLEMENTATION</small><strong>Rust engine / rmcp</strong></div></div>
      <p class="takeaway">SDK behavior and conformance become product dependencies.</p>`,
      sources: [source("Agent Host / Copilot SDK adoption", ahp),source("MCP SDK implementations","https://github.com/modelcontextprotocol")],
      provenance: "2,558 commit-author identities across 42 MCP repositories, compiled in Den Delimarsky's 2026-08-08 snapshot. Includes multiple identities per person. Current rmcp usage is first-person implementation context.",
      notes: ["Two SDKs at launch; now multiple languages and dozens of repositories.", "VS Code → Copilot SDK → Rust MCP engine / rmcp.", "SDK compatibility gaps become product gaps for us.", "We're also moving the agent out of the editor window. Closing a window shouldn't end the work."] },
    { id: "agent-host", branch: "agents", layout: "host", title: "AHP connects clients to one agent session", body: `
      ${cap("AHP / PERSISTENT AGENT SESSIONS")}<div class="heading-row">${head("AHP connects clients", "to one agent session.")}<p>MCP removes implicit transport state.<br>AHP makes agent state authoritative.</p></div>
      <div class="console">${hostDiagram()}</div><div class="dual-note"><span><b>MCP</b> Independently routable capability calls.</span><span><b>AHP</b> One session, multiple attached clients.</span></div>`,
      sources: [source("Agent Host architecture / AHP",ahp)],
      notes: ["Agent Host owns the work. AHP connects editor, Agents window, and browser to the same session.", "The agent still reaches tools through MCP.", "MCP connection state versus the user's ongoing work. Different jobs, different state decisions.", "Tool access ≠ permission to steer a session.", "Long-running work needs progress, partial results, events, and steering. That leads into MCP's roadmap."] },
    { id: "authority", branch: "agents", layout: "authority", title: "Who can use the tool? Who can steer the agent?", body: `
      ${cap("REMOTE BOUNDARIES / IDENTITY + AUTHORITY")}${head("Who can use the tool?", "Who can steer the agent?")}
      <div class="authority-pair"><div><span>MCP</span><h3>Capability access</h3><p>Which tools and resources<br>may this caller use?</p><div class="access-chips"><b>DATA</b><b>ACTIONS</b><b>SCOPE</b></div></div><div><span>AHP / HOST DEPLOYMENT</span><h3>Session participation</h3><p>Who may observe, steer,<br>approve, or cancel this work?</p><div class="access-chips"><b>SESSION</b><b>CONTROL</b><b>CONSENT</b></div></div></div>
      <p class="qualification">Capability access and session control need their own permission checks.</p>`,
      sources: [source("Agent Host / multiple clients and approvals",ahp)],
      notes: ["MCP protects tools and data.", "Agent Host protects observation and control of sessions.", "Separate resources, separate permissions."] },
    { id: "horizon", branch: "agents", layout: "horizon", title: "What we're working on next", body: `
      ${cap("CURRENT CAPABILITIES + OPEN WORK")}${head("What we're", "working on next.")}
      <div class="horizon-lanes"><div><span>EXISTS TODAY</span><h3>Progress<br>Tasks extension</h3></div><div><span>BEING EXPLORED</span><h3>Events<br>Intermediary results<br>Steering</h3></div><div><span>ARCHITECTURE QUESTIONS</span><h3>HTTP-native transport<br>Agent identity<br>Richer primitives</h3></div></div>
      <p class="large-note">Standardize the messaging before settling on an agent abstraction.</p>`,
      sources: [source("MCP development roadmap","https://modelcontextprotocol.io/development/roadmap")],
      notes: ["Today: progress notifications and the Tasks extension.", "Events report changes. Intermediate results show partial work.", "Steering changes direction while work continues.", "Exploring HTTP-native transport, agent identity, richer tool inputs.", "Messaging can evolve while agent designs remain unsettled."] },
    { id: "complete", branch: "foundation", map: true, complete: true, title: "The core got smaller. The skill tree got larger.", subtitle: "Today's speakers are building the next branches.", notes: ["Production clarified state, identity, and interaction ownership.", "Clients and SDKs turned implementation problems into spec feedback.", "Not every server needs every branch.", "Today's speakers build these branches. Tobin closes with what's next."] },
    { id: "references", branch: "foundation", layout: "references", title: "Keep exploring", body: `
      ${cap("SOURCES / CONTINUE AFTER THE TALK")}${head("Keep exploring.")}
      <div class="references-grid"><a href="${spec}" target="_blank" rel="noopener"><span>01</span><h3>MCP specification</h3><p>July 2026 changes and migration ↗</p></a><a href="https://github.com/modelcontextprotocol" target="_blank" rel="noopener"><span>02</span><h3>MCP SDKs</h3><p>Independent implementations of the protocol ↗</p></a><a href="https://modelcontextprotocol.io/extensions/overview" target="_blank" rel="noopener"><span>03</span><h3>MCP extensions</h3><p>Apps, Tasks, and authorization ↗</p></a><a href="${ahp}" target="_blank" rel="noopener"><span>04</span><h3>Agent Host + AHP</h3><p>Persistent, portable agent sessions ↗</p></a><a href="https://agent-plugins.org/" target="_blank" rel="noopener"><span>05</span><h3>Agent Plugins</h3><p>Portable packages for agent clients ↗</p></a><a href="https://ai-catalog.io/spec/" target="_blank" rel="noopener"><span>06</span><h3>AI Catalog</h3><p>Typed discovery across AI artifacts ↗</p></a></div>`,
      notes: ["Spec, SDKs, extensions, AHP, Agent Plugins, and AI Catalog.", "Bring implementation feedback to the working groups."] }
  ];
  const takeaways = {
    start: "MCP evolved because real implementations exposed problems the first design hadn't solved.",
    launch: "MCP launched with two SDKs, two transports, and tools, resources, and prompts already in place.",
    growth: "SDK package downloads reached 514 million in July, thirteen times the previous year.",
    convergence: "In two weeks, OpenAI, VS Code, and Google DeepMind put their support behind the same protocol.",
    "runtime-map": "Running a shared remote server exposed costs that were easy to miss with a local process.",
    pressure: "In some remote deployments, half the messages or more were protocol overhead.",
    "session-bound": "Implicit MCP session state made remote servers harder to route and scale.",
    sessionless: "The July revision makes each request self-describing, so it can reach any replica without MCP session affinity.",
    "explicit-state": "Removing MCP sessions doesn't remove application state. Tools can pass explicit handles between calls.",
    mrtr: "MRTR preserves elicitation without a persistent session: ask the user, then retry with their answer.",
    "clients-map": "Clients turn a protocol capability into something a person can actually use.",
    "client-tree": "Early client implementations help shape MCP, but those clients also pay the cost when the spec changes.",
    apps: "MCP Apps let tools return an interactive interface when text isn't enough.",
    feedback: "Real client use tells us which parts of the specification need to change.",
    retiring: "MCP removed some features, deprecated others, and moved Tasks into an extension so it can evolve separately.",
    "trust-map": "A shared service needs to know who's calling and what they're allowed to do.",
    "authorization-detail": "An MCP server can use an existing identity provider instead of building its own.",
    authorization: "MCP servers can reuse existing identity providers; clients still control individual tool actions.",
    consent: "Signing in is not blanket permission for every tool action.",
    governance: "Implementers need migration time and conformance tests to keep working through protocol changes.",
    "ecosystem-map": "Products increasingly depend on MCP SDKs maintained by other teams.",
    sdks: "Independent SDKs make MCP useful across languages, and they need to agree on its behavior.",
    distribution: "AI Catalog is the discovery specification to watch. Agent Plugins handles packaging; client adoption remains the test.",
    extensions: "Try a feature as an extension and learn from implementations before requiring it more broadly.",
    "agents-map": "The agent's ongoing work needs an owner that outlives an individual editor window.",
    "sdk-runtime": "Adopting the Copilot SDK makes the Rust MCP implementation and its compatibility a direct dependency for VS Code.",
    "agent-host": "MCP removes implicit transport sessions; AHP explicitly owns the agent session so several clients can share the same work.",
    authority: "Permission to call a tool is different from permission to observe or steer an agent session.",
    horizon: "MCP's next messaging work helps agents report partial results, react to events, and accept steering during execution.",
    complete: "MCP grew by clarifying who owns state, identity, and interaction, while leaving room for more capabilities.",
    references: "Build with the SDKs, check the specification, and bring implementation feedback to the working groups."
  };
  slides.forEach(slide => {
    if (!takeaways[slide.id]) throw new Error(`Missing primary takeaway: ${slide.id}`);
    slide.notes = [takeaways[slide.id], ...slide.notes];
  });
  const mainRoute = [
    "start", "launch", "growth", "convergence",
    "runtime-map", "pressure", "session-bound", "sessionless", "explicit-state", "mrtr",
    "clients-map", "client-tree", "apps", "retiring",
    "authorization", "ecosystem-map", "governance", "distribution", "sdk-runtime",
    "agent-host", "horizon", "complete", "references"
  ];
  const byId = new Map(slides.map(slide => [slide.id, slide]));
  const mainSlides = mainRoute.map(id => {
    const slide = byId.get(id);
    if (!slide) throw new Error(`Missing slide in main route: ${id}`);
    return slide;
  });
  const backupSlides = slides.filter(slide => !mainRoute.includes(slide.id));
  const includeBackups = new URLSearchParams(location.search).get("backups") === "1";
  window.MCP_DECK = { branches, slides:includeBackups ? [...mainSlides, ...backupSlides] : mainSlides, backupSlides, downloads: [
    ["2024-11",27054],["2024-12",186215],["2025-01",322657],["2025-02",668818],["2025-03",3381311],["2025-04",7710974],["2025-05",28897245],["2025-06",27644319],["2025-07",39509467],["2025-08",57914516],["2025-09",79643841],["2025-10",81309577],["2025-11",91750070],["2025-12",100700517],["2026-01",119124419],["2026-02",157385131],["2026-03",313182089],["2026-04",384546829],["2026-05",441885037],["2026-06",450853888],["2026-07",513956696]
  ] };
})();
