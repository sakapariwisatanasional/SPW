// SPWN GAS Proxy
// Vercel Free Compatible
// Direct GAS URL configuration

const SPW_GAS_URL =
  "https://script.google.com/macros/s/AKfycbzuR8k2KbXHb6om2eNaIGM3yBBBsZtEFoLKji1H2dAWp4a6v8nrBAbwQj_S5S-SPBtXOg/exec";

export default async function handler(req, res) {
  try {
    if (!SPW_GAS_URL) {
      return res.status(500).json({
        success: false,
        message: "SPW GAS URL belum dikonfigurasi"
      });
    }

    const method = req.method || "GET";

    let url = SPW_GAS_URL;

    // Teruskan query parameter
    if (req.url.includes("?")) {
      const query = req.url.split("?")[1];
      url += "?" + query;
    }

    const headers = {
      "Content-Type": "application/json"
    };

    // Teruskan authorization jika ada
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const options = {
      method,
      headers
    };

    // POST body
    if (method !== "GET" && req.body) {
      options.body =
        typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body);
    }

    const response = await fetch(url, options);

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        success: false,
        message: text
      };
    }

    return res.status(response.status).json(data);

  } catch (error) {

    console.error("SPWN GAS Proxy Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Proxy GAS gagal"
    });
  }
}
