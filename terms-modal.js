const termsHTML = `
<div id="termsModal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(3, 7, 18, 0.9); z-index: 9999; backdrop-filter: blur(8px); align-items: center; justify-content: center;">
    <div class="modal-content" style="background-color: #111827; border: 1px solid #00D2FF; border-radius: 12px; padding: 2rem; width: 90%; max-width: 650px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.7); position: relative; display: flex; flex-direction: column; max-height: 85vh;">
        
        <h2 style="color: #00D2FF; text-align: center; margin-top: 0; margin-bottom: 1.5rem; font-family: system-ui, -apple-system, sans-serif;">Legal Framework & POPIA Consent</h2>

        <div id="legalScrollContainer" style="overflow-y: auto; padding-right: 10px; margin-bottom: 10px; font-size: 0.9rem; line-height: 1.6; color: #D1D5DB; font-family: system-ui, -apple-system, sans-serif; flex-grow: 1; border-bottom: 1px solid #374151;">
            
            <h3 style="color: white; margin-top: 0; border-bottom: 1px solid #374151; padding-bottom: 5px;">1. Terms of Use & Liability Disclaimer</h3>
            <p>The Peer-to-Peer Campus Textbook Exchange Platform functions strictly as an intellectual matching directory. It facilitates decentralized information exchange between student buyers and student sellers within the university ecosystem.</p>
            <ul style="padding-left: 20px; margin-bottom: 1.5rem;">
                <li><strong>Zero Financial Mediation:</strong> The platform handles, processes, and stores absolute zero financial transactions, cash flows, or electronic payments. All monetary exchanges and physical book hand-overs occur entirely offline between independent parties.</li>
                <li><strong>Exclusion of Liability:</strong> D-TECH Services and its development architects accept zero responsibility or legal liability for any physical safety issues, counterfeit currency transactions, failed agreements, text inaccuracies, or interpersonal disputes arising from peer-to-peer interactions initiated via this interface.</li>
                <li><strong>Acceptable Content:</strong> Users are strictly prohibited from uploading non-academic merchandise, fraudulent book conditions, malicious code payloads, or duplicate spam listings. Violations will result in an immediate, permanent programmatic ban of your verification record.</li>
            </ul>

            <h3 style="color: white; border-bottom: 1px solid #374151; padding-bottom: 5px; margin-top: 1.5rem;">2. POPIA Privacy Policy (Protection of Personal Information Act)</h3>
            <p>In strict accordance with the Protection of Personal Information Act (POPIA), No. 4 of 2013 of South Africa, D-TECH Services processes your personal metrics exclusively to handle data parameter mapping:</p>
            <ul style="padding-left: 20px;">
                <li><strong>Data Categories Gathered:</strong> To initialize matching queries, the database captures your Full Name, Verified WhatsApp/Cellular Contact Number, and Textbook Metadata (Title, Author/Edition, Price, and Asset Image Cover).</li>
                <li><strong>Purpose of Processing:</strong> Your processing vectors are strictly used to render listings on the public index page, map the secure click-to-route WhatsApp hyperlinks, and manage your 4-character profile tracking token.</li>
                <li><strong>Public Visibility Notification:</strong> By committing a payload to the database, you explicitly understand and consent that your text metadata, name, and WhatsApp contact number will be accessible via browser queries to other platform users executing transaction routing actions.</li>
                <li><strong>Absolute Third-Party Restriction:</strong> D-TECH Services maintains an absolute restriction against sharing, renting, leasing, selling, or distributing student data packets to any external corporate networks or advertising entities.</li>
                <li><strong>Data Erasure & Deletion Rights:</strong> Every user retains the absolute right to demand data erasure under POPIA Section 11. You can execute instantaneous data purging yourself by logging into the user management dashboard using your token parameters and selecting "Delete Listing," or by logging a removal request to dtech2services@gmail.com.</li>
            </ul>
        </div>

        <div id="scrollIndicator" style="background: linear-gradient(to right, rgba(0, 210, 255, 0.1), rgba(0, 210, 255, 0.2)); color: #00D2FF; text-align: center; padding: 6px; font-size: 0.8rem; font-weight: bold; border-radius: 6px; margin-bottom: 15px; animation: pulse 1.5s infinite; font-family: system-ui, -apple-system, sans-serif; pointer-events: none; transition: opacity 0.3s ease;">
            ▼ Scroll down to read complete legal framework
        </div>

        <style>
            @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
        </style>

        <div style="border-top: 1px solid #374151; padding-top: 15px; display: flex; flex-direction: column; gap: 15px; font-family: system-ui, -apple-system, sans-serif;">
            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-weight: normal; color: white; font-size: 0.85rem; line-height: 1.4;">
                <input type="checkbox" id="acceptTermsToggle" style="width: 22px; height: 22px; cursor: pointer; flex-shrink: 0; accent-color: #00D2FF;">
                <span>I explicitly consent to D-TECH Services processing my name and contact parameters. I understand my WhatsApp link will be visible via routing triggers, and I retain the right to purge my data record at any time via the User Portal as outlined above.</span>
            </label>
            <button id="saveTermsBtn" style="width: 100%; background-color: #00D2FF; color: #030712; border: none; padding: 0.85rem; border-radius: 6px; font-weight: bold; font-size: 1rem; transition: all 0.2s; opacity: 0.5; cursor: not-allowed;" disabled>Continue to Site</button>
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
