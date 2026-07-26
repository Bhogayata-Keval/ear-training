// Replace with your Lemon Squeezy checkout URL
var CHECKOUT_URL = "https://musicmuscle.lemonsqueezy.com/checkout/buy/92709bb8-8fcf-49c8-86ef-28265506e3f5";
var PREMIUM_KEY = "ear-training-premium";
var isPremium = false;

function initPremium() {
  try {
    var data = JSON.parse(localStorage.getItem(PREMIUM_KEY));
    if (data && data.license_key) {
      isPremium = true;
    }
  } catch (e) {}

  var banner = document.getElementById("offer-banner");
  if (banner) banner.style.display = isPremium ? "none" : "";

  var deadlineEl = document.getElementById("offer-deadline");
  if (deadlineEl) {
    var now = new Date();
    var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var monthName = now.toLocaleString("en-US", { month: "long" });
    deadlineEl.textContent = monthName + " " + lastDay;
  }
}

var pendingLevelId = null;

function showPremiumModal(targetLevelId) {
  pendingLevelId = targetLevelId || null;
  var overlay = document.createElement("div");
  overlay.className = "premium-overlay";
  overlay.id = "premium-overlay";

  var modal = document.createElement("div");
  modal.className = "premium-modal";

  var html = '';
  html += '<button class="premium-close" onclick="closePremiumModal()">&times;</button>';
  html += '<h2>Unlock Premium Levels</h2>';
  html += '<p>Get access to advanced ear training:</p>';
  html += '<ul class="premium-features">';
  html += '<li><strong>Level 4</strong> — Two octaves of notes</li>';
  html += '<li><strong>Level 5</strong> — All 12 intervals</li>';
  html += '<li><strong>Level 6</strong> — Descending intervals</li>';
  html += '<li><strong>Level 7</strong> — Chord recognition (coming soon)</li>';
  html += '</ul>';
  html += '<a href="' + CHECKOUT_URL + '" class="lemonsqueezy-button premium-buy-btn">Buy Premium</a>';
  html += '<div class="premium-divider"><span>Already purchased?</span></div>';
  html += '<div class="premium-key-row">';
  html += '<input type="text" id="license-key-input" placeholder="Enter your license key" />';
  html += '<button onclick="submitLicenseKey()">Activate</button>';
  html += '</div>';
  html += '<p id="license-status" class="license-status"></p>';

  modal.innerHTML = html;
  overlay.appendChild(modal);
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closePremiumModal();
  });
  document.body.appendChild(overlay);
}

function closePremiumModal() {
  var overlay = document.getElementById("premium-overlay");
  if (overlay) overlay.remove();
}

function submitLicenseKey() {
  var input = document.getElementById("license-key-input");
  var status = document.getElementById("license-status");
  var key = input ? input.value.trim() : "";

  if (!key) {
    status.textContent = "Please enter a license key.";
    status.className = "license-status error";
    return;
  }

  status.textContent = "Activating...";
  status.className = "license-status";

  activateLicense(key)
    .then(function(result) {
      if (result.success) {
        status.textContent = "Premium unlocked!";
        status.className = "license-status success";
        isPremium = true;
        var banner = document.getElementById("offer-banner");
        if (banner) banner.style.display = "none";
        renderSidebar();
        setTimeout(function() {
          closePremiumModal();
          if (pendingLevelId) selectLevel(pendingLevelId);
        }, 1200);
      } else {
        status.textContent = result.error || "Invalid license key.";
        status.className = "license-status error";
      }
    })
    .catch(function() {
      status.textContent = "Network error. Please try again.";
      status.className = "license-status error";
    });
}

function activateLicense(key) {
  return fetch("https://api.lemonsqueezy.com/v1/licenses/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ license_key: key, instance_name: "ear-training-web" })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.activated) {
      savePremiumKey(key, data.instance.id);
      return { success: true };
    }
    if (data.error === "license key activation limit has been reached") {
      return validateLicense(key);
    }
    return { success: false, error: data.error || "Activation failed." };
  });
}

function validateLicense(key) {
  return fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ license_key: key })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.valid) {
      savePremiumKey(key, "validated");
      return { success: true };
    }
    return { success: false, error: data.error || "Invalid license key." };
  });
}

function savePremiumKey(key, instanceId) {
  try {
    localStorage.setItem(PREMIUM_KEY, JSON.stringify({
      license_key: key,
      instance_id: instanceId
    }));
  } catch (e) {}
}
