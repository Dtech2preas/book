import sys
import re

def main():
    if len(sys.argv) < 2:
        print("Usage: python minify_html.py <filename>")
        sys.exit(1)

    filename = sys.argv[1]
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"File {filename} not found.")
        sys.exit(1)

    # Remove CSS styles
    content = re.sub(r'<style>.*?</style>', '', content, flags=re.DOTALL)

    # Optional: we can remove structural stuff like heavy headers, footers
    # but the prompt asks to keep DOM elements JS depends on.

    # We will write an automated but careful script to extract only script tags, and DOM elements that have `id` or `class` or form/input elements.
    # Actually, a safer approach for this task is to do it using python script per file based on known structures.
    # Or even just removing visual elements manually.

    # For now, just removing CSS blocks and style attributes helps a lot.
    content = re.sub(r'\s+style="[^"]*"', '', content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Minified {filename}")

if __name__ == '__main__':
    main()
