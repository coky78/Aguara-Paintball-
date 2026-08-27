export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    });
  }

  const { username, password } = req.body || {};

  const validUser = "aguarapaintball";
  const validPassword = process.env.ADMIN_PASSWORD;

  const userOK = username === validUser;
  const passwordConfigured = Boolean(validPassword);
  const passwordReceived = Boolean(password);
  const passwordOK =
    passwordConfigured && password === validPassword;

  if (userOK && passwordOK) {
    return res.status(200).json({
      ok: true
    });
  }

  return res.status(401).json({
    ok: false,
    userOK,
    passwordConfigured,
    passwordReceived,
    passwordOK
  });
}
