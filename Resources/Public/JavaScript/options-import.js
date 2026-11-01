import Modal from "@typo3/backend/modal.js";
import { LitElement, html } from "lit";
// \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
// src/FormEditorAdapter.ts
function toElement(editorHtml) {
	return "jquery" in editorHtml ? editorHtml.get(0) : editorHtml;
}
function readChoices(formElement) {
	return {
		options: storedOptions(formElement).map((option) => ({
			label: option._label,
			value: option._value
		})),
		defaultValue: formElement.get("defaultValue")
	};
}
function writeChoices(formElement, { options, defaultValue }) {
	const unusedStoredOptions = [...storedOptions(formElement)];
	formElement.set("properties.options", options.map((option) => {
		const index = unusedStoredOptions.findIndex((stored) => stored._value === option.value && stored._label === option.label);
		if (index === -1) return {
			_label: option.label,
			_value: option.value
		};
		return unusedStoredOptions.splice(index, 1)[0];
	}));
	formElement.set("defaultValue", defaultValue);
}
function storedOptions(formElement) {
	const options = formElement.get("properties.options");
	return Array.isArray(options) ? options : [];
}
/* @license
Papa Parse
v5.7.0
https://github.com/mholt/PapaParse
License: MIT
*/
// src/CsvReader.ts
var import_papaparse_min = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module, this$1) => {
	((e, t) => {
		"function" == typeof define && define.amd ? define([], t) : "object" == typeof module && "undefined" != typeof exports ? module.exports = t() : e.Papa = t();
	})(this$1, function r() {
		var n = "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== n ? n : {};
		var s = !n.document && !!n.postMessage, a = n.IS_PAPA_WORKER || !1, o = {}, h = 0, w = {};
		function q(e) {
			return 65279 === e.charCodeAt(0) ? e.slice(1) : e;
		}
		function u(e) {
			this._handle = null, this._finished = !1, this._completed = !1, this._halted = !1, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = !0, this._completeResults = {
				data: [],
				errors: [],
				meta: {}
			}, function(e) {
				var t = v(e);
				t.chunkSize = parseInt(t.chunkSize), e.step || e.chunk || (t.chunkSize = null);
				this._handle = new i(t), (this._handle.streamer = this)._config = t;
			}.call(this, e), this.parseChunk = function(t, e) {
				var i = parseInt(this._config.skipFirstNLines) || 0;
				if (this.isFirstChunk && 0 < i) {
					let e = this._config.newline;
					e || (r = this._config.quoteChar || "\"", e = this._handle.guessLineEndings(t, r)), t = [...t.split(e).slice(i)].join(e);
				}
				this.isFirstChunk && U(this._config.beforeFirstChunk) && void 0 !== (r = this._config.beforeFirstChunk(t)) && (t = r), this.isFirstChunk = !1, this._halted = !1;
				var i = this._partialLine + t, r = (this._partialLine = "", this._handle.parse(i, this._baseIndex, !this._finished));
				if (!this._handle.paused() && !this._handle.aborted()) {
					t = r.meta.cursor, i = (this._finished || (this._partialLine = i.substring(t - this._baseIndex), this._baseIndex = t), r && r.data && (this._rowCount += r.data.length), this._finished || this._config.preview && this._rowCount >= this._config.preview);
					if (a) n.postMessage({
						results: r,
						workerId: w.WORKER_ID,
						finished: i
					});
					else if (U(this._config.chunk) && !e) {
						if (this._config.chunk(r, this._handle), this._handle.paused() || this._handle.aborted()) return void (this._halted = !0);
						this._completeResults = r = void 0;
					}
					return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(r.data), this._completeResults.errors = this._completeResults.errors.concat(r.errors), this._completeResults.meta = r.meta), this._completed || !i || !U(this._config.complete) || r && r.meta.aborted || (this._config.complete(this._completeResults, this._input), this._completed = !0), i || r && r.meta.paused || this._nextChunk(), r;
				}
				this._halted = !0;
			}, this._sendError = function(e) {
				U(this._config.error) ? this._config.error(e) : a && this._config.error && n.postMessage({
					workerId: w.WORKER_ID,
					error: e,
					finished: !1
				});
			};
		}
		function d(e) {
			var r;
			(e = e || {}).chunkSize || (e.chunkSize = w.RemoteChunkSize), u.call(this, e), this._nextChunk = s ? function() {
				this._readChunk(), this._chunkLoaded();
			} : function() {
				this._readChunk();
			}, this.stream = function(e) {
				this._input = e, this._nextChunk();
			}, this._readChunk = function() {
				if (this._finished) this._chunkLoaded();
				else {
					if (r = new XMLHttpRequest(), this._config.withCredentials && (r.withCredentials = this._config.withCredentials), s || (r.onload = m(this._chunkLoaded, this), r.onerror = m(this._chunkError, this)), r.ontimeout = m(this._chunkTimeout, this), r.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !s), this._config.downloadTimeout && !s && (r.timeout = this._config.downloadTimeout), this._config.downloadRequestHeaders) {
						var e, t = this._config.downloadRequestHeaders;
						for (e in t) r.setRequestHeader(e, t[e]);
					}
					var i;
					this._config.chunkSize && (i = this._start + this._config.chunkSize - 1, r.setRequestHeader("Range", "bytes=" + this._start + "-" + i));
					try {
						r.send(this._config.downloadRequestBody);
					} catch (e) {
						this._chunkError(e.message);
					}
					s && 0 === r.status && this._chunkError();
				}
			}, this._chunkLoaded = function() {
				4 === r.readyState && (r.status < 200 || 400 <= r.status ? this._chunkError() : (this._start += this._config.chunkSize || r.responseText.length, this._finished = !this._config.chunkSize || this._start >= ((e) => null !== (e = e.getResponseHeader("Content-Range")) ? parseInt(e.substring(e.lastIndexOf("/") + 1)) : -1)(r), this.parseChunk(r.responseText)));
			}, this._chunkError = function(e) {
				e = r.statusText || e;
				this._sendError(new Error(e));
			}, this._chunkTimeout = function() {
				this._chunkError("Request timed out after " + this._config.downloadTimeout + "ms");
			};
		}
		function l(e) {
			(e = e || {}).chunkSize || (e.chunkSize = w.LocalChunkSize), u.call(this, e);
			var i, r, n = "undefined" != typeof FileReader;
			this.stream = function(e) {
				this._input = e, r = e.slice || e.webkitSlice || e.mozSlice, n ? ((i = new FileReader()).onload = m(this._chunkLoaded, this), i.onerror = m(this._chunkError, this)) : i = new FileReaderSync(), this._nextChunk();
			}, this._nextChunk = function() {
				this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
			}, this._readChunk = function() {
				var e = this._input, t = (this._config.chunkSize && (t = Math.min(this._start + this._config.chunkSize, this._input.size), e = r.call(e, this._start, t)), i.readAsText(e, this._config.encoding));
				n || this._chunkLoaded({ target: { result: t } });
			}, this._chunkLoaded = function(e) {
				this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(e.target.result);
			}, this._chunkError = function() {
				this._sendError(i.error);
			};
		}
		function f(e) {
			var i;
			u.call(this, e = e || {}), this.stream = function(e) {
				return i = e, this._nextChunk();
			}, this._nextChunk = function() {
				var e, t;
				if (!this._finished) return e = this._config.chunkSize, i = e ? (t = i.substring(0, e), i.substring(e)) : (t = i, ""), this._finished = !i, this.parseChunk(t);
			};
		}
		function c(e) {
			u.call(this, e = e || {});
			var t = [], i = !0, r = !1;
			this.pause = function() {
				u.prototype.pause.apply(this, arguments), this._input.pause();
			}, this.resume = function() {
				u.prototype.resume.apply(this, arguments), this._input.resume();
			}, this.stream = function(e) {
				this._input = e, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
			}, this._checkIsFinished = function() {
				r && 1 === t.length && (this._finished = !0);
			}, this._nextChunk = function() {
				this._checkIsFinished(), t.length ? this.parseChunk(t.shift()) : i = !0;
			}, this._streamData = m(function(e) {
				try {
					t.push("string" == typeof e ? e : e.toString(this._config.encoding)), i && (i = !1, this._checkIsFinished(), this.parseChunk(t.shift()));
				} catch (e) {
					this._streamError(e);
				}
			}, this), this._streamError = m(function(e) {
				this._streamCleanUp(), this._sendError(e);
			}, this), this._streamEnd = m(function() {
				this._streamCleanUp(), r = !0, this._streamData("");
			}, this), this._streamCleanUp = m(function() {
				this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
			}, this);
		}
		function i(m) {
			var n, s, a, t, o = Math.pow(2, 53), h = -o, u = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, d = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, i = this, r = 0, l = 0, f = !1, e = !1, c = [], p = {
				data: [],
				errors: [],
				meta: {}
			};
			function y(e) {
				return "greedy" === m.skipEmptyLines ? "" === e.join("").trim() : 1 === e.length && 0 === e[0].length;
			}
			function _() {
				if (p && a && (k("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + w.DefaultDelimiter + "'"), a = !1), m.skipEmptyLines && (p.data = p.data.filter(function(e) {
					return !y(e);
				})), g()) {
					if (p) if (Array.isArray(p.data[0])) {
						for (var e = 0; g() && e < p.data.length; e++) p.data[e].forEach(t);
						p.data.splice(0, 1);
					} else p.data.forEach(t);
					function t(e) {
						c.push(e);
					}
				}
				function i(e, t) {
					for (var i = m.header ? {} : [], r = 0; r < e.length; r++) {
						var n = r, s = e[r], s = ((e, t) => ((e) => (m.dynamicTypingFunction && void 0 === m.dynamicTyping[e] && (m.dynamicTyping[e] = m.dynamicTypingFunction(e)), !0 === (m.dynamicTyping[e] || m.dynamicTyping)))(e) ? "true" === t || "TRUE" === t || "false" !== t && "FALSE" !== t && (((e) => {
							if (u.test(e)) {
								e = parseFloat(e);
								if (h < e && e < o) return 1;
							}
						})(t) ? parseFloat(t) : d.test(t) ? new Date(t) : "" === t ? null : t) : t)(n = m.header ? r >= c.length ? "__parsed_extra" : c[r] : n, s = m.transform ? m.transform(s, n) : s);
						"__parsed_extra" === n ? (i[n] = i[n] || [], i[n].push(s)) : i[n] = s;
					}
					return m.header && (r > c.length ? k("FieldMismatch", "TooManyFields", "Too many fields: expected " + c.length + " fields but parsed " + r, l + t) : r < c.length && k("FieldMismatch", "TooFewFields", "Too few fields: expected " + c.length + " fields but parsed " + r, l + t)), i;
				}
				var r;
				p && (m.header || m.dynamicTyping || m.transform) && (r = 1, !p.data.length || Array.isArray(p.data[0]) ? (p.data = p.data.map(i), r = p.data.length) : p.data = i(p.data, 0), m.header && p.meta && (p.meta.fields = c), l += r);
			}
			function g() {
				return m.header && 0 === c.length;
			}
			function k(e, t, i, r) {
				e = {
					type: e,
					code: t,
					message: i
				};
				void 0 !== r && (e.row = r), p.errors.push(e);
			}
			U(m.step) && (t = m.step, m.step = function(e) {
				p = e, g() ? _() : (_(), 0 !== p.data.length && (r += e.data.length, m.preview && r > m.preview ? s.abort() : (p.data = p.data[0], t(p, i))));
			}), this.parse = function(e, t, i) {
				var r = m.quoteChar || "\"", r = (m.newline || (m.newline = this.guessLineEndings(e, r)), a = !1, m.delimiter ? U(m.delimiter) && (m.delimiter = m.delimiter(e), p.meta.delimiter = m.delimiter) : ((r = ((e, t, i, r, n) => {
					var s, a, o, h;
					n = n || [
						",",
						"	",
						"|",
						";",
						w.RECORD_SEP,
						w.UNIT_SEP
					];
					for (var u = 0; u < n.length; u++) {
						for (var d, l = n[u], f = 0, c = 0, p = 0, _ = (o = void 0, new E({
							comments: r,
							delimiter: l,
							newline: t,
							preview: 10
						}).parse(e)), g = 0; g < _.data.length; g++) i && y(_.data[g]) ? p++ : (d = _.data[g].length, c += d, void 0 === o ? o = d : 0 < d && (f += Math.abs(d - o), o = d));
						0 < _.data.length && (c /= _.data.length - p), 1.99 < c && (void 0 === a || f < a || f === a && h < c) && (a = f, s = l, h = c);
					}
					return {
						successful: !!(m.delimiter = s),
						bestDelimiter: s
					};
				})(e, m.newline, m.skipEmptyLines, m.comments, m.delimitersToGuess)).successful ? m.delimiter = r.bestDelimiter : (a = !0, m.delimiter = w.DefaultDelimiter), p.meta.delimiter = m.delimiter), v(m));
				return r.header = g(), m.preview && m.header && r.preview++, n = e, s = new E(r), p = s.parse(n, t, i), _(), f ? { meta: { paused: !0 } } : p || { meta: { paused: !1 } };
			}, this.paused = function() {
				return f;
			}, this.pause = function() {
				f = !0, s.abort(), n = U(m.chunk) ? "" : n.substring(s.getCharIndex());
			}, this.resume = function() {
				i.streamer._halted ? (f = !1, i.streamer.parseChunk(n, !0)) : setTimeout(i.resume, 3);
			}, this.aborted = function() {
				return e;
			}, this.abort = function() {
				e = !0, s.abort(), p.meta.aborted = !0, U(m.complete) && m.complete(p), n = "";
			}, this.guessLineEndings = function(e, t) {
				e = e.substring(0, 1048576);
				var t = new RegExp(P(t) + "([^]*?)" + P(t), "gm"), i = (e = e.replace(t, "")).split("\r"), t = e.split("\n"), e = 1 < t.length && t[0].length < i[0].length;
				if (1 === i.length || e) return "\n";
				for (var r = 0, n = 0; n < i.length; n++) "\n" === i[n][0] && r++;
				return r >= i.length / 2 ? "\r\n" : "\r";
			};
		}
		function P(e) {
			return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function E(C) {
			var S = (C = C || {}).delimiter, O = C.newline, x = C.comments, T = C.step, I = C.preview, A = C.fastMode, D = null, L = !1, F = null == C.quoteChar ? "\"" : C.quoteChar, z = F;
			if (void 0 !== C.escapeChar && (z = C.escapeChar), ("string" != typeof S || -1 < w.BAD_DELIMITERS.indexOf(S)) && (S = ","), x === S) throw new Error("Comment character same as delimiter");
			!0 === x ? x = "#" : ("string" != typeof x || -1 < w.BAD_DELIMITERS.indexOf(x)) && (x = !1), "\n" !== O && "\r" !== O && "\r\n" !== O && (O = "\n");
			var M = 0, j = !1;
			this.parse = function(i, t, r) {
				if ("string" != typeof i) throw new Error("Input must be a string");
				var n = i.length, e = S.length, s = O.length, a = x.length, o = U(T), h = [], u = [], d = [], l = M = 0;
				if (!i) return b();
				if (A || !1 !== A && -1 === i.indexOf(F)) {
					for (var f = i.split(O), c = 0; c < f.length; c++) {
						if (d = f[c], M += d.length, c !== f.length - 1) M += O.length;
						else if (r) return b();
						if (!x || d.substring(0, a) !== x) {
							if (o) {
								if (h = [], k(d.split(S)), R(), j) return b();
							} else k(d.split(S));
							if (I && I <= c) return h = h.slice(0, I), b(!0);
						}
					}
					return b();
				}
				for (var p = i.indexOf(S, M), _ = i.indexOf(O, M), g = new RegExp(P(z) + P(F), "g"), m = i.indexOf(F, M);;) if (i[M] === F) for (m = M, M++;;) {
					if (-1 === (m = i.indexOf(F, m + 1))) return r || u.push({
						type: "Quotes",
						code: "MissingQuotes",
						message: "Quoted field unterminated",
						row: h.length,
						index: M
					}), E();
					if (m === n - 1) return E(i.substring(M, m).replace(g, F));
					if (F === z && i[m + 1] === z) m++;
					else if (F === z || 0 === m || i[m - 1] !== z) {
						-1 !== p && p < m + 1 && (p = i.indexOf(S, m + 1));
						var y = w(-1 === (_ = -1 !== _ && _ < m + 1 ? i.indexOf(O, m + 1) : _) ? p : Math.min(p, _));
						if (i.substr(m + 1 + y, e) === S) {
							d.push(i.substring(M, m).replace(g, F)), i[M = m + 1 + y + e] !== F && (m = i.indexOf(F, M)), p = i.indexOf(S, M), _ = i.indexOf(O, M);
							break;
						}
						y = w(_);
						if (i.substring(m + 1 + y, m + 1 + y + s) === O) {
							if (d.push(i.substring(M, m).replace(g, F)), v(m + 1 + y + s), p = i.indexOf(S, M), m = i.indexOf(F, M), o && (R(), j)) return b();
							if (I && h.length >= I) return b(!0);
							break;
						}
						u.push({
							type: "Quotes",
							code: "InvalidQuotes",
							message: "Trailing quote on quoted field is malformed",
							row: h.length,
							index: M
						}), m++;
					}
				}
				else if (x && 0 === d.length && i.substring(M, M + a) === x) {
					if (-1 === _) return b();
					M = _ + s, _ = i.indexOf(O, M), p = i.indexOf(S, M);
				} else if (-1 !== p && (p < _ || -1 === _)) d.push(i.substring(M, p)), M = p + e, p = i.indexOf(S, M);
				else {
					if (-1 === _) break;
					if (d.push(i.substring(M, _)), v(_ + s), o && (R(), j)) return b();
					if (I && h.length >= I) return b(!0);
				}
				return E();
				function k(e) {
					h.push(e), l = M;
				}
				function w(e) {
					var t = 0;
					return t = -1 !== e && (e = i.substring(m + 1, e)) && "" === e.trim() ? e.length : t;
				}
				function E(e) {
					return r || (void 0 === e && (e = i.substring(M)), d.push(e), M = n, k(d), o && R()), b();
				}
				function v(e) {
					M = e, k(d), d = [], _ = i.indexOf(O, M);
				}
				function b(e) {
					if (C.header && !t && h.length && !L) {
						var s = h[0], a = Object.create(null), o = new Set(s);
						let n = !1;
						for (let r = 0; r < s.length; r++) {
							let i = q(s[r]);
							if (a[i = U(C.transformHeader) ? C.transformHeader(i, r) : i]) {
								let e, t = a[i];
								for (; e = i + "_" + t, t++, o.has(e););
								o.add(e), s[r] = e, a[i]++, n = !0, (D = null === D ? {} : D)[e] = i;
							} else a[i] = 1, s[r] = i;
							o.add(i);
						}
						n && console.warn("Duplicate headers found and renamed."), L = !0;
					}
					return {
						data: h,
						errors: u,
						meta: {
							delimiter: S,
							linebreak: O,
							aborted: j,
							truncated: !!e,
							cursor: l + (t || 0),
							renamedHeaders: D
						}
					};
				}
				function R() {
					T(b()), h = [], u = [];
				}
			}, this.abort = function() {
				j = !0;
			}, this.getCharIndex = function() {
				return M;
			};
		}
		function p(e) {
			var t = e.data, i = o[t.workerId], r = !1;
			if (t.error) i.userError(t.error, t.file);
			else if (t.results && t.results.data) {
				var n = {
					abort: function() {
						r = !0, _(t.workerId, {
							data: [],
							errors: [],
							meta: { aborted: !0 }
						});
					},
					pause: g,
					resume: g
				};
				if (U(i.userStep)) {
					for (var s = 0; s < t.results.data.length && (i.userStep({
						data: t.results.data[s],
						errors: t.results.errors,
						meta: t.results.meta
					}, n), !r); s++);
					delete t.results;
				} else U(i.userChunk) && (i.userChunk(t.results, n, t.file), delete t.results);
			}
			t.finished && !r && _(t.workerId, t.results);
		}
		function _(e, t) {
			var i = o[e];
			U(i.userComplete) && i.userComplete(t), i.terminate(), delete o[e];
		}
		function g() {
			throw new Error("Not implemented.");
		}
		function v(e) {
			if ("object" != typeof e || null === e) return e;
			var t, i = Array.isArray(e) ? [] : {};
			for (t in e) i[t] = v(e[t]);
			return i;
		}
		function m(e, t) {
			return function() {
				e.apply(t, arguments);
			};
		}
		function U(e) {
			return "function" == typeof e;
		}
		return w.parse = function(e, t) {
			var i = (t = t || {}).dynamicTyping || !1;
			U(i) && (t.dynamicTypingFunction = i, i = {});
			if (t.dynamicTyping = i, t.transform = !!U(t.transform) && t.transform, void 0 !== t.downloadTimeout) {
				var i = parseInt(t.downloadTimeout);
				if (isNaN(i)) throw new Error("Config downloadTimeout value (" + t.downloadTimeout + ") not parsable by parseInt(val).");
				t.downloadTimeout = i;
			}
			if (!t.worker || !w.WORKERS_SUPPORTED) return i = null, w.NODE_STREAM_INPUT, "string" == typeof e ? (e = q(e), i = new (t.download ? d : f)(t)) : !0 === e.readable && U(e.read) && U(e.on) ? i = new c(t) : (n.File && e instanceof File || e instanceof Object) && (i = new l(t)), i.stream(e);
			(i = (() => {
				var e;
				return !!w.WORKERS_SUPPORTED && (e = (() => {
					var e = n.URL || n.webkitURL || null, t = r.toString();
					return w.BLOB_URL || (w.BLOB_URL = e.createObjectURL(new Blob([
						"var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ",
						"(",
						t,
						")();"
					], { type: "text/javascript" })));
				})(), (e = new n.Worker(e)).onmessage = p, e.id = h++, o[e.id] = e);
			})()).userStep = t.step, i.userChunk = t.chunk, i.userComplete = t.complete, i.userError = t.error, t.step = U(t.step), t.chunk = U(t.chunk), t.complete = U(t.complete), t.error = U(t.error), delete t.worker, i.postMessage({
				input: e,
				config: t,
				workerId: i.id
			});
		}, w.unparse = function(e, t) {
			var s = !1, g = !0, m = ",", y = "\r\n", a = "\"", o = a + a, i = !1, r = null, h = !1, u = ((() => {
				if ("object" == typeof t) {
					if ("string" != typeof t.delimiter || w.BAD_DELIMITERS.filter(function(e) {
						return -1 !== t.delimiter.indexOf(e);
					}).length || (m = t.delimiter), "boolean" != typeof t.quotes && "function" != typeof t.quotes && !Array.isArray(t.quotes) || (s = t.quotes), "boolean" != typeof t.skipEmptyLines && "string" != typeof t.skipEmptyLines || (i = t.skipEmptyLines), "string" == typeof t.newline && (y = t.newline), "string" == typeof t.quoteChar && (a = t.quoteChar, o = a + a), "boolean" == typeof t.header && (g = t.header), Array.isArray(t.columns)) {
						if (0 === t.columns.length) throw new Error("Option columns is empty");
						r = t.columns;
					}
					void 0 !== t.escapeChar && (o = t.escapeChar + a), t.escapeFormulae instanceof RegExp ? h = t.escapeFormulae : "boolean" == typeof t.escapeFormulae && t.escapeFormulae && (h = /^[=+\-@\t\r].*$/);
				}
			})(), new RegExp(P(a), "g"));
			"string" == typeof e && (e = JSON.parse(e));
			if (Array.isArray(e)) {
				if (!e.length || Array.isArray(e[0])) return n(null, e, i);
				if ("object" == typeof e[0]) return n(r || Object.keys(e[0]), e, i);
			} else if ("object" == typeof e) return "string" == typeof e.data && (e.data = JSON.parse(e.data)), Array.isArray(e.data) && (e.fields || (e.fields = e.meta && e.meta.fields || r), e.fields || (e.fields = Array.isArray(e.data[0]) ? e.fields : "object" == typeof e.data[0] ? Object.keys(e.data[0]) : []), Array.isArray(e.data[0]) || "object" == typeof e.data[0] || (e.data = [e.data])), n(e.fields || [], e.data || [], i);
			throw new Error("Unable to serialize unrecognized input");
			function n(e, t, i) {
				var r = "", n = ("string" == typeof e && (e = JSON.parse(e)), "string" == typeof t && (t = JSON.parse(t)), Array.isArray(e) && 0 < e.length), s = !Array.isArray(t[0]);
				if (n && g) {
					for (var a = 0; a < e.length; a++) 0 < a && (r += m), r += k(e[a], a);
					0 < t.length && (r += y);
				}
				for (var o = 0; o < t.length; o++) {
					var h = (n ? e : t[o]).length, u = !1, d = n ? 0 === Object.keys(t[o]).length : 0 === t[o].length;
					if (i && !n && (u = "greedy" === i ? "" === t[o].join("").trim() : 1 === t[o].length && 0 === t[o][0].length), "greedy" === i && n) {
						for (var l = [], f = 0; f < h; f++) {
							var c = s ? e[f] : f;
							l.push(t[o][c]);
						}
						u = "" === l.join("").trim();
					}
					if (!u) {
						for (var p = 0; p < h; p++) {
							0 < p && !d && (r += m);
							var _ = n && s ? e[p] : p;
							r += k(t[o][_], p);
						}
						o < t.length - 1 && (!i || 0 < h && !d) && (r += y);
					}
				}
				return r;
			}
			function k(e, t) {
				var i, r, n;
				return null == e ? "" : e.constructor === Date ? isNaN(e.getTime()) ? "" : e.toISOString() : (n = !1, h && "string" == typeof e && h.test(e) && (e = "'" + e, n = !0), r = (i = e.toString()).replace(u, o), (n = n || !0 === s || "function" == typeof s && s(e, t) || Array.isArray(s) && s[t] || ((e, t) => {
					for (var i = 0; i < t.length; i++) if (-1 < e.indexOf(t[i])) return !0;
					return !1;
				})(r, w.BAD_DELIMITERS) || -1 < r.indexOf(m) || -1 < i.indexOf(a) || " " === r.charAt(0) || " " === r.charAt(r.length - 1)) ? a + r + a : r);
			}
		}, w.RECORD_SEP = String.fromCharCode(30), w.UNIT_SEP = String.fromCharCode(31), w.BYTE_ORDER_MARK = "﻿", w.BAD_DELIMITERS = [
			"\r",
			"\n",
			"\"",
			w.BYTE_ORDER_MARK
		], w.WORKERS_SUPPORTED = !s && !!n.Worker, w.NODE_STREAM_INPUT = 1, w.LocalChunkSize = 10485760, w.RemoteChunkSize = 5242880, w.DefaultDelimiter = ",", w.Parser = E, w.ParserHandle = i, w.NetworkStreamer = d, w.FileStreamer = l, w.StringStreamer = f, w.ReadableStreamStreamer = c, a && (n.onmessage = function(e) {
			e = e.data;
			void 0 === w.WORKER_ID && e && (w.WORKER_ID = e.workerId);
			"string" == typeof e.input ? n.postMessage({
				workerId: w.WORKER_ID,
				results: w.parse(e.input, e.config),
				finished: !0
			}) : (n.File && e.input instanceof File || e.input instanceof Object) && (e = w.parse(e.input, e.config)) && n.postMessage({
				workerId: w.WORKER_ID,
				results: e,
				finished: !0
			});
		}), (d.prototype = Object.create(u.prototype)).constructor = d, (l.prototype = Object.create(u.prototype)).constructor = l, (f.prototype = Object.create(f.prototype)).constructor = f, (c.prototype = Object.create(u.prototype)).constructor = c, w;
	});
})))(), 1);
var maxRows = 5e3;
function parseRows(text, { source, hasHeader }) {
	if (text.length > 5e6) return {
		rows: [],
		error: { reason: "tooLarge" }
	};
	const normalizedText = text.replace(/\r\n?/g, "\n");
	const separator = source === "file" ? detectFileSeparator(normalizedText) : detectPasteSeparator(normalizedText);
	const records = [];
	let error = null;
	readRecords(normalizedText, separator, (fields, quoteErrorIndex) => {
		if (quoteErrorIndex !== null) {
			error = {
				reason: "unclosedQuote",
				line: lineAt(normalizedText, quoteErrorIndex)
			};
			return false;
		}
		if (isFilled(fields)) records.push(fields);
		if (records.length > 5e3) {
			error = {
				reason: "tooManyRows",
				limit: maxRows
			};
			return false;
		}
		return true;
	});
	if (error) return {
		rows: [],
		error
	};
	return {
		rows: records.map((fields, index) => hasHeader && index === 0 ? {
			...toRow(fields),
			skipReason: "header"
		} : toRow(fields)),
		error: null
	};
}
function readRecords(text, separator, onRecord) {
	import_papaparse_min.default.parse(text, {
		delimiter: separator,
		newline: "\n",
		step: (result, parser) => {
			const quoteError = result.errors.find((error) => error.code === "MissingQuotes" || error.code === "InvalidQuotes");
			if (!onRecord(result.data, quoteError ? quoteError.index ?? 0 : null)) parser.abort();
		}
	});
}
function detectPasteSeparator(text) {
	let hasTabs = false;
	readRecords(text, "	", (fields) => {
		hasTabs = fields.length > 1;
		return !hasTabs;
	});
	return hasTabs ? "	" : ";";
}
function detectFileSeparator(text) {
	const separatorCount = (candidate) => {
		let count = 0;
		readRecords(text, candidate, (fields) => {
			if (!isFilled(fields)) return true;
			count = fields.length - 1;
			return false;
		});
		return count;
	};
	const counts = new Map([
		"	",
		";",
		","
	].map((candidate) => [candidate, separatorCount(candidate)]));
	return [...counts.keys()].reduce((best, candidate) => (counts.get(candidate) ?? 0) > (counts.get(best) ?? 0) ? candidate : best);
}
function isFilled(fields) {
	return fields.join("").replace(/[\s;,]/g, "") !== "";
}
function toRow(fields) {
	const [label, value = "", isDefault = ""] = fields.slice(0, 3).map(joinLines);
	const row = {
		label,
		value: toValue(value === "" ? label : value),
		isDefault: isDefault.trim() !== "" && isDefault.trim() !== "0"
	};
	return label.trim() === "" ? {
		...row,
		skipReason: "noLabel"
	} : row;
}
function joinLines(field) {
	if (!field.includes("\n")) return field;
	const lines = field.split("\n");
	const lastIndex = lines.length - 1;
	return lines.map((line, index) => index === 0 ? line : line.trimStart()).map((line, index) => index === lastIndex ? line : line.trimEnd()).filter((line, index) => index === 0 || index === lastIndex || line !== "").join(" ");
}
function toValue(value) {
	return /^(0|-?[1-9][0-9]*)$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : value;
}
function lineAt(text, index) {
	return 1 + (text.slice(0, index).match(/\n/g) ?? []).length;
}
var textExtensions = [
	"csv",
	"tsv",
	"txt"
];
var spreadsheetExtensions = [
	"xlsx",
	"xls",
	"ods",
	"numbers"
];
function fileProblem(file) {
	const typeProblem = fileTypeProblem(file);
	if (typeProblem) return typeProblem;
	return file.size > 5242880 ? "tooLarge" : null;
}
function fileTypeProblem(file) {
	const extension = file.name.includes(".") ? (file.name.split(".").pop() ?? "").toLowerCase() : "";
	if (textExtensions.includes(extension)) return null;
	if (spreadsheetExtensions.includes(extension)) return "spreadsheetFile";
	if (extension === "" && (file.type === "" || file.type.startsWith("text/"))) return null;
	return "unsupportedFile";
}
// src/FileDecoder.ts
function decodeFile(bytes) {
	const data = new Uint8Array(bytes);
	if (data[0] === 255 && data[1] === 254) return new TextDecoder("utf-16le").decode(data);
	if (data[0] === 254 && data[1] === 255) return new TextDecoder("utf-16be").decode(data);
	try {
		return new TextDecoder("utf-8", { fatal: true }).decode(data);
	} catch {
		return new TextDecoder("windows-1252").decode(data);
	}
}
// src/ImportPlanner.ts
function planImport(rows, existing, { replace, singleValue }) {
	const plan = planOptions(rows, existing, replace);
	const optionValues = valueSet(plan.options);
	const keptDefaults = currentDefaults(existing.defaultValue).filter((value) => optionValues.has(String(value)));
	const markedRows = plan.preview.filter((row) => !row.skipReason && row.isDefault);
	if (singleValue) {
		const [firstMarked, ...laterMarked] = markedRows;
		const laterMarkedRows = new Set(laterMarked);
		return {
			...plan,
			preview: plan.preview.map((row) => laterMarkedRows.has(row) ? {
				...row,
				note: "onlyOneDefault"
			} : row),
			defaultValue: firstMarked?.value ?? keptDefaults[0] ?? ""
		};
	}
	const markedValues = markedRows.map((row) => row.value);
	return {
		...plan,
		defaultValue: replace && markedValues.length > 0 ? markedValues : [...keptDefaults, ...markedValues]
	};
}
function planOptions(rows, existing, replace) {
	const keptOptions = replace ? [] : existing.options;
	const existingValues = valueSet(keptOptions);
	const pastedValues = /* @__PURE__ */ new Set();
	const skipReasonFor = (row) => {
		if (row.skipReason) return row.skipReason;
		if (existingValues.has(String(row.value))) return "valueExists";
		if (pastedValues.has(String(row.value))) return "valueRepeated";
		return null;
	};
	const preview = rows.map((row) => {
		const skipReason = skipReasonFor(row);
		if (skipReason) return {
			...row,
			skipReason
		};
		pastedValues.add(String(row.value));
		return row;
	});
	const imported = preview.filter((row) => !row.skipReason).map(({ label, value }) => ({
		label,
		value
	}));
	return {
		options: [...keptOptions, ...imported],
		preview,
		importedCount: imported.length
	};
}
function currentDefaults(defaultValue) {
	return [defaultValue ?? []].flat().filter((value) => typeof value === "string" || typeof value === "number");
}
function valueSet(options) {
	return new Set(options.map((option) => String(option.value)));
}
// src/ImportSettings.ts
var settingsKey = "form-options-csv:settings";
function loadHasHeader() {
	try {
		const settings = JSON.parse(localStorage.getItem(settingsKey) ?? "{}");
		return typeof settings === "object" && settings !== null && "hasHeader" in settings && settings.hasHeader === true;
	} catch {
		return false;
	}
}
function saveHasHeader(hasHeader) {
	try {
		localStorage.setItem(settingsKey, JSON.stringify({ hasHeader }));
	} catch {}
}
// src/OptionsImportElement.ts
var applyEvent = "options-import-apply";
var cancelEvent = "options-import-cancel";
var OptionsImportElement = class extends LitElement {
	static properties = {
		labels: { attribute: false },
		existing: { attribute: false },
		singleValue: { attribute: false },
		text: { state: true },
		source: { state: true },
		fileProblem: { state: true },
		hasHeader: { state: true },
		replace: { state: true }
	};
	fileReadCount = 0;
	parsedRows = null;
	constructor() {
		super();
		this.source = "paste";
		this.fileProblem = null;
		this.hasHeader = loadHasHeader();
		this.replace = false;
		this.addEventListener("dragover", (event) => event.preventDefault());
		this.addEventListener("drop", (event) => this.handleDrop(event));
	}
	createRenderRoot() {
		return this;
	}
	render() {
		const { plan, error } = this.parse();
		const importedCount = plan?.importedCount ?? 0;
		return html`
      <style>
        .form-options-csv-drop-area { border: 2px dashed currentColor; border-radius: .5rem; padding: 2rem 1rem; margin-bottom: 1rem; text-align: center; cursor: pointer; opacity: .85; }
        .form-options-csv-drop-area:hover, .form-options-csv-drop-area:focus-visible { opacity: 1; }
        .form-options-csv-preview { max-height: 45vh; overflow-y: auto; margin-bottom: 1rem; }
      </style>
      <div class="form-options-csv-drop-area" tabindex="0" role="button" @click=${this.chooseFile} @keydown=${this.handleDropAreaKey}>${this.labels.dropArea}</div>
      <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" hidden @change=${this.handleFileChange}>
      ${this.fileProblem ? html`<div class="alert alert-warning" role="alert">${this.labels[this.fileProblem]}</div>` : ""}
      ${this.renderSwitch("form-options-csv-header", this.labels.hasHeader, this.hasHeader, (checked) => this.changeHeader(checked))}
      ${this.renderSwitch("form-options-csv-replace", this.labels.replace, this.replace, (checked) => {
			this.replace = checked;
		})}
      ${error ? html`<div class="alert alert-danger" role="alert">${this.errorMessage(error)}</div>` : ""}
      ${plan ? this.renderPreview(plan) : ""}
      <div class="d-flex justify-content-end gap-2" aria-live="polite">
        <button type="button" class="btn btn-default" @click=${this.cancel}>${this.labels.cancel}</button>
        <button type="button" class="btn btn-primary" ?disabled=${plan === null || importedCount === 0} @click=${() => plan && this.apply(plan)}>${this.applyLabel(importedCount)}</button>
      </div>
    `;
	}
	handlePaste(event) {
		event.preventDefault();
		this.fileReadCount++;
		this.useInput({
			text: event.clipboardData?.getData("text/plain") ?? "",
			source: "paste"
		});
	}
	parse() {
		if (this.text === void 0) return {
			plan: null,
			error: null
		};
		const { rows, error } = this.cachedParseRows(this.text);
		if (error) return {
			plan: null,
			error
		};
		return {
			plan: planImport(rows, this.existing, {
				replace: this.replace,
				singleValue: this.singleValue
			}),
			error: null
		};
	}
	cachedParseRows(text) {
		const key = `${this.source}|${this.hasHeader}`;
		if (this.parsedRows?.key !== key || this.parsedRows.text !== text) this.parsedRows = {
			key,
			text,
			result: parseRows(text, {
				source: this.source,
				hasHeader: this.hasHeader
			})
		};
		return this.parsedRows.result;
	}
	errorMessage(error) {
		switch (error.reason) {
			case "unclosedQuote": return this.labels.unclosedQuote.replace("%d", String(error.line));
			case "tooManyRows": return this.labels.tooManyRows.replace("%d", String(error.limit));
			case "tooLarge": return this.labels.tooLarge;
		}
	}
	chooseFile(event) {
		event.preventDefault();
		this.querySelector("input[type=\"file\"]")?.click();
	}
	handleDropAreaKey(event) {
		if ((event.key === "Enter" || event.key === " ") && !event.repeat) this.chooseFile(event);
	}
	handleFileChange(event) {
		const input = event.target;
		this.readFile(input.files?.[0]);
		input.value = "";
	}
	renderSwitch(id, label, checked, onChange) {
		return html`
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id=${id} .checked=${checked} @change=${(event) => onChange(event.target.checked)}>
        <label class="form-check-label" for=${id}>${label}</label>
      </div>
    `;
	}
	changeHeader(checked) {
		this.hasHeader = checked;
		saveHasHeader(checked);
	}
	renderPreview(plan) {
		return html`
      <div class="form-options-csv-preview">
        <table class="table table-sm">
          <thead><tr><th>${this.labels.columnLabel}</th><th>${this.labels.columnValue}</th><th>${this.labels.columnDefault}</th><th>${this.labels.columnNote}</th></tr></thead>
          <tbody>
            ${plan.preview.map((row) => this.renderRow(row))}
          </tbody>
        </table>
      </div>
    `;
	}
	renderRow(row) {
		const message = row.skipReason ?? row.note;
		const isMarkedDefault = row.isDefault && !row.skipReason && !row.note;
		return html`
      <tr class=${row.skipReason ? "text-body-secondary" : ""}>
        <td>${row.label}</td>
        <td>${row.value}</td>
        <td>${isMarkedDefault ? html`<span title=${this.labels.columnDefault}>✔</span>` : ""}</td>
        <td>${message ? this.labels[message] : ""}</td>
      </tr>
    `;
	}
	cancel() {
		this.dispatchEvent(new CustomEvent(cancelEvent));
	}
	applyLabel(importedCount) {
		const [one, many] = this.replace ? [this.labels.replaceOne, this.labels.replaceMany] : [this.labels.addOne, this.labels.addMany];
		return importedCount === 1 ? one : many.replace("%d", String(importedCount));
	}
	apply(plan) {
		this.dispatchEvent(new CustomEvent(applyEvent, { detail: plan }));
	}
	handleDrop(event) {
		event.preventDefault();
		this.readFile(event.dataTransfer?.files[0]);
	}
	async readFile(file) {
		if (!file) return;
		const readNumber = ++this.fileReadCount;
		const problem = fileProblem(file);
		if (problem) {
			this.useInput({ fileProblem: problem });
			return;
		}
		try {
			const text = decodeFile(await file.arrayBuffer());
			if (readNumber === this.fileReadCount) this.useInput({
				text,
				source: "file"
			});
		} catch {
			if (readNumber === this.fileReadCount) this.useInput({ fileProblem: "unsupportedFile" });
		}
	}
	useInput({ text, source = "paste", fileProblem = null }) {
		this.text = text;
		this.source = source;
		this.fileProblem = fileProblem;
	}
};
if (!customElements.get("form-options-csv-import")) customElements.define("form-options-csv-import", OptionsImportElement);
// src/OptionsImportEditor.ts
var singleValueTypes = ["SingleSelect", "RadioButton"];
function bootstrap(formEditorApp) {
	formEditorApp.getPublisherSubscriber().subscribe("view/inspector/editor/insert/perform", (_topic, [editorConfiguration, editorHtml]) => {
		if (editorConfiguration.templateName !== "Inspector-OptionsImportEditor") return;
		const button = toElement(editorHtml).querySelector("button");
		if (!button) return;
		button.textContent = editorConfiguration.label;
		button.addEventListener("click", () => openModal(formEditorApp, editorConfiguration));
	});
}
function openModal(formEditorApp, editorConfiguration) {
	if (!editorConfiguration.labels) return;
	const formElement = formEditorApp.getCurrentlySelectedFormElement();
	const importElement = new OptionsImportElement();
	importElement.labels = editorConfiguration.labels;
	importElement.existing = readChoices(formElement);
	importElement.singleValue = singleValueTypes.includes(String(formElement.get("type")));
	const modal = Modal.advanced({
		title: editorConfiguration.label,
		content: importElement,
		size: Modal.sizes.large
	});
	modal.addEventListener("typo3-modal-shown", () => {
		modal.ownerDocument.defaultView?.focus();
		importElement.querySelector(".form-options-csv-drop-area")?.focus();
	});
	modal.addEventListener("paste", (event) => importElement.handlePaste(event));
	importElement.addEventListener(cancelEvent, () => modal.hideModal());
	importElement.addEventListener(applyEvent, (event) => {
		applyPlan(formEditorApp, event.detail);
		modal.hideModal();
	}, { once: true });
}
function applyPlan(formEditorApp, plan) {
	formEditorApp.saveApplicationState();
	writeChoices(formEditorApp.getRepository().findFormElement(formEditorApp.getCurrentlySelectedFormElement()), plan);
	formEditorApp.getViewModel().renderInspectorEditors();
	formEditorApp.getViewModel().renderUndoRedo();
}
export { bootstrap };
