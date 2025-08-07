const phoneInput = document.querySelector("#phone");
      const iti = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        preferredCountries: ["us", "in", "gb"],
        geoIpLookup: function (callback) {
          fetch("https://ipapi.co/json")
            .then((res) => res.json())
            .then((data) => callback(data.country_code))
            .catch(() => callback("us"));
        },
        utilsScript:
          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js",
      });

      const form = document.getElementById("whatsapp-form");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearErrors();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = iti.getNumber();
        const isPhoneValid = iti.isValidNumber();
        const message = document.getElementById("message").value.trim();

        let hasError = false;

        if (name.length < 2) {
          showError("name", "Please enter a valid full name.");
          hasError = true;
        }

        const emailPattern = /^[^@]+@[^@]+\.[a-z]{2,}$/i;
        if (!emailPattern.test(email)) {
          showError("email", "Please enter a valid email address.");
          hasError = true;
        }

        if (!isPhoneValid) {
          showError("phone", "Please enter a valid phone number.");
          hasError = true;
        }

        if (message.length < 10 || message.length > 300) {
          showError(
            "message",
            "Message must be between 10 and 300 characters."
          );
          hasError = true;
        }

        if (!hasError) {
          const yourWhatsAppNumber = "918888591205"; // without "+"
          const fullMessage =
            `Hi, my name is ${name}.\n` +
            `My email is ${email}.\n` +
            `My phone number is ${phone}.\n\n` +
            `Message:\n${message}`;

          const waUrl = `https://wa.me/${yourWhatsAppNumber}?text=${encodeURIComponent(
            fullMessage
          )}`;
          window.open(waUrl, "_blank");
        }
      });

      function showError(field, message) {
        const errorEl = document.getElementById(`${field}-error`);
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
      }

      function clearErrors() {
        ["name", "email", "phone", "message"].forEach((field) => {
          const errorEl = document.getElementById(`${field}-error`);
          errorEl.textContent = "";
          errorEl.classList.add("hidden");
        });
      }

      // Form Toggle
      const toggleBtn = document.getElementById("wa-toggle");
      const formContainer = document.getElementById("wa-form-container");
      const closeBtn = document.getElementById("close-wa-form");

      toggleBtn.addEventListener("click", () => {
        formContainer.classList.toggle("hidden");
      });

      closeBtn.addEventListener("click", () => {
        formContainer.classList.add("hidden");
      });