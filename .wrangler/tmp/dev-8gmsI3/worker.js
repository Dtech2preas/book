(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // .wrangler/tmp/bundle-BF6s9P/checked-fetch.js
  var require_checked_fetch = __commonJS({
    ".wrangler/tmp/bundle-BF6s9P/checked-fetch.js"() {
      var urls = /* @__PURE__ */ new Set();
      function checkURL(request, init) {
        const url = request instanceof URL ? request : new URL(
          (typeof request === "string" ? new Request(request, init) : request).url
        );
        if (url.port && url.port !== "443" && url.protocol === "https:") {
          if (!urls.has(url.toString())) {
            urls.add(url.toString());
            console.warn(
              `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
            );
          }
        }
      }
      __name(checkURL, "checkURL");
      globalThis.fetch = new Proxy(globalThis.fetch, {
        apply(target, thisArg, argArray) {
          const [request, init] = argArray;
          checkURL(request, init);
          return Reflect.apply(target, thisArg, argArray);
        }
      });
    }
  });

  // wrangler-modules-watch:wrangler:modules-watch
  var import_checked_fetch, import_middleware_insertion_facade;
  var init_wrangler_modules_watch = __esm({
    "wrangler-modules-watch:wrangler:modules-watch"() {
      import_checked_fetch = __toESM(require_checked_fetch());
      import_middleware_insertion_facade = __toESM(require_middleware_insertion_facade());
      init_modules_watch_stub();
    }
  });

  // ../home/jules/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/modules-watch-stub.js
  var init_modules_watch_stub = __esm({
    "../home/jules/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/modules-watch-stub.js"() {
      init_wrangler_modules_watch();
    }
  });

  // ../home/jules/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
  function __facade_register__(...args) {
    __facade_middleware__.push(...args.flat());
  }
  function __facade_registerInternal__(...args) {
    __facade_middleware__.unshift(...args.flat());
  }
  function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
    const [head, ...tail] = middlewareChain;
    const middlewareCtx = {
      dispatch,
      next(newRequest, newEnv) {
        return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
      }
    };
    return head(request, env, ctx, middlewareCtx);
  }
  function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
    return __facade_invokeChain__(request, env, ctx, dispatch, [
      ...__facade_middleware__,
      finalMiddleware
    ]);
  }
  var import_checked_fetch2, import_middleware_insertion_facade2, __facade_middleware__;
  var init_common = __esm({
    "../home/jules/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts"() {
      import_checked_fetch2 = __toESM(require_checked_fetch());
      import_middleware_insertion_facade2 = __toESM(require_middleware_insertion_facade());
      init_modules_watch_stub();
      __facade_middleware__ = [];
      __name(__facade_register__, "__facade_register__");
      __name(__facade_registerInternal__, "__facade_registerInternal__");
      __name(__facade_invokeChain__, "__facade_invokeChain__");
      __name(__facade_invoke__, "__facade_invoke__");
    }
  });

  // ../home/jules/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/loader-sw.ts
  function __facade_isSpecialEvent__(type) {
    return type === "fetch" || type === "scheduled";
  }
  var import_checked_fetch3, import_middleware_insertion_facade3, __FACADE_EVENT_TARGET__, __facade__originalAddEventListener__, __facade__originalRemoveEventListener__, __facade__originalDispatchEvent__, __facade_waitUntil__, __facade_response__, __facade_dispatched__, __Facade_ExtendableEvent__, __Facade_FetchEvent__, __Facade_ScheduledEvent__;
  var init_loader_sw = __esm({
    "../home/jules/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/loader-sw.ts"() {
      import_checked_fetch3 = __toESM(require_checked_fetch());
      import_middleware_insertion_facade3 = __toESM(require_middleware_insertion_facade());
      init_modules_watch_stub();
      init_common();
      if (globalThis.MINIFLARE) {
        __FACADE_EVENT_TARGET__ = new (Object.getPrototypeOf(WorkerGlobalScope))();
      } else {
        __FACADE_EVENT_TARGET__ = new EventTarget();
      }
      __name(__facade_isSpecialEvent__, "__facade_isSpecialEvent__");
      __facade__originalAddEventListener__ = globalThis.addEventListener;
      __facade__originalRemoveEventListener__ = globalThis.removeEventListener;
      __facade__originalDispatchEvent__ = globalThis.dispatchEvent;
      globalThis.addEventListener = function(type, listener, options) {
        if (__facade_isSpecialEvent__(type)) {
          __FACADE_EVENT_TARGET__.addEventListener(
            type,
            listener,
            options
          );
        } else {
          __facade__originalAddEventListener__(type, listener, options);
        }
      };
      globalThis.removeEventListener = function(type, listener, options) {
        if (__facade_isSpecialEvent__(type)) {
          __FACADE_EVENT_TARGET__.removeEventListener(
            type,
            listener,
            options
          );
        } else {
          __facade__originalRemoveEventListener__(type, listener, options);
        }
      };
      globalThis.dispatchEvent = function(event) {
        if (__facade_isSpecialEvent__(event.type)) {
          return __FACADE_EVENT_TARGET__.dispatchEvent(event);
        } else {
          return __facade__originalDispatchEvent__(event);
        }
      };
      globalThis.addMiddleware = __facade_register__;
      globalThis.addMiddlewareInternal = __facade_registerInternal__;
      __facade_waitUntil__ = /* @__PURE__ */ Symbol("__facade_waitUntil__");
      __facade_response__ = /* @__PURE__ */ Symbol("__facade_response__");
      __facade_dispatched__ = /* @__PURE__ */ Symbol("__facade_dispatched__");
      __Facade_ExtendableEvent__ = class ___Facade_ExtendableEvent__ extends Event {
        static {
          __name(this, "__Facade_ExtendableEvent__");
        }
        [__facade_waitUntil__] = [];
        waitUntil(promise) {
          if (!(this instanceof ___Facade_ExtendableEvent__)) {
            throw new TypeError("Illegal invocation");
          }
          this[__facade_waitUntil__].push(promise);
        }
      };
      __Facade_FetchEvent__ = class ___Facade_FetchEvent__ extends __Facade_ExtendableEvent__ {
        static {
          __name(this, "__Facade_FetchEvent__");
        }
        #request;
        #passThroughOnException;
        [__facade_response__];
        [__facade_dispatched__] = false;
        constructor(type, init) {
          super(type);
          this.#request = init.request;
          this.#passThroughOnException = init.passThroughOnException;
        }
        get request() {
          return this.#request;
        }
        respondWith(response) {
          if (!(this instanceof ___Facade_FetchEvent__)) {
            throw new TypeError("Illegal invocation");
          }
          if (this[__facade_response__] !== void 0) {
            throw new DOMException(
              "FetchEvent.respondWith() has already been called; it can only be called once.",
              "InvalidStateError"
            );
          }
          if (this[__facade_dispatched__]) {
            throw new DOMException(
              "Too late to call FetchEvent.respondWith(). It must be called synchronously in the event handler.",
              "InvalidStateError"
            );
          }
          this.stopImmediatePropagation();
          this[__facade_response__] = response;
        }
        passThroughOnException() {
          if (!(this instanceof ___Facade_FetchEvent__)) {
            throw new TypeError("Illegal invocation");
          }
          this.#passThroughOnException();
        }
      };
      __Facade_ScheduledEvent__ = class ___Facade_ScheduledEvent__ extends __Facade_ExtendableEvent__ {
        static {
          __name(this, "__Facade_ScheduledEvent__");
        }
        #scheduledTime;
        #cron;
        #noRetry;
        constructor(type, init) {
          super(type);
          this.#scheduledTime = init.scheduledTime;
          this.#cron = init.cron;
          this.#noRetry = init.noRetry;
        }
        get scheduledTime() {
          return this.#scheduledTime;
        }
        get cron() {
          return this.#cron;
        }
        noRetry() {
          if (!(this instanceof ___Facade_ScheduledEvent__)) {
            throw new TypeError("Illegal invocation");
          }
          this.#noRetry();
        }
      };
      __facade__originalAddEventListener__("fetch", (event) => {
        const ctx = {
          waitUntil: event.waitUntil.bind(event),
          passThroughOnException: event.passThroughOnException.bind(event)
        };
        const __facade_sw_dispatch__ = /* @__PURE__ */ __name(function(type, init) {
          if (type === "scheduled") {
            const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
              scheduledTime: Date.now(),
              cron: init.cron ?? "",
              noRetry() {
              }
            });
            __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
            event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
          }
        }, "__facade_sw_dispatch__");
        const __facade_sw_fetch__ = /* @__PURE__ */ __name(function(request, _env, ctx2) {
          const facadeEvent = new __Facade_FetchEvent__("fetch", {
            request,
            passThroughOnException: ctx2.passThroughOnException
          });
          __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
          facadeEvent[__facade_dispatched__] = true;
          event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
          const response = facadeEvent[__facade_response__];
          if (response === void 0) {
            throw new Error("No response!");
          }
          return response;
        }, "__facade_sw_fetch__");
        event.respondWith(
          __facade_invoke__(
            event.request,
            globalThis,
            ctx,
            __facade_sw_dispatch__,
            __facade_sw_fetch__
          )
        );
      });
      __facade__originalAddEventListener__("scheduled", (event) => {
        const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
          scheduledTime: event.scheduledTime,
          cron: event.cron,
          noRetry: event.noRetry.bind(event)
        });
        __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
        event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      });
    }
  });

  // ../home/jules/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
  var import_checked_fetch4, import_middleware_insertion_facade4, drainBody, middleware_ensure_req_body_drained_default;
  var init_middleware_ensure_req_body_drained = __esm({
    "../home/jules/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts"() {
      import_checked_fetch4 = __toESM(require_checked_fetch());
      import_middleware_insertion_facade4 = __toESM(require_middleware_insertion_facade());
      init_modules_watch_stub();
      drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
        try {
          return await middlewareCtx.next(request, env);
        } finally {
          try {
            if (request.body !== null && !request.bodyUsed) {
              const reader = request.body.getReader();
              while (!(await reader.read()).done) {
              }
            }
          } catch (e) {
            console.error("Failed to drain the unused request body.", e);
          }
        }
      }, "drainBody");
      middleware_ensure_req_body_drained_default = drainBody;
    }
  });

  // ../home/jules/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
  function reduceError(e) {
    return {
      name: e?.name,
      message: e?.message ?? String(e),
      stack: e?.stack,
      cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
    };
  }
  var import_checked_fetch5, import_middleware_insertion_facade5, jsonError, middleware_miniflare3_json_error_default;
  var init_middleware_miniflare3_json_error = __esm({
    "../home/jules/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts"() {
      import_checked_fetch5 = __toESM(require_checked_fetch());
      import_middleware_insertion_facade5 = __toESM(require_middleware_insertion_facade());
      init_modules_watch_stub();
      __name(reduceError, "reduceError");
      jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
        try {
          return await middlewareCtx.next(request, env);
        } catch (e) {
          const error = reduceError(e);
          const body = JSON.stringify(error);
          const headers = {
            "Content-Type": "application/json",
            "MF-Experimental-Error-Stack": "true"
          };
          const encoded = encodeURIComponent(body);
          if (encoded.length <= 8192) {
            headers["MF-Experimental-Error-Stack-Payload"] = encoded;
          }
          return new Response(body, { status: 500, headers });
        }
      }, "jsonError");
      middleware_miniflare3_json_error_default = jsonError;
    }
  });

  // .wrangler/tmp/bundle-BF6s9P/middleware-insertion-facade.js
  var require_middleware_insertion_facade = __commonJS({
    ".wrangler/tmp/bundle-BF6s9P/middleware-insertion-facade.js"() {
      init_loader_sw();
      init_middleware_ensure_req_body_drained();
      init_middleware_miniflare3_json_error();
      __facade_registerInternal__([middleware_ensure_req_body_drained_default, middleware_miniflare3_json_error_default]);
    }
  });

  // worker.js
  var require_worker = __commonJS({
    "worker.js"() {
      var import_checked_fetch6 = __toESM(require_checked_fetch());
      var import_middleware_insertion_facade6 = __toESM(require_middleware_insertion_facade());
      init_modules_watch_stub();
      addEventListener("fetch", (event) => {
        event.respondWith(handleRequest(event.request, event));
      });
      async function handleRequest(request, event) {
        const url = new URL(request.url);
        if (request.method === "OPTIONS") {
          return new Response(null, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              // Allow any origin
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password, X-Seller-Code, Authorization"
            }
          });
        }
        const headers = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password, X-Seller-Code, Authorization",
          "Content-Type": "application/json"
        };
        const generateSellerCode = /* @__PURE__ */ __name(() => {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          let result = "";
          for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        }, "generateSellerCode");
        if (request.method === "GET") {
          try {
            if (url.pathname === "/admin/ambassadors") {
              const password = request.headers.get("X-Admin-Password");
              if (password !== (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "dtech_x24-2020")) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const list2 = await BOOKS_KV.list({ prefix: "amb:" });
              const ambassadors = [];
              for (const key of list2.keys) {
                const val = await BOOKS_KV.get(key.name, { type: "json" });
                if (val) {
                  const statKey = "amb_stats:" + val.id;
                  const stats = await BOOKS_KV.get(statKey, { type: "json" }) || { installs: 0, views: 0, listings: 0, purchases: 0 };
                  const { password: _, ...safeData } = val;
                  ambassadors.push({ ...safeData, stats });
                }
              }
              const keysList = await BOOKS_KV.list({ prefix: "ambassador_key:" });
              const activeKeys = keysList.keys.map((k) => k.name.split(":")[1]);
              return new Response(JSON.stringify({ ambassadors, activeKeys }), { headers });
            }
            if (url.pathname === "/ambassador/stats") {
              const authHeader = request.headers.get("Authorization");
              if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const token = authHeader.split(" ")[1];
              let ambId;
              try {
                const decoded = atob(token);
                const lastColonIndex = decoded.lastIndexOf(":");
                ambId = decoded.substring(0, lastColonIndex);
              } catch (e) {
                return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers });
              }
              const statKey = "amb_stats:" + ambId;
              const stats = await BOOKS_KV.get(statKey, { type: "json" }) || { installs: 0, views: 0, listings: 0, purchases: 0 };
              return new Response(JSON.stringify({ success: true, stats }), { headers });
            }
            if (url.pathname === "/image") {
              const id2 = url.searchParams.get("id");
              if (!id2) {
                return new Response("Missing ID", { status: 400 });
              }
              const book = await BOOKS_KV.get(id2, { type: "json" });
              if (!book || !book.image) {
                return new Response("Image not found", { status: 404 });
              }
              const matches = book.image.match(/^data:(.+);base64,(.+)$/);
              if (!matches || matches.length !== 3) {
                return new Response("Invalid image data", { status: 500 });
              }
              const mimeType = matches[1];
              const base64Data = matches[2];
              const binaryString = atob(base64Data);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              return new Response(bytes.buffer, {
                headers: {
                  "Content-Type": mimeType,
                  "Cache-Control": "public, max-age=31536000",
                  // Cache for 1 year
                  "Access-Control-Allow-Origin": "*"
                }
              });
            }
            if (url.pathname === "/sellers") {
              const password = request.headers.get("X-Admin-Password");
              if (password !== (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin-secret-123")) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const sellers = await BOOKS_KV.get("system:sellers", { type: "json" });
              return new Response(JSON.stringify(sellers || {}), { headers });
            }
            const id = url.searchParams.get("id");
            if (id) {
              const book = await BOOKS_KV.get(id, { type: "json" });
              if (!book) {
                return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers });
              }
              return new Response(JSON.stringify({ id, ...book }), { headers });
            }
            if (url.pathname === "/admin/register-fcm-token" && request.method === "POST") {
              const password = request.headers.get("X-Admin-Password");
              if (password !== (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin-secret-123")) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const body = await request.json();
              if (body.token) {
                const tokensStr = await BOOKS_KV.get("system:fcm_tokens");
                let tokens = tokensStr ? JSON.parse(tokensStr) : [];
                if (!tokens.includes(body.token)) {
                  tokens.push(body.token);
                  await BOOKS_KV.put("system:fcm_tokens", JSON.stringify(tokens));
                }
                return new Response(JSON.stringify({ success: true }), { headers });
              }
              return new Response(JSON.stringify({ error: "No token provided" }), { status: 400, headers });
            }
            if (url.pathname === "/admin/books") {
              const password = request.headers.get("X-Admin-Password");
              if (password !== (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin-secret-123")) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const list2 = await BOOKS_KV.list({ prefix: "book:" });
              const books2 = await Promise.all(list2.keys.map(async (key) => {
                const value = await BOOKS_KV.get(key.name, { type: "json" });
                if (!value) return null;
                const { image, sellerCode, ...lightweightBook } = value;
                return { id: key.name, ...lightweightBook, sellerCode };
              }));
              return new Response(JSON.stringify(books2.filter((b) => b !== null)), { headers });
            }
            if (url.pathname === "/admin/reports") {
              const password = request.headers.get("X-Admin-Password");
              if (password !== (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin-secret-123")) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const list2 = await BOOKS_KV.list({ prefix: "report:" });
              const reports = await Promise.all(list2.keys.map(async (key) => {
                const value = await BOOKS_KV.get(key.name, { type: "json" });
                if (!value) return null;
                return { id: key.name, ...value };
              }));
              return new Response(JSON.stringify(reports.filter((r) => r !== null)), { headers });
            }
            if (url.pathname === "/stats") {
              const list2 = await BOOKS_KV.list({ prefix: "book:" });
              let booksCount = 0;
              let pendingCount = 0;
              let activeCount = 0;
              const vals = await Promise.all(list2.keys.map((key) => BOOKS_KV.get(key.name, { type: "json" })));
              for (const val of vals) {
                if (val) {
                  booksCount++;
                  if (val.status === "pending") pendingCount++;
                  else if (val.status === "active" || !val.status) activeCount++;
                }
              }
              const sellersMap = await BOOKS_KV.get("system:sellers", { type: "json" });
              const sellersCount = sellersMap ? Object.keys(sellersMap).length : 0;
              const stats = await BOOKS_KV.get("system:stats", { type: "json" });
              const soldCount = stats ? stats.sold || 0 : 0;
              let visitorsCount = 0;
              const currentUrl = url.hostname;
              const targetUrl = url.searchParams.get("url") || currentUrl;
              try {
                const extRes = await fetch(`https://late-salad-779e.lefa4082.workers.dev/?url=${encodeURIComponent(targetUrl)}`);
                if (extRes.ok) {
                  const extData = await extRes.json();
                  visitorsCount = parseInt(extData.site_views) || 0;
                }
              } catch (e) {
                console.error("External counter fetch failed", e);
              }
              let dailyStats = await BOOKS_KV.get("system:daily_stats", { type: "json" });
              if (!dailyStats) dailyStats = {};
              const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
              const launchDate = "2026-02-20";
              if (!dailyStats[today]) {
                dailyStats[today] = { visitors: 0, sold: 0, sellers: 0 };
              }
              if (!dailyStats[launchDate]) {
                dailyStats[launchDate] = { visitors: 0, sold: 0, sellers: 0 };
              }
              const lastTotalVisitors = stats && stats.lastTotalVisitors ? stats.lastTotalVisitors : 0;
              let statsUpdated = false;
              if (visitorsCount > lastTotalVisitors) {
                if (lastTotalVisitors === 0) {
                  dailyStats[launchDate].visitors += visitorsCount;
                } else {
                  const diff = visitorsCount - lastTotalVisitors;
                  dailyStats[today].visitors += diff;
                }
                let newStats = stats || {};
                newStats.lastTotalVisitors = visitorsCount;
                await BOOKS_KV.put("system:stats", JSON.stringify(newStats));
                statsUpdated = true;
              }
              let sumSold = 0;
              let sumSellers = 0;
              let sumVisitors = 0;
              for (const date in dailyStats) {
                sumSold += dailyStats[date].sold || 0;
                sumSellers += dailyStats[date].sellers || 0;
                sumVisitors += dailyStats[date].visitors || 0;
              }
              if (soldCount > sumSold) {
                dailyStats[launchDate].sold += soldCount - sumSold;
                statsUpdated = true;
              }
              if (sellersCount > sumSellers) {
                dailyStats[launchDate].sellers += sellersCount - sumSellers;
                statsUpdated = true;
              }
              if (visitorsCount > sumVisitors) {
                dailyStats[launchDate].visitors += visitorsCount - sumVisitors;
                statsUpdated = true;
              }
              if (statsUpdated) {
                await BOOKS_KV.put("system:daily_stats", JSON.stringify(dailyStats));
              }
              return new Response(JSON.stringify({
                booksListed: booksCount,
                pendingCount,
                activeCount,
                sellersCount,
                sold: soldCount,
                visitors: visitorsCount,
                dailyStats
              }), { headers });
            }
            const list = await BOOKS_KV.list({ prefix: "book:" });
            const books = await Promise.all(list.keys.map(async (key) => {
              const value = await BOOKS_KV.get(key.name, { type: "json" });
              if (!value) return null;
              const { image, sellerCode, ...lightweightBook } = value;
              return { id: key.name, ...lightweightBook };
            }));
            const validBooks = books.filter((b) => b !== null && (b.status === "active" || b.status === void 0));
            return new Response(JSON.stringify(validBooks), { headers });
          } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
          }
        }
        if (request.method === "POST") {
          try {
            const url2 = new URL(request.url);
            if (url2.pathname === "/ambassador/register") {
              const body2 = await request.json();
              const { approvalKey, name, email, password } = body2;
              if (!approvalKey || !name || !email || !password) {
                return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
              }
              const keyDataStr = await BOOKS_KV.get("ambassador_key:" + approvalKey);
              if (!keyDataStr) {
                return new Response(JSON.stringify({ error: "Invalid or expired approval key" }), { status: 400, headers });
              }
              const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();
              const ambassadorId = "amb:" + shortCode;
              const ambassadorData = {
                id: ambassadorId,
                name,
                email,
                password,
                // Simple for now, ideally hashed
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              };
              await BOOKS_KV.put(ambassadorId, JSON.stringify(ambassadorData));
              await BOOKS_KV.delete("ambassador_key:" + approvalKey);
              return new Response(JSON.stringify({ success: true }), { headers });
            }
            if (url2.pathname === "/ambassador/login") {
              const body2 = await request.json();
              const { email, password } = body2;
              if (!email || !password) {
                return new Response(JSON.stringify({ error: "Missing email or password" }), { status: 400, headers });
              }
              const list = await BOOKS_KV.list({ prefix: "amb:" });
              let found = null;
              for (const key of list.keys) {
                const val = await BOOKS_KV.get(key.name, { type: "json" });
                if (val && val.email === email && val.password === password) {
                  found = val;
                  break;
                }
              }
              if (!found) {
                return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401, headers });
              }
              const token = btoa(found.id + ":" + Date.now());
              const { password: _, ...safeData } = found;
              return new Response(JSON.stringify({ token, ambassador: safeData }), { headers });
            }
            if (url2.pathname === "/admin/ambassador/keys") {
              const adminPass = request.headers.get("X-Admin-Password");
              if (adminPass !== (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin-secret-123")) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const key = Math.random().toString(36).substring(2, 10).toUpperCase();
              await BOOKS_KV.put("ambassador_key:" + key, JSON.stringify({ createdAt: Date.now() }), { expirationTtl: 86400 });
              return new Response(JSON.stringify({ success: true, key }), { headers });
            }
            if (url2.pathname === "/track") {
              const body2 = await request.json();
              const { ref, event: trackEvent } = body2;
              if (ref && trackEvent) {
                const shortCode = ref.replace(/amb:/i, "");
                const statKey = "amb_stats:amb:" + shortCode;
                if (trackEvent === "install" || trackEvent === "view") {
                  event.waitUntil(
                    fetch(`https://api.counterapi.dev/v1/dtech_ambassadors/${shortCode}_${trackEvent}s/up/`).catch((e) => console.error("External counter failed", e))
                  );
                }
              }
              return new Response(JSON.stringify({ success: true }), { headers });
            }
            if (url2.pathname === "/extract-text") {
              const body2 = await request.json();
              const base64Image = body2.image;
              if (!base64Image) {
                return new Response(JSON.stringify({ error: "Missing image" }), { status: 400, headers });
              }
              let tokens = [];
              if (typeof GROQ_TOKENS !== "undefined") {
                tokens = GROQ_TOKENS.split("\n").map((t) => t.trim()).filter((t) => t.length > 0);
              }
              if (tokens.length === 0) {
                return new Response(JSON.stringify({ error: "No Groq API tokens configured" }), { status: 500, headers });
              }
              const shuffledTokens = tokens.sort(() => 0.5 - Math.random());
              let groqResponse = null;
              let success = false;
              let lastError = null;
              const systemPrompt = `You are a helpful assistant that extracts book information from images. Return ONLY a valid JSON object with the following keys and string values: "title" (the book name), "author" (author name, if any), "editors" (editors, if any), "version" (book version or edition, if any), and "additional_info" (any other useful info found on the cover). If a piece of information is not found, leave the value as an empty string. Do not include markdown formatting like \`\`\`json.`;
              for (const token of shuffledTokens) {
                try {
                  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      model: "llama-3.2-90b-vision-preview",
                      messages: [
                        {
                          role: "user",
                          content: [
                            { type: "text", text: systemPrompt },
                            { type: "image_url", image_url: { url: base64Image } }
                          ]
                        }
                      ],
                      temperature: 0.1,
                      max_tokens: 500,
                      top_p: 1,
                      stream: false
                    })
                  });
                  if (response.ok) {
                    const data = await response.json();
                    let content = data.choices[0].message.content;
                    content = content.replace(/^```json/m, "").replace(/```$/m, "").trim();
                    groqResponse = JSON.parse(content);
                    success = true;
                    break;
                  } else {
                    const errorText = await response.text();
                    lastError = `Groq API Error: ${response.status} ${errorText}`;
                    console.error(lastError);
                  }
                } catch (err) {
                  lastError = err.message;
                  console.error(lastError);
                }
              }
              if (success && groqResponse) {
                return new Response(JSON.stringify({ success: true, data: groqResponse }), { headers });
              } else {
                return new Response(JSON.stringify({ error: "Failed to extract text from all available tokens. " + lastError }), { status: 500, headers });
              }
            }
            if (url2.pathname === "/admin/migrate") {
              const password = request.headers.get("X-Admin-Password");
              if (password !== (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin-secret-123")) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const list = await BOOKS_KV.list({ prefix: "book:" });
              const books = [];
              for (const key of list.keys) {
                const b = await BOOKS_KV.get(key.name, { type: "json" });
                if (b) books.push({ id: key.name, ...b });
              }
              const sellersMap2 = {};
              for (const book of books) {
                const contact2 = book.contact ? book.contact.replace(/\D/g, "") : "UNKNOWN";
                if (!sellersMap2[contact2]) {
                  sellersMap2[contact2] = {
                    code: generateSellerCode(),
                    name: book.seller,
                    contact: contact2,
                    count: 0
                  };
                }
                sellersMap2[contact2].count++;
                book.sellerCode = sellersMap2[contact2].code;
              }
              await BOOKS_KV.put("system:sellers", JSON.stringify(sellersMap2));
              for (const book of books) {
                const { id: id2, ...data } = book;
                await BOOKS_KV.put(id2, JSON.stringify(data));
              }
              return new Response(JSON.stringify({ success: true, message: `Migrated ${books.length} books.`, sellers: sellersMap2 }), { headers });
            }
            if (url2.pathname === "/seller/login") {
              const body2 = await request.json();
              const code2 = body2.code;
              if (!code2 || code2.length !== 4) {
                return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400, headers });
              }
              const list = await BOOKS_KV.list({ prefix: "book:" });
              const sellerBooks = [];
              for (const key of list.keys) {
                const val = await BOOKS_KV.get(key.name, { type: "json" });
                if (val && val.sellerCode === code2) {
                  const { image, ...light } = val;
                  sellerBooks.push({ id: key.name, ...light });
                }
              }
              return new Response(JSON.stringify(sellerBooks), { headers });
            }
            if (url2.pathname === "/report") {
              const body2 = await request.json();
              const { bookId, reporterName, reporterPhone, reason } = body2;
              if (!bookId || !reporterName || !reporterPhone || !reason) {
                return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
              }
              const reportId = `report:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
              const reportData = {
                bookId,
                reporterName,
                reporterPhone,
                reason,
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              };
              await BOOKS_KV.put(reportId, JSON.stringify(reportData));
              event.waitUntil(sendFCMNotification("New Report", "A listing has been reported and requires review."));
              return new Response(JSON.stringify({ success: true, message: "Report submitted" }), { headers });
            }
            const body = await request.json();
            const isLookingFor = body.type === "looking_for";
            if (!body.title || !isLookingFor && !body.author || !body.price || !isLookingFor && !body.image) {
              return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
            }
            const contact = body.contact ? body.contact.replace(/\D/g, "") : "UNKNOWN";
            let sellersMap = await BOOKS_KV.get("system:sellers", { type: "json" });
            if (!sellersMap) sellersMap = {};
            let code;
            let isNewSeller = false;
            if (sellersMap[contact]) {
              code = sellersMap[contact].code;
              sellersMap[contact].count++;
              sellersMap[contact].name = body.seller;
            } else {
              code = generateSellerCode();
              isNewSeller = true;
              sellersMap[contact] = {
                code,
                name: body.seller,
                contact,
                count: 1
              };
            }
            await BOOKS_KV.put("system:sellers", JSON.stringify(sellersMap));
            if (isNewSeller) {
              let dailyStats = await BOOKS_KV.get("system:daily_stats", { type: "json" });
              if (!dailyStats) dailyStats = {};
              const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
              if (!dailyStats[today]) dailyStats[today] = { visitors: 0, sold: 0, sellers: 0 };
              dailyStats[today].sellers += 1;
              await BOOKS_KV.put("system:daily_stats", JSON.stringify(dailyStats));
            }
            const id = `book:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const bookData = {
              type: body.type || "buy",
              editors: body.editors || "",
              version: body.version || "",
              isNegotiable: !!body.isNegotiable,
              title: body.title,
              author: body.author || "Not provided",
              price: body.price,
              seller: body.seller || "Anonymous",
              contact: body.contact || "",
              description: body.description || "",
              campuses: body.campuses || [],
              image: body.image || "",
              // Base64 string
              createdAt: (/* @__PURE__ */ new Date()).toISOString(),
              sellerCode: code,
              // Assign Code
              status: "pending"
            };
            if (body.ref) {
              const statKey = "amb_stats:amb:" + body.ref.replace(/amb:/i, "");
              let stats = await BOOKS_KV.get(statKey, { type: "json" }) || { installs: 0, views: 0, listings: 0, purchases: 0 };
              stats.listings++;
              await BOOKS_KV.put(statKey, JSON.stringify(stats));
              bookData.ref = body.ref;
            }
            await BOOKS_KV.put(id, JSON.stringify(bookData));
            event.waitUntil(sendFCMNotification("New Book Upload", body.title + " requires approval."));
            event.waitUntil(fetch("https://formsubmit.co/dtech2j@gmail.com", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: "There's a website update on " + (request.headers.get("Origin") || "the website")
              })
            }).catch((e) => console.error("FormSubmit Error:", e)));
            return new Response(JSON.stringify({ success: true, id, message: "Book added successfully", code }), { headers });
          } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
          }
        }
        if (request.method === "DELETE") {
          try {
            if (url.pathname === "/admin/reports") {
              const password = request.headers.get("X-Admin-Password");
              if (password !== (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin-secret-123")) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const id2 = url.searchParams.get("id");
              if (!id2) {
                return new Response(JSON.stringify({ error: "Missing report ID" }), { status: 400, headers });
              }
              await BOOKS_KV.delete(id2);
              return new Response(JSON.stringify({ success: true, message: "Report dismissed" }), { headers });
            }
            if (url.pathname === "/seller/account") {
              const sellerCodeHeader2 = request.headers.get("X-Seller-Code");
              if (!sellerCodeHeader2 || sellerCodeHeader2.length !== 4) {
                return new Response(JSON.stringify({ error: "Invalid or missing seller code" }), { status: 401, headers });
              }
              const list = await BOOKS_KV.list({ prefix: "book:" });
              let deletedCount = 0;
              for (const key of list.keys) {
                const val = await BOOKS_KV.get(key.name, { type: "json" });
                if (val && val.sellerCode === sellerCodeHeader2) {
                  await BOOKS_KV.delete(key.name);
                  deletedCount++;
                }
              }
              let sellersMap = await BOOKS_KV.get("system:sellers", { type: "json" });
              if (sellersMap) {
                let updated = false;
                for (const [contact, data] of Object.entries(sellersMap)) {
                  if (data.code === sellerCodeHeader2) {
                    delete sellersMap[contact];
                    updated = true;
                    break;
                  }
                }
                if (updated) {
                  await BOOKS_KV.put("system:sellers", JSON.stringify(sellersMap));
                }
              }
              return new Response(JSON.stringify({ success: true, message: `Account deleted. Removed ${deletedCount} listings.` }), { headers });
            }
            const id = url.searchParams.get("id");
            if (!id) {
              return new Response(JSON.stringify({ error: "Missing book ID" }), { status: 400, headers });
            }
            const adminPassword = request.headers.get("X-Admin-Password");
            const sellerCodeHeader = request.headers.get("X-Seller-Code");
            let authorized = false;
            if (adminPassword === (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin-secret-123")) {
              authorized = true;
            } else if (sellerCodeHeader) {
              const book = await BOOKS_KV.get(id, { type: "json" });
              if (!book) {
                return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers });
              }
              if (book.sellerCode === sellerCodeHeader) {
                authorized = true;
              }
            }
            if (!authorized) {
              return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
            }
            const bookToDel = await BOOKS_KV.get(id, { type: "json" });
            if (bookToDel && bookToDel.ref) {
              const statKey = "amb_stats:amb:" + bookToDel.ref.replace(/amb:/i, "");
              let ambStats = await BOOKS_KV.get(statKey, { type: "json" }) || { installs: 0, views: 0, listings: 0, purchases: 0 };
              ambStats.purchases++;
              await BOOKS_KV.put(statKey, JSON.stringify(ambStats));
            }
            await BOOKS_KV.delete(id);
            const stats = await BOOKS_KV.get("system:stats", { type: "json" }) || { sold: 0 };
            stats.sold = (stats.sold || 0) + 1;
            await BOOKS_KV.put("system:stats", JSON.stringify(stats));
            let dailyStats = await BOOKS_KV.get("system:daily_stats", { type: "json" });
            if (!dailyStats) dailyStats = {};
            const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
            if (!dailyStats[today]) dailyStats[today] = { visitors: 0, sold: 0, sellers: 0 };
            dailyStats[today].sold += 1;
            await BOOKS_KV.put("system:daily_stats", JSON.stringify(dailyStats));
            return new Response(JSON.stringify({ success: true, message: "Book deleted" }), { headers });
          } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
          }
        }
        if (request.method === "PUT") {
          try {
            const url2 = new URL(request.url);
            if (url2.pathname === "/admin/approve") {
              const password2 = request.headers.get("X-Admin-Password");
              if (password2 !== (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin-secret-123")) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const id2 = url2.searchParams.get("id");
              if (!id2) {
                return new Response(JSON.stringify({ error: "Missing book ID" }), { status: 400, headers });
              }
              const existing2 = await BOOKS_KV.get(id2, { type: "json" });
              if (!existing2) {
                return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers });
              }
              existing2.status = "active";
              await BOOKS_KV.put(id2, JSON.stringify(existing2));
              return new Response(JSON.stringify({ success: true, message: "Book approved" }), { headers });
            }
            if (url2.pathname === "/update-campuses") {
              const id2 = url2.searchParams.get("id");
              if (!id2) {
                return new Response(JSON.stringify({ error: "Missing book ID" }), { status: 400, headers });
              }
              const sellerCodeHeader = request.headers.get("X-Seller-Code");
              if (!sellerCodeHeader) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const existing2 = await BOOKS_KV.get(id2, { type: "json" });
              if (!existing2) {
                return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers });
              }
              if (existing2.sellerCode !== sellerCodeHeader) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
              }
              const body2 = await request.json();
              existing2.campuses = body2.campuses || [];
              await BOOKS_KV.put(id2, JSON.stringify(existing2));
              return new Response(JSON.stringify({ success: true, message: "Campuses updated successfully" }), { headers });
            }
            const password = request.headers.get("X-Admin-Password");
            if (password !== (typeof ADMIN_PASSWORD !== "undefined" ? ADMIN_PASSWORD : "admin-secret-123")) {
              return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
            }
            const id = url2.searchParams.get("id");
            if (!id) {
              return new Response(JSON.stringify({ error: "Missing book ID" }), { status: 400, headers });
            }
            const body = await request.json();
            const isLookingFor = body.type === "looking_for";
            if (!body.title || !isLookingFor && !body.author || !body.price || !isLookingFor && !body.image) {
              return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
            }
            const existing = await BOOKS_KV.get(id, { type: "json" });
            if (!existing) {
              return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers });
            }
            const contact = body.contact ? body.contact.replace(/\D/g, "") : "UNKNOWN";
            let code = existing.sellerCode;
            if (contact !== (existing.contact ? existing.contact.replace(/\D/g, "") : "UNKNOWN") || !code) {
              let sellersMap = await BOOKS_KV.get("system:sellers", { type: "json" });
              if (!sellersMap) sellersMap = {};
              if (sellersMap[contact]) {
                code = sellersMap[contact].code;
              } else {
                code = generateSellerCode();
                sellersMap[contact] = {
                  code,
                  name: body.seller,
                  contact,
                  count: 1
                };
                await BOOKS_KV.put("system:sellers", JSON.stringify(sellersMap));
              }
            }
            const bookData = {
              type: body.type || existing.type || "buy",
              editors: body.editors !== void 0 ? body.editors : existing.editors || "",
              version: body.version !== void 0 ? body.version : existing.version || "",
              isNegotiable: body.isNegotiable !== void 0 ? !!body.isNegotiable : !!existing.isNegotiable,
              title: body.title,
              author: body.author || existing.author || "Not provided",
              price: body.price,
              seller: body.seller || existing.seller,
              contact: body.contact || existing.contact,
              description: body.description || existing.description || "",
              campuses: body.campuses !== void 0 ? body.campuses : existing.campuses || [],
              image: body.image || existing.image || "",
              createdAt: existing.createdAt,
              sellerCode: code,
              ref: existing.ref
            };
            await BOOKS_KV.put(id, JSON.stringify(bookData));
            return new Response(JSON.stringify({ success: true, message: "Book updated successfully" }), { headers });
          } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
          }
        }
        return new Response("Not Found", { status: 404, headers });
      }
      __name(handleRequest, "handleRequest");
      async function sendFCMNotification(title, body) {
        try {
          if (typeof FCM_SERVICE_ACCOUNT_JSON === "undefined") {
            console.error("FCM_SERVICE_ACCOUNT_JSON not defined in environment");
            return;
          }
          if (!FCM_SERVICE_ACCOUNT_JSON) {
            console.error("FCM_SERVICE_ACCOUNT_JSON not configured in environment");
            return;
          }
          const tokensStr = await BOOKS_KV.get("system:fcm_tokens");
          if (!tokensStr) return;
          const tokens = JSON.parse(tokensStr);
          if (!tokens || tokens.length === 0) return;
          const serviceAccount = JSON.parse(FCM_SERVICE_ACCOUNT_JSON);
          const token = await generateGoogleOAuthToken(serviceAccount);
          for (const deviceToken of tokens) {
            const message = {
              message: {
                token: deviceToken,
                notification: {
                  title,
                  body
                }
              }
            };
            const response = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(message)
            });
            if (!response.ok) {
              console.error("FCM Send Error:", await response.text());
            }
          }
        } catch (err) {
          console.error("FCM Error:", err);
        }
      }
      __name(sendFCMNotification, "sendFCMNotification");
      function str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }
        return buf;
      }
      __name(str2ab, "str2ab");
      function base64url(source) {
        let encodedSource = btoa(source);
        encodedSource = encodedSource.replace(/=+$/, "");
        encodedSource = encodedSource.replace(/\+/g, "-");
        encodedSource = encodedSource.replace(/\//g, "_");
        return encodedSource;
      }
      __name(base64url, "base64url");
      async function generateGoogleOAuthToken(serviceAccount) {
        const header = {
          alg: "RS256",
          typ: "JWT"
        };
        const now = Math.floor(Date.now() / 1e3);
        const payload = {
          iss: serviceAccount.client_email,
          scope: "https://www.googleapis.com/auth/firebase.messaging",
          aud: "https://oauth2.googleapis.com/token",
          exp: now + 3600,
          iat: now
        };
        const stringifiedHeader = JSON.stringify(header);
        const stringifiedPayload = JSON.stringify(payload);
        const encodedHeader = base64url(stringifiedHeader);
        const encodedPayload = base64url(stringifiedPayload);
        const signatureInput = `${encodedHeader}.${encodedPayload}`;
        const pemHeader = "-----BEGIN PRIVATE KEY-----";
        const pemFooter = "-----END PRIVATE KEY-----";
        const pemContents = serviceAccount.private_key.substring(
          serviceAccount.private_key.indexOf(pemHeader) + pemHeader.length,
          serviceAccount.private_key.indexOf(pemFooter)
        ).replace(/\s/g, "");
        const binaryDerString = atob(pemContents);
        const binaryDer = str2ab(binaryDerString);
        const privateKey = await crypto.subtle.importKey(
          "pkcs8",
          binaryDer,
          {
            name: "RSASSA-PKCS1-v1_5",
            hash: { name: "SHA-256" }
          },
          false,
          ["sign"]
        );
        const signature = await crypto.subtle.sign(
          "RSASSA-PKCS1-v1_5",
          privateKey,
          new TextEncoder().encode(signatureInput)
        );
        const encodedSignature = base64url(String.fromCharCode(...new Uint8Array(signature)));
        const jwt = `${signatureInput}.${encodedSignature}`;
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error_description || "Failed to get OAuth token");
        }
        return data.access_token;
      }
      __name(generateGoogleOAuthToken, "generateGoogleOAuthToken");
    }
  });
  require_worker();
})();
//# sourceMappingURL=worker.js.map
