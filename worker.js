
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event))
})

async function handleRequest(request, event) {
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

      // --- Admin List Ambassadors ---
      if (url.pathname === '/admin/ambassadors') {
        const password = request.headers.get("X-Admin-Password");
        if (password !== (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }

        const list = await BOOKS_KV.list({ prefix: "amb:" });
        const ambassadors = [];
        for (const key of list.keys) {
            const val = await BOOKS_KV.get(key.name, { type: "json" });
            if (val) {
                const statKey = "amb_stats:" + val.id;
                const stats = await BOOKS_KV.get(statKey, { type: "json" }) || { installs: 0, views: 0, listings: 0, purchases: 0 };
                const { password: _, ...safeData } = val;
                ambassadors.push({ ...safeData, stats });
            }
        }

        // Also get active keys
        const keysList = await BOOKS_KV.list({ prefix: "ambassador_key:" });
        const activeKeys = keysList.keys.map(k => k.name.split(':')[1]);

        return new Response(JSON.stringify({ ambassadors, activeKeys }), { headers });
      }

      // --- Ambassador Stats Endpoint ---
      if (url.pathname === '/ambassador/stats') {
          const authHeader = request.headers.get("Authorization");
          if (!authHeader || !authHeader.startsWith("Bearer ")) {
              return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
          }
          const token = authHeader.split(" ")[1];
          let ambId;
          try {
              ambId = atob(token).split(":")[0];
          } catch(e) {
              return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers });
          }

          const statKey = "amb_stats:" + ambId;
          const stats = await BOOKS_KV.get(statKey, { type: "json" }) || { installs: 0, views: 0, listings: 0, purchases: 0 };
          return new Response(JSON.stringify({ success: true, stats }), { headers });
      }

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
        if (password !== (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
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
      // --- Admin Register FCM Token ---
      if (url.pathname === '/admin/register-fcm-token' && request.method === 'POST') {
        const password = request.headers.get("X-Admin-Password");
        if (password !== (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }
        const body = await request.json();
        if (body.token) {
          const tokensStr = await BOOKS_KV.get("system:fcm_tokens");
          let tokens = tokensStr ? JSON.parse(tokensStr) : [];
          if (!tokens.includes(body.token)) {
            tokens.push(body.token);
            await BOOKS_KV.put("system:fcm_tokens", JSON.stringify(tokens));
          }
          return new Response(JSON.stringify({ success: true }), { headers });
        }
        return new Response(JSON.stringify({ error: "No token provided" }), { status: 400, headers });
      }

      if (url.pathname === '/admin/books') {
        const password = request.headers.get("X-Admin-Password");
        if (password !== (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
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

      // --- Admin Reports ---
      if (url.pathname === '/admin/reports') {
        const password = request.headers.get("X-Admin-Password");
        if (password !== (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }
        const list = await BOOKS_KV.list({ prefix: "report:" });
        const reports = await Promise.all(list.keys.map(async (key) => {
          const value = await BOOKS_KV.get(key.name, { type: "json" });
          if (!value) return null;
          return { id: key.name, ...value };
        }));
        return new Response(JSON.stringify(reports.filter(r => r !== null)), { headers });
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

        // Fetch external visitors
        let visitorsCount = 0;
        const currentUrl = url.hostname; // Default to hostname if not passed
        const targetUrl = url.searchParams.get("url") || currentUrl;
        try {
            const extRes = await fetch(`https://late-salad-779e.lefa4082.workers.dev/?url=${encodeURIComponent(targetUrl)}`);
            if (extRes.ok) {
                const extData = await extRes.json();
                visitorsCount = parseInt(extData.site_views) || 0;
            }
        } catch(e) {
            console.error("External counter fetch failed", e);
        }

        // Handle daily aggregates
        let dailyStats = await BOOKS_KV.get("system:daily_stats", { type: "json" });
        if (!dailyStats) dailyStats = {};

        const today = new Date().toISOString().split('T')[0];
        const launchDate = "2026-02-20";

        if (!dailyStats[today]) {
            dailyStats[today] = { visitors: 0, sold: 0, sellers: 0 };
        }
        if (!dailyStats[launchDate]) {
            dailyStats[launchDate] = { visitors: 0, sold: 0, sellers: 0 };
        }

        // Calculate visitor difference and update daily visitors FIRST
        const lastTotalVisitors = (stats && stats.lastTotalVisitors) ? stats.lastTotalVisitors : 0;
        let statsUpdated = false;

        if (visitorsCount > lastTotalVisitors) {
             if (lastTotalVisitors === 0) {
                 // First time fetching, backfill all visitors to launch date
                 dailyStats[launchDate].visitors += visitorsCount;
             } else {
                 const diff = visitorsCount - lastTotalVisitors;
                 dailyStats[today].visitors += diff;
             }

             // Save the new total back to system:stats
             let newStats = stats || {};
             newStats.lastTotalVisitors = visitorsCount;
             await BOOKS_KV.put("system:stats", JSON.stringify(newStats));
             statsUpdated = true;
        }

        // Sum current daily stats
        let sumSold = 0;
        let sumSellers = 0;
        let sumVisitors = 0;
        for (const date in dailyStats) {
            sumSold += (dailyStats[date].sold || 0);
            sumSellers += (dailyStats[date].sellers || 0);
            sumVisitors += (dailyStats[date].visitors || 0);
        }

        // Backfill sold and sellers and visitors
        if (soldCount > sumSold) {
            dailyStats[launchDate].sold += (soldCount - sumSold);
            statsUpdated = true;
        }
        if (sellersCount > sumSellers) {
            dailyStats[launchDate].sellers += (sellersCount - sumSellers);
            statsUpdated = true;
        }
        if (visitorsCount > sumVisitors) {
            dailyStats[launchDate].visitors += (visitorsCount - sumVisitors);
            statsUpdated = true;
        }

        if (statsUpdated) {

      await BOOKS_KV.put("system:daily_stats", JSON.stringify(dailyStats));

      // Track ambassador purchase
      const bookToDel = await BOOKS_KV.get(id, { type: "json" });
      if (bookToDel && bookToDel.ref) {
          const statKey = "amb_stats:" + bookToDel.ref;
          let stats = await BOOKS_KV.get(statKey, { type: "json" }) || { installs: 0, views: 0, listings: 0, purchases: 0 };
          stats.purchases++;
          await BOOKS_KV.put(statKey, JSON.stringify(stats));
      }

        }

        return new Response(JSON.stringify({
            booksListed: booksCount,
            pendingCount: pendingCount,
            activeCount: activeCount,
            sellersCount: sellersCount,
            sold: soldCount,
            visitors: visitorsCount,
            dailyStats: dailyStats
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

      // --- Ambassador Registration Endpoint ---
      if (url.pathname === '/ambassador/register') {
        const body = await request.json();
        const { approvalKey, name, email, password } = body;

        if (!approvalKey || !name || !email || !password) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
        }

        // Verify key
        const keyDataStr = await BOOKS_KV.get("ambassador_key:" + approvalKey);
        if (!keyDataStr) {
            return new Response(JSON.stringify({ error: "Invalid or expired approval key" }), { status: 400, headers });
        }

        const ambassadorId = "amb:" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
        const ambassadorData = {
            id: ambassadorId,
            name,
            email,
            password, // Simple for now, ideally hashed
            createdAt: new Date().toISOString()
        };

        await BOOKS_KV.put(ambassadorId, JSON.stringify(ambassadorData));
        await BOOKS_KV.delete("ambassador_key:" + approvalKey); // Use key once

        return new Response(JSON.stringify({ success: true }), { headers });
      }

      // --- Ambassador Login Endpoint ---
      if (url.pathname === '/ambassador/login') {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return new Response(JSON.stringify({ error: "Missing email or password" }), { status: 400, headers });
        }

        const list = await BOOKS_KV.list({ prefix: "amb:" });
        let found = null;
        for (const key of list.keys) {
            const val = await BOOKS_KV.get(key.name, { type: "json" });
            if (val && val.email === email && val.password === password) {
                found = val;
                break;
            }
        }

        if (!found) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401, headers });
        }

        // Dummy token generation for basic auth
        const token = btoa(found.id + ":" + Date.now());
        const { password: _, ...safeData } = found;

        return new Response(JSON.stringify({ token, ambassador: safeData }), { headers });
      }

      // --- Admin Generate Ambassador Key ---
      if (url.pathname === '/admin/ambassador/keys') {
        const adminPass = request.headers.get("X-Admin-Password");
        if (adminPass !== (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }

        const key = Math.random().toString(36).substring(2, 10).toUpperCase();
        // 24 hours expiry
        await BOOKS_KV.put("ambassador_key:" + key, JSON.stringify({ createdAt: Date.now() }), { expirationTtl: 86400 });

        return new Response(JSON.stringify({ success: true, key }), { headers });
      }

      // --- Track Events ---
      if (url.pathname === '/track') {
          const body = await request.json();
          const { ref, event } = body; // event: 'install', 'view'
          if (ref && event) {
             const statKey = "amb_stats:" + ref;
             let stats = await BOOKS_KV.get(statKey, { type: "json" }) || { installs: 0, views: 0, listings: 0, purchases: 0 };
             if (event === 'install') stats.installs++;
             if (event === 'view') stats.views++;
             await BOOKS_KV.put(statKey, JSON.stringify(stats));
          }
          return new Response(JSON.stringify({ success: true }), { headers });
      }


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
        if (password !== (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
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

      // --- Report Endpoint ---
      if (url.pathname === '/report') {
        const body = await request.json();
        const { bookId, reporterName, reporterPhone, reason } = body;

        if (!bookId || !reporterName || !reporterPhone || !reason) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
        }

        const reportId = `report:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const reportData = {
            bookId,
            reporterName,
            reporterPhone,
            reason,
            createdAt: new Date().toISOString()
        };

        await BOOKS_KV.put(reportId, JSON.stringify(reportData));
        // Send FCM Notification
        event.waitUntil(sendFCMNotification( "New Report", "A listing has been reported and requires review."));
        return new Response(JSON.stringify({ success: true, message: "Report submitted" }), { headers });
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
      let isNewSeller = false;
      if (sellersMap[contact]) {
          code = sellersMap[contact].code;
          sellersMap[contact].count++;
          // Update name if changed? Let's keep original for stability or update.
          sellersMap[contact].name = body.seller;
      } else {
          code = generateSellerCode();
          isNewSeller = true;
          sellersMap[contact] = {
              code: code,
              name: body.seller,
              contact: contact,
              count: 1
          };
      }

      // Save Map
      await BOOKS_KV.put("system:sellers", JSON.stringify(sellersMap));

      // Update daily aggregates for new seller
      if (isNewSeller) {
          let dailyStats = await BOOKS_KV.get("system:daily_stats", { type: "json" });
          if (!dailyStats) dailyStats = {};
          const today = new Date().toISOString().split('T')[0];
          if (!dailyStats[today]) dailyStats[today] = { visitors: 0, sold: 0, sellers: 0 };
          dailyStats[today].sellers += 1;
          await BOOKS_KV.put("system:daily_stats", JSON.stringify(dailyStats));
      }

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
        campuses: body.campuses || [],
        image: body.image || "", // Base64 string
        createdAt: new Date().toISOString(),
        sellerCode: code, // Assign Code
        status: 'pending'
      };

      // Track referral listing if ref exists
      if (body.ref) {
          const statKey = "amb_stats:" + body.ref;
          let stats = await BOOKS_KV.get(statKey, { type: "json" }) || { installs: 0, views: 0, listings: 0, purchases: 0 };
          stats.listings++;
          await BOOKS_KV.put(statKey, JSON.stringify(stats));
          bookData.ref = body.ref; // Store the attribution
      }


      // Store in KV
      await BOOKS_KV.put(id, JSON.stringify(bookData));
      // Send FCM Notification for new book
      event.waitUntil(sendFCMNotification( "New Book Upload", body.title + " requires approval."));

      return new Response(JSON.stringify({ success: true, id: id, message: "Book added successfully", code: code }), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }

  if (request.method === 'DELETE') {
    try {
      if (url.pathname === '/admin/reports') {
          const password = request.headers.get("X-Admin-Password");
          if (password !== (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
          }

          const id = url.searchParams.get("id");
          if (!id) {
            return new Response(JSON.stringify({ error: "Missing report ID" }), { status: 400, headers });
          }

          await BOOKS_KV.delete(id);
          return new Response(JSON.stringify({ success: true, message: "Report dismissed" }), { headers });
      }

      if (url.pathname === '/seller/account') {
          const sellerCodeHeader = request.headers.get("X-Seller-Code");
          if (!sellerCodeHeader || sellerCodeHeader.length !== 4) {
              return new Response(JSON.stringify({ error: "Invalid or missing seller code" }), { status: 401, headers });
          }

          // 1. Delete all books belonging to this seller
          const list = await BOOKS_KV.list({ prefix: "book:" });
          let deletedCount = 0;
          for (const key of list.keys) {
              const val = await BOOKS_KV.get(key.name, { type: "json" });
              if (val && val.sellerCode === sellerCodeHeader) {
                  await BOOKS_KV.delete(key.name);
                  deletedCount++;
              }
          }

          // 2. Remove seller from system:sellers map
          let sellersMap = await BOOKS_KV.get("system:sellers", { type: "json" });
          if (sellersMap) {
              let updated = false;
              for (const [contact, data] of Object.entries(sellersMap)) {
                  if (data.code === sellerCodeHeader) {
                      delete sellersMap[contact];
                      updated = true;
                      break;
                  }
              }
              if (updated) {
                  await BOOKS_KV.put("system:sellers", JSON.stringify(sellersMap));
              }
          }

          // Update sold count just in case they were sold? We won't update sold count for account deletion to avoid inflating stats if they are just quitting.
          return new Response(JSON.stringify({ success: true, message: `Account deleted. Removed ${deletedCount} listings.` }), { headers });
      }

      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing book ID" }), { status: 400, headers });
      }

      // Check Authorization
      const adminPassword = request.headers.get("X-Admin-Password");
      const sellerCodeHeader = request.headers.get("X-Seller-Code");

      let authorized = false;

      // 1. Admin Auth
      if (adminPassword === (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
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

      // Update daily aggregates
      let dailyStats = await BOOKS_KV.get("system:daily_stats", { type: "json" });
      if (!dailyStats) dailyStats = {};
      const today = new Date().toISOString().split('T')[0];
      if (!dailyStats[today]) dailyStats[today] = { visitors: 0, sold: 0, sellers: 0 };
      dailyStats[today].sold += 1;
      await BOOKS_KV.put("system:daily_stats", JSON.stringify(dailyStats));

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
        if (password !== (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
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

      if (url.pathname === '/update-campuses') {
        const id = url.searchParams.get("id");
        if (!id) {
          return new Response(JSON.stringify({ error: "Missing book ID" }), { status: 400, headers });
        }

        const sellerCodeHeader = request.headers.get("X-Seller-Code");
        if (!sellerCodeHeader) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }

        const existing = await BOOKS_KV.get(id, { type: "json" });
        if (!existing) {
          return new Response(JSON.stringify({ error: "Book not found" }), { status: 404, headers });
        }

        if (existing.sellerCode !== sellerCodeHeader) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
        }

        const body = await request.json();
        existing.campuses = body.campuses || [];
        await BOOKS_KV.put(id, JSON.stringify(existing));

        return new Response(JSON.stringify({ success: true, message: "Campuses updated successfully" }), { headers });
      }

      // Check Admin Password
      const password = request.headers.get("X-Admin-Password");
      if (password !== (typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'admin-secret-123')) {
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
        campuses: body.campuses !== undefined ? body.campuses : (existing.campuses || []),
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
async function sendFCMNotification(title, body) {
  try {
    if (typeof FCM_SERVICE_ACCOUNT_JSON === "undefined") {
      console.error("FCM_SERVICE_ACCOUNT_JSON not defined in environment");
      return;
    }

    if (!FCM_SERVICE_ACCOUNT_JSON) {
      console.error("FCM_SERVICE_ACCOUNT_JSON not configured in environment");
      return;
    }

    const tokensStr = await BOOKS_KV.get("system:fcm_tokens");
    if (!tokensStr) return;
    const tokens = JSON.parse(tokensStr);
    if (!tokens || tokens.length === 0) return;

    // A minimal implementation of JWT generation for Google OAuth2
    // using Web Crypto API to avoid node-specific dependencies
    const serviceAccount = JSON.parse(FCM_SERVICE_ACCOUNT_JSON);

    // We will use a worker-friendly JWT generation function
    const token = await generateGoogleOAuthToken(serviceAccount);

    for (const deviceToken of tokens) {
      const message = {
        message: {
          token: deviceToken,
          notification: {
            title: title,
            body: body
          }
        }
      };

      const response = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        console.error("FCM Send Error:", await response.text());
      }
    }
  } catch (err) {
    console.error("FCM Error:", err);
  }
}

// Helper functions for JWT
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function base64url(source) {
  let encodedSource = btoa(source);
  encodedSource = encodedSource.replace(/=+$/, '');
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');
  return encodedSource;
}

async function generateGoogleOAuthToken(serviceAccount) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const stringifiedHeader = JSON.stringify(header);
  const stringifiedPayload = JSON.stringify(payload);

  const encodedHeader = base64url(stringifiedHeader);
  const encodedPayload = base64url(stringifiedPayload);

  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Import private key
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = serviceAccount.private_key.substring(
    serviceAccount.private_key.indexOf(pemHeader) + pemHeader.length,
    serviceAccount.private_key.indexOf(pemFooter)
  ).replace(/\s/g, '');

  const binaryDerString = atob(pemContents);
  const binaryDer = str2ab(binaryDerString);

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64url(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${signatureInput}.${encodedSignature}`;

  // Exchange JWT for OAuth Token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to get OAuth token');
  }

  return data.access_token;
}
