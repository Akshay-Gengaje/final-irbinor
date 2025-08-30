document.addEventListener("DOMContentLoaded", function () {
  // --- ELEMENTS ---
  const form = document.getElementById("whatsapp-form");
  const phoneInput = document.getElementById("wa-phone"); // 🔀 UPDATED
  const toggleBtn = document.getElementById("wa-toggle");
  const closeBtn = document.getElementById("close-wa-form");
  const formContainer = document.getElementById("wa-form-container");
  const formCard = document.getElementById("wa-form-card");

  // --- PHONE INPUT INITIALIZATION ---
  const iti = window.intlTelInput(phoneInput, {
    initialCountry: "auto",
    preferredCountries: ["us", "in", "gb"],
    geoIpLookup: function (callback) {
      fetch("https://ipapi.co/json")
        .then((res) => res.json())
        .then((data) => callback(data.country_code))
        .catch(() => callback("us"));
    },
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js",
  });

  // --- VALIDATION LOGIC ---
  // 🔀 UPDATED field names and name validation rule
  const validationRules = {
    "wa-name": {
      validate: (value) => /^[a-zA-Z\s'-]{2,50}$/.test(value),
      message: "Please enter a valid name (at least 2 characters).",
    },
    "wa-email": {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value),
      message: "Please enter a valid email address.",
    },
    "wa-phone": {
      validate: () => iti.isValidNumber(),
      message: "Please enter a valid phone number.",
    },
    "wa-message": {
      validate: (value) => value.length >= 10 && value.length <= 300,
      message: "Message must be 10-300 characters.",
    },
  };

  const validateField = (fieldId) => {
    const field = document.getElementById(fieldId);
    const rule = validationRules[fieldId];
    // 🔀 UPDATED to check for 'wa-phone'
    const isValid = fieldId === 'wa-phone' ? rule.validate() : rule.validate(field.value.trim());
    
    if (isValid) {
      clearError(fieldId);
    } else {
      showError(fieldId, rule.message);
    }
    return isValid;
  };

  const showError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    // 🔀 UPDATED to check for 'wa-phone'
    const fieldContainer = fieldId === 'wa-phone' ? field.parentElement : field;
    fieldContainer.classList.add("border-red-500", "focus-within:border-red-500");
    fieldContainer.classList.remove("border-gray-300");
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  };

  const clearError = (fieldId) => {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    // 🔀 UPDATED to check for 'wa-phone'
    const fieldContainer = fieldId === 'wa-phone' ? field.parentElement : field;
    fieldContainer.classList.remove("border-red-500", "focus-within:border-red-500");
    fieldContainer.classList.add("border-gray-300");
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  };
  
  const clearAllErrors = () => {
    Object.keys(validationRules).forEach(clearError);
  };

  // --- EVENT LISTENERS ---

  // ✅ THIS WILL NOW WORK CORRECTLY
  // Validate name, email, and phone when the user clicks away.
  ['wa-name', 'wa-email', 'wa-phone'].forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    // For the phone input, the library adds its own container, so we listen on that.
    const elementToWatch = fieldId === 'wa-phone' ? phoneInput.parentElement : input;
    elementToWatch.addEventListener("blur", () => validateField(fieldId));
  });

  // Validate the message field in real-time as the user types.
  document.getElementById('wa-message').addEventListener("input", () => validateField('wa-message'));

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    
    // Validate all fields and check if the form is valid
    const isFormValid = Object.keys(validationRules).reduce((acc, fieldId) => {
        // We AND the results. If any is false, the whole thing becomes false.
        return validateField(fieldId) && acc;
    }, true);

    if (isFormValid) {
      // 🔀 UPDATED to get values from correct IDs
      const name = document.getElementById("wa-name").value.trim();
      const email = document.getElementById("wa-email").value.trim();
      const phone = iti.getNumber(); // Gets number with country code
      const message = document.getElementById("wa-message").value.trim();

      const yourWhatsAppNumber = "919356114881"; // Your number without "+"
      const fullMessage =
        `Hi, my name is ${name}.\n` +
        `My email is ${email}.\n` +
        `My phone number is ${phone}.\n\n` +
        `Message:\n${message}`;

      const waUrl = `https://wa.me/${yourWhatsAppNumber}?text=${encodeURIComponent(fullMessage)}`;
      window.open(waUrl, "_blank");
      
      // Optional: close and reset form after submission
      closeForm();
      form.reset();
      clearAllErrors(); // Clear any lingering error messages
      iti.setCountry("auto"); // Reset country
    }
  });

  // --- FORM TOGGLE LOGIC ---
  const openForm = () => {
    formContainer.classList.remove("pointer-events-none");
    formContainer.classList.add("opacity-100");
    formContainer.classList.remove("opacity-0");
    formCard.classList.add("scale-100");
    formCard.classList.remove("scale-95");
  };

  const closeForm = () => {
    formContainer.classList.add("opacity-0");
    formContainer.classList.remove("opacity-100");
    formCard.classList.add("scale-95");
    formCard.classList.remove("scale-100");
    setTimeout(() => {
        formContainer.classList.add("pointer-events-none");
        clearAllErrors(); // Also clear errors on close
    }, 300); // Match duration of transition
  };
  
  toggleBtn.addEventListener("click", openForm);
  closeBtn.addEventListener("click", closeForm);
  
  // Close form if user clicks on the background overlay
  formContainer.addEventListener('click', (e) => {
    if (e.target === formContainer) {
      closeForm();
    }
  });
});