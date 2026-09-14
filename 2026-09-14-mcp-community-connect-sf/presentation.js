(() => {
  const { branches, slides, downloads } = window.MCP_DECK;
  const stage = document.getElementById("stage");
  const world = document.getElementById("world");
  const scenes = document.getElementById("scenes");
  const mapNodes = document.getElementById("map-nodes");
  const next = document.getElementById("next");
  const branchesById = new Map(branches.map(branch => [branch.id, branch]));
  let index = 0;
  let notesWindow = null;
  const notesChannel = crypto.randomUUID();
  let overviewReturn = null;
  let wheelTime = 0;
  let touch = null;
  const visitedSlides = new Set();
  const visitedBranches = new Set();
  let lastContentBranch = null;

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  // Slide content is local, authored markup; runtime metadata is inserted as text.
  slides.forEach(slide => {
    if (slide.map) return;
    const branch = branchesById.get(slide.branch);
    const article = element("article", `scene ${slide.layout}`);
    article.id = slide.id;
    article.style.setProperty("--x", `${branch.x}px`);
    article.style.setProperty("--y", `${branch.y}px`);
    article.style.setProperty("--accent", branch.color);
    article.innerHTML = slide.body;
    article.inert = true;
    article.setAttribute("aria-hidden", "true");
    const heading = article.querySelector("h1");
    heading.id = `${slide.id}-title`;
    article.setAttribute("aria-labelledby", heading.id);
    if (slide.sources?.length) {
      const sources = element("div", "source-row");
      slide.sources.forEach(source => {
        const link = element("a", "", `${source.label} ↗`);
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noopener";
        sources.append(link);
      });
      article.append(sources);
    }
    scenes.append(article);
  });

  const net = document.getElementById("network");
  net.innerHTML = `<defs><pattern id="network-grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#68819a" stroke-width="1" opacity=".15"/></pattern><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="context-stroke" stroke-width="1.5"/></marker></defs><rect width="4800" height="2900" fill="url(#network-grid)"/>`;
  const treePositions = new Map(branches.map(branch => [branch.id, {x:branch.x,y:branch.y}]));
  const skills = {
    runtime:[["HTTP","pressure"],["Stateless","sessionless"],["Handles","explicit-state"]],
    clients:[["Elicitation","mrtr"],["MCP Apps","apps"],["Feedback","client-tree"]],
    trust:[["Identity","authorization"],["Consent","authorization"],["Policy","authorization"]],
    ecosystem:[["SDKs","sdk-runtime"],["AI Catalog","distribution"],["Plugins","distribution"]],
    agents:[["AHP","agent-host"],["Sessions","agent-host"],["Remote","agent-host"]]
  };
  function treeEdge(d, branch) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.classList.add("map-edge");
    path.dataset.to = branch.id;
    path.style.setProperty("--edge-color",branch.color);
    net.append(path);
  }
  const root = treePositions.get("foundation");
  branches.slice(1).forEach(branch => {
    const position = treePositions.get(branch.id);
    treeEdge(`M${root.x} ${root.y-225}V1850H${position.x}V${position.y+225}`, branch);
    skills[branch.id].forEach(([label,slideId],i) => {
      const x = position.x + (i-1)*245, y=780;
      treeEdge(`M${position.x} ${position.y-225}V1040H${x}V${y+52}`,branch);
      const leaf = element("button","skill-leaf",label);
      leaf.style.setProperty("--x",`${x}px`);
      leaf.style.setProperty("--y",`${y}px`);
      leaf.style.setProperty("--node-color",branch.color);
      leaf.dataset.owner = branch.id;
      leaf.dataset.slide = slideId;
      leaf.setAttribute("aria-label",`Explore ${label}`);
      leaf.addEventListener("click",()=>{
        overviewReturn=null;
        show(slides.findIndex(slide=>slide.id===slideId));
        next.focus({preventScroll:true});
      });
      mapNodes.append(leaf);
    });
  });
  branches.forEach((branch, position) => {
    const node = element("button", "map-node");
    const treePosition = treePositions.get(branch.id);
    node.style.setProperty("--x", `${treePosition.x}px`);
    node.style.setProperty("--y", `${treePosition.y}px`);
    node.style.setProperty("--node-color", branch.color);
    node.dataset.branch = branch.id;
    node.setAttribute("aria-label", `Explore ${branch.name}`);
    node.append(element("span", "map-icon", position === 0 ? "MCP" : `0${position}`), element("span", "map-state", "EXPLORE"), element("strong", "", position === 0 ? "MCP EVOLUTION" : branch.name), element("small", "", branch.summary));
    node.addEventListener("click", () => {
      overviewReturn = null;
      show(slides.findIndex(slide => slide.id === branch.start));
      next.focus({ preventScroll: true });
    });
    mapNodes.append(node);
  });

  function renderChart() {
    const points = downloads.map(([, value], i) => [50 + i * 650 / (downloads.length - 1), 330 - value / 550000000 * 290]);
    const line = points.map(pair => pair.join(",")).join(" ");
    const point = points[8];
    const chart = document.getElementById("download-chart");
    chart.innerHTML = `<svg viewBox="0 0 750 410" role="img" aria-label="Monthly package downloads rise from 27 thousand in November 2024 to 514 million in July 2026.">
      <path d="M50 40H700M50 185H700M50 330H700" stroke="#334861" fill="none"/>
      <polygon points="50,330 ${line} 700,330" fill="#f7cd8c11"/><polyline points="${line}" stroke="#f7cd8c" stroke-width="4" fill="none"/>
      <g fill="#a7b9c9" font-family="monospace" font-size="12"><text x="50" y="385">NOV 2024</text><text x="610" y="385">JUL 2026</text><text x="50" y="25">MONTHLY DOWNLOADS</text><text x="710" y="51">550M</text></g>
      <circle cx="${point[0]}" cy="${point[1]}" r="5" fill="#f7cd8c"/><text x="${point[0]-24}" y="${point[1]-20}" fill="#d6d9d6" font-family="monospace" font-size="13">39.5M</text>
      <circle cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="6" fill="#f7cd8c"/>
      </svg>`;
  }
  renderChart();

  const flameFrames = [
    { name:"all stacks", start:0, samples:1000, depth:0, parent:null },
    { name:"render", start:0, samples:700, depth:1, parent:0 },
    { name:"parseData", start:700, samples:300, depth:1, parent:0 },
    { name:"layout", start:0, samples:450, depth:2, parent:1 },
    { name:"resolveStyle", start:450, samples:150, depth:2, parent:1 },
    { name:"paint", start:600, samples:100, depth:2, parent:1 },
    { name:"JSON.parse", start:700, samples:220, depth:2, parent:2 },
    { name:"validate", start:920, samples:80, depth:2, parent:2 },
    { name:"measureText", start:0, samples:330, depth:3, parent:3 },
    { name:"positionNodes", start:330, samples:120, depth:3, parent:3 },
    { name:"shapeGlyphs", start:0, samples:250, depth:4, parent:8 }
  ];
  const flameGraph = document.getElementById("flame-graph");
  const flameButtons = flameFrames.map((frame, position) => {
    const button = element("button", "flame-frame", frame.name);
    button.type = "button";
    button.dataset.frame = String(position);
    button.style.setProperty("--depth", frame.depth);
    button.classList.add(frame.start >= 700 ? "cool" : "warm");
    button.setAttribute("aria-label", `${frame.name}: ${frame.samples} samples, ${frame.samples / 10}% of profile. Zoom to frame.`);
    button.title = `${frame.name} · ${frame.samples} inclusive samples`;
    button.addEventListener("click", () => zoomFlame(position));
    flameGraph.append(button);
    return button;
  });
  function isFlameAncestor(ancestor, descendant) {
    for (let current = descendant; current !== null; current = flameFrames[current].parent) {
      if (current === ancestor) return true;
    }
    return false;
  }
  function zoomFlame(selected) {
    const frame = flameFrames[selected];
    flameButtons.forEach((button, position) => {
      const ancestor = isFlameAncestor(position, selected);
      const visible = ancestor || isFlameAncestor(selected, position);
      button.hidden = !visible;
      button.setAttribute("aria-pressed", String(position === selected));
      button.classList.toggle("ancestor", ancestor && position !== selected);
      const current = flameFrames[position];
      button.style.left = `${ancestor ? 0 : (current.start - frame.start) / frame.samples * 100}%`;
      button.style.width = `${ancestor ? 100 : current.samples / frame.samples * 100}%`;
    });
    document.getElementById("flame-scope").textContent = selected === 0 ? "All stacks" : `Zoom / ${frame.name}`;
    document.getElementById("flame-name").textContent = frame.name;
    document.getElementById("flame-value").textContent = `${frame.samples.toLocaleString("en-US")} samples · ${frame.samples / 10}% of profile`;
    document.getElementById("flame-reset").disabled = selected === 0;
  }
  document.getElementById("flame-reset").addEventListener("click", () => {
    zoomFlame(0);
    flameButtons[0].focus({preventScroll:true});
  });
  zoomFlame(0);

  function fit() {
    const scale = Math.min(innerWidth / 1600, innerHeight / 900);
    stage.style.transform = `scale(${scale})`;
    stage.style.left = `${(innerWidth - 1600 * scale) / 2}px`;
    stage.style.top = `${(innerHeight - 900 * scale) / 2}px`;
  }

  function updateMap(slide, overviewMode = false) {
    const branchIndex = branches.findIndex(branch => branch.id === slide.branch);
    const upcoming = slide.complete ? null : slide.branch;
    const previousBranch = lastContentBranch && lastContentBranch !== upcoming ? lastContentBranch : null;
    [...mapNodes.querySelectorAll(".map-node")].forEach((node, position) => {
      const id = node.dataset.branch;
      const current = id === upcoming;
      const visited = !!slide.complete || visitedBranches.has(id);
      node.classList.toggle("current", current);
      node.classList.toggle("visited", visited && !current);
      node.classList.toggle("future", !visited && !current);
      node.classList.remove("just-visited");
      if (id === previousBranch || (slide.complete && id === lastContentBranch)) {
        void node.offsetWidth;
        node.classList.add("just-visited");
      }
      const label = current ? overviewMode ? "● YOU ARE HERE" : "↗ UP NEXT" : visited ? "✓ VISITED" : "UNEXPLORED";
      node.querySelector(".map-state").textContent = label;
      node.setAttribute("aria-label",`${branches[position].name}. ${label.replace(/[●↗✓]/g,"").trim()}. Explore branch.`);
    });
    mapNodes.querySelectorAll(".skill-leaf").forEach(leaf=>{
      const visited = !!slide.complete || visitedSlides.has(leaf.dataset.slide);
      leaf.classList.toggle("explored",visited);
      leaf.classList.toggle("upcoming",!visited && leaf.dataset.owner===upcoming);
    });
    net.querySelectorAll(".map-edge").forEach(path => {
      path.classList.toggle("lit",!!slide.complete || visitedBranches.has(path.dataset.to));
      path.classList.toggle("charging",!overviewMode && path.dataset.to===upcoming);
    });
    const caption = document.getElementById("map-caption");
    const handoff = slide.complete ? "TREE EXPLORED / MORE BRANCHES AHEAD"
      : overviewMode ? `${branches[branchIndex].name.toUpperCase()} / YOU ARE HERE`
      : previousBranch ? `✓ ${branchesById.get(previousBranch).name.toUpperCase()} VISITED  →  ${branches[branchIndex].name.toUpperCase()} NEXT`
      : `${branches[branchIndex].name.toUpperCase()} / UP NEXT`;
    caption.replaceChildren(element("small", "map-handoff", handoff), element("h1", "", slide.title), element("p", "", slide.subtitle));
  }

  function updateNotes() {
    if (!notesWindow || notesWindow.closed) return;
    notesWindow.postMessage({
      type:"slide", channel:notesChannel, index, total:slides.length,
      title:slides[index].title, notes:slides[index].notes
    }, location.protocol === "file:" ? "*" : location.origin);
  }

  function show(target, record = true, forceMap = false) {
    index = Math.max(0, Math.min(target, slides.length - 1));
    const slide = slides[index];
    const branch = branchesById.get(slide.branch);
    const map = forceMap || !!slide.map;
    if (!map && slide.id !== "references") {
      visitedSlides.add(slide.id);
      visitedBranches.add(slide.branch);
      lastContentBranch = slide.branch;
    }
    const focusScene = document.activeElement?.closest(".scene");
    if ((focusScene && focusScene.id !== slide.id) || document.activeElement?.closest("#map-nodes")) next.focus({ preventScroll: true });
    stage.classList.toggle("map-view", map);
    stage.dataset.slide = slide.id;
    stage.style.setProperty("--accent", branch.color);
    const scale = map ? .285 : 1;
    const x = map ? 2510 : branch.x;
    const y = map ? 1450 : branch.y;
    world.style.transform = `translate(${800 - x * scale}px,${450 - y * scale}px) scale(${scale})`;
    scenes.querySelectorAll(".scene").forEach(scene => {
      const active = !map && scene.id === slide.id;
      scene.classList.toggle("active", active);
      scene.inert = !active;
      scene.setAttribute("aria-hidden", String(!active));
    });
    mapNodes.inert = !map;
    mapNodes.setAttribute("aria-hidden", String(!map));
    document.getElementById("map-caption").setAttribute("aria-hidden", String(!map));
    if (map) updateMap(forceMap ? { ...slide, complete:false, title:"The MCP skill tree", subtitle:branch.summary } : slide, forceMap);
    document.getElementById("branch-name").textContent = branch.name.toUpperCase();
    document.getElementById("counter").textContent = `${String(index + 1).padStart(2,"0")} / ${slides.length}`;
    document.getElementById("progress").style.width = `${(index + 1) / slides.length * 100}%`;
    document.getElementById("previous").disabled = index === 0;
    next.disabled = index === slides.length - 1;
    document.getElementById("status").textContent = `Slide ${index + 1} of ${slides.length}. ${slide.title}`;
    document.title = `${slide.title} / MCP skill tree`;
    if (record) history.replaceState(null, "", `#${slide.id}`);
    updateNotes();
  }

  function overview() {
    if (overviewReturn !== null) {
      const previousIndex = overviewReturn;
      overviewReturn = null;
      show(previousIndex);
      return;
    }
    overviewReturn = index;
    show(index, false, true);
  }

  function openNotes() {
    if (notesWindow && !notesWindow.closed) { notesWindow.focus(); updateNotes(); return; }
    const url = new URL("notes.html", location.href);
    if (new URLSearchParams(location.search).get("backups") === "1") url.searchParams.set("backups", "1");
    url.searchParams.set("channel", notesChannel);
    url.searchParams.set("slide", slides[index].id);
    notesWindow = window.open(url.href, `mcp-notes-${notesChannel}`, "popup,width=720,height=850");
    if (!notesWindow) {
      document.getElementById("status").textContent = "Speaker notes were blocked. Allow popups for this deck, then press N again.";
    }
  }

  addEventListener("message", event => {
    if (event.source !== notesWindow || event.data?.channel !== notesChannel) return;
    if (event.data.type === "ready") updateNotes();
    else if (event.data.type === "navigate" && [1,-1].includes(event.data.delta)) {
      overviewReturn = null;
      show(index + event.data.delta);
    }
  });

  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch(error) {
      console.error("Fullscreen failed",error);
      document.getElementById("status").textContent = "Fullscreen unavailable. Use the browser's fullscreen command.";
    }
  }

  next.addEventListener("click", () => { overviewReturn = null; show(index + 1); });
  document.getElementById("previous").addEventListener("click", () => { overviewReturn = null; show(index - 1); });
  document.getElementById("overview").addEventListener("click", overview);
  addEventListener("keydown", event => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.target.closest("input,textarea,select,[contenteditable]")) return;
    if (event.key === " " && event.target.closest("button,a")) return;
    if (["ArrowRight","ArrowDown","PageDown"," "].includes(event.key)) {
      event.preventDefault(); overviewReturn = null; show(index + 1);
    } else if (["ArrowLeft","ArrowUp","PageUp"].includes(event.key)) {
      event.preventDefault(); overviewReturn = null; show(index - 1);
    } else if (event.key === "Home") { overviewReturn = null; show(0); }
    else if (event.key === "End") { overviewReturn = null; show(slides.length - 1); }
    else if (event.key.toLowerCase() === "m") overview();
    else if (event.key === "Escape" && overviewReturn !== null) overview();
    else if (event.key.toLowerCase() === "n") openNotes();
    else if (event.key.toLowerCase() === "f") fullscreen();
  });
  addEventListener("wheel", event => {
    if (event.ctrlKey || Math.abs(event.deltaY) < 18 || Date.now() - wheelTime < 900) return;
    event.preventDefault(); wheelTime = Date.now(); overviewReturn = null;
    show(index + Math.sign(event.deltaY));
  }, { passive:false });
  addEventListener("touchstart", event => { touch = event.touches.length === 1 ? { x:event.touches[0].clientX,y:event.touches[0].clientY } : null; }, {passive:true});
  addEventListener("touchend", event => {
    if (!touch || !event.changedTouches.length) return;
    const dx = touch.x - event.changedTouches[0].clientX, dy = touch.y - event.changedTouches[0].clientY;
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (Math.abs(delta) > 50) { overviewReturn = null; show(index + Math.sign(delta)); }
    touch = null;
  }, {passive:true});
  function readHash() {
    overviewReturn = null;
    const found = slides.findIndex(slide => `#${slide.id}` === location.hash);
    show(found < 0 ? 0 : found, false);
  }
  addEventListener("hashchange",readHash);
  addEventListener("resize",fit);
  fit();
  readHash();
})();
