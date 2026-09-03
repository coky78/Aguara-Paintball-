export function buildSignedUploadUrl(supabaseUrl, bucket, path, token) {
  const base = String(supabaseUrl || "").replace(/\/$/, "");
  const encodedPath = String(path || "").split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/upload/sign/${encodeURIComponent(bucket)}/${encodedPath}?token=${encodeURIComponent(token || "")}`;
}
