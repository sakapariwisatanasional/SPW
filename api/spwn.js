export default async function handler(req, res) {
  try {
    const GAS_URL = process.env.SPWN_GAS_URL;

    if (!GAS_URL) {
      return res.status(500).json({
        success: false,
        message: "SPWN_GAS_URL belum dikonfigurasi"
      });
    }

    const action =
      req.query.action ||
      req.body?.action ||
      "";

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Action tidak ditemukan"
      });
    }

    let body = undefined;

    if (req.method === "POST") {
      body =
        typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body || {});
    }

    const forwardHeaders = {
      "Content-Type":
        req.headers["content-type"] ||
        "application/json",

      "Accept":
        "application/json"
    };

    if (req.headers.authorization) {
      forwardHeaders["Authorization"] =
        req.headers.authorization;
    }

    const gasUrl = new URL(GAS_URL);

    gasUrl.searchParams.set(
      "action",
      action
    );

    const response = await fetch(
      gasUrl.toString(),
      {
        method: req.method,
        headers: forwardHeaders,
        body
      }
    );

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = {
        success: false,
        message: "Response GAS bukan JSON",
        raw: text
      };
    }

    return res
      .status(response.status)
      .json(result);

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message || "Proxy error"
    });

  }
}
