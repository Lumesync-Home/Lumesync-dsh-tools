/* lumesync-mobile — client half.
 *
 * Narrow-screen only (max-width: 1023px, matching the shell's own
 * SIDEBAR_AUTO_COLLAPSE breakpoint). Everything is scoped to
 * [data-lume-mobile="frame"], a marker this module puts on the AppFrame
 * element (the parent of [data-shell-overlay]); wide screens never see the
 * marker, so the desktop layout is untouched.
 *
 * What it re-establishes, independently of dsh-pocket:
 *   1. left drawer   — the sidebar column leaves the grid flow and becomes a
 *                      slide-in overlay drawer, opened via ctx.layout.
 *   2. zoom guard    — touch-action: manipulation + gesturestart suppression.
 *   3. viewport meta — width=device-width, initial-scale=1, viewport-fit=cover.
 *   4. safe area     — env(safe-area-inset-*) on the frame and the drawer.
 *   5. composer      — stays in normal flow, editable keeps >=16px so mobile
 *                      browsers do not focus-zoom the page.
 */
window.__ModuleLoader__.load({
	id: "lumesync-mobile",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");

		//#region constants
		const NARROW = "(max-width: 1023px)";
		const STYLE_ID = "lume-mobile-style";
		const MARK = "data-lume-mobile";
		const VIEWPORT = "width=device-width, initial-scale=1";
		//#endregion

		//#region stylesheet
		// Kept short on purpose: only the mechanisms the four acceptance points
		// need. Appearances (colours, shadows) lean on the host's own tokens.
		const CSS = [
			"/* lumesync-mobile — narrow-screen layout; wide screens never see the marker */",
			"[data-lume-mobile=\"toggle\"],",
			"[data-lume-mobile=\"fab\"] {",
			"  display: none;",
			"  align-items: center;",
			"  justify-content: center;",
			"  width: 30px;",
			"  height: 30px;",
			"  flex: none;",
			"  padding: 0;",
			"  border: none;",
			"  border-radius: 50%;",
			"  background: transparent;",
			"  color: var(--dsw-alias-label-secondary, inherit);",
			"  cursor: pointer;",
			"  -webkit-tap-highlight-color: transparent;",
			"}",
			"[data-lume-mobile=\"toggle\"]:hover,",
			"[data-lume-mobile=\"fab\"]:hover {",
			"  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06));",
			"}",
			"/* 5. Text auto-sizing guard. Deliberately OUTSIDE the narrow-screen media",
			"   query: an iOS standalone web app can paint its first frame at a wide",
			"   layout viewport (before our viewport meta / matchMedia settle), and",
			"   text-size-adjust must already be pinned by then or iOS autosizes it up. */",
			"html {",
			"  -webkit-text-size-adjust: 100% !important;",
			"  text-size-adjust: 100% !important;",
			"}",
			"@media (max-width: 1023px) {",
			"  /* 2. zoom guard: the ancestor touch-action intersects down to every",
			"     descendant, killing double-tap zoom while keeping pan + pinch. */",
			"  html, body {",
			"    touch-action: manipulation !important;",
			"    -webkit-text-size-adjust: 100% !important;",
			"  }",
			"  body { overscroll-behavior: none !important; }",
			"  /* 1/4. AppFrame: sidebar column leaves the grid; centre takes it all;",
			"     the top inset clears the status bar / notch for in-flow content. */",
			"  [data-lume-mobile=\"frame\"] {",
			"    position: relative !important;",
			"    grid-template-columns: minmax(0, 1fr) 0 0 !important;",
			"    padding-top: env(safe-area-inset-top, 0px) !important;",
			"  }",
			"  [data-lume-mobile=\"frame\"] > :nth-child(2) {",
			"    grid-column: 1 !important;",
			"    grid-row: 1 !important;",
			"    min-width: 0 !important;",
			"    min-height: 0 !important;",
			"  }",
			"  /* The drawer itself: the sidebar column, pinned left, hidden until the",
			"     frame leaves the collapsed state. -110% fully clears a shadow-less",
			"     box; the dimmed backdrop separates it from the content instead. */",
			"  [data-lume-mobile=\"frame\"] > :first-child {",
			"    position: absolute !important;",
			"    inset: 0 auto 0 0 !important;",
			"    width: max-content !important;",
			"    max-width: 92vw !important;",
			"    z-index: 1200 !important;",
			"    transform: translateX(-110%);",
			"    transition: transform .28s cubic-bezier(.16, 1, .3, 1);",
			"    background: var(--dsw-alias-bg-base, #ffffff);",
			"    padding-top: env(safe-area-inset-top, 0px) !important;",
			"    border-right: none !important;",
			"    overscroll-behavior: contain !important;",
			"  }",
			"  [data-lume-mobile=\"frame\"]:not([data-sidebar-collapsed]) > :first-child {",
			"    transform: none !important;",
			"  }",
			"  /* A portaled menu (e.g. the session list's \"视图选项\" panel) anchors to",
			"     a control inside the drawer, but its generic portal layer is z 1100",
			"     while the drawer sits at z 1200. The drawer's own session rows then",
			"     covered the panel and swallowed taps. Ride any body-level menu above",
			"     the mobile chrome. role=\"menu\" is the stable semantic anchor; the",
			"     hash class names are build-variant. */",
			"  body > [role=\"menu\"] {",
			"    z-index: 1300 !important;",
			"  }",
			"  /* Drag handles are useless on touch. */",
			"  [data-side=\"sidebar\"], [data-side=\"details\"] { display: none !important; }",
			"  /* Dimming layer, tap-to-close. Sits below the drawer (1200) so drawer",
			"     taps never reach it. */",
			"  [data-lume-mobile=\"backdrop\"] {",
			"    position: absolute;",
			"    inset: 0;",
			"    z-index: 30;",
			"    background: rgba(0, 0, 0, .45);",
			"    /* Pure dimming: the shell overlay layer is click-through, so the",
			"       backdrop never steals taps. Closing is handled in JS by an",
			"       outside-click listener (see the overlay component). */",
			"    pointer-events: none !important;",
			"    -webkit-tap-highlight-color: transparent;",
			"  }",
			"  /* Header drawer toggle (far left) and the hero-phase floating opener. */",
			"  [data-lume-mobile=\"toggle\"] {",
			"    display: inline-flex !important;",
			"    position: absolute !important;",
			"    left: 8px !important;",
			"    top: 12px !important;",
			"    z-index: 2 !important;",
			"    pointer-events: auto !important;",
			"  }",
			"  [data-lume-mobile=\"fab\"] {",
			"    display: inline-flex !important;",
			"    position: absolute !important;",
			"    top: calc(env(safe-area-inset-top, 0px) + 72px) !important;",
			"    left: 10px !important;",
			"    z-index: 21 !important;",
			"    width: 38px !important;",
			"    height: 38px !important;",
			"    border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12));",
			"    background: var(--dsw-alias-bg-layer-2, #ffffff);",
			"    box-shadow: 0 2px 12px rgba(0, 0, 0, .18);",
			"    pointer-events: auto !important;",
			"  }",
			"  /* 5. Composer: keep the card in flow and never below 16px editable text",
			"     (a sub-16px editable is what makes iOS focus-zoom and shove the bar). */",
			"  [data-phase] [data-composer-card=\"true\"] { position: relative !important; }",
			"  [data-phase] [data-composer-card=\"true\"] [contenteditable=\"true\"],",
			"  [data-phase] [data-composer-card=\"true\"] textarea {",
			"    font-size: 16px !important;",
			"  }",
			"  /* 5b. iOS focus-zoom guard, broad but scoped to the narrow frame: every",
			"     control (including the host settings fields) computes to >=16px, or",
			"     iOS Safari zooms the page when a sub-16px field gets focus. Kept to",
			"     one flat rule: font-size alone, no width/padding side effects. */",
			"  [data-lume-mobile=\"frame\"] input,",
			"  [data-lume-mobile=\"frame\"] textarea,",
			"  [data-lume-mobile=\"frame\"] select,",
			"  [data-lume-mobile=\"frame\"] [contenteditable=\"true\"] {",
			"    font-size: 16px !important;",
			"  }",
			"",
			"  /* 2. Session header. The drawer toggle is pinned at the header's",
			"     top-left corner; reserve a matching gutter on the session header so",
			"     the title / breadcrumb can never slide underneath it. Scoped with",
			"     :has() to the header that actually carries the session breadcrumb. */",
			"  [data-lume-mobile=\"frame\"] header:has([aria-label=\"会话层级\"]) {",
			"    padding-left: 46px !important;",
			"  }",
			"",
			"  /* 3. Settings dialog: a centred floating card (was full-bleed). The",
			"     host already renders the dialog as a flex child of a fixed, full-",
			"     viewport overlay that is centre/centre, so we let that centring stand",
			"     and only bound the card: max-width / max-height keep it off the",
			"     screen edges and clear of the status bar / home indicator, and the",
			"     safe-area insets are subtracted again so a notched device can never",
			"     let the card slide under the system chrome. Deliberately NOT touching",
			"     position/left/top/transform: the dialog lives inside the sidebar and",
			"     a fixed/transform override would anchor to the (transformed) drawer",
			"     instead of the viewport. The left nav is an icon-only strip so the",
			"     content column keeps its width. Anchored by semantics throughout:",
			"     [role=\"dialog\"]:has(> nav), its nav, its buttons (the word label is a",
			"     direct <span> child; the svg is a direct child too). */",
			"  [data-lume-mobile=\"frame\"] [role=\"dialog\"]:has(> nav) {",
			"    width: min(92vw, 560px) !important;",
			"    max-width: min(92vw, 560px) !important;",
			"    height: auto !important;",
			"    max-height: calc(85vh - env(safe-area-inset-top, 0px)",
			"      - env(safe-area-inset-bottom, 0px)) !important;",
			"    border-radius: 16px !important;",
			"    overflow: hidden !important;",
			"    box-shadow: 0 12px 40px rgba(0, 0, 0, .28) !important;",
			"  }",
			"  [data-lume-mobile=\"frame\"] [role=\"dialog\"]:has(> nav) > nav {",
			"    width: 58px !important;",
			"    min-width: 58px !important;",
			"    flex: 0 0 58px !important;",
			"    padding: 14px 7px 8px !important;",
			"    gap: 12px !important;",
			"  }",
			"  /* Drop the 'settings' heading; an icon strip speaks through its icons. */",
			"  [data-lume-mobile=\"frame\"] [role=\"dialog\"]:has(> nav) > nav > div:not(:has(button)) {",
			"    display: none !important;",
			"  }",
			"  [data-lume-mobile=\"frame\"] [role=\"dialog\"]:has(> nav) > nav > div:has(button) {",
			"    width: 100% !important;",
			"    max-width: 100% !important;",
			"  }",
			"  /* Each entry: a square icon button with its word label hidden. */",
			"  [data-lume-mobile=\"frame\"] [role=\"dialog\"]:has(> nav) > nav button {",
			"    box-sizing: border-box !important;",
			"    width: 44px !important;",
			"    min-width: 0 !important;",
			"    height: 40px !important;",
			"    padding: 0 !important;",
			"    gap: 0 !important;",
			"    justify-content: center !important;",
			"    align-items: center !important;",
			"  }",
			"  [data-lume-mobile=\"frame\"] [role=\"dialog\"]:has(> nav) > nav button > span {",
			"    display: none !important;",
			"  }",
			"  [data-lume-mobile=\"frame\"] [role=\"dialog\"]:has(> nav) > :not(nav) {",
			"    flex: 1 1 auto !important;",
			"    width: auto !important;",
			"    min-width: 0 !important;",
			"    min-height: 0 !important;",
			"    overflow-y: auto !important;",
			"  }",
			"",
			"  /* 4. Composer toolbar. The host row (attach + modes | model + send)",
			"     wraps by design once the card is tight, and its trailing group is",
			"     built to drop to a second line. Keep every control on ONE line and",
			"     stop the two groups shrinking into each other. Anchored on the",
			"     host's own data-composer-card attribute rather than the phase",
			"     wrapper, so it holds in every composer phase (hero / active /",
			"     settling) instead of only while [data-phase] is an ancestor. */",
			"  [data-composer-card=\"true\"] [class*=\"_row\"] {",
			"    flex-wrap: nowrap !important;",
			"    gap: 4px !important;",
			"    align-items: center !important;",
			"  }",
			"  [data-composer-card=\"true\"] [class*=\"_tools\"],",
			"  [data-composer-card=\"true\"] [class*=\"_modes\"],",
			"  [data-composer-card=\"true\"] [class*=\"_trailing\"] {",
			"    flex-wrap: nowrap !important;",
			"    flex-shrink: 0 !important;",
			"    gap: 4px !important;",
			"  }",
			"  /* The send circle rides the host's -2px nudge and is 34px beside 28px",
			"     chips, so it reads a line high. Reset the nudge so the centers line",
			"     up and the row reads as one toolbar instead of two offset rows. */",
			"  [data-composer-card=\"true\"] [class*=\"_primary\"] {",
			"    transform: none !important;",
			"  }",
			"}",
		].join("\n");

		function injectCss() {
			if (typeof document === "undefined") return;
			var el = document.getElementById(STYLE_ID);
			if (!el) {
				el = document.createElement("style");
				el.id = STYLE_ID;
				el.setAttribute("data-plugin", "lumesync-mobile");
			}
			if (el.textContent !== CSS) el.textContent = CSS;
			(document.head || document.documentElement).appendChild(el);
		}
		//#endregion

		//#region viewport + zoom guard
		function installViewportGuard(ctx) {
			ctx.effect(function () {
				var viewport = document.querySelector('meta[name="viewport"]');
				var original = viewport ? viewport.content : "";
				var mq = window.matchMedia(NARROW);
				var apply = function () {
					if (viewport) viewport.content = VIEWPORT;
				};
				var restore = function () {
					if (viewport) viewport.content = original;
				};
				var onGesture = function (event) { event.preventDefault(); };
				if (mq.matches) apply();
				var onChange = function (event) { if (event.matches) apply(); else restore(); };
				mq.addEventListener("change", onChange);
				// Legacy-iOS fallback for double-tap zoom; the stylesheet's
				// touch-action covers modern browsers.
				document.addEventListener("gesturestart", onGesture, { passive: false });
				return function () {
					mq.removeEventListener("change", onChange);
					document.removeEventListener("gesturestart", onGesture, { passive: false });
					restore();
				};
			}, "lumesync-mobile: viewport + zoom guard");
		}
		//#endregion

		//#region shared helpers
		function findFrame() {
			var overlay = document.querySelector("[data-shell-overlay]");
			return overlay ? overlay.parentElement : null;
		}

		function useNarrow() {
			var state = React.useState(function () {
				return typeof window !== "undefined" && window.matchMedia(NARROW).matches;
			});
			var narrow = state[0];
			var setNarrow = state[1];
			React.useEffect(function () {
				var mq = window.matchMedia(NARROW);
				var onChange = function (event) { setNarrow(event.matches); };
				mq.addEventListener("change", onChange);
				return function () { mq.removeEventListener("change", onChange); };
			}, []);
			return narrow;
		}

		function PanelIcon(size) {
			return React.createElement("svg", {
				width: size, height: size, viewBox: "0 0 24 24", fill: "none",
				"aria-hidden": "true"
			},
				React.createElement("rect", {
					x: 3, y: 4, width: 18, height: 16, rx: 2,
					stroke: "currentColor", strokeWidth: 1.7
				}),
				React.createElement("line", {
					x1: 9.5, y1: 4, x2: 9.5, y2: 20,
					stroke: "currentColor", strokeWidth: 1.7
				}));
		}
		//#endregion

		//#region slot components
		function createToggle(ctx) {
			return function LumeMobileToggle() {
				return React.createElement("button", {
					type: "button",
					"data-lume-mobile": "toggle",
					"aria-label": "打开侧边栏",
					title: "打开侧边栏",
					onClick: function () { ctx.layout.toggleSidebar(); }
				}, PanelIcon(16));
			};
		}

		function createOverlay(ctx) {
			return function LumeMobileOverlay() {
				var narrow = useNarrow();
				var openState = React.useState(false);
				var open = openState[0];
				var setOpen = openState[1];
				var fabState = React.useState(false);
				var fab = fabState[0];
				var setFab = fabState[1];

				// Own the frame marker; mirror the collapsed state into React.
				React.useLayoutEffect(function () {
					if (!narrow) { setOpen(false); return undefined; }
					var frame = findFrame();
					if (!frame) return undefined;
					frame.setAttribute(MARK, "frame");
					var sync = function () { setOpen(!frame.hasAttribute("data-sidebar-collapsed")); };
					sync();
					var observer = new MutationObserver(sync);
					observer.observe(frame, { attributes: true, attributeFilter: ["data-sidebar-collapsed"] });
					return function () {
						observer.disconnect();
						frame.removeAttribute(MARK);
					};
				}, [narrow]);

				// Floating opener only when no session header is rendered.
				React.useEffect(function () {
					if (!narrow) { setFab(false); return undefined; }
					var sync = function () { setFab(document.querySelector('[data-phase="active"]') === null); };
					sync();
					var observer = new MutationObserver(sync);
					observer.observe(document.documentElement, {
						subtree: true, childList: true, attributes: true, attributeFilter: ["data-phase"]
					});
					return function () { observer.disconnect(); };
				}, [narrow]);

				// Escape closes, unless a modal owns the keyboard.
				React.useEffect(function () {
					if (!narrow || !open) return undefined;
					var onKeyDown = function (event) {
						if (event.key === "Escape" && document.querySelector('[aria-modal="true"]') === null) {
							ctx.layout.toggleSidebar();
						}
					};
					document.addEventListener("keydown", onKeyDown, true);
					return function () { document.removeEventListener("keydown", onKeyDown, true); };
				}, [narrow, open]);

				// Tap-outside closes the drawer. The shell overlay layer is
				// click-through, so the dimming backdrop cannot own a click;
				// instead any click outside the drawer and its openers closes it
				// (capture phase, same "first tap closes" behaviour).
				React.useEffect(function () {
					if (!narrow || !open) return undefined;
					var onDocClick = function (event) {
						if (document.querySelector('[aria-modal="true"]') !== null) return;
						var target = event.target;
						if (!(target instanceof Element)) return;
						if (target.closest('[data-lume-mobile="toggle"]') !== null) return;
						if (target.closest('[data-lume-mobile="fab"]') !== null) return;
						var frame = findFrame();
						if (!frame || frame.hasAttribute("data-sidebar-collapsed")) return;
						if (frame.firstElementChild && frame.firstElementChild.contains(target)) return;
						ctx.layout.toggleSidebar();
					};
					document.addEventListener("click", onDocClick, true);
					return function () { document.removeEventListener("click", onDocClick, true); };
				}, [narrow, open]);

				if (!narrow) return null;
				var close = function () { ctx.layout.toggleSidebar(); };
				return React.createElement(React.Fragment, null,
					open ? React.createElement("div", { "data-lume-mobile": "backdrop", onClick: close }) : null,
					fab && !open ? React.createElement("button", {
						type: "button",
						"data-lume-mobile": "fab",
						"aria-label": "打开侧边栏",
						title: "打开侧边栏",
						onClick: close
					}, PanelIcon(18)) : null);
			};
		}
		//#endregion

		//#region plugin
		const inject = ["slots", "layout"];

		function apply(ctx) {
			injectCss();
			installViewportGuard(ctx);
			try {
				ctx.slots.inject("conversation.session.header.actions", function () {
					try {
						return ctx.slots.register({
							name: "conversation.session.header.actions",
							id: "lume-mobile-toggle",
							order: 10
						}, createToggle(ctx));
					} catch (e) {
						console.error("[lumesync-mobile] header toggle register failed", e);
						return function () {};
					}
				});
			} catch (e) {
				console.error("[lumesync-mobile] header toggle inject failed", e);
			}
			try {
				ctx.slots.inject("shell.overlay", function () {
					try {
						return ctx.slots.register({
							name: "shell.overlay",
							id: "lume-mobile-overlay",
							order: 10
						}, createOverlay(ctx));
					} catch (e) {
						console.error("[lumesync-mobile] overlay register failed", e);
						return function () {};
					}
				});
			} catch (e) {
				console.error("[lumesync-mobile] overlay inject failed", e);
			}
			ctx.effect(function () {
				return function () {
					var el = document.getElementById(STYLE_ID);
					if (el && el.parentNode) el.parentNode.removeChild(el);
				};
			}, "lumesync-mobile: stylesheet");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

;(function () {
	try {
		if (!/(?:^|[?&])lume-debug=1/.test(String(location.search))) return;
		function show() {
			var e = document.getElementById("lume-debug");
			if (!e) {
				e = document.createElement("div");
				e.id = "lume-debug";
				e.style.cssText = "position:fixed;left:0;top:0;z-index:2147483647;background:rgba(0,0,0,.82);color:#00ff88;font:12px/1.35 monospace;padding:5px 7px;white-space:pre;pointer-events:none;";
				(document.body || document.documentElement).appendChild(e);
			}
			var vv = window.visualViewport;
			var body = document.body;
			var mobile = body ? body.getAttribute("data-lume-mobile") : null;
			var standalone = (window.navigator.standalone === true) || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
			e.textContent =
				"host=" + location.host +
				"\nw=" + window.innerWidth + " iw=" + document.documentElement.clientWidth +
				"\ndpr=" + window.devicePixelRatio +
				"\nscale=" + (vv ? vv.scale : "-") + " vvw=" + (vv ? Math.round(vv.width) : "-") +
				"\nmobile=" + mobile + " standalone=" + standalone +
				"\nhtml.fs=" + getComputedStyle(document.documentElement).fontSize +
				" content-fs=" + getComputedStyle(body || document.documentElement).getPropertyValue("--dsh-content-font-size");
		}
		show();
		setInterval(show, 1000);
	} catch (err) {}
})();
