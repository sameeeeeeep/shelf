// ../../packages/protocol/dist/version.js
var PROVIDER_GLOBAL = "claude";

// ../../packages/sdk/dist/connect-chip.js
var STYLE = `
:host { all: initial; }
* { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
.chip, .btn { display: inline-flex; align-items: center; gap: 9px; cursor: pointer; border: 0;
  font-size: 13px; font-weight: 600; line-height: 1; border-radius: 10px; }
/* The canonical connect lockup \u2014 the SAME mark + wordmark on every wrapp, so users recognize
   "Connect Switchboard" the way they knew the MetaMask button. Dark pill, lime glyph, locked in
   the shadow root so a host app can't restyle it away. */
.btn { padding: 9px 15px 9px 11px; background: #12151C; color: #E8EDF4; border: 1px solid #2C3444; }
.btn.connect:hover { background: #161B24; border-color: #3A4A18; }
.btn.get { color: #C3CAD6; border-color: #262C38; }
.btn.get:hover { color: #E8EDF4; border-color: #3A4353; }
.btn .arr { color: #6E7C90; font-weight: 500; margin-left: -2px; }
/* The Switchboard mark: lime rounded square with the top-right notch (matches the side-panel brand).
   Muted to slate when the sidekick isn't installed yet \u2014 the mark "lights up" once you can connect. */
.glyph { position: relative; width: 16px; height: 16px; border-radius: 5px; background: #C8F250;
  box-shadow: 0 0 12px rgba(200,242,80,.45); flex: none; }
.glyph::after { content: ""; position: absolute; top: 4px; right: 4px; width: 4px; height: 4px;
  border-radius: 50%; background: #0A0C10; }
.btn.get .glyph { background: #6E7C90; box-shadow: none; }
.wrap { position: relative; display: inline-block; }
.chip { background: #1A1F29; border: 1px solid #262C38; padding: 6px 10px 6px 7px; color: #E8EDF4; }
.chip:hover { border-color: #3A4353; }
.av { width: 26px; height: 26px; border-radius: 7px; background: #C8F250; color: #0A0C10; display: grid;
  place-items: center; font-weight: 700; font-size: 12px; overflow: hidden; flex: none; }
.av img { width: 100%; height: 100%; object-fit: cover; }
.who { display: flex; flex-direction: column; gap: 3px; min-width: 0; text-align: left; }
.who .hi { font-size: 12.5px; font-weight: 600; white-space: nowrap; }
.who .proj { font-size: 10.5px; font-weight: 500; color: #99A3B7; white-space: nowrap; }
.caret { color: #6E7C90; font-size: 9px; margin-left: 2px; }
.menu { position: absolute; top: calc(100% + 6px); right: 0; z-index: 2147483000; width: 232px;
  background: #1A1F29; border: 1px solid #262C38; border-radius: 12px; padding: 7px;
  box-shadow: 0 18px 40px -20px rgba(0,0,0,.7); }
.menu .lbl { padding: 8px 10px 6px; font-size: 10px; font-weight: 600; letter-spacing: .06em;
  text-transform: uppercase; color: #6E7C90; }
.menu .proj-row { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px;
  background: #20262F; cursor: pointer; border: 0; width: 100%; color: #E8EDF4; font-size: 13px; font-weight: 600; }
.menu .proj-row:hover { background: #262d38; }
.menu .proj-row .go { margin-left: auto; color: #C8F250; font-size: 11px; font-weight: 600; }
.menu .sep { height: 1px; background: #262C38; margin: 6px 4px; }
.menu .item { display: block; width: 100%; text-align: left; padding: 8px 10px; border: 0; border-radius: 8px;
  background: transparent; color: #B4BECE; font-size: 13px; font-weight: 500; cursor: pointer; }
.menu .item:hover { background: #20262F; color: #E8EDF4; }
.menu .foot { padding: 8px 10px 4px; font-size: 11px; font-weight: 500; color: #6E7C90; line-height: 1.4; }
`;
function mountConnect(target, opts = {}) {
  const installUrl = opts.installUrl ?? "https://thelastprompt.ai/switchboard/";
  const host = document.createElement("div");
  host.style.display = "inline-block";
  const root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = STYLE;
  root.append(style);
  const mount = document.createElement("div");
  root.append(mount);
  target.append(host);
  let state = { kind: "booting" };
  let menuOpen = false;
  let destroyed = false;
  let relay2 = null;
  let seq = 0;
  let wasConnected = false;
  let sessionDisconnected = false;
  const onDocClick = (e) => {
    if (menuOpen && !host.contains(e.target)) {
      menuOpen = false;
      render();
    }
  };
  document.addEventListener("click", onDocClick);
  function el2(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls)
      n.className = cls;
    if (text != null)
      n.textContent = text;
    return n;
  }
  async function refresh() {
    const my = ++seq;
    const r = await whenRelayReady(2500, { installUrl });
    if (destroyed || my !== seq)
      return;
    if (!(r instanceof Relay)) {
      state = { kind: "not-installed", installUrl };
      return render();
    }
    relay2 = r;
    subscribe(r);
    const grant = sessionDisconnected ? null : await r.permissions().catch(() => null);
    if (destroyed || my !== seq)
      return;
    if (!grant) {
      state = { kind: "disconnected", relay: r };
      emitTransition(false);
      return render();
    }
    const [user, project] = await Promise.all([r.identity(), r.context.active().catch(() => null)]);
    if (destroyed || my !== seq)
      return;
    state = { kind: "connected", relay: r, user, project };
    emitTransition(true);
    render();
  }
  function emitTransition(connected) {
    if (connected === wasConnected)
      return;
    wasConnected = connected;
    if (connected && relay2)
      opts.onConnect?.(relay2);
    else if (!connected)
      opts.onDisconnect?.();
  }
  let subscribed = false;
  function subscribe(r) {
    if (subscribed)
      return;
    subscribed = true;
    r.on("permissionsChanged", () => {
      void refresh();
    });
    r.on("disconnect", () => {
      void refresh();
    });
  }
  async function doConnect() {
    if (!relay2)
      return;
    try {
      sessionDisconnected = false;
      await relay2.connect(opts.scope);
      await refresh();
    } catch {
    }
  }
  async function doPick() {
    if (!relay2)
      return;
    menuOpen = false;
    render();
    const project = await relay2.context.pick().catch(() => null);
    opts.onProjectChange?.(project);
    await refresh();
  }
  async function doDisconnect() {
    if (!relay2)
      return;
    menuOpen = false;
    sessionDisconnected = true;
    await relay2.disconnect().catch(() => {
    });
    await refresh();
  }
  function render() {
    if (destroyed)
      return;
    mount.textContent = "";
    if (state.kind === "booting")
      return;
    if (state.kind === "not-installed") {
      const b = el2("button", "btn get");
      b.append(el2("span", "glyph"), el2("span", void 0, "Get Switchboard"), el2("span", "arr", "\u2197"));
      b.onclick = () => window.open(state.kind === "not-installed" ? state.installUrl : installUrl, "_blank", "noopener");
      mount.append(b);
      return;
    }
    if (state.kind === "disconnected") {
      const b = el2("button", "btn connect");
      b.append(el2("span", "glyph"), el2("span", void 0, "Connect Switchboard"));
      b.onclick = doConnect;
      mount.append(b);
      return;
    }
    const { user, project } = state;
    const rawName = user?.name?.trim();
    const collides = !!rawName && !!project?.name && rawName.toLowerCase() === project.name.toLowerCase();
    const name = !rawName || collides ? "there" : rawName;
    const wrap = el2("div", "wrap");
    const chip = el2("button", "chip");
    const av = el2("div", "av");
    if (user?.avatar) {
      const img = el2("img");
      img.src = user.avatar;
      img.alt = name;
      av.append(img);
    } else
      av.textContent = name.charAt(0).toUpperCase();
    const who = el2("div", "who");
    who.append(el2("div", "hi", `Hi ${name}`));
    who.append(el2("div", "proj", project ? project.name : "No context lent"));
    chip.append(av, who, el2("span", "caret", "\u25BE"));
    chip.onclick = (e) => {
      e.stopPropagation();
      menuOpen = !menuOpen;
      render();
    };
    wrap.append(chip);
    if (menuOpen) {
      const menu = el2("div", "menu");
      menu.append(el2("div", "lbl", "Working on"));
      const row = el2("button", "proj-row");
      row.append(el2("span", void 0, project ? project.name : "Choose a context"));
      row.append(el2("span", "go", project ? "Switch \u25B8" : "Choose \u25B8"));
      row.onclick = doPick;
      menu.append(row, el2("div", "sep"));
      const dc = el2("button", "item", "Disconnect this app");
      dc.onclick = doDisconnect;
      menu.append(dc);
      menu.append(el2("div", "foot", "Connectors, budgets & activity live in the Switchboard toolbar panel."));
      wrap.append(menu);
    }
    mount.append(wrap);
  }
  render();
  void refresh();
  return {
    refresh: () => void refresh(),
    destroy: () => {
      destroyed = true;
      document.removeEventListener("click", onDocClick);
      host.remove();
    }
  };
}

