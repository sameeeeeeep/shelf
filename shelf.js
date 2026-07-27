// ../../../../../packages/protocol/dist/version.js
var PROVIDER_GLOBAL = "claude";

// ../../../../../packages/protocol/dist/storage.js
var STORAGE_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
function isValidStorageKey(key) {
  return typeof key === "string" && STORAGE_KEY_RE.test(key);
}

// ../../../../../packages/protocol/dist/errors.js
var BYOPErrorCode = {
  /** User rejected the connect/consent request. (≈ 4001) */
  USER_REJECTED: 4001,
  /** Origin is not connected / has no grant for this method. (≈ 4100) */
  UNAUTHORIZED: 4100,
  /** Method exists but the origin's scope doesn't cover it (model/tool not granted). */
  SCOPE_EXCEEDED: 4110,
  /** A per-action write consent was denied by the user. */
  CONSENT_DENIED: 4120,
  /** Budget or rate limit hit (tokens/day or calls/min). */
  BUDGET_EXCEEDED: 4290,
  /** Unknown method. (≈ 4200) */
  UNSUPPORTED_METHOD: 4200,
  /** Bad params. (≈ -32602) */
  INVALID_PARAMS: -32602,
  /** The sidekick daemon is not installed / not reachable. The SDK maps this to its
   *  "install the sidekick" fallback. */
  PROVIDER_UNAVAILABLE: 4900,
  /** Backend error (model/tool failed for a non-policy reason). */
  BACKEND_ERROR: 4500
};

// ../../../../../packages/sdk/dist/connect-chip.js
function rungFromError(e) {
  if (e?.code !== BYOPErrorCode.PROVIDER_UNAVAILABLE)
    return null;
  return e?.data?.reason === "unpaired" ? { kind: "unpaired" } : { kind: "unreachable" };
}
var CHROME_STORE_URL = "https://chromewebstore.google.com/detail/injmjolmnekmahlnackakiamjepegagb";
var RELAY_DMG_URL = "https://github.com/sameeeeeeep/switchboard/releases/latest/download/Switchboard.dmg";
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
/* Setup-ladder pills (sidekick asleep / unpaired): quiet and informative, never red \u2014 nothing is
   broken. Amber only while the daemon is unreachable; the glyph stays muted until it's reachable. */
.dot { width: 7px; height: 7px; border-radius: 50%; background: #E8B84B; flex: none;
  box-shadow: 0 0 8px rgba(232,184,75,.45); }
