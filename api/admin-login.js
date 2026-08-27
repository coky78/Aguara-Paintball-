export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  const { username, password } = req.body || {};

  const validUser = "aguarapaintball";
  const validPassword = process.env.ADMIN_PASSWORD;

  if (username === validUser && password === validPassword) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({
    ok: false,
    message: "Usuario o contraseña incorrectos"
  });
}
