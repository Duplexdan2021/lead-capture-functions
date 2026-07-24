exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const { email, source, tag } = JSON.parse(event.body);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid email" }) };
    }

    const authHeader = "Basic " + Buffer.from(process.env.FUB_API_KEY + ":").toString("base64");

    const response = await fetch("https://api.followupboss.com/v1/events", {
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

    if (!response.ok) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to create lead" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};

if (false) exports.handler = async (event) => {
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