.menu .body { padding: 8px 10px 2px; font-size: 12px; font-weight: 500; color: #B4BECE; line-height: 1.45; }
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
  let lastProjectKey;
  let sessionDisconnected = false;
  const onDocClick = (e) => {
    if (menuOpen && !host.contains(e.target)) {
      menuOpen = false;
      render();
    }
  };
  document.addEventListener("click", onDocClick);
  const initEvent = `${PROVIDER_GLOBAL}#initialized`;
  let lateWatching = false;
  const onLateInit = () => {
    lateWatching = false;
    window.removeEventListener(initEvent, onLateInit);
    if (!destroyed)
      void refresh();
  };
  function watchForLateProvider() {
    if (lateWatching || destroyed)
      return;
    lateWatching = true;
    window.addEventListener(initEvent, onLateInit);
  }
  function el3(tag, cls, text) {
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
      watchForLateProvider();
      state = { kind: "not-installed", installUrl };
      return render();
    }
    relay2 = r;
    subscribe(r);
    const h = await r.health();
    if (destroyed || my !== seq)
      return;
    if (h && !h.reachable) {
      state = { kind: "unreachable", appMissing: h.installedHere === false };
      emitTransition(false);
      return render();
    }
    if (h && !h.paired) {
      state = { kind: "unpaired" };
      emitTransition(false);
      return render();
    }
    let permErr = null;
    const grant = sessionDisconnected ? null : await r.permissions().catch((e) => {
      permErr = e;
      return null;
    });
    if (destroyed || my !== seq)
      return;
    if (!grant) {
      const rung = !h ? rungFromError(permErr) : null;
      if (rung) {
        state = rung;
        emitTransition(false);
        return render();
      }
      state = { kind: "disconnected", relay: r };
      emitTransition(false);
      return render();
    }
    const wantsContext = opts.context !== "none";
    const [user, project] = await Promise.all([
      r.identity(),
      wantsContext ? r.context.active().catch(() => null) : Promise.resolve(null)
    ]);
    if (destroyed || my !== seq)
      return;
    const wasAlreadyConnected = wasConnected;
    state = { kind: "connected", relay: r, user, project };
    emitTransition(true);
    const projKey = project ? project.id ?? project.name : null;
    if (wasAlreadyConnected && lastProjectKey !== void 0 && projKey !== lastProjectKey)
      opts.onProjectChange?.(project);
    lastProjectKey = projKey;
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
    r.on("health", () => {
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
    } catch (e) {
      const err = e;
      if (err?.code !== BYOPErrorCode.PROVIDER_UNAVAILABLE)
        return;
      await refresh();
      if (state.kind === "disconnected") {
        const rung = rungFromError(err);
        if (rung) {
          state = rung;
          emitTransition(false);
          render();
        }
      }
    }
  }
  async function doPick() {
    if (!relay2)
      return;
    menuOpen = false;
    render();
    await relay2.context.pick().catch(() => null);
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
      const url = state.installUrl;
      const wrap2 = el3("div", "wrap");
      const b = el3("button", "btn get");
      b.append(el3("span", "glyph"), el3("span", void 0, "Get Switchboard"), el3("span", "arr", "\u2197"));
      b.onclick = (e) => {
        e.stopPropagation();
        menuOpen = !menuOpen;
        render();
      };
      wrap2.append(b);
      if (menuOpen) {
        const menu = el3("div", "menu");
        menu.append(el3("div", "body", "Two parts: the Chrome extension, then Switchboard for Mac."));
        const store = el3("button", "item", "1 \xB7 Add to Chrome \u2197");
        store.onclick = () => {
          menuOpen = false;
          render();
          window.open(CHROME_STORE_URL, "_blank", "noopener");
        };
        const guide = el3("button", "item", "2 \xB7 Get Switchboard for Mac \u2197");
        guide.onclick = () => {
          menuOpen = false;
          render();
          window.open(url, "_blank", "noopener");
        };
        menu.append(store, guide);
        wrap2.append(menu);
      }
      mount.append(wrap2);
      return;
    }
    if (state.kind === "unreachable") {
      const appMissing = state.appMissing === true;
      const wrap2 = el3("div", "wrap");
      const b = el3("button", "btn get");
      b.append(el3("span", "glyph"), el3("span", void 0, appMissing ? "Get Switchboard for Mac" : "Your sidekick is asleep"), el3("span", appMissing ? "arr" : "dot", appMissing ? "\u2197" : void 0), ...appMissing ? [] : [el3("span", "caret", "\u25BE")]);
      b.onclick = (e) => {
        e.stopPropagation();
        menuOpen = !menuOpen;
        render();
      };
      wrap2.append(b);
      if (menuOpen) {
        const menu = el3("div", "menu");
        if (appMissing) {
          menu.append(el3("div", "body", "Extension \u2713 \u2014 now the other half: Switchboard, the Mac app that holds your Claude."));
          const dl = el3("button", "item", "Download Switchboard.dmg \u2197");
          dl.onclick = () => {
            menuOpen = false;
            render();
            window.open(RELAY_DMG_URL, "_blank", "noopener");
          };
          menu.append(dl, el3("div", "sep"));
        } else {
          menu.append(el3("div", "body", "Open the Switchboard menubar app to wake it."));
          const retry = el3("button", "item", "Retry");
          retry.onclick = () => {
            menuOpen = false;
            render();
            void refresh();
          };
          menu.append(retry, el3("div", "sep"));
        }
        const setup = el3("button", "item", "New here? Full setup \u2197");
        setup.onclick = () => {
          menuOpen = false;
          render();
          window.open(installUrl, "_blank", "noopener");
        };
        menu.append(setup);
        wrap2.append(menu);
      }
      mount.append(wrap2);
      return;
    }
    if (state.kind === "unpaired") {
      const wrap2 = el3("div", "wrap");
      const b = el3("button", "btn connect");
      b.append(el3("span", "glyph"), el3("span", void 0, "Almost there \u2014 pair in the side panel"), el3("span", "caret", "\u25BE"));
      b.onclick = (e) => {
        e.stopPropagation();
        menuOpen = !menuOpen;
        render();
      };
      wrap2.append(b);
      if (menuOpen) {
        const menu = el3("div", "menu");
        menu.append(el3("div", "body", "Click the Switchboard icon in your Chrome toolbar and paste your pairing token."));
        const retry = el3("button", "item", "Retry");
        retry.onclick = () => {
          menuOpen = false;
          render();
          void refresh();
        };
        menu.append(retry);
        wrap2.append(menu);
      }
      mount.append(wrap2);
      return;
    }
    if (state.kind === "disconnected") {
      const b = el3("button", "btn connect");
      b.append(el3("span", "glyph"), el3("span", void 0, "Connect Switchboard"));
      b.onclick = doConnect;
      mount.append(b);
      return;
    }
    const { user, project } = state;
    const rawName = user?.name?.trim();
    const collides = !!rawName && !!project?.name && rawName.toLowerCase() === project.name.toLowerCase();
    const name = !rawName || collides ? "there" : rawName;
    const wrap = el3("div", "wrap");
    const chip = el3("button", "chip");
    const av = el3("div", "av");
    if (user?.avatar) {
      const img = el3("img");
      img.src = user.avatar;
      img.alt = name;
      av.append(img);
    } else
      av.textContent = name.charAt(0).toUpperCase();
    const wantsContext = opts.context !== "none";
    const who = el3("div", "who");
    who.append(el3("div", "hi", `Hi ${name}`));
    who.append(el3("div", "proj", wantsContext ? project ? project.name : "No context lent" : "Connected"));
    chip.append(av, who, el3("span", "caret", "\u25BE"));
    chip.onclick = (e) => {
      e.stopPropagation();
      menuOpen = !menuOpen;
      render();
    };
    wrap.append(chip);
    if (menuOpen) {
      const menu = el3("div", "menu");
      if (wantsContext) {
        menu.append(el3("div", "lbl", "Working on"));
        const row = el3("button", "proj-row");
        row.append(el3("span", void 0, project ? project.name : "Choose a context"));
        row.append(el3("span", "go", project ? "Switch \u25B8" : "Choose \u25B8"));
        row.onclick = doPick;
        menu.append(row, el3("div", "sep"));
      }
      const dc = el3("button", "item", "Disconnect this app");
      dc.onclick = doDisconnect;
      menu.append(dc);
      menu.append(el3("div", "foot", "Connectors, budgets & activity live in the Switchboard toolbar panel."));
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
      window.removeEventListener(initEvent, onLateInit);
      host.remove();
    }
  };
}

