form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors();

    let isFormValid = true;
    Object.keys(validationRules).forEach(fieldId => {
        if (!validateField(document.getElementById(fieldId))) {
            isFormValid = false;
        }
    });

    if (isFormValid) {
        buttonText.classList.add('hidden');
        buttonSpinner.classList.remove('hidden');
        submitButton.disabled = true;

        // ⚠️ POINT TO YOUR NEW PHP SCRIPT
        const scriptURL = 'save-contact.php'; 
        const formData = new FormData(form);
        formData.set('phone', iti.getNumber());

        // UPDATED FETCH BLOCK
        fetch(scriptURL, { 
            method: 'POST', 
            body: formData 
        })
        .then(response => response.json()) // Expect a JSON response from PHP
        .then(data => {
            console.log('Server Response:', data);
            if (data.success) {
                form.classList.add('hidden');
                successMessage.classList.remove('hidden');
                setTimeout(() => closeForm(), 3000);
            } else {
                // If the server script returns an error
                alert("Submission failed: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error!', error);
            alert("There was a network error submitting the form. Please try again.");
        })
        .finally(() => {
            buttonText.classList.remove('hidden');
            buttonSpinner.classList.add('hidden');
            submitButton.disabled = false;
        });
    }
});