// ../../packages/sdk/dist/index.js
var Relay = class {
  provider;
  constructor(provider) {
    this.provider = provider;
  }
  get version() {
    return this.provider.version;
  }
  capabilities() {
    return this.provider.request({ method: "claude_capabilities" });
  }
  connect(scope) {
    return this.provider.request({ method: "claude_connect", params: scope });
  }
  /** Drop this app's connection for the current page session. The grant persists (a later connect()
   *  won't reprompt) — this is "disconnect from this tab", not "revoke". Full revoke lives in the panel. */
  disconnect() {
    return this.provider.request({ method: "claude_disconnect" });
  }
  permissions() {
    return this.provider.request({ method: "claude_permissions" });
  }
  /** The paired user's public identity (name/avatar), or null if unavailable. Convenience over
   *  capabilities().user — what the connect chip greets with ("Hi Sameep"). */
  identity() {
    return this.capabilities().then((c) => c.user ?? null).catch(() => null);
  }
  /** Synthesize speech ON-DEVICE via a local model/engine (no cloud, no connector, no credits).
   *  Returns audio as a playable data: URL, or null if no local TTS is available.
   *
   *    const clip = await relay.speak("hey, it's Maya");
   *    if (clip) new Audio(clip.audio).play();
   */
  speak(text, opts) {
    return this.provider.request({ method: "claude_speak", params: { text, voice: opts?.voice } }).catch(() => null);
  }
  listTools() {
    return this.provider.request({ method: "claude_listTools" }).then((r) => r.tools);
  }
  callTool(name, args) {
    const call = { name, arguments: args };
    return this.provider.request({ method: "claude_callTool", params: call });
  }
  complete(params) {
    return this.provider.request({ method: "claude_complete", params });
  }
  /** Streamed completion as an async iterator of deltas. Ends after a `done`/`error` delta. */
  async *stream(params) {
    const { streamId } = await this.provider.request({ method: "claude_stream", params });
    const queue = [];
    let notify = null;
    let ended = false;
    const handler = (payload) => {
      const p = payload;
      if (p.streamId !== streamId)
        return;
      queue.push(p);
      if (p.type === "done" || p.type === "error")
        ended = true;
      notify?.();
    };
    this.provider.on("delta", handler);
    try {
      while (true) {
        if (queue.length === 0) {
          if (ended)
            break;
          await new Promise((r) => notify = r);
          notify = null;
          continue;
        }
        yield queue.shift();
      }
    } finally {
      this.provider.removeListener("delta", handler);
    }
  }
  on(event, handler) {
    this.provider.on(event, handler);
  }
  /**
   * Per-origin local storage — a private on-disk key/value store for this app, plus `bind` to point
   * it at a real folder the user picks. Values are opaque strings (store JSON). Isolated per origin;
   * reads are free, writes need the site not to be read-only, and `bind` prompts for the exact path.
   *
   *   await relay.storage.set("workspace", JSON.stringify(data));
   *   const raw = await relay.storage.get("workspace");
   *   await relay.storage.bind("~/Documents/Projects/brandbrain/.data"); // existing files appear as records
   */
  get storage() {
    const req = (params) => this.provider.request({ method: "claude_storage", params });
    return {
      get: (key) => req({ op: "get", key }).then((r) => r.value ?? null),
      set: (key, value) => req({ op: "set", key, value }).then(() => void 0),
      delete: (key) => req({ op: "delete", key }).then((r) => r.ok),
      list: () => req({ op: "list" }).then((r) => r.keys ?? []),
      info: () => req({ op: "info" }).then((r) => r.info),
      /** Point this app's store at a real folder (triggers a path-consent click). */
      bind: (path) => req({ op: "bind", path }).then((r) => r.info)
    };
  }
  /**
   * Shared, cross-app context — your portable brand knowledge. Publish a whole context; read the one
   * the user selected for this app; or open the picker. Selection happens in the side panel, so an
   * app only ever receives the context the user chose to lend it — never the whole library.
   *
   *   await relay.context.publish({ name: "Aamras", kind: "brand", data: brand });
   *   const active = await relay.context.active();   // the brand the user loaded for this app, or null
   */
  get context() {
    const req = (params) => this.provider.request({ method: "claude_context", params });
    return {
      publish: (context) => req({ op: "publish", context }).then((r) => r.id),
      list: () => req({ op: "list" }).then((r) => r.contexts ?? []),
      active: () => req({ op: "active" }).then((r) => r.context ?? null),
      pick: () => req({ op: "pick" }).then((r) => r.context ?? null)
    };
  }
};
var DEFAULT_INSTALL_URL = "https://thelastprompt.ai/switchboard/";
function getRelay(opts) {
  const provider = globalThis[PROVIDER_GLOBAL];
  if (provider?.isRelay)
    return new Relay(provider);
  return { installed: false, installUrl: opts?.installUrl ?? DEFAULT_INSTALL_URL };
}
function whenRelayReady(timeoutMs = 3e3, opts) {
  const now = getRelay(opts);
  if (now instanceof Relay)
    return Promise.resolve(now);
  return new Promise((resolve) => {
    const onInit = () => {
      cleanup();
      resolve(getRelay(opts));
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve({ installed: false, installUrl: opts?.installUrl ?? DEFAULT_INSTALL_URL });
    }, timeoutMs);
    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener(`${PROVIDER_GLOBAL}#initialized`, onInit);
    }
    window.addEventListener(`${PROVIDER_GLOBAL}#initialized`, onInit);
  });
}

