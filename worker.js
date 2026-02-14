
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const ALLOWED_ORIGIN = 'https://books.dtech-services.co.za'; // Or '*' for development

async function handleRequest(request) {
  const url = new URL(request.url);

  // Handle CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow any origin for now to simplify
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
      },
    });
  }

  // Set default headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (request.method === 'GET') {
    try {
      // List all keys with prefix "book:"
      const list = await BOOKS_KV.list({ prefix: "book:" });

      // Fetch the content for each book
      // Note: In a production app with many items, you'd want pagination or separate image fetching.
      // Here we fetch all at once for simplicity as requested.
      const books = await Promise.all(list.keys.map(async (key) => {
        const value = await BOOKS_KV.get(key.name, { type: "json" });
        return value ? { id: key.name, ...value } : null;
      }));

      // Filter out nulls
      const validBooks = books.filter(b => b !== null);

      return new Response(JSON.stringify(validBooks), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }

  if (request.method === 'POST') {
    try {
      // Check Admin Password
      const password = request.headers.get("X-Admin-Password");
      if (password !== "admin-secret-123") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      }

      const body = await request.json();

      // Validation
      if (!body.title || !body.author || !body.price || !body.image) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
      }

      // Generate ID
      const id = `book:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const bookData = {
        title: body.title,
        author: body.author,
        price: body.price,
        seller: body.seller || "Anonymous",
        contact: body.contact || "",
        description: body.description || "",
        image: body.image, // Base64 string
        createdAt: new Date().toISOString()
      };

      // Store in KV
      await BOOKS_KV.put(id, JSON.stringify(bookData));

      return new Response(JSON.stringify({ success: true, id: id, message: "Book added successfully" }), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }

  return new Response("Not Found", { status: 404, headers });
}
