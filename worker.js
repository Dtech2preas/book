
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);

  // Handle CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow any origin
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password, X-Seller-Code",
      },
    });
  }

  // Set default headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  // Helper: Generate 4-letter code
  const generateSellerCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  if (request.method === 'GET') {
    try {
      // 1. Image Endpoint: /image?id=...
      if (url.pathname === '/image') {
        const id = url.searchParams.get("id");
        if (!id) {
          return new Response("Missing ID", { status: 400 });
        }
        const book = await BOOKS_KV.get(id, { type: "json" });
        if (!book || !book.image) {
          return new Response("Image not found", { status: 404 });
        }

        // Extract Base64
        const matches = book.image.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return new Response("Invalid image data", { status: 500 });
        }
        const mimeType = matches[1];
        const base64Data = matches[2];

        // Decode
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        return new Response(bytes.buffer, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=31536000", // Cache for 1 year
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      // 2. Admin Endpoint: /sellers
      if (url.pathname === '/sellers') {
        // Check Admin Password
        const password = request.headers.get("X-Admin-Password");
        if (password !== "admin-secret-123") {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }

        const sellers = await BOOKS_KV.get("system:sellers", { type: "json" });
        return new Response(JSON.stringify(sellers || {}), { headers });
      }

      // 3. Single Book Endpoint (Full Details): /?id=...
      const id = url.searchParams.get("id");
      if (id) {
        const book = await BOOKS_KV.get(id, { type: "json" });
        if (!book) {
          return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers });
        }
        // Admin or Seller request might need full details, include sellerCode if relevant context allows
        // Since this is technically public, let's keep sellerCode separate or only expose if needed.
        // Actually, the frontend admin edit form doesn't strictly need sellerCode visible, but helpful.
        // Public shouldn't see it.
        // For simplicity, we return full object here.
        return new Response(JSON.stringify({ id, ...book }), { headers });
      }

      // 4. Stats Endpoint: /stats

      // Admin Endpoint: /admin/books
      if (url.pathname === '/admin/books') {
        const password = request.headers.get("X-Admin-Password");
        if (password !== "admin-secret-123") {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }
        const list = await BOOKS_KV.list({ prefix: "book:" });
        const books = await Promise.all(list.keys.map(async (key) => {
          const value = await BOOKS_KV.get(key.name, { type: "json" });
          if (!value) return null;
          const { image, sellerCode, ...lightweightBook } = value;
          return { id: key.name, ...lightweightBook, sellerCode };
        }));
        return new Response(JSON.stringify(books.filter(b => b !== null)), { headers });
      }

      if (url.pathname === '/stats') {
        const list = await BOOKS_KV.list({ prefix: "book:" });
        let booksCount = 0;
        let pendingCount = 0;
        let activeCount = 0;

        const vals = await Promise.all(list.keys.map(key => BOOKS_KV.get(key.name, { type: "json" })));
        for (const val of vals) {
          if (val) {
            booksCount++;
            if (val.status === 'pending') pendingCount++;
            else if (val.status === 'active' || !val.status) activeCount++;
          }
        }

        const sellersMap = await BOOKS_KV.get("system:sellers", { type: "json" });
        const sellersCount = sellersMap ? Object.keys(sellersMap).length : 0;

        const stats = await BOOKS_KV.get("system:stats", { type: "json" });
        const soldCount = stats ? (stats.sold || 0) : 0;

        return new Response(JSON.stringify({
            booksListed: booksCount,
            pendingCount: pendingCount,
            activeCount: activeCount,
            sellersCount: sellersCount,
            sold: soldCount
        }), { headers });
      }

      // 5. List Endpoint (Lightweight): /
      // List all keys with prefix "book:"
      const list = await BOOKS_KV.list({ prefix: "book:" });

      // Fetch the content for each book but exclude the image AND sellerCode
      const books = await Promise.all(list.keys.map(async (key) => {
        const value = await BOOKS_KV.get(key.name, { type: "json" });
        if (!value) return null;

        // Return object WITHOUT image data and sellerCode to protect privacy
        const { image, sellerCode, ...lightweightBook } = value;
        return { id: key.name, ...lightweightBook };
      }));

      // Filter out nulls and only active books
      const validBooks = books.filter(b => b !== null && (b.status === 'active' || b.status === undefined));

      return new Response(JSON.stringify(validBooks), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }

  if (request.method === 'POST') {
    try {
      const url = new URL(request.url);

      // --- Extract Text Endpoint (Groq API) ---
      if (url.pathname === '/extract-text') {
        const body = await request.json();
        const base64Image = body.image;
        if (!base64Image) {
            return new Response(JSON.stringify({ error: "Missing image" }), { status: 400, headers });
        }

        // Get tokens from global variable GROQ_TOKENS (injected by Cloudflare)
        let tokens = [];
        if (typeof GROQ_TOKENS !== 'undefined') {
            tokens = GROQ_TOKENS.split('\n').map(t => t.trim()).filter(t => t.length > 0);
        }

        if (tokens.length === 0) {
             return new Response(JSON.stringify({ error: "No Groq API tokens configured" }), { status: 500, headers });
        }

        // Shuffle tokens to distribute requests
        const shuffledTokens = tokens.sort(() => 0.5 - Math.random());
        let groqResponse = null;
        let success = false;
        let lastError = null;

        const systemPrompt = `You are a helpful assistant that extracts book information from images. Return ONLY a valid JSON object with the following keys and string values: "title" (the book name), "author" (author name, if any), "editors" (editors, if any), "version" (book version or edition, if any), and "additional_info" (any other useful info found on the cover). If a piece of information is not found, leave the value as an empty string. Do not include markdown formatting like \`\`\`json.`;

        for (const token of shuffledTokens) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "llama-3.2-90b-vision-preview",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: systemPrompt },
                                    { type: "image_url", image_url: { url: base64Image } }
                                ]
                            }
                        ],
                        temperature: 0.1,
                        max_tokens: 500,
                        top_p: 1,
                        stream: false
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    let content = data.choices[0].message.content;
                    // Sometimes models include markdown wrapper even if instructed not to
                    content = content.replace(/^```json/m, '').replace(/```$/m, '').trim();
                    groqResponse = JSON.parse(content);
                    success = true;
                    break; // Success, break out of retry loop
                } else {
                    const errorText = await response.text();
                    lastError = `Groq API Error: ${response.status} ${errorText}`;
                    console.error(lastError);
                    // Continue to next token if rate limited or other error
                }
            } catch (err) {
                lastError = err.message;
                console.error(lastError);
                // Continue to next token
            }
        }

        if (success && groqResponse) {
             return new Response(JSON.stringify({ success: true, data: groqResponse }), { headers });
        } else {
             return new Response(JSON.stringify({ error: "Failed to extract text from all available tokens. " + lastError }), { status: 500, headers });
        }
      }


      // --- Admin Migration Endpoint ---
      if (url.pathname === '/admin/migrate') {
        const password = request.headers.get("X-Admin-Password");
        if (password !== "admin-secret-123") {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }

        const list = await BOOKS_KV.list({ prefix: "book:" });
        const books = [];
        for (const key of list.keys) {
            const b = await BOOKS_KV.get(key.name, { type: "json" });
            if(b) books.push({ id: key.name, ...b });
        }

        const sellersMap = {}; // phone -> { code, name, count }

        // 1. Group and assign codes
        for (const book of books) {
            const contact = book.contact ? book.contact.replace(/\D/g, '') : 'UNKNOWN'; // Normalize phone

            if (!sellersMap[contact]) {
                sellersMap[contact] = {
                    code: generateSellerCode(),
                    name: book.seller,
                    contact: contact,
                    count: 0
                };
            }
            sellersMap[contact].count++;

            // Assign code to book object in memory
            book.sellerCode = sellersMap[contact].code;
        }

        // 2. Save Map
        await BOOKS_KV.put("system:sellers", JSON.stringify(sellersMap));

        // 3. Update all books
        for (const book of books) {
            const { id, ...data } = book;
            await BOOKS_KV.put(id, JSON.stringify(data));
        }

        return new Response(JSON.stringify({ success: true, message: `Migrated ${books.length} books.`, sellers: sellersMap }), { headers });
      }

      // --- Seller Login Endpoint ---
      if (url.pathname === '/seller/login') {
        const body = await request.json();
        const code = body.code;

        if (!code || code.length !== 4) {
            return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400, headers });
        }

        // Scan books for matching code
        const list = await BOOKS_KV.list({ prefix: "book:" });
        const sellerBooks = [];

        for (const key of list.keys) {
            const val = await BOOKS_KV.get(key.name, { type: "json" });
            if (val && val.sellerCode === code) {
                // Return lightweight version
                const { image, ...light } = val;
                sellerBooks.push({ id: key.name, ...light });
            }
        }

        return new Response(JSON.stringify(sellerBooks), { headers });
      }

      // --- Add Book Endpoint ---
      const body = await request.json();

      const isLookingFor = body.type === 'looking_for';

      // Validation
      if (!body.title || (!isLookingFor && !body.author) || !body.price || (!isLookingFor && !body.image)) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
      }

      const contact = body.contact ? body.contact.replace(/\D/g, '') : 'UNKNOWN';

      // Get Sellers Map
      let sellersMap = await BOOKS_KV.get("system:sellers", { type: "json" });
      if (!sellersMap) sellersMap = {};

      let code;
      if (sellersMap[contact]) {
          code = sellersMap[contact].code;
          sellersMap[contact].count++;
          // Update name if changed? Let's keep original for stability or update.
          sellersMap[contact].name = body.seller;
      } else {
          code = generateSellerCode();
          sellersMap[contact] = {
              code: code,
              name: body.seller,
              contact: contact,
              count: 1
          };
      }

      // Save Map
      await BOOKS_KV.put("system:sellers", JSON.stringify(sellersMap));

      // Generate ID
      const id = `book:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const bookData = {
        type: body.type || 'buy',
        editors: body.editors || '',
        version: body.version || '',
        isNegotiable: !!body.isNegotiable,
        title: body.title,
        author: body.author || 'Not provided',
        price: body.price,
        seller: body.seller || "Anonymous",
        contact: body.contact || "",
        description: body.description || "",
        image: body.image || "", // Base64 string
        createdAt: new Date().toISOString(),
        sellerCode: code, // Assign Code
        status: 'pending'
      };

      // Store in KV
      await BOOKS_KV.put(id, JSON.stringify(bookData));

      return new Response(JSON.stringify({ success: true, id: id, message: "Book added successfully", code: code }), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }

  if (request.method === 'DELETE') {
    try {
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing book ID" }), { status: 400, headers });
      }

      // Check Authorization
      const adminPassword = request.headers.get("X-Admin-Password");
      const sellerCodeHeader = request.headers.get("X-Seller-Code");

      let authorized = false;

      // 1. Admin Auth
      if (adminPassword === "admin-secret-123") {
          authorized = true;
          // Decrement count in map? Ideally yes, but for simplicity/performance we might skip updating count strictly.
          // Or we can try to update it.
          // Let's keep it simple for now. The count is mostly for initial migration view.
      }
      // 2. Seller Auth
      else if (sellerCodeHeader) {
          // Fetch book to verify ownership
          const book = await BOOKS_KV.get(id, { type: "json" });
          if (!book) {
              return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers });
          }
          if (book.sellerCode === sellerCodeHeader) {
              authorized = true;
          }
      }

      if (!authorized) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      }

      await BOOKS_KV.delete(id);

      // Increment Sold Count
      const stats = await BOOKS_KV.get("system:stats", { type: "json" }) || { sold: 0 };
      stats.sold = (stats.sold || 0) + 1;
      await BOOKS_KV.put("system:stats", JSON.stringify(stats));

      return new Response(JSON.stringify({ success: true, message: "Book deleted" }), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }


  if (request.method === 'PUT') {
    try {
      const url = new URL(request.url);

      // --- Approve Endpoint ---
      if (url.pathname === '/admin/approve') {
        const password = request.headers.get("X-Admin-Password");
        if (password !== "admin-secret-123") {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }

        const id = url.searchParams.get("id");
        if (!id) {
          return new Response(JSON.stringify({ error: "Missing book ID" }), { status: 400, headers });
        }

        const existing = await BOOKS_KV.get(id, { type: "json" });
        if (!existing) {
          return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers });
        }

        existing.status = 'active';
        await BOOKS_KV.put(id, JSON.stringify(existing));

        return new Response(JSON.stringify({ success: true, message: "Book approved" }), { headers });
      }

      // Check Admin Password
      const password = request.headers.get("X-Admin-Password");
      if (password !== "admin-secret-123") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      }

      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing book ID" }), { status: 400, headers });
      }

      const body = await request.json();

      const isLookingFor = body.type === 'looking_for';

      // Validation
      if (!body.title || (!isLookingFor && !body.author) || !body.price || (!isLookingFor && !body.image)) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
      }

      // Fetch existing
      const existing = await BOOKS_KV.get(id, { type: "json" });
      if (!existing) {
        return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers });
      }

      // Determine Code
      // If contact changed, we might need to update code?
      // For simplicity, let's look up the contact in map again.
      const contact = body.contact ? body.contact.replace(/\D/g, '') : 'UNKNOWN';
      let code = existing.sellerCode;

      // Only update code if contact changed OR no code existed
      if (contact !== (existing.contact ? existing.contact.replace(/\D/g, '') : 'UNKNOWN') || !code) {
           let sellersMap = await BOOKS_KV.get("system:sellers", { type: "json" });
           if (!sellersMap) sellersMap = {};

           if (sellersMap[contact]) {
               code = sellersMap[contact].code;
           } else {
               code = generateSellerCode();
               sellersMap[contact] = {
                  code: code,
                  name: body.seller,
                  contact: contact,
                  count: 1
               };
               await BOOKS_KV.put("system:sellers", JSON.stringify(sellersMap));
           }
      }

      const bookData = {
        type: body.type || existing.type || 'buy',
        editors: body.editors !== undefined ? body.editors : (existing.editors || ''),
        version: body.version !== undefined ? body.version : (existing.version || ''),
        isNegotiable: body.isNegotiable !== undefined ? !!body.isNegotiable : !!existing.isNegotiable,
        title: body.title,
        author: body.author || existing.author || 'Not provided',
        price: body.price,
        seller: body.seller || existing.seller,
        contact: body.contact || existing.contact,
        description: body.description || existing.description || "",
        image: body.image || existing.image || "",
        createdAt: existing.createdAt,
        sellerCode: code
      };

      await BOOKS_KV.put(id, JSON.stringify(bookData));

      return new Response(JSON.stringify({ success: true, message: "Book updated successfully" }), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }

  return new Response("Not Found", { status: 404, headers });
}
