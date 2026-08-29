export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }

  res.setHeader(
    "Set-Cookie",
    "aguara_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" +
      (process.env.VERCEL_ENV ? "; Secure" : "")
  );

  return res.status(200).json({ ok: true });
}
