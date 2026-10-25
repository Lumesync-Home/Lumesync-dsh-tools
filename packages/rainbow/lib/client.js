window.__ModuleLoader__.load({
	id: "lumesync-appearance",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");

		//#region color utilities
		function clamp255(n) { return Math.max(0, Math.min(255, Math.round(n))); }
		function clamp01(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }
		function normHex(v, fallback) {
			if (typeof v !== "string") return fallback;
			var s = v.trim().replace(/^#/, "");
			if (/^[0-9a-fA-F]{3}$/.test(s)) s = s.split("").map(function (c) { return c + c; }).join("");
			return /^[0-9a-fA-F]{6}$/.test(s) ? "#" + s.toLowerCase() : fallback;
		}
		function hexToRgb(hex) {
			var s = hex.slice(1);
			return {
				r: parseInt(s.slice(0, 2), 16),
				g: parseInt(s.slice(2, 4), 16),
				b: parseInt(s.slice(4, 6), 16)
			};
		}
		function toHex(c) {
			return "#" + [c.r, c.g, c.b].map(function (x) {
				return clamp255(x).toString(16).padStart(2, "0");
			}).join("");
		}
		function mix(a, b, t) {
			return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
		}
		function lighten(c, amt) { return mix(c, { r: 255, g: 255, b: 255 }, amt); }
		function darken(c, amt) { return mix(c, { r: 0, g: 0, b: 0 }, amt); }
		function relLum(c) {
			function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
			return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
		}
		function inkOf(c) { return relLum(c) > 0.55 ? "#111418" : "#ffffff"; }
		function rgba(c, a) {
			return "rgba(" + clamp255(c.r) + ", " + clamp255(c.g) + ", " + clamp255(c.b) + ", " + a + ")";
		}
		function isDataUrl(v) {
			return typeof v === "string" && /^data:image\//i.test(v.trim());
		}
		//#endregion

		//#region config model
		const NS = "lume-appearance";
		const DEFAULTS = {
			accentLight: "#7ba14f",
			bgLight: "#f4f4f2",
			fgLight: "#2b3440",
			contrastLight: 100,
			accentDark: "#b9e28a",
			bgDark: "#0d1117",
			fgDark: "#dbe3ea",
			contrastDark: 100,
			cjkFont: "",
			latinFont: "",
			codeFont: "",
			bubbleLight: "",
			bubbleInkLight: "",
			bubbleDark: "",
			bubbleInkDark: "",
			bubbleMaterial: "solid",
			sendMaterial: "solid",
			glassAlpha: 55,
			glassBlur: 5,
			bgKind: "color",
			bgGradFrom: "#1f2937",
			bgGradTo: "#4b5563",
			bgGradAngle: 135,
			bgImageLight: "",
			bgImageDark: "",
			bgSurfaceAlpha: 78,
			bgBlur: 0
		};
		const BG_KINDS = ["color", "gradient", "image"];
		const MATERIALS = ["solid", "translucent", "glass"];
		// Edge-refraction filter id (the reference's bare <feDisplacementMap>).
		const REFRACT_ID = "lume-appearance-refract";
		const REFRACT_FILTER_ID = "lume-glass-refract";
		function pickStr(v, d) { return typeof v === "string" ? v : d; }
		function pickMaterial(v) { return MATERIALS.indexOf(v) === -1 ? "solid" : v; }
		function pickNum(v, d, min, max) {
			var lo = typeof min === "number" ? min : 0;
			var hi = typeof max === "number" ? max : 100;
			return typeof v === "number" && isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v))) : d;
		}
		function pickHex(v, d) {
			var n = normHex(v, null);
			return n === null ? d : n;
		}
		function pickImg(v) { return isDataUrl(v) ? v.trim() : ""; }
		function normalizeConfig(value) {
			var v = value && typeof value === "object" ? value : {};
			var kind = pickStr(v.bgKind, DEFAULTS.bgKind);
			if (BG_KINDS.indexOf(kind) === -1) kind = DEFAULTS.bgKind;
			return {
				accentLight: normHex(v.accentLight, DEFAULTS.accentLight),
				bgLight: normHex(v.bgLight, DEFAULTS.bgLight),
				fgLight: normHex(v.fgLight, DEFAULTS.fgLight),
				contrastLight: pickNum(v.contrastLight, DEFAULTS.contrastLight, 0, 100),
				accentDark: normHex(v.accentDark, DEFAULTS.accentDark),
				bgDark: normHex(v.bgDark, DEFAULTS.bgDark),
				fgDark: normHex(v.fgDark, DEFAULTS.fgDark),
				contrastDark: pickNum(v.contrastDark, DEFAULTS.contrastDark, 0, 100),
				cjkFont: pickStr(v.cjkFont, DEFAULTS.cjkFont).trim(),
				latinFont: pickStr(v.latinFont, DEFAULTS.latinFont).trim(),
				codeFont: pickStr(v.codeFont, DEFAULTS.codeFont).trim(),
				bubbleLight: pickHex(v.bubbleLight, ""),
				bubbleInkLight: pickHex(v.bubbleInkLight, ""),
				bubbleDark: pickHex(v.bubbleDark, ""),
				bubbleInkDark: pickHex(v.bubbleInkDark, ""),
				bubbleMaterial: pickMaterial(v.bubbleMaterial),
				sendMaterial: pickMaterial(v.sendMaterial),
				glassAlpha: pickNum(v.glassAlpha, DEFAULTS.glassAlpha, 0, 100),
				glassBlur: pickNum(v.glassBlur, DEFAULTS.glassBlur, 0, 24),
				bgKind: kind,
				bgGradFrom: pickHex(v.bgGradFrom, DEFAULTS.bgGradFrom),
				bgGradTo: pickHex(v.bgGradTo, DEFAULTS.bgGradTo),
				bgGradAngle: pickNum(v.bgGradAngle, DEFAULTS.bgGradAngle, 0, 360),
				bgImageLight: pickImg(v.bgImageLight),
				bgImageDark: pickImg(v.bgImageDark),
				bgSurfaceAlpha: pickNum(v.bgSurfaceAlpha, DEFAULTS.bgSurfaceAlpha, 0, 100),
				bgBlur: pickNum(v.bgBlur, DEFAULTS.bgBlur, 0, 40)
			};
		}
		//#endregion

		//#region server config file (v6-dev)
		// The host half stores one `lume-appearance.config.json` and exposes it
		// on this plugin-private route. The server config is the DEFAULT layer:
		// it overrides the built-in DEFAULTS, and the user's runtime settings
		// (snapshot.user) override it in turn. On a phone / per-origin page
		// whose settings scope stays process-local (memory mode) there is no
		// user layer, so the look comes straight from the server config.
		const SERVER_CONFIG_ROUTE = "/api/lume-appearance/config";
		function isPlainObject(v) {
			return typeof v === "object" && v !== null && !Array.isArray(v);
		}
		function fetchServerConfig(done) {
			try {
				if (typeof fetch !== "function") { done(null); return; }
				fetch(SERVER_CONFIG_ROUTE, {
					method: "GET",
					headers: { accept: "application/json" },
					credentials: "same-origin",
					cache: "no-store"
				}).then(function (res) {
					return res && res.ok ? res.json() : null;
				}).then(function (data) {
					done(isPlainObject(data) ? data : null);
				}).catch(function () { done(null); });
			} catch (e) {
				done(null);
			}
		}
		function pushServerConfig(config, done) {
			try {
				if (typeof fetch !== "function") { done("写入失败（已忽略）"); return; }
				fetch(SERVER_CONFIG_ROUTE, {
					method: "POST",
					headers: { "content-type": "application/json" },
					credentials: "same-origin",
					body: JSON.stringify(config)
				}).then(function (res) {
					return res && res.ok ? res.json() : null;
				}).then(function (body) {
					done(body && body.ok ? "已写入 · 全端同款" : "写入失败（已忽略）");
				}).catch(function () { done("写入失败（已忽略）"); });
			} catch (e) {
				done("写入失败（已忽略）");
			}
		}
		//#endregion

		//#region CSS generation
		function declLines(pairs, important) {
			return pairs.map(function (pair) {
				return "  " + pair[0] + ": " + pair[1] + (important ? " !important" : "") + ";";
			}).join("\n");
		}
		function buildSchemeCss(selector, s, dark) {
			var accent = hexToRgb(s.accent);
			var bg = hexToRgb(s.bg);
			var fg = mix(bg, hexToRgb(s.fg), clamp01(s.contrast / 100));
			var accentHover = toHex(lighten(accent, 0.15));
			var accentInk = inkOf(accent);
			var layer1 = dark ? toHex(lighten(bg, 0.035)) : toHex(mix(bg, fg, 0.025));
			var layer2 = dark ? toHex(lighten(bg, 0.06)) : toHex(mix(bg, fg, 0.05));
			var layer3 = dark ? toHex(lighten(bg, 0.095)) : toHex(mix(bg, fg, 0.075));
			var overlay = dark ? toHex(lighten(bg, 0.22)) : toHex(mix(fg, bg, 0.25));
			var labelPrimary = toHex(fg);
			var labelPrimaryDimmed = toHex(mix(fg, bg, 0.15));
			var labelPrimaryInverted = dark ? toHex(mix(bg, fg, 0.05)) : "#ffffff";
			var labelPrimaryForeground = labelPrimary;
			var labelSecondary = toHex(mix(fg, bg, 0.30));
			var labelTertiary = toHex(mix(fg, bg, 0.48));
			var labelCaption = toHex(mix(fg, bg, 0.65));
			var labelDimmed = toHex(mix(fg, bg, 0.80));
			var borderInk = dark ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
			var scrollBgL1 = dark ? toHex(mix(fg, bg, 0.55)) : toHex(mix(fg, bg, 0.75));
			var scrollBgL2 = dark ? toHex(mix(fg, bg, 0.68)) : toHex(mix(fg, bg, 0.82));
			var scrollHoverL1 = dark ? toHex(mix(fg, bg, 0.35)) : toHex(mix(fg, bg, 0.55));
			var scrollHoverL2 = toHex(mix(fg, bg, dark ? 0.30 : 0.52));
			var accentDim = rgba(accent, dark ? 0.18 : 0.16);
			var accentGlow = rgba(accent, dark ? 0.5 : 0.35);
			var skeleton = dark ? toHex(lighten(bg, 0.04)) : toHex(mix(bg, fg, 0.04));

			// A. bubble: explicit override, else derived from base palette.
			var bubble = normHex(s.bubble, null) || (dark ? toHex(lighten(bg, 0.05)) : toHex(mix(bg, accent, 0.04)));
			var bubbleHl = toHex(dark ? lighten(hexToRgb(bubble), 0.09) : mix(hexToRgb(bubble), accent, 0.10));
			// Default bubble ink adapts to the bubble fill (light fill -> dark ink,
			// dark fill -> light ink); an explicit "气泡内文字色" still wins.
			var bubbleInk = normHex(s.bubbleInk, null) || inkOf(hexToRgb(bubble));

			// C. translucent surfaces while a gradient/image backdrop is on.
			var translucent = s.bgKind !== "color" && s.surfaceAlpha < 100;
			function surf(v) {
				return translucent ? "color-mix(in srgb, " + v + " " + s.surfaceAlpha + "%, transparent)" : v;
			}

			var key = [
				["--lume-accent", s.accent],
				["--lume-accent-hover", accentHover],
				["--lume-accent-ink", accentInk],
				["--lume-accent-dim", accentDim],
				["--lume-accent-glow", accentGlow],
				["--lume-orange", s.accent],
				["--lume-orange-hover", accentHover],
				["--lume-orange-ink", accentInk],
				["--lume-orange-dim", accentDim],
				["--lume-orange-glow", accentGlow],
				["--lume-bubble-ink", bubbleInk],
				["--dsw-alias-brand-primary", s.accent],
				["--dsw-alias-brand-text", s.accent],
				["--dsw-alias-brand-primary-invert", accentInk],
				["--dsw-alias-button-primary-fill", s.accent],
				["--dsw-alias-button-primary-hover", accentHover],
				["--dsw-alias-button-primary-dimmed", rgba(accent, dark ? 0.22 : 0.16)],
				["--dsw-alias-state-business-primary", s.accent]
			];
			var rest = [
				["--dsw-alias-bg-base", surf(s.bg)],
				["--dsw-alias-bg-layer-1", surf(layer1)],
				["--dsw-alias-bg-layer-2", surf(layer2)],
				["--dsw-alias-bg-layer-3", surf(layer3)],
				["--dsw-alias-bg-module-platform", surf(layer1)],
				["--dsw-alias-bg-multi-select", surf(layer2)],
				["--dsw-alias-bg-overlay", surf(overlay)],
				["--dsw-alias-bg-skeleton", surf(skeleton)],
				["--dsw-alias-label-primary", labelPrimary],
				["--dsw-alias-label-primary-dimmed", labelPrimaryDimmed],
				["--dsw-alias-label-primary-inverted", labelPrimaryInverted],
				["--dsw-alias-label-primary-foreground", labelPrimaryForeground],
				["--dsw-alias-label-secondary", labelSecondary],
				["--dsw-alias-label-tertiary", labelTertiary],
				["--dsw-alias-label-caption", labelCaption],
				["--dsw-alias-label-dimmed", labelDimmed],
				["--dsw-alias-border-l1", rgba(borderInk, 0.05)],
				["--dsw-alias-border-l2", rgba(borderInk, 0.10)],
				["--dsw-alias-border-l3", rgba(borderInk, 0.14)],
				["--dsw-alias-border-l4", rgba(borderInk, 0.18)],
				["--dsw-alias-button-contrast-fill", labelPrimary],
				["--dsw-alias-interactive-bg-hover", rgba(accent, dark ? 0.08 : 0.07)],
				["--dsw-alias-interactive-bg-hover-solid", surf(layer1)],
				["--dsw-alias-interactive-bg-hover-accent", rgba(accent, dark ? 0.16 : 0.12)],
				["--dsw-alias-interactive-bg-active", rgba(accent, dark ? 0.22 : 0.16)],
				["--dsw-alias-state-business-tertiary", dark ? surf(layer2) : surf(toHex(mix(accent, bg, 0.9)))],
				["--dsw-alias-markdown-code-block", dark ? surf(toHex(darken(bg, 0.15))) : surf(layer2)],
				["--dsw-alias-markdown-code-block-banner", dark ? surf(toHex(darken(bg, 0.10))) : surf(layer1)],
				["--dsw-alias-markdown-inline-code", surf(layer1)],
				["--dsw-alias-markdown-code-segment-selected", surf(layer2)],
				["--dsw-alias-markdown-code-segment-unselected", dark ? surf(toHex(darken(bg, 0.15))) : surf(layer2)],
				["--dsw-alias-markdown-citation", dark ? surf(layer2) : surf(layer1)],
				["--dsw-alias-markdown-placeholder", surf(layer2)],
				["--dsw-alias-markdown-tag", surf(layer2)],
				["--dsw-alias-scrollbar-bg-l1", scrollBgL1],
				["--dsw-alias-scrollbar-bg-l2", scrollBgL2],
				["--dsw-alias-scrollbar-hover-l1", scrollHoverL1],
				["--dsw-alias-scrollbar-hover-l2", scrollHoverL2],
				["--dsw-alias-tooltip-bg", dark ? surf(layer1) : surf(toHex(mix(fg, bg, 0.20)))],
				["--dsw-alias-toast-bg", dark ? surf(layer2) : surf(toHex(mix(fg, bg, 0.20)))],
				["--dsw-specific-menu", surf(layer3)],
				["--dsw-specific-selector", surf(layer3)],
				["--dsw-specific-sidebar-fill", dark ? surf(toHex(darken(bg, 0.15))) : surf(layer1)],
				["--dsw-specific-sidebar-nav-item-active-accent", surf(layer3)],
				["--dsw-specific-sidebar-nav-item-active", surf(layer2)],
				["--dsw-specific-sidebar-nav-item-hover", surf(layer1)],
				["--dsw-specific-tip", surf(layer3)],
				["--dsw-specific-input-major", surf(layer1)],
				["--dsw-specific-bubble", bubble],
				["--dsw-specific-bubble-highlight", bubbleHl]
			];
			return selector + " {\n" + declLines(key, true) + "\n" + declLines(rest, true) + "\n}";
		}
		function quoteFont(name) { return '"' + name.replace(/"/g, "") + '"'; }
		function buildFontCss(cfg) {
			var latin = cfg.latinFont ? quoteFont(cfg.latinFont) + ", " : "";
			var cjk = cfg.cjkFont ? quoteFont(cfg.cjkFont) + ", " : "";
			var family = latin + cjk
				+ "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', "
				+ "'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif";
			var code = (cfg.codeFont ? quoteFont(cfg.codeFont) + ", " : "")
				+ "'SF Mono', 'JetBrains Mono', 'Fira Code', Consolas, 'Liberation Mono', Menlo, Courier, "
				+ "'PingFang SC', 'Microsoft YaHei'";
			return ":root, html, body {\n"
				+ "  --dsw-font-family: " + family + " !important;\n"
				+ "  --ds-font-family-code: " + code + " !important;\n"
				+ "}";
		}
		// A. user-bubble text ink (the bubble token above already owns its fill).
		function buildBubbleInkCss() {
			// Match the real user-bubble chain emitted by MessageItem.tsx
			// (`.userRow > .userStack > .bubble`). The old `[data-pane="conversation"]`
			// prefix never matched: that attribute does not exist in the client
			// bundle, so the rule was dead. Scoping to `.userRow`/`.userStack`
			// leaves the tooltip (ui-primitives) and goal-input (ui-goal) `.bubble`
			// elements untouched, and does not touch assistant messages. Plain runs
			// inside inherit this colour; reference chips keep their own accent.
			var sel = "[class*=\"_userRow\"] [class*=\"_bubble\"], [class*=\"_userStack\"] [class*=\"_bubble\"]";
			return [
				"/* A. user-bubble text ink (contrast against --dsw-specific-bubble) */",
				sel + " {",
				"  color: var(--lume-bubble-ink) !important;",
				"}"
			].join("\n");
		}
		// WO-38y: composer (message input) follows the font setting explicitly (some
		// engines give <input>/<textarea>/contenteditable their own default font that
		// does not inherit), and takes the user-bubble ink for its text.
		function buildComposerInkCss() {
			var sel = "[data-composer-seat] [contenteditable=\"true\"], [data-composer-seat] textarea, [class*=\"_input\"][contenteditable=\"true\"]";
			return [
				"/* A2. composer input text ink = user-bubble ink (caret left to the app) */",
				sel + " {",
				"  color: var(--lume-bubble-ink) !important;",
				"}"
			].join("\n");
		}
		// E-refract (WO-38j): edge-only refraction via a displacement map on the
		// glass element's OWN backdrop-filter (samples the page, never the text). The
		// map is a capsule/rounded-rect SDF with a FIXED-PIXEL-WIDTH edge band, so the
		// refraction band thickness is identical for short and long/multi-line
		// bubbles. A single canonical map stretched onto each element would scale the
		// band with the element, so one filter is built per distinct element size
		// (maps cached) and the element gets an inline
		// `backdrop-filter: ... url(#<filter>)`. userSpaceOnUse keeps the scale in
		// real pixels.
		const REFRACT_BAND_PX = 10;
		const REFRACT_SCALE_PX = 25;
		const REFRACT_MARGIN_PX = 20;
		const REFRACT_ZOOM = 0.22;        // zoom/lens strength (fraction)
		// Only Blink can resolve an SVG url() filter inside backdrop-filter; on
		// other engines (Safari/WebKit, Firefox) we skip it so the base
		// blur()+saturate() glass is kept instead of losing the whole declaration.
		var refractSupportsUrl = null;
		function refractionSupported() {
			if (refractSupportsUrl !== null) return refractSupportsUrl;
			try {
				var ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
				// Only Blink actually renders an SVG url() filter inside
				// backdrop-filter. WebKit PARSES url() (so CSS.supports lies) but then
				// drops the WHOLE backdrop-filter — which would kill the blur too. So we
				// additionally require a Blink UA (AppleWebKit + Chrome/Chromium/Edge).
				var blink = /AppleWebKit/.test(ua) && /Chrome|Chromium|Edg\//.test(ua);
				refractSupportsUrl = blink && !!(typeof CSS !== "undefined" && CSS.supports && (CSS.supports("backdrop-filter", "url(#x)") || CSS.supports("-webkit-backdrop-filter", "url(#x)")));
			} catch (e) { refractSupportsUrl = false; }
			return refractSupportsUrl;
		}
		var refractMapCache = {};
		function refractMap(W, H, rad, band) {
			W = Math.max(8, Math.round(W)); H = Math.max(8, Math.round(H));
			rad = Math.max(0, Math.min(Math.min(W, H) / 2, Math.round(rad)));
			var M = REFRACT_MARGIN_PX;
			var We = W + 2 * M, He = H + 2 * M;
			var key = W + "x" + H + "x" + Math.round(rad) + "x" + Math.round(band) + "x" + M + "z" + REFRACT_ZOOM;
			if (refractMapCache[key] !== undefined) return refractMapCache[key];
			var out = { href: "", scale: 0 };
			if (typeof document === "undefined") return out;
			try {
				var canvas = document.createElement("canvas");
				canvas.width = We; canvas.height = He;
				var ctx = canvas.getContext("2d");
				var img = ctx.createImageData(We, He);
				var data = img.data;
				function ss(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }
				function len(x, y) { return Math.sqrt(x * x + y * y); }
				var hx = W / 2, hy = H / 2, e = 0.5;
				function sdf(X, Y) {
					var qx = Math.abs(X) - (hx - rad), qy = Math.abs(Y) - (hy - rad);
					return Math.min(Math.max(qx, qy), 0) + len(Math.max(qx, 0), Math.max(qy, 0)) - rad;
				}
				var raw = new Float32Array(We * He * 2);
				var maxAbs = 0, idx = 0;
				for (var yy = 0; yy < He; yy++) {
					for (var xx = 0; xx < We; xx++) {
						var X = xx + 0.5 - We / 2, Y = yy + 0.5 - He / 2;
						var d = sdf(X, Y);
						var mag = ss(-band, 0, d);
						// ZOOM/lens: near the rim, sample toward the centre of the
						// element (magnify) instead of shifting along the edge normal.
						var dxv = -X * REFRACT_ZOOM * mag, dyv = -Y * REFRACT_ZOOM * mag;
						raw[idx * 2] = dxv; raw[idx * 2 + 1] = dyv;
						var a = Math.max(Math.abs(dxv), Math.abs(dyv)); if (a > maxAbs) maxAbs = a;
						idx++;
					}
				}
				if (!maxAbs) maxAbs = 1;
				for (var i = 0; i < We * He; i++) {
					data[i * 4] = Math.max(0, Math.min(255, (0.5 + 0.5 * raw[i * 2] / maxAbs) * 255));
					data[i * 4 + 1] = 128;
					data[i * 4 + 2] = Math.max(0, Math.min(255, (0.5 + 0.5 * raw[i * 2 + 1] / maxAbs) * 255));
					data[i * 4 + 3] = 255;
				}
				ctx.putImageData(img, 0, 0);
				out = { href: canvas.toDataURL(), scale: 2 * maxAbs };
			} catch (err) { out = { href: "", scale: 0 }; }
			refractMapCache[key] = out;
			return out;
		}
		function refractHash(str) {
			var h = 5381, i = str.length;
			while (i) { h = ((h * 33) ^ str.charCodeAt(--i)) >>> 0; }
			return h.toString(36);
		}
		var GLASS_SELECTORS = [
			"[class*=\"_userRow\"] [class*=\"_bubble\"]",
			"[class*=\"_userStack\"] [class*=\"_bubble\"]",
			"[data-composer-seat] button[class*=\"_primary\"]"
		];
		function collectGlassEls() {
			var out = [];
			for (var i = 0; i < GLASS_SELECTORS.length; i++) {
				var nodes = document.querySelectorAll(GLASS_SELECTORS[i]);
				for (var j = 0; j < nodes.length; j++) out.push(nodes[j]);
			}
			return out;
		}
		function borderRadiusPx(el) {
			try { return parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0; } catch (e) { return 0; }
		}
		function buildRefractSvg(list) {
			var M = REFRACT_MARGIN_PX;
			var body = "";
			for (var i = 0; i < list.length; i++) {
				var fl = list[i];
				var We = fl.W + 2 * M, He = fl.H + 2 * M;
				body += "<filter id=\"" + fl.id + "\" x=\"" + (-M) + "\" y=\"" + (-M) + "\" width=\"" + We + "\" height=\"" + He + "\" filterUnits=\"userSpaceOnUse\" color-interpolation-filters=\"sRGB\">"
					+ "<feImage href=\"" + fl.href + "\" xlink:href=\"" + fl.href + "\" x=\"" + (-M) + "\" y=\"" + (-M) + "\" width=\"" + We + "\" height=\"" + He + "\" preserveAspectRatio=\"none\" result=\"MAP\"/>"
					+ "<feDisplacementMap in=\"SourceGraphic\" in2=\"MAP\" xChannelSelector=\"R\" yChannelSelector=\"B\" scale=\"" + fl.scale + "\"/>"
					+ "</filter>";
			}
			if (!body) return "";
			return "<svg aria-hidden=\"true\" focusable=\"false\" width=\"0\" height=\"0\" style=\"position:absolute;left:0;top:0;overflow:hidden\"><defs>" + body + "</defs></svg>";
		}
		function hasGlassTarget(cfg) {
			return cfg.bubbleMaterial === "glass" || cfg.sendMaterial === "glass";
		}
		// E. material (v3/v4/v5): user bubble + send button.
		// Targets are scoped so assistant bubbles, tooltips and the goal bubble
		// keep their own look. "solid" emits nothing (current behaviour).
		// v4: the glass edge is a layered mirror rim (bright top -> faint bottom
		// + hairline inner ring + soft cast shadow) instead of a uniform 1px
		// border, and is tuned per scheme (light vs dark) so the dark surface no
		// longer looks washed out. The fill alpha is driven by cfg.glassAlpha.
		// v5: thicker liquid glass. The single glassAlpha slider is mapped per
		// scheme (light lifted 55->70 so the pane stops washing out; dark eased
		// 55->47 so it stops looking murky), the top rim is a brighter lit edge,
		// the inner glow goes cool in dark, and the cast shadow splits into a
		// near + far pair so the pane visibly floats. Still static, no animation.
		// v6 (WO-38b): pull the glass back toward the Apple "clean glass"
		// reference. The red/blue chromatic lens rims and the SVG
		// feTurbulence/feDisplacementMap refraction are removed (they read as
		// weird, and the lone refraction knob was not legible), the edge becomes
		// one faint neutral white highlight + a hairline ring + a soft float
		// shadow, and a new glassBlur slider drives the backdrop blur with a
		// lower default (5px, replacing the fixed 9px). Still static, no motion.
		// v7 (WO-38c): the single top highlight read as a flat sheet, so the
		// edge regains volume: a layered inset bevel (thick lit top + darker
		// inner bottom) + a top-left specular sheen (background-image) + a
		// masked gradient rim (::before) that wraps the rounded corners + a
		// tight contact shadow under the soft float pair. A new glassEdge
		// slider (0-12, default 4) adds a narrow edge-band refraction: a masked
		// ::after ring whose backdrop-filter blurs only the outer ~3px. Neutral
		// white/black only, no chromatic split, still static.
		function buildMaterialCss(cfg) {
			var bubbleSel = "[class*=\"_userRow\"] [class*=\"_bubble\"], [class*=\"_userStack\"] [class*=\"_bubble\"]";
			var sendSel = "[data-composer-seat] button[class*=\"_primary\"]";
			var targets = [
				{ sel: bubbleSel, bg: "var(--dsw-specific-bubble)", material: cfg.bubbleMaterial },
				{ sel: sendSel, bg: "var(--lume-orange)", material: cfg.sendMaterial }
			];
			function fill(bg, alpha) { return "color-mix(in srgb, " + bg + " " + alpha + "%, transparent)"; }
			// glassAlpha drives the themed fill alpha again (so the slider is
			// visibly doing something): the 38c mapping (light x1.27, dark x0.85).
			function alphaLight(a) { return Math.min(100, Math.round(a * 1.27)); }
			function alphaDark(a) { return Math.round(a * 0.85); }
			var blurPx = Math.round(cfg.glassBlur);
			// Edge + shadow copied from the production plugin (v5): a soft top-lit
			// rim, a faint bottom rim, a hairline inner ring, a soft inner glow and
			// a near/far cast-shadow pair, tuned per scheme (so dark mode stays
			// coherent instead of showing a hard white ring).
			var EDGE_LIGHT = [
				"inset 0 1px 0 rgba(255, 255, 255, .60)",
				"inset 0 -1px 0 rgba(255, 255, 255, .12)",
				"inset 0 0 0 .5px rgba(255, 255, 255, .16)",
				"inset 0 0 12px rgba(255, 255, 255, .06)",
				"0 1px 2px rgba(0, 0, 0, .10)",
				"0 8px 24px rgba(0, 0, 0, .18)"
			].join(", ");
			var EDGE_DARK = [
				"inset 0 1px 0 rgba(255, 255, 255, .30)",
				"inset 0 -1px 0 rgba(255, 255, 255, .08)",
				"inset 0 0 0 .5px rgba(255, 255, 255, .10)",
				"inset 0 0 12px rgba(150, 190, 225, .07)",
				"0 1px 2px rgba(0, 0, 0, .35)",
				"0 8px 24px rgba(0, 0, 0, .55)"
			].join(", ");
			function scoped(scheme, sel, pe) {
				return sel.split(",").map(function (s) { return scheme + " " + s.trim() + pe; }).join(", ");
			}
			function indentCss(css) {
				return css.split("\n").map(function (l) { return "  " + l; }).join("\n");
			}
			function glassRule(scheme, sel, bg, edge, alpha) {
				return [
					scoped(scheme, sel, "") + " {",
					"  background: " + fill(bg, alpha) + " !important;",
					"  -webkit-backdrop-filter: blur(" + blurPx + "px) saturate(1.4) !important;",
					"  backdrop-filter: blur(" + blurPx + "px) saturate(1.4) !important;",
					"  border: 0 !important;",
					"  box-shadow: " + edge + " !important;",
					"}"
				].join("\n");
			}
			var parts = [];
			targets.forEach(function (t) {
				if (t.material === "translucent") {
					parts.push("/* E. translucent: semi-transparent fill, no blur */");
					parts.push(t.sel + " {");
					parts.push("  background: " + fill(t.bg, cfg.glassAlpha) + " !important;");
					parts.push("}");
				}
			});
			var glassTargets = targets.filter(function (t) { return t.material === "glass"; });
			if (glassTargets.length) {
				parts.push("/* E. liquid glass v10 (WO-38g): Shuding edge refraction on the element's own backdrop-filter (samples the page, not the text) + our glassBlur/glassAlpha */");
				glassTargets.forEach(function (t) {
					parts.push(glassRule("body:not([data-ds-dark-theme])", t.sel, t.bg, EDGE_LIGHT, alphaLight(cfg.glassAlpha)));
					parts.push(glassRule("body[data-ds-dark-theme]", t.sel, t.bg, EDGE_DARK, alphaDark(cfg.glassAlpha)));
				});
				// WO-38s: non-Blink fallback (Safari/WebKit, Firefox). WebKit cannot
				// resolve an SVG url() filter in backdrop-filter, so instead we add a
				// thin MASKED backdrop band on ::after (WebKit DOES support
				// backdrop-filter blur/brightness/saturate + mask) to approximate the
				// rim refraction, plus a hairline inner highlight. Chromium ignores
				// this block and uses the real feDisplacementMap instead.
				// (Non-Blink edge-band fallback REVERTED 2026-10-09: it read as a stiff white ring.)
				// (WO-38j) The url() filter is applied per element by JS in syncRefraction,
				// because a fixed-pixel band needs a filter sized to each element.
				// Last resort: no backdrop-filter at all.
				parts.push("@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {");
				glassTargets.forEach(function (t) {
					parts.push("  body:not([data-ds-dark-theme]) " + t.sel + ", body[data-ds-dark-theme] " + t.sel + " { background: " + fill(t.bg, alphaLight(cfg.glassAlpha)) + " !important; }");
				});
				parts.push("}");
			}
			return parts.length ? parts.join("\n") : "";
		}
		function bgValueFor(cfg, dark) {
			if (cfg.bgKind === "gradient") {
				var from = normHex(cfg.bgGradFrom, dark ? cfg.accentDark : cfg.accentLight);
				var to = normHex(cfg.bgGradTo, dark ? cfg.bgDark : cfg.bgLight);
				return "linear-gradient(" + cfg.bgGradAngle + "deg, " + from + ", " + to + ")";
			}
			if (cfg.bgKind === "image") {
				var img = dark ? (cfg.bgImageDark || cfg.bgImageLight) : (cfg.bgImageLight || cfg.bgImageDark);
				return img ? 'url("' + img + '")' : "none";
			}
			return "none";
		}
		function buildBackgroundCss(cfg) {
			if (cfg.bgKind === "color") return "";
			return [
				"/* C. background layer (colour/gradient/uploaded image + blur) */",
				"#lume-appearance-bg {",
				"  position: fixed !important;",
				"  inset: 0 !important;",
				"  z-index: -1 !important;",
				"  pointer-events: none !important;",
				"  background-repeat: no-repeat !important;",
				"  background-position: center center !important;",
				"  background-size: cover !important;",
				"  filter: blur(" + cfg.bgBlur + "px) !important;",
				"  transform: scale(1.06) !important;",
				"}",
				"body:not([data-ds-dark-theme]) #lume-appearance-bg { background-image: " + bgValueFor(cfg, false) + " !important; }",
				"body[data-ds-dark-theme] #lume-appearance-bg { background-image: " + bgValueFor(cfg, true) + " !important; }"
			].join("\n");
		}
		// D. mobile layout: REMOVED (2026-09-30). The old best-effort block forced
		// `font-size: 15px !important` onto the composer surface, which overrode
		// the user's content-font-size and tripped iOS Safari's auto-zoom-on-focus
		// for any composer text below 16px. The host already sizes the composer and
		// sets flex:none on its own controls, so the block is dropped outright.
		function buildCss(cfg) {
			return [
				"/* lumesync-appearance - generated at runtime; do not edit */",
				buildSchemeCss("body:not([data-ds-dark-theme])", {
					accent: cfg.accentLight, bg: cfg.bgLight, fg: cfg.fgLight, contrast: cfg.contrastLight,
					bubble: cfg.bubbleLight, bubbleInk: cfg.bubbleInkLight,
					bgKind: cfg.bgKind, surfaceAlpha: cfg.bgSurfaceAlpha
				}, false),
				buildSchemeCss("body[data-ds-dark-theme]", {
					accent: cfg.accentDark, bg: cfg.bgDark, fg: cfg.fgDark, contrast: cfg.contrastDark,
					bubble: cfg.bubbleDark, bubbleInk: cfg.bubbleInkDark,
					bgKind: cfg.bgKind, surfaceAlpha: cfg.bgSurfaceAlpha
				}, true),
				buildFontCss(cfg),
				buildBubbleInkCss(),
				buildComposerInkCss(),
				buildMaterialCss(cfg),
				buildBackgroundCss(cfg)
			].join("\n");
		}
		//#endregion

		//#region style injection
		const STYLE_ID = "lume-appearance-style";
		const BG_ID = "lume-appearance-bg";
		var lastRefractSig = "";
		var refractApplied = [];
		var refractBusy = false;
		var refractRO = null;
		function injectCss(css) {
			if (typeof document === "undefined") return;
			var el = document.getElementById(STYLE_ID);
			if (!el) {
				el = document.createElement("style");
				el.id = STYLE_ID;
				el.setAttribute("data-plugin", "lumesync-appearance");
			}
			if (el.textContent !== css) el.textContent = css;
			// Always (re)append so this sheet stays the LAST author style in head.
			(document.head || document.documentElement).appendChild(el);
		}
		function syncBackgroundLayer(cfg) {
			if (typeof document === "undefined" || !document.body) return;
			var el = document.getElementById(BG_ID);
			if (cfg.bgKind === "color") {
				if (el && el.parentNode) el.parentNode.removeChild(el);
				return;
			}
			if (!el) {
				el = document.createElement("div");
				el.id = BG_ID;
				el.setAttribute("aria-hidden", "true");
				document.body.appendChild(el);
			}
		}
		// NOTE: the iOS status-bar "full-bleed" experiment (theme-color: transparent
		// + apple-mobile-web-app-status-bar-style: black-translucent) was REVERTED
		// 2026-10-09: on iOS it flips env(safe-area-inset-top) from 0 to the status
		// bar height, which pushed bottom-anchored panels (e.g. the file-preview
		// close button) below the viewport. Keeping the app's own status-bar style.
		// Injects the SVG <filter> the glass backdrop-filter references. It is
		// only needed while at least one target is glass; removed otherwise so
		// solid/translucent pages carry no extra DOM.
		function syncRefraction(cfg) {
			if (refractBusy) return;
			refractBusy = true;
			try {
			if (typeof document === "undefined" || !document.body) return;
			var container = document.getElementById(REFRACT_ID);
			var prev = refractApplied;
			refractApplied = [];
			if (!hasGlassTarget(cfg) || !refractionSupported()) {
				for (var p = 0; p < prev.length; p++) { try { prev[p].style.removeProperty("backdrop-filter"); prev[p].style.removeProperty("-webkit-backdrop-filter"); prev[p].__lumeRefractVal = ""; } catch (e) {} }
				if (container && container.parentNode) container.parentNode.removeChild(container);
				lastRefractSig = "";
				return;
			}
			var blurPx = Math.round(cfg.glassBlur);
			var els = collectGlassEls();
			var seen = {}, filters = [], sig = [];
			for (var k = 0; k < els.length; k++) {
				var el = els[k];
				var W = el.offsetWidth || 0, H = el.offsetHeight || 0;
				if (W < 8 || H < 8) continue;
				var rad = borderRadiusPx(el);
				var key = W + "x" + H + "x" + Math.round(rad);
				var id = REFRACT_FILTER_ID + "-" + refractHash(key);
				sig.push(key);
				if (!seen[id]) { seen[id] = 1; var mp = refractMap(W, H, rad, REFRACT_BAND_PX); filters.push({ id: id, href: mp.href, scale: mp.scale, W: W, H: H }); }
				var val = "blur(" + blurPx + "px) saturate(1.4) url(#" + id + ")";
				if (el.__lumeRefractVal !== val) {
					el.style.setProperty("backdrop-filter", val, "important");
					el.style.setProperty("-webkit-backdrop-filter", val, "important");
					el.__lumeRefractVal = val;
				}
				refractApplied.push(el);
			}
			for (var q = 0; q < prev.length; q++) {
				if (refractApplied.indexOf(prev[q]) === -1) { try { prev[q].style.removeProperty("backdrop-filter"); prev[q].style.removeProperty("-webkit-backdrop-filter"); prev[q].__lumeRefractVal = ""; } catch (e) {} }
			}
			if (refractRO) { for (var r = 0; r < els.length; r++) { try { refractRO.observe(els[r]); } catch (e) {} } }
			sig.sort();
			var s = sig.join("|") + "@" + blurPx;
			if (!container) {
				container = document.createElement("div");
				container.id = REFRACT_ID;
				container.setAttribute("aria-hidden", "true");
				document.body.appendChild(container);
			}
			if (s !== lastRefractSig) { container.innerHTML = buildRefractSvg(filters); lastRefractSig = s; }
			} finally { refractBusy = false; }
		}
		//#endregion

		//#region runtime
		function createRuntime(ctx) {
			var binder = ctx.get("webUiSettings") || ctx.get("settingsScope");
			if (!binder || typeof binder.bind !== "function") {
				throw new Error("lume-appearance: settingsScope service unavailable");
			}
			var scope = binder.bind({ namespace: NS });
			function snapshot() {
				try { return scope.getSnapshot(); } catch (e) { return undefined; }
			}
			// Server-side config file = the default layer (loaded below). The
			// user's explicit settings (snapshot.user) sit above it; a missing
			// or bad file leaves this null and nothing changes.
			var serverConfig = null;
			// Client-local edit layer. It sits ABOVE the server config, so an
			// edit renders immediately even when the settings scope is
			// process-local / read-only (a phone page whose origin is not
			// loopback: the scope never reaches /api and never updates). The
			// server config stays the default layer; persisting across devices
			// is done by 「一键适配」 -> POST /api/lume-appearance/config.
			var localConfig = {};
			var localListeners = [];
			function notifyLocal() {
				var listeners = localListeners.slice();
				for (var i = 0; i < listeners.length; i++) {
					try { listeners[i](); } catch (e) { console.error("[lume-appearance] local listener failed", e); }
				}
			}
			function subscribeLocal(listener) {
				localListeners.push(listener);
				return function () {
					var idx = localListeners.indexOf(listener);
					if (idx !== -1) localListeners.splice(idx, 1);
				};
			}
			function currentConfig() {
				var snap = snapshot();
				var override = isPlainObject(snap && snap.user)
					? snap.user
					: (isPlainObject(snap && snap.value) ? snap.value : {});
				var merged = {};
				var key;
				for (key in serverConfig) {
					if (Object.prototype.hasOwnProperty.call(serverConfig, key)) merged[key] = serverConfig[key];
				}
				for (key in override) {
					if (Object.prototype.hasOwnProperty.call(override, key)) merged[key] = override[key];
				}
				for (key in localConfig) {
					if (Object.prototype.hasOwnProperty.call(localConfig, key)) merged[key] = localConfig[key];
				}
				return normalizeConfig(merged);
			}
			function render() {
				var cfg = currentConfig();
				injectCss(buildCss(cfg));
				syncBackgroundLayer(cfg);
				syncRefraction(cfg);
			}
			render();
			var unsubscribe = null;
			try {
				unsubscribe = scope.subscribe(function () {
					try { render(); } catch (e) { console.error("[lume-appearance] render failed", e); }
				});
			} catch (e) {
				console.error("[lume-appearance] subscribe failed", e);
			}
			// Load the server config asynchronously: the first paint keeps the
			// current behaviour, then one re-render applies the file (if any).
			fetchServerConfig(function (cfg) {
				if (!isPlainObject(cfg)) return;
				serverConfig = cfg;
				try { render(); } catch (e) { console.error("[lume-appearance] config render failed", e); }
			});
			// Re-sync the per-element filters only when the set of glass elements
			// actually changes (NOT on unrelated DOM churn such as a hover action
			// button, which used to make the copy button flicker), when a glass
			// element resizes, or when the window resizes.
			var refractObserver = null, refractResize = null, refractTimer = 0;
			function scheduleRefract() {
				if (refractTimer) clearTimeout(refractTimer);
				refractTimer = setTimeout(function () { refractTimer = 0; try { syncRefraction(currentConfig()); } catch (e) {} }, 150);
			}
			function nodeTouchesGlass(node) {
				if (!node || node.nodeType !== 1) return false;
				try {
					for (var i = 0; i < GLASS_SELECTORS.length; i++) {
						if (node.matches && node.matches(GLASS_SELECTORS[i])) return true;
						if (node.querySelector && node.querySelector(GLASS_SELECTORS[i])) return true;
					}
				} catch (e) {}
				return false;
			}
			try {
				if (typeof MutationObserver === "function") {
					refractObserver = new MutationObserver(function (muts) {
						for (var i = 0; i < muts.length; i++) {
							var m = muts[i];
							if (m.type !== "childList") continue;
							var j;
							for (j = 0; j < m.addedNodes.length; j++) if (nodeTouchesGlass(m.addedNodes[j])) { scheduleRefract(); return; }
							for (j = 0; j < m.removedNodes.length; j++) if (nodeTouchesGlass(m.removedNodes[j])) { scheduleRefract(); return; }
						}
					});
					refractObserver.observe(document.body, { childList: true, subtree: true });
				}
			} catch (e) {}
			try {
				if (typeof ResizeObserver === "function") refractRO = new ResizeObserver(function () { scheduleRefract(); });
			} catch (e) {}
			try {
				refractResize = function () { scheduleRefract(); };
				window.addEventListener("resize", refractResize);
			} catch (e) {}
			return {
				scope: scope,
				currentConfig: currentConfig,
				render: render,
				subscribe: subscribeLocal,
				set: function (key, value) {
					// 1. Local, always: render the new value immediately without
					//    waiting for (or depending on) any /api round-trip.
					localConfig[key] = value;
					try { render(); } catch (e) { console.error("[lume-appearance] render after set failed", e); }
					notifyLocal();
					// 2. Best-effort host persistence: on a loopback page this
					//    keeps the existing per-namespace settings write; on a
					//    phone page the scope is memory-only, so this resolves
					//    without touching /api and the edit above already stands.
					try {
						var write = scope.set(key, value);
						if (write && typeof write.catch === "function") write.catch(function () {});
					} catch (e) { console.error("[lume-appearance] set " + key + " failed", e); }
				},
				dispose: function () {
					if (typeof unsubscribe === "function") unsubscribe();
					try { if (refractObserver) refractObserver.disconnect(); } catch (e) {}
					try { if (refractResize) window.removeEventListener("resize", refractResize); } catch (e) {}
					try { if (refractRO) refractRO.disconnect(); } catch (e) {}
					if (refractTimer) clearTimeout(refractTimer);
					for (var i = 0; i < refractApplied.length; i++) { try { refractApplied[i].style.removeProperty("backdrop-filter"); refractApplied[i].style.removeProperty("-webkit-backdrop-filter"); } catch (e) {} }
					refractApplied = [];
					var el = document.getElementById(STYLE_ID);
					if (el && el.parentNode) el.parentNode.removeChild(el);
					var bg = document.getElementById(BG_ID);
					if (bg && bg.parentNode) bg.parentNode.removeChild(bg);
					var rf = document.getElementById(REFRACT_ID);
					if (rf && rf.parentNode) rf.parentNode.removeChild(rf);
					lastRefractSig = "";
				}
			};
		}
		//#endregion

		//#region image upload (browser-side compress to keep settings small)
		const IMG_MAX_CHARS = 900000;
		function readImageFile(file, done, fail) {
			try {
				var reader = new FileReader();
				reader.onerror = function () { fail && fail("read-failed"); };
				reader.onload = function () {
					var dataUrl = String(reader.result || "");
					if (!/^data:image\//i.test(dataUrl)) { fail && fail("not-image"); return; }
					var img = new Image();
					img.onerror = function () { done && done(dataUrl); };
					img.onload = function () {
						var attempt = 0;
						var steps = [
							{ max: 1920, q: 0.85 },
							{ max: 1600, q: 0.8 },
							{ max: 1280, q: 0.72 },
							{ max: 1024, q: 0.66 },
							{ max: 800, q: 0.6 }
						];
						function run() {
							var step = steps[Math.min(attempt, steps.length - 1)];
							var w = img.naturalWidth || img.width;
							var h = img.naturalHeight || img.height;
							var scale = Math.min(1, step.max / Math.max(w, h));
							var cw = Math.max(1, Math.round(w * scale));
							var ch = Math.max(1, Math.round(h * scale));
							var canvas = document.createElement("canvas");
							canvas.width = cw;
							canvas.height = ch;
							var g = canvas.getContext("2d");
							g.drawImage(img, 0, 0, cw, ch);
							var out = canvas.toDataURL("image/jpeg", step.q);
							if (out.length > IMG_MAX_CHARS && attempt < steps.length - 1) { attempt++; run(); return; }
							done && done(out);
						}
						run();
					};
					img.src = dataUrl;
				};
				reader.readAsDataURL(file);
			} catch (e) {
				fail && fail(String(e));
			}
		}
		//#endregion

		//#region settings section UI
		var CARD_STYLE = {
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: "10px",
			padding: "12px",
			display: "flex",
			flexDirection: "column",
			gap: "10px"
		};
		var GROUP_TITLE_STYLE = {
			fontWeight: 600,
			fontSize: "13px",
			color: "var(--dsw-alias-label-primary)"
		};
		var FIELD_STYLE = {
			display: "flex",
			flexDirection: "column",
			gap: "4px",
			fontSize: "12px",
			color: "var(--dsw-alias-label-secondary)"
		};
		var INPUT_STYLE = {
			height: "28px",
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: "6px",
			padding: "0 8px",
			font: "inherit",
			color: "var(--dsw-alias-label-primary)",
			background: "var(--dsw-alias-bg-layer-3)"
		};
		var FONT_PRESETS = {
			cjk: ["Microsoft YaHei", "PingFang SC", "Source Han Sans SC", "Noto Sans SC", "SimSun", "SimHei", "KaiTi"],
			latin: ["Inter", "Segoe UI", "Roboto", "Arial", "Helvetica Neue", "Georgia", "Times New Roman"],
			code: ["JetBrains Mono", "Fira Code", "Cascadia Code", "Consolas", "SF Mono", "Source Code Pro"]
		};
		var MATERIAL_OPTIONS = [
			{ value: "solid", label: "实心（现状）" },
			{ value: "translucent", label: "半透明（不模糊）" },
			{ value: "glass", label: "液态玻璃（轻度模糊）" }
		];
		function createSection(runtime) {
			var h = React.createElement;
			function colorField(label, value, onChange) {
				return h("label", { style: FIELD_STYLE }, label,
					h("input", {
						type: "color",
						value: value,
						onChange: function (e) { onChange(e.target.value); },
						style: { width: "52px", height: "28px", padding: "0", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: "6px", background: "transparent" }
					}));
			}
			function rangeField(label, value, min, max, onChange) {
				return h("label", { style: FIELD_STYLE }, label + " (" + value + ")",
					h("input", {
						type: "range",
						min: String(min),
						max: String(max),
						value: value,
						onChange: function (e) { onChange(Number(e.target.value)); },
						style: { width: "150px" }
					}));
			}
			function fontField(id, label, value, presets, onChange) {
				return h("div", { style: FIELD_STYLE }, label,
					h("input", {
						list: id,
						value: value,
						placeholder: "系统默认（下拉选择或直接输入）",
						onChange: function (e) { onChange(e.target.value); },
						style: INPUT_STYLE
					}),
					h("datalist", { id: id }, presets.map(function (p) {
						return h("option", { key: p, value: p });
					})));
			}
			function selectField(label, value, options, onChange) {
				return h("label", { style: FIELD_STYLE }, label,
					h("select", {
						value: value,
						onChange: function (e) { onChange(e.target.value); },
						style: INPUT_STYLE
					}, options.map(function (o) { return h("option", { key: o.value, value: o.value }, o.label); })));
			}
			function schemeGroup(title, cfg, suffix, derived) {
				return h("div", { style: CARD_STYLE },
					h("div", { style: GROUP_TITLE_STYLE }, title),
					h("div", { style: { display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "flex-end" } },
						colorField("强调色", cfg["accent" + suffix], function (v) { runtime.set("accent" + suffix, v); }),
						colorField("背景色", cfg["bg" + suffix], function (v) { runtime.set("bg" + suffix, v); }),
						colorField("前景色", cfg["fg" + suffix], function (v) { runtime.set("fg" + suffix, v); }),
						rangeField("对比度", cfg["contrast" + suffix], 0, 100, function (v) { runtime.set("contrast" + suffix, v); })),
					h("div", { style: { display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "flex-end" } },
						colorField("气泡底色", cfg["bubble" + suffix] || derived.bubble, function (v) { runtime.set("bubble" + suffix, v); }),
						colorField("气泡内文字色", cfg["bubbleInk" + suffix] || derived.bubbleInk, function (v) { runtime.set("bubbleInk" + suffix, v); }),
						h("button", {
							type: "button",
							onClick: function () { runtime.set("bubble" + suffix, ""); runtime.set("bubbleInk" + suffix, ""); },
							style: { height: "28px", padding: "0 10px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: "6px", background: "transparent", color: "var(--dsw-alias-label-secondary)", cursor: "pointer", font: "inherit" }
						}, "气泡跟随基色")));
			}
			function imageField(label, value, onPick, onClear) {
				return h("div", { style: FIELD_STYLE }, label + (value ? "（已设，" + Math.round(value.length / 1024) + " KB）" : "（未设）"),
					h("div", { style: { display: "flex", gap: "8px", alignItems: "center" } },
						h("input", {
							type: "file",
							accept: "image/*",
							onChange: function (e) {
								var f = e.target.files && e.target.files[0];
								if (!f) return;
								readImageFile(f, function (url) { onPick(url); }, function (err) { console.error("[lume-appearance] image read failed", err); });
							},
							style: { fontSize: "11px" }
						}),
						h("button", {
							type: "button",
							onClick: onClear,
							style: { height: "24px", padding: "0 8px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: "6px", background: "transparent", color: "var(--dsw-alias-label-secondary)", cursor: "pointer", font: "inherit" }
						}, "清除")),
					value ? h("img", { src: value, alt: "", style: { maxWidth: "160px", maxHeight: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--dsw-alias-border-l2)" } }) : null);
			}
			return function Section() {
				var bumpState = React.useState(0);
				var bump = bumpState[1];
				var statusState = React.useState("");
				var status = statusState[0];
				var setStatus = statusState[1];
				React.useEffect(function () {
					var bumpFn = function () { bump(function (x) { return x + 1; }); };
					// Follow BOTH the host scope (loopback persistence) and the
					// local edit layer (phone / non-loopback immediate edits).
					var unsubScope = runtime.scope.subscribe(bumpFn);
					var unsubLocal = runtime.subscribe(bumpFn);
					return function () {
						if (typeof unsubScope === "function") unsubScope();
						if (typeof unsubLocal === "function") unsubLocal();
					};
				}, []);
				var cfg = runtime.currentConfig();
				var derivedLight = derivedBubble(cfg, false);
				var derivedDark = derivedBubble(cfg, true);
				return h("div", { style: { display: "flex", flexDirection: "column", gap: "16px", padding: "4px 2px" } },
					h("div", { style: { fontSize: "13px", lineHeight: 1.6, color: "var(--dsw-alias-label-tertiary)" } },
						"配色、字体、气泡与背景由本插件接管，修改即时生效并跨端保持；注入优先级高于皮肤中心。"),
					schemeGroup("浅色", cfg, "Light", derivedLight),
					schemeGroup("深色", cfg, "Dark", derivedDark),
					h("div", { style: CARD_STYLE },
						h("div", { style: GROUP_TITLE_STYLE }, "字体"),
						fontField("lume-font-cjk", "中文字体", cfg.cjkFont, FONT_PRESETS.cjk, function (v) { runtime.set("cjkFont", v); }),
						fontField("lume-font-latin", "英数字体", cfg.latinFont, FONT_PRESETS.latin, function (v) { runtime.set("latinFont", v); }),
						fontField("lume-font-code", "代码字体", cfg.codeFont, FONT_PRESETS.code, function (v) { runtime.set("codeFont", v); })),
					h("div", { style: CARD_STYLE },
						h("div", { style: GROUP_TITLE_STYLE }, "背景"),
						h("div", { style: { display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "flex-end" } },
							selectField("类型", cfg.bgKind, [
								{ value: "color", label: "纯色（跟随基色）" },
								{ value: "gradient", label: "渐变" },
								{ value: "image", label: "图片（上传）" }
							], function (v) { runtime.set("bgKind", v); })),
						cfg.bgKind === "gradient" ? h("div", { style: { display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "flex-end" } },
							colorField("起点色", cfg.bgGradFrom, function (v) { runtime.set("bgGradFrom", v); }),
							colorField("终点色", cfg.bgGradTo, function (v) { runtime.set("bgGradTo", v); }),
							rangeField("角度", cfg.bgGradAngle, 0, 360, function (v) { runtime.set("bgGradAngle", v); })) : null,
						cfg.bgKind === "image" ? h("div", { style: { display: "flex", gap: "22px", flexWrap: "wrap" } },
							imageField("浅色图片", cfg.bgImageLight, function (v) { runtime.set("bgImageLight", v); }, function () { runtime.set("bgImageLight", ""); }),
							imageField("深色图片", cfg.bgImageDark, function (v) { runtime.set("bgImageDark", v); }, function () { runtime.set("bgImageDark", ""); })) : null,
						cfg.bgKind !== "color" ? h("div", { style: { display: "flex", gap: "18px", flexWrap: "wrap", alignItems: "flex-end" } },
							rangeField("面板不透明度", cfg.bgSurfaceAlpha, 0, 100, function (v) { runtime.set("bgSurfaceAlpha", v); }),
							rangeField("背景模糊(px)", cfg.bgBlur, 0, 40, function (v) { runtime.set("bgBlur", v); })) : null),
					h("div", { style: CARD_STYLE },
						h("div", { style: GROUP_TITLE_STYLE }, "材质（液态玻璃）"),
						h("div", { style: { fontSize: "12px", lineHeight: 1.5, color: "var(--dsw-alias-label-tertiary)" } },
							"仅作用于用户气泡与发送按钮；轻度、静态，不含悬停 / 按下动效。玻璃透明度调节填充的透明度，玻璃模糊(px)调节透过气泡的背景模糊（默认 5）；边缘折射仅 Chromium 可见，其余引擎自动退化为无折射的模糊玻璃。"),
						h("div", { style: { display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "flex-end" } },
							selectField("用户气泡", cfg.bubbleMaterial, MATERIAL_OPTIONS, function (v) { runtime.set("bubbleMaterial", v); }),
							selectField("发送按钮", cfg.sendMaterial, MATERIAL_OPTIONS, function (v) { runtime.set("sendMaterial", v); }),
							rangeField("玻璃透明度", cfg.glassAlpha, 0, 100, function (v) { runtime.set("glassAlpha", v); }),
							rangeField("玻璃模糊(px)", cfg.glassBlur, 0, 24, function (v) { runtime.set("glassBlur", v); }))),
					h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" } },
						h("div", { style: { fontSize: "12px", lineHeight: 1.5, color: "var(--dsw-alias-label-tertiary)", flex: "1 1 220px" } },
							status || "「一键适配」把当前整份外观写入服务器配置：写入后所有端（含手机）同款。"),
						h("div", { style: { display: "flex", gap: "8px" } },
							h("button", {
								type: "button",
								onClick: function () {
									setStatus("写入中…");
									pushServerConfig(runtime.currentConfig(), setStatus);
								},
								style: {
									height: "30px",
									padding: "0 14px",
									border: "1px solid var(--dsw-alias-button-primary-fill, var(--dsw-alias-border-l2))",
									borderRadius: "6px",
									background: "var(--dsw-alias-button-primary-fill, transparent)",
									color: "var(--dsw-alias-label-primary-foreground, var(--dsw-alias-label-primary))",
									cursor: "pointer",
									font: "inherit"
								}
							}, "一键适配"),
							h("button", {
								type: "button",
								onClick: function () {
									Object.keys(DEFAULTS).forEach(function (k) { runtime.set(k, DEFAULTS[k]); });
								},
								style: {
									height: "30px",
									padding: "0 14px",
									border: "1px solid var(--dsw-alias-border-l2)",
									borderRadius: "6px",
									background: "transparent",
									color: "var(--dsw-alias-label-primary)",
									cursor: "pointer",
									font: "inherit"
								}
							}, "恢复默认"))));
			};
		}
		function derivedBubble(cfg, dark) {
			var accent = hexToRgb(dark ? cfg.accentDark : cfg.accentLight);
			var bg = hexToRgb(dark ? cfg.bgDark : cfg.bgLight);
			var bubble = dark ? toHex(lighten(bg, 0.05)) : toHex(mix(bg, accent, 0.04));
			return {
				bubble: bubble,
				bubbleInk: toHex(inkOf(hexToRgb(bubble)))
			};
		}
		//#endregion

		//#region plugin
		const inject = ["slots", "locale", "theme", "settingsScope"];
		function apply(ctx) {
			var runtime = createRuntime(ctx);
			ctx.effect(function () {
				return function () { runtime.dispose(); };
			}, "lume-appearance: runtime");
			try {
				ctx.slots.inject("settings.section", function () {
					try {
						return ctx.slots.register({
							name: "settings.section",
							id: "lume-appearance",
							order: 130,
							label: "外观",
							inject: function () {
								return {
									slots: ctx.get("slots"),
									locale: ctx.get("locale"),
									theme: ctx.get("theme"),
									settingsScope: runtime.scope
								};
							}
						}, createSection(runtime));
					} catch (e) {
						console.error("[lume-appearance] settings.section register failed", e);
						return function () {};
					}
				});
			} catch (e) {
				console.error("[lume-appearance] settings.section inject failed", e);
			}
		}
		//#endregion

		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

