function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

export default async function handler(req, res) {
  return sendJson(res, 200, {
    ok: true,
    message: "upload-receipt funciona correctamente"
  });
}
