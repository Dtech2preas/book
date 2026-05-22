import re

with open('seller-manage.html', 'r') as f:
    code = f.read()

# Highlight pending status
render_old = """
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-price">${book.price}</div>
                </div>
"""
render_new = """
                <div class="book-info">
                    <div class="book-title">${book.title} ${book.status === 'pending' ? '<span style="font-size:0.7em;color:orange;background:#333;padding:2px 5px;border-radius:3px;">PENDING</span>' : ''}</div>
                    <div class="book-price">${book.price}</div>
                </div>
"""
code = code.replace(render_old, render_new)

with open('seller-manage.html', 'w') as f:
    f.write(code)