// ../../../../../packages/sdk/dist/index.js
var warnedStorageKeys = /* @__PURE__ */ new Set();
function warnBadStorageKey(key) {
  if (isValidStorageKey(key) || warnedStorageKeys.has(key))
    return;
  warnedStorageKeys.add(key);
  const suggestion = String(key).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[^A-Za-z0-9]+/, "") || "key";
  console.warn(`[relay.storage] invalid key ${JSON.stringify(key)} \u2014 this write/read WILL be rejected by the daemon and silently do nothing.
  Keys map 1:1 to files (<key>.json) in this origin's folder, so they must match ${STORAGE_KEY_RE}.
  ":" is not allowed (illegal on NTFS; "a:b" is Alternate Data Stream syntax on Windows). Try ${JSON.stringify(suggestion)}.`);
}
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
  /** The setup-ladder snapshot (reachable/paired/connected), answered by the EXTENSION from its
   *  own state — never the daemon — so it resolves fast (<1s) in every degraded state, including
   *  the ones where every other method would hang. Resolves null when the extension is too old to
   *  know `claude_health` (or its worker is unreachable): callers MUST treat null as "unknown"
   *  and fall back to probing permissions() exactly as before — that skew guard is load-bearing
   *  while store users run an older extension against newer app bundles. */
  health() {
    const answer = this.provider.request({ method: "claude_health" }).catch(() => null);
    const timer = new Promise((resolve) => setTimeout(() => resolve(null), 1500));
    return Promise.race([answer, timer]);
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
    const k = (key) => {
      warnBadStorageKey(key);
      return key;
    };
    return {
      get: (key) => req({ op: "get", key: k(key) }).then((r) => r.value ?? null),
      set: (key, value) => req({ op: "set", key: k(key), value }).then(() => void 0),
      delete: (key) => req({ op: "delete", key: k(key) }).then((r) => r.ok),
      list: () => req({ op: "list" }).then((r) => r.keys ?? []),
      info: () => req({ op: "info" }).then((r) => r.info),
      /** Point this app's store at a real folder (triggers a path-consent click). */
      bind: (path) => req({ op: "bind", path }).then((r) => r.info),
      /** Open a NATIVE folder chooser on the daemon's machine (macOS today). The user picking a
       *  folder in an OS dialog that names this origin IS the path consent, so a successful pick
       *  comes back already bound. Resolves undefined on cancel or when no native picker exists —
       *  keep a typed-path `bind` as the fallback UI. */
      pick: (reason) => req({ op: "pick", reason }).then((r) => r.info).catch(() => void 0)
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
      pick: () => req({ op: "pick" }).then((r) => r.context ?? null),
      /** Read ONE context listed via `list()` in full, and make it this app's selection. Needs the
       *  kind granted at connect (ScopeRequest.contextKinds) — powers in-app brand dropdowns. */
      use: (id) => req({ op: "use", id }).then((r) => r.context ?? null)
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

// src/kit/ui.js
var el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
var str = (s) => String(s ?? "").trim();
var STYLE_ID = "relay-kit-ui";
var ACCENT = "var(--accent, var(--lime, #C8F250))";
var ACCENT_SOFT = "var(--accent-soft, var(--lime-soft, #232B0D))";
var CSS = `
/* zero-specificity base: only applies where the shell styles nothing */
:where(.opts) { display: flex; flex-direction: column; gap: 8px; }
:where(.opt) { position: relative; border: 1px solid var(--edge, #262C38); background: var(--inset, #070809); border-radius: 14px; padding: 13px 14px; cursor: pointer; transition: border-color .15s, background .15s; }
:where(.opt:hover) { border-color: var(--edge-soft, #1C212B); }
:where(.opt.sel) { border-color: ${ACCENT}; background: color-mix(in srgb, ${ACCENT_SOFT} 55%, var(--inset, #070809)); }
:where(.opt .check) { position: absolute; right: 11px; top: 11px; width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--edge, #262C38); display: grid; place-items: center; color: transparent; font: 700 11px/1 var(--sans, sans-serif); }
:where(.opt.sel .check) { border-color: ${ACCENT}; background: ${ACCENT}; color: var(--page, #0A0C10); }
:where(.opt .rec) { display: inline-block; font: 500 9px/1 var(--mono, monospace); letter-spacing: .1em; text-transform: uppercase; border-radius: 999px; padding: 3px 7px; margin-bottom: 7px; }
:where(.opt .o-label) { font: 600 13.5px/1.3 var(--display, sans-serif); color: var(--ink, #E8EDF4); padding-right: 22px; }
:where(.opt .o-text) { font: 400 13px/1.5 var(--sans, sans-serif); color: var(--ink-sec, #B4BECE); margin-top: 5px; white-space: pre-wrap; word-break: break-word; }
:where(.opt .o-img) { width: 100%; border-radius: 8px; border: 1px solid var(--edge, #262C38); display: block; margin-top: 8px; }
:where(.steer) { margin-top: 16px; display: flex; flex-direction: column; gap: 7px; }
:where(.steer .chips) { display: flex; flex-wrap: wrap; gap: 6px; }
:where(.steer .chip) { font: 500 11px/1 var(--sans, sans-serif); border: 1px solid var(--edge, #262C38); background: var(--panel, #12151C); color: var(--ink-sec, #B4BECE); border-radius: 999px; padding: 6px 10px; cursor: pointer; }
:where(.steer .row) { display: flex; gap: 8px; align-items: center; }
:where(.steer .box) { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; border: 1px solid var(--edge, #262C38); background: var(--panel, #12151C); border-radius: 10px; padding: 8px 11px; }
:where(.steer input) { flex: 1; min-width: 0; background: none; border: 0; outline: none; color: var(--ink, #E8EDF4); font: 400 12.5px/1.4 var(--sans, sans-serif); }
:where(.steer .send) { flex: none; font: 600 12px/1 var(--sans, sans-serif); background: ${ACCENT}; color: var(--page, #0A0C10); border: 0; border-radius: 9px; padding: 9px 12px; cursor: pointer; }

/* ---- kit modifiers: normal specificity, these MUST beat the shell ---- */
/* DRAFTED \u2014 a machine suggestion. Neutral ink on a hairline, never the brand accent (rule 5). */
.opt .rec.k-draft { color: var(--ink-dim, #99A3B7); background: transparent; border: 1px dashed var(--edge, #262C38); }
.opt.k-drafted { border-style: dashed; }
.opt.k-drafted:not(.sel) { background: var(--inset, #070809); }
/* CHOSEN \u2014 a human clicked. The shell's own .opt.sel accent rules do the painting; this only adds
   the receipt line, so "who decided this" is never a guess (rule 6). */
.opt .k-by { display: block; font: 500 9px/1 var(--mono, monospace); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-faint, #6E7C90); margin-top: 8px; }
.opt.sel .k-by { color: ${ACCENT}; }
/* ESCAPE HATCH \u2014 the human's own answer. Reads as an option, never as one of the generated ones. */
.opt.k-esc { border-style: dashed; cursor: pointer; }
.opt.k-esc .o-label { color: var(--ink-sec, #B4BECE); }
.opt.k-esc .k-escrow { display: flex; gap: 8px; align-items: center; margin-top: 9px; }
.opt.k-esc .k-escrow input { flex: 1; min-width: 0; background: var(--inset, #070809); border: 1px solid var(--edge, #262C38); border-radius: 9px; color: var(--ink, #E8EDF4); font: 400 12.5px/1.4 var(--sans, sans-serif); padding: 9px 11px; outline: none; }
.opt.k-esc .k-escrow input:focus { border-color: color-mix(in srgb, ${ACCENT} 55%, var(--edge, #262C38)); }
.opt.k-esc .k-escrow .send { flex: none; font: 600 12px/1 var(--sans, sans-serif); background: ${ACCENT}; color: var(--page, #0A0C10); border: 0; border-radius: 9px; padding: 9px 12px; cursor: pointer; }
.opt.k-esc .k-escrow .send:disabled { opacity: .5; cursor: default; }
.opt.k-esc .k-escrow .ghost { flex: none; font: 500 12px/1 var(--sans, sans-serif); background: none; border: 1px solid var(--edge, #262C38); color: var(--ink-dim, #99A3B7); border-radius: 9px; padding: 9px 12px; cursor: pointer; }
`;
function ensureStyle() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = CSS;
  (document.head || document.documentElement).append(s);
}
function escapeHatch(opts) {
  ensureStyle();
  const o = opts || {};
  const label = o.label || "none of these \u2014 say what you'd do instead";
  const card = el("div", "opt k-esc");
  card.append(el("div", "o-label", label));
  if (o.hint) card.append(el("div", "o-text", o.hint));
  const row = el("div", "k-escrow");
  row.hidden = true;
  const input = el("input");
  input.type = "text";
  input.placeholder = o.placeholder || "describe what you'd do instead\u2026";
  if (o.prefill) input.value = o.prefill;
  const send = el("button", "send", o.sendLabel || "use this");
  send.type = "button";
  const cancel = el("button", "ghost", "cancel");
  cancel.type = "button";
  row.append(input, send, cancel);
  card.append(row);
  const open = () => {
    if (!row.hidden) return;
    row.hidden = false;
    input.focus();
    input.select();
  };
  const close = () => {
    row.hidden = true;
  };
  card.onclick = (e) => {
    if (e.target.closest(".k-escrow")) return;
    open();
  };
  card.onkeydown = (e) => {
    if (e.target === card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      open();
    }
  };
  card.tabIndex = 0;
  let busy = false;
  const submit = () => {
    const text = str(input.value);
    if (!text || busy) return;
    const option = { id: "custom", label: text, text: "", custom: true };
    const out = typeof o.onSubmit === "function" ? o.onSubmit(text, option) : null;
    if (out && typeof out.then === "function") {
      busy = true;
      const was = send.textContent;
      send.disabled = true;
      send.textContent = "\u2026";
      out.finally(() => {
        busy = false;
        send.disabled = false;
        send.textContent = was;
        close();
      });
    } else {
      close();
    }
  };
  send.onclick = submit;
  cancel.onclick = close;
  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };
  card.open = open;
  card.close = close;
  card.value = () => str(input.value);
  return card;
}

