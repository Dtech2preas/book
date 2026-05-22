import re

with open('about.html', 'r') as f:
    code = f.read()

code = code.replace('<a href="services.html">Sell Books</a>', '<a href="sell.html">Sell Books</a>\n        <a href="services.html">Services</a>')

with open('about.html', 'w') as f:
    f.write(code)

with open('services.html', 'r') as f:
    code2 = f.read()

code2 = code2.replace('<a href="services.html" style="color:var(--primary-color);">Services</a>', '<a href="sell.html">Sell Books</a>\n        <a href="services.html" style="color:var(--primary-color);">Services</a>')
code2 = code2.replace('<a href="services.html">Sell Books</a>', '<a href="sell.html">Sell Books</a>\n        <a href="services.html" style="color:var(--primary-color);">Services</a>')


with open('services.html', 'w') as f:
    f.write(code2)
