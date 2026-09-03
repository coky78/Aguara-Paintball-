import assert from "node:assert/strict";
import test from "node:test";
import { buildSignedUploadUrl } from "../lib/home-media-upload-url.js";

test("buildSignedUploadUrl builds the Supabase signed upload URL on the server", () => {
  const url = buildSignedUploadUrl(
    "https://example.supabase.co/",
    "site-media",
    "home_media_1/abc-foto.jpg",
    "signed-token"
  );

  assert.equal(
    url,
    "https://example.supabase.co/storage/v1/object/upload/sign/site-media/home_media_1/abc-foto.jpg?token=signed-token"
  );
});

test("buildSignedUploadUrl encodes token and path safely", () => {
  const url = buildSignedUploadUrl(
    "https://example.supabase.co",
    "site-media",
    "home_media_1/a b.jpg",
    "token+/="
  );

  assert.equal(
    url,
    "https://example.supabase.co/storage/v1/object/upload/sign/site-media/home_media_1/a%20b.jpg?token=token%2B%2F%3D"
  );
});
