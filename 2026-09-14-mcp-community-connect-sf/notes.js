(() => {
  const params = new URLSearchParams(location.search);
  const channel = params.get("channel");
  const presentation = window.opener;
  const target = location.protocol === "file:" ? "*" : location.origin;
  const connection = document.getElementById("connection");
  let readyTimer;

  function render(index, total, title, notes) {
    document.title = `${index + 1} / ${total} · ${title}`;
    document.getElementById("notes-title").textContent = document.title;
    const list = document.getElementById("notes-list");
    list.replaceChildren(...notes.map((note, position) => {
      const item = document.createElement("li");
      if (position === 0) {
        item.className = "primary-takeaway";
        const strong = document.createElement("strong");
        strong.textContent = note;
        item.append(strong);
      } else {
        item.textContent = note;
      }
      return item;
    }));
    scrollTo(0,0);
  }
  const initial = window.MCP_DECK.slides.findIndex(slide => slide.id === params.get("slide"));
  if (initial >= 0) {
    const slide = window.MCP_DECK.slides[initial];
    render(initial, window.MCP_DECK.slides.length, slide.title, slide.notes);
  }
  addEventListener("message", event => {
    if (event.source !== presentation || event.data?.channel !== channel || event.data.type !== "slide") return;
    const {index,total,title,notes} = event.data;
    if (!Number.isInteger(index) || !Number.isInteger(total) || typeof title !== "string" || !Array.isArray(notes) || !notes.every(note => typeof note === "string")) return;
    clearInterval(readyTimer);
    connection.hidden = true;
    render(index,total,title,notes);
  });
  function requestSync() {
    if (!presentation || presentation.closed) {
      clearInterval(readyTimer);
      connection.hidden = false;
      connection.textContent = "Not connected. Open notes with N from the presentation.";
      return;
    }
    presentation.postMessage({type:"ready",channel},target);
  }
  if (presentation && channel) {
    readyTimer = setInterval(requestSync,1000);
    requestSync();
  } else {
    connection.textContent = "Standalone notes. Open with N from the deck for synchronization.";
  }
  addEventListener("keydown", event => {
    if (!presentation || presentation.closed || event.metaKey || event.ctrlKey || event.altKey) return;
    if (["ArrowRight","PageDown","ArrowLeft","PageUp"].includes(event.key)) {
      event.preventDefault();
      presentation.postMessage({type:"navigate",channel,delta:["ArrowRight","PageDown"].includes(event.key)?1:-1},target);
    }
    if (event.key.toLowerCase() === "n") presentation.focus();
  });
  addEventListener("pagehide",()=>clearInterval(readyTimer));
})();
