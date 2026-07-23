exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, source, tag } = JSON.parse(event.body);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Valid email required" }) };
    }

    const apiKey = process.env.FUB_API_KEY; // set this in Netlify's dashboard, never in code
    const authHeader = "Basic " + Buffer.from(apiKey + ":").toString("base64");

    const fubResponse = await fetch("https://api.followupboss.com/v1/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify({
        source: source || "Landing Page",
        type: "General Inquiry",
        message: "New lead from landing page form.",
        person: {
          emails: [{ value: email }],
          tags: [tag || "lead"]
        }
      })
    });

    if (!fubResponse.ok) {
      const errText = await fubResponse.text();
      return { statusCode: fubResponse.status, body: JSON.stringify({ error: errText }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

