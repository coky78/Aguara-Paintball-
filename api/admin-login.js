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
  const passwordExists = Boolean(validPassword);
  const passwordOK =
    passwordExists && password === validPassword;

  return res.status(200).json({
    ok: userOK && passwordOK,
    userOK: userOK,
    passwordReceived: Boolean(password),
    passwordConfigured: passwordExists,
    passwordOK: passwordOK
  });
}
