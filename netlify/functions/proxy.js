const https = require("https");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Chave API não configurada." }) };
  }

  try {
    const payload = JSON.parse(event.body);
    const body = JSON.stringify(payload);
    const path = `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: "generativelanguage.googleapis.com",
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      });

      req.on("error", reject);
      req.write(body);
      req.end();
    });

    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json" },
      body: response.body
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno: " + err.message })
    };
  }
};
