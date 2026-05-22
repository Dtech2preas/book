import re

with open('seller-manage.html', 'r') as f:
    code = f.read()

# Add script src for Tesseract
code = code.replace('<script src="config.js"></script>', '<script src="config.js"></script>\n    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>')

# Add "Add New Book" section in the manage-section
add_book_html = """
        <div style="margin-bottom: 2rem;">
            <button id="toggle-add-btn" style="width: 100%; margin-bottom: 1rem;">+ Add New Book</button>
            <div id="add-book-section" class="card" style="display: none; background-color: #2a2a2a;">
                <h3>Add a New Book</h3>
                <form id="add-book-form">
                    <input type="file" id="new-image" accept="image/*" required style="width:100%; margin-bottom:10px; color:#fff;">
                    <img id="new-image-preview" style="max-width: 100%; max-height: 200px; display: none; margin-bottom: 10px; border-radius: 5px;">

                    <div id="ocr-section-new" style="display: none; background-color: #1a1a1a; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                        <p style="margin:0 0 5px 0;"><strong>Extracted Text</strong></p>
                        <textarea id="ocr-result-new" style="width: 100%; height: 80px; background: #000; color: #fff; padding: 5px; box-sizing: border-box; border: 1px solid #444;" readonly>Scanning image...</textarea>
                        <div style="display: flex; gap: 10px; margin-top: 5px;">
                            <button type="button" onclick="mapOcrNew('new-title')" style="padding: 5px; font-size: 0.8rem; width: auto;">Set Title</button>
                            <button type="button" onclick="mapOcrNew('new-author')" style="padding: 5px; font-size: 0.8rem; width: auto;">Set Author</button>
                        </div>
                    </div>

                    <input type="text" id="new-title" placeholder="Book Title" required style="width:100%; margin-bottom:10px; padding:10px; box-sizing:border-box;">
                    <input type="text" id="new-author" placeholder="Author" required style="width:100%; margin-bottom:10px; padding:10px; box-sizing:border-box;">
                    <input type="number" id="new-price" placeholder="Price (R)" required style="width:100%; margin-bottom:10px; padding:10px; box-sizing:border-box;">
                    <button type="submit" id="submit-new-btn">Submit Book</button>
                </form>
            </div>
        </div>
"""

code = code.replace('<h2 style="text-align: center;">Your Listed Books</h2>', add_book_html + '\n        <h2 style="text-align: center;">Your Listed Books</h2>')

# Add Javascript logic
js_additions = """
    let base64NewImage = null;
    let sellerName = "";
    let sellerContact = "";

    document.getElementById('toggle-add-btn').addEventListener('click', function() {
        const section = document.getElementById('add-book-section');
        if (section.style.display === 'none') {
            section.style.display = 'block';
            this.textContent = '- Cancel Adding';
        } else {
            section.style.display = 'none';
            this.textContent = '+ Add New Book';
        }
    });

    document.getElementById('new-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function(event) {
            base64NewImage = event.target.result;

            const preview = document.getElementById('new-image-preview');
            preview.src = base64NewImage;
            preview.style.display = 'block';

            const ocrSection = document.getElementById('ocr-section-new');
            const ocrResult = document.getElementById('ocr-result-new');
            ocrSection.style.display = 'block';
            ocrResult.value = "Scanning image...";

            try {
                const result = await Tesseract.recognize(base64NewImage, 'eng');
                ocrResult.value = result.data.text;
                ocrResult.removeAttribute('readonly');
            } catch (err) {
                console.error(err);
                ocrResult.value = "Failed to extract text.";
            }
        };
        reader.readAsDataURL(file);
    });

    window.mapOcrNew = function(field) {
        const ocrText = document.getElementById('ocr-result-new');
        const selectedText = ocrText.value.substring(ocrText.selectionStart, ocrText.selectionEnd).trim();
        if (selectedText) {
            document.getElementById(field).value = selectedText;
        } else {
            alert('Please highlight some text first.');
        }
    };

    document.getElementById('add-book-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-new-btn');
        btn.textContent = 'Submitting...';
        btn.disabled = true;

        const payload = {
            type: 'buy',
            seller: sellerName,
            contact: sellerContact,
            title: document.getElementById('new-title').value,
            author: document.getElementById('new-author').value,
            price: document.getElementById('new-price').value,
            image: base64NewImage
        };

        try {
            const res = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                showToast('Book added and pending approval!');
                document.getElementById('add-book-form').reset();
                document.getElementById('new-image-preview').style.display = 'none';
                document.getElementById('ocr-section-new').style.display = 'none';
                document.getElementById('add-book-section').style.display = 'none';
                document.getElementById('toggle-add-btn').textContent = '+ Add New Book';
                loadBooks(sessionStorage.getItem('sellerCode'));
            } else {
                showToast('Error: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            showToast('Network error.');
        } finally {
            btn.textContent = 'Submit Book';
            btn.disabled = false;
        }
    });

"""

# Hook into loadBooks response
extract_logic_old = """
            if (response.ok) {
                sessionStorage.setItem('sellerCode', code);
                displayCode.textContent = code;
                renderBooks(data);
"""
extract_logic_new = """
            if (response.ok) {
                sessionStorage.setItem('sellerCode', code);
                displayCode.textContent = code;

                // Extract name and contact from first book for adding new books
                if (data.length > 0) {
                    sellerName = data[0].seller || "Anonymous";
                    sellerContact = data[0].contact || "";
                }

                renderBooks(data);
"""

code = code.replace(extract_logic_old, extract_logic_new)

code = code.replace('// Check session', js_additions + '\n    // Check session')

with open('seller-manage.html', 'w') as f:
    f.write(code)