// src/kit/storekey.js
function migrateLocalKey(oldKey, newKey) {
  if (oldKey === newKey) return;
  try {
    if (localStorage.getItem(newKey) !== null) {
      localStorage.removeItem(oldKey);
      return;
    }
    const old = localStorage.getItem(oldKey);
    if (old === null) return;
    localStorage.setItem(newKey, old);
    localStorage.removeItem(oldKey);
  } catch {
  }
}

// src/shelf.js
var $ = (id) => document.getElementById(id);
var el2 = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
var INSTALL_URL = "https://thelastprompt.ai/switchboard/";
var K_CSV = "shelf-csv";
var K_STEER = "shelf-steer";
var K_LAST = "shelf-last";
var K_PLAY = "shelf-playbook";
migrateLocalKey("shelf:csv", K_CSV);
migrateLocalKey("shelf:steer", K_STEER);
migrateLocalKey("shelf:last", K_LAST);
migrateLocalKey("shelf:playbook", K_PLAY);
var relay = null;
var installed = true;
var running = false;
var triageSeq = 0;
var refineSeq = 0;
var rows = [];
var brand = null;
var plans = [];
var selectedPlan = null;
var pickedByHuman = false;
var autoTriaged = false;
var lastRendered = null;
var sheetSource = "sample";
var autoCsv = null;
function persist(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {
  }
  if (relay && relay.storage && typeof relay.storage.set === "function") {
    try {
      void relay.storage.set(key, val).catch(() => {
      });
    } catch {
    }
  }
}
function unpersist(key) {
  try {
    localStorage.removeItem(key);
  } catch {
  }
  if (relay && relay.storage && typeof relay.storage.delete === "function") {
    try {
      void relay.storage.delete(key).catch(() => {
      });
    } catch {
    }
  }
}
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
  const n = rows.length;
  const s = computeStats(rows);
  $("s-units").textContent = fmtNum(s.units);
  $("s-value").textContent = fmtINR(s.value);
  $("s-risk").textContent = String(s.risk.length);
  $("s-dead").textContent = String(s.dead.length);
  if (sheetSource === "context") {
    msg.className = "parse-msg ok";
    msg.textContent = "\u2713 " + n + " SKUs loaded from " + (brand ? brand.name + "'s" : "your") + " inventory" + (inventoryEstimated ? " \xB7 weekly sales estimated from reorder points \u2014 paste real sales to sharpen it" : "");
  } else if (sheetSource === "derived") {
    msg.className = "parse-msg smp";
    msg.textContent = "representative sheet \u2014 " + n + " SKUs off " + (brand ? brand.name + "'s" : "the") + " catalogue; the products are real, the stock and sales are stand-ins \xB7 paste the real sheet to replace it";
  } else if (isSample()) {
    msg.className = "parse-msg smp";
    msg.textContent = relay ? "sample sheet \u2014 DTC skincare, " + n + " SKUs \xB7 paste " + (brand ? brand.name + "'s" : "your") + " real sheet to replace it" : "sample sheet \u2014 DTC skincare, " + n + " SKUs \xB7 paste yours to replace it";
  } else {
    msg.className = "parse-msg ok";
    msg.textContent = "\u2713 " + n + " SKUs read";
  }
}
function reparse(save = true) {
  rows = parseCsv($("csv").value);
  if (save) persist(K_CSV, $("csv").value);
  renderStats();
  reflect();
}
var debounceT = null;
$("csv").addEventListener("input", () => {
  if ($("csv").value !== autoCsv) {
    sheetSource = "user";
    autoCsv = null;
  }
  clearTimeout(debounceT);
  debounceT = setTimeout(() => reparse(), 250);
});
$("load-sample").addEventListener("click", () => {
  $("csv").value = SAMPLE_CSV;
  autoCsv = SAMPLE_CSV;
  sheetSource = "sample";
  reparse();
});
$("clear-csv").addEventListener("click", () => {
  $("csv").value = "";
  autoCsv = null;
  sheetSource = "user";
  reparse();
});
function normalizeBrand(ctx) {
  const d = ctx && ctx.data || {};
  const arrs = (v) => Array.isArray(v) ? v.filter(Boolean).map(String) : [];
  const products = arrs(d.products).length ? arrs(d.products) : arrs(d.range);
  const inv = Array.isArray(d.inventory) ? d.inventory : Array.isArray(d.stock) ? d.stock : Array.isArray(d.skus) ? d.skus : [];
  return {
    name: String(ctx.name || d.name || "Brand"),
    voice: String(d.voice || d.vibe || "").trim(),
    positioning: String(d.positioning || "").trim(),
    audience: String(d.audience || "").trim(),
    palette: arrs(d.palette),
    // FLAT color strings per the contract
    products,
    inventory: inv.filter((x) => x && typeof x === "object")
  };
}
var CSV_HEAD = "SKU,Product,On hand,Avg weekly sales,Unit cost (INR),Price (INR),Lead time (days)";
function skuFor(name, i) {
  const w = String(name).toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().split(" ").filter(Boolean);
  const stem = (w[0] || "SKU").slice(0, 4) + (w[1] ? "-" + w[1].slice(0, 3) : "");
  return stem + "-" + String(i + 1).padStart(2, "0");
}
var cnum = (v, fb) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};
var inventoryEstimated = false;
function csvFromInventory(inv) {
  inventoryEstimated = false;
  const rows2 = inv.slice(0, 60).map((it, i) => {
    const lead = Math.max(1, cnum(it.leadDays ?? it.lead ?? it.leadTime, 21));
    const stock = Math.max(0, cnum(it.stock ?? it.onHand ?? it.qty, 0));
    let weekly = cnum(it.weekly ?? it.avgWeeklySales ?? it.sales, NaN);
    if (!Number.isFinite(weekly) || weekly < 0) {
      const reorderAt = cnum(it.reorderAt ?? it.reorderPoint, Math.max(2, Math.round(stock / 4)));
      weekly = Math.round(reorderAt / Math.max(1, lead / 7) * 10) / 10;
      inventoryEstimated = true;
    }
    return [
      String(it.sku || skuFor(it.name || it.product || "SKU", i)),
      csvField(String(it.name || it.product || "Item " + (i + 1))),
      stock,
      weekly,
      cnum(it.cost ?? it.unitCost, 0),
      cnum(it.price, 0),
      lead
    ].join(",");
  });
  return CSV_HEAD + "\n" + rows2.join("\n");
}
function csvFromProducts(products) {
  inventoryEstimated = false;
  const ON = [8, 140, 60, 15, 3, 220, 45, 90];
  const WK = [10, 34, 18, 6, 4, 0.2, 12, 26];
  const CO = [210, 165, 140, 340, 90, 120, 260, 75];
  const PR = [649, 499, 449, 1290, 300, 399, 799, 249];
  const LD = [21, 18, 14, 28, 26, 21, 30, 14];
  const rows2 = products.slice(0, 12).map((p, i) => [skuFor(p, i), csvField(String(p)), ON[i % ON.length], WK[i % WK.length], CO[i % CO.length], PR[i % PR.length], LD[i % LD.length]].join(","));
  return CSV_HEAD + "\n" + rows2.join("\n");
}
function contextSheet() {
  if (!brand) return null;
  if (brand.inventory.length) return { csv: csvFromInventory(brand.inventory), source: "context" };
  if (brand.products.length) return { csv: csvFromProducts(brand.products), source: "derived" };
  return null;
}
function applyContextSheet() {
  if (sheetSource === "user") return false;
  const s = contextSheet();
  if (!s) return false;
  const changed = $("csv").value.trim() !== s.csv.trim();
  sheetSource = s.source;
  autoCsv = s.csv;
  if (!changed) return false;
  $("csv").value = s.csv;
  reparse(false);
  return true;
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
  if (!brand && typeof relay.context.list === "function" && typeof relay.context.use === "function") {
    try {
      const metas = await relay.context.list();
      const m = (metas || []).find((x) => (x.kind || "").toLowerCase() === "brand");
      if (m) {
        const ctx = await relay.context.use(m.id);
        brand = ctx ? normalizeBrand(ctx) : null;
      }
    } catch {
    }
  }
  afterBrandChange();
}
async function pickBrand(btn) {
  if (!relay || !relay.context || typeof relay.context.pick !== "function") return;
  const was = btn.textContent;
  btn.textContent = "choosing in Switchboard\u2026";
  btn.disabled = true;
  const prev = brand ? brand.name : null;
  try {
    const ctx = await relay.context.pick();
    if (ctx) {
      brand = normalizeBrand(ctx);
      afterBrandChange();
      afterBrandSwitch(prev);
    }
  } catch {
  } finally {
    btn.textContent = was;
    btn.disabled = false;
  }
}
$("brand-load").addEventListener("click", () => pickBrand($("brand-load")));
$("brand-switch").addEventListener("click", () => pickBrand($("brand-switch")));
function afterBrandSwitch(prevName) {
  const nowName = brand ? brand.name : null;
  if ((prevName || null) === nowName) return;
  applyContextSheet();
  if (relay && rows.length && !running) {
    runTriage();
    return;
  }
  if ($("board").hidden) return;
  markBoardStale();
}
function markBoardStale() {
  const meta = $("b-meta");
  if (meta.textContent.includes(" \u2014 re-triage")) return;
  meta.textContent += " \xB7 triaged under " + (lastRendered && lastRendered.brandName ? lastRendered.brandName : "no brand") + " \u2014 re-triage";
}
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
    chip.append(el2("span", "dot"), el2("span", null, brand.name));
    for (const c of brand.palette.slice(0, 4)) {
      const sw = el2("span", "sw");
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
    const b = el2("button", "schip" + (c.brandy ? " brandy" : ""), c.label);
    b.addEventListener("click", () => {
      $("steer").value = c.steer;
      persist(K_STEER, c.steer);
    });
    mount.append(b);
  }
}
$("steer").addEventListener("input", () => {
  persist(K_STEER, $("steer").value);
});
$("steer").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !$("go").disabled) runTriage();
});
async function syncFromRelayStorage() {
  if (!relay || !relay.storage || typeof relay.storage.get !== "function") return;
  const pull = async (key) => {
    let local = null;
    try {
      local = localStorage.getItem(key);
    } catch {
    }
    if (local != null && local !== "") return null;
    let v = null;
    try {
      v = await relay.storage.get(key);
    } catch {
      return null;
    }
    if (typeof v !== "string" || !v) return null;
    try {
      localStorage.setItem(key, v);
    } catch {
    }
    return v;
  };
  const [csv, steer, last, play] = await Promise.all([pull(K_CSV), pull(K_STEER), pull(K_LAST), pull(K_PLAY)]);
  if (steer != null) $("steer").value = steer;
  if (csv != null && csv.trim()) {
    $("csv").value = csv;
    sheetSource = "user";
    autoCsv = null;
    reparse(false);
  }
  let lastObj = null, playObj = null;
  try {
    lastObj = JSON.parse(last || "null");
  } catch {
  }
  try {
    playObj = JSON.parse(play || "null");
  } catch {
  }
  if (lastObj && lastObj.data && $("board").hidden) {
    renderBoard(lastObj, { selectedTitle: playObj?.by === "human" && playObj.planTitle || null });
    if (playObj?.playbook && selectedPlan && selectedPlan.title === playObj.planTitle) renderPlaybook(playObj.playbook);
  }
}
function maybeAutoTriage() {
  if (!relay || !rows.length || running || autoTriaged) return;
  let savedLast = null;
  try {
    savedLast = JSON.parse(localStorage.getItem(K_LAST) || "null");
  } catch {
  }
  const sig = sheetCsv().length + ":" + rows.length;
  const fresh = !!(savedLast && savedLast.data && savedLast.csvSig === sig && Date.now() - (savedLast.at || 0) <= 24 * 3600 * 1e3);
  autoTriaged = true;
  if (!fresh) {
    runTriage();
    return;
  }
  let savedPlay = null;
  try {
    savedPlay = JSON.parse(localStorage.getItem(K_PLAY) || "null");
  } catch {
  }
  if (selectedPlan && !savedPlay?.playbook) runRefine();
}
async function onRelay(r) {
  relay = r;
  $("load-sample").hidden = true;
  await syncFromRelayStorage();
  await loadBrand();
  applyContextSheet();
  reflect();
  maybeAutoTriage();
}
function offRelay() {
  relay = null;
  brand = null;
  $("load-sample").hidden = false;
  afterBrandChange();
}
mountConnect($("chip-dock"), {
  scope: {
    models: ["sonnet"],
    reason: "triage your inventory",
    // Lets loadBrand auto-select a banked brand via list()+use() when nothing is lent. NOT relied
    // on for returning users: reused grants are exact-match and ignore newly requested kinds, so
    // every list()/use() caller tolerates an empty result or a throw.
    contextKinds: ["brand"]
  },
  installUrl: INSTALL_URL,
  onConnect: (r) => onRelay(r),
  onDisconnect: () => offRelay(),
  // The chip's own "Switch ▸" must re-derive strap/chips/prompts too — and a board triaged under
  // the old brand either re-triages (real sheet) or gets visibly marked stale.
  onProjectChange: async () => {
    const prev = brand ? brand.name : null;
    await loadBrand();
    afterBrandSwitch(prev);
  }
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
    if (sheetSource === "derived") {
      hint.append("board built on stand-in numbers off " + (brand ? brand.name + "'s" : "the") + " catalogue \u2014 paste the real sheet and it re-triages");
      return;
    }
    if (sheetSource === "sample") {
      hint.append("connected \u2014 the board below is the demo sheet; paste " + (brand ? brand.name + "'s" : "your") + " real sheet to replace it");
      return;
    }
    const b = el2("em", "you", "your own Claude");
    hint.append("runs on ", b, " \u2014 the sheet goes to your sidekick, nowhere else");
  } else if (installed) {
    hint.append("connect Switchboard (top right) to run the triage \u2014 the count above already works");
  } else {
    const a = el2("a", null, "get Switchboard");
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
  const b = el2("b", null, "Triage failed. ");
  p.append(b, String(err?.message || err).slice(0, 240));
  $("errbox").hidden = false;
}
async function runTriage() {
  if (!relay || running || !rows.length) return;
  const myRun = ++triageSeq;
  const ranSteer = $("steer").value.trim();
  const ranBrand = brand ? brand.name : null;
  const ranSource = sheetSource;
  const ranSample = sheetSource !== "user" && sheetSource !== "context";
  const ranSig = sheetCsv().length + ":" + rows.length;
  const ranCount = rows.length;
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
    const result = {
      data,
      steer: ranSteer,
      at: Date.now(),
      skuCount: ranCount,
      csvSig: ranSig,
      // maybeAutoTriage matches this against the live sheet
      brandName: ranBrand,
      // the board carries its own attribution — restores never lose it
      sample: ranSample,
      // a stand-in-numbers board is never mistaken for real inventory
      source: ranSource
    };
    persist(K_LAST, JSON.stringify(result));
    renderBoard(result, { fresh: true });
    if (selectedPlan) runRefine();
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
  const card = el2("div", "tagcard " + kind);
  const row = el2("div", "trow");
  row.append(el2("span", "skutag", String(item.sku ?? "?")));
  if (kind === "reorder") {
    const q = coerceNum(item.orderQty);
    row.append(el2("span", "tstamp", q != null ? "order " + fmtNum(q) : "order"));
  } else if (kind === "dead") {
    row.append(el2("span", "tstamp", "dead"));
  }
  card.append(row, el2("div", "tname", String(item.product ?? "")), el2("div", "twhy", String(item.why ?? item.action ?? "")));
  if (kind === "dead") {
    const rn = coerceNum(item.recoverable);
    card.append(el2("div", "trecover", "recover \u2248 " + (rn != null ? fmtINR(rn) : String(item.recoverable ?? "?"))));
  }
  return card;
}
function fillColumn(mountId, countId, kind, items) {
  const mount = $(mountId);
  mount.textContent = "";
  $(countId).textContent = items.length ? items.length + (items.length === 1 ? " SKU" : " SKUs") : "";
  if (!items.length) {
    mount.append(el2("div", "col-empty", "\u2014 nothing on this hook"));
    return;
  }
  items.forEach((it) => mount.append(tagCard(kind, it)));
}
function fillAbc(mountId, skus) {
  const mount = $(mountId);
  mount.textContent = "";
  if (!skus.length) {
    mount.append(el2("span", "abcchip", "\u2014"));
    return;
  }
  skus.forEach((s) => {
    mount.append(el2("span", "abcchip", String(typeof s === "object" && s !== null ? s.sku ?? JSON.stringify(s) : s)));
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
  pickedByHuman = false;
  const grid = $("plangrid");
  grid.textContent = "";
  $("plans-wrap").hidden = !ps.length;
  ps.forEach((p) => {
    const card = el2("div", "plancard");
    const top = el2("div", "ptop");
    top.append(el2("div", "ptitle", p.title));
    if (p.recommended) top.append(el2("span", "rec", "recommended"));
    card.append(top);
    if (p.angle) card.append(el2("div", "pangle", p.angle));
    if (p.moves.length) {
      const ul = el2("ul", "pmoves");
      p.moves.forEach((m) => ul.append(el2("li", null, m)));
      card.append(ul);
    }
    const chosen = !!selectedTitle && p.title === selectedTitle;
    const drafted = !selectedTitle && p.recommended;
    if (chosen) {
      card.classList.add("lit");
      card.append(el2("span", "pby", "chosen by you"));
      selectedPlan = p;
      pickedByHuman = true;
    } else if (drafted) {
      card.classList.add("drafted");
      card.append(el2("span", "pby", "drafted \u2014 click to choose"));
      selectedPlan = p;
    }
    card.addEventListener("click", () => {
      grid.querySelectorAll(".plancard").forEach((c) => {
        c.classList.remove("lit");
        c.classList.remove("drafted");
      });
      grid.querySelectorAll(".pby").forEach((n) => n.remove());
      card.classList.add("lit");
      card.append(el2("span", "pby", "chosen by you"));
      selectedPlan = p;
      pickedByHuman = true;
      runRefine();
    });
    grid.append(card);
  });
  if (ps.length) {
    grid.append(escapeHatch({
      label: "none of these \u2014 say what you'd run instead",
      placeholder: "e.g. clear the dead stock, hold all reorders until payday\u2026",
      hint: "your own one-week plan, detailed into the same worksheet",
      sendLabel: "detail this \u2192",
      onSubmit: (text) => {
        grid.querySelectorAll(".plancard").forEach((c) => {
          c.classList.remove("lit");
          c.classList.remove("drafted");
        });
        grid.querySelectorAll(".pby").forEach((n) => n.remove());
        selectedPlan = { title: text, angle: "the owner's own plan", moves: [] };
        pickedByHuman = true;
        runRefine();
      }
    }));
  }
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
    persist(K_PLAY, JSON.stringify({ planTitle: selectedPlan.title, by: pickedByHuman ? "human" : "draft", playbook: pb, at: Date.now() }));
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
    const row = el2("div", "step");
    row.append(el2("span", "sn", String(i + 1).padStart(2, "0")));
    const body = el2("div", "sbody");
    body.append(el2("div", "smv", String(s?.move ?? "")));
    const dt = String(s?.detail ?? "").trim();
    if (dt) body.append(el2("div", "sdt", dt));
    row.append(body);
    const imp = String(s?.impact ?? "").trim();
    if (imp) row.append(el2("span", "simp", imp));
    box.append(row);
  });
  if (!steps.length) box.append(el2("div", "step", "\u2014 the worksheet came back empty; regenerate"));
  const out = String(pb?.outcome ?? "").trim();
  if (out) box.append(el2("div", "outcome", "\u2192 " + out));
}
$("play-regen").addEventListener("click", runRefine);
$("play-retry").addEventListener("click", runRefine);
$("play-cancel").addEventListener("click", () => {
  refineSeq++;
  $("play-prog").hidden = true;
});
function renderBoard(result, opts = {}) {
  const d = result.data || {};
  lastRendered = result;
  $("board").hidden = false;
  const when = new Date(result.at || Date.now());
  const SRC_TAG = { context: "", derived: "representative sheet \xB7 ", sample: "sample sheet \xB7 ", user: "" };
  $("b-meta").textContent = (SRC_TAG[result.source] ?? (result.sample ? "sample \xB7 " : "")) + "triaged " + when.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " \xB7 " + (result.skuCount || arr(d.reorderNow).length + arr(d.watch).length + arr(d.deadWeight).length) + " SKUs" + (result.brandName ? " \xB7 " + result.brandName : "") + (result.steer ? " \xB7 steer: \u201C" + result.steer.slice(0, 48) + (result.steer.length > 48 ? "\u2026" : "") + "\u201D" : "");
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
    unpersist(K_PLAY);
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
  if (savedCsv != null && savedCsv.trim()) {
    $("csv").value = savedCsv;
    sheetSource = "user";
    autoCsv = null;
  } else {
    $("csv").value = SAMPLE_CSV;
    sheetSource = "sample";
    autoCsv = SAMPLE_CSV;
  }
  $("steer").value = savedSteer;
  renderSteerChips();
  reparse(false);
  if (savedLast && savedLast.data) {
    renderBoard(savedLast, { selectedTitle: savedPlay?.by === "human" && savedPlay.planTitle || null });
    if (savedPlay?.playbook && selectedPlan && selectedPlan.title === savedPlay.planTitle) renderPlaybook(savedPlay.playbook);
  }
})();
//# sourceMappingURL=shelf.js.map
