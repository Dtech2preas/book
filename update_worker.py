import re

with open('worker.js', 'r') as f:
    code = f.read()

# 1. Add /admin/books to GET
admin_books_get = """
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
"""

code = code.replace("if (url.pathname === '/stats') {", admin_books_get + "\n      if (url.pathname === '/stats') {")


# 2. Update stats endpoint
stats_code_old = """
        const list = await BOOKS_KV.list({ prefix: "book:" });
        const booksCount = list.keys.length;

        const sellersMap = await BOOKS_KV.get("system:sellers", { type: "json" });
        const sellersCount = sellersMap ? Object.keys(sellersMap).length : 0;

        const stats = await BOOKS_KV.get("system:stats", { type: "json" });
        const soldCount = stats ? (stats.sold || 0) : 0;

        return new Response(JSON.stringify({
            booksListed: booksCount,
            sellersCount: sellersCount,
            sold: soldCount
        }), { headers });
"""

stats_code_new = """
        const list = await BOOKS_KV.list({ prefix: "book:" });
        let booksCount = 0;
        let pendingCount = 0;
        let activeCount = 0;

        for (const key of list.keys) {
          const val = await BOOKS_KV.get(key.name, { type: "json" });
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
"""

code = code.replace(stats_code_old, stats_code_new)

# 3. Update GET / endpoint
list_old = """
      // Filter out nulls
      const validBooks = books.filter(b => b !== null);

      return new Response(JSON.stringify(validBooks), { headers });
"""

list_new = """
      // Filter out nulls and only active books
      const validBooks = books.filter(b => b !== null && (b.status === 'active' || b.status === undefined));

      return new Response(JSON.stringify(validBooks), { headers });
"""
code = code.replace(list_old, list_new)

# 4. Remove X-Admin-Password from POST Add Book
post_auth_old = """
      // --- Add Book Endpoint ---
      // Check Admin Password
      const password = request.headers.get("X-Admin-Password");
      if (password !== "admin-secret-123") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      }

      const body = await request.json();
"""

post_auth_new = """
      // --- Add Book Endpoint ---
      const body = await request.json();
"""
code = code.replace(post_auth_old, post_auth_new)


# 5. Add status: 'pending' to new books
bookdata_old = """
      const bookData = {
        type: body.type || 'buy',
        isNegotiable: !!body.isNegotiable,
        title: body.title,
        author: body.author || 'Not provided',
        price: body.price,
        seller: body.seller || "Anonymous",
        contact: body.contact || "",
        description: body.description || "",
        image: body.image || "", // Base64 string
        createdAt: new Date().toISOString(),
        sellerCode: code // Assign Code
      };
"""

bookdata_new = """
      const bookData = {
        type: body.type || 'buy',
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
"""

code = code.replace(bookdata_old, bookdata_new)

# 6. Add PUT /admin/approve endpoint
put_endpoint_start = "if (request.method === 'PUT') {"
put_approve = """
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
"""

code = code.replace(put_endpoint_start, put_approve, 1)

with open('worker.js', 'w') as f:
    f.write(code)
