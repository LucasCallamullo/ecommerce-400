

/// <reference path="../../../../home/static/home/js/base.js" />
/// <reference path="../../../../users/static/users/js/widget_login.js" />


document.addEventListener('DOMContentLoaded', () => {
    // FORM HANDLER INITIALIZATION
    // ----------------------------
    /**
     * Initializes form handling for the registration form.
     * Note: The widgetUserForms function is imported from widget_register.js
     * which is preloaded earlier in base.html due to its script placement.
     */
    const form = document.getElementById('register-form');
    if (form) {
        widgetUserForms(form, "Register");
    }

    // ACCOUNT BUTTON HANDLER
    const btn = document.getElementById('have-account');
    const userBtns = document.querySelectorAll('.user-button');
    btn.addEventListener('click', (e) => {
        const index = window.innerWidth >= 992 ? 1 : 0;
        const userLoginBtn = userBtns[index];

        if (userLoginBtn) {
            userLoginBtn.click();
            e.stopPropagation();
        }
    });
});