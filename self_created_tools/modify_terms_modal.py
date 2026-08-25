import sys
import re

def main():
    if len(sys.argv) < 2:
        print("Usage: python modify_terms_modal.py <filename>")
        sys.exit(1)

    filename = sys.argv[1]
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove all inline styles in terms-modal.js string
    content = re.sub(r'\s+style="[^"]*"', '', content)

    # Replace content of legalScrollContainer with empty div
    content = re.sub(r'(<div id="legalScrollContainer"[^>]*>).*?(</div>)', r'\1\n        <!-- Legal content goes here -->\n        \2', content, flags=re.DOTALL)

    # Replace the text inside <h2> tag with empty text
    content = re.sub(r'(<h2[^>]*>).*?(</h2>)', r'\1Placeholder Title\2', content, flags=re.DOTALL)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()
