import re

with open('worker.js', 'r') as f:
    code = f.read()

# Replace the sequential GET calls with Promise.all in the /stats endpoint
old_stats = """
        for (const key of list.keys) {
          const val = await BOOKS_KV.get(key.name, { type: "json" });
          if (val) {
            booksCount++;
            if (val.status === 'pending') pendingCount++;
            else if (val.status === 'active' || !val.status) activeCount++;
          }
        }
"""

new_stats = """
        const vals = await Promise.all(list.keys.map(key => BOOKS_KV.get(key.name, { type: "json" })));
        for (const val of vals) {
          if (val) {
            booksCount++;
            if (val.status === 'pending') pendingCount++;
            else if (val.status === 'active' || !val.status) activeCount++;
          }
        }
"""

code = code.replace(old_stats, new_stats)

with open('worker.js', 'w') as f:
    f.write(code)
