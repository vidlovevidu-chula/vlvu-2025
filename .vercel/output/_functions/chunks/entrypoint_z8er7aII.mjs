import {
  R as ROUTE_TYPE_HEADER,
  q as REROUTE_DIRECTIVE_HEADER,
  A as AstroError,
  u as i18nNoLocaleFoundInPath,
  v as ResponseSentError,
  w as bold,
  x as red,
  y as yellow,
  z as dim,
  B as blue,
  C as MiddlewareNoDataOrNextCalled,
  G as MiddlewareNotAResponse,
  H as RewriteWithBodyUsed,
  J as originPathnameSymbol,
  K as GetStaticPathsRequired,
  O as InvalidGetStaticPathsReturn,
  P as InvalidGetStaticPathsEntry,
  Q as GetStaticPathsExpectedParams,
  S as GetStaticPathsInvalidRouteParam,
  T as PageNumberParamNotFound,
  V as decryptString,
  W as createSlotValueFromString,
  X as isAstroComponentFactory,
  r as renderTemplate,
  e as renderComponent,
  D as DEFAULT_404_COMPONENT,
  Y as NoMatchingStaticPathFound,
  Z as PrerenderDynamicEndpointPathCollide,
  _ as ReservedSlotName,
  $ as renderSlotToString,
  a0 as renderJSX,
  a1 as chunkToString,
  a2 as isRenderInstruction,
  a3 as ForbiddenRewrite,
  a4 as SessionStorageSaveError,
  a5 as SessionStorageInitError,
  a6 as LocalsReassigned,
  a7 as AstroResponseHeadersReassigned,
  a8 as PrerenderClientAddressNotAvailable,
  a9 as clientAddressSymbol,
  aa as ClientAddressNotAvailable,
  ab as StaticClientAddressNotAvailable,
  ac as ASTRO_VERSION,
  ad as responseSentSymbol$1,
  ae as renderPage,
  af as REWRITE_DIRECTIVE_HEADER_KEY,
  ag as REWRITE_DIRECTIVE_HEADER_VALUE,
  ah as renderEndpoint,
  ai as LocalsNotAnObject,
  aj as REROUTABLE_STATUS_CODES,
  ak as getAugmentedNamespace,
  al as commonjsGlobal,
} from "./astro/server_T2yNNXBH.mjs";
import {
  c as cookieExports,
  U as UNDEFINED,
  a as NAN,
  P as POSITIVE_INFINITY,
  b as NEGATIVE_INFINITY,
  d as NEGATIVE_ZERO,
  e as encode64,
  H as HOLE,
  g as getActionQueryString,
  f as deserializeActionResult,
  D as DEFAULT_404_ROUTE,
  h as default404Instance,
  N as NOOP_MIDDLEWARE_FN,
  u as unflatten$1,
  i as ensure404Route,
} from "./astro-designed-error-pages_DG1WDV-e.mjs";
import "clsx";
import buffer from "node:buffer";
import crypto$1 from "node:crypto";
import { Http2ServerResponse } from "node:http2";
import {
  a as appendForwardSlash,
  j as joinPaths,
  r as removeTrailingForwardSlash,
  t as trimSlashes,
  f as fileExtension,
  s as slash,
  p as prependForwardSlash,
} from "./path_CVKLlyuj.mjs";
import require$$0 from "url";
import require$$1$1 from "os";
import require$$0$1 from "path";
import require$$0$2 from "util";
import require$$0$3 from "stream";
import require$$0$5 from "events";
import require$$0$4 from "fs";
import nodePath from "node:path";

function shouldAppendForwardSlash(trailingSlash, buildFormat) {
  switch (trailingSlash) {
    case "always":
      return true;
    case "never":
      return false;
    case "ignore": {
      switch (buildFormat) {
        case "directory":
          return true;
        case "preserve":
        case "file":
          return false;
      }
    }
  }
}

function matchRoute(pathname, manifest) {
  const decodedPathname = decodeURI(pathname);
  return manifest.routes.find((route) => {
    return (
      route.pattern.test(decodedPathname) ||
      route.fallbackRoutes.some((fallbackRoute) =>
        fallbackRoute.pattern.test(decodedPathname),
      )
    );
  });
}
const ROUTE404_RE = /^\/404\/?$/;
const ROUTE500_RE = /^\/500\/?$/;
function isRoute404(route) {
  return ROUTE404_RE.test(route);
}
function isRoute500(route) {
  return ROUTE500_RE.test(route);
}
function isRoute404or500(route) {
  return isRoute404(route.route) || isRoute500(route.route);
}

function createI18nMiddleware(i18n, base, trailingSlash, format) {
  if (!i18n) return (_, next) => next();
  const payload = {
    ...i18n,
    trailingSlash,
    base,
    format,
    domains: {},
  };
  const _redirectToDefaultLocale = redirectToDefaultLocale(payload);
  const _noFoundForNonLocaleRoute = notFound(payload);
  const _requestHasLocale = requestHasLocale(payload.locales);
  const _redirectToFallback = redirectToFallback(payload);
  const prefixAlways = (context, response) => {
    const url = context.url;
    if (url.pathname === base + "/" || url.pathname === base) {
      return _redirectToDefaultLocale(context);
    } else if (!_requestHasLocale(context)) {
      return _noFoundForNonLocaleRoute(context, response);
    }
    return undefined;
  };
  const prefixOtherLocales = (context, response) => {
    let pathnameContainsDefaultLocale = false;
    const url = context.url;
    for (const segment of url.pathname.split("/")) {
      if (
        normalizeTheLocale(segment) === normalizeTheLocale(i18n.defaultLocale)
      ) {
        pathnameContainsDefaultLocale = true;
        break;
      }
    }
    if (pathnameContainsDefaultLocale) {
      const newLocation = url.pathname.replace(`/${i18n.defaultLocale}`, "");
      response.headers.set("Location", newLocation);
      return _noFoundForNonLocaleRoute(context);
    }
    return undefined;
  };
  return async (context, next) => {
    const response = await next();
    const type = response.headers.get(ROUTE_TYPE_HEADER);
    const isReroute = response.headers.get(REROUTE_DIRECTIVE_HEADER);
    if (isReroute === "no" && typeof i18n.fallback === "undefined") {
      return response;
    }
    if (type !== "page" && type !== "fallback") {
      return response;
    }
    if (requestIs404Or500(context.request, base)) {
      return response;
    }
    const { currentLocale } = context;
    switch (i18n.strategy) {
      // NOTE: theoretically, we should never hit this code path
      case "manual": {
        return response;
      }
      case "domains-prefix-other-locales": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixOtherLocales(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-other-locales": {
        const result = prefixOtherLocales(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always-no-redirect": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = _noFoundForNonLocaleRoute(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-always-no-redirect": {
        const result = _noFoundForNonLocaleRoute(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "pathname-prefix-always": {
        const result = prefixAlways(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixAlways(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
    }
    return _redirectToFallback(context, response);
  };
}
function localeHasntDomain(i18n, currentLocale) {
  for (const domainLocale of Object.values(i18n.domainLookupTable)) {
    if (domainLocale === currentLocale) {
      return false;
    }
  }
  return true;
}

function requestHasLocale(locales) {
  return function (context) {
    return pathHasLocale(context.url.pathname, locales);
  };
}
function requestIs404Or500(request, base = "") {
  const url = new URL(request.url);
  const pathname = url.pathname.slice(base.length);
  return isRoute404(pathname) || isRoute500(pathname);
}
function pathHasLocale(path, locales) {
  const segments = path.split("/");
  for (const segment of segments) {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (normalizeTheLocale(segment) === normalizeTheLocale(locale)) {
          return true;
        }
      } else if (segment === locale.path) {
        return true;
      }
    }
  }
  return false;
}
function getPathByLocale(locale, locales) {
  for (const loopLocale of locales) {
    if (typeof loopLocale === "string") {
      if (loopLocale === locale) {
        return loopLocale;
      }
    } else {
      for (const code of loopLocale.codes) {
        if (code === locale) {
          return loopLocale.path;
        }
      }
    }
  }
  throw new AstroError(i18nNoLocaleFoundInPath);
}
function normalizeTheLocale(locale) {
  return locale.replaceAll("_", "-").toLowerCase();
}
function toCodes(locales) {
  return locales.map((loopLocale) => {
    if (typeof loopLocale === "string") {
      return loopLocale;
    } else {
      return loopLocale.codes[0];
    }
  });
}
function redirectToDefaultLocale({
  trailingSlash,
  format,
  base,
  defaultLocale,
}) {
  return function (context, statusCode) {
    if (shouldAppendForwardSlash(trailingSlash, format)) {
      return context.redirect(
        `${appendForwardSlash(joinPaths(base, defaultLocale))}`,
        statusCode,
      );
    } else {
      return context.redirect(`${joinPaths(base, defaultLocale)}`, statusCode);
    }
  };
}
function notFound({ base, locales, fallback }) {
  return function (context, response) {
    if (
      response?.headers.get(REROUTE_DIRECTIVE_HEADER) === "no" &&
      typeof fallback === "undefined"
    ) {
      return response;
    }
    const url = context.url;
    const isRoot = url.pathname === base + "/" || url.pathname === base;
    if (!(isRoot || pathHasLocale(url.pathname, locales))) {
      if (response) {
        response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
        return new Response(response.body, {
          status: 404,
          headers: response.headers,
        });
      } else {
        return new Response(null, {
          status: 404,
          headers: {
            [REROUTE_DIRECTIVE_HEADER]: "no",
          },
        });
      }
    }
    return undefined;
  };
}
function redirectToFallback({
  fallback,
  locales,
  defaultLocale,
  strategy,
  base,
  fallbackType,
}) {
  return async function (context, response) {
    if (response.status >= 300 && fallback) {
      const fallbackKeys = fallback ? Object.keys(fallback) : [];
      const segments = context.url.pathname.split("/");
      const urlLocale = segments.find((segment) => {
        for (const locale of locales) {
          if (typeof locale === "string") {
            if (locale === segment) {
              return true;
            }
          } else if (locale.path === segment) {
            return true;
          }
        }
        return false;
      });
      if (urlLocale && fallbackKeys.includes(urlLocale)) {
        const fallbackLocale = fallback[urlLocale];
        const pathFallbackLocale = getPathByLocale(fallbackLocale, locales);
        let newPathname;
        if (
          pathFallbackLocale === defaultLocale &&
          strategy === "pathname-prefix-other-locales"
        ) {
          if (context.url.pathname.includes(`${base}`)) {
            newPathname = context.url.pathname.replace(`/${urlLocale}`, ``);
          } else {
            newPathname = context.url.pathname.replace(`/${urlLocale}`, `/`);
          }
        } else {
          newPathname = context.url.pathname.replace(
            `/${urlLocale}`,
            `/${pathFallbackLocale}`,
          );
        }
        if (fallbackType === "rewrite") {
          return await context.rewrite(newPathname + context.url.search);
        } else {
          return context.redirect(newPathname + context.url.search);
        }
      }
    }
    return response;
  };
}

const DELETED_EXPIRATION = /* @__PURE__ */ new Date(0);
const DELETED_VALUE = "deleted";
const responseSentSymbol = Symbol.for("astro.responseSent");
class AstroCookie {
  constructor(value) {
    this.value = value;
  }
  json() {
    if (this.value === undefined) {
      throw new Error(`Cannot convert undefined to an object.`);
    }
    return JSON.parse(this.value);
  }
  number() {
    return Number(this.value);
  }
  boolean() {
    if (this.value === "false") return false;
    if (this.value === "0") return false;
    return Boolean(this.value);
  }
}
class AstroCookies {
  #request;
  #requestValues;
  #outgoing;
  #consumed;
  constructor(request) {
    this.#request = request;
    this.#requestValues = null;
    this.#outgoing = null;
    this.#consumed = false;
  }
  /**
   * Astro.cookies.delete(key) is used to delete a cookie. Using this method will result
   * in a Set-Cookie header added to the response.
   * @param key The cookie to delete
   * @param options Options related to this deletion, such as the path of the cookie.
   */
  delete(key, options) {
    const {
      // @ts-expect-error
      maxAge: _ignoredMaxAge,
      // @ts-expect-error
      expires: _ignoredExpires,
      ...sanitizedOptions
    } = options || {};
    const serializeOptions = {
      expires: DELETED_EXPIRATION,
      ...sanitizedOptions,
    };
    this.#ensureOutgoingMap().set(key, [
      DELETED_VALUE,
      cookieExports.serialize(key, DELETED_VALUE, serializeOptions),
      false,
    ]);
  }
  /**
   * Astro.cookies.get(key) is used to get a cookie value. The cookie value is read from the
   * request. If you have set a cookie via Astro.cookies.set(key, value), the value will be taken
   * from that set call, overriding any values already part of the request.
   * @param key The cookie to get.
   * @returns An object containing the cookie value as well as convenience methods for converting its value.
   */
  get(key, options = undefined) {
    if (this.#outgoing?.has(key)) {
      let [serializedValue, , isSetValue] = this.#outgoing.get(key);
      if (isSetValue) {
        return new AstroCookie(serializedValue);
      } else {
        return undefined;
      }
    }
    const values = this.#ensureParsed(options);
    if (key in values) {
      const value = values[key];
      return new AstroCookie(value);
    }
  }
  /**
   * Astro.cookies.has(key) returns a boolean indicating whether this cookie is either
   * part of the initial request or set via Astro.cookies.set(key)
   * @param key The cookie to check for.
   * @returns
   */
  has(key, options = undefined) {
    if (this.#outgoing?.has(key)) {
      let [, , isSetValue] = this.#outgoing.get(key);
      return isSetValue;
    }
    const values = this.#ensureParsed(options);
    return !!values[key];
  }
  /**
   * Astro.cookies.set(key, value) is used to set a cookie's value. If provided
   * an object it will be stringified via JSON.stringify(value). Additionally you
   * can provide options customizing how this cookie will be set, such as setting httpOnly
   * in order to prevent the cookie from being read in client-side JavaScript.
   * @param key The name of the cookie to set.
   * @param value A value, either a string or other primitive or an object.
   * @param options Options for the cookie, such as the path and security settings.
   */
  set(key, value, options) {
    if (this.#consumed) {
      const warning = new Error(
        "Astro.cookies.set() was called after the cookies had already been sent to the browser.\nThis may have happened if this method was called in an imported component.\nPlease make sure that Astro.cookies.set() is only called in the frontmatter of the main page.",
      );
      warning.name = "Warning";
      console.warn(warning);
    }
    let serializedValue;
    if (typeof value === "string") {
      serializedValue = value;
    } else {
      let toStringValue = value.toString();
      if (toStringValue === Object.prototype.toString.call(value)) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = toStringValue;
      }
    }
    const serializeOptions = {};
    if (options) {
      Object.assign(serializeOptions, options);
    }
    this.#ensureOutgoingMap().set(key, [
      serializedValue,
      cookieExports.serialize(key, serializedValue, serializeOptions),
      true,
    ]);
    if (this.#request[responseSentSymbol]) {
      throw new AstroError({
        ...ResponseSentError,
      });
    }
  }
  /**
   * Merges a new AstroCookies instance into the current instance. Any new cookies
   * will be added to the current instance, overwriting any existing cookies with the same name.
   */
  merge(cookies) {
    const outgoing = cookies.#outgoing;
    if (outgoing) {
      for (const [key, value] of outgoing) {
        this.#ensureOutgoingMap().set(key, value);
      }
    }
  }
  /**
   * Astro.cookies.header() returns an iterator for the cookies that have previously
   * been set by either Astro.cookies.set() or Astro.cookies.delete().
   * This method is primarily used by adapters to set the header on outgoing responses.
   * @returns
   */
  *headers() {
    if (this.#outgoing == null) return;
    for (const [, value] of this.#outgoing) {
      yield value[1];
    }
  }
  /**
   * Behaves the same as AstroCookies.prototype.headers(),
   * but allows a warning when cookies are set after the instance is consumed.
   */
  static consume(cookies) {
    cookies.#consumed = true;
    return cookies.headers();
  }
  #ensureParsed(options = undefined) {
    if (!this.#requestValues) {
      this.#parse(options);
    }
    if (!this.#requestValues) {
      this.#requestValues = {};
    }
    return this.#requestValues;
  }
  #ensureOutgoingMap() {
    if (!this.#outgoing) {
      this.#outgoing = /* @__PURE__ */ new Map();
    }
    return this.#outgoing;
  }
  #parse(options = undefined) {
    const raw = this.#request.headers.get("cookie");
    if (!raw) {
      return;
    }
    this.#requestValues = cookieExports.parse(raw, options);
  }
}

const astroCookiesSymbol = Symbol.for("astro.cookies");
function attachCookiesToResponse(response, cookies) {
  Reflect.set(response, astroCookiesSymbol, cookies);
}
function getCookiesFromResponse(response) {
  let cookies = Reflect.get(response, astroCookiesSymbol);
  if (cookies != null) {
    return cookies;
  } else {
    return undefined;
  }
}
function* getSetCookiesFromResponse(response) {
  const cookies = getCookiesFromResponse(response);
  if (!cookies) {
    return [];
  }
  for (const headerValue of AstroCookies.consume(cookies)) {
    yield headerValue;
  }
  return [];
}

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90,
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine,
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error$1(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error$1(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error$1(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

const consoleLogDestination = {
  write(event) {
    let dest = console.error;
    if (levels[event.level] < levels["error"]) {
      dest = console.log;
    }
    if (event.label === "SKIP_FORMAT") {
      dest(event.message);
    } else {
      dest(getEventPrefix(event) + " " + event.message);
    }
    return true;
  },
};

/** @type {Record<string, string>} */

class DevalueError extends Error {
  /**
   * @param {string} message
   * @param {string[]} keys
   */
  constructor(message, keys) {
    super(message);
    this.name = "DevalueError";
    this.path = keys.join("");
  }
}

/** @param {any} thing */
function is_primitive(thing) {
  return Object(thing) !== thing;
}

const object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(
  Object.prototype,
)
  .sort()
  .join("\0");

/** @param {any} thing */
function is_plain_object(thing) {
  const proto = Object.getPrototypeOf(thing);

  return (
    proto === Object.prototype ||
    proto === null ||
    Object.getOwnPropertyNames(proto).sort().join("\0") === object_proto_names
  );
}

/** @param {any} thing */
function get_type(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}

/** @param {string} char */
function get_escaped_char(char) {
  switch (char) {
    case '"':
      return '\\"';
    case "<":
      return "\\u003C";
    case "\\":
      return "\\\\";
    case "\n":
      return "\\n";
    case "\r":
      return "\\r";
    case "\t":
      return "\\t";
    case "\b":
      return "\\b";
    case "\f":
      return "\\f";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return char < " "
        ? `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`
        : "";
  }
}

/** @param {string} str */
function stringify_string(str) {
  let result = "";
  let last_pos = 0;
  const len = str.length;

  for (let i = 0; i < len; i += 1) {
    const char = str[i];
    const replacement = get_escaped_char(char);
    if (replacement) {
      result += str.slice(last_pos, i) + replacement;
      last_pos = i + 1;
    }
  }

  return `"${last_pos === 0 ? str : result + str.slice(last_pos)}"`;
}

/** @param {Record<string | symbol, any>} object */
function enumerable_symbols(object) {
  return Object.getOwnPropertySymbols(object).filter(
    (symbol) => Object.getOwnPropertyDescriptor(object, symbol).enumerable,
  );
}

const is_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

/** @param {string} key */
function stringify_key(key) {
  return is_identifier.test(key) ? "." + key : "[" + JSON.stringify(key) + "]";
}

/**
 * Turn a value into a JSON string that can be parsed with `devalue.parse`
 * @param {any} value
 * @param {Record<string, (value: any) => any>} [reducers]
 */
function stringify$3(value, reducers) {
  /** @type {any[]} */
  const stringified = [];

  /** @type {Map<any, number>} */
  const indexes = new Map();

  /** @type {Array<{ key: string, fn: (value: any) => any }>} */
  const custom = [];
  {
    for (const key of Object.getOwnPropertyNames(reducers)) {
      custom.push({ key, fn: reducers[key] });
    }
  }

  /** @type {string[]} */
  const keys = [];

  let p = 0;

  /** @param {any} thing */
  function flatten(thing) {
    if (typeof thing === "function") {
      throw new DevalueError(`Cannot stringify a function`, keys);
    }

    if (indexes.has(thing)) return indexes.get(thing);

    if (thing === undefined) return UNDEFINED;
    if (Number.isNaN(thing)) return NAN;
    if (thing === Infinity) return POSITIVE_INFINITY;
    if (thing === -Infinity) return NEGATIVE_INFINITY;
    if (thing === 0 && 1 / thing < 0) return NEGATIVE_ZERO;

    const index = p++;
    indexes.set(thing, index);

    for (const { key, fn } of custom) {
      const value = fn(thing);
      if (value) {
        stringified[index] = `["${key}",${flatten(value)}]`;
        return index;
      }
    }

    let str = "";

    if (is_primitive(thing)) {
      str = stringify_primitive(thing);
    } else {
      const type = get_type(thing);

      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          str = `["Object",${stringify_primitive(thing)}]`;
          break;

        case "BigInt":
          str = `["BigInt",${thing}]`;
          break;

        case "Date":
          const valid = !isNaN(thing.getDate());
          str = `["Date","${valid ? thing.toISOString() : ""}"]`;
          break;

        case "RegExp":
          const { source, flags } = thing;
          str = flags
            ? `["RegExp",${stringify_string(source)},"${flags}"]`
            : `["RegExp",${stringify_string(source)}]`;
          break;

        case "Array":
          str = "[";

          for (let i = 0; i < thing.length; i += 1) {
            if (i > 0) str += ",";

            if (i in thing) {
              keys.push(`[${i}]`);
              str += flatten(thing[i]);
              keys.pop();
            } else {
              str += HOLE;
            }
          }

          str += "]";

          break;

        case "Set":
          str = '["Set"';

          for (const value of thing) {
            str += `,${flatten(value)}`;
          }

          str += "]";
          break;

        case "Map":
          str = '["Map"';

          for (const [key, value] of thing) {
            keys.push(
              `.get(${is_primitive(key) ? stringify_primitive(key) : "..."})`,
            );
            str += `,${flatten(key)},${flatten(value)}`;
            keys.pop();
          }

          str += "]";
          break;

        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "BigInt64Array":
        case "BigUint64Array": {
          /** @type {import("./types.js").TypedArray} */
          const typedArray = thing;
          const base64 = encode64(typedArray.buffer);
          str = '["' + type + '","' + base64 + '"]';
          break;
        }

        case "ArrayBuffer": {
          /** @type {ArrayBuffer} */
          const arraybuffer = thing;
          const base64 = encode64(arraybuffer);

          str = `["ArrayBuffer","${base64}"]`;
          break;
        }

        default:
          if (!is_plain_object(thing)) {
            throw new DevalueError(
              `Cannot stringify arbitrary non-POJOs`,
              keys,
            );
          }

          if (enumerable_symbols(thing).length > 0) {
            throw new DevalueError(
              `Cannot stringify POJOs with symbolic keys`,
              keys,
            );
          }

          if (Object.getPrototypeOf(thing) === null) {
            str = '["null"';
            for (const key in thing) {
              keys.push(stringify_key(key));
              str += `,${stringify_string(key)},${flatten(thing[key])}`;
              keys.pop();
            }
            str += "]";
          } else {
            str = "{";
            let started = false;
            for (const key in thing) {
              if (started) str += ",";
              started = true;
              keys.push(stringify_key(key));
              str += `${stringify_string(key)}:${flatten(thing[key])}`;
              keys.pop();
            }
            str += "}";
          }
      }
    }

    stringified[index] = str;
    return index;
  }

  const index = flatten(value);

  // special case — value is represented as a negative index
  if (index < 0) return `${index}`;

  return `[${stringified.join(",")}]`;
}

/**
 * @param {any} thing
 * @returns {string}
 */
function stringify_primitive(thing) {
  const type = typeof thing;
  if (type === "string") return stringify_string(thing);
  if (thing instanceof String) return stringify_string(thing.toString());
  if (thing === undefined) return UNDEFINED.toString();
  if (thing === 0 && 1 / thing < 0) return NEGATIVE_ZERO.toString();
  if (type === "bigint") return `["BigInt","${thing}"]`;
  return String(thing);
}

const ACTION_API_CONTEXT_SYMBOL = Symbol.for("astro.actionAPIContext");

function hasActionPayload(locals) {
  return "_actionPayload" in locals;
}
function createGetActionResult(locals) {
  return (actionFn) => {
    if (
      !hasActionPayload(locals) ||
      actionFn.toString() !==
        getActionQueryString(locals._actionPayload.actionName)
    ) {
      return undefined;
    }
    return deserializeActionResult(locals._actionPayload.actionResult);
  };
}
function createCallAction(context) {
  return (baseAction, input) => {
    Reflect.set(context, ACTION_API_CONTEXT_SYMBOL, true);
    const action = baseAction.bind(context);
    return action(input);
  };
}

function parseLocale(header) {
  if (header === "*") {
    return [{ locale: header, qualityValue: undefined }];
  }
  const result = [];
  const localeValues = header.split(",").map((str) => str.trim());
  for (const localeValue of localeValues) {
    const split = localeValue.split(";").map((str) => str.trim());
    const localeName = split[0];
    const qualityValue = split[1];
    if (!split) {
      continue;
    }
    if (qualityValue && qualityValue.startsWith("q=")) {
      const qualityValueAsFloat = Number.parseFloat(
        qualityValue.slice("q=".length),
      );
      if (Number.isNaN(qualityValueAsFloat) || qualityValueAsFloat > 1) {
        result.push({
          locale: localeName,
          qualityValue: undefined,
        });
      } else {
        result.push({
          locale: localeName,
          qualityValue: qualityValueAsFloat,
        });
      }
    } else {
      result.push({
        locale: localeName,
        qualityValue: undefined,
      });
    }
  }
  return result;
}
function sortAndFilterLocales(browserLocaleList, locales) {
  const normalizedLocales = toCodes(locales).map(normalizeTheLocale);
  return browserLocaleList
    .filter((browserLocale) => {
      if (browserLocale.locale !== "*") {
        return normalizedLocales.includes(
          normalizeTheLocale(browserLocale.locale),
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (a.qualityValue && b.qualityValue) {
        return Math.sign(b.qualityValue - a.qualityValue);
      }
      return 0;
    });
}
function computePreferredLocale(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = undefined;
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(
      parseLocale(acceptHeader),
      locales,
    );
    const firstResult = browserLocaleList.at(0);
    if (firstResult && firstResult.locale !== "*") {
      for (const currentLocale of locales) {
        if (typeof currentLocale === "string") {
          if (
            normalizeTheLocale(currentLocale) ===
            normalizeTheLocale(firstResult.locale)
          ) {
            result = currentLocale;
          }
        } else {
          for (const currentCode of currentLocale.codes) {
            if (
              normalizeTheLocale(currentCode) ===
              normalizeTheLocale(firstResult.locale)
            ) {
              result = currentLocale.path;
            }
          }
        }
      }
    }
  }
  return result;
}
function computePreferredLocaleList(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = [];
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(
      parseLocale(acceptHeader),
      locales,
    );
    if (
      browserLocaleList.length === 1 &&
      browserLocaleList.at(0).locale === "*"
    ) {
      return locales.map((locale) => {
        if (typeof locale === "string") {
          return locale;
        } else {
          return locale.codes.at(0);
        }
      });
    } else if (browserLocaleList.length > 0) {
      for (const browserLocale of browserLocaleList) {
        for (const loopLocale of locales) {
          if (typeof loopLocale === "string") {
            if (
              normalizeTheLocale(loopLocale) ===
              normalizeTheLocale(browserLocale.locale)
            ) {
              result.push(loopLocale);
            }
          } else {
            for (const code of loopLocale.codes) {
              if (code === browserLocale.locale) {
                result.push(loopLocale.path);
              }
            }
          }
        }
      }
    }
  }
  return result;
}
function computeCurrentLocale(pathname, locales, defaultLocale) {
  for (const segment of pathname.split("/")) {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (!segment.includes(locale)) continue;
        if (normalizeTheLocale(locale) === normalizeTheLocale(segment)) {
          return locale;
        }
      } else {
        if (locale.path === segment) {
          return locale.codes.at(0);
        } else {
          for (const code of locale.codes) {
            if (normalizeTheLocale(code) === normalizeTheLocale(segment)) {
              return code;
            }
          }
        }
      }
    }
  }
  for (const locale of locales) {
    if (typeof locale === "string") {
      if (locale === defaultLocale) {
        return locale;
      }
    } else {
      if (locale.path === defaultLocale) {
        return locale.codes.at(0);
      }
    }
  }
}

async function callMiddleware(onRequest, apiContext, responseFunction) {
  let nextCalled = false;
  let responseFunctionPromise = undefined;
  const next = async (payload) => {
    nextCalled = true;
    responseFunctionPromise = responseFunction(apiContext, payload);
    return responseFunctionPromise;
  };
  let middlewarePromise = onRequest(apiContext, next);
  return await Promise.resolve(middlewarePromise).then(async (value) => {
    if (nextCalled) {
      if (typeof value !== "undefined") {
        if (value instanceof Response === false) {
          throw new AstroError(MiddlewareNotAResponse);
        }
        return value;
      } else {
        if (responseFunctionPromise) {
          return responseFunctionPromise;
        } else {
          throw new AstroError(MiddlewareNotAResponse);
        }
      }
    } else if (typeof value === "undefined") {
      throw new AstroError(MiddlewareNoDataOrNextCalled);
    } else if (value instanceof Response === false) {
      throw new AstroError(MiddlewareNotAResponse);
    } else {
      return value;
    }
  });
}

function createRequest({
  url,
  headers,
  method = "GET",
  body = undefined,
  logger,
  isPrerendered = false,
  routePattern,
  init,
}) {
  const headersObj = isPrerendered
    ? undefined
    : headers instanceof Headers
      ? headers
      : new Headers(
          // Filter out HTTP/2 pseudo-headers. These are internally-generated headers added to all HTTP/2 requests with trusted metadata about the request.
          // Examples include `:method`, `:scheme`, `:authority`, and `:path`.
          // They are always prefixed with a colon to distinguish them from other headers, and it is an error to add the to a Headers object manually.
          // See https://httpwg.org/specs/rfc7540.html#HttpRequest
          Object.entries(headers).filter(([name]) => !name.startsWith(":")),
        );
  if (typeof url === "string") url = new URL(url);
  if (isPrerendered) {
    url.search = "";
  }
  const request = new Request(url, {
    method,
    headers: headersObj,
    // body is made available only if the request is for a page that will be on-demand rendered
    body: isPrerendered ? null : body,
    ...init,
  });
  if (isPrerendered) {
    let _headers = request.headers;
    const { value, writable, ...headersDesc } =
      Object.getOwnPropertyDescriptor(request, "headers") || {};
    Object.defineProperty(request, "headers", {
      ...headersDesc,
      get() {
        logger.warn(
          null,
          `\`Astro.request.headers\` was used when rendering the route \`${routePattern}'\`. \`Astro.request.headers\` is not available on prerendered pages. If you need access to request headers, make sure that the page is server-rendered using \`export const prerender = false;\` or by setting \`output\` to \`"server"\` in your Astro config to make all your pages server-rendered by default.`,
        );
        return _headers;
      },
      set(newHeaders) {
        _headers = newHeaders;
      },
    });
  }
  return request;
}

function findRouteToRewrite({
  payload,
  routes,
  request,
  trailingSlash,
  buildFormat,
  base,
}) {
  let newUrl = undefined;
  if (payload instanceof URL) {
    newUrl = payload;
  } else if (payload instanceof Request) {
    newUrl = new URL(payload.url);
  } else {
    newUrl = new URL(payload, new URL(request.url).origin);
  }
  let pathname = newUrl.pathname;
  if (base !== "/" && newUrl.pathname.startsWith(base)) {
    pathname = shouldAppendForwardSlash(trailingSlash, buildFormat)
      ? appendForwardSlash(newUrl.pathname)
      : removeTrailingForwardSlash(newUrl.pathname);
    pathname = pathname.slice(base.length);
  }
  let foundRoute;
  for (const route of routes) {
    if (route.pattern.test(decodeURI(pathname))) {
      foundRoute = route;
      break;
    }
  }
  if (foundRoute) {
    return {
      routeData: foundRoute,
      newUrl,
      pathname,
    };
  } else {
    const custom404 = routes.find((route) => route.route === "/404");
    if (custom404) {
      return { routeData: custom404, newUrl, pathname };
    } else {
      return { routeData: DEFAULT_404_ROUTE, newUrl, pathname };
    }
  }
}
function copyRequest(newUrl, oldRequest, isPrerendered, logger, routePattern) {
  if (oldRequest.bodyUsed) {
    throw new AstroError(RewriteWithBodyUsed);
  }
  return createRequest({
    url: newUrl,
    method: oldRequest.method,
    body: oldRequest.body,
    isPrerendered,
    logger,
    headers: isPrerendered ? {} : oldRequest.headers,
    routePattern,
    init: {
      referrer: oldRequest.referrer,
      referrerPolicy: oldRequest.referrerPolicy,
      mode: oldRequest.mode,
      credentials: oldRequest.credentials,
      cache: oldRequest.cache,
      redirect: oldRequest.redirect,
      integrity: oldRequest.integrity,
      signal: oldRequest.signal,
      keepalive: oldRequest.keepalive,
      // https://fetch.spec.whatwg.org/#dom-request-duplex
      // @ts-expect-error It isn't part of the types, but undici accepts it and it allows to carry over the body to a new request
      duplex: "half",
    },
  });
}
function setOriginPathname(request, pathname) {
  Reflect.set(request, originPathnameSymbol, encodeURIComponent(pathname));
}
function getOriginPathname(request) {
  const origin = Reflect.get(request, originPathnameSymbol);
  if (origin) {
    return decodeURIComponent(origin);
  }
  return new URL(request.url).pathname;
}

const FORM_CONTENT_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
];
function createOriginCheckMiddleware() {
  return defineMiddleware((context, next) => {
    const { request, url, isPrerendered } = context;
    if (isPrerendered) {
      return next();
    }
    if (request.method === "GET") {
      return next();
    }
    const sameOrigin =
      (request.method === "POST" ||
        request.method === "PUT" ||
        request.method === "PATCH" ||
        request.method === "DELETE") &&
      request.headers.get("origin") === url.origin;
    const hasContentType = request.headers.has("content-type");
    if (hasContentType) {
      const formLikeHeader = hasFormLikeHeader(
        request.headers.get("content-type"),
      );
      if (formLikeHeader && !sameOrigin) {
        return new Response(
          `Cross-site ${request.method} form submissions are forbidden`,
          {
            status: 403,
          },
        );
      }
    } else {
      if (!sameOrigin) {
        return new Response(
          `Cross-site ${request.method} form submissions are forbidden`,
          {
            status: 403,
          },
        );
      }
    }
    return next();
  });
}
function hasFormLikeHeader(contentType) {
  if (contentType) {
    for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES) {
      if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) {
        return true;
      }
    }
  }
  return false;
}

const VALID_PARAM_TYPES = ["string", "number", "undefined"];
function validateGetStaticPathsParameter([key, value], route) {
  if (!VALID_PARAM_TYPES.includes(typeof value)) {
    throw new AstroError({
      ...GetStaticPathsInvalidRouteParam,
      message: GetStaticPathsInvalidRouteParam.message(
        key,
        value,
        typeof value,
      ),
      location: {
        file: route,
      },
    });
  }
}
function validateDynamicRouteModule(mod, { ssr, route }) {
  if ((!ssr || route.prerender) && !mod.getStaticPaths) {
    throw new AstroError({
      ...GetStaticPathsRequired,
      location: { file: route.component },
    });
  }
}
function validateGetStaticPathsResult(result, logger, route) {
  if (!Array.isArray(result)) {
    throw new AstroError({
      ...InvalidGetStaticPathsReturn,
      message: InvalidGetStaticPathsReturn.message(typeof result),
      location: {
        file: route.component,
      },
    });
  }
  result.forEach((pathObject) => {
    if (
      (typeof pathObject === "object" && Array.isArray(pathObject)) ||
      pathObject === null
    ) {
      throw new AstroError({
        ...InvalidGetStaticPathsEntry,
        message: InvalidGetStaticPathsEntry.message(
          Array.isArray(pathObject) ? "array" : typeof pathObject,
        ),
      });
    }
    if (
      pathObject.params === undefined ||
      pathObject.params === null ||
      (pathObject.params && Object.keys(pathObject.params).length === 0)
    ) {
      throw new AstroError({
        ...GetStaticPathsExpectedParams,
        location: {
          file: route.component,
        },
      });
    }
    for (const [key, val] of Object.entries(pathObject.params)) {
      if (
        !(
          typeof val === "undefined" ||
          typeof val === "string" ||
          typeof val === "number"
        )
      ) {
        logger.warn(
          "router",
          `getStaticPaths() returned an invalid path param: "${key}". A string, number or undefined value was expected, but got \`${JSON.stringify(
            val,
          )}\`.`,
        );
      }
      if (typeof val === "string" && val === "") {
        logger.warn(
          "router",
          `getStaticPaths() returned an invalid path param: "${key}". \`undefined\` expected for an optional param, but got empty string.`,
        );
      }
    }
  });
}

function stringifyParams(params, route) {
  const validatedParams = Object.entries(params).reduce((acc, next) => {
    validateGetStaticPathsParameter(next, route.component);
    const [key, value] = next;
    if (value !== undefined) {
      acc[key] =
        typeof value === "string" ? trimSlashes(value) : value.toString();
    }
    return acc;
  }, {});
  return route.generate(validatedParams);
}

function generatePaginateFunction(routeMatch, base) {
  return function paginateUtility(data, args = {}) {
    let { pageSize: _pageSize, params: _params, props: _props } = args;
    const pageSize = _pageSize || 10;
    const paramName = "page";
    const additionalParams = _params || {};
    const additionalProps = _props || {};
    let includesFirstPageNumber;
    if (routeMatch.params.includes(`...${paramName}`)) {
      includesFirstPageNumber = false;
    } else if (routeMatch.params.includes(`${paramName}`)) {
      includesFirstPageNumber = true;
    } else {
      throw new AstroError({
        ...PageNumberParamNotFound,
        message: PageNumberParamNotFound.message(paramName),
      });
    }
    const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
    const result = [...Array(lastPage).keys()].map((num) => {
      const pageNum = num + 1;
      const start = pageSize === Infinity ? 0 : (pageNum - 1) * pageSize;
      const end = Math.min(start + pageSize, data.length);
      const params = {
        ...additionalParams,
        [paramName]:
          includesFirstPageNumber || pageNum > 1 ? String(pageNum) : undefined,
      };
      const current = addRouteBase(routeMatch.generate({ ...params }), base);
      const next =
        pageNum === lastPage
          ? undefined
          : addRouteBase(
              routeMatch.generate({ ...params, page: String(pageNum + 1) }),
              base,
            );
      const prev =
        pageNum === 1
          ? undefined
          : addRouteBase(
              routeMatch.generate({
                ...params,
                page:
                  !includesFirstPageNumber && pageNum - 1 === 1
                    ? undefined
                    : String(pageNum - 1),
              }),
              base,
            );
      const first =
        pageNum === 1
          ? undefined
          : addRouteBase(
              routeMatch.generate({
                ...params,
                page: includesFirstPageNumber ? "1" : undefined,
              }),
              base,
            );
      const last =
        pageNum === lastPage
          ? undefined
          : addRouteBase(
              routeMatch.generate({ ...params, page: String(lastPage) }),
              base,
            );
      return {
        params,
        props: {
          ...additionalProps,
          page: {
            data: data.slice(start, end),
            start,
            end: end - 1,
            size: pageSize,
            total: data.length,
            currentPage: pageNum,
            lastPage,
            url: { current, next, prev, first, last },
          },
        },
      };
    });
    return result;
  };
}
function addRouteBase(route, base) {
  let routeWithBase = joinPaths(base, route);
  if (routeWithBase === "") routeWithBase = "/";
  return routeWithBase;
}

async function callGetStaticPaths({
  mod,
  route,
  routeCache,
  logger,
  ssr,
  base,
}) {
  const cached = routeCache.get(route);
  if (!mod) {
    throw new Error(
      "This is an error caused by Astro and not your code. Please file an issue.",
    );
  }
  if (cached?.staticPaths) {
    return cached.staticPaths;
  }
  validateDynamicRouteModule(mod, { ssr, route });
  if (ssr && !route.prerender) {
    const entry = Object.assign([], { keyed: /* @__PURE__ */ new Map() });
    routeCache.set(route, { ...cached, staticPaths: entry });
    return entry;
  }
  let staticPaths = [];
  if (!mod.getStaticPaths) {
    throw new Error("Unexpected Error.");
  }
  staticPaths = await mod.getStaticPaths({
    // Q: Why the cast?
    // A: So users downstream can have nicer typings, we have to make some sacrifice in our internal typings, which necessitate a cast here
    paginate: generatePaginateFunction(route, base),
  });
  validateGetStaticPathsResult(staticPaths, logger, route);
  const keyedStaticPaths = staticPaths;
  keyedStaticPaths.keyed = /* @__PURE__ */ new Map();
  for (const sp of keyedStaticPaths) {
    const paramsKey = stringifyParams(sp.params, route);
    keyedStaticPaths.keyed.set(paramsKey, sp);
  }
  routeCache.set(route, { ...cached, staticPaths: keyedStaticPaths });
  return keyedStaticPaths;
}
class RouteCache {
  logger;
  cache = {};
  runtimeMode;
  constructor(logger, runtimeMode = "production") {
    this.logger = logger;
    this.runtimeMode = runtimeMode;
  }
  /** Clear the cache. */
  clearAll() {
    this.cache = {};
  }
  set(route, entry) {
    const key = this.key(route);
    if (this.runtimeMode === "production" && this.cache[key]?.staticPaths) {
      this.logger.warn(
        null,
        `Internal Warning: route cache overwritten. (${key})`,
      );
    }
    this.cache[key] = entry;
  }
  get(route) {
    return this.cache[this.key(route)];
  }
  key(route) {
    return `${route.route}_${route.component}`;
  }
}
function findPathItemByKey(staticPaths, params, route, logger) {
  const paramsKey = stringifyParams(params, route);
  const matchedStaticPath = staticPaths.keyed.get(paramsKey);
  if (matchedStaticPath) {
    return matchedStaticPath;
  }
  logger.debug(
    "router",
    `findPathItemByKey() - Unexpected cache miss looking for ${paramsKey}`,
  );
}

const SERVER_ISLAND_ROUTE = "/_server-islands/[name]";
const SERVER_ISLAND_COMPONENT = "_server-islands.astro";
function badRequest(reason) {
  return new Response(null, {
    status: 400,
    statusText: "Bad request: " + reason,
  });
}
async function getRequestData(request) {
  switch (request.method) {
    case "GET": {
      const url = new URL(request.url);
      const params = url.searchParams;
      if (!params.has("s") || !params.has("e") || !params.has("p")) {
        return badRequest("Missing required query parameters.");
      }
      const rawSlots = params.get("s");
      try {
        return {
          componentExport: params.get("e"),
          encryptedProps: params.get("p"),
          slots: JSON.parse(rawSlots),
        };
      } catch {
        return badRequest("Invalid slots format.");
      }
    }
    case "POST": {
      try {
        const raw = await request.text();
        const data = JSON.parse(raw);
        return data;
      } catch {
        return badRequest("Request format is invalid.");
      }
    }
    default: {
      return new Response(null, { status: 405 });
    }
  }
}
function createEndpoint(manifest) {
  const page = async (result) => {
    const params = result.params;
    if (!params.name) {
      return new Response(null, {
        status: 400,
        statusText: "Bad request",
      });
    }
    const componentId = params.name;
    const data = await getRequestData(result.request);
    if (data instanceof Response) {
      return data;
    }
    const imp = manifest.serverIslandMap?.get(componentId);
    if (!imp) {
      return new Response(null, {
        status: 404,
        statusText: "Not found",
      });
    }
    const key = await manifest.key;
    const encryptedProps = data.encryptedProps;
    const propString =
      encryptedProps === "" ? "{}" : await decryptString(key, encryptedProps);
    const props = JSON.parse(propString);
    const componentModule = await imp();
    let Component = componentModule[data.componentExport];
    const slots = {};
    for (const prop in data.slots) {
      slots[prop] = createSlotValueFromString(data.slots[prop]);
    }
    result.response.headers.set("X-Robots-Tag", "noindex");
    if (isAstroComponentFactory(Component)) {
      const ServerIsland = Component;
      Component = function (...args) {
        return ServerIsland.apply(this, args);
      };
      Object.assign(Component, ServerIsland);
      Component.propagation = "self";
    }
    return renderTemplate`${renderComponent(result, "Component", Component, props, slots)}`;
  };
  page.isAstroComponentFactory = true;
  const instance = {
    default: page,
    partial: true,
  };
  return instance;
}

function createDefaultRoutes(manifest) {
  const root = new URL(manifest.hrefRoot);
  return [
    {
      instance: default404Instance,
      matchesComponent: (filePath) =>
        filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
      route: DEFAULT_404_ROUTE.route,
      component: DEFAULT_404_COMPONENT,
    },
    {
      instance: createEndpoint(manifest),
      matchesComponent: (filePath) =>
        filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
      route: SERVER_ISLAND_ROUTE,
      component: SERVER_ISLAND_COMPONENT,
    },
  ];
}

class Pipeline {
  constructor(
    logger,
    manifest,
    runtimeMode,
    renderers,
    resolve,
    serverLike,
    streaming,
    adapterName = manifest.adapterName,
    clientDirectives = manifest.clientDirectives,
    inlinedScripts = manifest.inlinedScripts,
    compressHTML = manifest.compressHTML,
    i18n = manifest.i18n,
    middleware = manifest.middleware,
    routeCache = new RouteCache(logger, runtimeMode),
    site = manifest.site ? new URL(manifest.site) : undefined,
    defaultRoutes = createDefaultRoutes(manifest),
  ) {
    this.logger = logger;
    this.manifest = manifest;
    this.runtimeMode = runtimeMode;
    this.renderers = renderers;
    this.resolve = resolve;
    this.serverLike = serverLike;
    this.streaming = streaming;
    this.adapterName = adapterName;
    this.clientDirectives = clientDirectives;
    this.inlinedScripts = inlinedScripts;
    this.compressHTML = compressHTML;
    this.i18n = i18n;
    this.middleware = middleware;
    this.routeCache = routeCache;
    this.site = site;
    this.defaultRoutes = defaultRoutes;
    this.internalMiddleware = [];
    if (i18n?.strategy !== "manual") {
      this.internalMiddleware.push(
        createI18nMiddleware(
          i18n,
          manifest.base,
          manifest.trailingSlash,
          manifest.buildFormat,
        ),
      );
    }
  }
  internalMiddleware;
  resolvedMiddleware = undefined;
  /**
   * Resolves the middleware from the manifest, and returns the `onRequest` function. If `onRequest` isn't there,
   * it returns a no-op function
   */
  async getMiddleware() {
    if (this.resolvedMiddleware) {
      return this.resolvedMiddleware;
    } else if (this.middleware) {
      const middlewareInstance = await this.middleware();
      const onRequest = middlewareInstance.onRequest ?? NOOP_MIDDLEWARE_FN;
      if (this.manifest.checkOrigin) {
        this.resolvedMiddleware = sequence(
          createOriginCheckMiddleware(),
          onRequest,
        );
      } else {
        this.resolvedMiddleware = onRequest;
      }
      return this.resolvedMiddleware;
    } else {
      this.resolvedMiddleware = NOOP_MIDDLEWARE_FN;
      return this.resolvedMiddleware;
    }
  }
}

function routeIsRedirect(route) {
  return route?.type === "redirect";
}
function routeIsFallback(route) {
  return route?.type === "fallback";
}

const RedirectComponentInstance = {
  default() {
    return new Response(null, {
      status: 301,
    });
  },
};
const RedirectSinglePageBuiltModule = {
  page: () => Promise.resolve(RedirectComponentInstance),
  onRequest: (_, next) => next(),
  renderers: [],
};

async function renderRedirect(renderContext) {
  const {
    request: { method },
    routeData,
  } = renderContext;
  const { redirect, redirectRoute } = routeData;
  const status =
    redirectRoute && typeof redirect === "object"
      ? redirect.status
      : method === "GET"
        ? 301
        : 308;
  const headers = { location: encodeURI(redirectRouteGenerate(renderContext)) };
  return new Response(null, { status, headers });
}
function redirectRouteGenerate(renderContext) {
  const {
    params,
    routeData: { redirect, redirectRoute },
  } = renderContext;
  if (typeof redirectRoute !== "undefined") {
    return redirectRoute?.generate(params) || redirectRoute?.pathname || "/";
  } else if (typeof redirect === "string") {
    let target = redirect;
    for (const param of Object.keys(params)) {
      const paramValue = params[param];
      target = target
        .replace(`[${param}]`, paramValue)
        .replace(`[...${param}]`, paramValue);
    }
    return target;
  } else if (typeof redirect === "undefined") {
    return "/";
  }
  return redirect.destination;
}

async function getProps(opts) {
  const {
    logger,
    mod,
    routeData: route,
    routeCache,
    pathname,
    serverLike,
    base,
  } = opts;
  if (!route || route.pathname) {
    return {};
  }
  if (
    routeIsRedirect(route) ||
    routeIsFallback(route) ||
    route.component === DEFAULT_404_COMPONENT
  ) {
    return {};
  }
  const staticPaths = await callGetStaticPaths({
    mod,
    route,
    routeCache,
    logger,
    ssr: serverLike,
    base,
  });
  const params = getParams(route, pathname);
  const matchedStaticPath = findPathItemByKey(
    staticPaths,
    params,
    route,
    logger,
  );
  if (!matchedStaticPath && (serverLike ? route.prerender : true)) {
    throw new AstroError({
      ...NoMatchingStaticPathFound,
      message: NoMatchingStaticPathFound.message(pathname),
      hint: NoMatchingStaticPathFound.hint([route.component]),
    });
  }
  if (mod) {
    validatePrerenderEndpointCollision(route, mod, params);
  }
  const props = matchedStaticPath?.props ? { ...matchedStaticPath.props } : {};
  return props;
}
function getParams(route, pathname) {
  if (!route.params.length) return {};
  const paramsMatch =
    route.pattern.exec(pathname) ||
    route.fallbackRoutes
      .map((fallbackRoute) => fallbackRoute.pattern.exec(pathname))
      .find((x) => x);
  if (!paramsMatch) return {};
  const params = {};
  route.params.forEach((key, i) => {
    if (key.startsWith("...")) {
      params[key.slice(3)] = paramsMatch[i + 1]
        ? paramsMatch[i + 1]
        : undefined;
    } else {
      params[key] = paramsMatch[i + 1];
    }
  });
  return params;
}
function validatePrerenderEndpointCollision(route, mod, params) {
  if (route.type === "endpoint" && mod.getStaticPaths) {
    const lastSegment = route.segments[route.segments.length - 1];
    const paramValues = Object.values(params);
    const lastParam = paramValues[paramValues.length - 1];
    if (
      lastSegment.length === 1 &&
      lastSegment[0].dynamic &&
      lastParam === undefined
    ) {
      throw new AstroError({
        ...PrerenderDynamicEndpointPathCollide,
        message: PrerenderDynamicEndpointPathCollide.message(route.route),
        hint: PrerenderDynamicEndpointPathCollide.hint(route.component),
        location: {
          file: route.component,
        },
      });
    }
  }
}

function getFunctionExpression(slot) {
  if (!slot) return;
  const expressions = slot?.expressions?.filter(
    (e) => isRenderInstruction(e) === false,
  );
  if (expressions?.length !== 1) return;
  return expressions[0];
}
class Slots {
  #result;
  #slots;
  #logger;
  constructor(result, slots, logger) {
    this.#result = result;
    this.#slots = slots;
    this.#logger = logger;
    if (slots) {
      for (const key of Object.keys(slots)) {
        if (this[key] !== undefined) {
          throw new AstroError({
            ...ReservedSlotName,
            message: ReservedSlotName.message(key),
          });
        }
        Object.defineProperty(this, key, {
          get() {
            return true;
          },
          enumerable: true,
        });
      }
    }
  }
  has(name) {
    if (!this.#slots) return false;
    return Boolean(this.#slots[name]);
  }
  async render(name, args = []) {
    if (!this.#slots || !this.has(name)) return;
    const result = this.#result;
    if (!Array.isArray(args)) {
      this.#logger.warn(
        null,
        `Expected second parameter to be an array, received a ${typeof args}. If you're trying to pass an array as a single argument and getting unexpected results, make sure you're passing your array as a item of an array. Ex: Astro.slots.render('default', [["Hello", "World"]])`,
      );
    } else if (args.length > 0) {
      const slotValue = this.#slots[name];
      const component =
        typeof slotValue === "function"
          ? await slotValue(result)
          : await slotValue;
      const expression = getFunctionExpression(component);
      if (expression) {
        const slot = async () =>
          typeof expression === "function" ? expression(...args) : expression;
        return await renderSlotToString(result, slot).then((res) => {
          return res;
        });
      }
      if (typeof component === "function") {
        return await renderJSX(result, component(...args)).then((res) =>
          res != null ? String(res) : res,
        );
      }
    }
    const content = await renderSlotToString(result, this.#slots[name]);
    const outHTML = chunkToString(result, content);
    return outHTML;
  }
}

function sequence(...handlers) {
  const filtered = handlers.filter((h) => !!h);
  const length = filtered.length;
  if (!length) {
    return defineMiddleware((_context, next) => {
      return next();
    });
  }
  return defineMiddleware((context, next) => {
    let carriedPayload = undefined;
    return applyHandle(0, context);
    function applyHandle(i, handleContext) {
      const handle = filtered[i];
      const result = handle(handleContext, async (payload) => {
        if (i < length - 1) {
          if (payload) {
            let newRequest;
            if (payload instanceof Request) {
              newRequest = payload;
            } else if (payload instanceof URL) {
              newRequest = new Request(payload, handleContext.request);
            } else {
              newRequest = new Request(
                new URL(payload, handleContext.url.origin),
                handleContext.request,
              );
            }
            const pipeline = Reflect.get(handleContext, apiContextRoutesSymbol);
            const { routeData, pathname } = await pipeline.tryRewrite(
              payload,
              handleContext.request,
            );
            if (
              pipeline.serverLike === true &&
              handleContext.isPrerendered === false &&
              routeData.prerender === true
            ) {
              throw new AstroError({
                ...ForbiddenRewrite,
                message: ForbiddenRewrite.message(
                  handleContext.url.pathname,
                  pathname,
                  routeData.component,
                ),
                hint: ForbiddenRewrite.hint(routeData.component),
              });
            }
            carriedPayload = payload;
            handleContext.request = newRequest;
            handleContext.url = new URL(newRequest.url);
            handleContext.cookies = new AstroCookies(newRequest);
            handleContext.params = getParams(routeData, pathname);
          }
          return applyHandle(i + 1, handleContext);
        } else {
          return next(payload ?? carriedPayload);
        }
      });
      return result;
    }
  });
}

function defineMiddleware(fn) {
  return fn;
}

const suspectProtoRx =
  /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx =
  /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (
    key === "__proto__" ||
    (key === "constructor" &&
      value &&
      typeof value === "object" &&
      "prototype" in value)
  ) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  const _value = value.trim();
  if (
    // eslint-disable-next-line unicorn/prefer-at
    value[0] === '"' &&
    value.endsWith('"') &&
    !value.includes("\\")
  ) {
    return _value.slice(1, -1);
  }
  if (_value.length <= 9) {
    const _lval = _value.toLowerCase();
    if (_lval === "true") {
      return true;
    }
    if (_lval === "false") {
      return false;
    }
    if (_lval === "undefined") {
      return undefined;
    }
    if (_lval === "null") {
      return null;
    }
    if (_lval === "nan") {
      return Number.NaN;
    }
    if (_lval === "infinity") {
      return Number.POSITIVE_INFINITY;
    }
    if (_lval === "-infinity") {
      return Number.NEGATIVE_INFINITY;
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || (type !== "object" && type !== "function");
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify$2(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify$2(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(globalThis.atob(input), (c) => c.codePointAt(0));
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}
function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return (
    key
      .split("?")[0]
      ?.replace(/[/\\]/g, ":")
      .replace(/:+/g, ":")
      .replace(/^:|:$/g, "") || ""
  );
}
function joinKeys(...keys) {
  return normalizeKey(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey(base);
  return base ? base + ":" : "";
}

function defineDriver(factory) {
  return factory;
}

const DRIVER_NAME = "memory";
const memory = defineDriver(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    },
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {},
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base],
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""],
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints
      .filter(
        (mountpoint) =>
          mountpoint.startsWith(base) ||
          (includeParent && base.startsWith(mountpoint)),
      )
      .map((mountpoint) => ({
        relativeBase:
          base.length > mountpoint.length
            ? base.slice(mountpoint.length)
            : undefined,
        mountpoint,
        driver: context.mounts[mountpoint],
      }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint,
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: [],
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey(isStringItem ? item : item.key);
      const value = isStringItem ? undefined : item.value;
      const options2 =
        isStringItem || !item.options
          ? commonOptions
          : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2,
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat(),
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then((value) =>
        destr(value),
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options,
            })),
            commonOptions,
          ).then((r) =>
            r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value),
            })),
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options,
            ).then((value) => ({
              key: item.key,
              value: destr(value),
            }));
          }),
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then((value) =>
        deserializeRaw(value),
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === undefined) {
        return storage.removeItem(key);
      }
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify$2(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify$2(item.value),
              options: item.options,
            })),
            commonOptions,
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify$2(item.value),
              item.options,
            );
          }),
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === undefined) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts,
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      for (const mount of mounts) {
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts,
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint)),
        ];
      }
      return base
        ? allKeys.filter(
            (key) => key.startsWith(base) && key[key.length - 1] !== "$",
          )
        : allKeys.filter((key) => key[key.length - 1] !== "$");
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts)),
            );
          }
        }),
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver)),
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback,
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base))
          .then((unwatcher) => {
            context.unwatch[base] = unwatcher;
          })
          .catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base,
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint,
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts),
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch
    ? driver.watch((event, key) => onChange(event, base + key))
    : () => {};
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const builtinDrivers = {
  "azure-app-configuration": "unstorage/drivers/azure-app-configuration",
  azureAppConfiguration: "unstorage/drivers/azure-app-configuration",
  "azure-cosmos": "unstorage/drivers/azure-cosmos",
  azureCosmos: "unstorage/drivers/azure-cosmos",
  "azure-key-vault": "unstorage/drivers/azure-key-vault",
  azureKeyVault: "unstorage/drivers/azure-key-vault",
  "azure-storage-blob": "unstorage/drivers/azure-storage-blob",
  azureStorageBlob: "unstorage/drivers/azure-storage-blob",
  "azure-storage-table": "unstorage/drivers/azure-storage-table",
  azureStorageTable: "unstorage/drivers/azure-storage-table",
  "capacitor-preferences": "unstorage/drivers/capacitor-preferences",
  capacitorPreferences: "unstorage/drivers/capacitor-preferences",
  "cloudflare-kv-binding": "unstorage/drivers/cloudflare-kv-binding",
  cloudflareKVBinding: "unstorage/drivers/cloudflare-kv-binding",
  "cloudflare-kv-http": "unstorage/drivers/cloudflare-kv-http",
  cloudflareKVHttp: "unstorage/drivers/cloudflare-kv-http",
  "cloudflare-r2-binding": "unstorage/drivers/cloudflare-r2-binding",
  cloudflareR2Binding: "unstorage/drivers/cloudflare-r2-binding",
  db0: "unstorage/drivers/db0",
  "deno-kv-node": "unstorage/drivers/deno-kv-node",
  denoKVNode: "unstorage/drivers/deno-kv-node",
  "deno-kv": "unstorage/drivers/deno-kv",
  denoKV: "unstorage/drivers/deno-kv",
  "fs-lite": "unstorage/drivers/fs-lite",
  fsLite: "unstorage/drivers/fs-lite",
  fs: "unstorage/drivers/fs",
  github: "unstorage/drivers/github",
  http: "unstorage/drivers/http",
  indexedb: "unstorage/drivers/indexedb",
  localstorage: "unstorage/drivers/localstorage",
  "lru-cache": "unstorage/drivers/lru-cache",
  lruCache: "unstorage/drivers/lru-cache",
  memory: "unstorage/drivers/memory",
  mongodb: "unstorage/drivers/mongodb",
  "netlify-blobs": "unstorage/drivers/netlify-blobs",
  netlifyBlobs: "unstorage/drivers/netlify-blobs",
  null: "unstorage/drivers/null",
  overlay: "unstorage/drivers/overlay",
  planetscale: "unstorage/drivers/planetscale",
  redis: "unstorage/drivers/redis",
  s3: "unstorage/drivers/s3",
  "session-storage": "unstorage/drivers/session-storage",
  sessionStorage: "unstorage/drivers/session-storage",
  uploadthing: "unstorage/drivers/uploadthing",
  upstash: "unstorage/drivers/upstash",
  "vercel-blob": "unstorage/drivers/vercel-blob",
  vercelBlob: "unstorage/drivers/vercel-blob",
  "vercel-kv": "unstorage/drivers/vercel-kv",
  vercelKV: "unstorage/drivers/vercel-kv",
};

const PERSIST_SYMBOL = Symbol();
const DEFAULT_COOKIE_NAME = "astro-session";
const VALID_COOKIE_REGEX = /^[\w-]+$/;
const unflatten = (parsed, _) => {
  return unflatten$1(parsed, {
    URL: (href) => new URL(href),
  });
};
const stringify$1 = (data, _) => {
  return stringify$3(data, {
    // Support URL objects
    URL: (val) => val instanceof URL && val.href,
  });
};
class AstroSession {
  // The cookies object.
  #cookies;
  // The session configuration.
  #config;
  // The cookie config
  #cookieConfig;
  // The cookie name
  #cookieName;
  // The unstorage object for the session driver.
  #storage;
  #data;
  // The session ID. A v4 UUID.
  #sessionID;
  // Sessions to destroy. Needed because we won't have the old session ID after it's destroyed locally.
  #toDestroy = /* @__PURE__ */ new Set();
  // Session keys to delete. Used for partial data sets to avoid overwriting the deleted value.
  #toDelete = /* @__PURE__ */ new Set();
  // Whether the session is dirty and needs to be saved.
  #dirty = false;
  // Whether the session cookie has been set.
  #cookieSet = false;
  // The local data is "partial" if it has not been loaded from storage yet and only
  // contains values that have been set or deleted in-memory locally.
  // We do this to avoid the need to block on loading data when it is only being set.
  // When we load the data from storage, we need to merge it with the local partial data,
  // preserving in-memory changes and deletions.
  #partial = true;
  constructor(
    cookies,
    { cookie: cookieConfig = DEFAULT_COOKIE_NAME, ...config },
  ) {
    this.#cookies = cookies;
    let cookieConfigObject;
    if (typeof cookieConfig === "object") {
      const { name = DEFAULT_COOKIE_NAME, ...rest } = cookieConfig;
      this.#cookieName = name;
      cookieConfigObject = rest;
    } else {
      this.#cookieName = cookieConfig || DEFAULT_COOKIE_NAME;
    }
    this.#cookieConfig = {
      sameSite: "lax",
      secure: true,
      path: "/",
      ...cookieConfigObject,
      httpOnly: true,
    };
    this.#config = config;
  }
  /**
   * Gets a session value. Returns `undefined` if the session or value does not exist.
   */
  async get(key) {
    return (await this.#ensureData()).get(key)?.data;
  }
  /**
   * Checks if a session value exists.
   */
  async has(key) {
    return (await this.#ensureData()).has(key);
  }
  /**
   * Gets all session values.
   */
  async keys() {
    return (await this.#ensureData()).keys();
  }
  /**
   * Gets all session values.
   */
  async values() {
    return [...(await this.#ensureData()).values()].map((entry) => entry.data);
  }
  /**
   * Gets all session entries.
   */
  async entries() {
    return [...(await this.#ensureData()).entries()].map(([key, entry]) => [
      key,
      entry.data,
    ]);
  }
  /**
   * Deletes a session value.
   */
  delete(key) {
    this.#data?.delete(key);
    if (this.#partial) {
      this.#toDelete.add(key);
    }
    this.#dirty = true;
  }
  /**
   * Sets a session value. The session is created if it does not exist.
   */
  set(key, value, { ttl } = {}) {
    if (!key) {
      throw new AstroError({
        ...SessionStorageSaveError,
        message: "The session key was not provided.",
      });
    }
    let cloned;
    try {
      cloned = unflatten(JSON.parse(stringify$1(value)));
    } catch (err) {
      throw new AstroError(
        {
          ...SessionStorageSaveError,
          message: `The session data for ${key} could not be serialized.`,
          hint: "See the devalue library for all supported types: https://github.com/rich-harris/devalue",
        },
        { cause: err },
      );
    }
    if (!this.#cookieSet) {
      this.#setCookie();
      this.#cookieSet = true;
    }
    this.#data ??= /* @__PURE__ */ new Map();
    const lifetime = ttl ?? this.#config.ttl;
    const expires =
      typeof lifetime === "number" ? Date.now() + lifetime * 1e3 : lifetime;
    this.#data.set(key, {
      data: cloned,
      expires,
    });
    this.#dirty = true;
  }
  /**
   * Destroys the session, clearing the cookie and storage if it exists.
   */
  destroy() {
    this.#destroySafe();
  }
  /**
   * Regenerates the session, creating a new session ID. The existing session data is preserved.
   */
  async regenerate() {
    let data = /* @__PURE__ */ new Map();
    try {
      data = await this.#ensureData();
    } catch (err) {
      console.error("Failed to load session data during regeneration:", err);
    }
    const oldSessionId = this.#sessionID;
    this.#sessionID = crypto.randomUUID();
    this.#data = data;
    await this.#setCookie();
    if (oldSessionId && this.#storage) {
      this.#storage.removeItem(oldSessionId).catch((err) => {
        console.error("Failed to remove old session data:", err);
      });
    }
  }
  // Persists the session data to storage.
  // This is called automatically at the end of the request.
  // Uses a symbol to prevent users from calling it directly.
  async [PERSIST_SYMBOL]() {
    if (!this.#dirty && !this.#toDestroy.size) {
      return;
    }
    const storage = await this.#ensureStorage();
    if (this.#dirty && this.#data) {
      const data = await this.#ensureData();
      this.#toDelete.forEach((key2) => data.delete(key2));
      const key = this.#ensureSessionID();
      let serialized;
      try {
        serialized = stringify$1(data);
      } catch (err) {
        throw new AstroError(
          {
            ...SessionStorageSaveError,
            message: SessionStorageSaveError.message(
              "The session data could not be serialized.",
              this.#config.driver,
            ),
          },
          { cause: err },
        );
      }
      await storage.setItem(key, serialized);
      this.#dirty = false;
    }
    if (this.#toDestroy.size > 0) {
      const cleanupPromises = [...this.#toDestroy].map((sessionId) =>
        storage.removeItem(sessionId).catch((err) => {
          console.error(`Failed to clean up session ${sessionId}:`, err);
        }),
      );
      await Promise.all(cleanupPromises);
      this.#toDestroy.clear();
    }
  }
  get sessionID() {
    return this.#sessionID;
  }
  /**
   * Sets the session cookie.
   */
  async #setCookie() {
    if (!VALID_COOKIE_REGEX.test(this.#cookieName)) {
      throw new AstroError({
        ...SessionStorageSaveError,
        message:
          "Invalid cookie name. Cookie names can only contain letters, numbers, and dashes.",
      });
    }
    const value = this.#ensureSessionID();
    this.#cookies.set(this.#cookieName, value, this.#cookieConfig);
  }
  /**
   * Attempts to load the session data from storage, or creates a new data object if none exists.
   * If there is existing partial data, it will be merged into the new data object.
   */
  async #ensureData() {
    const storage = await this.#ensureStorage();
    if (this.#data && !this.#partial) {
      return this.#data;
    }
    this.#data ??= /* @__PURE__ */ new Map();
    const raw = await storage.get(this.#ensureSessionID());
    if (!raw) {
      return this.#data;
    }
    try {
      const storedMap = unflatten(raw);
      if (!(storedMap instanceof Map)) {
        await this.#destroySafe();
        throw new AstroError({
          ...SessionStorageInitError,
          message: SessionStorageInitError.message(
            "The session data was an invalid type.",
            this.#config.driver,
          ),
        });
      }
      const now = Date.now();
      for (const [key, value] of storedMap) {
        const expired =
          typeof value.expires === "number" && value.expires < now;
        if (!this.#data.has(key) && !this.#toDelete.has(key) && !expired) {
          this.#data.set(key, value);
        }
      }
      this.#partial = false;
      return this.#data;
    } catch (err) {
      await this.#destroySafe();
      if (err instanceof AstroError) {
        throw err;
      }
      throw new AstroError(
        {
          ...SessionStorageInitError,
          message: SessionStorageInitError.message(
            "The session data could not be parsed.",
            this.#config.driver,
          ),
        },
        { cause: err },
      );
    }
  }
  /**
   * Safely destroys the session, clearing the cookie and storage if it exists.
   */
  #destroySafe() {
    if (this.#sessionID) {
      this.#toDestroy.add(this.#sessionID);
    }
    if (this.#cookieName) {
      this.#cookies.delete(this.#cookieName, this.#cookieConfig);
    }
    this.#sessionID = undefined;
    this.#data = undefined;
    this.#dirty = true;
  }
  /**
   * Returns the session ID, generating a new one if it does not exist.
   */
  #ensureSessionID() {
    this.#sessionID ??=
      this.#cookies.get(this.#cookieName)?.value ?? crypto.randomUUID();
    return this.#sessionID;
  }
  /**
   * Ensures the storage is initialized.
   * This is called automatically when a storage operation is needed.
   */
  async #ensureStorage() {
    if (this.#storage) {
      return this.#storage;
    }
    if (this.#config.driver === "test") {
      this.#storage = this.#config.options.mockStorage;
      return this.#storage;
    }
    if (
      this.#config.driver === "fs" ||
      this.#config.driver === "fsLite" ||
      this.#config.driver === "fs-lite"
    ) {
      this.#config.options ??= {};
      this.#config.driver = "fs-lite";
      this.#config.options.base ??= ".astro/session";
    }
    if (!this.#config?.driver) {
      throw new AstroError({
        ...SessionStorageInitError,
        message: SessionStorageInitError.message(
          "No driver was defined in the session configuration and the adapter did not provide a default driver.",
        ),
      });
    }
    let driver = null;
    const driverPackage = await resolveSessionDriver(this.#config.driver);
    try {
      if (this.#config.driverModule) {
        driver = (await this.#config.driverModule()).default;
      } else if (driverPackage) {
        driver = (await import(driverPackage)).default;
      }
    } catch (err) {
      if (err.code === "ERR_MODULE_NOT_FOUND") {
        throw new AstroError(
          {
            ...SessionStorageInitError,
            message: SessionStorageInitError.message(
              err.message.includes(`Cannot find package '${driverPackage}'`)
                ? "The driver module could not be found."
                : err.message,
              this.#config.driver,
            ),
          },
          { cause: err },
        );
      }
      throw err;
    }
    if (!driver) {
      throw new AstroError({
        ...SessionStorageInitError,
        message: SessionStorageInitError.message(
          "The module did not export a driver.",
          this.#config.driver,
        ),
      });
    }
    try {
      this.#storage = createStorage({
        driver: driver(this.#config.options),
      });
      return this.#storage;
    } catch (err) {
      throw new AstroError(
        {
          ...SessionStorageInitError,
          message: SessionStorageInitError.message(
            "Unknown error",
            this.#config.driver,
          ),
        },
        { cause: err },
      );
    }
  }
}
function resolveSessionDriver(driver) {
  if (!driver) {
    return null;
  }
  if (driver === "fs") {
    return import.meta.resolve(builtinDrivers.fsLite);
  }
  if (driver in builtinDrivers) {
    return import.meta.resolve(builtinDrivers[driver]);
  }
  return driver;
}

const apiContextRoutesSymbol = Symbol.for("context.routes");
class RenderContext {
  constructor(
    pipeline,
    locals,
    middleware,
    pathname,
    request,
    routeData,
    status,
    clientAddress,
    cookies = new AstroCookies(request),
    params = getParams(routeData, pathname),
    url = new URL(request.url),
    props = {},
    partial = undefined,
    session = pipeline.manifest.sessionConfig
      ? new AstroSession(cookies, pipeline.manifest.sessionConfig)
      : undefined,
  ) {
    this.pipeline = pipeline;
    this.locals = locals;
    this.middleware = middleware;
    this.pathname = pathname;
    this.request = request;
    this.routeData = routeData;
    this.status = status;
    this.clientAddress = clientAddress;
    this.cookies = cookies;
    this.params = params;
    this.url = url;
    this.props = props;
    this.partial = partial;
    this.session = session;
  }
  /**
   * A flag that tells the render content if the rewriting was triggered
   */
  isRewriting = false;
  /**
   * A safety net in case of loops
   */
  counter = 0;
  static async create({
    locals = {},
    middleware,
    pathname,
    pipeline,
    request,
    routeData,
    clientAddress,
    status = 200,
    props,
    partial = undefined,
  }) {
    const pipelineMiddleware = await pipeline.getMiddleware();
    setOriginPathname(request, pathname);
    return new RenderContext(
      pipeline,
      locals,
      sequence(
        ...pipeline.internalMiddleware,
        middleware ?? pipelineMiddleware,
      ),
      pathname,
      request,
      routeData,
      status,
      clientAddress,
      undefined,
      undefined,
      undefined,
      props,
      partial,
    );
  }
  /**
   * The main function of the RenderContext.
   *
   * Use this function to render any route known to Astro.
   * It attempts to render a route. A route can be a:
   *
   * - page
   * - redirect
   * - endpoint
   * - fallback
   */
  async render(componentInstance, slots = {}) {
    const { cookies, middleware, pipeline } = this;
    const { logger, serverLike, streaming, manifest } = pipeline;
    const props =
      Object.keys(this.props).length > 0
        ? this.props
        : await getProps({
            mod: componentInstance,
            routeData: this.routeData,
            routeCache: this.pipeline.routeCache,
            pathname: this.pathname,
            logger,
            serverLike,
            base: manifest.base,
          });
    const apiContext = this.createAPIContext(props);
    this.counter++;
    if (this.counter === 4) {
      return new Response("Loop Detected", {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/508
        status: 508,
        statusText:
          "Astro detected a loop where you tried to call the rewriting logic more than four times.",
      });
    }
    const lastNext = async (ctx, payload) => {
      if (payload) {
        pipeline.logger.debug("router", "Called rewriting to:", payload);
        const {
          routeData,
          componentInstance: newComponent,
          pathname,
          newUrl,
        } = await pipeline.tryRewrite(payload, this.request);
        if (
          this.pipeline.serverLike === true &&
          this.routeData.prerender === false &&
          routeData.prerender === true
        ) {
          throw new AstroError({
            ...ForbiddenRewrite,
            message: ForbiddenRewrite.message(
              this.pathname,
              pathname,
              routeData.component,
            ),
            hint: ForbiddenRewrite.hint(routeData.component),
          });
        }
        this.routeData = routeData;
        componentInstance = newComponent;
        if (payload instanceof Request) {
          this.request = payload;
        } else {
          this.request = copyRequest(
            newUrl,
            this.request,
            // need to send the flag of the previous routeData
            routeData.prerender,
            this.pipeline.logger,
            this.routeData.route,
          );
        }
        this.isRewriting = true;
        this.url = new URL(this.request.url);
        this.cookies = new AstroCookies(this.request);
        this.params = getParams(routeData, pathname);
        this.pathname = pathname;
        this.status = 200;
      }
      let response2;
      switch (this.routeData.type) {
        case "endpoint": {
          response2 = await renderEndpoint(
            componentInstance,
            ctx,
            this.routeData.prerender,
            logger,
          );
          break;
        }
        case "redirect":
          return renderRedirect(this);
        case "page": {
          const result = await this.createResult(componentInstance);
          try {
            response2 = await renderPage(
              result,
              componentInstance?.default,
              props,
              slots,
              streaming,
              this.routeData,
            );
          } catch (e) {
            result.cancelled = true;
            throw e;
          }
          response2.headers.set(ROUTE_TYPE_HEADER, "page");
          if (
            this.routeData.route === "/404" ||
            this.routeData.route === "/500"
          ) {
            response2.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
          }
          if (this.isRewriting) {
            response2.headers.set(
              REWRITE_DIRECTIVE_HEADER_KEY,
              REWRITE_DIRECTIVE_HEADER_VALUE,
            );
          }
          break;
        }
        case "fallback": {
          return new Response(null, {
            status: 500,
            headers: { [ROUTE_TYPE_HEADER]: "fallback" },
          });
        }
      }
      const responseCookies = getCookiesFromResponse(response2);
      if (responseCookies) {
        cookies.merge(responseCookies);
      }
      return response2;
    };
    const response = await callMiddleware(middleware, apiContext, lastNext);
    if (response.headers.get(ROUTE_TYPE_HEADER)) {
      response.headers.delete(ROUTE_TYPE_HEADER);
    }
    attachCookiesToResponse(response, cookies);
    return response;
  }
  createAPIContext(props) {
    const context = this.createActionAPIContext();
    const redirect = (path, status = 302) =>
      new Response(null, { status, headers: { Location: path } });
    Reflect.set(context, apiContextRoutesSymbol, this.pipeline);
    return Object.assign(context, {
      props,
      redirect,
      getActionResult: createGetActionResult(context.locals),
      callAction: createCallAction(context),
    });
  }
  async #executeRewrite(reroutePayload) {
    this.pipeline.logger.debug("router", "Calling rewrite: ", reroutePayload);
    const { routeData, componentInstance, newUrl, pathname } =
      await this.pipeline.tryRewrite(reroutePayload, this.request);
    if (
      this.pipeline.serverLike === true &&
      this.routeData.prerender === false &&
      routeData.prerender === true
    ) {
      throw new AstroError({
        ...ForbiddenRewrite,
        message: ForbiddenRewrite.message(
          this.pathname,
          pathname,
          routeData.component,
        ),
        hint: ForbiddenRewrite.hint(routeData.component),
      });
    }
    this.routeData = routeData;
    if (reroutePayload instanceof Request) {
      this.request = reroutePayload;
    } else {
      this.request = copyRequest(
        newUrl,
        this.request,
        // need to send the flag of the previous routeData
        routeData.prerender,
        this.pipeline.logger,
        this.routeData.route,
      );
    }
    this.url = new URL(this.request.url);
    this.cookies = new AstroCookies(this.request);
    this.params = getParams(routeData, pathname);
    this.pathname = pathname;
    this.isRewriting = true;
    this.status = 200;
    return await this.render(componentInstance);
  }
  createActionAPIContext() {
    const renderContext = this;
    const { cookies, params, pipeline, url, session } = this;
    const generator = `Astro v${ASTRO_VERSION}`;
    const rewrite = async (reroutePayload) => {
      return await this.#executeRewrite(reroutePayload);
    };
    return {
      cookies,
      routePattern: this.routeData.route,
      isPrerendered: this.routeData.prerender,
      get clientAddress() {
        return renderContext.getClientAddress();
      },
      get currentLocale() {
        return renderContext.computeCurrentLocale();
      },
      generator,
      get locals() {
        return renderContext.locals;
      },
      set locals(_) {
        throw new AstroError(LocalsReassigned);
      },
      params,
      get preferredLocale() {
        return renderContext.computePreferredLocale();
      },
      get preferredLocaleList() {
        return renderContext.computePreferredLocaleList();
      },
      rewrite,
      request: this.request,
      site: pipeline.site,
      url,
      get originPathname() {
        return getOriginPathname(renderContext.request);
      },
      session,
    };
  }
  async createResult(mod) {
    const { cookies, pathname, pipeline, routeData, status } = this;
    const {
      clientDirectives,
      inlinedScripts,
      compressHTML,
      manifest,
      renderers,
      resolve,
    } = pipeline;
    const { links, scripts, styles } = await pipeline.headElements(routeData);
    const componentMetadata =
      (await pipeline.componentMetadata(routeData)) ??
      manifest.componentMetadata;
    const headers = new Headers({ "Content-Type": "text/html" });
    const partial =
      typeof this.partial === "boolean" ? this.partial : Boolean(mod.partial);
    const actionResult = hasActionPayload(this.locals)
      ? deserializeActionResult(this.locals._actionPayload.actionResult)
      : undefined;
    const response = {
      status: actionResult?.error ? actionResult?.error.status : status,
      statusText: actionResult?.error ? actionResult?.error.type : "OK",
      get headers() {
        return headers;
      },
      // Disallow `Astro.response.headers = new Headers`
      set headers(_) {
        throw new AstroError(AstroResponseHeadersReassigned);
      },
    };
    const result = {
      base: manifest.base,
      cancelled: false,
      clientDirectives,
      inlinedScripts,
      componentMetadata,
      compressHTML,
      cookies,
      /** This function returns the `Astro` faux-global */
      createAstro: (astroGlobal, props, slots) =>
        this.createAstro(result, astroGlobal, props, slots),
      links,
      params: this.params,
      partial,
      pathname,
      renderers,
      resolve,
      response,
      request: this.request,
      scripts,
      styles,
      actionResult,
      serverIslandNameMap:
        manifest.serverIslandNameMap ?? /* @__PURE__ */ new Map(),
      key: manifest.key,
      trailingSlash: manifest.trailingSlash,
      _metadata: {
        hasHydrationScript: false,
        rendererSpecificHydrationScripts: /* @__PURE__ */ new Set(),
        hasRenderedHead: false,
        renderedScripts: /* @__PURE__ */ new Set(),
        hasDirectives: /* @__PURE__ */ new Set(),
        headInTree: false,
        extraHead: [],
        propagators: /* @__PURE__ */ new Set(),
      },
    };
    return result;
  }
  #astroPagePartial;
  /**
   * The Astro global is sourced in 3 different phases:
   * - **Static**: `.generator` and `.glob` is printed by the compiler, instantiated once per process per astro file
   * - **Page-level**: `.request`, `.cookies`, `.locals` etc. These remain the same for the duration of the request.
   * - **Component-level**: `.props`, `.slots`, and `.self` are unique to each _use_ of each component.
   *
   * The page level partial is used as the prototype of the user-visible `Astro` global object, which is instantiated once per use of a component.
   */
  createAstro(result, astroStaticPartial, props, slotValues) {
    let astroPagePartial;
    if (this.isRewriting) {
      astroPagePartial = this.#astroPagePartial = this.createAstroPagePartial(
        result,
        astroStaticPartial,
      );
    } else {
      astroPagePartial = this.#astroPagePartial ??= this.createAstroPagePartial(
        result,
        astroStaticPartial,
      );
    }
    const astroComponentPartial = { props, self: null };
    const Astro = Object.assign(
      Object.create(astroPagePartial),
      astroComponentPartial,
    );
    let _slots;
    Object.defineProperty(Astro, "slots", {
      get: () => {
        if (!_slots) {
          _slots = new Slots(result, slotValues, this.pipeline.logger);
        }
        return _slots;
      },
    });
    return Astro;
  }
  createAstroPagePartial(result, astroStaticPartial) {
    const renderContext = this;
    const { cookies, locals, params, pipeline, url, session } = this;
    const { response } = result;
    const redirect = (path, status = 302) => {
      if (this.request[responseSentSymbol$1]) {
        throw new AstroError({
          ...ResponseSentError,
        });
      }
      return new Response(null, { status, headers: { Location: path } });
    };
    const rewrite = async (reroutePayload) => {
      return await this.#executeRewrite(reroutePayload);
    };
    return {
      generator: astroStaticPartial.generator,
      glob: astroStaticPartial.glob,
      routePattern: this.routeData.route,
      isPrerendered: this.routeData.prerender,
      cookies,
      session,
      get clientAddress() {
        return renderContext.getClientAddress();
      },
      get currentLocale() {
        return renderContext.computeCurrentLocale();
      },
      params,
      get preferredLocale() {
        return renderContext.computePreferredLocale();
      },
      get preferredLocaleList() {
        return renderContext.computePreferredLocaleList();
      },
      locals,
      redirect,
      rewrite,
      request: this.request,
      response,
      site: pipeline.site,
      getActionResult: createGetActionResult(locals),
      get callAction() {
        return createCallAction(this);
      },
      url,
      get originPathname() {
        return getOriginPathname(renderContext.request);
      },
    };
  }
  getClientAddress() {
    const { pipeline, request, routeData, clientAddress } = this;
    if (routeData.prerender) {
      throw new AstroError(PrerenderClientAddressNotAvailable);
    }
    if (clientAddress) {
      return clientAddress;
    }
    if (clientAddressSymbol in request) {
      return Reflect.get(request, clientAddressSymbol);
    }
    if (pipeline.adapterName) {
      throw new AstroError({
        ...ClientAddressNotAvailable,
        message: ClientAddressNotAvailable.message(pipeline.adapterName),
      });
    }
    throw new AstroError(StaticClientAddressNotAvailable);
  }
  /**
   * API Context may be created multiple times per request, i18n data needs to be computed only once.
   * So, it is computed and saved here on creation of the first APIContext and reused for later ones.
   */
  #currentLocale;
  computeCurrentLocale() {
    const {
      url,
      pipeline: { i18n },
      routeData,
    } = this;
    if (!i18n) return;
    const { defaultLocale, locales, strategy } = i18n;
    const fallbackTo =
      strategy === "pathname-prefix-other-locales" ||
      strategy === "domains-prefix-other-locales"
        ? defaultLocale
        : undefined;
    if (this.#currentLocale) {
      return this.#currentLocale;
    }
    let computedLocale;
    if (routeData.component === SERVER_ISLAND_COMPONENT) {
      let referer = this.request.headers.get("referer");
      if (referer) {
        if (URL.canParse(referer)) {
          referer = new URL(referer).pathname;
        }
        computedLocale = computeCurrentLocale(referer, locales, defaultLocale);
      }
    } else {
      let pathname = routeData.pathname;
      if (!routeData.pattern.test(url.pathname)) {
        for (const fallbackRoute of routeData.fallbackRoutes) {
          if (fallbackRoute.pattern.test(url.pathname)) {
            pathname = fallbackRoute.pathname;
            break;
          }
        }
      }
      pathname =
        pathname && !isRoute404or500(routeData) ? pathname : url.pathname;
      computedLocale = computeCurrentLocale(pathname, locales, defaultLocale);
    }
    this.#currentLocale = computedLocale ?? fallbackTo;
    return this.#currentLocale;
  }
  #preferredLocale;
  computePreferredLocale() {
    const {
      pipeline: { i18n },
      request,
    } = this;
    if (!i18n) return;
    return (this.#preferredLocale ??= computePreferredLocale(
      request,
      i18n.locales,
    ));
  }
  #preferredLocaleList;
  computePreferredLocaleList() {
    const {
      pipeline: { i18n },
      request,
    } = this;
    if (!i18n) return;
    return (this.#preferredLocaleList ??= computePreferredLocaleList(
      request,
      i18n.locales,
    ));
  }
}

function getAssetsPrefix(fileExtension, assetsPrefix) {
  if (!assetsPrefix) return "";
  if (typeof assetsPrefix === "string") return assetsPrefix;
  const dotLessFileExtension = fileExtension.slice(1);
  if (assetsPrefix[dotLessFileExtension]) {
    return assetsPrefix[dotLessFileExtension];
  }
  return assetsPrefix.fallback;
}

function createAssetLink(href, base, assetsPrefix) {
  if (assetsPrefix) {
    const pf = getAssetsPrefix(fileExtension(href), assetsPrefix);
    return joinPaths(pf, slash(href));
  } else if (base) {
    return prependForwardSlash(joinPaths(base, slash(href)));
  } else {
    return href;
  }
}
function createStylesheetElement(stylesheet, base, assetsPrefix) {
  if (stylesheet.type === "inline") {
    return {
      props: {},
      children: stylesheet.content,
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix),
      },
      children: "",
    };
  }
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix) {
  return new Set(
    stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix)),
  );
}
function createModuleScriptElement(script, base, assetsPrefix) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module",
      },
      children: script.value,
    };
  }
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix),
    },
    children: "",
  };
}

class AppPipeline extends Pipeline {
  #manifestData;
  static create(
    manifestData,
    {
      logger,
      manifest,
      runtimeMode,
      renderers,
      resolve,
      serverLike,
      streaming,
      defaultRoutes,
    },
  ) {
    const pipeline = new AppPipeline(
      logger,
      manifest,
      runtimeMode,
      renderers,
      resolve,
      serverLike,
      streaming,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      defaultRoutes,
    );
    pipeline.#manifestData = manifestData;
    return pipeline;
  }
  headElements(routeData) {
    const routeInfo = this.manifest.routes.find(
      (route) => route.routeData === routeData,
    );
    const links = /* @__PURE__ */ new Set();
    const scripts = /* @__PURE__ */ new Set();
    const styles = createStylesheetElementSet(routeInfo?.styles ?? []);
    for (const script of routeInfo?.scripts ?? []) {
      if ("stage" in script) {
        if (script.stage === "head-inline") {
          scripts.add({
            props: {},
            children: script.children,
          });
        }
      } else {
        scripts.add(createModuleScriptElement(script));
      }
    }
    return { links, styles, scripts };
  }
  componentMetadata() {}
  async getComponentByRoute(routeData) {
    const module = await this.getModuleForRoute(routeData);
    return module.page();
  }
  async tryRewrite(payload, request) {
    const { newUrl, pathname, routeData } = findRouteToRewrite({
      payload,
      request,
      routes: this.manifest?.routes.map((r) => r.routeData),
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat,
      base: this.manifest.base,
    });
    const componentInstance = await this.getComponentByRoute(routeData);
    return { newUrl, pathname, componentInstance, routeData };
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes) {
      if (route.component === defaultRoute.component) {
        return {
          page: () => Promise.resolve(defaultRoute.instance),
          renderers: [],
        };
      }
    }
    if (route.type === "redirect") {
      return RedirectSinglePageBuiltModule;
    } else {
      if (this.manifest.pageMap) {
        const importComponentInstance = this.manifest.pageMap.get(
          route.component,
        );
        if (!importComponentInstance) {
          throw new Error(
            `Unexpectedly unable to find a component instance for route ${route.route}`,
          );
        }
        return await importComponentInstance();
      } else if (this.manifest.pageModule) {
        return this.manifest.pageModule;
      }
      throw new Error(
        "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue.",
      );
    }
  }
}

class App {
  #manifest;
  #manifestData;
  #logger = new Logger({
    dest: consoleLogDestination,
    level: "info",
  });
  #baseWithoutTrailingSlash;
  #pipeline;
  #adapterLogger;
  #renderOptionsDeprecationWarningShown = false;
  constructor(manifest, streaming = true) {
    this.#manifest = manifest;
    this.#manifestData = {
      routes: manifest.routes.map((route) => route.routeData),
    };
    ensure404Route(this.#manifestData);
    this.#baseWithoutTrailingSlash = removeTrailingForwardSlash(
      this.#manifest.base,
    );
    this.#pipeline = this.#createPipeline(this.#manifestData, streaming);
    this.#adapterLogger = new AstroIntegrationLogger(
      this.#logger.options,
      this.#manifest.adapterName,
    );
  }
  getAdapterLogger() {
    return this.#adapterLogger;
  }
  /**
   * Creates a pipeline by reading the stored manifest
   *
   * @param manifestData
   * @param streaming
   * @private
   */
  #createPipeline(manifestData, streaming = false) {
    return AppPipeline.create(manifestData, {
      logger: this.#logger,
      manifest: this.#manifest,
      runtimeMode: "production",
      renderers: this.#manifest.renderers,
      defaultRoutes: createDefaultRoutes(this.#manifest),
      resolve: async (specifier) => {
        if (!(specifier in this.#manifest.entryModules)) {
          throw new Error(`Unable to resolve [${specifier}]`);
        }
        const bundlePath = this.#manifest.entryModules[specifier];
        if (bundlePath.startsWith("data:") || bundlePath.length === 0) {
          return bundlePath;
        } else {
          return createAssetLink(
            bundlePath,
            this.#manifest.base,
            this.#manifest.assetsPrefix,
          );
        }
      },
      serverLike: true,
      streaming,
    });
  }
  set setManifestData(newManifestData) {
    this.#manifestData = newManifestData;
  }
  removeBase(pathname) {
    if (pathname.startsWith(this.#manifest.base)) {
      return pathname.slice(this.#baseWithoutTrailingSlash.length + 1);
    }
    return pathname;
  }
  /**
   * It removes the base from the request URL, prepends it with a forward slash and attempts to decoded it.
   *
   * If the decoding fails, it logs the error and return the pathname as is.
   * @param request
   * @private
   */
  #getPathnameFromRequest(request) {
    const url = new URL(request.url);
    const pathname = prependForwardSlash(this.removeBase(url.pathname));
    try {
      return decodeURI(pathname);
    } catch (e) {
      this.getAdapterLogger().error(e.toString());
      return pathname;
    }
  }
  match(request) {
    const url = new URL(request.url);
    if (this.#manifest.assets.has(url.pathname)) return undefined;
    let pathname = this.#computePathnameFromDomain(request);
    if (!pathname) {
      pathname = prependForwardSlash(this.removeBase(url.pathname));
    }
    let routeData = matchRoute(pathname, this.#manifestData);
    if (!routeData || routeData.prerender) return undefined;
    return routeData;
  }
  #computePathnameFromDomain(request) {
    let pathname = undefined;
    const url = new URL(request.url);
    if (
      this.#manifest.i18n &&
      (this.#manifest.i18n.strategy === "domains-prefix-always" ||
        this.#manifest.i18n.strategy === "domains-prefix-other-locales" ||
        this.#manifest.i18n.strategy === "domains-prefix-always-no-redirect")
    ) {
      let host = request.headers.get("X-Forwarded-Host");
      let protocol = request.headers.get("X-Forwarded-Proto");
      if (protocol) {
        protocol = protocol + ":";
      } else {
        protocol = url.protocol;
      }
      if (!host) {
        host = request.headers.get("Host");
      }
      if (host && protocol) {
        host = host.split(":")[0];
        try {
          let locale;
          const hostAsUrl = new URL(`${protocol}//${host}`);
          for (const [domainKey, localeValue] of Object.entries(
            this.#manifest.i18n.domainLookupTable,
          )) {
            const domainKeyAsUrl = new URL(domainKey);
            if (
              hostAsUrl.host === domainKeyAsUrl.host &&
              hostAsUrl.protocol === domainKeyAsUrl.protocol
            ) {
              locale = localeValue;
              break;
            }
          }
          if (locale) {
            pathname = prependForwardSlash(
              joinPaths(
                normalizeTheLocale(locale),
                this.removeBase(url.pathname),
              ),
            );
            if (url.pathname.endsWith("/")) {
              pathname = appendForwardSlash(pathname);
            }
          }
        } catch (e) {
          this.#logger.error(
            "router",
            `Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`,
          );
          this.#logger.error("router", `Error: ${e}`);
        }
      }
    }
    return pathname;
  }
  async render(request, renderOptions) {
    let routeData;
    let locals;
    let clientAddress;
    let addCookieHeader;
    addCookieHeader = renderOptions?.addCookieHeader;
    clientAddress =
      renderOptions?.clientAddress ?? Reflect.get(request, clientAddressSymbol);
    routeData = renderOptions?.routeData;
    locals = renderOptions?.locals;
    if (routeData) {
      this.#logger.debug(
        "router",
        "The adapter " +
          this.#manifest.adapterName +
          " provided a custom RouteData for ",
        request.url,
      );
      this.#logger.debug("router", "RouteData:\n" + routeData);
    }
    if (locals) {
      if (typeof locals !== "object") {
        const error = new AstroError(LocalsNotAnObject);
        this.#logger.error(null, error.stack);
        return this.#renderError(request, {
          status: 500,
          error,
          clientAddress,
        });
      }
    }
    if (!routeData) {
      routeData = this.match(request);
      this.#logger.debug(
        "router",
        "Astro matched the following route for " + request.url,
      );
      this.#logger.debug("router", "RouteData:\n" + routeData);
    }
    if (!routeData) {
      this.#logger.debug(
        "router",
        "Astro hasn't found routes that match " + request.url,
      );
      this.#logger.debug(
        "router",
        "Here's the available routes:\n",
        this.#manifestData,
      );
      return this.#renderError(request, { locals, status: 404, clientAddress });
    }
    const pathname = this.#getPathnameFromRequest(request);
    const defaultStatus = this.#getDefaultStatusCode(routeData, pathname);
    let response;
    let session;
    try {
      const mod = await this.#pipeline.getModuleForRoute(routeData);
      const renderContext = await RenderContext.create({
        pipeline: this.#pipeline,
        locals,
        pathname,
        request,
        routeData,
        status: defaultStatus,
        clientAddress,
      });
      session = renderContext.session;
      response = await renderContext.render(await mod.page());
    } catch (err) {
      this.#logger.error(null, err.stack || err.message || String(err));
      return this.#renderError(request, {
        locals,
        status: 500,
        error: err,
        clientAddress,
      });
    } finally {
      await session?.[PERSIST_SYMBOL]();
    }
    if (
      REROUTABLE_STATUS_CODES.includes(response.status) &&
      response.headers.get(REROUTE_DIRECTIVE_HEADER) !== "no"
    ) {
      return this.#renderError(request, {
        locals,
        response,
        status: response.status,
        // We don't have an error to report here. Passing null means we pass nothing intentionally
        // while undefined means there's no error
        error: response.status === 500 ? null : undefined,
        clientAddress,
      });
    }
    if (response.headers.has(REROUTE_DIRECTIVE_HEADER)) {
      response.headers.delete(REROUTE_DIRECTIVE_HEADER);
    }
    if (addCookieHeader) {
      for (const setCookieHeaderValue of App.getSetCookieFromResponse(
        response,
      )) {
        response.headers.append("set-cookie", setCookieHeaderValue);
      }
    }
    Reflect.set(response, responseSentSymbol$1, true);
    return response;
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
  /**
   * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
   * For example,
   * ```ts
   * for (const cookie_ of App.getSetCookieFromResponse(response)) {
   *     const cookie: string = cookie_
   * }
   * ```
   * @param response The response to read cookies from.
   * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
   */
  static getSetCookieFromResponse = getSetCookiesFromResponse;
  /**
   * If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
   * This also handles pre-rendered /404 or /500 routes
   */
  async #renderError(
    request,
    {
      locals,
      status,
      response: originalResponse,
      skipMiddleware = false,
      error,
      clientAddress,
    },
  ) {
    const errorRoutePath = `/${status}${this.#manifest.trailingSlash === "always" ? "/" : ""}`;
    const errorRouteData = matchRoute(errorRoutePath, this.#manifestData);
    const url = new URL(request.url);
    if (errorRouteData) {
      if (errorRouteData.prerender) {
        const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`)
          ? ".html"
          : "";
        const statusURL = new URL(
          `${this.#baseWithoutTrailingSlash}/${status}${maybeDotHtml}`,
          url,
        );
        if (statusURL.toString() !== request.url) {
          const response2 = await fetch(statusURL.toString());
          const override = { status };
          return this.#mergeResponses(response2, originalResponse, override);
        }
      }
      const mod = await this.#pipeline.getModuleForRoute(errorRouteData);
      let session;
      try {
        const renderContext = await RenderContext.create({
          locals,
          pipeline: this.#pipeline,
          middleware: skipMiddleware ? NOOP_MIDDLEWARE_FN : void 0,
          pathname: this.#getPathnameFromRequest(request),
          request,
          routeData: errorRouteData,
          status,
          props: { error },
          clientAddress,
        });
        session = renderContext.session;
        const response2 = await renderContext.render(await mod.page());
        return this.#mergeResponses(response2, originalResponse);
      } catch {
        if (skipMiddleware === false) {
          return this.#renderError(request, {
            locals,
            status,
            response: originalResponse,
            skipMiddleware: true,
            clientAddress,
          });
        }
      } finally {
        await session?.[PERSIST_SYMBOL]();
      }
    }
    const response = this.#mergeResponses(
      new Response(null, { status }),
      originalResponse,
    );
    Reflect.set(response, responseSentSymbol$1, true);
    return response;
  }
  #mergeResponses(newResponse, originalResponse, override) {
    if (!originalResponse) {
      if (override !== undefined) {
        return new Response(newResponse.body, {
          status: override.status,
          statusText: newResponse.statusText,
          headers: newResponse.headers,
        });
      }
      return newResponse;
    }
    const status = override?.status
      ? override.status
      : originalResponse.status === 200
        ? newResponse.status
        : originalResponse.status;
    try {
      originalResponse.headers.delete("Content-type");
    } catch {}
    const mergedHeaders = new Map([
      ...Array.from(newResponse.headers),
      ...Array.from(originalResponse.headers),
    ]);
    const newHeaders = new Headers();
    for (const [name, value] of mergedHeaders) {
      newHeaders.set(name, value);
    }
    return new Response(newResponse.body, {
      status,
      statusText:
        status === 200 ? newResponse.statusText : originalResponse.statusText,
      // If you're looking at here for possible bugs, it means that it's not a bug.
      // With the middleware, users can meddle with headers, and we should pass to the 404/500.
      // If users see something weird, it's because they are setting some headers they should not.
      //
      // Although, we don't want it to replace the content-type, because the error page must return `text/html`
      headers: newHeaders,
    });
  }
  #getDefaultStatusCode(routeData, pathname) {
    if (!routeData.pattern.test(pathname)) {
      for (const fallbackRoute of routeData.fallbackRoutes) {
        if (fallbackRoute.pattern.test(pathname)) {
          return 302;
        }
      }
    }
    const route = removeTrailingForwardSlash(routeData.route);
    if (route.endsWith("/404")) return 404;
    if (route.endsWith("/500")) return 500;
    return 200;
  }
}

const createOutgoingHttpHeaders = (headers) => {
  if (!headers) {
    return undefined;
  }
  const nodeHeaders = Object.fromEntries(headers.entries());
  if (Object.keys(nodeHeaders).length === 0) {
    return undefined;
  }
  if (headers.has("set-cookie")) {
    const cookieHeaders = headers.getSetCookie();
    if (cookieHeaders.length > 1) {
      nodeHeaders["set-cookie"] = cookieHeaders;
    }
  }
  return nodeHeaders;
};

function apply() {
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, "crypto", {
      value: crypto$1.webcrypto,
    });
  }
  if (!globalThis.File) {
    Object.defineProperty(globalThis, "File", {
      value: buffer.File,
    });
  }
}

class NodeApp extends App {
  match(req) {
    if (!(req instanceof Request)) {
      req = NodeApp.createRequest(req, {
        skipBody: true,
      });
    }
    return super.match(req);
  }
  render(req, routeDataOrOptions, maybeLocals) {
    if (!(req instanceof Request)) {
      req = NodeApp.createRequest(req);
    }
    return super.render(req, routeDataOrOptions, maybeLocals);
  }
  /**
   * Converts a NodeJS IncomingMessage into a web standard Request.
   * ```js
   * import { NodeApp } from 'astro/app/node';
   * import { createServer } from 'node:http';
   *
   * const server = createServer(async (req, res) => {
   *     const request = NodeApp.createRequest(req);
   *     const response = await app.render(request);
   *     await NodeApp.writeResponse(response, res);
   * })
   * ```
   */
  static createRequest(req, { skipBody = false } = {}) {
    const isEncrypted = "encrypted" in req.socket && req.socket.encrypted;
    const getFirstForwardedValue = (multiValueHeader) => {
      return multiValueHeader
        ?.toString()
        ?.split(",")
        .map((e) => e.trim())?.[0];
    };
    const forwardedProtocol = getFirstForwardedValue(
      req.headers["x-forwarded-proto"],
    );
    const protocol = forwardedProtocol ?? (isEncrypted ? "https" : "http");
    const forwardedHostname = getFirstForwardedValue(
      req.headers["x-forwarded-host"],
    );
    const hostname =
      forwardedHostname ?? req.headers.host ?? req.headers[":authority"];
    const port = getFirstForwardedValue(req.headers["x-forwarded-port"]);
    const portInHostname =
      typeof hostname === "string" && /:\d+$/.test(hostname);
    const hostnamePort = portInHostname
      ? hostname
      : `${hostname}${port ? `:${port}` : ""}`;
    const url = `${protocol}://${hostnamePort}${req.url}`;
    const options = {
      method: req.method || "GET",
      headers: makeRequestHeaders(req),
    };
    const bodyAllowed =
      options.method !== "HEAD" &&
      options.method !== "GET" &&
      skipBody === false;
    if (bodyAllowed) {
      Object.assign(options, makeRequestBody(req));
    }
    const request = new Request(url, options);
    const forwardedClientIp = getFirstForwardedValue(
      req.headers["x-forwarded-for"],
    );
    const clientIp = forwardedClientIp || req.socket?.remoteAddress;
    if (clientIp) {
      Reflect.set(request, clientAddressSymbol, clientIp);
    }
    return request;
  }
  /**
   * Streams a web-standard Response into a NodeJS Server Response.
   * ```js
   * import { NodeApp } from 'astro/app/node';
   * import { createServer } from 'node:http';
   *
   * const server = createServer(async (req, res) => {
   *     const request = NodeApp.createRequest(req);
   *     const response = await app.render(request);
   *     await NodeApp.writeResponse(response, res);
   * })
   * ```
   * @param source WhatWG Response
   * @param destination NodeJS ServerResponse
   */
  static async writeResponse(source, destination) {
    const { status, headers, body, statusText } = source;
    if (!(destination instanceof Http2ServerResponse)) {
      destination.statusMessage = statusText;
    }
    destination.writeHead(status, createOutgoingHttpHeaders(headers));
    if (!body) return destination.end();
    try {
      const reader = body.getReader();
      destination.on("close", () => {
        reader.cancel().catch((err) => {
          console.error(
            `There was an uncaught error in the middle of the stream while rendering ${destination.req.url}.`,
            err,
          );
        });
      });
      let result = await reader.read();
      while (!result.done) {
        destination.write(result.value);
        result = await reader.read();
      }
      destination.end();
    } catch (err) {
      destination.write("Internal server error", () => {
        err instanceof Error ? destination.destroy(err) : destination.destroy();
      });
    }
  }
}
function makeRequestHeaders(req) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else {
      headers.append(name, value);
    }
  }
  return headers;
}
function makeRequestBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === "string" && req.body.length > 0) {
      return { body: Buffer.from(req.body) };
    }
    if (
      typeof req.body === "object" &&
      req.body !== null &&
      Object.keys(req.body).length > 0
    ) {
      return { body: Buffer.from(JSON.stringify(req.body)) };
    }
    if (
      typeof req.body === "object" &&
      req.body !== null &&
      typeof req.body[Symbol.asyncIterator] !== "undefined"
    ) {
      return asyncIterableToBodyProps(req.body);
    }
  }
  return asyncIterableToBodyProps(req);
}
function asyncIterableToBodyProps(iterable) {
  return {
    // Node uses undici for the Request implementation. Undici accepts
    // a non-standard async iterable for the body.
    // @ts-expect-error
    body: iterable,
    // The duplex property is required when using a ReadableStream or async
    // iterable for the body. The type definitions do not include the duplex
    // property because they are not up-to-date.
    duplex: "half",
  };
}

apply();

var dist = { exports: {} };

/**
 * Tokenize input string.
 */
function lexer$1(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          (code >= 48 && code <= 57) ||
          // `A-Z`
          (code >= 65 && code <= 90) ||
          // `a-z`
          (code >= 97 && code <= 122) ||
          // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name) throw new TypeError("Missing parameter name at " + i);
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at ' + j);
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at " + j);
          }
        }
        pattern += str[j++];
      }
      if (count) throw new TypeError("Unbalanced pattern at " + i);
      if (!pattern) throw new TypeError("Missing pattern at " + i);
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse$1(str, options) {
  if (options === undefined) {
    options = {};
  }
  var tokens = lexer$1(str);
  var _a = options.prefixes,
    prefixes = _a === undefined ? "./" : _a;
  var defaultPattern =
    "[^" + escapeString$1(options.delimiter || "/#?") + "]+?";
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = function (type) {
    if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
  };
  var mustConsume = function (type) {
    var value = tryConsume(type);
    if (value !== undefined) return value;
    var _a = tokens[i],
      nextType = _a.type,
      index = _a.index;
    throw new TypeError(
      "Unexpected " + nextType + " at " + index + ", expected " + type,
    );
  };
  var consumeText = function () {
    var result = "";
    var value;
    // tslint:disable-next-line
    while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
      result += value;
    }
    return result;
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix: prefix,
        suffix: "",
        pattern: pattern || defaultPattern,
        modifier: tryConsume("MODIFIER") || "",
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
        prefix: prefix,
        suffix: suffix,
        modifier: tryConsume("MODIFIER") || "",
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
/**
 * Compile a string to a template function for the path.
 */
function compile$1(str, options) {
  return tokensToFunction$1(parse$1(str, options), options);
}
/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction$1(tokens, options) {
  if (options === undefined) {
    options = {};
  }
  var reFlags = flags$1(options);
  var _a = options.encode,
    encode =
      _a === undefined
        ? function (x) {
            return x;
          }
        : _a,
    _b = options.validate,
    validate = _b === undefined ? true : _b;
  // Compile all the tokens into regexps.
  var matches = tokens.map(function (token) {
    if (typeof token === "object") {
      return new RegExp("^(?:" + token.pattern + ")$", reFlags);
    }
  });
  return function (data) {
    var path = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path += token;
        continue;
      }
      var value = data ? data[token.name] : undefined;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError(
            'Expected "' + token.name + '" to not repeat, but got an array',
          );
        }
        if (value.length === 0) {
          if (optional) continue;
          throw new TypeError('Expected "' + token.name + '" to not be empty');
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError(
              'Expected all "' +
                token.name +
                '" to match "' +
                token.pattern +
                '", but got "' +
                segment +
                '"',
            );
          }
          path += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError(
            'Expected "' +
              token.name +
              '" to match "' +
              token.pattern +
              '", but got "' +
              segment +
              '"',
          );
        }
        path += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional) continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError(
        'Expected "' + token.name + '" to be ' + typeOfMessage,
      );
    }
    return path;
  };
}
/**
 * Create path match function from `path-to-regexp` spec.
 */
function match$1(str, options) {
  var keys = [];
  var re = pathToRegexp$1(str, keys, options);
  return regexpToFunction$1(re, keys, options);
}
/**
 * Create a path match function from `path-to-regexp` output.
 */
function regexpToFunction$1(re, keys, options) {
  if (options === undefined) {
    options = {};
  }
  var _a = options.decode,
    decode =
      _a === undefined
        ? function (x) {
            return x;
          }
        : _a;
  return function (pathname) {
    var m = re.exec(pathname);
    if (!m) return false;
    var path = m[0],
      index = m.index;
    var params = Object.create(null);
    var _loop_1 = function (i) {
      // tslint:disable-next-line
      if (m[i] === undefined) return "continue";
      var key = keys[i - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i]
          .split(key.prefix + key.suffix)
          .map(function (value) {
            return decode(value, key);
          });
      } else {
        params[key.name] = decode(m[i], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path, index: index, params: params };
  };
}
/**
 * Escape a regular expression string.
 */
function escapeString$1(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags$1(options) {
  return options && options.sensitive ? "" : "i";
}
/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp$1(path, keys) {
  if (!keys) return path;
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);
  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: "",
        suffix: "",
        modifier: "",
        pattern: "",
      });
    }
  }
  return path;
}
/**
 * Transform an array into a regexp.
 */
function arrayToRegexp$1(paths, keys, options) {
  var parts = paths.map(function (path) {
    return pathToRegexp$1(path, keys, options).source;
  });
  return new RegExp("(?:" + parts.join("|") + ")", flags$1(options));
}
/**
 * Create a path regexp from string input.
 */
function stringToRegexp$1(path, keys, options) {
  return tokensToRegexp$1(parse$1(path, options), keys, options);
}
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
function tokensToRegexp$1(tokens, keys, options) {
  if (options === undefined) {
    options = {};
  }
  var _a = options.strict,
    strict = _a === undefined ? false : _a,
    _b = options.start,
    start = _b === undefined ? true : _b,
    _c = options.end,
    end = _c === undefined ? true : _c,
    _d = options.encode,
    encode =
      _d === undefined
        ? function (x) {
            return x;
          }
        : _d;
  var endsWith = "[" + escapeString$1(options.endsWith || "") + "]|$";
  var delimiter = "[" + escapeString$1(options.delimiter || "/#?") + "]";
  var route = start ? "^" : "";
  // Iterate over the tokens and create our regexp string.
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString$1(encode(token));
    } else {
      var prefix = escapeString$1(encode(token.prefix));
      var suffix = escapeString$1(encode(token.suffix));
      if (token.pattern) {
        if (keys) keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route +=
              "(?:" +
              prefix +
              "((?:" +
              token.pattern +
              ")(?:" +
              suffix +
              prefix +
              "(?:" +
              token.pattern +
              "))*)" +
              suffix +
              ")" +
              mod;
          } else {
            route +=
              "(?:" +
              prefix +
              "(" +
              token.pattern +
              ")" +
              suffix +
              ")" +
              token.modifier;
          }
        } else {
          route += "(" + token.pattern + ")" + token.modifier;
        }
      } else {
        route += "(?:" + prefix + suffix + ")" + token.modifier;
      }
    }
  }
  if (end) {
    if (!strict) route += delimiter + "?";
    route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited =
      typeof endToken === "string"
        ? delimiter.indexOf(endToken[endToken.length - 1]) > -1
        : // tslint:disable-next-line
          endToken === undefined;
    if (!strict) {
      route += "(?:" + delimiter + "(?=" + endsWith + "))?";
    }
    if (!isEndDelimited) {
      route += "(?=" + delimiter + "|" + endsWith + ")";
    }
  }
  return new RegExp(route, flags$1(options));
}
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
function pathToRegexp$1(path, keys, options) {
  if (path instanceof RegExp) return regexpToRegexp$1(path, keys);
  if (Array.isArray(path)) return arrayToRegexp$1(path, keys, options);
  return stringToRegexp$1(path, keys, options);
}

const dist_es2015$1 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      compile: compile$1,
      match: match$1,
      parse: parse$1,
      pathToRegexp: pathToRegexp$1,
      regexpToFunction: regexpToFunction$1,
      tokensToFunction: tokensToFunction$1,
      tokensToRegexp: tokensToRegexp$1,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);

const require$$1 = /*@__PURE__*/ getAugmentedNamespace(dist_es2015$1);

/**
 * Tokenize input string.
 */
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          (code >= 48 && code <= 57) ||
          // `A-Z`
          (code >= 65 && code <= 90) ||
          // `a-z`
          (code >= 97 && code <= 122) ||
          // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name) throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError(
              "Capturing groups are not allowed at ".concat(j),
            );
          }
        }
        pattern += str[j++];
      }
      if (count) throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern) throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
  if (options === undefined) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes,
    prefixes = _a === undefined ? "./" : _a,
    _b = options.delimiter,
    delimiter = _b === undefined ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = function (type) {
    if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
  };
  var mustConsume = function (type) {
    var value = tryConsume(type);
    if (value !== undefined) return value;
    var _a = tokens[i],
      nextType = _a.type,
      index = _a.index;
    throw new TypeError(
      "Unexpected "
        .concat(nextType, " at ")
        .concat(index, ", expected ")
        .concat(type),
    );
  };
  var consumeText = function () {
    var result = "";
    var value;
    while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
      result += value;
    }
    return result;
  };
  var isSafe = function (value) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char = delimiter_1[_i];
      if (value.indexOf(char) > -1) return true;
    }
    return false;
  };
  var safePattern = function (prefix) {
    var prev = result[result.length - 1];
    var prevText = prefix || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError(
        'Must have text between two parameters, missing text after "'.concat(
          prev.name,
          '"',
        ),
      );
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!"
      .concat(escapeString(prevText), ")[^")
      .concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix: prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || "",
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix: prefix,
        suffix: suffix,
        modifier: tryConsume("MODIFIER") || "",
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
/**
 * Compile a string to a template function for the path.
 */
function compile(str, options) {
  return tokensToFunction(parse(str, options), options);
}
/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens, options) {
  if (options === undefined) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode,
    encode =
      _a === undefined
        ? function (x) {
            return x;
          }
        : _a,
    _b = options.validate,
    validate = _b === undefined ? true : _b;
  // Compile all the tokens into regexps.
  var matches = tokens.map(function (token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function (data) {
    var path = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path += token;
        continue;
      }
      var value = data ? data[token.name] : undefined;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError(
            'Expected "'.concat(
              token.name,
              '" to not repeat, but got an array',
            ),
          );
        }
        if (value.length === 0) {
          if (optional) continue;
          throw new TypeError(
            'Expected "'.concat(token.name, '" to not be empty'),
          );
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError(
              'Expected all "'
                .concat(token.name, '" to match "')
                .concat(token.pattern, '", but got "')
                .concat(segment, '"'),
            );
          }
          path += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError(
            'Expected "'
              .concat(token.name, '" to match "')
              .concat(token.pattern, '", but got "')
              .concat(segment, '"'),
          );
        }
        path += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional) continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError(
        'Expected "'.concat(token.name, '" to be ').concat(typeOfMessage),
      );
    }
    return path;
  };
}
/**
 * Create path match function from `path-to-regexp` spec.
 */
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
/**
 * Create a path match function from `path-to-regexp` output.
 */
function regexpToFunction(re, keys, options) {
  if (options === undefined) {
    options = {};
  }
  var _a = options.decode,
    decode =
      _a === undefined
        ? function (x) {
            return x;
          }
        : _a;
  return function (pathname) {
    var m = re.exec(pathname);
    if (!m) return false;
    var path = m[0],
      index = m.index;
    var params = Object.create(null);
    var _loop_1 = function (i) {
      if (m[i] === undefined) return "continue";
      var key = keys[i - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i]
          .split(key.prefix + key.suffix)
          .map(function (value) {
            return decode(value, key);
          });
      } else {
        params[key.name] = decode(m[i], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path, index: index, params: params };
  };
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp(path, keys) {
  if (!keys) return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: "",
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
/**
 * Transform an array into a regexp.
 */
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function (path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
/**
 * Create a path regexp from string input.
 */
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
function tokensToRegexp(tokens, keys, options) {
  if (options === undefined) {
    options = {};
  }
  var _a = options.strict,
    strict = _a === undefined ? false : _a,
    _b = options.start,
    start = _b === undefined ? true : _b,
    _c = options.end,
    end = _c === undefined ? true : _c,
    _d = options.encode,
    encode =
      _d === undefined
        ? function (x) {
            return x;
          }
        : _d,
    _e = options.delimiter,
    delimiter = _e === undefined ? "/#?" : _e,
    _f = options.endsWith,
    endsWith = _f === undefined ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  // Iterate over the tokens and create our regexp string.
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys) keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:"
              .concat(prefix, "((?:")
              .concat(token.pattern, ")(?:")
              .concat(suffix)
              .concat(prefix, "(?:")
              .concat(token.pattern, "))*)")
              .concat(suffix, ")")
              .concat(mod);
          } else {
            route += "(?:"
              .concat(prefix, "(")
              .concat(token.pattern, ")")
              .concat(suffix, ")")
              .concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError(
              'Can not repeat "'.concat(
                token.name,
                '" without a prefix and suffix',
              ),
            );
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:"
          .concat(prefix)
          .concat(suffix, ")")
          .concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict) route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited =
      typeof endToken === "string"
        ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1
        : endToken === undefined;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp) return regexpToRegexp(path, keys);
  if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}

const dist_es2015 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      compile,
      match,
      parse,
      pathToRegexp,
      regexpToFunction,
      tokensToFunction,
      tokensToRegexp,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);

const require$$2 = /*@__PURE__*/ getAugmentedNamespace(dist_es2015);

var superstatic;
var hasRequiredSuperstatic;

function requireSuperstatic() {
  if (hasRequiredSuperstatic) return superstatic;
  hasRequiredSuperstatic = 1;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable:
              !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toCommonJS = (mod) =>
    __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var superstatic_exports = {};
  __export(superstatic_exports, {
    collectHasSegments: () => collectHasSegments,
    convertCleanUrls: () => convertCleanUrls,
    convertHeaders: () => convertHeaders,
    convertRedirects: () => convertRedirects,
    convertRewrites: () => convertRewrites,
    convertTrailingSlash: () => convertTrailingSlash,
    getCleanUrls: () => getCleanUrls,
    sourceToRegex: () => sourceToRegex,
  });
  superstatic = __toCommonJS(superstatic_exports);
  var import_url = require$$0;
  var import_path_to_regexp = require$$1;
  var import_path_to_regexp_updated = require$$2;
  function pathToRegexp(callerId, path, keys, options) {
    const currentRegExp = (0, import_path_to_regexp.pathToRegexp)(
      path,
      keys,
      options,
    );
    try {
      const currentKeys = keys;
      const newKeys = [];
      const newRegExp = (0, import_path_to_regexp_updated.pathToRegexp)(
        path,
        newKeys,
        options,
      );
      const isDiffRegExp = currentRegExp.toString() !== newRegExp.toString();
      if (process.env.FORCE_PATH_TO_REGEXP_LOG || isDiffRegExp) {
        const message = JSON.stringify({
          path,
          currentRegExp: currentRegExp.toString(),
          newRegExp: newRegExp.toString(),
        });
        console.error(
          `[vc] PATH TO REGEXP PATH DIFF @ #${callerId}: ${message}`,
        );
      }
      const isDiffKeys = keys?.toString() !== newKeys?.toString();
      if (process.env.FORCE_PATH_TO_REGEXP_LOG || isDiffKeys) {
        const message = JSON.stringify({
          isDiffKeys,
          currentKeys,
          newKeys,
        });
        console.error(
          `[vc] PATH TO REGEXP KEYS DIFF @ #${callerId}: ${message}`,
        );
      }
    } catch (err) {
      const error = err;
      console.error(
        `[vc] PATH TO REGEXP ERROR @ #${callerId}: ${error.message}`,
      );
    }
    return currentRegExp;
  }
  const UN_NAMED_SEGMENT = "__UN_NAMED_SEGMENT__";
  function getCleanUrls(filePaths) {
    const htmlFiles = filePaths
      .map(toRoute)
      .filter((f) => f.endsWith(".html"))
      .map((f) => ({
        html: f,
        clean: f.slice(0, -5),
      }));
    return htmlFiles;
  }
  function convertCleanUrls(cleanUrls, trailingSlash, status = 308) {
    const routes = [];
    if (cleanUrls) {
      const loc = trailingSlash ? "/$1/" : "/$1";
      routes.push({
        src: "^/(?:(.+)/)?index(?:\\.html)?/?$",
        headers: { Location: loc },
        status,
      });
      routes.push({
        src: "^/(.*)\\.html/?$",
        headers: { Location: loc },
        status,
      });
    }
    return routes;
  }
  function convertRedirects(redirects, defaultStatus = 308) {
    return redirects.map((r) => {
      const { src, segments } = sourceToRegex(r.source);
      const hasSegments = collectHasSegments(r.has);
      normalizeHasKeys(r.has);
      normalizeHasKeys(r.missing);
      try {
        const loc = replaceSegments(segments, hasSegments, r.destination, true);
        let status;
        if (typeof r.permanent === "boolean") {
          status = r.permanent ? 308 : 307;
        } else if (r.statusCode) {
          status = r.statusCode;
        } else {
          status = defaultStatus;
        }
        const route = {
          src,
          headers: { Location: loc },
          status,
        };
        if (r.has) {
          route.has = r.has;
        }
        if (r.missing) {
          route.missing = r.missing;
        }
        return route;
      } catch (e) {
        throw new Error(`Failed to parse redirect: ${JSON.stringify(r)}`);
      }
    });
  }
  function convertRewrites(rewrites, internalParamNames) {
    return rewrites.map((r) => {
      const { src, segments } = sourceToRegex(r.source);
      const hasSegments = collectHasSegments(r.has);
      normalizeHasKeys(r.has);
      normalizeHasKeys(r.missing);
      try {
        const dest = replaceSegments(
          segments,
          hasSegments,
          r.destination,
          false,
          internalParamNames,
        );
        const route = { src, dest, check: true };
        if (r.has) {
          route.has = r.has;
        }
        if (r.missing) {
          route.missing = r.missing;
        }
        if (r.statusCode) {
          route.status = r.statusCode;
        }
        return route;
      } catch (e) {
        throw new Error(`Failed to parse rewrite: ${JSON.stringify(r)}`);
      }
    });
  }
  function convertHeaders(headers) {
    return headers.map((h) => {
      const obj = {};
      const { src, segments } = sourceToRegex(h.source);
      const hasSegments = collectHasSegments(h.has);
      normalizeHasKeys(h.has);
      normalizeHasKeys(h.missing);
      const namedSegments = segments.filter(
        (name) => name !== UN_NAMED_SEGMENT,
      );
      const indexes = {};
      segments.forEach((name, index) => {
        indexes[name] = toSegmentDest(index);
      });
      hasSegments.forEach((name) => {
        indexes[name] = "$" + name;
      });
      h.headers.forEach(({ key, value }) => {
        if (namedSegments.length > 0 || hasSegments.length > 0) {
          if (key.includes(":")) {
            key = safelyCompile(key, indexes);
          }
          if (value.includes(":")) {
            value = safelyCompile(value, indexes);
          }
        }
        obj[key] = value;
      });
      const route = {
        src,
        headers: obj,
        continue: true,
      };
      if (h.has) {
        route.has = h.has;
      }
      if (h.missing) {
        route.missing = h.missing;
      }
      return route;
    });
  }
  function convertTrailingSlash(enable, status = 308) {
    const routes = [];
    if (enable) {
      routes.push({
        src: "^/\\.well-known(?:/.*)?$",
      });
      routes.push({
        src: "^/((?:[^/]+/)*[^/\\.]+)$",
        headers: { Location: "/$1/" },
        status,
      });
      routes.push({
        src: "^/((?:[^/]+/)*[^/]+\\.\\w+)/$",
        headers: { Location: "/$1" },
        status,
      });
    } else {
      routes.push({
        src: "^/(.*)\\/$",
        headers: { Location: "/$1" },
        status,
      });
    }
    return routes;
  }
  function sourceToRegex(source) {
    const keys = [];
    const r = pathToRegexp("632", source, keys, {
      strict: true,
      sensitive: true,
      delimiter: "/",
    });
    const segments = keys
      .map((k) => k.name)
      .map((name) => {
        if (typeof name !== "string") {
          return UN_NAMED_SEGMENT;
        }
        return name;
      });
    return { src: r.source, segments };
  }
  const namedGroupsRegex = /\(\?<([a-zA-Z][a-zA-Z0-9]*)>/g;
  const normalizeHasKeys = (hasItems = []) => {
    for (const hasItem of hasItems) {
      if ("key" in hasItem && hasItem.type === "header") {
        hasItem.key = hasItem.key.toLowerCase();
      }
    }
    return hasItems;
  };
  function collectHasSegments(has) {
    const hasSegments = /* @__PURE__ */ new Set();
    for (const hasItem of has || []) {
      if (!hasItem.value && "key" in hasItem) {
        hasSegments.add(hasItem.key);
      }
      if (hasItem.value) {
        for (const match of hasItem.value.matchAll(namedGroupsRegex)) {
          if (match[1]) {
            hasSegments.add(match[1]);
          }
        }
        if (hasItem.type === "host") {
          hasSegments.add("host");
        }
      }
    }
    return [...hasSegments];
  }
  const escapeSegment = (str, segmentName) =>
    str.replace(
      new RegExp(`:${segmentName}`, "g"),
      `__ESC_COLON_${segmentName}`,
    );
  const unescapeSegments = (str) => str.replace(/__ESC_COLON_/gi, ":");
  function replaceSegments(
    segments,
    hasItemSegments,
    destination,
    isRedirect,
    internalParamNames,
  ) {
    const namedSegments = segments.filter((name) => name !== UN_NAMED_SEGMENT);
    const canNeedReplacing =
      (destination.includes(":") && namedSegments.length > 0) ||
      hasItemSegments.length > 0 ||
      !isRedirect;
    if (!canNeedReplacing) {
      return destination;
    }
    let escapedDestination = destination;
    const indexes = {};
    segments.forEach((name, index) => {
      indexes[name] = toSegmentDest(index);
      escapedDestination = escapeSegment(escapedDestination, name);
    });
    hasItemSegments.forEach((name) => {
      indexes[name] = "$" + name;
      escapedDestination = escapeSegment(escapedDestination, name);
    });
    const parsedDestination = (0, import_url.parse)(escapedDestination, true);
    delete parsedDestination.href;
    delete parsedDestination.path;
    delete parsedDestination.search;
    delete parsedDestination.host;
    let { pathname, hash, query, hostname, ...rest } = parsedDestination;
    pathname = unescapeSegments(pathname || "");
    hash = unescapeSegments(hash || "");
    hostname = unescapeSegments(hostname || "");
    let destParams = /* @__PURE__ */ new Set();
    const pathnameKeys = [];
    const hashKeys = [];
    const hostnameKeys = [];
    try {
      pathToRegexp("528", pathname, pathnameKeys);
      pathToRegexp("834", hash || "", hashKeys);
      pathToRegexp("712", hostname || "", hostnameKeys);
    } catch (_) {}
    destParams = new Set(
      [...pathnameKeys, ...hashKeys, ...hostnameKeys]
        .map((key) => key.name)
        .filter((val) => typeof val === "string"),
    );
    pathname = safelyCompile(pathname, indexes, true);
    hash = hash ? safelyCompile(hash, indexes, true) : null;
    hostname = hostname ? safelyCompile(hostname, indexes, true) : null;
    for (const [key, strOrArray] of Object.entries(query)) {
      if (Array.isArray(strOrArray)) {
        query[key] = strOrArray.map((str) =>
          safelyCompile(unescapeSegments(str), indexes, true),
        );
      } else {
        query[key] = safelyCompile(unescapeSegments(strOrArray), indexes, true);
      }
    }
    const paramKeys = Object.keys(indexes);
    const needsQueryUpdating =
      // we do not consider an internal param since it is added automatically
      !isRedirect &&
      !paramKeys.some(
        (param) =>
          !(internalParamNames && internalParamNames.includes(param)) &&
          destParams.has(param),
      );
    if (needsQueryUpdating) {
      for (const param of paramKeys) {
        if (!(param in query) && param !== UN_NAMED_SEGMENT) {
          query[param] = indexes[param];
        }
      }
    }
    destination = (0, import_url.format)({
      ...rest,
      hostname,
      pathname,
      query,
      hash,
    });
    return destination.replace(/%24/g, "$");
  }
  function safelyCompile(value, indexes, attemptDirectCompile) {
    if (!value) {
      return value;
    }
    if (attemptDirectCompile) {
      try {
        return (0, import_path_to_regexp.compile)(value, { validate: false })(
          indexes,
        );
      } catch (e) {}
    }
    for (const key of Object.keys(indexes)) {
      if (value.includes(`:${key}`)) {
        value = value
          .replace(
            new RegExp(`:${key}\\*`, "g"),
            `:${key}--ESCAPED_PARAM_ASTERISK`,
          )
          .replace(
            new RegExp(`:${key}\\?`, "g"),
            `:${key}--ESCAPED_PARAM_QUESTION`,
          )
          .replace(new RegExp(`:${key}\\+`, "g"), `:${key}--ESCAPED_PARAM_PLUS`)
          .replace(
            new RegExp(`:${key}(?!\\w)`, "g"),
            `--ESCAPED_PARAM_COLON${key}`,
          );
      }
    }
    value = value
      .replace(/(:|\*|\?|\+|\(|\)|\{|\})/g, "\\$1")
      .replace(/--ESCAPED_PARAM_PLUS/g, "+")
      .replace(/--ESCAPED_PARAM_COLON/g, ":")
      .replace(/--ESCAPED_PARAM_QUESTION/g, "?")
      .replace(/--ESCAPED_PARAM_ASTERISK/g, "*");
    return (0, import_path_to_regexp.compile)(`/${value}`, { validate: false })(
      indexes,
    ).slice(1);
  }
  function toSegmentDest(index) {
    const i = index + 1;
    return "$" + i.toString();
  }
  function toRoute(filePath) {
    return filePath.startsWith("/") ? filePath : "/" + filePath;
  }
  return superstatic;
}

var append;
var hasRequiredAppend;

function requireAppend() {
  if (hasRequiredAppend) return append;
  hasRequiredAppend = 1;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable:
              !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toCommonJS = (mod) =>
    __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var append_exports = {};
  __export(append_exports, {
    appendRoutesToPhase: () => appendRoutesToPhase,
  });
  append = __toCommonJS(append_exports);
  var import_index = requireDist();
  function appendRoutesToPhase({ routes: prevRoutes, newRoutes, phase }) {
    const routes = prevRoutes ? [...prevRoutes] : [];
    if (newRoutes === null || newRoutes.length === 0) {
      return routes;
    }
    let isInPhase = false;
    let insertIndex = -1;
    routes.forEach((r, i) => {
      if ((0, import_index.isHandler)(r)) {
        if (r.handle === phase) {
          isInPhase = true;
        } else if (isInPhase) {
          insertIndex = i;
          isInPhase = false;
        }
      }
    });
    if (isInPhase) {
      routes.push(...newRoutes);
    } else if (phase === null) {
      const lastPhase = routes.findIndex(
        (r) => (0, import_index.isHandler)(r) && r.handle,
      );
      if (lastPhase === -1) {
        routes.push(...newRoutes);
      } else {
        routes.splice(lastPhase, 0, ...newRoutes);
      }
    } else if (insertIndex > -1) {
      routes.splice(insertIndex, 0, ...newRoutes);
    } else {
      routes.push({ handle: phase });
      routes.push(...newRoutes);
    }
    return routes;
  }
  return append;
}

var merge;
var hasRequiredMerge;

function requireMerge() {
  if (hasRequiredMerge) return merge;
  hasRequiredMerge = 1;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable:
              !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toCommonJS = (mod) =>
    __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var merge_exports = {};
  __export(merge_exports, {
    mergeRoutes: () => mergeRoutes,
  });
  merge = __toCommonJS(merge_exports);
  var import_index = requireDist();
  function getBuilderRoutesMapping(builds) {
    const builderRoutes = {};
    for (const { entrypoint, routes, use } of builds) {
      if (routes) {
        if (!builderRoutes[entrypoint]) {
          builderRoutes[entrypoint] = {};
        }
        builderRoutes[entrypoint][use] = routes;
      }
    }
    return builderRoutes;
  }
  function getCheckAndContinue(routes) {
    const checks = [];
    const continues = [];
    const others = [];
    for (const route of routes) {
      if ((0, import_index.isHandler)(route)) {
        throw new Error(
          `Unexpected route found in getCheckAndContinue(): ${JSON.stringify(
            route,
          )}`,
        );
      } else if (route.check && !route.override) {
        checks.push(route);
      } else if (route.continue && !route.override) {
        continues.push(route);
      } else {
        others.push(route);
      }
    }
    return { checks, continues, others };
  }
  function mergeRoutes({ userRoutes, builds }) {
    const userHandleMap = /* @__PURE__ */ new Map();
    let userPrevHandle = null;
    (userRoutes || []).forEach((route) => {
      if ((0, import_index.isHandler)(route)) {
        userPrevHandle = route.handle;
      } else {
        const routes = userHandleMap.get(userPrevHandle);
        if (!routes) {
          userHandleMap.set(userPrevHandle, [route]);
        } else {
          routes.push(route);
        }
      }
    });
    const builderHandleMap = /* @__PURE__ */ new Map();
    const builderRoutes = getBuilderRoutesMapping(builds);
    const sortedPaths = Object.keys(builderRoutes).sort();
    sortedPaths.forEach((path) => {
      const br = builderRoutes[path];
      const sortedBuilders = Object.keys(br).sort();
      sortedBuilders.forEach((use) => {
        let builderPrevHandle = null;
        br[use].forEach((route) => {
          if ((0, import_index.isHandler)(route)) {
            builderPrevHandle = route.handle;
          } else {
            const routes = builderHandleMap.get(builderPrevHandle);
            if (!routes) {
              builderHandleMap.set(builderPrevHandle, [route]);
            } else {
              routes.push(route);
            }
          }
        });
      });
    });
    const outputRoutes = [];
    const uniqueHandleValues = /* @__PURE__ */ new Set([
      null,
      ...userHandleMap.keys(),
      ...builderHandleMap.keys(),
    ]);
    for (const handle of uniqueHandleValues) {
      const userRoutes2 = userHandleMap.get(handle) || [];
      const builderRoutes2 = builderHandleMap.get(handle) || [];
      const builderSorted = getCheckAndContinue(builderRoutes2);
      if (
        handle !== null &&
        (userRoutes2.length > 0 || builderRoutes2.length > 0)
      ) {
        outputRoutes.push({ handle });
      }
      outputRoutes.push(...builderSorted.continues);
      outputRoutes.push(...userRoutes2);
      outputRoutes.push(...builderSorted.checks);
      outputRoutes.push(...builderSorted.others);
    }
    return outputRoutes;
  }
  return merge;
}

var schemas;
var hasRequiredSchemas;

function requireSchemas() {
  if (hasRequiredSchemas) return schemas;
  hasRequiredSchemas = 1;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable:
              !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toCommonJS = (mod) =>
    __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var schemas_exports = {};
  __export(schemas_exports, {
    cleanUrlsSchema: () => cleanUrlsSchema,
    hasSchema: () => hasSchema,
    headersSchema: () => headersSchema,
    redirectsSchema: () => redirectsSchema,
    rewritesSchema: () => rewritesSchema,
    routesSchema: () => routesSchema,
    trailingSlashSchema: () => trailingSlashSchema,
  });
  schemas = __toCommonJS(schemas_exports);
  const hasSchema = {
    description: "An array of requirements that are needed to match",
    type: "array",
    maxItems: 16,
    items: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["type", "value"],
          properties: {
            type: {
              description: "The type of request element to check",
              type: "string",
              enum: ["host"],
            },
            value: {
              description:
                "A regular expression used to match the value. Named groups can be used in the destination",
              type: "string",
              maxLength: 4096,
            },
          },
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["type", "key"],
          properties: {
            type: {
              description: "The type of request element to check",
              type: "string",
              enum: ["header", "cookie", "query"],
            },
            key: {
              description:
                "The name of the element contained in the particular type",
              type: "string",
              maxLength: 4096,
            },
            value: {
              description:
                "A regular expression used to match the value. Named groups can be used in the destination",
              type: "string",
              maxLength: 4096,
            },
          },
        },
      ],
    },
  };
  const routesSchema = {
    type: "array",
    maxItems: 2048,
    deprecated: true,
    description:
      "A list of routes objects used to rewrite paths to point towards other internal or external paths",
    example: [{ dest: "https://docs.example.com", src: "/docs" }],
    items: {
      anyOf: [
        {
          type: "object",
          required: ["src"],
          additionalProperties: false,
          properties: {
            src: {
              type: "string",
              maxLength: 4096,
            },
            dest: {
              type: "string",
              maxLength: 4096,
            },
            headers: {
              type: "object",
              additionalProperties: false,
              minProperties: 1,
              maxProperties: 100,
              patternProperties: {
                "^.{1,256}$": {
                  type: "string",
                  maxLength: 4096,
                },
              },
            },
            methods: {
              type: "array",
              maxItems: 10,
              items: {
                type: "string",
                maxLength: 32,
              },
            },
            caseSensitive: {
              type: "boolean",
            },
            important: {
              type: "boolean",
            },
            user: {
              type: "boolean",
            },
            continue: {
              type: "boolean",
            },
            override: {
              type: "boolean",
            },
            check: {
              type: "boolean",
            },
            isInternal: {
              type: "boolean",
            },
            status: {
              type: "integer",
              minimum: 100,
              maximum: 999,
            },
            locale: {
              type: "object",
              additionalProperties: false,
              minProperties: 1,
              properties: {
                redirect: {
                  type: "object",
                  additionalProperties: false,
                  minProperties: 1,
                  maxProperties: 100,
                  patternProperties: {
                    "^.{1,256}$": {
                      type: "string",
                      maxLength: 4096,
                    },
                  },
                },
                value: {
                  type: "string",
                  maxLength: 4096,
                },
                path: {
                  type: "string",
                  maxLength: 4096,
                },
                cookie: {
                  type: "string",
                  maxLength: 4096,
                },
                default: {
                  type: "string",
                  maxLength: 4096,
                },
              },
            },
            middleware: { type: "number" },
            middlewarePath: { type: "string" },
            middlewareRawSrc: {
              type: "array",
              items: {
                type: "string",
              },
            },
            has: hasSchema,
            missing: hasSchema,
          },
        },
        {
          type: "object",
          required: ["handle"],
          additionalProperties: false,
          properties: {
            handle: {
              type: "string",
              maxLength: 32,
              enum: [
                "error",
                "filesystem",
                "hit",
                "miss",
                "resource",
                "rewrite",
              ],
            },
          },
        },
      ],
    },
  };
  const rewritesSchema = {
    type: "array",
    maxItems: 2048,
    description: "A list of rewrite definitions.",
    items: {
      type: "object",
      additionalProperties: false,
      required: ["source", "destination"],
      properties: {
        source: {
          description:
            "A pattern that matches each incoming pathname (excluding querystring).",
          type: "string",
          maxLength: 4096,
        },
        destination: {
          description:
            "An absolute pathname to an existing resource or an external URL.",
          type: "string",
          maxLength: 4096,
        },
        has: hasSchema,
        missing: hasSchema,
        statusCode: {
          description:
            "An optional integer to override the status code of the response.",
          type: "integer",
          minimum: 100,
          maximum: 999,
        },
      },
    },
  };
  const redirectsSchema = {
    title: "Redirects",
    type: "array",
    maxItems: 2048,
    description: "A list of redirect definitions.",
    items: {
      type: "object",
      additionalProperties: false,
      required: ["source", "destination"],
      properties: {
        source: {
          description:
            "A pattern that matches each incoming pathname (excluding querystring).",
          type: "string",
          maxLength: 4096,
        },
        destination: {
          description:
            "A location destination defined as an absolute pathname or external URL.",
          type: "string",
          maxLength: 4096,
        },
        permanent: {
          description:
            "A boolean to toggle between permanent and temporary redirect. When `true`, the status code is `308`. When `false` the status code is `307`.",
          type: "boolean",
        },
        statusCode: {
          description:
            "An optional integer to define the status code of the redirect.",
          private: true,
          type: "integer",
          minimum: 100,
          maximum: 999,
        },
        has: hasSchema,
        missing: hasSchema,
      },
    },
  };
  const headersSchema = {
    type: "array",
    maxItems: 2048,
    description: "A list of header definitions.",
    items: {
      type: "object",
      additionalProperties: false,
      required: ["source", "headers"],
      properties: {
        source: {
          description:
            "A pattern that matches each incoming pathname (excluding querystring)",
          type: "string",
          maxLength: 4096,
        },
        headers: {
          description:
            "An array of key/value pairs representing each response header.",
          type: "array",
          maxItems: 1024,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["key", "value"],
            properties: {
              key: {
                type: "string",
                maxLength: 4096,
              },
              value: {
                type: "string",
                maxLength: 4096,
              },
            },
          },
        },
        has: hasSchema,
        missing: hasSchema,
      },
    },
  };
  const cleanUrlsSchema = {
    description:
      "When set to `true`, all HTML files and Serverless Functions will have their extension removed. When visiting a path that ends with the extension, a 308 response will redirect the client to the extensionless path.",
    type: "boolean",
  };
  const trailingSlashSchema = {
    description:
      "When `false`, visiting a path that ends with a forward slash will respond with a `308` status code and redirect to the path without the trailing slash.",
    type: "boolean",
  };
  return schemas;
}

var types;
var hasRequiredTypes;

function requireTypes() {
  if (hasRequiredTypes) return types;
  hasRequiredTypes = 1;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __copyProps = (to, from, except, desc) => {
    if (typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable:
              !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toCommonJS = (mod) =>
    __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var types_exports = {};
  types = __toCommonJS(types_exports);
  return types;
}

var hasRequiredDist;

function requireDist() {
  if (hasRequiredDist) return dist.exports;
  hasRequiredDist = 1;
  (function (module) {
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if ((from && typeof from === "object") || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, {
              get: () => from[key],
              enumerable:
                !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
            });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (
      __copyProps(target, mod, "default"),
      secondTarget && __copyProps(secondTarget, mod, "default")
    );
    var __toCommonJS = (mod) =>
      __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var src_exports = {};
    __export(src_exports, {
      appendRoutesToPhase: () => import_append.appendRoutesToPhase,
      getCleanUrls: () => import_superstatic2.getCleanUrls,
      getTransformedRoutes: () => getTransformedRoutes,
      isHandler: () => isHandler,
      isValidHandleValue: () => isValidHandleValue,
      mergeRoutes: () => import_merge.mergeRoutes,
      normalizeRoutes: () => normalizeRoutes,
    });
    module.exports = __toCommonJS(src_exports);
    var import_url = require$$0;
    var import_superstatic = requireSuperstatic();
    var import_append = requireAppend();
    var import_merge = requireMerge();
    __reExport(src_exports, requireSchemas(), module.exports);
    var import_superstatic2 = requireSuperstatic();
    __reExport(src_exports, requireTypes(), module.exports);
    const VALID_HANDLE_VALUES = [
      "filesystem",
      "hit",
      "miss",
      "rewrite",
      "error",
      "resource",
    ];
    const validHandleValues = new Set(VALID_HANDLE_VALUES);
    function isHandler(route) {
      return typeof route.handle !== "undefined";
    }
    function isValidHandleValue(handle) {
      return validHandleValues.has(handle);
    }
    function normalizeRoutes(inputRoutes) {
      if (!inputRoutes || inputRoutes.length === 0) {
        return { routes: inputRoutes, error: null };
      }
      const routes = [];
      const handling = [];
      const errors = [];
      inputRoutes.forEach((r, i) => {
        const route = { ...r };
        routes.push(route);
        const keys = Object.keys(route);
        if (isHandler(route)) {
          const { handle } = route;
          if (keys.length !== 1) {
            const unknownProp = keys.find((prop) => prop !== "handle");
            errors.push(
              `Route at index ${i} has unknown property \`${unknownProp}\`.`,
            );
          } else if (!isValidHandleValue(handle)) {
            errors.push(
              `Route at index ${i} has unknown handle value \`handle: ${handle}\`.`,
            );
          } else if (handling.includes(handle)) {
            errors.push(
              `Route at index ${i} is a duplicate. Please use one \`handle: ${handle}\` at most.`,
            );
          } else {
            handling.push(handle);
          }
        } else if (route.src) {
          if (!route.src.startsWith("^")) {
            route.src = `^${route.src}`;
          }
          if (!route.src.endsWith("$")) {
            route.src = `${route.src}$`;
          }
          route.src = route.src.replace(/\\\//g, "/");
          const regError = checkRegexSyntax("Route", i, route.src);
          if (regError) {
            errors.push(regError);
          }
          const handleValue = handling[handling.length - 1];
          if (handleValue === "hit") {
            if (route.dest) {
              errors.push(
                `Route at index ${i} cannot define \`dest\` after \`handle: hit\`.`,
              );
            }
            if (route.status) {
              errors.push(
                `Route at index ${i} cannot define \`status\` after \`handle: hit\`.`,
              );
            }
            if (!route.continue) {
              errors.push(
                `Route at index ${i} must define \`continue: true\` after \`handle: hit\`.`,
              );
            }
          } else if (handleValue === "miss") {
            if (route.dest && !route.check) {
              errors.push(
                `Route at index ${i} must define \`check: true\` after \`handle: miss\`.`,
              );
            } else if (!route.dest && !route.continue) {
              errors.push(
                `Route at index ${i} must define \`continue: true\` after \`handle: miss\`.`,
              );
            }
          }
        } else {
          errors.push(
            `Route at index ${i} must define either \`handle\` or \`src\` property.`,
          );
        }
      });
      const error =
        errors.length > 0
          ? createError(
              "invalid_route",
              errors,
              "https://vercel.link/routes-json",
              "Learn More",
            )
          : null;
      return { routes, error };
    }
    function checkRegexSyntax(type, index, src) {
      try {
        new RegExp(src);
      } catch (err) {
        const prop = type === "Route" ? "src" : "source";
        return `${type} at index ${index} has invalid \`${prop}\` regular expression "${src}".`;
      }
      return null;
    }
    function checkPatternSyntax(type, index, { source, destination, has }) {
      let sourceSegments = /* @__PURE__ */ new Set();
      const destinationSegments = /* @__PURE__ */ new Set();
      try {
        sourceSegments = new Set(
          (0, import_superstatic.sourceToRegex)(source).segments,
        );
      } catch (err) {
        return {
          message: `${type} at index ${index} has invalid \`source\` pattern "${source}".`,
          link: "https://vercel.link/invalid-route-source-pattern",
        };
      }
      if (destination) {
        try {
          const { hostname, pathname, query } = (0, import_url.parse)(
            destination,
            true,
          );
          (0, import_superstatic.sourceToRegex)(
            hostname || "",
          ).segments.forEach((name) => destinationSegments.add(name));
          (0, import_superstatic.sourceToRegex)(
            pathname || "",
          ).segments.forEach((name) => destinationSegments.add(name));
          for (const strOrArray of Object.values(query)) {
            const value = Array.isArray(strOrArray)
              ? strOrArray[0]
              : strOrArray;
            (0, import_superstatic.sourceToRegex)(value || "").segments.forEach(
              (name) => destinationSegments.add(name),
            );
          }
        } catch (err) {}
        const hasSegments = (0, import_superstatic.collectHasSegments)(has);
        for (const segment of destinationSegments) {
          if (!sourceSegments.has(segment) && !hasSegments.includes(segment)) {
            return {
              message: `${type} at index ${index} has segment ":${segment}" in \`destination\` property but not in \`source\` or \`has\` property.`,
              link: "https://vercel.link/invalid-route-destination-segment",
            };
          }
        }
      }
      return null;
    }
    function checkRedirect(r, index) {
      if (
        typeof r.permanent !== "undefined" &&
        typeof r.statusCode !== "undefined"
      ) {
        return `Redirect at index ${index} cannot define both \`permanent\` and \`statusCode\` properties.`;
      }
      return null;
    }
    function createError(code, allErrors, link, action) {
      const errors = Array.isArray(allErrors) ? allErrors : [allErrors];
      const message = errors[0];
      const error = {
        name: "RouteApiError",
        code,
        message,
        link,
        action,
        errors,
      };
      return error;
    }
    function notEmpty(value) {
      return value !== null && value !== undefined;
    }
    function getTransformedRoutes(vercelConfig) {
      const { cleanUrls, rewrites, redirects, headers, trailingSlash } =
        vercelConfig;
      let { routes = null } = vercelConfig;
      if (routes) {
        const hasNewProperties =
          typeof cleanUrls !== "undefined" ||
          typeof trailingSlash !== "undefined" ||
          typeof redirects !== "undefined" ||
          typeof headers !== "undefined" ||
          typeof rewrites !== "undefined";
        if (hasNewProperties) {
          const error = createError(
            "invalid_mixed_routes",
            "If `rewrites`, `redirects`, `headers`, `cleanUrls` or `trailingSlash` are used, then `routes` cannot be present.",
            "https://vercel.link/mix-routing-props",
            "Learn More",
          );
          return { routes, error };
        }
        return normalizeRoutes(routes);
      }
      if (typeof cleanUrls !== "undefined") {
        const normalized = normalizeRoutes(
          (0, import_superstatic.convertCleanUrls)(cleanUrls, trailingSlash),
        );
        if (normalized.error) {
          normalized.error.code = "invalid_clean_urls";
          return { routes, error: normalized.error };
        }
        routes = routes || [];
        routes.push(...(normalized.routes || []));
      }
      if (typeof trailingSlash !== "undefined") {
        const normalized = normalizeRoutes(
          (0, import_superstatic.convertTrailingSlash)(trailingSlash),
        );
        if (normalized.error) {
          normalized.error.code = "invalid_trailing_slash";
          return { routes, error: normalized.error };
        }
        routes = routes || [];
        routes.push(...(normalized.routes || []));
      }
      if (typeof redirects !== "undefined") {
        const code = "invalid_redirect";
        const regexErrorMessage = redirects
          .map((r, i) => checkRegexSyntax("Redirect", i, r.source))
          .find(notEmpty);
        if (regexErrorMessage) {
          return {
            routes,
            error: createError(
              "invalid_redirect",
              regexErrorMessage,
              "https://vercel.link/invalid-route-source-pattern",
              "Learn More",
            ),
          };
        }
        const patternError = redirects
          .map((r, i) => checkPatternSyntax("Redirect", i, r))
          .find(notEmpty);
        if (patternError) {
          return {
            routes,
            error: createError(
              code,
              patternError.message,
              patternError.link,
              "Learn More",
            ),
          };
        }
        const redirectErrorMessage = redirects
          .map(checkRedirect)
          .find(notEmpty);
        if (redirectErrorMessage) {
          return {
            routes,
            error: createError(
              code,
              redirectErrorMessage,
              "https://vercel.link/redirects-json",
              "Learn More",
            ),
          };
        }
        const normalized = normalizeRoutes(
          (0, import_superstatic.convertRedirects)(redirects),
        );
        if (normalized.error) {
          normalized.error.code = code;
          return { routes, error: normalized.error };
        }
        routes = routes || [];
        routes.push(...(normalized.routes || []));
      }
      if (typeof headers !== "undefined") {
        const code = "invalid_header";
        const regexErrorMessage = headers
          .map((r, i) => checkRegexSyntax("Header", i, r.source))
          .find(notEmpty);
        if (regexErrorMessage) {
          return {
            routes,
            error: createError(
              code,
              regexErrorMessage,
              "https://vercel.link/invalid-route-source-pattern",
              "Learn More",
            ),
          };
        }
        const patternError = headers
          .map((r, i) => checkPatternSyntax("Header", i, r))
          .find(notEmpty);
        if (patternError) {
          return {
            routes,
            error: createError(
              code,
              patternError.message,
              patternError.link,
              "Learn More",
            ),
          };
        }
        const normalized = normalizeRoutes(
          (0, import_superstatic.convertHeaders)(headers),
        );
        if (normalized.error) {
          normalized.error.code = code;
          return { routes, error: normalized.error };
        }
        routes = routes || [];
        routes.push(...(normalized.routes || []));
      }
      if (typeof rewrites !== "undefined") {
        const code = "invalid_rewrite";
        const regexErrorMessage = rewrites
          .map((r, i) => checkRegexSyntax("Rewrite", i, r.source))
          .find(notEmpty);
        if (regexErrorMessage) {
          return {
            routes,
            error: createError(
              code,
              regexErrorMessage,
              "https://vercel.link/invalid-route-source-pattern",
              "Learn More",
            ),
          };
        }
        const patternError = rewrites
          .map((r, i) => checkPatternSyntax("Rewrite", i, r))
          .find(notEmpty);
        if (patternError) {
          return {
            routes,
            error: createError(
              code,
              patternError.message,
              patternError.link,
              "Learn More",
            ),
          };
        }
        const normalized = normalizeRoutes(
          (0, import_superstatic.convertRewrites)(rewrites),
        );
        if (normalized.error) {
          normalized.error.code = code;
          return { routes, error: normalized.error };
        }
        routes = routes || [];
        routes.push({ handle: "filesystem" });
        routes.push(...(normalized.routes || []));
      }
      return { routes, error: null };
    }
  })(dist);
  return dist.exports;
}

requireDist();

var tasks = {};

var utils$3 = {};

var array = {};

var hasRequiredArray;

function requireArray() {
  if (hasRequiredArray) return array;
  hasRequiredArray = 1;
  Object.defineProperty(array, "__esModule", { value: true });
  array.splitWhen = array.flatten = undefined;
  function flatten(items) {
    return items.reduce((collection, item) => [].concat(collection, item), []);
  }
  array.flatten = flatten;
  function splitWhen(items, predicate) {
    const result = [[]];
    let groupIndex = 0;
    for (const item of items) {
      if (predicate(item)) {
        groupIndex++;
        result[groupIndex] = [];
      } else {
        result[groupIndex].push(item);
      }
    }
    return result;
  }
  array.splitWhen = splitWhen;
  return array;
}

var errno = {};

var hasRequiredErrno;

function requireErrno() {
  if (hasRequiredErrno) return errno;
  hasRequiredErrno = 1;
  Object.defineProperty(errno, "__esModule", { value: true });
  errno.isEnoentCodeError = undefined;
  function isEnoentCodeError(error) {
    return error.code === "ENOENT";
  }
  errno.isEnoentCodeError = isEnoentCodeError;
  return errno;
}

var fs$3 = {};

var hasRequiredFs$3;

function requireFs$3() {
  if (hasRequiredFs$3) return fs$3;
  hasRequiredFs$3 = 1;
  Object.defineProperty(fs$3, "__esModule", { value: true });
  fs$3.createDirentFromStats = undefined;
  class DirentFromStats {
    constructor(name, stats) {
      this.name = name;
      this.isBlockDevice = stats.isBlockDevice.bind(stats);
      this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
      this.isDirectory = stats.isDirectory.bind(stats);
      this.isFIFO = stats.isFIFO.bind(stats);
      this.isFile = stats.isFile.bind(stats);
      this.isSocket = stats.isSocket.bind(stats);
      this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
    }
  }
  function createDirentFromStats(name, stats) {
    return new DirentFromStats(name, stats);
  }
  fs$3.createDirentFromStats = createDirentFromStats;
  return fs$3;
}

var path = {};

var hasRequiredPath;

function requirePath() {
  if (hasRequiredPath) return path;
  hasRequiredPath = 1;
  Object.defineProperty(path, "__esModule", { value: true });
  path.convertPosixPathToPattern =
    path.convertWindowsPathToPattern =
    path.convertPathToPattern =
    path.escapePosixPath =
    path.escapeWindowsPath =
    path.escape =
    path.removeLeadingDotSegment =
    path.makeAbsolute =
    path.unixify =
      undefined;
  const os = require$$1$1;
  const path$1 = require$$0$1;
  const IS_WINDOWS_PLATFORM = os.platform() === "win32";
  const LEADING_DOT_SEGMENT_CHARACTERS_COUNT = 2; // ./ or .\\
  /**
   * All non-escaped special characters.
   * Posix: ()*?[]{|}, !+@ before (, ! at the beginning, \\ before non-special characters.
   * Windows: (){}[], !+@ before (, ! at the beginning.
   */
  const POSIX_UNESCAPED_GLOB_SYMBOLS_RE =
    /(\\?)([()*?[\]{|}]|^!|[!+@](?=\()|\\(?![!()*+?@[\]{|}]))/g;
  const WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()[\]{}]|^!|[!+@](?=\())/g;
  /**
   * The device path (\\.\ or \\?\).
   * https://learn.microsoft.com/en-us/dotnet/standard/io/file-path-formats#dos-device-paths
   */
  const DOS_DEVICE_PATH_RE = /^\\\\([.?])/;
  /**
   * All backslashes except those escaping special characters.
   * Windows: !()+@{}
   * https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file#naming-conventions
   */
  const WINDOWS_BACKSLASHES_RE = /\\(?![!()+@[\]{}])/g;
  /**
   * Designed to work only with simple paths: `dir\\file`.
   */
  function unixify(filepath) {
    return filepath.replace(/\\/g, "/");
  }
  path.unixify = unixify;
  function makeAbsolute(cwd, filepath) {
    return path$1.resolve(cwd, filepath);
  }
  path.makeAbsolute = makeAbsolute;
  function removeLeadingDotSegment(entry) {
    // We do not use `startsWith` because this is 10x slower than current implementation for some cases.
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    if (entry.charAt(0) === ".") {
      const secondCharactery = entry.charAt(1);
      if (secondCharactery === "/" || secondCharactery === "\\") {
        return entry.slice(LEADING_DOT_SEGMENT_CHARACTERS_COUNT);
      }
    }
    return entry;
  }
  path.removeLeadingDotSegment = removeLeadingDotSegment;
  path.escape = IS_WINDOWS_PLATFORM ? escapeWindowsPath : escapePosixPath;
  function escapeWindowsPath(pattern) {
    return pattern.replace(WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE, "\\$2");
  }
  path.escapeWindowsPath = escapeWindowsPath;
  function escapePosixPath(pattern) {
    return pattern.replace(POSIX_UNESCAPED_GLOB_SYMBOLS_RE, "\\$2");
  }
  path.escapePosixPath = escapePosixPath;
  path.convertPathToPattern = IS_WINDOWS_PLATFORM
    ? convertWindowsPathToPattern
    : convertPosixPathToPattern;
  function convertWindowsPathToPattern(filepath) {
    return escapeWindowsPath(filepath)
      .replace(DOS_DEVICE_PATH_RE, "//$1")
      .replace(WINDOWS_BACKSLASHES_RE, "/");
  }
  path.convertWindowsPathToPattern = convertWindowsPathToPattern;
  function convertPosixPathToPattern(filepath) {
    return escapePosixPath(filepath);
  }
  path.convertPosixPathToPattern = convertPosixPathToPattern;
  return path;
}

var pattern = {};

/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isExtglob;
var hasRequiredIsExtglob;

function requireIsExtglob() {
  if (hasRequiredIsExtglob) return isExtglob;
  hasRequiredIsExtglob = 1;
  isExtglob = function isExtglob(str) {
    if (typeof str !== "string" || str === "") {
      return false;
    }

    var match;
    while ((match = /(\\).|([@?!+*]\(.*\))/g.exec(str))) {
      if (match[2]) return true;
      str = str.slice(match.index + match[0].length);
    }

    return false;
  };
  return isExtglob;
}

/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var isGlob;
var hasRequiredIsGlob;

function requireIsGlob() {
  if (hasRequiredIsGlob) return isGlob;
  hasRequiredIsGlob = 1;
  var isExtglob = requireIsExtglob();
  var chars = { "{": "}", "(": ")", "[": "]" };
  var strictCheck = function (str) {
    if (str[0] === "!") {
      return true;
    }
    var index = 0;
    var pipeIndex = -2;
    var closeSquareIndex = -2;
    var closeCurlyIndex = -2;
    var closeParenIndex = -2;
    var backSlashIndex = -2;
    while (index < str.length) {
      if (str[index] === "*") {
        return true;
      }

      if (str[index + 1] === "?" && /[\].+)]/.test(str[index])) {
        return true;
      }

      if (
        closeSquareIndex !== -1 &&
        str[index] === "[" &&
        str[index + 1] !== "]"
      ) {
        if (closeSquareIndex < index) {
          closeSquareIndex = str.indexOf("]", index);
        }
        if (closeSquareIndex > index) {
          if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
            return true;
          }
          backSlashIndex = str.indexOf("\\", index);
          if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
            return true;
          }
        }
      }

      if (
        closeCurlyIndex !== -1 &&
        str[index] === "{" &&
        str[index + 1] !== "}"
      ) {
        closeCurlyIndex = str.indexOf("}", index);
        if (closeCurlyIndex > index) {
          backSlashIndex = str.indexOf("\\", index);
          if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) {
            return true;
          }
        }
      }

      if (
        closeParenIndex !== -1 &&
        str[index] === "(" &&
        str[index + 1] === "?" &&
        /[:!=]/.test(str[index + 2]) &&
        str[index + 3] !== ")"
      ) {
        closeParenIndex = str.indexOf(")", index);
        if (closeParenIndex > index) {
          backSlashIndex = str.indexOf("\\", index);
          if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
            return true;
          }
        }
      }

      if (pipeIndex !== -1 && str[index] === "(" && str[index + 1] !== "|") {
        if (pipeIndex < index) {
          pipeIndex = str.indexOf("|", index);
        }
        if (pipeIndex !== -1 && str[pipeIndex + 1] !== ")") {
          closeParenIndex = str.indexOf(")", pipeIndex);
          if (closeParenIndex > pipeIndex) {
            backSlashIndex = str.indexOf("\\", pipeIndex);
            if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
              return true;
            }
          }
        }
      }

      if (str[index] === "\\") {
        var open = str[index + 1];
        index += 2;
        var close = chars[open];

        if (close) {
          var n = str.indexOf(close, index);
          if (n !== -1) {
            index = n + 1;
          }
        }

        if (str[index] === "!") {
          return true;
        }
      } else {
        index++;
      }
    }
    return false;
  };

  var relaxedCheck = function (str) {
    if (str[0] === "!") {
      return true;
    }
    var index = 0;
    while (index < str.length) {
      if (/[*?{}()[\]]/.test(str[index])) {
        return true;
      }

      if (str[index] === "\\") {
        var open = str[index + 1];
        index += 2;
        var close = chars[open];

        if (close) {
          var n = str.indexOf(close, index);
          if (n !== -1) {
            index = n + 1;
          }
        }

        if (str[index] === "!") {
          return true;
        }
      } else {
        index++;
      }
    }
    return false;
  };

  isGlob = function isGlob(str, options) {
    if (typeof str !== "string" || str === "") {
      return false;
    }

    if (isExtglob(str)) {
      return true;
    }

    var check = strictCheck;

    // optionally relax check
    if (options && options.strict === false) {
      check = relaxedCheck;
    }

    return check(str);
  };
  return isGlob;
}

var globParent;
var hasRequiredGlobParent;

function requireGlobParent() {
  if (hasRequiredGlobParent) return globParent;
  hasRequiredGlobParent = 1;

  var isGlob = requireIsGlob();
  var pathPosixDirname = require$$0$1.posix.dirname;
  var isWin32 = require$$1$1.platform() === "win32";

  var slash = "/";
  var backslash = /\\/g;
  var enclosure = /[\{\[].*[\}\]]$/;
  var globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
  var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;

  /**
   * @param {string} str
   * @param {Object} opts
   * @param {boolean} [opts.flipBackslashes=true]
   * @returns {string}
   */
  globParent = function globParent(str, opts) {
    var options = Object.assign({ flipBackslashes: true }, opts);

    // flip windows path separators
    if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
      str = str.replace(backslash, slash);
    }

    // special case for strings ending in enclosure containing path separator
    if (enclosure.test(str)) {
      str += slash;
    }

    // preserves full path in case of trailing path separator
    str += "a";

    // remove path parts that are globby
    do {
      str = pathPosixDirname(str);
    } while (isGlob(str) || globby.test(str));

    // remove escape chars and return result
    return str.replace(escaped, "$1");
  };
  return globParent;
}

var utils$2 = {};

var hasRequiredUtils$3;

function requireUtils$3() {
  if (hasRequiredUtils$3) return utils$2;
  hasRequiredUtils$3 = 1;
  (function (exports) {
    exports.isInteger = (num) => {
      if (typeof num === "number") {
        return Number.isInteger(num);
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isInteger(Number(num));
      }
      return false;
    };

    /**
     * Find a node of the given type
     */

    exports.find = (node, type) =>
      node.nodes.find((node) => node.type === type);

    /**
     * Find a node of the given type
     */

    exports.exceedsLimit = (min, max, step = 1, limit) => {
      if (limit === false) return false;
      if (!exports.isInteger(min) || !exports.isInteger(max)) return false;
      return (Number(max) - Number(min)) / Number(step) >= limit;
    };

    /**
     * Escape the given node with '\\' before node.value
     */

    exports.escapeNode = (block, n = 0, type) => {
      const node = block.nodes[n];
      if (!node) return;

      if (
        (type && node.type === type) ||
        node.type === "open" ||
        node.type === "close"
      ) {
        if (node.escaped !== true) {
          node.value = "\\" + node.value;
          node.escaped = true;
        }
      }
    };

    /**
     * Returns true if the given brace node should be enclosed in literal braces
     */

    exports.encloseBrace = (node) => {
      if (node.type !== "brace") return false;
      if ((node.commas >> (0 + node.ranges)) >> 0 === 0) {
        node.invalid = true;
        return true;
      }
      return false;
    };

    /**
     * Returns true if a brace node is invalid.
     */

    exports.isInvalidBrace = (block) => {
      if (block.type !== "brace") return false;
      if (block.invalid === true || block.dollar) return true;
      if ((block.commas >> (0 + block.ranges)) >> 0 === 0) {
        block.invalid = true;
        return true;
      }
      if (block.open !== true || block.close !== true) {
        block.invalid = true;
        return true;
      }
      return false;
    };

    /**
     * Returns true if a node is an open or close node
     */

    exports.isOpenOrClose = (node) => {
      if (node.type === "open" || node.type === "close") {
        return true;
      }
      return node.open === true || node.close === true;
    };

    /**
     * Reduce an array of text nodes.
     */

    exports.reduce = (nodes) =>
      nodes.reduce((acc, node) => {
        if (node.type === "text") acc.push(node.value);
        if (node.type === "range") node.type = "text";
        return acc;
      }, []);

    /**
     * Flatten an array
     */

    exports.flatten = (...args) => {
      const result = [];

      const flat = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          const ele = arr[i];

          if (Array.isArray(ele)) {
            flat(ele);
            continue;
          }

          if (ele !== undefined) {
            result.push(ele);
          }
        }
        return result;
      };

      flat(args);
      return result;
    };
  })(utils$2);
  return utils$2;
}

var stringify;
var hasRequiredStringify;

function requireStringify() {
  if (hasRequiredStringify) return stringify;
  hasRequiredStringify = 1;

  const utils = requireUtils$3();

  stringify = (ast, options = {}) => {
    const stringify = (node, parent = {}) => {
      const invalidBlock =
        options.escapeInvalid && utils.isInvalidBrace(parent);
      const invalidNode =
        node.invalid === true && options.escapeInvalid === true;
      let output = "";

      if (node.value) {
        if ((invalidBlock || invalidNode) && utils.isOpenOrClose(node)) {
          return "\\" + node.value;
        }
        return node.value;
      }

      if (node.value) {
        return node.value;
      }

      if (node.nodes) {
        for (const child of node.nodes) {
          output += stringify(child);
        }
      }
      return output;
    };

    return stringify(ast);
  };
  return stringify;
}

/*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT License.
 */

var isNumber;
var hasRequiredIsNumber;

function requireIsNumber() {
  if (hasRequiredIsNumber) return isNumber;
  hasRequiredIsNumber = 1;

  isNumber = function (num) {
    if (typeof num === "number") {
      return num - num === 0;
    }
    if (typeof num === "string" && num.trim() !== "") {
      return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
    }
    return false;
  };
  return isNumber;
}

/*!
 * to-regex-range <https://github.com/micromatch/to-regex-range>
 *
 * Copyright (c) 2015-present, Jon Schlinkert.
 * Released under the MIT License.
 */

var toRegexRange_1;
var hasRequiredToRegexRange;

function requireToRegexRange() {
  if (hasRequiredToRegexRange) return toRegexRange_1;
  hasRequiredToRegexRange = 1;

  const isNumber = requireIsNumber();

  const toRegexRange = (min, max, options) => {
    if (isNumber(min) === false) {
      throw new TypeError(
        "toRegexRange: expected the first argument to be a number",
      );
    }

    if (max === undefined || min === max) {
      return String(min);
    }

    if (isNumber(max) === false) {
      throw new TypeError(
        "toRegexRange: expected the second argument to be a number.",
      );
    }

    let opts = { relaxZeros: true, ...options };
    if (typeof opts.strictZeros === "boolean") {
      opts.relaxZeros = opts.strictZeros === false;
    }

    let relax = String(opts.relaxZeros);
    let shorthand = String(opts.shorthand);
    let capture = String(opts.capture);
    let wrap = String(opts.wrap);
    let cacheKey = min + ":" + max + "=" + relax + shorthand + capture + wrap;

    if (toRegexRange.cache.hasOwnProperty(cacheKey)) {
      return toRegexRange.cache[cacheKey].result;
    }

    let a = Math.min(min, max);
    let b = Math.max(min, max);

    if (Math.abs(a - b) === 1) {
      let result = min + "|" + max;
      if (opts.capture) {
        return `(${result})`;
      }
      if (opts.wrap === false) {
        return result;
      }
      return `(?:${result})`;
    }

    let isPadded = hasPadding(min) || hasPadding(max);
    let state = { min, max, a, b };
    let positives = [];
    let negatives = [];

    if (isPadded) {
      state.isPadded = isPadded;
      state.maxLen = String(state.max).length;
    }

    if (a < 0) {
      let newMin = b < 0 ? Math.abs(b) : 1;
      negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
      a = state.a = 0;
    }

    if (b >= 0) {
      positives = splitToPatterns(a, b, state, opts);
    }

    state.negatives = negatives;
    state.positives = positives;
    state.result = collatePatterns(negatives, positives);

    if (opts.capture === true) {
      state.result = `(${state.result})`;
    } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
      state.result = `(?:${state.result})`;
    }

    toRegexRange.cache[cacheKey] = state;
    return state.result;
  };

  function collatePatterns(neg, pos, options) {
    let onlyNegative = filterPatterns(neg, pos, "-", false);
    let onlyPositive = filterPatterns(pos, neg, "", false);
    let intersected = filterPatterns(neg, pos, "-?", true);
    let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
    return subpatterns.join("|");
  }

  function splitToRanges(min, max) {
    let nines = 1;
    let zeros = 1;

    let stop = countNines(min, nines);
    let stops = new Set([max]);

    while (min <= stop && stop <= max) {
      stops.add(stop);
      nines += 1;
      stop = countNines(min, nines);
    }

    stop = countZeros(max + 1, zeros) - 1;

    while (min < stop && stop <= max) {
      stops.add(stop);
      zeros += 1;
      stop = countZeros(max + 1, zeros) - 1;
    }

    stops = [...stops];
    stops.sort(compare);
    return stops;
  }

  /**
   * Convert a range to a regex pattern
   * @param {Number} `start`
   * @param {Number} `stop`
   * @return {String}
   */

  function rangeToPattern(start, stop, options) {
    if (start === stop) {
      return { pattern: start, count: [], digits: 0 };
    }

    let zipped = zip(start, stop);
    let digits = zipped.length;
    let pattern = "";
    let count = 0;

    for (let i = 0; i < digits; i++) {
      let [startDigit, stopDigit] = zipped[i];

      if (startDigit === stopDigit) {
        pattern += startDigit;
      } else if (startDigit !== "0" || stopDigit !== "9") {
        pattern += toCharacterClass(startDigit, stopDigit);
      } else {
        count++;
      }
    }

    if (count) {
      pattern += options.shorthand === true ? "\\d" : "[0-9]";
    }

    return { pattern, count: [count], digits };
  }

  function splitToPatterns(min, max, tok, options) {
    let ranges = splitToRanges(min, max);
    let tokens = [];
    let start = min;
    let prev;

    for (let i = 0; i < ranges.length; i++) {
      let max = ranges[i];
      let obj = rangeToPattern(String(start), String(max), options);
      let zeros = "";

      if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
        if (prev.count.length > 1) {
          prev.count.pop();
        }

        prev.count.push(obj.count[0]);
        prev.string = prev.pattern + toQuantifier(prev.count);
        start = max + 1;
        continue;
      }

      if (tok.isPadded) {
        zeros = padZeros(max, tok, options);
      }

      obj.string = zeros + obj.pattern + toQuantifier(obj.count);
      tokens.push(obj);
      start = max + 1;
      prev = obj;
    }

    return tokens;
  }

  function filterPatterns(arr, comparison, prefix, intersection, options) {
    let result = [];

    for (let ele of arr) {
      let { string } = ele;

      // only push if _both_ are negative...
      if (!intersection && !contains(comparison, "string", string)) {
        result.push(prefix + string);
      }

      // or _both_ are positive
      if (intersection && contains(comparison, "string", string)) {
        result.push(prefix + string);
      }
    }
    return result;
  }

  /**
   * Zip strings
   */

  function zip(a, b) {
    let arr = [];
    for (let i = 0; i < a.length; i++) arr.push([a[i], b[i]]);
    return arr;
  }

  function compare(a, b) {
    return a > b ? 1 : b > a ? -1 : 0;
  }

  function contains(arr, key, val) {
    return arr.some((ele) => ele[key] === val);
  }

  function countNines(min, len) {
    return Number(String(min).slice(0, -len) + "9".repeat(len));
  }

  function countZeros(integer, zeros) {
    return integer - (integer % Math.pow(10, zeros));
  }

  function toQuantifier(digits) {
    let [start = 0, stop = ""] = digits;
    if (stop || start > 1) {
      return `{${start + (stop ? "," + stop : "")}}`;
    }
    return "";
  }

  function toCharacterClass(a, b, options) {
    return `[${a}${b - a === 1 ? "" : "-"}${b}]`;
  }

  function hasPadding(str) {
    return /^-?(0+)\d/.test(str);
  }

  function padZeros(value, tok, options) {
    if (!tok.isPadded) {
      return value;
    }

    let diff = Math.abs(tok.maxLen - String(value).length);
    let relax = options.relaxZeros !== false;

    switch (diff) {
      case 0:
        return "";
      case 1:
        return relax ? "0?" : "0";
      case 2:
        return relax ? "0{0,2}" : "00";
      default: {
        return relax ? `0{0,${diff}}` : `0{${diff}}`;
      }
    }
  }

  /**
   * Cache
   */

  toRegexRange.cache = {};
  toRegexRange.clearCache = () => (toRegexRange.cache = {});

  /**
   * Expose `toRegexRange`
   */

  toRegexRange_1 = toRegexRange;
  return toRegexRange_1;
}

/*!
 * fill-range <https://github.com/jonschlinkert/fill-range>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var fillRange;
var hasRequiredFillRange;

function requireFillRange() {
  if (hasRequiredFillRange) return fillRange;
  hasRequiredFillRange = 1;

  const util = require$$0$2;
  const toRegexRange = requireToRegexRange();

  const isObject = (val) =>
    val !== null && typeof val === "object" && !Array.isArray(val);

  const transform = (toNumber) => {
    return (value) => (toNumber === true ? Number(value) : String(value));
  };

  const isValidValue = (value) => {
    return (
      typeof value === "number" || (typeof value === "string" && value !== "")
    );
  };

  const isNumber = (num) => Number.isInteger(+num);

  const zeros = (input) => {
    let value = `${input}`;
    let index = -1;
    if (value[0] === "-") value = value.slice(1);
    if (value === "0") return false;
    while (value[++index] === "0");
    return index > 0;
  };

  const stringify = (start, end, options) => {
    if (typeof start === "string" || typeof end === "string") {
      return true;
    }
    return options.stringify === true;
  };

  const pad = (input, maxLength, toNumber) => {
    if (maxLength > 0) {
      let dash = input[0] === "-" ? "-" : "";
      if (dash) input = input.slice(1);
      input = dash + input.padStart(dash ? maxLength - 1 : maxLength, "0");
    }
    if (toNumber === false) {
      return String(input);
    }
    return input;
  };

  const toMaxLen = (input, maxLength) => {
    let negative = input[0] === "-" ? "-" : "";
    if (negative) {
      input = input.slice(1);
      maxLength--;
    }
    while (input.length < maxLength) input = "0" + input;
    return negative ? "-" + input : input;
  };

  const toSequence = (parts, options, maxLen) => {
    parts.negatives.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    parts.positives.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    let prefix = options.capture ? "" : "?:";
    let positives = "";
    let negatives = "";
    let result;

    if (parts.positives.length) {
      positives = parts.positives
        .map((v) => toMaxLen(String(v), maxLen))
        .join("|");
    }

    if (parts.negatives.length) {
      negatives = `-(${prefix}${parts.negatives.map((v) => toMaxLen(String(v), maxLen)).join("|")})`;
    }

    if (positives && negatives) {
      result = `${positives}|${negatives}`;
    } else {
      result = positives || negatives;
    }

    if (options.wrap) {
      return `(${prefix}${result})`;
    }

    return result;
  };

  const toRange = (a, b, isNumbers, options) => {
    if (isNumbers) {
      return toRegexRange(a, b, { wrap: false, ...options });
    }

    let start = String.fromCharCode(a);
    if (a === b) return start;

    let stop = String.fromCharCode(b);
    return `[${start}-${stop}]`;
  };

  const toRegex = (start, end, options) => {
    if (Array.isArray(start)) {
      let wrap = options.wrap === true;
      let prefix = options.capture ? "" : "?:";
      return wrap ? `(${prefix}${start.join("|")})` : start.join("|");
    }
    return toRegexRange(start, end, options);
  };

  const rangeError = (...args) => {
    return new RangeError("Invalid range arguments: " + util.inspect(...args));
  };

  const invalidRange = (start, end, options) => {
    if (options.strictRanges === true) throw rangeError([start, end]);
    return [];
  };

  const invalidStep = (step, options) => {
    if (options.strictRanges === true) {
      throw new TypeError(`Expected step "${step}" to be a number`);
    }
    return [];
  };

  const fillNumbers = (start, end, step = 1, options = {}) => {
    let a = Number(start);
    let b = Number(end);

    if (!Number.isInteger(a) || !Number.isInteger(b)) {
      if (options.strictRanges === true) throw rangeError([start, end]);
      return [];
    }

    // fix negative zero
    if (a === 0) a = 0;
    if (b === 0) b = 0;

    let descending = a > b;
    let startString = String(start);
    let endString = String(end);
    let stepString = String(step);
    step = Math.max(Math.abs(step), 1);

    let padded = zeros(startString) || zeros(endString) || zeros(stepString);
    let maxLen = padded
      ? Math.max(startString.length, endString.length, stepString.length)
      : 0;
    let toNumber = padded === false && stringify(start, end, options) === false;
    let format = options.transform || transform(toNumber);

    if (options.toRegex && step === 1) {
      return toRange(
        toMaxLen(start, maxLen),
        toMaxLen(end, maxLen),
        true,
        options,
      );
    }

    let parts = { negatives: [], positives: [] };
    let push = (num) =>
      parts[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
    let range = [];
    let index = 0;

    while (descending ? a >= b : a <= b) {
      if (options.toRegex === true && step > 1) {
        push(a);
      } else {
        range.push(pad(format(a, index), maxLen, toNumber));
      }
      a = descending ? a - step : a + step;
      index++;
    }

    if (options.toRegex === true) {
      return step > 1
        ? toSequence(parts, options, maxLen)
        : toRegex(range, null, { wrap: false, ...options });
    }

    return range;
  };

  const fillLetters = (start, end, step = 1, options = {}) => {
    if (
      (!isNumber(start) && start.length > 1) ||
      (!isNumber(end) && end.length > 1)
    ) {
      return invalidRange(start, end, options);
    }

    let format = options.transform || ((val) => String.fromCharCode(val));
    let a = `${start}`.charCodeAt(0);
    let b = `${end}`.charCodeAt(0);

    let descending = a > b;
    let min = Math.min(a, b);
    let max = Math.max(a, b);

    if (options.toRegex && step === 1) {
      return toRange(min, max, false, options);
    }

    let range = [];
    let index = 0;

    while (descending ? a >= b : a <= b) {
      range.push(format(a, index));
      a = descending ? a - step : a + step;
      index++;
    }

    if (options.toRegex === true) {
      return toRegex(range, null, { wrap: false, options });
    }

    return range;
  };

  const fill = (start, end, step, options = {}) => {
    if (end == null && isValidValue(start)) {
      return [start];
    }

    if (!isValidValue(start) || !isValidValue(end)) {
      return invalidRange(start, end, options);
    }

    if (typeof step === "function") {
      return fill(start, end, 1, { transform: step });
    }

    if (isObject(step)) {
      return fill(start, end, 0, step);
    }

    let opts = { ...options };
    if (opts.capture === true) opts.wrap = true;
    step = step || opts.step || 1;

    if (!isNumber(step)) {
      if (step != null && !isObject(step)) return invalidStep(step, opts);
      return fill(start, end, 1, step);
    }

    if (isNumber(start) && isNumber(end)) {
      return fillNumbers(start, end, step, opts);
    }

    return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
  };

  fillRange = fill;
  return fillRange;
}

var compile_1;
var hasRequiredCompile;

function requireCompile() {
  if (hasRequiredCompile) return compile_1;
  hasRequiredCompile = 1;

  const fill = requireFillRange();
  const utils = requireUtils$3();

  const compile = (ast, options = {}) => {
    const walk = (node, parent = {}) => {
      const invalidBlock = utils.isInvalidBrace(parent);
      const invalidNode =
        node.invalid === true && options.escapeInvalid === true;
      const invalid = invalidBlock === true || invalidNode === true;
      const prefix = options.escapeInvalid === true ? "\\" : "";
      let output = "";

      if (node.isOpen === true) {
        return prefix + node.value;
      }

      if (node.isClose === true) {
        console.log("node.isClose", prefix, node.value);
        return prefix + node.value;
      }

      if (node.type === "open") {
        return invalid ? prefix + node.value : "(";
      }

      if (node.type === "close") {
        return invalid ? prefix + node.value : ")";
      }

      if (node.type === "comma") {
        return node.prev.type === "comma" ? "" : invalid ? node.value : "|";
      }

      if (node.value) {
        return node.value;
      }

      if (node.nodes && node.ranges > 0) {
        const args = utils.reduce(node.nodes);
        const range = fill(...args, {
          ...options,
          wrap: false,
          toRegex: true,
          strictZeros: true,
        });

        if (range.length !== 0) {
          return args.length > 1 && range.length > 1 ? `(${range})` : range;
        }
      }

      if (node.nodes) {
        for (const child of node.nodes) {
          output += walk(child, node);
        }
      }

      return output;
    };

    return walk(ast);
  };

  compile_1 = compile;
  return compile_1;
}

var expand_1;
var hasRequiredExpand;

function requireExpand() {
  if (hasRequiredExpand) return expand_1;
  hasRequiredExpand = 1;

  const fill = requireFillRange();
  const stringify = requireStringify();
  const utils = requireUtils$3();

  const append = (queue = "", stash = "", enclose = false) => {
    const result = [];

    queue = [].concat(queue);
    stash = [].concat(stash);

    if (!stash.length) return queue;
    if (!queue.length) {
      return enclose ? utils.flatten(stash).map((ele) => `{${ele}}`) : stash;
    }

    for (const item of queue) {
      if (Array.isArray(item)) {
        for (const value of item) {
          result.push(append(value, stash, enclose));
        }
      } else {
        for (let ele of stash) {
          if (enclose === true && typeof ele === "string") ele = `{${ele}}`;
          result.push(
            Array.isArray(ele) ? append(item, ele, enclose) : item + ele,
          );
        }
      }
    }
    return utils.flatten(result);
  };

  const expand = (ast, options = {}) => {
    const rangeLimit =
      options.rangeLimit === undefined ? 1000 : options.rangeLimit;

    const walk = (node, parent = {}) => {
      node.queue = [];

      let p = parent;
      let q = parent.queue;

      while (p.type !== "brace" && p.type !== "root" && p.parent) {
        p = p.parent;
        q = p.queue;
      }

      if (node.invalid || node.dollar) {
        q.push(append(q.pop(), stringify(node, options)));
        return;
      }

      if (
        node.type === "brace" &&
        node.invalid !== true &&
        node.nodes.length === 2
      ) {
        q.push(append(q.pop(), ["{}"]));
        return;
      }

      if (node.nodes && node.ranges > 0) {
        const args = utils.reduce(node.nodes);

        if (utils.exceedsLimit(...args, options.step, rangeLimit)) {
          throw new RangeError(
            "expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.",
          );
        }

        let range = fill(...args, options);
        if (range.length === 0) {
          range = stringify(node, options);
        }

        q.push(append(q.pop(), range));
        node.nodes = [];
        return;
      }

      const enclose = utils.encloseBrace(node);
      let queue = node.queue;
      let block = node;

      while (block.type !== "brace" && block.type !== "root" && block.parent) {
        block = block.parent;
        queue = block.queue;
      }

      for (let i = 0; i < node.nodes.length; i++) {
        const child = node.nodes[i];

        if (child.type === "comma" && node.type === "brace") {
          if (i === 1) queue.push("");
          queue.push("");
          continue;
        }

        if (child.type === "close") {
          q.push(append(q.pop(), queue, enclose));
          continue;
        }

        if (child.value && child.type !== "open") {
          queue.push(append(queue.pop(), child.value));
          continue;
        }

        if (child.nodes) {
          walk(child, node);
        }
      }

      return queue;
    };

    return utils.flatten(walk(ast));
  };

  expand_1 = expand;
  return expand_1;
}

var constants$2;
var hasRequiredConstants$2;

function requireConstants$2() {
  if (hasRequiredConstants$2) return constants$2;
  hasRequiredConstants$2 = 1;

  constants$2 = {
    MAX_LENGTH: 10000,

    // Digits
    CHAR_0: "0" /* 0 */,
    CHAR_9: "9" /* 9 */,

    // Alphabet chars.
    CHAR_UPPERCASE_A: "A" /* A */,
    CHAR_LOWERCASE_A: "a" /* a */,
    CHAR_UPPERCASE_Z: "Z" /* Z */,
    CHAR_LOWERCASE_Z: "z" /* z */,

    CHAR_LEFT_PARENTHESES: "(" /* ( */,
    CHAR_RIGHT_PARENTHESES: ")" /* ) */,

    CHAR_ASTERISK: "*" /* * */,

    // Non-alphabetic chars.
    CHAR_AMPERSAND: "&" /* & */,
    CHAR_AT: "@" /* @ */,
    CHAR_BACKSLASH: "\\" /* \ */,
    CHAR_BACKTICK: "`" /* ` */,
    CHAR_CARRIAGE_RETURN: "\r" /* \r */,
    CHAR_CIRCUMFLEX_ACCENT: "^" /* ^ */,
    CHAR_COLON: ":" /* : */,
    CHAR_COMMA: "," /* , */,
    CHAR_DOLLAR: "$" /* . */,
    CHAR_DOT: "." /* . */,
    CHAR_DOUBLE_QUOTE: '"' /* " */,
    CHAR_EQUAL: "=" /* = */,
    CHAR_EXCLAMATION_MARK: "!" /* ! */,
    CHAR_FORM_FEED: "\f" /* \f */,
    CHAR_FORWARD_SLASH: "/" /* / */,
    CHAR_HASH: "#" /* # */,
    CHAR_HYPHEN_MINUS: "-" /* - */,
    CHAR_LEFT_ANGLE_BRACKET: "<" /* < */,
    CHAR_LEFT_CURLY_BRACE: "{" /* { */,
    CHAR_LEFT_SQUARE_BRACKET: "[" /* [ */,
    CHAR_LINE_FEED: "\n" /* \n */,
    CHAR_NO_BREAK_SPACE: "\u00A0" /* \u00A0 */,
    CHAR_PERCENT: "%" /* % */,
    CHAR_PLUS: "+" /* + */,
    CHAR_QUESTION_MARK: "?" /* ? */,
    CHAR_RIGHT_ANGLE_BRACKET: ">" /* > */,
    CHAR_RIGHT_CURLY_BRACE: "}" /* } */,
    CHAR_RIGHT_SQUARE_BRACKET: "]" /* ] */,
    CHAR_SEMICOLON: ";" /* ; */,
    CHAR_SINGLE_QUOTE: "'" /* ' */,
    CHAR_SPACE: " " /*   */,
    CHAR_TAB: "\t" /* \t */,
    CHAR_UNDERSCORE: "_" /* _ */,
    CHAR_VERTICAL_LINE: "|" /* | */,
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: "\uFEFF" /* \uFEFF */,
  };
  return constants$2;
}

var parse_1$1;
var hasRequiredParse$1;

function requireParse$1() {
  if (hasRequiredParse$1) return parse_1$1;
  hasRequiredParse$1 = 1;

  const stringify = requireStringify();

  /**
   * Constants
   */

  const {
    MAX_LENGTH,
    CHAR_BACKSLASH /* \ */,
    CHAR_BACKTICK /* ` */,
    CHAR_COMMA /* , */,
    CHAR_DOT /* . */,
    CHAR_LEFT_PARENTHESES /* ( */,
    CHAR_RIGHT_PARENTHESES /* ) */,
    CHAR_LEFT_CURLY_BRACE /* { */,
    CHAR_RIGHT_CURLY_BRACE /* } */,
    CHAR_LEFT_SQUARE_BRACKET /* [ */,
    CHAR_RIGHT_SQUARE_BRACKET /* ] */,
    CHAR_DOUBLE_QUOTE /* " */,
    CHAR_SINGLE_QUOTE /* ' */,
    CHAR_NO_BREAK_SPACE,
    CHAR_ZERO_WIDTH_NOBREAK_SPACE,
  } = requireConstants$2();

  /**
   * parse
   */

  const parse = (input, options = {}) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected a string");
    }

    const opts = options || {};
    const max =
      typeof opts.maxLength === "number"
        ? Math.min(MAX_LENGTH, opts.maxLength)
        : MAX_LENGTH;
    if (input.length > max) {
      throw new SyntaxError(
        `Input length (${input.length}), exceeds max characters (${max})`,
      );
    }

    const ast = { type: "root", input, nodes: [] };
    const stack = [ast];
    let block = ast;
    let prev = ast;
    let brackets = 0;
    const length = input.length;
    let index = 0;
    let depth = 0;
    let value;

    /**
     * Helpers
     */

    const advance = () => input[index++];
    const push = (node) => {
      if (node.type === "text" && prev.type === "dot") {
        prev.type = "text";
      }

      if (prev && prev.type === "text" && node.type === "text") {
        prev.value += node.value;
        return;
      }

      block.nodes.push(node);
      node.parent = block;
      node.prev = prev;
      prev = node;
      return node;
    };

    push({ type: "bos" });

    while (index < length) {
      block = stack[stack.length - 1];
      value = advance();

      /**
       * Invalid chars
       */

      if (
        value === CHAR_ZERO_WIDTH_NOBREAK_SPACE ||
        value === CHAR_NO_BREAK_SPACE
      ) {
        continue;
      }

      /**
       * Escaped chars
       */

      if (value === CHAR_BACKSLASH) {
        push({
          type: "text",
          value: (options.keepEscaping ? value : "") + advance(),
        });
        continue;
      }

      /**
       * Right square bracket (literal): ']'
       */

      if (value === CHAR_RIGHT_SQUARE_BRACKET) {
        push({ type: "text", value: "\\" + value });
        continue;
      }

      /**
       * Left square bracket: '['
       */

      if (value === CHAR_LEFT_SQUARE_BRACKET) {
        brackets++;

        let next;

        while (index < length && (next = advance())) {
          value += next;

          if (next === CHAR_LEFT_SQUARE_BRACKET) {
            brackets++;
            continue;
          }

          if (next === CHAR_BACKSLASH) {
            value += advance();
            continue;
          }

          if (next === CHAR_RIGHT_SQUARE_BRACKET) {
            brackets--;

            if (brackets === 0) {
              break;
            }
          }
        }

        push({ type: "text", value });
        continue;
      }

      /**
       * Parentheses
       */

      if (value === CHAR_LEFT_PARENTHESES) {
        block = push({ type: "paren", nodes: [] });
        stack.push(block);
        push({ type: "text", value });
        continue;
      }

      if (value === CHAR_RIGHT_PARENTHESES) {
        if (block.type !== "paren") {
          push({ type: "text", value });
          continue;
        }
        block = stack.pop();
        push({ type: "text", value });
        block = stack[stack.length - 1];
        continue;
      }

      /**
       * Quotes: '|"|`
       */

      if (
        value === CHAR_DOUBLE_QUOTE ||
        value === CHAR_SINGLE_QUOTE ||
        value === CHAR_BACKTICK
      ) {
        const open = value;
        let next;

        if (options.keepQuotes !== true) {
          value = "";
        }

        while (index < length && (next = advance())) {
          if (next === CHAR_BACKSLASH) {
            value += next + advance();
            continue;
          }

          if (next === open) {
            if (options.keepQuotes === true) value += next;
            break;
          }

          value += next;
        }

        push({ type: "text", value });
        continue;
      }

      /**
       * Left curly brace: '{'
       */

      if (value === CHAR_LEFT_CURLY_BRACE) {
        depth++;

        const dollar =
          (prev.value && prev.value.slice(-1) === "$") || block.dollar === true;
        const brace = {
          type: "brace",
          open: true,
          close: false,
          dollar,
          depth,
          commas: 0,
          ranges: 0,
          nodes: [],
        };

        block = push(brace);
        stack.push(block);
        push({ type: "open", value });
        continue;
      }

      /**
       * Right curly brace: '}'
       */

      if (value === CHAR_RIGHT_CURLY_BRACE) {
        if (block.type !== "brace") {
          push({ type: "text", value });
          continue;
        }

        const type = "close";
        block = stack.pop();
        block.close = true;

        push({ type, value });
        depth--;

        block = stack[stack.length - 1];
        continue;
      }

      /**
       * Comma: ','
       */

      if (value === CHAR_COMMA && depth > 0) {
        if (block.ranges > 0) {
          block.ranges = 0;
          const open = block.nodes.shift();
          block.nodes = [open, { type: "text", value: stringify(block) }];
        }

        push({ type: "comma", value });
        block.commas++;
        continue;
      }

      /**
       * Dot: '.'
       */

      if (value === CHAR_DOT && depth > 0 && block.commas === 0) {
        const siblings = block.nodes;

        if (depth === 0 || siblings.length === 0) {
          push({ type: "text", value });
          continue;
        }

        if (prev.type === "dot") {
          block.range = [];
          prev.value += value;
          prev.type = "range";

          if (block.nodes.length !== 3 && block.nodes.length !== 5) {
            block.invalid = true;
            block.ranges = 0;
            prev.type = "text";
            continue;
          }

          block.ranges++;
          block.args = [];
          continue;
        }

        if (prev.type === "range") {
          siblings.pop();

          const before = siblings[siblings.length - 1];
          before.value += prev.value + value;
          prev = before;
          block.ranges--;
          continue;
        }

        push({ type: "dot", value });
        continue;
      }

      /**
       * Text
       */

      push({ type: "text", value });
    }

    // Mark imbalanced braces and brackets as invalid
    do {
      block = stack.pop();

      if (block.type !== "root") {
        block.nodes.forEach((node) => {
          if (!node.nodes) {
            if (node.type === "open") node.isOpen = true;
            if (node.type === "close") node.isClose = true;
            if (!node.nodes) node.type = "text";
            node.invalid = true;
          }
        });

        // get the location of the block on parent.nodes (block's siblings)
        const parent = stack[stack.length - 1];
        const index = parent.nodes.indexOf(block);
        // replace the (invalid) block with it's nodes
        parent.nodes.splice(index, 1, ...block.nodes);
      }
    } while (stack.length > 0);

    push({ type: "eos" });
    return ast;
  };

  parse_1$1 = parse;
  return parse_1$1;
}

var braces_1;
var hasRequiredBraces;

function requireBraces() {
  if (hasRequiredBraces) return braces_1;
  hasRequiredBraces = 1;

  const stringify = requireStringify();
  const compile = requireCompile();
  const expand = requireExpand();
  const parse = requireParse$1();

  /**
   * Expand the given pattern or create a regex-compatible string.
   *
   * ```js
   * const braces = require('braces');
   * console.log(braces('{a,b,c}', { compile: true })); //=> ['(a|b|c)']
   * console.log(braces('{a,b,c}')); //=> ['a', 'b', 'c']
   * ```
   * @param {String} `str`
   * @param {Object} `options`
   * @return {String}
   * @api public
   */

  const braces = (input, options = {}) => {
    let output = [];

    if (Array.isArray(input)) {
      for (const pattern of input) {
        const result = braces.create(pattern, options);
        if (Array.isArray(result)) {
          output.push(...result);
        } else {
          output.push(result);
        }
      }
    } else {
      output = [].concat(braces.create(input, options));
    }

    if (options && options.expand === true && options.nodupes === true) {
      output = [...new Set(output)];
    }
    return output;
  };

  /**
   * Parse the given `str` with the given `options`.
   *
   * ```js
   * // braces.parse(pattern, [, options]);
   * const ast = braces.parse('a/{b,c}/d');
   * console.log(ast);
   * ```
   * @param {String} pattern Brace pattern to parse
   * @param {Object} options
   * @return {Object} Returns an AST
   * @api public
   */

  braces.parse = (input, options = {}) => parse(input, options);

  /**
   * Creates a braces string from an AST, or an AST node.
   *
   * ```js
   * const braces = require('braces');
   * let ast = braces.parse('foo/{a,b}/bar');
   * console.log(stringify(ast.nodes[2])); //=> '{a,b}'
   * ```
   * @param {String} `input` Brace pattern or AST.
   * @param {Object} `options`
   * @return {Array} Returns an array of expanded values.
   * @api public
   */

  braces.stringify = (input, options = {}) => {
    if (typeof input === "string") {
      return stringify(braces.parse(input, options), options);
    }
    return stringify(input, options);
  };

  /**
   * Compiles a brace pattern into a regex-compatible, optimized string.
   * This method is called by the main [braces](#braces) function by default.
   *
   * ```js
   * const braces = require('braces');
   * console.log(braces.compile('a/{b,c}/d'));
   * //=> ['a/(b|c)/d']
   * ```
   * @param {String} `input` Brace pattern or AST.
   * @param {Object} `options`
   * @return {Array} Returns an array of expanded values.
   * @api public
   */

  braces.compile = (input, options = {}) => {
    if (typeof input === "string") {
      input = braces.parse(input, options);
    }
    return compile(input, options);
  };

  /**
   * Expands a brace pattern into an array. This method is called by the
   * main [braces](#braces) function when `options.expand` is true. Before
   * using this method it's recommended that you read the [performance notes](#performance))
   * and advantages of using [.compile](#compile) instead.
   *
   * ```js
   * const braces = require('braces');
   * console.log(braces.expand('a/{b,c}/d'));
   * //=> ['a/b/d', 'a/c/d'];
   * ```
   * @param {String} `pattern` Brace pattern
   * @param {Object} `options`
   * @return {Array} Returns an array of expanded values.
   * @api public
   */

  braces.expand = (input, options = {}) => {
    if (typeof input === "string") {
      input = braces.parse(input, options);
    }

    let result = expand(input, options);

    // filter out empty strings if specified
    if (options.noempty === true) {
      result = result.filter(Boolean);
    }

    // filter out duplicates if specified
    if (options.nodupes === true) {
      result = [...new Set(result)];
    }

    return result;
  };

  /**
   * Processes a brace pattern and returns either an expanded array
   * (if `options.expand` is true), a highly optimized regex-compatible string.
   * This method is called by the main [braces](#braces) function.
   *
   * ```js
   * const braces = require('braces');
   * console.log(braces.create('user-{200..300}/project-{a,b,c}-{1..10}'))
   * //=> 'user-(20[0-9]|2[1-9][0-9]|300)/project-(a|b|c)-([1-9]|10)'
   * ```
   * @param {String} `pattern` Brace pattern
   * @param {Object} `options`
   * @return {Array} Returns an array of expanded values.
   * @api public
   */

  braces.create = (input, options = {}) => {
    if (input === "" || input.length < 3) {
      return [input];
    }

    return options.expand !== true
      ? braces.compile(input, options)
      : braces.expand(input, options);
  };

  /**
   * Expose "braces"
   */

  braces_1 = braces;
  return braces_1;
}

var utils$1 = {};

var constants$1;
var hasRequiredConstants$1;

function requireConstants$1() {
  if (hasRequiredConstants$1) return constants$1;
  hasRequiredConstants$1 = 1;

  const path = require$$0$1;
  const WIN_SLASH = "\\\\/";
  const WIN_NO_SLASH = `[^${WIN_SLASH}]`;

  /**
   * Posix glob regex
   */

  const DOT_LITERAL = "\\.";
  const PLUS_LITERAL = "\\+";
  const QMARK_LITERAL = "\\?";
  const SLASH_LITERAL = "\\/";
  const ONE_CHAR = "(?=.)";
  const QMARK = "[^/]";
  const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
  const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
  const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
  const NO_DOT = `(?!${DOT_LITERAL})`;
  const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
  const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
  const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
  const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
  const STAR = `${QMARK}*?`;

  const POSIX_CHARS = {
    DOT_LITERAL,
    PLUS_LITERAL,
    QMARK_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    QMARK,
    END_ANCHOR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR,
  };

  /**
   * Windows glob regex
   */

  const WINDOWS_CHARS = {
    ...POSIX_CHARS,

    SLASH_LITERAL: `[${WIN_SLASH}]`,
    QMARK: WIN_NO_SLASH,
    STAR: `${WIN_NO_SLASH}*?`,
    DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
    NO_DOT: `(?!${DOT_LITERAL})`,
    NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
    NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
    START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
    END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
  };

  /**
   * POSIX Bracket Regex
   */

  const POSIX_REGEX_SOURCE = {
    alnum: "a-zA-Z0-9",
    alpha: "a-zA-Z",
    ascii: "\\x00-\\x7F",
    blank: " \\t",
    cntrl: "\\x00-\\x1F\\x7F",
    digit: "0-9",
    graph: "\\x21-\\x7E",
    lower: "a-z",
    print: "\\x20-\\x7E ",
    punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
    space: " \\t\\r\\n\\v\\f",
    upper: "A-Z",
    word: "A-Za-z0-9_",
    xdigit: "A-Fa-f0-9",
  };

  constants$1 = {
    MAX_LENGTH: 1024 * 64,
    POSIX_REGEX_SOURCE,

    // regular expressions
    REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
    REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
    REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
    REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
    REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
    REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,

    // Replace globs with equivalent patterns to reduce parsing time.
    REPLACEMENTS: {
      "***": "*",
      "**/**": "**",
      "**/**/**": "**",
    },

    // Digits
    CHAR_0: 48 /* 0 */,
    CHAR_9: 57 /* 9 */,

    // Alphabet chars.
    CHAR_UPPERCASE_A: 65 /* A */,
    CHAR_LOWERCASE_A: 97 /* a */,
    CHAR_UPPERCASE_Z: 90 /* Z */,
    CHAR_LOWERCASE_Z: 122 /* z */,

    CHAR_LEFT_PARENTHESES: 40 /* ( */,
    CHAR_RIGHT_PARENTHESES: 41 /* ) */,

    CHAR_ASTERISK: 42 /* * */,

    // Non-alphabetic chars.
    CHAR_AMPERSAND: 38 /* & */,
    CHAR_AT: 64 /* @ */,
    CHAR_BACKWARD_SLASH: 92 /* \ */,
    CHAR_CARRIAGE_RETURN: 13 /* \r */,
    CHAR_CIRCUMFLEX_ACCENT: 94 /* ^ */,
    CHAR_COLON: 58 /* : */,
    CHAR_COMMA: 44 /* , */,
    CHAR_DOT: 46 /* . */,
    CHAR_DOUBLE_QUOTE: 34 /* " */,
    CHAR_EQUAL: 61 /* = */,
    CHAR_EXCLAMATION_MARK: 33 /* ! */,
    CHAR_FORM_FEED: 12 /* \f */,
    CHAR_FORWARD_SLASH: 47 /* / */,
    CHAR_GRAVE_ACCENT: 96 /* ` */,
    CHAR_HASH: 35 /* # */,
    CHAR_HYPHEN_MINUS: 45 /* - */,
    CHAR_LEFT_ANGLE_BRACKET: 60 /* < */,
    CHAR_LEFT_CURLY_BRACE: 123 /* { */,
    CHAR_LEFT_SQUARE_BRACKET: 91 /* [ */,
    CHAR_LINE_FEED: 10 /* \n */,
    CHAR_NO_BREAK_SPACE: 160 /* \u00A0 */,
    CHAR_PERCENT: 37 /* % */,
    CHAR_PLUS: 43 /* + */,
    CHAR_QUESTION_MARK: 63 /* ? */,
    CHAR_RIGHT_ANGLE_BRACKET: 62 /* > */,
    CHAR_RIGHT_CURLY_BRACE: 125 /* } */,
    CHAR_RIGHT_SQUARE_BRACKET: 93 /* ] */,
    CHAR_SEMICOLON: 59 /* ; */,
    CHAR_SINGLE_QUOTE: 39 /* ' */,
    CHAR_SPACE: 32 /*   */,
    CHAR_TAB: 9 /* \t */,
    CHAR_UNDERSCORE: 95 /* _ */,
    CHAR_VERTICAL_LINE: 124 /* | */,
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279 /* \uFEFF */,

    SEP: path.sep,

    /**
     * Create EXTGLOB_CHARS
     */

    extglobChars(chars) {
      return {
        "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
        "?": { type: "qmark", open: "(?:", close: ")?" },
        "+": { type: "plus", open: "(?:", close: ")+" },
        "*": { type: "star", open: "(?:", close: ")*" },
        "@": { type: "at", open: "(?:", close: ")" },
      };
    },

    /**
     * Create GLOB_CHARS
     */

    globChars(win32) {
      return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
    },
  };
  return constants$1;
}

var hasRequiredUtils$2;

function requireUtils$2() {
  if (hasRequiredUtils$2) return utils$1;
  hasRequiredUtils$2 = 1;
  (function (exports) {
    const path = require$$0$1;
    const win32 = process.platform === "win32";
    const {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL,
    } = requireConstants$1();

    exports.isObject = (val) =>
      val !== null && typeof val === "object" && !Array.isArray(val);
    exports.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
    exports.isRegexChar = (str) =>
      str.length === 1 && exports.hasRegexChars(str);
    exports.escapeRegex = (str) =>
      str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");

    exports.removeBackslashes = (str) => {
      return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };

    exports.supportsLookbehinds = () => {
      const segs = process.version.slice(1).split(".").map(Number);
      if (
        (segs.length === 3 && segs[0] >= 9) ||
        (segs[0] === 8 && segs[1] >= 10)
      ) {
        return true;
      }
      return false;
    };

    exports.isWindows = (options) => {
      if (options && typeof options.windows === "boolean") {
        return options.windows;
      }
      return win32 === true || path.sep === "\\";
    };

    exports.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1) return input;
      if (input[idx - 1] === "\\")
        return exports.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };

    exports.removePrefix = (input, state = {}) => {
      let output = input;
      if (output.startsWith("./")) {
        output = output.slice(2);
        state.prefix = "./";
      }
      return output;
    };

    exports.wrapOutput = (input, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";

      let output = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output = `(?:^(?!${output}).*$)`;
      }
      return output;
    };
  })(utils$1);
  return utils$1;
}

var scan_1;
var hasRequiredScan;

function requireScan() {
  if (hasRequiredScan) return scan_1;
  hasRequiredScan = 1;

  const utils = requireUtils$2();
  const {
    CHAR_ASTERISK /* * */,
    CHAR_AT /* @ */,
    CHAR_BACKWARD_SLASH /* \ */,
    CHAR_COMMA /* , */,
    CHAR_DOT /* . */,
    CHAR_EXCLAMATION_MARK /* ! */,
    CHAR_FORWARD_SLASH /* / */,
    CHAR_LEFT_CURLY_BRACE /* { */,
    CHAR_LEFT_PARENTHESES /* ( */,
    CHAR_LEFT_SQUARE_BRACKET /* [ */,
    CHAR_PLUS /* + */,
    CHAR_QUESTION_MARK /* ? */,
    CHAR_RIGHT_CURLY_BRACE /* } */,
    CHAR_RIGHT_PARENTHESES /* ) */,
    CHAR_RIGHT_SQUARE_BRACKET /* ] */,
  } = requireConstants$1();

  const isPathSeparator = (code) => {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
  };

  const depth = (token) => {
    if (token.isPrefix !== true) {
      token.depth = token.isGlobstar ? Infinity : 1;
    }
  };

  /**
   * Quickly scans a glob pattern and returns an object with a handful of
   * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
   * `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
   * with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
   *
   * ```js
   * const pm = require('picomatch');
   * console.log(pm.scan('foo/bar/*.js'));
   * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
   * ```
   * @param {String} `str`
   * @param {Object} `options`
   * @return {Object} Returns an object with tokens and regex source string.
   * @api public
   */

  const scan = (input, options) => {
    const opts = options || {};

    const length = input.length - 1;
    const scanToEnd = opts.parts === true || opts.scanToEnd === true;
    const slashes = [];
    const tokens = [];
    const parts = [];

    let str = input;
    let index = -1;
    let start = 0;
    let lastIndex = 0;
    let isBrace = false;
    let isBracket = false;
    let isGlob = false;
    let isExtglob = false;
    let isGlobstar = false;
    let braceEscaped = false;
    let backslashes = false;
    let negated = false;
    let negatedExtglob = false;
    let finished = false;
    let braces = 0;
    let prev;
    let code;
    let token = { value: "", depth: 0, isGlob: false };

    const eos = () => index >= length;
    const peek = () => str.charCodeAt(index + 1);
    const advance = () => {
      prev = code;
      return str.charCodeAt(++index);
    };

    while (index < length) {
      code = advance();
      let next;

      if (code === CHAR_BACKWARD_SLASH) {
        backslashes = token.backslashes = true;
        code = advance();

        if (code === CHAR_LEFT_CURLY_BRACE) {
          braceEscaped = true;
        }
        continue;
      }

      if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
        braces++;

        while (eos() !== true && (code = advance())) {
          if (code === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }

          if (code === CHAR_LEFT_CURLY_BRACE) {
            braces++;
            continue;
          }

          if (
            braceEscaped !== true &&
            code === CHAR_DOT &&
            (code = advance()) === CHAR_DOT
          ) {
            isBrace = token.isBrace = true;
            isGlob = token.isGlob = true;
            finished = true;

            if (scanToEnd === true) {
              continue;
            }

            break;
          }

          if (braceEscaped !== true && code === CHAR_COMMA) {
            isBrace = token.isBrace = true;
            isGlob = token.isGlob = true;
            finished = true;

            if (scanToEnd === true) {
              continue;
            }

            break;
          }

          if (code === CHAR_RIGHT_CURLY_BRACE) {
            braces--;

            if (braces === 0) {
              braceEscaped = false;
              isBrace = token.isBrace = true;
              finished = true;
              break;
            }
          }
        }

        if (scanToEnd === true) {
          continue;
        }

        break;
      }

      if (code === CHAR_FORWARD_SLASH) {
        slashes.push(index);
        tokens.push(token);
        token = { value: "", depth: 0, isGlob: false };

        if (finished === true) continue;
        if (prev === CHAR_DOT && index === start + 1) {
          start += 2;
          continue;
        }

        lastIndex = index + 1;
        continue;
      }

      if (opts.noext !== true) {
        const isExtglobChar =
          code === CHAR_PLUS ||
          code === CHAR_AT ||
          code === CHAR_ASTERISK ||
          code === CHAR_QUESTION_MARK ||
          code === CHAR_EXCLAMATION_MARK;

        if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          isExtglob = token.isExtglob = true;
          finished = true;
          if (code === CHAR_EXCLAMATION_MARK && index === start) {
            negatedExtglob = true;
          }

          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_BACKWARD_SLASH) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }

              if (code === CHAR_RIGHT_PARENTHESES) {
                isGlob = token.isGlob = true;
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
      }

      if (code === CHAR_ASTERISK) {
        if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
        isGlob = token.isGlob = true;
        finished = true;

        if (scanToEnd === true) {
          continue;
        }
        break;
      }

      if (code === CHAR_QUESTION_MARK) {
        isGlob = token.isGlob = true;
        finished = true;

        if (scanToEnd === true) {
          continue;
        }
        break;
      }

      if (code === CHAR_LEFT_SQUARE_BRACKET) {
        while (eos() !== true && (next = advance())) {
          if (next === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }

          if (next === CHAR_RIGHT_SQUARE_BRACKET) {
            isBracket = token.isBracket = true;
            isGlob = token.isGlob = true;
            finished = true;
            break;
          }
        }

        if (scanToEnd === true) {
          continue;
        }

        break;
      }

      if (
        opts.nonegate !== true &&
        code === CHAR_EXCLAMATION_MARK &&
        index === start
      ) {
        negated = token.negated = true;
        start++;
        continue;
      }

      if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;

        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_LEFT_PARENTHESES) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }

            if (code === CHAR_RIGHT_PARENTHESES) {
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }

      if (isGlob === true) {
        finished = true;

        if (scanToEnd === true) {
          continue;
        }

        break;
      }
    }

    if (opts.noext === true) {
      isExtglob = false;
      isGlob = false;
    }

    let base = str;
    let prefix = "";
    let glob = "";

    if (start > 0) {
      prefix = str.slice(0, start);
      str = str.slice(start);
      lastIndex -= start;
    }

    if (base && isGlob === true && lastIndex > 0) {
      base = str.slice(0, lastIndex);
      glob = str.slice(lastIndex);
    } else if (isGlob === true) {
      base = "";
      glob = str;
    } else {
      base = str;
    }

    if (base && base !== "" && base !== "/" && base !== str) {
      if (isPathSeparator(base.charCodeAt(base.length - 1))) {
        base = base.slice(0, -1);
      }
    }

    if (opts.unescape === true) {
      if (glob) glob = utils.removeBackslashes(glob);

      if (base && backslashes === true) {
        base = utils.removeBackslashes(base);
      }
    }

    const state = {
      prefix,
      input,
      start,
      base,
      glob,
      isBrace,
      isBracket,
      isGlob,
      isExtglob,
      isGlobstar,
      negated,
      negatedExtglob,
    };

    if (opts.tokens === true) {
      state.maxDepth = 0;
      if (!isPathSeparator(code)) {
        tokens.push(token);
      }
      state.tokens = tokens;
    }

    if (opts.parts === true || opts.tokens === true) {
      let prevIndex;

      for (let idx = 0; idx < slashes.length; idx++) {
        const n = prevIndex ? prevIndex + 1 : start;
        const i = slashes[idx];
        const value = input.slice(n, i);
        if (opts.tokens) {
          if (idx === 0 && start !== 0) {
            tokens[idx].isPrefix = true;
            tokens[idx].value = prefix;
          } else {
            tokens[idx].value = value;
          }
          depth(tokens[idx]);
          state.maxDepth += tokens[idx].depth;
        }
        if (idx !== 0 || value !== "") {
          parts.push(value);
        }
        prevIndex = i;
      }

      if (prevIndex && prevIndex + 1 < input.length) {
        const value = input.slice(prevIndex + 1);
        parts.push(value);

        if (opts.tokens) {
          tokens[tokens.length - 1].value = value;
          depth(tokens[tokens.length - 1]);
          state.maxDepth += tokens[tokens.length - 1].depth;
        }
      }

      state.slashes = slashes;
      state.parts = parts;
    }

    return state;
  };

  scan_1 = scan;
  return scan_1;
}

var parse_1;
var hasRequiredParse;

function requireParse() {
  if (hasRequiredParse) return parse_1;
  hasRequiredParse = 1;

  const constants = requireConstants$1();
  const utils = requireUtils$2();

  /**
   * Constants
   */

  const {
    MAX_LENGTH,
    POSIX_REGEX_SOURCE,
    REGEX_NON_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_BACKREF,
    REPLACEMENTS,
  } = constants;

  /**
   * Helpers
   */

  const expandRange = (args, options) => {
    if (typeof options.expandRange === "function") {
      return options.expandRange(...args, options);
    }

    args.sort();
    const value = `[${args.join("-")}]`;

    try {
      /* eslint-disable-next-line no-new */
      new RegExp(value);
    } catch (ex) {
      return args.map((v) => utils.escapeRegex(v)).join("..");
    }

    return value;
  };

  /**
   * Create the message for a syntax error
   */

  const syntaxError = (type, char) => {
    return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
  };

  /**
   * Parse the given input string.
   * @param {String} input
   * @param {Object} options
   * @return {Object}
   */

  const parse = (input, options) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected a string");
    }

    input = REPLACEMENTS[input] || input;

    const opts = { ...options };
    const max =
      typeof opts.maxLength === "number"
        ? Math.min(MAX_LENGTH, opts.maxLength)
        : MAX_LENGTH;

    let len = input.length;
    if (len > max) {
      throw new SyntaxError(
        `Input length: ${len}, exceeds maximum allowed length: ${max}`,
      );
    }

    const bos = { type: "bos", value: "", output: opts.prepend || "" };
    const tokens = [bos];

    const capture = opts.capture ? "" : "?:";
    const win32 = utils.isWindows(options);

    // create constants based on platform, for windows or posix
    const PLATFORM_CHARS = constants.globChars(win32);
    const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);

    const {
      DOT_LITERAL,
      PLUS_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR,
    } = PLATFORM_CHARS;

    const globstar = (opts) => {
      return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };

    const nodot = opts.dot ? "" : NO_DOT;
    const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
    let star = opts.bash === true ? globstar(opts) : STAR;

    if (opts.capture) {
      star = `(${star})`;
    }

    // minimatch options support
    if (typeof opts.noext === "boolean") {
      opts.noextglob = opts.noext;
    }

    const state = {
      input,
      index: -1,
      start: 0,
      dot: opts.dot === true,
      consumed: "",
      output: "",
      prefix: "",
      backtrack: false,
      negated: false,
      brackets: 0,
      braces: 0,
      parens: 0,
      quotes: 0,
      globstar: false,
      tokens,
    };

    input = utils.removePrefix(input, state);
    len = input.length;

    const extglobs = [];
    const braces = [];
    const stack = [];
    let prev = bos;
    let value;

    /**
     * Tokenizing helpers
     */

    const eos = () => state.index === len - 1;
    const peek = (state.peek = (n = 1) => input[state.index + n]);
    const advance = (state.advance = () => input[++state.index] || "");
    const remaining = () => input.slice(state.index + 1);
    const consume = (value = "", num = 0) => {
      state.consumed += value;
      state.index += num;
    };

    const append = (token) => {
      state.output += token.output != null ? token.output : token.value;
      consume(token.value);
    };

    const negate = () => {
      let count = 1;

      while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
        advance();
        state.start++;
        count++;
      }

      if (count % 2 === 0) {
        return false;
      }

      state.negated = true;
      state.start++;
      return true;
    };

    const increment = (type) => {
      state[type]++;
      stack.push(type);
    };

    const decrement = (type) => {
      state[type]--;
      stack.pop();
    };

    /**
     * Push tokens onto the tokens array. This helper speeds up
     * tokenizing by 1) helping us avoid backtracking as much as possible,
     * and 2) helping us avoid creating extra tokens when consecutive
     * characters are plain text. This improves performance and simplifies
     * lookbehinds.
     */

    const push = (tok) => {
      if (prev.type === "globstar") {
        const isBrace =
          state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
        const isExtglob =
          tok.extglob === true ||
          (extglobs.length && (tok.type === "pipe" || tok.type === "paren"));

        if (
          tok.type !== "slash" &&
          tok.type !== "paren" &&
          !isBrace &&
          !isExtglob
        ) {
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "star";
          prev.value = "*";
          prev.output = star;
          state.output += prev.output;
        }
      }

      if (extglobs.length && tok.type !== "paren") {
        extglobs[extglobs.length - 1].inner += tok.value;
      }

      if (tok.value || tok.output) append(tok);
      if (prev && prev.type === "text" && tok.type === "text") {
        prev.value += tok.value;
        prev.output = (prev.output || "") + tok.value;
        return;
      }

      tok.prev = prev;
      tokens.push(tok);
      prev = tok;
    };

    const extglobOpen = (type, value) => {
      const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: "" };

      token.prev = prev;
      token.parens = state.parens;
      token.output = state.output;
      const output = (opts.capture ? "(" : "") + token.open;

      increment("parens");
      push({ type, value, output: state.output ? "" : ONE_CHAR });
      push({ type: "paren", extglob: true, value: advance(), output });
      extglobs.push(token);
    };

    const extglobClose = (token) => {
      let output = token.close + (opts.capture ? ")" : "");
      let rest;

      if (token.type === "negate") {
        let extglobStar = star;

        if (
          token.inner &&
          token.inner.length > 1 &&
          token.inner.includes("/")
        ) {
          extglobStar = globstar(opts);
        }

        if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
          output = token.close = `)$))${extglobStar}`;
        }

        if (
          token.inner.includes("*") &&
          (rest = remaining()) &&
          /^\.[^\\/.]+$/.test(rest)
        ) {
          // Any non-magical string (`.ts`) or even nested expression (`.{ts,tsx}`) can follow after the closing parenthesis.
          // In this case, we need to parse the string and use it in the output of the original pattern.
          // Suitable patterns: `/!(*.d).ts`, `/!(*.d).{ts,tsx}`, `**/!(*-dbg).@(js)`.
          //
          // Disabling the `fastpaths` option due to a problem with parsing strings as `.ts` in the pattern like `**/!(*.d).ts`.
          const expression = parse(rest, {
            ...options,
            fastpaths: false,
          }).output;

          output = token.close = `)${expression})${extglobStar})`;
        }

        if (token.prev.type === "bos") {
          state.negatedExtglob = true;
        }
      }

      push({ type: "paren", extglob: true, value, output });
      decrement("parens");
    };

    /**
     * Fast paths
     */

    if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
      let backslashes = false;

      let output = input.replace(
        REGEX_SPECIAL_CHARS_BACKREF,
        (m, esc, chars, first, rest, index) => {
          if (first === "\\") {
            backslashes = true;
            return m;
          }

          if (first === "?") {
            if (esc) {
              return esc + first + (rest ? QMARK.repeat(rest.length) : "");
            }
            if (index === 0) {
              return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            }
            return QMARK.repeat(chars.length);
          }

          if (first === ".") {
            return DOT_LITERAL.repeat(chars.length);
          }

          if (first === "*") {
            if (esc) {
              return esc + first + (rest ? star : "");
            }
            return star;
          }
          return esc ? m : `\\${m}`;
        },
      );

      if (backslashes === true) {
        if (opts.unescape === true) {
          output = output.replace(/\\/g, "");
        } else {
          output = output.replace(/\\+/g, (m) => {
            return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
          });
        }
      }

      if (output === input && opts.contains === true) {
        state.output = input;
        return state;
      }

      state.output = utils.wrapOutput(output, state, options);
      return state;
    }

    /**
     * Tokenize input until we reach end-of-string
     */

    while (!eos()) {
      value = advance();

      if (value === "\u0000") {
        continue;
      }

      /**
       * Escaped characters
       */

      if (value === "\\") {
        const next = peek();

        if (next === "/" && opts.bash !== true) {
          continue;
        }

        if (next === "." || next === ";") {
          continue;
        }

        if (!next) {
          value += "\\";
          push({ type: "text", value });
          continue;
        }

        // collapse slashes to reduce potential for exploits
        const match = /^\\+/.exec(remaining());
        let slashes = 0;

        if (match && match[0].length > 2) {
          slashes = match[0].length;
          state.index += slashes;
          if (slashes % 2 !== 0) {
            value += "\\";
          }
        }

        if (opts.unescape === true) {
          value = advance();
        } else {
          value += advance();
        }

        if (state.brackets === 0) {
          push({ type: "text", value });
          continue;
        }
      }

      /**
       * If we're inside a regex character class, continue
       * until we reach the closing bracket.
       */

      if (
        state.brackets > 0 &&
        (value !== "]" || prev.value === "[" || prev.value === "[^")
      ) {
        if (opts.posix !== false && value === ":") {
          const inner = prev.value.slice(1);
          if (inner.includes("[")) {
            prev.posix = true;

            if (inner.includes(":")) {
              const idx = prev.value.lastIndexOf("[");
              const pre = prev.value.slice(0, idx);
              const rest = prev.value.slice(idx + 2);
              const posix = POSIX_REGEX_SOURCE[rest];
              if (posix) {
                prev.value = pre + posix;
                state.backtrack = true;
                advance();

                if (!bos.output && tokens.indexOf(prev) === 1) {
                  bos.output = ONE_CHAR;
                }
                continue;
              }
            }
          }
        }

        if (
          (value === "[" && peek() !== ":") ||
          (value === "-" && peek() === "]")
        ) {
          value = `\\${value}`;
        }

        if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
          value = `\\${value}`;
        }

        if (opts.posix === true && value === "!" && prev.value === "[") {
          value = "^";
        }

        prev.value += value;
        append({ value });
        continue;
      }

      /**
       * If we're inside a quoted string, continue
       * until we reach the closing double quote.
       */

      if (state.quotes === 1 && value !== '"') {
        value = utils.escapeRegex(value);
        prev.value += value;
        append({ value });
        continue;
      }

      /**
       * Double quotes
       */

      if (value === '"') {
        state.quotes = state.quotes === 1 ? 0 : 1;
        if (opts.keepQuotes === true) {
          push({ type: "text", value });
        }
        continue;
      }

      /**
       * Parentheses
       */

      if (value === "(") {
        increment("parens");
        push({ type: "paren", value });
        continue;
      }

      if (value === ")") {
        if (state.parens === 0 && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError("opening", "("));
        }

        const extglob = extglobs[extglobs.length - 1];
        if (extglob && state.parens === extglob.parens + 1) {
          extglobClose(extglobs.pop());
          continue;
        }

        push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
        decrement("parens");
        continue;
      }

      /**
       * Square brackets
       */

      if (value === "[") {
        if (opts.nobracket === true || !remaining().includes("]")) {
          if (opts.nobracket !== true && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("closing", "]"));
          }

          value = `\\${value}`;
        } else {
          increment("brackets");
        }

        push({ type: "bracket", value });
        continue;
      }

      if (value === "]") {
        if (
          opts.nobracket === true ||
          (prev && prev.type === "bracket" && prev.value.length === 1)
        ) {
          push({ type: "text", value, output: `\\${value}` });
          continue;
        }

        if (state.brackets === 0) {
          if (opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "["));
          }

          push({ type: "text", value, output: `\\${value}` });
          continue;
        }

        decrement("brackets");

        const prevValue = prev.value.slice(1);
        if (
          prev.posix !== true &&
          prevValue[0] === "^" &&
          !prevValue.includes("/")
        ) {
          value = `/${value}`;
        }

        prev.value += value;
        append({ value });

        // when literal brackets are explicitly disabled
        // assume we should match with a regex character class
        if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
          continue;
        }

        const escaped = utils.escapeRegex(prev.value);
        state.output = state.output.slice(0, -prev.value.length);

        // when literal brackets are explicitly enabled
        // assume we should escape the brackets to match literal characters
        if (opts.literalBrackets === true) {
          state.output += escaped;
          prev.value = escaped;
          continue;
        }

        // when the user specifies nothing, try to match both
        prev.value = `(${capture}${escaped}|${prev.value})`;
        state.output += prev.value;
        continue;
      }

      /**
       * Braces
       */

      if (value === "{" && opts.nobrace !== true) {
        increment("braces");

        const open = {
          type: "brace",
          value,
          output: "(",
          outputIndex: state.output.length,
          tokensIndex: state.tokens.length,
        };

        braces.push(open);
        push(open);
        continue;
      }

      if (value === "}") {
        const brace = braces[braces.length - 1];

        if (opts.nobrace === true || !brace) {
          push({ type: "text", value, output: value });
          continue;
        }

        let output = ")";

        if (brace.dots === true) {
          const arr = tokens.slice();
          const range = [];

          for (let i = arr.length - 1; i >= 0; i--) {
            tokens.pop();
            if (arr[i].type === "brace") {
              break;
            }
            if (arr[i].type !== "dots") {
              range.unshift(arr[i].value);
            }
          }

          output = expandRange(range, opts);
          state.backtrack = true;
        }

        if (brace.comma !== true && brace.dots !== true) {
          const out = state.output.slice(0, brace.outputIndex);
          const toks = state.tokens.slice(brace.tokensIndex);
          brace.value = brace.output = "\\{";
          value = output = "\\}";
          state.output = out;
          for (const t of toks) {
            state.output += t.output || t.value;
          }
        }

        push({ type: "brace", value, output });
        decrement("braces");
        braces.pop();
        continue;
      }

      /**
       * Pipes
       */

      if (value === "|") {
        if (extglobs.length > 0) {
          extglobs[extglobs.length - 1].conditions++;
        }
        push({ type: "text", value });
        continue;
      }

      /**
       * Commas
       */

      if (value === ",") {
        let output = value;

        const brace = braces[braces.length - 1];
        if (brace && stack[stack.length - 1] === "braces") {
          brace.comma = true;
          output = "|";
        }

        push({ type: "comma", value, output });
        continue;
      }

      /**
       * Slashes
       */

      if (value === "/") {
        // if the beginning of the glob is "./", advance the start
        // to the current index, and don't add the "./" characters
        // to the state. This greatly simplifies lookbehinds when
        // checking for BOS characters like "!" and "." (not "./")
        if (prev.type === "dot" && state.index === state.start + 1) {
          state.start = state.index + 1;
          state.consumed = "";
          state.output = "";
          tokens.pop();
          prev = bos; // reset "prev" to the first token
          continue;
        }

        push({ type: "slash", value, output: SLASH_LITERAL });
        continue;
      }

      /**
       * Dots
       */

      if (value === ".") {
        if (state.braces > 0 && prev.type === "dot") {
          if (prev.value === ".") prev.output = DOT_LITERAL;
          const brace = braces[braces.length - 1];
          prev.type = "dots";
          prev.output += value;
          prev.value += value;
          brace.dots = true;
          continue;
        }

        if (
          state.braces + state.parens === 0 &&
          prev.type !== "bos" &&
          prev.type !== "slash"
        ) {
          push({ type: "text", value, output: DOT_LITERAL });
          continue;
        }

        push({ type: "dot", value, output: DOT_LITERAL });
        continue;
      }

      /**
       * Question marks
       */

      if (value === "?") {
        const isGroup = prev && prev.value === "(";
        if (
          !isGroup &&
          opts.noextglob !== true &&
          peek() === "(" &&
          peek(2) !== "?"
        ) {
          extglobOpen("qmark", value);
          continue;
        }

        if (prev && prev.type === "paren") {
          const next = peek();
          let output = value;

          if (next === "<" && !utils.supportsLookbehinds()) {
            throw new Error(
              "Node.js v10 or higher is required for regex lookbehinds",
            );
          }

          if (
            (prev.value === "(" && !/[!=<:]/.test(next)) ||
            (next === "<" && !/<([!=]|\w+>)/.test(remaining()))
          ) {
            output = `\\${value}`;
          }

          push({ type: "text", value, output });
          continue;
        }

        if (
          opts.dot !== true &&
          (prev.type === "slash" || prev.type === "bos")
        ) {
          push({ type: "qmark", value, output: QMARK_NO_DOT });
          continue;
        }

        push({ type: "qmark", value, output: QMARK });
        continue;
      }

      /**
       * Exclamation
       */

      if (value === "!") {
        if (opts.noextglob !== true && peek() === "(") {
          if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
            extglobOpen("negate", value);
            continue;
          }
        }

        if (opts.nonegate !== true && state.index === 0) {
          negate();
          continue;
        }
      }

      /**
       * Plus
       */

      if (value === "+") {
        if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          extglobOpen("plus", value);
          continue;
        }

        if ((prev && prev.value === "(") || opts.regex === false) {
          push({ type: "plus", value, output: PLUS_LITERAL });
          continue;
        }

        if (
          (prev &&
            (prev.type === "bracket" ||
              prev.type === "paren" ||
              prev.type === "brace")) ||
          state.parens > 0
        ) {
          push({ type: "plus", value });
          continue;
        }

        push({ type: "plus", value: PLUS_LITERAL });
        continue;
      }

      /**
       * Plain text
       */

      if (value === "@") {
        if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          push({ type: "at", extglob: true, value, output: "" });
          continue;
        }

        push({ type: "text", value });
        continue;
      }

      /**
       * Plain text
       */

      if (value !== "*") {
        if (value === "$" || value === "^") {
          value = `\\${value}`;
        }

        const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
        if (match) {
          value += match[0];
          state.index += match[0].length;
        }

        push({ type: "text", value });
        continue;
      }

      /**
       * Stars
       */

      if (prev && (prev.type === "globstar" || prev.star === true)) {
        prev.type = "star";
        prev.star = true;
        prev.value += value;
        prev.output = star;
        state.backtrack = true;
        state.globstar = true;
        consume(value);
        continue;
      }

      let rest = remaining();
      if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
        extglobOpen("star", value);
        continue;
      }

      if (prev.type === "star") {
        if (opts.noglobstar === true) {
          consume(value);
          continue;
        }

        const prior = prev.prev;
        const before = prior.prev;
        const isStart = prior.type === "slash" || prior.type === "bos";
        const afterStar =
          before && (before.type === "star" || before.type === "globstar");

        if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== "/"))) {
          push({ type: "star", value, output: "" });
          continue;
        }

        const isBrace =
          state.braces > 0 &&
          (prior.type === "comma" || prior.type === "brace");
        const isExtglob =
          extglobs.length && (prior.type === "pipe" || prior.type === "paren");
        if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
          push({ type: "star", value, output: "" });
          continue;
        }

        // strip consecutive `/**/`
        while (rest.slice(0, 3) === "/**") {
          const after = input[state.index + 4];
          if (after && after !== "/") {
            break;
          }
          rest = rest.slice(3);
          consume("/**", 3);
        }

        if (prior.type === "bos" && eos()) {
          prev.type = "globstar";
          prev.value += value;
          prev.output = globstar(opts);
          state.output = prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }

        if (
          prior.type === "slash" &&
          prior.prev.type !== "bos" &&
          !afterStar &&
          eos()
        ) {
          state.output = state.output.slice(
            0,
            -(prior.output + prev.output).length,
          );
          prior.output = `(?:${prior.output}`;

          prev.type = "globstar";
          prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
          prev.value += value;
          state.globstar = true;
          state.output += prior.output + prev.output;
          consume(value);
          continue;
        }

        if (
          prior.type === "slash" &&
          prior.prev.type !== "bos" &&
          rest[0] === "/"
        ) {
          const end = rest[1] !== undefined ? "|$" : "";

          state.output = state.output.slice(
            0,
            -(prior.output + prev.output).length,
          );
          prior.output = `(?:${prior.output}`;

          prev.type = "globstar";
          prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
          prev.value += value;

          state.output += prior.output + prev.output;
          state.globstar = true;

          consume(value + advance());

          push({ type: "slash", value: "/", output: "" });
          continue;
        }

        if (prior.type === "bos" && rest[0] === "/") {
          prev.type = "globstar";
          prev.value += value;
          prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
          state.output = prev.output;
          state.globstar = true;
          consume(value + advance());
          push({ type: "slash", value: "/", output: "" });
          continue;
        }

        // remove single star from output
        state.output = state.output.slice(0, -prev.output.length);

        // reset previous token to globstar
        prev.type = "globstar";
        prev.output = globstar(opts);
        prev.value += value;

        // reset output with globstar
        state.output += prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      const token = { type: "star", value, output: star };

      if (opts.bash === true) {
        token.output = ".*?";
        if (prev.type === "bos" || prev.type === "slash") {
          token.output = nodot + token.output;
        }
        push(token);
        continue;
      }

      if (
        prev &&
        (prev.type === "bracket" || prev.type === "paren") &&
        opts.regex === true
      ) {
        token.output = value;
        push(token);
        continue;
      }

      if (
        state.index === state.start ||
        prev.type === "slash" ||
        prev.type === "dot"
      ) {
        if (prev.type === "dot") {
          state.output += NO_DOT_SLASH;
          prev.output += NO_DOT_SLASH;
        } else if (opts.dot === true) {
          state.output += NO_DOTS_SLASH;
          prev.output += NO_DOTS_SLASH;
        } else {
          state.output += nodot;
          prev.output += nodot;
        }

        if (peek() !== "*") {
          state.output += ONE_CHAR;
          prev.output += ONE_CHAR;
        }
      }

      push(token);
    }

    while (state.brackets > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", "]"));
      state.output = utils.escapeLast(state.output, "[");
      decrement("brackets");
    }

    while (state.parens > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", ")"));
      state.output = utils.escapeLast(state.output, "(");
      decrement("parens");
    }

    while (state.braces > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", "}"));
      state.output = utils.escapeLast(state.output, "{");
      decrement("braces");
    }

    if (
      opts.strictSlashes !== true &&
      (prev.type === "star" || prev.type === "bracket")
    ) {
      push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
    }

    // rebuild the output if we had to backtrack at any point
    if (state.backtrack === true) {
      state.output = "";

      for (const token of state.tokens) {
        state.output += token.output != null ? token.output : token.value;

        if (token.suffix) {
          state.output += token.suffix;
        }
      }
    }

    return state;
  };

  /**
   * Fast paths for creating regular expressions for common glob patterns.
   * This can significantly speed up processing and has very little downside
   * impact when none of the fast paths match.
   */

  parse.fastpaths = (input, options) => {
    const opts = { ...options };
    const max =
      typeof opts.maxLength === "number"
        ? Math.min(MAX_LENGTH, opts.maxLength)
        : MAX_LENGTH;
    const len = input.length;
    if (len > max) {
      throw new SyntaxError(
        `Input length: ${len}, exceeds maximum allowed length: ${max}`,
      );
    }

    input = REPLACEMENTS[input] || input;
    const win32 = utils.isWindows(options);

    // create constants based on platform, for windows or posix
    const {
      DOT_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOTS_SLASH,
      STAR,
      START_ANCHOR,
    } = constants.globChars(win32);

    const nodot = opts.dot ? NO_DOTS : NO_DOT;
    const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
    const capture = opts.capture ? "" : "?:";
    const state = { negated: false, prefix: "" };
    let star = opts.bash === true ? ".*?" : STAR;

    if (opts.capture) {
      star = `(${star})`;
    }

    const globstar = (opts) => {
      if (opts.noglobstar === true) return star;
      return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };

    const create = (str) => {
      switch (str) {
        case "*":
          return `${nodot}${ONE_CHAR}${star}`;

        case ".*":
          return `${DOT_LITERAL}${ONE_CHAR}${star}`;

        case "*.*":
          return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

        case "*/*":
          return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

        case "**":
          return nodot + globstar(opts);

        case "**/*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

        case "**/*.*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

        case "**/.*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

        default: {
          const match = /^(.*?)\.(\w+)$/.exec(str);
          if (!match) return;

          const source = create(match[1]);
          if (!source) return;

          return source + DOT_LITERAL + match[2];
        }
      }
    };

    const output = utils.removePrefix(input, state);
    let source = create(output);

    if (source && opts.strictSlashes !== true) {
      source += `${SLASH_LITERAL}?`;
    }

    return source;
  };

  parse_1 = parse;
  return parse_1;
}

var picomatch_1;
var hasRequiredPicomatch$1;

function requirePicomatch$1() {
  if (hasRequiredPicomatch$1) return picomatch_1;
  hasRequiredPicomatch$1 = 1;

  const path = require$$0$1;
  const scan = requireScan();
  const parse = requireParse();
  const utils = requireUtils$2();
  const constants = requireConstants$1();
  const isObject = (val) =>
    val && typeof val === "object" && !Array.isArray(val);

  /**
   * Creates a matcher function from one or more glob patterns. The
   * returned function takes a string to match as its first argument,
   * and returns true if the string is a match. The returned matcher
   * function also takes a boolean as the second argument that, when true,
   * returns an object with additional information.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch(glob[, options]);
   *
   * const isMatch = picomatch('*.!(*a)');
   * console.log(isMatch('a.a')); //=> false
   * console.log(isMatch('a.b')); //=> true
   * ```
   * @name picomatch
   * @param {String|Array} `globs` One or more glob patterns.
   * @param {Object=} `options`
   * @return {Function=} Returns a matcher function.
   * @api public
   */

  const picomatch = (glob, options, returnState = false) => {
    if (Array.isArray(glob)) {
      const fns = glob.map((input) => picomatch(input, options, returnState));
      const arrayMatcher = (str) => {
        for (const isMatch of fns) {
          const state = isMatch(str);
          if (state) return state;
        }
        return false;
      };
      return arrayMatcher;
    }

    const isState = isObject(glob) && glob.tokens && glob.input;

    if (glob === "" || (typeof glob !== "string" && !isState)) {
      throw new TypeError("Expected pattern to be a non-empty string");
    }

    const opts = options || {};
    const posix = utils.isWindows(options);
    const regex = isState
      ? picomatch.compileRe(glob, options)
      : picomatch.makeRe(glob, options, false, true);

    const state = regex.state;
    delete regex.state;

    let isIgnored = () => false;
    if (opts.ignore) {
      const ignoreOpts = {
        ...options,
        ignore: null,
        onMatch: null,
        onResult: null,
      };
      isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
    }

    const matcher = (input, returnObject = false) => {
      const { isMatch, match, output } = picomatch.test(input, regex, options, {
        glob,
        posix,
      });
      const result = {
        glob,
        state,
        regex,
        posix,
        input,
        output,
        match,
        isMatch,
      };

      if (typeof opts.onResult === "function") {
        opts.onResult(result);
      }

      if (isMatch === false) {
        result.isMatch = false;
        return returnObject ? result : false;
      }

      if (isIgnored(input)) {
        if (typeof opts.onIgnore === "function") {
          opts.onIgnore(result);
        }
        result.isMatch = false;
        return returnObject ? result : false;
      }

      if (typeof opts.onMatch === "function") {
        opts.onMatch(result);
      }
      return returnObject ? result : true;
    };

    if (returnState) {
      matcher.state = state;
    }

    return matcher;
  };

  /**
   * Test `input` with the given `regex`. This is used by the main
   * `picomatch()` function to test the input string.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.test(input, regex[, options]);
   *
   * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
   * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
   * ```
   * @param {String} `input` String to test.
   * @param {RegExp} `regex`
   * @return {Object} Returns an object with matching info.
   * @api public
   */

  picomatch.test = (input, regex, options, { glob, posix } = {}) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected input to be a string");
    }

    if (input === "") {
      return { isMatch: false, output: "" };
    }

    const opts = options || {};
    const format = opts.format || (posix ? utils.toPosixSlashes : null);
    let match = input === glob;
    let output = match && format ? format(input) : input;

    if (match === false) {
      output = format ? format(input) : input;
      match = output === glob;
    }

    if (match === false || opts.capture === true) {
      if (opts.matchBase === true || opts.basename === true) {
        match = picomatch.matchBase(input, regex, options, posix);
      } else {
        match = regex.exec(output);
      }
    }

    return { isMatch: Boolean(match), match, output };
  };

  /**
   * Match the basename of a filepath.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.matchBase(input, glob[, options]);
   * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
   * ```
   * @param {String} `input` String to test.
   * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
   * @return {Boolean}
   * @api public
   */

  picomatch.matchBase = (
    input,
    glob,
    options,
    posix = utils.isWindows(options),
  ) => {
    const regex =
      glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
    return regex.test(path.basename(input));
  };

  /**
   * Returns true if **any** of the given glob `patterns` match the specified `string`.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.isMatch(string, patterns[, options]);
   *
   * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
   * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
   * ```
   * @param {String|Array} str The string to test.
   * @param {String|Array} patterns One or more glob patterns to use for matching.
   * @param {Object} [options] See available [options](#options).
   * @return {Boolean} Returns true if any patterns match `str`
   * @api public
   */

  picomatch.isMatch = (str, patterns, options) =>
    picomatch(patterns, options)(str);

  /**
   * Parse a glob pattern to create the source string for a regular
   * expression.
   *
   * ```js
   * const picomatch = require('picomatch');
   * const result = picomatch.parse(pattern[, options]);
   * ```
   * @param {String} `pattern`
   * @param {Object} `options`
   * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
   * @api public
   */

  picomatch.parse = (pattern, options) => {
    if (Array.isArray(pattern))
      return pattern.map((p) => picomatch.parse(p, options));
    return parse(pattern, { ...options, fastpaths: false });
  };

  /**
   * Scan a glob pattern to separate the pattern into segments.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.scan(input[, options]);
   *
   * const result = picomatch.scan('!./foo/*.js');
   * console.log(result);
   * { prefix: '!./',
   *   input: '!./foo/*.js',
   *   start: 3,
   *   base: 'foo',
   *   glob: '*.js',
   *   isBrace: false,
   *   isBracket: false,
   *   isGlob: true,
   *   isExtglob: false,
   *   isGlobstar: false,
   *   negated: true }
   * ```
   * @param {String} `input` Glob pattern to scan.
   * @param {Object} `options`
   * @return {Object} Returns an object with
   * @api public
   */

  picomatch.scan = (input, options) => scan(input, options);

  /**
   * Compile a regular expression from the `state` object returned by the
   * [parse()](#parse) method.
   *
   * @param {Object} `state`
   * @param {Object} `options`
   * @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
   * @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
   * @return {RegExp}
   * @api public
   */

  picomatch.compileRe = (
    state,
    options,
    returnOutput = false,
    returnState = false,
  ) => {
    if (returnOutput === true) {
      return state.output;
    }

    const opts = options || {};
    const prepend = opts.contains ? "" : "^";
    const append = opts.contains ? "" : "$";

    let source = `${prepend}(?:${state.output})${append}`;
    if (state && state.negated === true) {
      source = `^(?!${source}).*$`;
    }

    const regex = picomatch.toRegex(source, options);
    if (returnState === true) {
      regex.state = state;
    }

    return regex;
  };

  /**
   * Create a regular expression from a parsed glob pattern.
   *
   * ```js
   * const picomatch = require('picomatch');
   * const state = picomatch.parse('*.js');
   * // picomatch.compileRe(state[, options]);
   *
   * console.log(picomatch.compileRe(state));
   * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
   * ```
   * @param {String} `state` The object returned from the `.parse` method.
   * @param {Object} `options`
   * @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
   * @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
   * @return {RegExp} Returns a regex created from the given pattern.
   * @api public
   */

  picomatch.makeRe = (
    input,
    options = {},
    returnOutput = false,
    returnState = false,
  ) => {
    if (!input || typeof input !== "string") {
      throw new TypeError("Expected a non-empty string");
    }

    let parsed = { negated: false, fastpaths: true };

    if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
      parsed.output = parse.fastpaths(input, options);
    }

    if (!parsed.output) {
      parsed = parse(input, options);
    }

    return picomatch.compileRe(parsed, options, returnOutput, returnState);
  };

  /**
   * Create a regular expression from the given regex source string.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.toRegex(source[, options]);
   *
   * const { output } = picomatch.parse('*.js');
   * console.log(picomatch.toRegex(output));
   * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
   * ```
   * @param {String} `source` Regular expression source string.
   * @param {Object} `options`
   * @return {RegExp}
   * @api public
   */

  picomatch.toRegex = (source, options) => {
    try {
      const opts = options || {};
      return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
    } catch (err) {
      if (options && options.debug === true) throw err;
      return /$^/;
    }
  };

  /**
   * Picomatch constants.
   * @return {Object}
   */

  picomatch.constants = constants;

  /**
   * Expose "picomatch"
   */

  picomatch_1 = picomatch;
  return picomatch_1;
}

var picomatch;
var hasRequiredPicomatch;

function requirePicomatch() {
  if (hasRequiredPicomatch) return picomatch;
  hasRequiredPicomatch = 1;

  picomatch = requirePicomatch$1();
  return picomatch;
}

var micromatch_1;
var hasRequiredMicromatch;

function requireMicromatch() {
  if (hasRequiredMicromatch) return micromatch_1;
  hasRequiredMicromatch = 1;

  const util = require$$0$2;
  const braces = requireBraces();
  const picomatch = requirePicomatch();
  const utils = requireUtils$2();

  const isEmptyString = (v) => v === "" || v === "./";
  const hasBraces = (v) => {
    const index = v.indexOf("{");
    return index > -1 && v.indexOf("}", index) > -1;
  };

  /**
   * Returns an array of strings that match one or more glob patterns.
   *
   * ```js
   * const mm = require('micromatch');
   * // mm(list, patterns[, options]);
   *
   * console.log(mm(['a.js', 'a.txt'], ['*.js']));
   * //=> [ 'a.js' ]
   * ```
   * @param {String|Array<string>} `list` List of strings to match.
   * @param {String|Array<string>} `patterns` One or more glob patterns to use for matching.
   * @param {Object} `options` See available [options](#options)
   * @return {Array} Returns an array of matches
   * @summary false
   * @api public
   */

  const micromatch = (list, patterns, options) => {
    patterns = [].concat(patterns);
    list = [].concat(list);

    let omit = new Set();
    let keep = new Set();
    let items = new Set();
    let negatives = 0;

    let onResult = (state) => {
      items.add(state.output);
      if (options && options.onResult) {
        options.onResult(state);
      }
    };

    for (let i = 0; i < patterns.length; i++) {
      let isMatch = picomatch(
        String(patterns[i]),
        { ...options, onResult },
        true,
      );
      let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
      if (negated) negatives++;

      for (let item of list) {
        let matched = isMatch(item, true);

        let match = negated ? !matched.isMatch : matched.isMatch;
        if (!match) continue;

        if (negated) {
          omit.add(matched.output);
        } else {
          omit.delete(matched.output);
          keep.add(matched.output);
        }
      }
    }

    let result = negatives === patterns.length ? [...items] : [...keep];
    let matches = result.filter((item) => !omit.has(item));

    if (options && matches.length === 0) {
      if (options.failglob === true) {
        throw new Error(`No matches found for "${patterns.join(", ")}"`);
      }

      if (options.nonull === true || options.nullglob === true) {
        return options.unescape
          ? patterns.map((p) => p.replace(/\\/g, ""))
          : patterns;
      }
    }

    return matches;
  };

  /**
   * Backwards compatibility
   */

  micromatch.match = micromatch;

  /**
   * Returns a matcher function from the given glob `pattern` and `options`.
   * The returned function takes a string to match as its only argument and returns
   * true if the string is a match.
   *
   * ```js
   * const mm = require('micromatch');
   * // mm.matcher(pattern[, options]);
   *
   * const isMatch = mm.matcher('*.!(*a)');
   * console.log(isMatch('a.a')); //=> false
   * console.log(isMatch('a.b')); //=> true
   * ```
   * @param {String} `pattern` Glob pattern
   * @param {Object} `options`
   * @return {Function} Returns a matcher function.
   * @api public
   */

  micromatch.matcher = (pattern, options) => picomatch(pattern, options);

  /**
   * Returns true if **any** of the given glob `patterns` match the specified `string`.
   *
   * ```js
   * const mm = require('micromatch');
   * // mm.isMatch(string, patterns[, options]);
   *
   * console.log(mm.isMatch('a.a', ['b.*', '*.a'])); //=> true
   * console.log(mm.isMatch('a.a', 'b.*')); //=> false
   * ```
   * @param {String} `str` The string to test.
   * @param {String|Array} `patterns` One or more glob patterns to use for matching.
   * @param {Object} `[options]` See available [options](#options).
   * @return {Boolean} Returns true if any patterns match `str`
   * @api public
   */

  micromatch.isMatch = (str, patterns, options) =>
    picomatch(patterns, options)(str);

  /**
   * Backwards compatibility
   */

  micromatch.any = micromatch.isMatch;

  /**
   * Returns a list of strings that _**do not match any**_ of the given `patterns`.
   *
   * ```js
   * const mm = require('micromatch');
   * // mm.not(list, patterns[, options]);
   *
   * console.log(mm.not(['a.a', 'b.b', 'c.c'], '*.a'));
   * //=> ['b.b', 'c.c']
   * ```
   * @param {Array} `list` Array of strings to match.
   * @param {String|Array} `patterns` One or more glob pattern to use for matching.
   * @param {Object} `options` See available [options](#options) for changing how matches are performed
   * @return {Array} Returns an array of strings that **do not match** the given patterns.
   * @api public
   */

  micromatch.not = (list, patterns, options = {}) => {
    patterns = [].concat(patterns).map(String);
    let result = new Set();
    let items = [];

    let onResult = (state) => {
      if (options.onResult) options.onResult(state);
      items.push(state.output);
    };

    let matches = new Set(micromatch(list, patterns, { ...options, onResult }));

    for (let item of items) {
      if (!matches.has(item)) {
        result.add(item);
      }
    }
    return [...result];
  };

  /**
   * Returns true if the given `string` contains the given pattern. Similar
   * to [.isMatch](#isMatch) but the pattern can match any part of the string.
   *
   * ```js
   * var mm = require('micromatch');
   * // mm.contains(string, pattern[, options]);
   *
   * console.log(mm.contains('aa/bb/cc', '*b'));
   * //=> true
   * console.log(mm.contains('aa/bb/cc', '*d'));
   * //=> false
   * ```
   * @param {String} `str` The string to match.
   * @param {String|Array} `patterns` Glob pattern to use for matching.
   * @param {Object} `options` See available [options](#options) for changing how matches are performed
   * @return {Boolean} Returns true if any of the patterns matches any part of `str`.
   * @api public
   */

  micromatch.contains = (str, pattern, options) => {
    if (typeof str !== "string") {
      throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
    }

    if (Array.isArray(pattern)) {
      return pattern.some((p) => micromatch.contains(str, p, options));
    }

    if (typeof pattern === "string") {
      if (isEmptyString(str) || isEmptyString(pattern)) {
        return false;
      }

      if (
        str.includes(pattern) ||
        (str.startsWith("./") && str.slice(2).includes(pattern))
      ) {
        return true;
      }
    }

    return micromatch.isMatch(str, pattern, { ...options, contains: true });
  };

  /**
   * Filter the keys of the given object with the given `glob` pattern
   * and `options`. Does not attempt to match nested keys. If you need this feature,
   * use [glob-object][] instead.
   *
   * ```js
   * const mm = require('micromatch');
   * // mm.matchKeys(object, patterns[, options]);
   *
   * const obj = { aa: 'a', ab: 'b', ac: 'c' };
   * console.log(mm.matchKeys(obj, '*b'));
   * //=> { ab: 'b' }
   * ```
   * @param {Object} `object` The object with keys to filter.
   * @param {String|Array} `patterns` One or more glob patterns to use for matching.
   * @param {Object} `options` See available [options](#options) for changing how matches are performed
   * @return {Object} Returns an object with only keys that match the given patterns.
   * @api public
   */

  micromatch.matchKeys = (obj, patterns, options) => {
    if (!utils.isObject(obj)) {
      throw new TypeError("Expected the first argument to be an object");
    }
    let keys = micromatch(Object.keys(obj), patterns, options);
    let res = {};
    for (let key of keys) res[key] = obj[key];
    return res;
  };

  /**
   * Returns true if some of the strings in the given `list` match any of the given glob `patterns`.
   *
   * ```js
   * const mm = require('micromatch');
   * // mm.some(list, patterns[, options]);
   *
   * console.log(mm.some(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
   * // true
   * console.log(mm.some(['foo.js'], ['*.js', '!foo.js']));
   * // false
   * ```
   * @param {String|Array} `list` The string or array of strings to test. Returns as soon as the first match is found.
   * @param {String|Array} `patterns` One or more glob patterns to use for matching.
   * @param {Object} `options` See available [options](#options) for changing how matches are performed
   * @return {Boolean} Returns true if any `patterns` matches any of the strings in `list`
   * @api public
   */

  micromatch.some = (list, patterns, options) => {
    let items = [].concat(list);

    for (let pattern of [].concat(patterns)) {
      let isMatch = picomatch(String(pattern), options);
      if (items.some((item) => isMatch(item))) {
        return true;
      }
    }
    return false;
  };

  /**
   * Returns true if every string in the given `list` matches
   * any of the given glob `patterns`.
   *
   * ```js
   * const mm = require('micromatch');
   * // mm.every(list, patterns[, options]);
   *
   * console.log(mm.every('foo.js', ['foo.js']));
   * // true
   * console.log(mm.every(['foo.js', 'bar.js'], ['*.js']));
   * // true
   * console.log(mm.every(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
   * // false
   * console.log(mm.every(['foo.js'], ['*.js', '!foo.js']));
   * // false
   * ```
   * @param {String|Array} `list` The string or array of strings to test.
   * @param {String|Array} `patterns` One or more glob patterns to use for matching.
   * @param {Object} `options` See available [options](#options) for changing how matches are performed
   * @return {Boolean} Returns true if all `patterns` matches all of the strings in `list`
   * @api public
   */

  micromatch.every = (list, patterns, options) => {
    let items = [].concat(list);

    for (let pattern of [].concat(patterns)) {
      let isMatch = picomatch(String(pattern), options);
      if (!items.every((item) => isMatch(item))) {
        return false;
      }
    }
    return true;
  };

  /**
   * Returns true if **all** of the given `patterns` match
   * the specified string.
   *
   * ```js
   * const mm = require('micromatch');
   * // mm.all(string, patterns[, options]);
   *
   * console.log(mm.all('foo.js', ['foo.js']));
   * // true
   *
   * console.log(mm.all('foo.js', ['*.js', '!foo.js']));
   * // false
   *
   * console.log(mm.all('foo.js', ['*.js', 'foo.js']));
   * // true
   *
   * console.log(mm.all('foo.js', ['*.js', 'f*', '*o*', '*o.js']));
   * // true
   * ```
   * @param {String|Array} `str` The string to test.
   * @param {String|Array} `patterns` One or more glob patterns to use for matching.
   * @param {Object} `options` See available [options](#options) for changing how matches are performed
   * @return {Boolean} Returns true if any patterns match `str`
   * @api public
   */

  micromatch.all = (str, patterns, options) => {
    if (typeof str !== "string") {
      throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
    }

    return [].concat(patterns).every((p) => picomatch(p, options)(str));
  };

  /**
   * Returns an array of matches captured by `pattern` in `string, or `null` if the pattern did not match.
   *
   * ```js
   * const mm = require('micromatch');
   * // mm.capture(pattern, string[, options]);
   *
   * console.log(mm.capture('test/*.js', 'test/foo.js'));
   * //=> ['foo']
   * console.log(mm.capture('test/*.js', 'foo/bar.css'));
   * //=> null
   * ```
   * @param {String} `glob` Glob pattern to use for matching.
   * @param {String} `input` String to match
   * @param {Object} `options` See available [options](#options) for changing how matches are performed
   * @return {Array|null} Returns an array of captures if the input matches the glob pattern, otherwise `null`.
   * @api public
   */

  micromatch.capture = (glob, input, options) => {
    let posix = utils.isWindows(options);
    let regex = picomatch.makeRe(String(glob), { ...options, capture: true });
    let match = regex.exec(posix ? utils.toPosixSlashes(input) : input);

    if (match) {
      return match.slice(1).map((v) => (v === undefined ? "" : v));
    }
  };

  /**
   * Create a regular expression from the given glob `pattern`.
   *
   * ```js
   * const mm = require('micromatch');
   * // mm.makeRe(pattern[, options]);
   *
   * console.log(mm.makeRe('*.js'));
   * //=> /^(?:(\.[\\\/])?(?!\.)(?=.)[^\/]*?\.js)$/
   * ```
   * @param {String} `pattern` A glob pattern to convert to regex.
   * @param {Object} `options`
   * @return {RegExp} Returns a regex created from the given pattern.
   * @api public
   */

  micromatch.makeRe = (...args) => picomatch.makeRe(...args);

  /**
   * Scan a glob pattern to separate the pattern into segments. Used
   * by the [split](#split) method.
   *
   * ```js
   * const mm = require('micromatch');
   * const state = mm.scan(pattern[, options]);
   * ```
   * @param {String} `pattern`
   * @param {Object} `options`
   * @return {Object} Returns an object with
   * @api public
   */

  micromatch.scan = (...args) => picomatch.scan(...args);

  /**
   * Parse a glob pattern to create the source string for a regular
   * expression.
   *
   * ```js
   * const mm = require('micromatch');
   * const state = mm.parse(pattern[, options]);
   * ```
   * @param {String} `glob`
   * @param {Object} `options`
   * @return {Object} Returns an object with useful properties and output to be used as regex source string.
   * @api public
   */

  micromatch.parse = (patterns, options) => {
    let res = [];
    for (let pattern of [].concat(patterns || [])) {
      for (let str of braces(String(pattern), options)) {
        res.push(picomatch.parse(str, options));
      }
    }
    return res;
  };

  /**
   * Process the given brace `pattern`.
   *
   * ```js
   * const { braces } = require('micromatch');
   * console.log(braces('foo/{a,b,c}/bar'));
   * //=> [ 'foo/(a|b|c)/bar' ]
   *
   * console.log(braces('foo/{a,b,c}/bar', { expand: true }));
   * //=> [ 'foo/a/bar', 'foo/b/bar', 'foo/c/bar' ]
   * ```
   * @param {String} `pattern` String with brace pattern to process.
   * @param {Object} `options` Any [options](#options) to change how expansion is performed. See the [braces][] library for all available options.
   * @return {Array}
   * @api public
   */

  micromatch.braces = (pattern, options) => {
    if (typeof pattern !== "string") throw new TypeError("Expected a string");
    if ((options && options.nobrace === true) || !hasBraces(pattern)) {
      return [pattern];
    }
    return braces(pattern, options);
  };

  /**
   * Expand braces
   */

  micromatch.braceExpand = (pattern, options) => {
    if (typeof pattern !== "string") throw new TypeError("Expected a string");
    return micromatch.braces(pattern, { ...options, expand: true });
  };

  /**
   * Expose micromatch
   */

  // exposed for tests
  micromatch.hasBraces = hasBraces;
  micromatch_1 = micromatch;
  return micromatch_1;
}

var hasRequiredPattern;

function requirePattern() {
  if (hasRequiredPattern) return pattern;
  hasRequiredPattern = 1;
  Object.defineProperty(pattern, "__esModule", { value: true });
  pattern.isAbsolute =
    pattern.partitionAbsoluteAndRelative =
    pattern.removeDuplicateSlashes =
    pattern.matchAny =
    pattern.convertPatternsToRe =
    pattern.makeRe =
    pattern.getPatternParts =
    pattern.expandBraceExpansion =
    pattern.expandPatternsWithBraceExpansion =
    pattern.isAffectDepthOfReadingPattern =
    pattern.endsWithSlashGlobStar =
    pattern.hasGlobStar =
    pattern.getBaseDirectory =
    pattern.isPatternRelatedToParentDirectory =
    pattern.getPatternsOutsideCurrentDirectory =
    pattern.getPatternsInsideCurrentDirectory =
    pattern.getPositivePatterns =
    pattern.getNegativePatterns =
    pattern.isPositivePattern =
    pattern.isNegativePattern =
    pattern.convertToNegativePattern =
    pattern.convertToPositivePattern =
    pattern.isDynamicPattern =
    pattern.isStaticPattern =
      undefined;
  const path = require$$0$1;
  const globParent = requireGlobParent();
  const micromatch = requireMicromatch();
  const GLOBSTAR = "**";
  const ESCAPE_SYMBOL = "\\";
  const COMMON_GLOB_SYMBOLS_RE = /[*?]|^!/;
  const REGEX_CHARACTER_CLASS_SYMBOLS_RE = /\[[^[]*]/;
  const REGEX_GROUP_SYMBOLS_RE = /(?:^|[^!*+?@])\([^(]*\|[^|]*\)/;
  const GLOB_EXTENSION_SYMBOLS_RE = /[!*+?@]\([^(]*\)/;
  const BRACE_EXPANSION_SEPARATORS_RE = /,|\.\./;
  /**
   * Matches a sequence of two or more consecutive slashes, excluding the first two slashes at the beginning of the string.
   * The latter is due to the presence of the device path at the beginning of the UNC path.
   */
  const DOUBLE_SLASH_RE = /(?!^)\/{2,}/g;
  function isStaticPattern(pattern, options = {}) {
    return !isDynamicPattern(pattern, options);
  }
  pattern.isStaticPattern = isStaticPattern;
  function isDynamicPattern(pattern, options = {}) {
    /**
     * A special case with an empty string is necessary for matching patterns that start with a forward slash.
     * An empty string cannot be a dynamic pattern.
     * For example, the pattern `/lib/*` will be spread into parts: '', 'lib', '*'.
     */
    if (pattern === "") {
      return false;
    }
    /**
     * When the `caseSensitiveMatch` option is disabled, all patterns must be marked as dynamic, because we cannot check
     * filepath directly (without read directory).
     */
    if (
      options.caseSensitiveMatch === false ||
      pattern.includes(ESCAPE_SYMBOL)
    ) {
      return true;
    }
    if (
      COMMON_GLOB_SYMBOLS_RE.test(pattern) ||
      REGEX_CHARACTER_CLASS_SYMBOLS_RE.test(pattern) ||
      REGEX_GROUP_SYMBOLS_RE.test(pattern)
    ) {
      return true;
    }
    if (options.extglob !== false && GLOB_EXTENSION_SYMBOLS_RE.test(pattern)) {
      return true;
    }
    if (options.braceExpansion !== false && hasBraceExpansion(pattern)) {
      return true;
    }
    return false;
  }
  pattern.isDynamicPattern = isDynamicPattern;
  function hasBraceExpansion(pattern) {
    const openingBraceIndex = pattern.indexOf("{");
    if (openingBraceIndex === -1) {
      return false;
    }
    const closingBraceIndex = pattern.indexOf("}", openingBraceIndex + 1);
    if (closingBraceIndex === -1) {
      return false;
    }
    const braceContent = pattern.slice(openingBraceIndex, closingBraceIndex);
    return BRACE_EXPANSION_SEPARATORS_RE.test(braceContent);
  }
  function convertToPositivePattern(pattern) {
    return isNegativePattern(pattern) ? pattern.slice(1) : pattern;
  }
  pattern.convertToPositivePattern = convertToPositivePattern;
  function convertToNegativePattern(pattern) {
    return "!" + pattern;
  }
  pattern.convertToNegativePattern = convertToNegativePattern;
  function isNegativePattern(pattern) {
    return pattern.startsWith("!") && pattern[1] !== "(";
  }
  pattern.isNegativePattern = isNegativePattern;
  function isPositivePattern(pattern) {
    return !isNegativePattern(pattern);
  }
  pattern.isPositivePattern = isPositivePattern;
  function getNegativePatterns(patterns) {
    return patterns.filter(isNegativePattern);
  }
  pattern.getNegativePatterns = getNegativePatterns;
  function getPositivePatterns(patterns) {
    return patterns.filter(isPositivePattern);
  }
  pattern.getPositivePatterns = getPositivePatterns;
  /**
   * Returns patterns that can be applied inside the current directory.
   *
   * @example
   * // ['./*', '*', 'a/*']
   * getPatternsInsideCurrentDirectory(['./*', '*', 'a/*', '../*', './../*'])
   */
  function getPatternsInsideCurrentDirectory(patterns) {
    return patterns.filter(
      (pattern) => !isPatternRelatedToParentDirectory(pattern),
    );
  }
  pattern.getPatternsInsideCurrentDirectory = getPatternsInsideCurrentDirectory;
  /**
   * Returns patterns to be expanded relative to (outside) the current directory.
   *
   * @example
   * // ['../*', './../*']
   * getPatternsInsideCurrentDirectory(['./*', '*', 'a/*', '../*', './../*'])
   */
  function getPatternsOutsideCurrentDirectory(patterns) {
    return patterns.filter(isPatternRelatedToParentDirectory);
  }
  pattern.getPatternsOutsideCurrentDirectory =
    getPatternsOutsideCurrentDirectory;
  function isPatternRelatedToParentDirectory(pattern) {
    return pattern.startsWith("..") || pattern.startsWith("./..");
  }
  pattern.isPatternRelatedToParentDirectory = isPatternRelatedToParentDirectory;
  function getBaseDirectory(pattern) {
    return globParent(pattern, { flipBackslashes: false });
  }
  pattern.getBaseDirectory = getBaseDirectory;
  function hasGlobStar(pattern) {
    return pattern.includes(GLOBSTAR);
  }
  pattern.hasGlobStar = hasGlobStar;
  function endsWithSlashGlobStar(pattern) {
    return pattern.endsWith("/" + GLOBSTAR);
  }
  pattern.endsWithSlashGlobStar = endsWithSlashGlobStar;
  function isAffectDepthOfReadingPattern(pattern) {
    const basename = path.basename(pattern);
    return endsWithSlashGlobStar(pattern) || isStaticPattern(basename);
  }
  pattern.isAffectDepthOfReadingPattern = isAffectDepthOfReadingPattern;
  function expandPatternsWithBraceExpansion(patterns) {
    return patterns.reduce((collection, pattern) => {
      return collection.concat(expandBraceExpansion(pattern));
    }, []);
  }
  pattern.expandPatternsWithBraceExpansion = expandPatternsWithBraceExpansion;
  function expandBraceExpansion(pattern) {
    const patterns = micromatch.braces(pattern, {
      expand: true,
      nodupes: true,
      keepEscaping: true,
    });
    /**
     * Sort the patterns by length so that the same depth patterns are processed side by side.
     * `a/{b,}/{c,}/*` – `['a///*', 'a/b//*', 'a//c/*', 'a/b/c/*']`
     */
    patterns.sort((a, b) => a.length - b.length);
    /**
     * Micromatch can return an empty string in the case of patterns like `{a,}`.
     */
    return patterns.filter((pattern) => pattern !== "");
  }
  pattern.expandBraceExpansion = expandBraceExpansion;
  function getPatternParts(pattern, options) {
    let { parts } = micromatch.scan(
      pattern,
      Object.assign(Object.assign({}, options), { parts: true }),
    );
    /**
     * The scan method returns an empty array in some cases.
     * See micromatch/picomatch#58 for more details.
     */
    if (parts.length === 0) {
      parts = [pattern];
    }
    /**
     * The scan method does not return an empty part for the pattern with a forward slash.
     * This is another part of micromatch/picomatch#58.
     */
    if (parts[0].startsWith("/")) {
      parts[0] = parts[0].slice(1);
      parts.unshift("");
    }
    return parts;
  }
  pattern.getPatternParts = getPatternParts;
  function makeRe(pattern, options) {
    return micromatch.makeRe(pattern, options);
  }
  pattern.makeRe = makeRe;
  function convertPatternsToRe(patterns, options) {
    return patterns.map((pattern) => makeRe(pattern, options));
  }
  pattern.convertPatternsToRe = convertPatternsToRe;
  function matchAny(entry, patternsRe) {
    return patternsRe.some((patternRe) => patternRe.test(entry));
  }
  pattern.matchAny = matchAny;
  /**
   * This package only works with forward slashes as a path separator.
   * Because of this, we cannot use the standard `path.normalize` method, because on Windows platform it will use of backslashes.
   */
  function removeDuplicateSlashes(pattern) {
    return pattern.replace(DOUBLE_SLASH_RE, "/");
  }
  pattern.removeDuplicateSlashes = removeDuplicateSlashes;
  function partitionAbsoluteAndRelative(patterns) {
    const absolute = [];
    const relative = [];
    for (const pattern of patterns) {
      if (isAbsolute(pattern)) {
        absolute.push(pattern);
      } else {
        relative.push(pattern);
      }
    }
    return [absolute, relative];
  }
  pattern.partitionAbsoluteAndRelative = partitionAbsoluteAndRelative;
  function isAbsolute(pattern) {
    return path.isAbsolute(pattern);
  }
  pattern.isAbsolute = isAbsolute;
  return pattern;
}

var stream$3 = {};

var merge2_1;
var hasRequiredMerge2;

function requireMerge2() {
  if (hasRequiredMerge2) return merge2_1;
  hasRequiredMerge2 = 1;
  /*
   * merge2
   * https://github.com/teambition/merge2
   *
   * Copyright (c) 2014-2020 Teambition
   * Licensed under the MIT license.
   */
  const Stream = require$$0$3;
  const PassThrough = Stream.PassThrough;
  const slice = Array.prototype.slice;

  merge2_1 = merge2;

  function merge2() {
    const streamsQueue = [];
    const args = slice.call(arguments);
    let merging = false;
    let options = args[args.length - 1];

    if (options && !Array.isArray(options) && options.pipe == null) {
      args.pop();
    } else {
      options = {};
    }

    const doEnd = options.end !== false;
    const doPipeError = options.pipeError === true;
    if (options.objectMode == null) {
      options.objectMode = true;
    }
    if (options.highWaterMark == null) {
      options.highWaterMark = 64 * 1024;
    }
    const mergedStream = PassThrough(options);

    function addStream() {
      for (let i = 0, len = arguments.length; i < len; i++) {
        streamsQueue.push(pauseStreams(arguments[i], options));
      }
      mergeStream();
      return this;
    }

    function mergeStream() {
      if (merging) {
        return;
      }
      merging = true;

      let streams = streamsQueue.shift();
      if (!streams) {
        process.nextTick(endStream);
        return;
      }
      if (!Array.isArray(streams)) {
        streams = [streams];
      }

      let pipesCount = streams.length + 1;

      function next() {
        if (--pipesCount > 0) {
          return;
        }
        merging = false;
        mergeStream();
      }

      function pipe(stream) {
        function onend() {
          stream.removeListener("merge2UnpipeEnd", onend);
          stream.removeListener("end", onend);
          if (doPipeError) {
            stream.removeListener("error", onerror);
          }
          next();
        }
        function onerror(err) {
          mergedStream.emit("error", err);
        }
        // skip ended stream
        if (stream._readableState.endEmitted) {
          return next();
        }

        stream.on("merge2UnpipeEnd", onend);
        stream.on("end", onend);

        if (doPipeError) {
          stream.on("error", onerror);
        }

        stream.pipe(mergedStream, { end: false });
        // compatible for old stream
        stream.resume();
      }

      for (let i = 0; i < streams.length; i++) {
        pipe(streams[i]);
      }

      next();
    }

    function endStream() {
      merging = false;
      // emit 'queueDrain' when all streams merged.
      mergedStream.emit("queueDrain");
      if (doEnd) {
        mergedStream.end();
      }
    }

    mergedStream.setMaxListeners(0);
    mergedStream.add = addStream;
    mergedStream.on("unpipe", function (stream) {
      stream.emit("merge2UnpipeEnd");
    });

    if (args.length) {
      addStream.apply(null, args);
    }
    return mergedStream;
  }

  // check and pause streams for pipe.
  function pauseStreams(streams, options) {
    if (!Array.isArray(streams)) {
      // Backwards-compat with old-style streams
      if (!streams._readableState && streams.pipe) {
        streams = streams.pipe(PassThrough(options));
      }
      if (!streams._readableState || !streams.pause || !streams.pipe) {
        throw new Error("Only readable stream can be merged.");
      }
      streams.pause();
    } else {
      for (let i = 0, len = streams.length; i < len; i++) {
        streams[i] = pauseStreams(streams[i], options);
      }
    }
    return streams;
  }
  return merge2_1;
}

var hasRequiredStream$3;

function requireStream$3() {
  if (hasRequiredStream$3) return stream$3;
  hasRequiredStream$3 = 1;
  Object.defineProperty(stream$3, "__esModule", { value: true });
  stream$3.merge = undefined;
  const merge2 = requireMerge2();
  function merge(streams) {
    const mergedStream = merge2(streams);
    streams.forEach((stream) => {
      stream.once("error", (error) => mergedStream.emit("error", error));
    });
    mergedStream.once("close", () => propagateCloseEventToSources(streams));
    mergedStream.once("end", () => propagateCloseEventToSources(streams));
    return mergedStream;
  }
  stream$3.merge = merge;
  function propagateCloseEventToSources(streams) {
    streams.forEach((stream) => stream.emit("close"));
  }
  return stream$3;
}

var string = {};

var hasRequiredString;

function requireString() {
  if (hasRequiredString) return string;
  hasRequiredString = 1;
  Object.defineProperty(string, "__esModule", { value: true });
  string.isEmpty = string.isString = undefined;
  function isString(input) {
    return typeof input === "string";
  }
  string.isString = isString;
  function isEmpty(input) {
    return input === "";
  }
  string.isEmpty = isEmpty;
  return string;
}

var hasRequiredUtils$1;

function requireUtils$1() {
  if (hasRequiredUtils$1) return utils$3;
  hasRequiredUtils$1 = 1;
  Object.defineProperty(utils$3, "__esModule", { value: true });
  utils$3.string =
    utils$3.stream =
    utils$3.pattern =
    utils$3.path =
    utils$3.fs =
    utils$3.errno =
    utils$3.array =
      undefined;
  const array = requireArray();
  utils$3.array = array;
  const errno = requireErrno();
  utils$3.errno = errno;
  const fs = requireFs$3();
  utils$3.fs = fs;
  const path = requirePath();
  utils$3.path = path;
  const pattern = requirePattern();
  utils$3.pattern = pattern;
  const stream = requireStream$3();
  utils$3.stream = stream;
  const string = requireString();
  utils$3.string = string;
  return utils$3;
}

var hasRequiredTasks;

function requireTasks() {
  if (hasRequiredTasks) return tasks;
  hasRequiredTasks = 1;
  Object.defineProperty(tasks, "__esModule", { value: true });
  tasks.convertPatternGroupToTask =
    tasks.convertPatternGroupsToTasks =
    tasks.groupPatternsByBaseDirectory =
    tasks.getNegativePatternsAsPositive =
    tasks.getPositivePatterns =
    tasks.convertPatternsToTasks =
    tasks.generate =
      undefined;
  const utils = requireUtils$1();
  function generate(input, settings) {
    const patterns = processPatterns(input, settings);
    const ignore = processPatterns(settings.ignore, settings);
    const positivePatterns = getPositivePatterns(patterns);
    const negativePatterns = getNegativePatternsAsPositive(patterns, ignore);
    const staticPatterns = positivePatterns.filter((pattern) =>
      utils.pattern.isStaticPattern(pattern, settings),
    );
    const dynamicPatterns = positivePatterns.filter((pattern) =>
      utils.pattern.isDynamicPattern(pattern, settings),
    );
    const staticTasks = convertPatternsToTasks(
      staticPatterns,
      negativePatterns,
      /* dynamic */ false,
    );
    const dynamicTasks = convertPatternsToTasks(
      dynamicPatterns,
      negativePatterns,
      /* dynamic */ true,
    );
    return staticTasks.concat(dynamicTasks);
  }
  tasks.generate = generate;
  function processPatterns(input, settings) {
    let patterns = input;
    /**
     * The original pattern like `{,*,**,a/*}` can lead to problems checking the depth when matching entry
     * and some problems with the micromatch package (see fast-glob issues: #365, #394).
     *
     * To solve this problem, we expand all patterns containing brace expansion. This can lead to a slight slowdown
     * in matching in the case of a large set of patterns after expansion.
     */
    if (settings.braceExpansion) {
      patterns = utils.pattern.expandPatternsWithBraceExpansion(patterns);
    }
    /**
     * If the `baseNameMatch` option is enabled, we must add globstar to patterns, so that they can be used
     * at any nesting level.
     *
     * We do this here, because otherwise we have to complicate the filtering logic. For example, we need to change
     * the pattern in the filter before creating a regular expression. There is no need to change the patterns
     * in the application. Only on the input.
     */
    if (settings.baseNameMatch) {
      patterns = patterns.map((pattern) =>
        pattern.includes("/") ? pattern : `**/${pattern}`,
      );
    }
    /**
     * This method also removes duplicate slashes that may have been in the pattern or formed as a result of expansion.
     */
    return patterns.map((pattern) =>
      utils.pattern.removeDuplicateSlashes(pattern),
    );
  }
  /**
   * Returns tasks grouped by basic pattern directories.
   *
   * Patterns that can be found inside (`./`) and outside (`../`) the current directory are handled separately.
   * This is necessary because directory traversal starts at the base directory and goes deeper.
   */
  function convertPatternsToTasks(positive, negative, dynamic) {
    const tasks = [];
    const patternsOutsideCurrentDirectory =
      utils.pattern.getPatternsOutsideCurrentDirectory(positive);
    const patternsInsideCurrentDirectory =
      utils.pattern.getPatternsInsideCurrentDirectory(positive);
    const outsideCurrentDirectoryGroup = groupPatternsByBaseDirectory(
      patternsOutsideCurrentDirectory,
    );
    const insideCurrentDirectoryGroup = groupPatternsByBaseDirectory(
      patternsInsideCurrentDirectory,
    );
    tasks.push(
      ...convertPatternGroupsToTasks(
        outsideCurrentDirectoryGroup,
        negative,
        dynamic,
      ),
    );
    /*
     * For the sake of reducing future accesses to the file system, we merge all tasks within the current directory
     * into a global task, if at least one pattern refers to the root (`.`). In this case, the global task covers the rest.
     */
    if ("." in insideCurrentDirectoryGroup) {
      tasks.push(
        convertPatternGroupToTask(
          ".",
          patternsInsideCurrentDirectory,
          negative,
          dynamic,
        ),
      );
    } else {
      tasks.push(
        ...convertPatternGroupsToTasks(
          insideCurrentDirectoryGroup,
          negative,
          dynamic,
        ),
      );
    }
    return tasks;
  }
  tasks.convertPatternsToTasks = convertPatternsToTasks;
  function getPositivePatterns(patterns) {
    return utils.pattern.getPositivePatterns(patterns);
  }
  tasks.getPositivePatterns = getPositivePatterns;
  function getNegativePatternsAsPositive(patterns, ignore) {
    const negative = utils.pattern.getNegativePatterns(patterns).concat(ignore);
    const positive = negative.map(utils.pattern.convertToPositivePattern);
    return positive;
  }
  tasks.getNegativePatternsAsPositive = getNegativePatternsAsPositive;
  function groupPatternsByBaseDirectory(patterns) {
    const group = {};
    return patterns.reduce((collection, pattern) => {
      const base = utils.pattern.getBaseDirectory(pattern);
      if (base in collection) {
        collection[base].push(pattern);
      } else {
        collection[base] = [pattern];
      }
      return collection;
    }, group);
  }
  tasks.groupPatternsByBaseDirectory = groupPatternsByBaseDirectory;
  function convertPatternGroupsToTasks(positive, negative, dynamic) {
    return Object.keys(positive).map((base) => {
      return convertPatternGroupToTask(base, positive[base], negative, dynamic);
    });
  }
  tasks.convertPatternGroupsToTasks = convertPatternGroupsToTasks;
  function convertPatternGroupToTask(base, positive, negative, dynamic) {
    return {
      dynamic,
      positive,
      negative,
      base,
      patterns: [].concat(
        positive,
        negative.map(utils.pattern.convertToNegativePattern),
      ),
    };
  }
  tasks.convertPatternGroupToTask = convertPatternGroupToTask;
  return tasks;
}

var async$5 = {};

var async$4 = {};

var out$3 = {};

var async$3 = {};

var async$2 = {};

var out$2 = {};

var async$1 = {};

var out$1 = {};

var async = {};

var hasRequiredAsync$5;

function requireAsync$5() {
  if (hasRequiredAsync$5) return async;
  hasRequiredAsync$5 = 1;
  Object.defineProperty(async, "__esModule", { value: true });
  async.read = undefined;
  function read(path, settings, callback) {
    settings.fs.lstat(path, (lstatError, lstat) => {
      if (lstatError !== null) {
        callFailureCallback(callback, lstatError);
        return;
      }
      if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
        callSuccessCallback(callback, lstat);
        return;
      }
      settings.fs.stat(path, (statError, stat) => {
        if (statError !== null) {
          if (settings.throwErrorOnBrokenSymbolicLink) {
            callFailureCallback(callback, statError);
            return;
          }
          callSuccessCallback(callback, lstat);
          return;
        }
        if (settings.markSymbolicLink) {
          stat.isSymbolicLink = () => true;
        }
        callSuccessCallback(callback, stat);
      });
    });
  }
  async.read = read;
  function callFailureCallback(callback, error) {
    callback(error);
  }
  function callSuccessCallback(callback, result) {
    callback(null, result);
  }
  return async;
}

var sync$5 = {};

var hasRequiredSync$5;

function requireSync$5() {
  if (hasRequiredSync$5) return sync$5;
  hasRequiredSync$5 = 1;
  Object.defineProperty(sync$5, "__esModule", { value: true });
  sync$5.read = undefined;
  function read(path, settings) {
    const lstat = settings.fs.lstatSync(path);
    if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
      return lstat;
    }
    try {
      const stat = settings.fs.statSync(path);
      if (settings.markSymbolicLink) {
        stat.isSymbolicLink = () => true;
      }
      return stat;
    } catch (error) {
      if (!settings.throwErrorOnBrokenSymbolicLink) {
        return lstat;
      }
      throw error;
    }
  }
  sync$5.read = read;
  return sync$5;
}

var settings$3 = {};

var fs$2 = {};

var hasRequiredFs$2;

function requireFs$2() {
  if (hasRequiredFs$2) return fs$2;
  hasRequiredFs$2 = 1;
  (function (exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createFileSystemAdapter = exports.FILE_SYSTEM_ADAPTER = undefined;
    const fs = require$$0$4;
    exports.FILE_SYSTEM_ADAPTER = {
      lstat: fs.lstat,
      stat: fs.stat,
      lstatSync: fs.lstatSync,
      statSync: fs.statSync,
    };
    function createFileSystemAdapter(fsMethods) {
      if (fsMethods === undefined) {
        return exports.FILE_SYSTEM_ADAPTER;
      }
      return Object.assign(
        Object.assign({}, exports.FILE_SYSTEM_ADAPTER),
        fsMethods,
      );
    }
    exports.createFileSystemAdapter = createFileSystemAdapter;
  })(fs$2);
  return fs$2;
}

var hasRequiredSettings$3;

function requireSettings$3() {
  if (hasRequiredSettings$3) return settings$3;
  hasRequiredSettings$3 = 1;
  Object.defineProperty(settings$3, "__esModule", { value: true });
  const fs = requireFs$2();
  class Settings {
    constructor(_options = {}) {
      this._options = _options;
      this.followSymbolicLink = this._getValue(
        this._options.followSymbolicLink,
        true,
      );
      this.fs = fs.createFileSystemAdapter(this._options.fs);
      this.markSymbolicLink = this._getValue(
        this._options.markSymbolicLink,
        false,
      );
      this.throwErrorOnBrokenSymbolicLink = this._getValue(
        this._options.throwErrorOnBrokenSymbolicLink,
        true,
      );
    }
    _getValue(option, value) {
      return option !== null && option !== undefined ? option : value;
    }
  }
  settings$3.default = Settings;
  return settings$3;
}

var hasRequiredOut$3;

function requireOut$3() {
  if (hasRequiredOut$3) return out$1;
  hasRequiredOut$3 = 1;
  Object.defineProperty(out$1, "__esModule", { value: true });
  out$1.statSync = out$1.stat = out$1.Settings = undefined;
  const async = requireAsync$5();
  const sync = requireSync$5();
  const settings_1 = requireSettings$3();
  out$1.Settings = settings_1.default;
  function stat(path, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === "function") {
      async.read(path, getSettings(), optionsOrSettingsOrCallback);
      return;
    }
    async.read(path, getSettings(optionsOrSettingsOrCallback), callback);
  }
  out$1.stat = stat;
  function statSync(path, optionsOrSettings) {
    const settings = getSettings(optionsOrSettings);
    return sync.read(path, settings);
  }
  out$1.statSync = statSync;
  function getSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1.default) {
      return settingsOrOptions;
    }
    return new settings_1.default(settingsOrOptions);
  }
  return out$1;
}

/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

var queueMicrotask_1;
var hasRequiredQueueMicrotask;

function requireQueueMicrotask() {
  if (hasRequiredQueueMicrotask) return queueMicrotask_1;
  hasRequiredQueueMicrotask = 1;
  let promise;

  queueMicrotask_1 =
    typeof queueMicrotask === "function"
      ? queueMicrotask.bind(
          typeof window !== "undefined" ? window : commonjsGlobal,
        )
      : // reuse resolved promise, and allocate it lazily
        (cb) =>
          (promise || (promise = Promise.resolve())).then(cb).catch((err) =>
            setTimeout(() => {
              throw err;
            }, 0),
          );
  return queueMicrotask_1;
}

/*! run-parallel. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

var runParallel_1;
var hasRequiredRunParallel;

function requireRunParallel() {
  if (hasRequiredRunParallel) return runParallel_1;
  hasRequiredRunParallel = 1;
  runParallel_1 = runParallel;

  const queueMicrotask = requireQueueMicrotask();

  function runParallel(tasks, cb) {
    let results, pending, keys;
    let isSync = true;

    if (Array.isArray(tasks)) {
      results = [];
      pending = tasks.length;
    } else {
      keys = Object.keys(tasks);
      results = {};
      pending = keys.length;
    }

    function done(err) {
      function end() {
        if (cb) cb(err, results);
        cb = null;
      }
      if (isSync) queueMicrotask(end);
      else end();
    }

    function each(i, err, result) {
      results[i] = result;
      if (--pending === 0 || err) {
        done(err);
      }
    }

    if (!pending) {
      // empty
      done(null);
    } else if (keys) {
      // object
      keys.forEach(function (key) {
        tasks[key](function (err, result) {
          each(key, err, result);
        });
      });
    } else {
      // array
      tasks.forEach(function (task, i) {
        task(function (err, result) {
          each(i, err, result);
        });
      });
    }

    isSync = false;
  }
  return runParallel_1;
}

var constants = {};

var hasRequiredConstants;

function requireConstants() {
  if (hasRequiredConstants) return constants;
  hasRequiredConstants = 1;
  Object.defineProperty(constants, "__esModule", { value: true });
  constants.IS_SUPPORT_READDIR_WITH_FILE_TYPES = undefined;
  const NODE_PROCESS_VERSION_PARTS = process.versions.node.split(".");
  if (
    NODE_PROCESS_VERSION_PARTS[0] === undefined ||
    NODE_PROCESS_VERSION_PARTS[1] === undefined
  ) {
    throw new Error(
      `Unexpected behavior. The 'process.versions.node' variable has invalid value: ${process.versions.node}`,
    );
  }
  const MAJOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[0], 10);
  const MINOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[1], 10);
  const SUPPORTED_MAJOR_VERSION = 10;
  const SUPPORTED_MINOR_VERSION = 10;
  const IS_MATCHED_BY_MAJOR = MAJOR_VERSION > SUPPORTED_MAJOR_VERSION;
  const IS_MATCHED_BY_MAJOR_AND_MINOR =
    MAJOR_VERSION === SUPPORTED_MAJOR_VERSION &&
    MINOR_VERSION >= SUPPORTED_MINOR_VERSION;
  /**
   * IS `true` for Node.js 10.10 and greater.
   */
  constants.IS_SUPPORT_READDIR_WITH_FILE_TYPES =
    IS_MATCHED_BY_MAJOR || IS_MATCHED_BY_MAJOR_AND_MINOR;
  return constants;
}

var utils = {};

var fs$1 = {};

var hasRequiredFs$1;

function requireFs$1() {
  if (hasRequiredFs$1) return fs$1;
  hasRequiredFs$1 = 1;
  Object.defineProperty(fs$1, "__esModule", { value: true });
  fs$1.createDirentFromStats = undefined;
  class DirentFromStats {
    constructor(name, stats) {
      this.name = name;
      this.isBlockDevice = stats.isBlockDevice.bind(stats);
      this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
      this.isDirectory = stats.isDirectory.bind(stats);
      this.isFIFO = stats.isFIFO.bind(stats);
      this.isFile = stats.isFile.bind(stats);
      this.isSocket = stats.isSocket.bind(stats);
      this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
    }
  }
  function createDirentFromStats(name, stats) {
    return new DirentFromStats(name, stats);
  }
  fs$1.createDirentFromStats = createDirentFromStats;
  return fs$1;
}

var hasRequiredUtils;

function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.fs = undefined;
  const fs = requireFs$1();
  utils.fs = fs;
  return utils;
}

var common$1 = {};

var hasRequiredCommon$1;

function requireCommon$1() {
  if (hasRequiredCommon$1) return common$1;
  hasRequiredCommon$1 = 1;
  Object.defineProperty(common$1, "__esModule", { value: true });
  common$1.joinPathSegments = undefined;
  function joinPathSegments(a, b, separator) {
    /**
     * The correct handling of cases when the first segment is a root (`/`, `C:/`) or UNC path (`//?/C:/`).
     */
    if (a.endsWith(separator)) {
      return a + b;
    }
    return a + separator + b;
  }
  common$1.joinPathSegments = joinPathSegments;
  return common$1;
}

var hasRequiredAsync$4;

function requireAsync$4() {
  if (hasRequiredAsync$4) return async$1;
  hasRequiredAsync$4 = 1;
  Object.defineProperty(async$1, "__esModule", { value: true });
  async$1.readdir = async$1.readdirWithFileTypes = async$1.read = undefined;
  const fsStat = requireOut$3();
  const rpl = requireRunParallel();
  const constants_1 = requireConstants();
  const utils = requireUtils();
  const common = requireCommon$1();
  function read(directory, settings, callback) {
    if (!settings.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
      readdirWithFileTypes(directory, settings, callback);
      return;
    }
    readdir(directory, settings, callback);
  }
  async$1.read = read;
  function readdirWithFileTypes(directory, settings, callback) {
    settings.fs.readdir(
      directory,
      { withFileTypes: true },
      (readdirError, dirents) => {
        if (readdirError !== null) {
          callFailureCallback(callback, readdirError);
          return;
        }
        const entries = dirents.map((dirent) => ({
          dirent,
          name: dirent.name,
          path: common.joinPathSegments(
            directory,
            dirent.name,
            settings.pathSegmentSeparator,
          ),
        }));
        if (!settings.followSymbolicLinks) {
          callSuccessCallback(callback, entries);
          return;
        }
        const tasks = entries.map((entry) => makeRplTaskEntry(entry, settings));
        rpl(tasks, (rplError, rplEntries) => {
          if (rplError !== null) {
            callFailureCallback(callback, rplError);
            return;
          }
          callSuccessCallback(callback, rplEntries);
        });
      },
    );
  }
  async$1.readdirWithFileTypes = readdirWithFileTypes;
  function makeRplTaskEntry(entry, settings) {
    return (done) => {
      if (!entry.dirent.isSymbolicLink()) {
        done(null, entry);
        return;
      }
      settings.fs.stat(entry.path, (statError, stats) => {
        if (statError !== null) {
          if (settings.throwErrorOnBrokenSymbolicLink) {
            done(statError);
            return;
          }
          done(null, entry);
          return;
        }
        entry.dirent = utils.fs.createDirentFromStats(entry.name, stats);
        done(null, entry);
      });
    };
  }
  function readdir(directory, settings, callback) {
    settings.fs.readdir(directory, (readdirError, names) => {
      if (readdirError !== null) {
        callFailureCallback(callback, readdirError);
        return;
      }
      const tasks = names.map((name) => {
        const path = common.joinPathSegments(
          directory,
          name,
          settings.pathSegmentSeparator,
        );
        return (done) => {
          fsStat.stat(path, settings.fsStatSettings, (error, stats) => {
            if (error !== null) {
              done(error);
              return;
            }
            const entry = {
              name,
              path,
              dirent: utils.fs.createDirentFromStats(name, stats),
            };
            if (settings.stats) {
              entry.stats = stats;
            }
            done(null, entry);
          });
        };
      });
      rpl(tasks, (rplError, entries) => {
        if (rplError !== null) {
          callFailureCallback(callback, rplError);
          return;
        }
        callSuccessCallback(callback, entries);
      });
    });
  }
  async$1.readdir = readdir;
  function callFailureCallback(callback, error) {
    callback(error);
  }
  function callSuccessCallback(callback, result) {
    callback(null, result);
  }
  return async$1;
}

var sync$4 = {};

var hasRequiredSync$4;

function requireSync$4() {
  if (hasRequiredSync$4) return sync$4;
  hasRequiredSync$4 = 1;
  Object.defineProperty(sync$4, "__esModule", { value: true });
  sync$4.readdir = sync$4.readdirWithFileTypes = sync$4.read = undefined;
  const fsStat = requireOut$3();
  const constants_1 = requireConstants();
  const utils = requireUtils();
  const common = requireCommon$1();
  function read(directory, settings) {
    if (!settings.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
      return readdirWithFileTypes(directory, settings);
    }
    return readdir(directory, settings);
  }
  sync$4.read = read;
  function readdirWithFileTypes(directory, settings) {
    const dirents = settings.fs.readdirSync(directory, { withFileTypes: true });
    return dirents.map((dirent) => {
      const entry = {
        dirent,
        name: dirent.name,
        path: common.joinPathSegments(
          directory,
          dirent.name,
          settings.pathSegmentSeparator,
        ),
      };
      if (entry.dirent.isSymbolicLink() && settings.followSymbolicLinks) {
        try {
          const stats = settings.fs.statSync(entry.path);
          entry.dirent = utils.fs.createDirentFromStats(entry.name, stats);
        } catch (error) {
          if (settings.throwErrorOnBrokenSymbolicLink) {
            throw error;
          }
        }
      }
      return entry;
    });
  }
  sync$4.readdirWithFileTypes = readdirWithFileTypes;
  function readdir(directory, settings) {
    const names = settings.fs.readdirSync(directory);
    return names.map((name) => {
      const entryPath = common.joinPathSegments(
        directory,
        name,
        settings.pathSegmentSeparator,
      );
      const stats = fsStat.statSync(entryPath, settings.fsStatSettings);
      const entry = {
        name,
        path: entryPath,
        dirent: utils.fs.createDirentFromStats(name, stats),
      };
      if (settings.stats) {
        entry.stats = stats;
      }
      return entry;
    });
  }
  sync$4.readdir = readdir;
  return sync$4;
}

var settings$2 = {};

var fs = {};

var hasRequiredFs;

function requireFs() {
  if (hasRequiredFs) return fs;
  hasRequiredFs = 1;
  (function (exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createFileSystemAdapter = exports.FILE_SYSTEM_ADAPTER = undefined;
    const fs = require$$0$4;
    exports.FILE_SYSTEM_ADAPTER = {
      lstat: fs.lstat,
      stat: fs.stat,
      lstatSync: fs.lstatSync,
      statSync: fs.statSync,
      readdir: fs.readdir,
      readdirSync: fs.readdirSync,
    };
    function createFileSystemAdapter(fsMethods) {
      if (fsMethods === undefined) {
        return exports.FILE_SYSTEM_ADAPTER;
      }
      return Object.assign(
        Object.assign({}, exports.FILE_SYSTEM_ADAPTER),
        fsMethods,
      );
    }
    exports.createFileSystemAdapter = createFileSystemAdapter;
  })(fs);
  return fs;
}

var hasRequiredSettings$2;

function requireSettings$2() {
  if (hasRequiredSettings$2) return settings$2;
  hasRequiredSettings$2 = 1;
  Object.defineProperty(settings$2, "__esModule", { value: true });
  const path = require$$0$1;
  const fsStat = requireOut$3();
  const fs = requireFs();
  class Settings {
    constructor(_options = {}) {
      this._options = _options;
      this.followSymbolicLinks = this._getValue(
        this._options.followSymbolicLinks,
        false,
      );
      this.fs = fs.createFileSystemAdapter(this._options.fs);
      this.pathSegmentSeparator = this._getValue(
        this._options.pathSegmentSeparator,
        path.sep,
      );
      this.stats = this._getValue(this._options.stats, false);
      this.throwErrorOnBrokenSymbolicLink = this._getValue(
        this._options.throwErrorOnBrokenSymbolicLink,
        true,
      );
      this.fsStatSettings = new fsStat.Settings({
        followSymbolicLink: this.followSymbolicLinks,
        fs: this.fs,
        throwErrorOnBrokenSymbolicLink: this.throwErrorOnBrokenSymbolicLink,
      });
    }
    _getValue(option, value) {
      return option !== null && option !== undefined ? option : value;
    }
  }
  settings$2.default = Settings;
  return settings$2;
}

var hasRequiredOut$2;

function requireOut$2() {
  if (hasRequiredOut$2) return out$2;
  hasRequiredOut$2 = 1;
  Object.defineProperty(out$2, "__esModule", { value: true });
  out$2.Settings = out$2.scandirSync = out$2.scandir = undefined;
  const async = requireAsync$4();
  const sync = requireSync$4();
  const settings_1 = requireSettings$2();
  out$2.Settings = settings_1.default;
  function scandir(path, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === "function") {
      async.read(path, getSettings(), optionsOrSettingsOrCallback);
      return;
    }
    async.read(path, getSettings(optionsOrSettingsOrCallback), callback);
  }
  out$2.scandir = scandir;
  function scandirSync(path, optionsOrSettings) {
    const settings = getSettings(optionsOrSettings);
    return sync.read(path, settings);
  }
  out$2.scandirSync = scandirSync;
  function getSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1.default) {
      return settingsOrOptions;
    }
    return new settings_1.default(settingsOrOptions);
  }
  return out$2;
}

var queue = { exports: {} };

var reusify_1;
var hasRequiredReusify;

function requireReusify() {
  if (hasRequiredReusify) return reusify_1;
  hasRequiredReusify = 1;

  function reusify(Constructor) {
    var head = new Constructor();
    var tail = head;

    function get() {
      var current = head;

      if (current.next) {
        head = current.next;
      } else {
        head = new Constructor();
        tail = head;
      }

      current.next = null;

      return current;
    }

    function release(obj) {
      tail.next = obj;
      tail = obj;
    }

    return {
      get: get,
      release: release,
    };
  }

  reusify_1 = reusify;
  return reusify_1;
}

var hasRequiredQueue;

function requireQueue() {
  if (hasRequiredQueue) return queue.exports;
  hasRequiredQueue = 1;

  /* eslint-disable no-var */

  var reusify = requireReusify();

  function fastqueue(context, worker, _concurrency) {
    if (typeof context === "function") {
      _concurrency = worker;
      worker = context;
      context = null;
    }

    if (!(_concurrency >= 1)) {
      throw new Error(
        "fastqueue concurrency must be equal to or greater than 1",
      );
    }

    var cache = reusify(Task);
    var queueHead = null;
    var queueTail = null;
    var _running = 0;
    var errorHandler = null;

    var self = {
      push: push,
      drain: noop,
      saturated: noop,
      pause: pause,
      paused: false,

      get concurrency() {
        return _concurrency;
      },
      set concurrency(value) {
        if (!(value >= 1)) {
          throw new Error(
            "fastqueue concurrency must be equal to or greater than 1",
          );
        }
        _concurrency = value;

        if (self.paused) return;
        for (; queueHead && _running < _concurrency; ) {
          _running++;
          release();
        }
      },

      running: running,
      resume: resume,
      idle: idle,
      length: length,
      getQueue: getQueue,
      unshift: unshift,
      empty: noop,
      kill: kill,
      killAndDrain: killAndDrain,
      error: error,
    };

    return self;

    function running() {
      return _running;
    }

    function pause() {
      self.paused = true;
    }

    function length() {
      var current = queueHead;
      var counter = 0;

      while (current) {
        current = current.next;
        counter++;
      }

      return counter;
    }

    function getQueue() {
      var current = queueHead;
      var tasks = [];

      while (current) {
        tasks.push(current.value);
        current = current.next;
      }

      return tasks;
    }

    function resume() {
      if (!self.paused) return;
      self.paused = false;
      if (queueHead === null) {
        _running++;
        release();
        return;
      }
      for (; queueHead && _running < _concurrency; ) {
        _running++;
        release();
      }
    }

    function idle() {
      return _running === 0 && self.length() === 0;
    }

    function push(value, done) {
      var current = cache.get();

      current.context = context;
      current.release = release;
      current.value = value;
      current.callback = done || noop;
      current.errorHandler = errorHandler;

      if (_running >= _concurrency || self.paused) {
        if (queueTail) {
          queueTail.next = current;
          queueTail = current;
        } else {
          queueHead = current;
          queueTail = current;
          self.saturated();
        }
      } else {
        _running++;
        worker.call(context, current.value, current.worked);
      }
    }

    function unshift(value, done) {
      var current = cache.get();

      current.context = context;
      current.release = release;
      current.value = value;
      current.callback = done || noop;
      current.errorHandler = errorHandler;

      if (_running >= _concurrency || self.paused) {
        if (queueHead) {
          current.next = queueHead;
          queueHead = current;
        } else {
          queueHead = current;
          queueTail = current;
          self.saturated();
        }
      } else {
        _running++;
        worker.call(context, current.value, current.worked);
      }
    }

    function release(holder) {
      if (holder) {
        cache.release(holder);
      }
      var next = queueHead;
      if (next && _running <= _concurrency) {
        if (!self.paused) {
          if (queueTail === queueHead) {
            queueTail = null;
          }
          queueHead = next.next;
          next.next = null;
          worker.call(context, next.value, next.worked);
          if (queueTail === null) {
            self.empty();
          }
        } else {
          _running--;
        }
      } else if (--_running === 0) {
        self.drain();
      }
    }

    function kill() {
      queueHead = null;
      queueTail = null;
      self.drain = noop;
    }

    function killAndDrain() {
      queueHead = null;
      queueTail = null;
      self.drain();
      self.drain = noop;
    }

    function error(handler) {
      errorHandler = handler;
    }
  }

  function noop() {}

  function Task() {
    this.value = null;
    this.callback = noop;
    this.next = null;
    this.release = noop;
    this.context = null;
    this.errorHandler = null;

    var self = this;

    this.worked = function worked(err, result) {
      var callback = self.callback;
      var errorHandler = self.errorHandler;
      var val = self.value;
      self.value = null;
      self.callback = noop;
      if (self.errorHandler) {
        errorHandler(err, val);
      }
      callback.call(self.context, err, result);
      self.release(self);
    };
  }

  function queueAsPromised(context, worker, _concurrency) {
    if (typeof context === "function") {
      _concurrency = worker;
      worker = context;
      context = null;
    }

    function asyncWrapper(arg, cb) {
      worker.call(this, arg).then(function (res) {
        cb(null, res);
      }, cb);
    }

    var queue = fastqueue(context, asyncWrapper, _concurrency);

    var pushCb = queue.push;
    var unshiftCb = queue.unshift;

    queue.push = push;
    queue.unshift = unshift;
    queue.drained = drained;

    return queue;

    function push(value) {
      var p = new Promise(function (resolve, reject) {
        pushCb(value, function (err, result) {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });

      // Let's fork the promise chain to
      // make the error bubble up to the user but
      // not lead to a unhandledRejection
      p.catch(noop);

      return p;
    }

    function unshift(value) {
      var p = new Promise(function (resolve, reject) {
        unshiftCb(value, function (err, result) {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });

      // Let's fork the promise chain to
      // make the error bubble up to the user but
      // not lead to a unhandledRejection
      p.catch(noop);

      return p;
    }

    function drained() {
      var p = new Promise(function (resolve) {
        process.nextTick(function () {
          if (queue.idle()) {
            resolve();
          } else {
            var previousDrain = queue.drain;
            queue.drain = function () {
              if (typeof previousDrain === "function") previousDrain();
              resolve();
              queue.drain = previousDrain;
            };
          }
        });
      });

      return p;
    }
  }

  queue.exports = fastqueue;
  queue.exports.promise = queueAsPromised;
  return queue.exports;
}

var common = {};

var hasRequiredCommon;

function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  Object.defineProperty(common, "__esModule", { value: true });
  common.joinPathSegments =
    common.replacePathSegmentSeparator =
    common.isAppliedFilter =
    common.isFatalError =
      undefined;
  function isFatalError(settings, error) {
    if (settings.errorFilter === null) {
      return true;
    }
    return !settings.errorFilter(error);
  }
  common.isFatalError = isFatalError;
  function isAppliedFilter(filter, value) {
    return filter === null || filter(value);
  }
  common.isAppliedFilter = isAppliedFilter;
  function replacePathSegmentSeparator(filepath, separator) {
    return filepath.split(/[/\\]/).join(separator);
  }
  common.replacePathSegmentSeparator = replacePathSegmentSeparator;
  function joinPathSegments(a, b, separator) {
    if (a === "") {
      return b;
    }
    /**
     * The correct handling of cases when the first segment is a root (`/`, `C:/`) or UNC path (`//?/C:/`).
     */
    if (a.endsWith(separator)) {
      return a + b;
    }
    return a + separator + b;
  }
  common.joinPathSegments = joinPathSegments;
  return common;
}

var reader$1 = {};

var hasRequiredReader$1;

function requireReader$1() {
  if (hasRequiredReader$1) return reader$1;
  hasRequiredReader$1 = 1;
  Object.defineProperty(reader$1, "__esModule", { value: true });
  const common = requireCommon();
  class Reader {
    constructor(_root, _settings) {
      this._root = _root;
      this._settings = _settings;
      this._root = common.replacePathSegmentSeparator(
        _root,
        _settings.pathSegmentSeparator,
      );
    }
  }
  reader$1.default = Reader;
  return reader$1;
}

var hasRequiredAsync$3;

function requireAsync$3() {
  if (hasRequiredAsync$3) return async$2;
  hasRequiredAsync$3 = 1;
  Object.defineProperty(async$2, "__esModule", { value: true });
  const events_1 = require$$0$5;
  const fsScandir = requireOut$2();
  const fastq = requireQueue();
  const common = requireCommon();
  const reader_1 = requireReader$1();
  class AsyncReader extends reader_1.default {
    constructor(_root, _settings) {
      super(_root, _settings);
      this._settings = _settings;
      this._scandir = fsScandir.scandir;
      this._emitter = new events_1.EventEmitter();
      this._queue = fastq(this._worker.bind(this), this._settings.concurrency);
      this._isFatalError = false;
      this._isDestroyed = false;
      this._queue.drain = () => {
        if (!this._isFatalError) {
          this._emitter.emit("end");
        }
      };
    }
    read() {
      this._isFatalError = false;
      this._isDestroyed = false;
      setImmediate(() => {
        this._pushToQueue(this._root, this._settings.basePath);
      });
      return this._emitter;
    }
    get isDestroyed() {
      return this._isDestroyed;
    }
    destroy() {
      if (this._isDestroyed) {
        throw new Error("The reader is already destroyed");
      }
      this._isDestroyed = true;
      this._queue.killAndDrain();
    }
    onEntry(callback) {
      this._emitter.on("entry", callback);
    }
    onError(callback) {
      this._emitter.once("error", callback);
    }
    onEnd(callback) {
      this._emitter.once("end", callback);
    }
    _pushToQueue(directory, base) {
      const queueItem = { directory, base };
      this._queue.push(queueItem, (error) => {
        if (error !== null) {
          this._handleError(error);
        }
      });
    }
    _worker(item, done) {
      this._scandir(
        item.directory,
        this._settings.fsScandirSettings,
        (error, entries) => {
          if (error !== null) {
            done(error, undefined);
            return;
          }
          for (const entry of entries) {
            this._handleEntry(entry, item.base);
          }
          done(null, undefined);
        },
      );
    }
    _handleError(error) {
      if (this._isDestroyed || !common.isFatalError(this._settings, error)) {
        return;
      }
      this._isFatalError = true;
      this._isDestroyed = true;
      this._emitter.emit("error", error);
    }
    _handleEntry(entry, base) {
      if (this._isDestroyed || this._isFatalError) {
        return;
      }
      const fullpath = entry.path;
      if (base !== undefined) {
        entry.path = common.joinPathSegments(
          base,
          entry.name,
          this._settings.pathSegmentSeparator,
        );
      }
      if (common.isAppliedFilter(this._settings.entryFilter, entry)) {
        this._emitEntry(entry);
      }
      if (
        entry.dirent.isDirectory() &&
        common.isAppliedFilter(this._settings.deepFilter, entry)
      ) {
        this._pushToQueue(
          fullpath,
          base === undefined ? undefined : entry.path,
        );
      }
    }
    _emitEntry(entry) {
      this._emitter.emit("entry", entry);
    }
  }
  async$2.default = AsyncReader;
  return async$2;
}

var hasRequiredAsync$2;

function requireAsync$2() {
  if (hasRequiredAsync$2) return async$3;
  hasRequiredAsync$2 = 1;
  Object.defineProperty(async$3, "__esModule", { value: true });
  const async_1 = requireAsync$3();
  class AsyncProvider {
    constructor(_root, _settings) {
      this._root = _root;
      this._settings = _settings;
      this._reader = new async_1.default(this._root, this._settings);
      this._storage = [];
    }
    read(callback) {
      this._reader.onError((error) => {
        callFailureCallback(callback, error);
      });
      this._reader.onEntry((entry) => {
        this._storage.push(entry);
      });
      this._reader.onEnd(() => {
        callSuccessCallback(callback, this._storage);
      });
      this._reader.read();
    }
  }
  async$3.default = AsyncProvider;
  function callFailureCallback(callback, error) {
    callback(error);
  }
  function callSuccessCallback(callback, entries) {
    callback(null, entries);
  }
  return async$3;
}

var stream$2 = {};

var hasRequiredStream$2;

function requireStream$2() {
  if (hasRequiredStream$2) return stream$2;
  hasRequiredStream$2 = 1;
  Object.defineProperty(stream$2, "__esModule", { value: true });
  const stream_1 = require$$0$3;
  const async_1 = requireAsync$3();
  class StreamProvider {
    constructor(_root, _settings) {
      this._root = _root;
      this._settings = _settings;
      this._reader = new async_1.default(this._root, this._settings);
      this._stream = new stream_1.Readable({
        objectMode: true,
        read: () => {},
        destroy: () => {
          if (!this._reader.isDestroyed) {
            this._reader.destroy();
          }
        },
      });
    }
    read() {
      this._reader.onError((error) => {
        this._stream.emit("error", error);
      });
      this._reader.onEntry((entry) => {
        this._stream.push(entry);
      });
      this._reader.onEnd(() => {
        this._stream.push(null);
      });
      this._reader.read();
      return this._stream;
    }
  }
  stream$2.default = StreamProvider;
  return stream$2;
}

var sync$3 = {};

var sync$2 = {};

var hasRequiredSync$3;

function requireSync$3() {
  if (hasRequiredSync$3) return sync$2;
  hasRequiredSync$3 = 1;
  Object.defineProperty(sync$2, "__esModule", { value: true });
  const fsScandir = requireOut$2();
  const common = requireCommon();
  const reader_1 = requireReader$1();
  class SyncReader extends reader_1.default {
    constructor() {
      super(...arguments);
      this._scandir = fsScandir.scandirSync;
      this._storage = [];
      this._queue = new Set();
    }
    read() {
      this._pushToQueue(this._root, this._settings.basePath);
      this._handleQueue();
      return this._storage;
    }
    _pushToQueue(directory, base) {
      this._queue.add({ directory, base });
    }
    _handleQueue() {
      for (const item of this._queue.values()) {
        this._handleDirectory(item.directory, item.base);
      }
    }
    _handleDirectory(directory, base) {
      try {
        const entries = this._scandir(
          directory,
          this._settings.fsScandirSettings,
        );
        for (const entry of entries) {
          this._handleEntry(entry, base);
        }
      } catch (error) {
        this._handleError(error);
      }
    }
    _handleError(error) {
      if (!common.isFatalError(this._settings, error)) {
        return;
      }
      throw error;
    }
    _handleEntry(entry, base) {
      const fullpath = entry.path;
      if (base !== undefined) {
        entry.path = common.joinPathSegments(
          base,
          entry.name,
          this._settings.pathSegmentSeparator,
        );
      }
      if (common.isAppliedFilter(this._settings.entryFilter, entry)) {
        this._pushToStorage(entry);
      }
      if (
        entry.dirent.isDirectory() &&
        common.isAppliedFilter(this._settings.deepFilter, entry)
      ) {
        this._pushToQueue(
          fullpath,
          base === undefined ? undefined : entry.path,
        );
      }
    }
    _pushToStorage(entry) {
      this._storage.push(entry);
    }
  }
  sync$2.default = SyncReader;
  return sync$2;
}

var hasRequiredSync$2;

function requireSync$2() {
  if (hasRequiredSync$2) return sync$3;
  hasRequiredSync$2 = 1;
  Object.defineProperty(sync$3, "__esModule", { value: true });
  const sync_1 = requireSync$3();
  class SyncProvider {
    constructor(_root, _settings) {
      this._root = _root;
      this._settings = _settings;
      this._reader = new sync_1.default(this._root, this._settings);
    }
    read() {
      return this._reader.read();
    }
  }
  sync$3.default = SyncProvider;
  return sync$3;
}

var settings$1 = {};

var hasRequiredSettings$1;

function requireSettings$1() {
  if (hasRequiredSettings$1) return settings$1;
  hasRequiredSettings$1 = 1;
  Object.defineProperty(settings$1, "__esModule", { value: true });
  const path = require$$0$1;
  const fsScandir = requireOut$2();
  class Settings {
    constructor(_options = {}) {
      this._options = _options;
      this.basePath = this._getValue(this._options.basePath, undefined);
      this.concurrency = this._getValue(
        this._options.concurrency,
        Number.POSITIVE_INFINITY,
      );
      this.deepFilter = this._getValue(this._options.deepFilter, null);
      this.entryFilter = this._getValue(this._options.entryFilter, null);
      this.errorFilter = this._getValue(this._options.errorFilter, null);
      this.pathSegmentSeparator = this._getValue(
        this._options.pathSegmentSeparator,
        path.sep,
      );
      this.fsScandirSettings = new fsScandir.Settings({
        followSymbolicLinks: this._options.followSymbolicLinks,
        fs: this._options.fs,
        pathSegmentSeparator: this._options.pathSegmentSeparator,
        stats: this._options.stats,
        throwErrorOnBrokenSymbolicLink:
          this._options.throwErrorOnBrokenSymbolicLink,
      });
    }
    _getValue(option, value) {
      return option !== null && option !== undefined ? option : value;
    }
  }
  settings$1.default = Settings;
  return settings$1;
}

var hasRequiredOut$1;

function requireOut$1() {
  if (hasRequiredOut$1) return out$3;
  hasRequiredOut$1 = 1;
  Object.defineProperty(out$3, "__esModule", { value: true });
  out$3.Settings = out$3.walkStream = out$3.walkSync = out$3.walk = undefined;
  const async_1 = requireAsync$2();
  const stream_1 = requireStream$2();
  const sync_1 = requireSync$2();
  const settings_1 = requireSettings$1();
  out$3.Settings = settings_1.default;
  function walk(directory, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === "function") {
      new async_1.default(directory, getSettings()).read(
        optionsOrSettingsOrCallback,
      );
      return;
    }
    new async_1.default(
      directory,
      getSettings(optionsOrSettingsOrCallback),
    ).read(callback);
  }
  out$3.walk = walk;
  function walkSync(directory, optionsOrSettings) {
    const settings = getSettings(optionsOrSettings);
    const provider = new sync_1.default(directory, settings);
    return provider.read();
  }
  out$3.walkSync = walkSync;
  function walkStream(directory, optionsOrSettings) {
    const settings = getSettings(optionsOrSettings);
    const provider = new stream_1.default(directory, settings);
    return provider.read();
  }
  out$3.walkStream = walkStream;
  function getSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1.default) {
      return settingsOrOptions;
    }
    return new settings_1.default(settingsOrOptions);
  }
  return out$3;
}

var reader = {};

var hasRequiredReader;

function requireReader() {
  if (hasRequiredReader) return reader;
  hasRequiredReader = 1;
  Object.defineProperty(reader, "__esModule", { value: true });
  const path = require$$0$1;
  const fsStat = requireOut$3();
  const utils = requireUtils$1();
  class Reader {
    constructor(_settings) {
      this._settings = _settings;
      this._fsStatSettings = new fsStat.Settings({
        followSymbolicLink: this._settings.followSymbolicLinks,
        fs: this._settings.fs,
        throwErrorOnBrokenSymbolicLink: this._settings.followSymbolicLinks,
      });
    }
    _getFullEntryPath(filepath) {
      return path.resolve(this._settings.cwd, filepath);
    }
    _makeEntry(stats, pattern) {
      const entry = {
        name: pattern,
        path: pattern,
        dirent: utils.fs.createDirentFromStats(pattern, stats),
      };
      if (this._settings.stats) {
        entry.stats = stats;
      }
      return entry;
    }
    _isFatalError(error) {
      return (
        !utils.errno.isEnoentCodeError(error) && !this._settings.suppressErrors
      );
    }
  }
  reader.default = Reader;
  return reader;
}

var stream$1 = {};

var hasRequiredStream$1;

function requireStream$1() {
  if (hasRequiredStream$1) return stream$1;
  hasRequiredStream$1 = 1;
  Object.defineProperty(stream$1, "__esModule", { value: true });
  const stream_1 = require$$0$3;
  const fsStat = requireOut$3();
  const fsWalk = requireOut$1();
  const reader_1 = requireReader();
  class ReaderStream extends reader_1.default {
    constructor() {
      super(...arguments);
      this._walkStream = fsWalk.walkStream;
      this._stat = fsStat.stat;
    }
    dynamic(root, options) {
      return this._walkStream(root, options);
    }
    static(patterns, options) {
      const filepaths = patterns.map(this._getFullEntryPath, this);
      const stream = new stream_1.PassThrough({ objectMode: true });
      stream._write = (index, _enc, done) => {
        return this._getEntry(filepaths[index], patterns[index], options)
          .then((entry) => {
            if (entry !== null && options.entryFilter(entry)) {
              stream.push(entry);
            }
            if (index === filepaths.length - 1) {
              stream.end();
            }
            done();
          })
          .catch(done);
      };
      for (let i = 0; i < filepaths.length; i++) {
        stream.write(i);
      }
      return stream;
    }
    _getEntry(filepath, pattern, options) {
      return this._getStat(filepath)
        .then((stats) => this._makeEntry(stats, pattern))
        .catch((error) => {
          if (options.errorFilter(error)) {
            return null;
          }
          throw error;
        });
    }
    _getStat(filepath) {
      return new Promise((resolve, reject) => {
        this._stat(filepath, this._fsStatSettings, (error, stats) => {
          return error === null ? resolve(stats) : reject(error);
        });
      });
    }
  }
  stream$1.default = ReaderStream;
  return stream$1;
}

var hasRequiredAsync$1;

function requireAsync$1() {
  if (hasRequiredAsync$1) return async$4;
  hasRequiredAsync$1 = 1;
  Object.defineProperty(async$4, "__esModule", { value: true });
  const fsWalk = requireOut$1();
  const reader_1 = requireReader();
  const stream_1 = requireStream$1();
  class ReaderAsync extends reader_1.default {
    constructor() {
      super(...arguments);
      this._walkAsync = fsWalk.walk;
      this._readerStream = new stream_1.default(this._settings);
    }
    dynamic(root, options) {
      return new Promise((resolve, reject) => {
        this._walkAsync(root, options, (error, entries) => {
          if (error === null) {
            resolve(entries);
          } else {
            reject(error);
          }
        });
      });
    }
    async static(patterns, options) {
      const entries = [];
      const stream = this._readerStream.static(patterns, options);
      // After #235, replace it with an asynchronous iterator.
      return new Promise((resolve, reject) => {
        stream.once("error", reject);
        stream.on("data", (entry) => entries.push(entry));
        stream.once("end", () => resolve(entries));
      });
    }
  }
  async$4.default = ReaderAsync;
  return async$4;
}

var provider = {};

var deep = {};

var partial = {};

var matcher = {};

var hasRequiredMatcher;

function requireMatcher() {
  if (hasRequiredMatcher) return matcher;
  hasRequiredMatcher = 1;
  Object.defineProperty(matcher, "__esModule", { value: true });
  const utils = requireUtils$1();
  class Matcher {
    constructor(_patterns, _settings, _micromatchOptions) {
      this._patterns = _patterns;
      this._settings = _settings;
      this._micromatchOptions = _micromatchOptions;
      this._storage = [];
      this._fillStorage();
    }
    _fillStorage() {
      for (const pattern of this._patterns) {
        const segments = this._getPatternSegments(pattern);
        const sections = this._splitSegmentsIntoSections(segments);
        this._storage.push({
          complete: sections.length <= 1,
          pattern,
          segments,
          sections,
        });
      }
    }
    _getPatternSegments(pattern) {
      const parts = utils.pattern.getPatternParts(
        pattern,
        this._micromatchOptions,
      );
      return parts.map((part) => {
        const dynamic = utils.pattern.isDynamicPattern(part, this._settings);
        if (!dynamic) {
          return {
            dynamic: false,
            pattern: part,
          };
        }
        return {
          dynamic: true,
          pattern: part,
          patternRe: utils.pattern.makeRe(part, this._micromatchOptions),
        };
      });
    }
    _splitSegmentsIntoSections(segments) {
      return utils.array.splitWhen(
        segments,
        (segment) =>
          segment.dynamic && utils.pattern.hasGlobStar(segment.pattern),
      );
    }
  }
  matcher.default = Matcher;
  return matcher;
}

var hasRequiredPartial;

function requirePartial() {
  if (hasRequiredPartial) return partial;
  hasRequiredPartial = 1;
  Object.defineProperty(partial, "__esModule", { value: true });
  const matcher_1 = requireMatcher();
  class PartialMatcher extends matcher_1.default {
    match(filepath) {
      const parts = filepath.split("/");
      const levels = parts.length;
      const patterns = this._storage.filter(
        (info) => !info.complete || info.segments.length > levels,
      );
      for (const pattern of patterns) {
        const section = pattern.sections[0];
        /**
         * In this case, the pattern has a globstar and we must read all directories unconditionally,
         * but only if the level has reached the end of the first group.
         *
         * fixtures/{a,b}/**
         *  ^ true/false  ^ always true
         */
        if (!pattern.complete && levels > section.length) {
          return true;
        }
        const match = parts.every((part, index) => {
          const segment = pattern.segments[index];
          if (segment.dynamic && segment.patternRe.test(part)) {
            return true;
          }
          if (!segment.dynamic && segment.pattern === part) {
            return true;
          }
          return false;
        });
        if (match) {
          return true;
        }
      }
      return false;
    }
  }
  partial.default = PartialMatcher;
  return partial;
}

var hasRequiredDeep;

function requireDeep() {
  if (hasRequiredDeep) return deep;
  hasRequiredDeep = 1;
  Object.defineProperty(deep, "__esModule", { value: true });
  const utils = requireUtils$1();
  const partial_1 = requirePartial();
  class DeepFilter {
    constructor(_settings, _micromatchOptions) {
      this._settings = _settings;
      this._micromatchOptions = _micromatchOptions;
    }
    getFilter(basePath, positive, negative) {
      const matcher = this._getMatcher(positive);
      const negativeRe = this._getNegativePatternsRe(negative);
      return (entry) => this._filter(basePath, entry, matcher, negativeRe);
    }
    _getMatcher(patterns) {
      return new partial_1.default(
        patterns,
        this._settings,
        this._micromatchOptions,
      );
    }
    _getNegativePatternsRe(patterns) {
      const affectDepthOfReadingPatterns = patterns.filter(
        utils.pattern.isAffectDepthOfReadingPattern,
      );
      return utils.pattern.convertPatternsToRe(
        affectDepthOfReadingPatterns,
        this._micromatchOptions,
      );
    }
    _filter(basePath, entry, matcher, negativeRe) {
      if (this._isSkippedByDeep(basePath, entry.path)) {
        return false;
      }
      if (this._isSkippedSymbolicLink(entry)) {
        return false;
      }
      const filepath = utils.path.removeLeadingDotSegment(entry.path);
      if (this._isSkippedByPositivePatterns(filepath, matcher)) {
        return false;
      }
      return this._isSkippedByNegativePatterns(filepath, negativeRe);
    }
    _isSkippedByDeep(basePath, entryPath) {
      /**
       * Avoid unnecessary depth calculations when it doesn't matter.
       */
      if (this._settings.deep === Infinity) {
        return false;
      }
      return this._getEntryLevel(basePath, entryPath) >= this._settings.deep;
    }
    _getEntryLevel(basePath, entryPath) {
      const entryPathDepth = entryPath.split("/").length;
      if (basePath === "") {
        return entryPathDepth;
      }
      const basePathDepth = basePath.split("/").length;
      return entryPathDepth - basePathDepth;
    }
    _isSkippedSymbolicLink(entry) {
      return (
        !this._settings.followSymbolicLinks && entry.dirent.isSymbolicLink()
      );
    }
    _isSkippedByPositivePatterns(entryPath, matcher) {
      return !this._settings.baseNameMatch && !matcher.match(entryPath);
    }
    _isSkippedByNegativePatterns(entryPath, patternsRe) {
      return !utils.pattern.matchAny(entryPath, patternsRe);
    }
  }
  deep.default = DeepFilter;
  return deep;
}

var entry$1 = {};

var hasRequiredEntry$1;

function requireEntry$1() {
  if (hasRequiredEntry$1) return entry$1;
  hasRequiredEntry$1 = 1;
  Object.defineProperty(entry$1, "__esModule", { value: true });
  const utils = requireUtils$1();
  class EntryFilter {
    constructor(_settings, _micromatchOptions) {
      this._settings = _settings;
      this._micromatchOptions = _micromatchOptions;
      this.index = new Map();
    }
    getFilter(positive, negative) {
      const [absoluteNegative, relativeNegative] =
        utils.pattern.partitionAbsoluteAndRelative(negative);
      const patterns = {
        positive: {
          all: utils.pattern.convertPatternsToRe(
            positive,
            this._micromatchOptions,
          ),
        },
        negative: {
          absolute: utils.pattern.convertPatternsToRe(
            absoluteNegative,
            Object.assign(Object.assign({}, this._micromatchOptions), {
              dot: true,
            }),
          ),
          relative: utils.pattern.convertPatternsToRe(
            relativeNegative,
            Object.assign(Object.assign({}, this._micromatchOptions), {
              dot: true,
            }),
          ),
        },
      };
      return (entry) => this._filter(entry, patterns);
    }
    _filter(entry, patterns) {
      const filepath = utils.path.removeLeadingDotSegment(entry.path);
      if (this._settings.unique && this._isDuplicateEntry(filepath)) {
        return false;
      }
      if (this._onlyFileFilter(entry) || this._onlyDirectoryFilter(entry)) {
        return false;
      }
      const isMatched = this._isMatchToPatternsSet(
        filepath,
        patterns,
        entry.dirent.isDirectory(),
      );
      if (this._settings.unique && isMatched) {
        this._createIndexRecord(filepath);
      }
      return isMatched;
    }
    _isDuplicateEntry(filepath) {
      return this.index.has(filepath);
    }
    _createIndexRecord(filepath) {
      this.index.set(filepath, undefined);
    }
    _onlyFileFilter(entry) {
      return this._settings.onlyFiles && !entry.dirent.isFile();
    }
    _onlyDirectoryFilter(entry) {
      return this._settings.onlyDirectories && !entry.dirent.isDirectory();
    }
    _isMatchToPatternsSet(filepath, patterns, isDirectory) {
      const isMatched = this._isMatchToPatterns(
        filepath,
        patterns.positive.all,
        isDirectory,
      );
      if (!isMatched) {
        return false;
      }
      const isMatchedByRelativeNegative = this._isMatchToPatterns(
        filepath,
        patterns.negative.relative,
        isDirectory,
      );
      if (isMatchedByRelativeNegative) {
        return false;
      }
      const isMatchedByAbsoluteNegative = this._isMatchToAbsoluteNegative(
        filepath,
        patterns.negative.absolute,
        isDirectory,
      );
      if (isMatchedByAbsoluteNegative) {
        return false;
      }
      return true;
    }
    _isMatchToAbsoluteNegative(filepath, patternsRe, isDirectory) {
      if (patternsRe.length === 0) {
        return false;
      }
      const fullpath = utils.path.makeAbsolute(this._settings.cwd, filepath);
      return this._isMatchToPatterns(fullpath, patternsRe, isDirectory);
    }
    _isMatchToPatterns(filepath, patternsRe, isDirectory) {
      if (patternsRe.length === 0) {
        return false;
      }
      // Trying to match files and directories by patterns.
      const isMatched = utils.pattern.matchAny(filepath, patternsRe);
      // A pattern with a trailling slash can be used for directory matching.
      // To apply such pattern, we need to add a tralling slash to the path.
      if (!isMatched && isDirectory) {
        return utils.pattern.matchAny(filepath + "/", patternsRe);
      }
      return isMatched;
    }
  }
  entry$1.default = EntryFilter;
  return entry$1;
}

var error = {};

var hasRequiredError;

function requireError() {
  if (hasRequiredError) return error;
  hasRequiredError = 1;
  Object.defineProperty(error, "__esModule", { value: true });
  const utils = requireUtils$1();
  class ErrorFilter {
    constructor(_settings) {
      this._settings = _settings;
    }
    getFilter() {
      return (error) => this._isNonFatalError(error);
    }
    _isNonFatalError(error) {
      return (
        utils.errno.isEnoentCodeError(error) || this._settings.suppressErrors
      );
    }
  }
  error.default = ErrorFilter;
  return error;
}

var entry = {};

var hasRequiredEntry;

function requireEntry() {
  if (hasRequiredEntry) return entry;
  hasRequiredEntry = 1;
  Object.defineProperty(entry, "__esModule", { value: true });
  const utils = requireUtils$1();
  class EntryTransformer {
    constructor(_settings) {
      this._settings = _settings;
    }
    getTransformer() {
      return (entry) => this._transform(entry);
    }
    _transform(entry) {
      let filepath = entry.path;
      if (this._settings.absolute) {
        filepath = utils.path.makeAbsolute(this._settings.cwd, filepath);
        filepath = utils.path.unixify(filepath);
      }
      if (this._settings.markDirectories && entry.dirent.isDirectory()) {
        filepath += "/";
      }
      if (!this._settings.objectMode) {
        return filepath;
      }
      return Object.assign(Object.assign({}, entry), { path: filepath });
    }
  }
  entry.default = EntryTransformer;
  return entry;
}

var hasRequiredProvider;

function requireProvider() {
  if (hasRequiredProvider) return provider;
  hasRequiredProvider = 1;
  Object.defineProperty(provider, "__esModule", { value: true });
  const path = require$$0$1;
  const deep_1 = requireDeep();
  const entry_1 = requireEntry$1();
  const error_1 = requireError();
  const entry_2 = requireEntry();
  class Provider {
    constructor(_settings) {
      this._settings = _settings;
      this.errorFilter = new error_1.default(this._settings);
      this.entryFilter = new entry_1.default(
        this._settings,
        this._getMicromatchOptions(),
      );
      this.deepFilter = new deep_1.default(
        this._settings,
        this._getMicromatchOptions(),
      );
      this.entryTransformer = new entry_2.default(this._settings);
    }
    _getRootDirectory(task) {
      return path.resolve(this._settings.cwd, task.base);
    }
    _getReaderOptions(task) {
      const basePath = task.base === "." ? "" : task.base;
      return {
        basePath,
        pathSegmentSeparator: "/",
        concurrency: this._settings.concurrency,
        deepFilter: this.deepFilter.getFilter(
          basePath,
          task.positive,
          task.negative,
        ),
        entryFilter: this.entryFilter.getFilter(task.positive, task.negative),
        errorFilter: this.errorFilter.getFilter(),
        followSymbolicLinks: this._settings.followSymbolicLinks,
        fs: this._settings.fs,
        stats: this._settings.stats,
        throwErrorOnBrokenSymbolicLink:
          this._settings.throwErrorOnBrokenSymbolicLink,
        transform: this.entryTransformer.getTransformer(),
      };
    }
    _getMicromatchOptions() {
      return {
        dot: this._settings.dot,
        matchBase: this._settings.baseNameMatch,
        nobrace: !this._settings.braceExpansion,
        nocase: !this._settings.caseSensitiveMatch,
        noext: !this._settings.extglob,
        noglobstar: !this._settings.globstar,
        posix: true,
        strictSlashes: false,
      };
    }
  }
  provider.default = Provider;
  return provider;
}

var hasRequiredAsync;

function requireAsync() {
  if (hasRequiredAsync) return async$5;
  hasRequiredAsync = 1;
  Object.defineProperty(async$5, "__esModule", { value: true });
  const async_1 = requireAsync$1();
  const provider_1 = requireProvider();
  class ProviderAsync extends provider_1.default {
    constructor() {
      super(...arguments);
      this._reader = new async_1.default(this._settings);
    }
    async read(task) {
      const root = this._getRootDirectory(task);
      const options = this._getReaderOptions(task);
      const entries = await this.api(root, task, options);
      return entries.map((entry) => options.transform(entry));
    }
    api(root, task, options) {
      if (task.dynamic) {
        return this._reader.dynamic(root, options);
      }
      return this._reader.static(task.patterns, options);
    }
  }
  async$5.default = ProviderAsync;
  return async$5;
}

var stream = {};

var hasRequiredStream;

function requireStream() {
  if (hasRequiredStream) return stream;
  hasRequiredStream = 1;
  Object.defineProperty(stream, "__esModule", { value: true });
  const stream_1 = require$$0$3;
  const stream_2 = requireStream$1();
  const provider_1 = requireProvider();
  class ProviderStream extends provider_1.default {
    constructor() {
      super(...arguments);
      this._reader = new stream_2.default(this._settings);
    }
    read(task) {
      const root = this._getRootDirectory(task);
      const options = this._getReaderOptions(task);
      const source = this.api(root, task, options);
      const destination = new stream_1.Readable({
        objectMode: true,
        read: () => {},
      });
      source
        .once("error", (error) => destination.emit("error", error))
        .on("data", (entry) =>
          destination.emit("data", options.transform(entry)),
        )
        .once("end", () => destination.emit("end"));
      destination.once("close", () => source.destroy());
      return destination;
    }
    api(root, task, options) {
      if (task.dynamic) {
        return this._reader.dynamic(root, options);
      }
      return this._reader.static(task.patterns, options);
    }
  }
  stream.default = ProviderStream;
  return stream;
}

var sync$1 = {};

var sync = {};

var hasRequiredSync$1;

function requireSync$1() {
  if (hasRequiredSync$1) return sync;
  hasRequiredSync$1 = 1;
  Object.defineProperty(sync, "__esModule", { value: true });
  const fsStat = requireOut$3();
  const fsWalk = requireOut$1();
  const reader_1 = requireReader();
  class ReaderSync extends reader_1.default {
    constructor() {
      super(...arguments);
      this._walkSync = fsWalk.walkSync;
      this._statSync = fsStat.statSync;
    }
    dynamic(root, options) {
      return this._walkSync(root, options);
    }
    static(patterns, options) {
      const entries = [];
      for (const pattern of patterns) {
        const filepath = this._getFullEntryPath(pattern);
        const entry = this._getEntry(filepath, pattern, options);
        if (entry === null || !options.entryFilter(entry)) {
          continue;
        }
        entries.push(entry);
      }
      return entries;
    }
    _getEntry(filepath, pattern, options) {
      try {
        const stats = this._getStat(filepath);
        return this._makeEntry(stats, pattern);
      } catch (error) {
        if (options.errorFilter(error)) {
          return null;
        }
        throw error;
      }
    }
    _getStat(filepath) {
      return this._statSync(filepath, this._fsStatSettings);
    }
  }
  sync.default = ReaderSync;
  return sync;
}

var hasRequiredSync;

function requireSync() {
  if (hasRequiredSync) return sync$1;
  hasRequiredSync = 1;
  Object.defineProperty(sync$1, "__esModule", { value: true });
  const sync_1 = requireSync$1();
  const provider_1 = requireProvider();
  class ProviderSync extends provider_1.default {
    constructor() {
      super(...arguments);
      this._reader = new sync_1.default(this._settings);
    }
    read(task) {
      const root = this._getRootDirectory(task);
      const options = this._getReaderOptions(task);
      const entries = this.api(root, task, options);
      return entries.map(options.transform);
    }
    api(root, task, options) {
      if (task.dynamic) {
        return this._reader.dynamic(root, options);
      }
      return this._reader.static(task.patterns, options);
    }
  }
  sync$1.default = ProviderSync;
  return sync$1;
}

var settings = {};

var hasRequiredSettings;

function requireSettings() {
  if (hasRequiredSettings) return settings;
  hasRequiredSettings = 1;
  (function (exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_FILE_SYSTEM_ADAPTER = undefined;
    const fs = require$$0$4;
    const os = require$$1$1;
    /**
     * The `os.cpus` method can return zero. We expect the number of cores to be greater than zero.
     * https://github.com/nodejs/node/blob/7faeddf23a98c53896f8b574a6e66589e8fb1eb8/lib/os.js#L106-L107
     */
    const CPU_COUNT = Math.max(os.cpus().length, 1);
    exports.DEFAULT_FILE_SYSTEM_ADAPTER = {
      lstat: fs.lstat,
      lstatSync: fs.lstatSync,
      stat: fs.stat,
      statSync: fs.statSync,
      readdir: fs.readdir,
      readdirSync: fs.readdirSync,
    };
    class Settings {
      constructor(_options = {}) {
        this._options = _options;
        this.absolute = this._getValue(this._options.absolute, false);
        this.baseNameMatch = this._getValue(this._options.baseNameMatch, false);
        this.braceExpansion = this._getValue(
          this._options.braceExpansion,
          true,
        );
        this.caseSensitiveMatch = this._getValue(
          this._options.caseSensitiveMatch,
          true,
        );
        this.concurrency = this._getValue(this._options.concurrency, CPU_COUNT);
        this.cwd = this._getValue(this._options.cwd, process.cwd());
        this.deep = this._getValue(this._options.deep, Infinity);
        this.dot = this._getValue(this._options.dot, false);
        this.extglob = this._getValue(this._options.extglob, true);
        this.followSymbolicLinks = this._getValue(
          this._options.followSymbolicLinks,
          true,
        );
        this.fs = this._getFileSystemMethods(this._options.fs);
        this.globstar = this._getValue(this._options.globstar, true);
        this.ignore = this._getValue(this._options.ignore, []);
        this.markDirectories = this._getValue(
          this._options.markDirectories,
          false,
        );
        this.objectMode = this._getValue(this._options.objectMode, false);
        this.onlyDirectories = this._getValue(
          this._options.onlyDirectories,
          false,
        );
        this.onlyFiles = this._getValue(this._options.onlyFiles, true);
        this.stats = this._getValue(this._options.stats, false);
        this.suppressErrors = this._getValue(
          this._options.suppressErrors,
          false,
        );
        this.throwErrorOnBrokenSymbolicLink = this._getValue(
          this._options.throwErrorOnBrokenSymbolicLink,
          false,
        );
        this.unique = this._getValue(this._options.unique, true);
        if (this.onlyDirectories) {
          this.onlyFiles = false;
        }
        if (this.stats) {
          this.objectMode = true;
        }
        // Remove the cast to the array in the next major (#404).
        this.ignore = [].concat(this.ignore);
      }
      _getValue(option, value) {
        return option === undefined ? value : option;
      }
      _getFileSystemMethods(methods = {}) {
        return Object.assign(
          Object.assign({}, exports.DEFAULT_FILE_SYSTEM_ADAPTER),
          methods,
        );
      }
    }
    exports.default = Settings;
  })(settings);
  return settings;
}

var out;
var hasRequiredOut;

function requireOut() {
  if (hasRequiredOut) return out;
  hasRequiredOut = 1;
  const taskManager = requireTasks();
  const async_1 = requireAsync();
  const stream_1 = requireStream();
  const sync_1 = requireSync();
  const settings_1 = requireSettings();
  const utils = requireUtils$1();
  async function FastGlob(source, options) {
    assertPatternsInput(source);
    const works = getWorks(source, async_1.default, options);
    const result = await Promise.all(works);
    return utils.array.flatten(result);
  }
  // https://github.com/typescript-eslint/typescript-eslint/issues/60
  // eslint-disable-next-line no-redeclare
  (function (FastGlob) {
    FastGlob.glob = FastGlob;
    FastGlob.globSync = sync;
    FastGlob.globStream = stream;
    FastGlob.async = FastGlob;
    function sync(source, options) {
      assertPatternsInput(source);
      const works = getWorks(source, sync_1.default, options);
      return utils.array.flatten(works);
    }
    FastGlob.sync = sync;
    function stream(source, options) {
      assertPatternsInput(source);
      const works = getWorks(source, stream_1.default, options);
      /**
       * The stream returned by the provider cannot work with an asynchronous iterator.
       * To support asynchronous iterators, regardless of the number of tasks, we always multiplex streams.
       * This affects performance (+25%). I don't see best solution right now.
       */
      return utils.stream.merge(works);
    }
    FastGlob.stream = stream;
    function generateTasks(source, options) {
      assertPatternsInput(source);
      const patterns = [].concat(source);
      const settings = new settings_1.default(options);
      return taskManager.generate(patterns, settings);
    }
    FastGlob.generateTasks = generateTasks;
    function isDynamicPattern(source, options) {
      assertPatternsInput(source);
      const settings = new settings_1.default(options);
      return utils.pattern.isDynamicPattern(source, settings);
    }
    FastGlob.isDynamicPattern = isDynamicPattern;
    function escapePath(source) {
      assertPatternsInput(source);
      return utils.path.escape(source);
    }
    FastGlob.escapePath = escapePath;
    function convertPathToPattern(source) {
      assertPatternsInput(source);
      return utils.path.convertPathToPattern(source);
    }
    FastGlob.convertPathToPattern = convertPathToPattern;
    (function (posix) {
      function escapePath(source) {
        assertPatternsInput(source);
        return utils.path.escapePosixPath(source);
      }
      posix.escapePath = escapePath;
      function convertPathToPattern(source) {
        assertPatternsInput(source);
        return utils.path.convertPosixPathToPattern(source);
      }
      posix.convertPathToPattern = convertPathToPattern;
    })(FastGlob.posix || (FastGlob.posix = {}));
    (function (win32) {
      function escapePath(source) {
        assertPatternsInput(source);
        return utils.path.escapeWindowsPath(source);
      }
      win32.escapePath = escapePath;
      function convertPathToPattern(source) {
        assertPatternsInput(source);
        return utils.path.convertWindowsPathToPattern(source);
      }
      win32.convertPathToPattern = convertPathToPattern;
    })(FastGlob.win32 || (FastGlob.win32 = {}));
  })(FastGlob);
  function getWorks(source, _Provider, options) {
    const patterns = [].concat(source);
    const settings = new settings_1.default(options);
    const tasks = taskManager.generate(patterns, settings);
    const provider = new _Provider(settings);
    return tasks.map(provider.read, provider);
  }
  function assertPatternsInput(input) {
    const source = [].concat(input);
    const isValidSource = source.every(
      (item) => utils.string.isString(item) && !utils.string.isEmpty(item),
    );
    if (!isValidSource) {
      throw new TypeError(
        "Patterns must be a string (non empty) or an array of strings",
      );
    }
  }
  out = FastGlob;
  return out;
}

requireOut();

nodePath.posix.join;

/**
 * The edge function calls the node server at /_render,
 * with the original path as the value of this header.
 */
const ASTRO_PATH_HEADER = "x-astro-path";
const ASTRO_PATH_PARAM = "x_astro_path";
/**
 * The edge function calls the node server at /_render,
 * with the locals serialized into this header.
 */
const ASTRO_LOCALS_HEADER = "x-astro-locals";
const ASTRO_MIDDLEWARE_SECRET_HEADER = "x-astro-middleware-secret";

// Keep at the top
const createExports = (manifest, { middlewareSecret, skewProtection }) => {
  const app = new NodeApp(manifest);
  const handler = async (req, res) => {
    const url = new URL(`https://example.com${req.url}`);
    const clientAddress = req.headers["x-forwarded-for"];
    const localsHeader = req.headers[ASTRO_LOCALS_HEADER];
    const middlewareSecretHeader = req.headers[ASTRO_MIDDLEWARE_SECRET_HEADER];
    const realPath =
      req.headers[ASTRO_PATH_HEADER] ?? url.searchParams.get(ASTRO_PATH_PARAM);
    if (typeof realPath === "string") {
      req.url = realPath;
    }
    let locals = {};
    if (localsHeader) {
      if (middlewareSecretHeader !== middlewareSecret) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }
      locals =
        typeof localsHeader === "string"
          ? JSON.parse(localsHeader)
          : JSON.parse(localsHeader[0]);
    }
    // hide the secret from the rest of user code
    delete req.headers[ASTRO_MIDDLEWARE_SECRET_HEADER];
    // https://vercel.com/docs/deployments/skew-protection#supported-frameworks
    if (skewProtection && process.env.VERCEL_SKEW_PROTECTION_ENABLED === "1") {
      req.headers["x-deployment-id"] = process.env.VERCEL_DEPLOYMENT_ID;
    }
    const webResponse = await app.render(req, {
      addCookieHeader: true,
      clientAddress,
      locals,
    });
    await NodeApp.writeResponse(webResponse, res);
  };
  return { default: handler };
};
// HACK: prevent warning
// @astrojs-ssr-virtual-entry (22:23) "start" is not exported by "dist/serverless/entrypoint.js", imported by "@astrojs-ssr-virtual-entry".
function start() {}

export { createExports as c, start as s };
