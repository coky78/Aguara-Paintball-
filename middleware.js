/* =====================================================
   AGUARÁ PAINTBALL
   VERCEL ROUTING MIDDLEWARE
   Protege las operaciones administrativas de las APIs.

   La sesión se firma con ADMIN_PASSWORD, por lo que no
   hace falta agregar otra variable secreta en Vercel.
===================================================== */

import { NextResponse } from "next/server";

export const config = {
  matcher: ["/api/:path*"],
  runtime: "edge"
};

const COOKIE_NAME = "aguara_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function parseCookies(header) {
  const cookies = {};
  for (const part of String(header || "").split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    cookies[key] = value;
  }
  return cookies;
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function signature(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

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

  if (!Number.isInteger(expires) || expires <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = await signature(secret, expiresText);
  return expected === receivedSignature;
}

function unauthorized() {
  return Response.json(
    {
      ok: false,
      message: "No autorizado. Iniciá sesión como administrador."
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  // Login, comprobantes y disponibilidad pública son endpoints públicos.
  if (
    path === "/api/admin-login" ||
    path === "/api/upload-receipt" ||
    path === "/api/public-reservations"
  ) {
    return;
  }

  // Las consultas públicas de configuración y multimedia no exponen secretos.
  if (path === "/api/config" && method === "GET") {
    return;
  }

  if (path === "/api/media" && method === "GET") {
    return;
  }

  // El calendario público necesita consultar solamente fecha y horario.
  // Los datos completos de /api/reservations siguen protegidos.
  if (path === "/api/reservations" && method === "GET") {
    if (await isValidSession(request)) {
      return;
    }

    return NextResponse.rewrite(
      new URL("/api/public-reservations", request.url)
    );
  }

  // Crear una reserva es público; modificar/eliminar es administrativo.
  if (path === "/api/reservations" && method === "POST") {
    return;
  }

  if (await isValidSession(request)) {
    return;
  }

  return unauthorized();
}
