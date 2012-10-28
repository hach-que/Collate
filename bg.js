// We need this to start the background script with the new
// Google Chrome policies.
document.addEventListener('DOMContentLoaded', function () {
    window.Backend = new Collate.Backend();
});
