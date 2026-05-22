import re

with open('index.html', 'r') as f:
    code = f.read()

# Replace "Sell Your Books" mapping
code = code.replace('<a href="services.html">Sell Your Books</a>', '<a href="sell.html" style="color:var(--primary-color);">Sell Your Books</a>\n            <a href="services.html">Services</a>')

with open('index.html', 'w') as f:
    f.write(code)
