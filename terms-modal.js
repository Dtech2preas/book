const termsHTML = `
<!-- Terms of Use & Privacy Policy Modal -->
<div id="termsModal" class="modal" style="display: none; z-index: 9999; backdrop-filter: blur(5px);">
    <div class="modal-content" style="max-width: 600px; text-align: left; max-height: 80vh; overflow-y: auto;">
        <h2 style="color: var(--primary-color); text-align: center;">Terms of Use & Privacy Policy</h2>

        <div style="margin-bottom: 20px; font-size: 0.9rem; line-height: 1.5; color: #ddd;">
            <h4>Terms of Use</h4>
            <ul>
                <li>This platform only connects people &ndash; it does not handle payments.</li>
                <li>D-TECH and SRC are not responsible for failed transactions or disputes between users.</li>
                <li>Users must not post prohibited content (spam, fake listings, non-textbooks).</li>
                <li>Violations of these terms will result in a permanent ban.</li>
            </ul>

            <h4 style="margin-top: 15px;">Privacy Policy (POPIA Compliant)</h4>
            <ul>
                <li><strong>What data we collect:</strong> Your name, WhatsApp number, email (if provided), and book listing details.</li>
                <li><strong>Why we collect it:</strong> Solely to connect buyers and sellers on this platform.</li>
                <li><strong>Who can see it:</strong> Other platform users can view your details via the WhatsApp click functionality.</li>
                <li><strong>How to request deletion:</strong> You can delete your listings and data at any time via the Seller Management page, or request deletion by contacting us.</li>
                <li><strong>Data Sharing:</strong> We do not share your data with third parties for marketing purposes.</li>
            </ul>
        </div>

        <div style="border-top: 1px solid #333; padding-top: 15px; display: flex; flex-direction: column; gap: 15px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: normal; color: white;">
                <input type="checkbox" id="acceptTermsToggle" style="width: 20px; height: 20px; cursor: pointer;">
                I have read and accept the Terms of Use & Privacy Policy
            </label>
            <button id="saveTermsBtn" style="width: 100%; opacity: 0.5; cursor: not-allowed;" disabled>Continue to Site</button>
        </div>
    </div>
</div>
`;

document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML('beforeend', termsHTML);

    const termsModal = document.getElementById("termsModal");
    const acceptTermsToggle = document.getElementById("acceptTermsToggle");
    const saveTermsBtn = document.getElementById("saveTermsBtn");

    const checkTermsAccepted = () => {
        return localStorage.getItem("termsAccepted") === "true";
    };

    const showModal = (force = false) => {
        if (!checkTermsAccepted() || force) {
            termsModal.style.display = "flex";
            acceptTermsToggle.checked = checkTermsAccepted();
            updateBtnState();
        }
    };

    const updateBtnState = () => {
        if (acceptTermsToggle.checked) {
            saveTermsBtn.disabled = false;
            saveTermsBtn.style.opacity = "1";
            saveTermsBtn.style.cursor = "pointer";
        } else {
            saveTermsBtn.disabled = true;
            saveTermsBtn.style.opacity = "0.5";
            saveTermsBtn.style.cursor = "not-allowed";
        }
    };

    acceptTermsToggle.addEventListener("change", () => {
        updateBtnState();
        if (checkTermsAccepted() && !acceptTermsToggle.checked) {
             localStorage.setItem("termsAccepted", "false");
        }
    });

    saveTermsBtn.addEventListener("click", () => {
        if (acceptTermsToggle.checked) {
            localStorage.setItem("termsAccepted", "true");
            termsModal.style.display = "none";
        }
    });

    // Make showModal globally available for the footer link
    window.openTermsModal = () => showModal(true);

    showModal();
});
