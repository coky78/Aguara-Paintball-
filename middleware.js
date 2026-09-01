/* =====================================================
   AGUARÁ PAINTBALL
   VERCEL ROUTING MIDDLEWARE
   Protege las operaciones administrativas de las APIs.
===================================================== */

import { next } from "@vercel/functions";

export const config = {
  matcher: ["/api/:path*"],
  runtime: "edge"
};

const COOKIE_NAME = "aguara_admin_session";

function parseCookies(header) {
  const cookies = {};
  for (const part of String(header || "").split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    cookies[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  return cookies;
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signature(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64Url(new Uint8Array(signed));
}

async function isValidSession(request) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;

  const cookies = parseCookies(request.headers.get("cookie"));
  const value = cookies[COOKIE_NAME];
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 2) return false;

  const [expiresText, receivedSignature] = parts;
  const expires = Number(expiresText);
  if (!/^\d+$/.test(expiresText) || !Number.isInteger(expires) || expires <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = await signature(secret, expiresText);
  return expected === receivedSignature;
}

function unauthorized() {
  return new Response(
    JSON.stringify({ ok: false, message: "No autorizado. Iniciá sesión como administrador." }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  if (
    path === "/api/admin-login" ||
    path === "/api/upload-receipt" ||
    path === "/api/public-reservations"
  ) {
    return next();
  }

  if (path === "/api/config" && method === "GET") return next();
  if (path === "/api/media" && method === "GET") return next();

  if (path === "/api/reservations" && method === "GET") {
    if (await isValidSession(request)) return next();
    return Response.redirect(new URL("/api/public-reservations", request.url), 307);
  }

  if (path === "/api/reservations" && method === "POST") return next();

  if (await isValidSession(request)) return next();
  return unauthorized();
}
