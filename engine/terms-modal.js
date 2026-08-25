const termsHTML = `
<div id="termsModal" class="modal">
    <div class="modal-content">

        <h2>Placeholder Title</h2>

        <div id="legalScrollContainer">
        <!-- Legal content goes here -->
        </div>

        <div id="scrollIndicator">
            ▼ Scroll down to read complete legal framework
        </div>

        <style>
            @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
        </style>

        <div>
            <label>
                <input type="checkbox" id="acceptTermsToggle">
                <span>I explicitly consent to D-TECH Services processing my name and contact parameters. I understand my WhatsApp link will be visible via routing triggers, and I retain the right to purge my data record at any time via the User Portal as outlined above.</span>
            </label>
            <button id="saveTermsBtn" disabled>Continue to Site</button>
        </div>
    </div>
</div>
`;

document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML('beforeend', termsHTML);

    const termsModal = document.getElementById("termsModal");
    const acceptTermsToggle = document.getElementById("acceptTermsToggle");
    const saveTermsBtn = document.getElementById("saveTermsBtn");
    const scrollContainer = document.getElementById("legalScrollContainer");
    const scrollIndicator = document.getElementById("scrollIndicator");

    const checkTermsAccepted = () => {
        return localStorage.getItem("termsAccepted") === "true";
    };

    // Listen for scroll events to hide the indicator banner when user reaches the bottom
    scrollContainer.addEventListener("scroll", () => {
        const threshold = 15; // Padding allowance in pixels
        const reachedBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + threshold;
        if (reachedBottom) {
            scrollIndicator.style.opacity = "0";
        } else {
            scrollIndicator.style.opacity = "1";
        }
    });

    const showModal = (force = false) => {
        if (!checkTermsAccepted() || force) {
            termsModal.style.display = "flex";
            acceptTermsToggle.checked = checkTermsAccepted();
            updateBtnState();

            // Check if container content is short enough that it doesn't need scrolling
            setTimeout(() => {
                if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
                    scrollIndicator.style.display = "none";
                }
            }, 50);
        }
    };

    const updateBtnState = () => {
        if (acceptTermsToggle.checked) {
            saveTermsBtn.disabled = false;
            saveTermsBtn.style.opacity = "1";
            saveTermsBtn.style.cursor = "pointer";
            saveTermsBtn.style.boxShadow = "0 4px 14px 0 rgba(0, 210, 255, 0.3)";
        } else {
            saveTermsBtn.disabled = true;
            saveTermsBtn.style.opacity = "0.5";
            saveTermsBtn.style.cursor = "not-allowed";
            saveTermsBtn.style.boxShadow = "none";
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