// src/shelf.js
var $ = (id) => document.getElementById(id);
var el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
var INSTALL_URL = "https://thelastprompt.ai/switchboard/";
var K_CSV = "shelf:csv";
var K_STEER = "shelf:steer";
var K_LAST = "shelf:last";
var K_PLAY = "shelf:playbook";
var relay = null;
var installed = true;
var running = false;
var triageSeq = 0;
var refineSeq = 0;
var rows = [];
var brand = null;
var plans = [];
var selectedPlan = null;
var SAMPLE_CSV = `SKU,Product,On hand,Avg weekly sales,Unit cost (INR),Price (INR),Lead time (days)
VCS-10,Vitamin C Serum 10%,96,84,210,649,21
SPF-50,Daily SPF 50 Gel,140,120,165,499,18
NIA-05,Niacinamide 5% Toner,60,46,140,449,14
HYA-02,Hyaluronic Acid Serum 2%,210,32,190,599,21
RET-03,Retinol Night Cream 0.3%,160,24,260,799,28
SAL-02,Salicylic Acid Face Wash,340,55,110,349,14
CER-01,Ceramide Moisturizer 50g,190,28,175,549,21
KOJ-02,Kojic Acid Soap (pack of 2),280,40,60,199,14
GRN-01,Green Tea Face Wash,260,38,95,299,14
UBT-01,Ubtan Face Pack,220,26,90,299,14
ONX-01,Onion Hair Oil 200ml,300,42,85,349,14
SHM-01,Anti-Dandruff Shampoo 250ml,270,36,120,399,18
BOD-01,Shea Body Lotion 400ml,230,30,130,449,21
SCR-01,Coffee Body Scrub 100g,240,34,75,249,14
TON-02,Rice Water Toner,180,22,105,349,21
MSK-05,Multani Clay Mask 100g,200,21,80,279,14
SUN-30,SPF 30 Body Lotion,210,26,145,449,18
ALV-90,Aloe Vera Gel 300ml,900,25,70,249,10
RSW-01,Rose Water Mist,620,18,55,199,10
CHR-01,Charcoal Peel-Off Mask,420,0,95,299,30
GLD-24,24K Gold Sheet Mask (pack of 4),380,0.2,180,599,45
BRD-77,Beard Growth Oil,240,0,120,399,21
CUC-30,Cucumber Eye Pads (30s),310,0.4,88,249,30
LIP-09,Lip Plumping Gloss,150,0.1,105,349,25`;
var isSample = () => $("csv").value.trim() === SAMPLE_CSV.trim();
function splitCsvLine(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}
var num = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};
function parseCsv(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const norm = (h) => h.toLowerCase().replace(/[^a-z]/g, "");
  const first = splitCsvLine(lines[0]).map(norm);
  const looksHeader = first.some((h) => h.includes("sku") || h.includes("onhand") || h.includes("product"));
  const idx = { sku: 0, product: 1, onHand: 2, weekly: 3, cost: 4, price: 5, lead: 6 };
  if (looksHeader) {
    first.forEach((h, i) => {
      if (h.includes("sku")) idx.sku = i;
      else if (h.includes("product") || h.includes("name") || h.includes("title")) idx.product = i;
      else if (h.includes("onhand") || h.includes("stock") || h.includes("qty") || h.includes("units")) idx.onHand = i;
      else if (h.includes("weekly") || h.includes("sales") || h.includes("velocity")) idx.weekly = i;
      else if (h.includes("cost")) idx.cost = i;
      else if (h.includes("price") || h.includes("mrp")) idx.price = i;
      else if (h.includes("lead")) idx.lead = i;
    });
  }
  const body = looksHeader ? lines.slice(1) : lines;
  const out = [];
  for (const line of body) {
    const c = splitCsvLine(line);
    const r = {
      sku: c[idx.sku] || "",
      product: c[idx.product] || "",
      onHand: num(c[idx.onHand]),
      weekly: num(c[idx.weekly]),
      cost: num(c[idx.cost]),
      price: num(c[idx.price]),
      lead: num(c[idx.lead])
    };
    if (!r.sku || !Number.isFinite(r.onHand)) continue;
    if (!Number.isFinite(r.weekly)) r.weekly = 0;
    if (!Number.isFinite(r.cost)) r.cost = 0;
    if (!Number.isFinite(r.price)) r.price = 0;
    if (!Number.isFinite(r.lead)) r.lead = 14;
    out.push(r);
  }
  return out;
}
var isDead = (r) => r.weekly < 0.5 && r.onHand > 0;
var isRisk = (r) => r.weekly >= 0.5 && r.onHand / r.weekly < r.lead / 7;
var fmtNum = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
var fmtINR = (n) => "\u20B9" + fmtNum(n);
function computeStats(rs) {
  return {
    units: rs.reduce((a, r) => a + r.onHand, 0),
    value: rs.reduce((a, r) => a + r.onHand * r.cost, 0),
    risk: rs.filter(isRisk),
    dead: rs.filter(isDead),
    deadValue: rs.filter(isDead).reduce((a, r) => a + r.onHand * r.cost, 0)
  };
}
function renderStats() {
  const msg = $("parse-msg");
  if (!rows.length) {
    ["s-units", "s-value", "s-risk", "s-dead"].forEach((id) => {
      $(id).textContent = "\u2014";
    });
    const has = $("csv").value.trim().length > 0;
    msg.className = "parse-msg" + (has ? " bad" : "");
    msg.textContent = has ? "couldn't read that \u2014 need columns like SKU, Product, On hand, Avg weekly sales, Unit cost, Price, Lead time" : relay ? "paste " + (brand ? brand.name + "'s" : "your") + " sheet \u2014 the count is instant" : "paste a sheet or load the sample \u2014 the count is instant";
    return;
  }
  const s = computeStats(rows);
  $("s-units").textContent = fmtNum(s.units);
  $("s-value").textContent = fmtINR(s.value);
  $("s-risk").textContent = String(s.risk.length);
  $("s-dead").textContent = String(s.dead.length);
  if (isSample()) {
    msg.className = "parse-msg smp";
    msg.textContent = "sample sheet \u2014 DTC skincare, " + rows.length + " SKUs \xB7 paste yours to replace it";
  } else {
    msg.className = "parse-msg ok";
    msg.textContent = "\u2713 " + rows.length + " SKUs read";
  }
}
function reparse(persist = true) {
  rows = parseCsv($("csv").value);
  if (persist) {
    try {
      localStorage.setItem(K_CSV, $("csv").value);
    } catch {
    }
  }
  renderStats();
  reflect();
}
var debounceT = null;
$("csv").addEventListener("input", () => {
  clearTimeout(debounceT);
  debounceT = setTimeout(() => reparse(), 250);
});
$("load-sample").addEventListener("click", () => {
  $("csv").value = SAMPLE_CSV;
  reparse();
});
$("clear-csv").addEventListener("click", () => {
  $("csv").value = "";
  reparse();
});
function normalizeBrand(ctx) {
  const d = ctx && ctx.data || {};
  const arrs = (v) => Array.isArray(v) ? v.filter(Boolean).map(String) : [];
  const products = arrs(d.products).length ? arrs(d.products) : arrs(d.range);
  return {
    name: String(ctx.name || d.name || "Brand"),
    voice: String(d.voice || d.vibe || "").trim(),
    positioning: String(d.positioning || "").trim(),
    audience: String(d.audience || "").trim(),
    palette: arrs(d.palette),
    // FLAT color strings per the contract
    products
  };
}
async function loadBrand() {
  if (!relay || !relay.context || typeof relay.context.active !== "function") {
    brand = null;
    afterBrandChange();
    return;
  }
  try {
    const ctx = await relay.context.active();
    brand = ctx ? normalizeBrand(ctx) : null;
  } catch {
    brand = null;
  }
  afterBrandChange();
}
async function pickBrand() {
  if (!relay || !relay.context || typeof relay.context.pick !== "function") return;
  try {
    const ctx = await relay.context.pick();
    if (ctx) {
      brand = normalizeBrand(ctx);
      afterBrandChange();
    }
  } catch {
  }
}
$("brand-load").addEventListener("click", pickBrand);
$("brand-switch").addEventListener("click", pickBrand);
function afterBrandChange() {
  updateCtxbar();
  renderSteerChips();
  renderStats();
  reflect();
}
function updateCtxbar() {
  const bar = $("ctxbar");
  if (!relay) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  const chip = $("bchip");
  if (brand) {
    chip.hidden = false;
    chip.textContent = "";
    chip.append(el("span", "dot"), el("span", null, brand.name));
    for (const c of brand.palette.slice(0, 4)) {
      const sw = el("span", "sw");
      sw.style.background = c;
      chip.append(sw);
    }
    $("ctx-line").textContent = "triaging " + brand.name + "'s shelf \u2014 heroes and positioning shape the calls";
    $("brand-switch").hidden = false;
    $("brand-load").hidden = true;
  } else {
    chip.hidden = true;
    $("ctx-line").textContent = "no brand lent \u2014 the foreman triages blind";
    $("brand-switch").hidden = true;
    $("brand-load").hidden = false;
  }
}
var DEFAULT_STEERS = [
  { label: "Plan for a festive sale spike", steer: "Plan for a festive sale spike \u2014 Diwali is 6 weeks out." },
  { label: "I have \u20B92,00,000 \u2014 what do I reorder?", steer: "I have \u20B92,00,000 to spend \u2014 what do I reorder first?" },
  { label: "What do I discount to free up cash?", steer: "What do I discount to free up cash the fastest?" }
];
function steerChoices() {
  if (!brand) return DEFAULT_STEERS;
  const out = [];
  const hero = brand.products[0];
  if (hero) out.push({ label: "Never let " + hero + " stock out", steer: "Protect " + brand.name + "'s heroes \u2014 never let " + hero + " stock out; size the reorders to guarantee it.", brandy: true });
  if (brand.positioning) out.push({ label: "What clashes with our positioning?", steer: brand.name + ' positions as "' + brand.positioning + '" \u2014 which SKUs no longer fit, and should the dead ones be cut or folded into hero bundles?', brandy: true });
  for (const d of DEFAULT_STEERS) {
    if (out.length >= 4) break;
    out.push(d);
  }
  return out.slice(0, 4);
}
function renderSteerChips() {
  const mount = $("schips");
  mount.textContent = "";
  for (const c of steerChoices()) {
    const b = el("button", "schip" + (c.brandy ? " brandy" : ""), c.label);
    b.addEventListener("click", () => {
      $("steer").value = c.steer;
      try {
        localStorage.setItem(K_STEER, c.steer);
      } catch {
      }
    });
    mount.append(b);
  }
}
$("steer").addEventListener("input", () => {
  try {
    localStorage.setItem(K_STEER, $("steer").value);
  } catch {
  }
});
$("steer").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !$("go").disabled) runTriage();
});
function onRelay(r) {
  relay = r;
  $("load-sample").hidden = true;
  if (isSample()) {
    $("csv").value = "";
    reparse();
  }
  loadBrand();
  reflect();
}
function offRelay() {
  relay = null;
  brand = null;
  $("load-sample").hidden = false;
  afterBrandChange();
}
mountConnect($("chip-dock"), {
  scope: { models: ["sonnet"], reason: "triage your inventory" },
  installUrl: INSTALL_URL,
  onConnect: (r) => onRelay(r),
  onDisconnect: () => offRelay(),
  onProjectChange: () => loadBrand()
  // the chip's own "Switch ▸" must re-derive strap/chips/prompts too
});
(async () => {
  const r = await whenRelayReady(2e3, { installUrl: INSTALL_URL });
  if (r && "connect" in r) {
    installed = true;
    const grant = await r.permissions().catch(() => null);
    if (grant) {
      onRelay(r);
      return;
    }
  } else {
    installed = false;
  }
  reflect();
})();
function reflect() {
  $("go").disabled = !relay || running || !rows.length;
  $("b-regen").disabled = !relay || running;
  const hint = $("conn-hint");
  hint.textContent = "";
  if (running) {
    hint.append("the foreman is counting\u2026");
    return;
  }
  if (relay) {
    if (!rows.length) {
      hint.append("connected \u2014 paste " + (brand ? brand.name + "'s" : "a") + " sheet to triage");
      return;
    }
    const b = el("em", "you", "your own Claude");
    hint.append("runs on ", b, " \u2014 the sheet goes to your sidekick, nowhere else");
  } else if (installed) {
    hint.append("connect Switchboard (top right) to run the triage \u2014 the count above already works");
  } else {
    const a = el("a", null, "get Switchboard");
    a.href = INSTALL_URL;
    a.target = "_blank";
    a.rel = "noreferrer";
    hint.append("needs the Switchboard sidekick \u2014 ", a, " and come straight back");
  }
}
var csvField = (s) => /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
var sheetCsv = () => rows.map((r) => [r.sku, csvField(r.product), r.onHand, r.weekly, r.cost, r.price, r.lead].join(",")).join("\n");
function brandLines() {
  if (!brand) return "";
  return [
    "This is " + brand.name + "'s shelf.",
    brand.positioning ? "Positioning: " + brand.positioning + "." : "",
    brand.audience ? "Audience: " + brand.audience + "." : "",
    brand.products.length ? "Hero products: " + brand.products.join(", ") + " \u2014 protect their cover first, and make dead-stock actions lean on them (bundles, gift-with-purchase beside a hero)." : "",
    brand.voice ? "Write the summary/why/action lines in the brand's voice: " + brand.voice + "." : ""
  ].filter(Boolean).join(" ");
}
function buildPrompt() {
  const steer = $("steer").value.trim();
  return [
    "You are the sharpest inventory foreman a small e-commerce brand ever hired. Blunt, numerate, practical. Currency: INR.",
    brandLines(),
    "Stock + sales sheet (CSV columns: sku,product,on_hand,avg_weekly_sales,unit_cost_inr,price_inr,lead_time_days):",
    sheetCsv(),
    "",
    "Ground rules:",
    "- weeks_of_cover = on_hand / avg_weekly_sales. A SKU is a stockout risk when weeks_of_cover < lead_time_days / 7.",
    "- dead = avg_weekly_sales near zero with stock still on hand.",
    "- orderQty covers lead-time demand plus ~4 weeks of buffer, minus stock on hand, rounded to a sensible round number.",
    steer ? `Owner's steer: "` + steer + '" \u2014 let it shape the reorder calls, the discount calls, and the plans.' : "No steer given \u2014 optimize for the highest-value week this shelf can have.",
    "",
    "Respond with ONLY a JSON object \u2014 no prose, no markdown fences \u2014 exactly this shape:",
    '{"summary":"two plain-talk sentences on the shape of the situation","cashLockedInDead":0,"reorderNow":[{"sku":"","product":"","orderQty":0,"why":""}],"watch":[{"sku":"","product":"","why":""}],"deadWeight":[{"sku":"","product":"","action":"","recoverable":0}],"abc":{"a":["SKU"],"b":["SKU"],"c":["SKU"]},"plans":[{"title":"","angle":"","moves":[""],"recommended":false}]}',
    "- cashLockedInDead: number = sum of on_hand \xD7 unit_cost across the deadWeight SKUs.",
    '- deadWeight: action is one concrete move ("40% off, bundle with the Vitamin C hero", "liquidate to a reseller lot"); recoverable is the realistic INR you can pull back (number).',
    "- abc: classify EVERY sku by weekly revenue (price \xD7 avg_weekly_sales): a = the head that drives most revenue, b = middle, c = tail. Use only SKU codes from the sheet, each exactly once.",
    "- why/action lines: one specific sentence each, use the actual numbers (cover weeks, lead time, cash).",
    "- plans: exactly 3 genuinely DIFFERENT one-week playbooks for this sheet (e.g. cash-first vs growth-first vs balanced \u2014 pick the angles that fit THIS data). title \u2264 4 words; angle = one sentence on the tradeoff; moves = 2-3 concrete moves quoting real SKUs and numbers. EXACTLY ONE plan has recommended:true \u2014 the one you would run" + (steer ? " given the owner's steer." : ".")
  ].filter(Boolean).join("\n");
}
var PROG_LINES = [
  "Counting the shelves\u2026",
  "Checking lead times\u2026",
  "Weighing the dead stock\u2026",
  "Splitting A / B / C\u2026",
  "Drafting three plans\u2026"
];
var progTimer = null;
function setRunning(on) {
  running = on;
  $("progress").hidden = !on;
  if (on) {
    let i = 0;
    $("prog-line").textContent = PROG_LINES[0];
    $("prog-meta").textContent = "";
    progTimer = setInterval(() => {
      i = (i + 1) % PROG_LINES.length;
      $("prog-line").textContent = PROG_LINES[i];
    }, 2400);
  } else {
    clearInterval(progTimer);
  }
  reflect();
}
function showError(err) {
  const p = $("err-text");
  p.textContent = "";
  const b = el("b", null, "Triage failed. ");
  p.append(b, String(err?.message || err).slice(0, 240));
  $("errbox").hidden = false;
}
async function runTriage() {
  if (!relay || running || !rows.length) return;
  const myRun = ++triageSeq;
  $("errbox").hidden = true;
  setRunning(true);
  let acc = "";
  try {
    for await (const d of relay.stream({ prompt: buildPrompt() })) {
      if (myRun !== triageSeq) return;
      if (d.type === "text") {
        acc += d.text;
        $("prog-meta").textContent = (acc.length / 1024).toFixed(1) + " kb";
      } else if (d.type === "error") {
        throw new Error(d.error?.message || "stream error");
      }
    }
    if (myRun !== triageSeq) return;
    const raw = acc.match(/\{[\s\S]*\}/)?.[0];
    if (!raw) throw new Error("the model replied without a manifest \u2014 hit Re-run triage, it lands on the retry");
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("the manifest came back smudged (bad JSON) \u2014 hit Re-run triage");
    }
    const result = { data, steer: $("steer").value.trim(), at: Date.now(), skuCount: rows.length };
    try {
      localStorage.setItem(K_LAST, JSON.stringify(result));
    } catch {
    }
    renderBoard(result, { fresh: true });
    $("board").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    if (myRun === triageSeq) showError(err);
  } finally {
    if (myRun === triageSeq) setRunning(false);
  }
}
$("go").addEventListener("click", runTriage);
$("retry").addEventListener("click", runTriage);
$("b-regen").addEventListener("click", runTriage);
$("prog-cancel").addEventListener("click", () => {
  triageSeq++;
  setRunning(false);
});
var arr = (v) => Array.isArray(v) ? v : [];
var coerceNum = (v) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && String(v ?? "").trim() !== "" ? n : null;
};
function tagCard(kind, item) {
  const card = el("div", "tagcard " + kind);
  const row = el("div", "trow");
  row.append(el("span", "skutag", String(item.sku ?? "?")));
  if (kind === "reorder") {
    const q = coerceNum(item.orderQty);
    row.append(el("span", "tstamp", q != null ? "order " + fmtNum(q) : "order"));
  } else if (kind === "dead") {
    row.append(el("span", "tstamp", "dead"));
  }
  card.append(row, el("div", "tname", String(item.product ?? "")), el("div", "twhy", String(item.why ?? item.action ?? "")));
  if (kind === "dead") {
    const rn = coerceNum(item.recoverable);
    card.append(el("div", "trecover", "recover \u2248 " + (rn != null ? fmtINR(rn) : String(item.recoverable ?? "?"))));
  }
  return card;
}
function fillColumn(mountId, countId, kind, items) {
  const mount = $(mountId);
  mount.textContent = "";
  $(countId).textContent = items.length ? items.length + (items.length === 1 ? " SKU" : " SKUs") : "";
  if (!items.length) {
    mount.append(el("div", "col-empty", "\u2014 nothing on this hook"));
    return;
  }
  items.forEach((it) => mount.append(tagCard(kind, it)));
}
function fillAbc(mountId, skus) {
  const mount = $(mountId);
  mount.textContent = "";
  if (!skus.length) {
    mount.append(el("span", "abcchip", "\u2014"));
    return;
  }
  skus.forEach((s) => {
    mount.append(el("span", "abcchip", String(typeof s === "object" && s !== null ? s.sku ?? JSON.stringify(s) : s)));
  });
}
function normPlans(v) {
  const ps = arr(v).map((p) => ({
    title: String(p?.title ?? "").trim() || "Plan",
    angle: String(p?.angle ?? "").trim(),
    moves: arr(p?.moves).map((m) => String(m)).slice(0, 4),
    recommended: p?.recommended === true
  })).slice(0, 4);
  if (ps.length && !ps.some((p) => p.recommended)) ps[0].recommended = true;
  let seen = false;
  for (const p of ps) {
    if (p.recommended) {
      if (seen) p.recommended = false;
      else seen = true;
    }
  }
  return ps;
}
function renderPlans(ps, selectedTitle) {
  plans = ps;
  selectedPlan = null;
  const grid = $("plangrid");
  grid.textContent = "";
  $("plans-wrap").hidden = !ps.length;
  ps.forEach((p) => {
    const card = el("div", "plancard");
    const top = el("div", "ptop");
    top.append(el("div", "ptitle", p.title));
    if (p.recommended) top.append(el("span", "rec", "recommended"));
    card.append(top);
    if (p.angle) card.append(el("div", "pangle", p.angle));
    if (p.moves.length) {
      const ul = el("ul", "pmoves");
      p.moves.forEach((m) => ul.append(el("li", null, m)));
      card.append(ul);
    }
    const chosen = selectedTitle ? p.title === selectedTitle : p.recommended;
    if (chosen) card.classList.add("lit");
    if (selectedTitle && p.title === selectedTitle) selectedPlan = p;
    card.addEventListener("click", () => {
      grid.querySelectorAll(".plancard").forEach((c) => c.classList.remove("lit"));
      card.classList.add("lit");
      selectedPlan = p;
      runRefine();
    });
    grid.append(card);
  });
}
function buildRefinePrompt(plan) {
  const steer = $("steer").value.trim();
  return [
    "You are the sharpest inventory foreman a small e-commerce brand ever hired. Blunt, numerate, practical. Currency: INR.",
    brandLines(),
    "Stock + sales sheet (CSV columns: sku,product,on_hand,avg_weekly_sales,unit_cost_inr,price_inr,lead_time_days):",
    sheetCsv(),
    "",
    'The owner picked this one-week plan: "' + plan.title + '"' + (plan.angle ? " \u2014 " + plan.angle : ""),
    plan.moves.length ? "Planned moves: " + plan.moves.join(" \xB7 ") : "",
    steer ? `Owner's steer: "` + steer + '".' : "",
    "Turn the picked plan into a concrete week-one worksheet.",
    "",
    "Respond with ONLY a JSON object \u2014 no prose, no markdown fences \u2014 exactly this shape:",
    '{"title":"","steps":[{"move":"","detail":"","impact":""}],"outcome":""}',
    '- steps: 4-6, in the order to do them. move = an imperative of \u2264 8 words; detail = one sentence naming the actual SKUs and numbers; impact = the INR or cover-weeks effect, short (e.g. "+\u20B928,400 back", "6 wks cover").',
    "- outcome: one sentence on where the shelf stands at the end of the week."
  ].filter(Boolean).join("\n");
}
async function runRefine() {
  if (!selectedPlan) return;
  if (!relay || !rows.length) {
    $("playwrap").hidden = false;
    $("play-err").hidden = false;
    $("play-err-text").textContent = !relay ? "connect Switchboard (top right) to detail a plan" : "the sheet is empty \u2014 paste it back, then pick again";
    return;
  }
  const myRun = ++refineSeq;
  $("play-err").hidden = true;
  $("playwrap").hidden = false;
  $("play-prog").hidden = false;
  let acc = "";
  try {
    for await (const d of relay.stream({ prompt: buildRefinePrompt(selectedPlan) })) {
      if (myRun !== refineSeq) return;
      if (d.type === "text") acc += d.text;
      else if (d.type === "error") throw new Error(d.error?.message || "stream error");
    }
    if (myRun !== refineSeq) return;
    const raw = acc.match(/\{[\s\S]*\}/)?.[0];
    if (!raw) throw new Error("no worksheet came back \u2014 retry lands it");
    let pb;
    try {
      pb = JSON.parse(raw);
    } catch {
      throw new Error("the worksheet came back smudged (bad JSON) \u2014 retry");
    }
    renderPlaybook(pb);
    try {
      localStorage.setItem(K_PLAY, JSON.stringify({ planTitle: selectedPlan.title, playbook: pb, at: Date.now() }));
    } catch {
    }
  } catch (err) {
    if (myRun === refineSeq) {
      $("play-err").hidden = false;
      $("play-err-text").textContent = "Worksheet failed. " + String(err?.message || err).slice(0, 200);
    }
  } finally {
    if (myRun === refineSeq) $("play-prog").hidden = true;
  }
}
function renderPlaybook(pb) {
  $("playwrap").hidden = false;
  const box = $("playbook");
  box.hidden = false;
  box.textContent = "";
  $("play-kicker").textContent = "week one \u2014 " + String(pb?.title || selectedPlan?.title || "the plan");
  const steps = arr(pb?.steps).slice(0, 8);
  steps.forEach((s, i) => {
    const row = el("div", "step");
    row.append(el("span", "sn", String(i + 1).padStart(2, "0")));
    const body = el("div", "sbody");
    body.append(el("div", "smv", String(s?.move ?? "")));
    const dt = String(s?.detail ?? "").trim();
    if (dt) body.append(el("div", "sdt", dt));
    row.append(body);
    const imp = String(s?.impact ?? "").trim();
    if (imp) row.append(el("span", "simp", imp));
    box.append(row);
  });
  if (!steps.length) box.append(el("div", "step", "\u2014 the worksheet came back empty; regenerate"));
  const out = String(pb?.outcome ?? "").trim();
  if (out) box.append(el("div", "outcome", "\u2192 " + out));
}
$("play-regen").addEventListener("click", runRefine);
$("play-retry").addEventListener("click", runRefine);
$("play-cancel").addEventListener("click", () => {
  refineSeq++;
  $("play-prog").hidden = true;
});
function renderBoard(result, opts = {}) {
  const d = result.data || {};
  $("board").hidden = false;
  const when = new Date(result.at || Date.now());
  $("b-meta").textContent = "triaged " + when.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " \xB7 " + (result.skuCount || arr(d.reorderNow).length + arr(d.watch).length + arr(d.deadWeight).length) + " SKUs" + (brand ? " \xB7 " + brand.name : "") + (result.steer ? " \xB7 steer: \u201C" + result.steer.slice(0, 48) + (result.steer.length > 48 ? "\u2026" : "") + "\u201D" : "");
  $("b-summary").textContent = String(d.summary ?? "");
  const cash = coerceNum(d.cashLockedInDead);
  $("b-cash").textContent = cash != null ? fmtINR(cash) : rows.length ? fmtINR(computeStats(rows).deadValue) : "\u2014";
  fillColumn("col-reorder", "n-reorder", "reorder", arr(d.reorderNow));
  fillColumn("col-watch", "n-watch", "watch", arr(d.watch));
  fillColumn("col-dead", "n-dead", "dead", arr(d.deadWeight));
  const abc = d.abc || {};
  fillAbc("abc-a", arr(abc.a));
  fillAbc("abc-b", arr(abc.b));
  fillAbc("abc-c", arr(abc.c));
  renderPlans(normPlans(d.plans), opts.selectedTitle || null);
  if (opts.fresh) {
    refineSeq++;
    $("playwrap").hidden = true;
    $("playbook").hidden = true;
    $("play-prog").hidden = true;
    try {
      localStorage.removeItem(K_PLAY);
    } catch {
    }
  }
}
(function boot() {
  let savedCsv = null, savedSteer = "", savedLast = null, savedPlay = null;
  try {
    savedCsv = localStorage.getItem(K_CSV);
    savedSteer = localStorage.getItem(K_STEER) || "";
    savedLast = JSON.parse(localStorage.getItem(K_LAST) || "null");
    savedPlay = JSON.parse(localStorage.getItem(K_PLAY) || "null");
  } catch {
  }
  $("csv").value = savedCsv != null && savedCsv.trim() ? savedCsv : SAMPLE_CSV;
  $("steer").value = savedSteer;
  renderSteerChips();
  reparse(false);
  if (savedLast && savedLast.data) {
    renderBoard(savedLast, { selectedTitle: savedPlay?.planTitle || null });
    if (savedPlay?.playbook && selectedPlan && selectedPlan.title === savedPlay.planTitle) renderPlaybook(savedPlay.playbook);
  }
})();
//# sourceMappingURL=shelf.js.map
