import { API_V1 } from './serverConfig.js';

// ===== Validation code (CAPTCHA) =====
function genCaptcha() {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const box = document.getElementById('captcha-code');
    if (box) box.textContent = code;
    window.__captchaCode = code;
}
genCaptcha();
const captchaBox = document.getElementById('captcha-code');
if (captchaBox) captchaBox.addEventListener('click', () => {
    genCaptcha();
    const inp = document.getElementById('validation-input');
    if (inp) inp.value = '';
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = e.target[0].value;
    const password = e.target[1].value;
    const btn = e.target.querySelector('button[type="submit"]') || e.target.querySelector('button');

    // Verify captcha BEFORE hitting the backend
    const typed = (document.getElementById('validation-input')?.value || '').trim();
    if (!typed || typed !== window.__captchaCode) {
        alert('Invalid validation code. Please re-enter the code shown.');
        genCaptcha();
        const inp = document.getElementById('validation-input');
        if (inp) { inp.value = ''; inp.focus(); }
        return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }

    try {
        const response = await fetch(`${API_V1}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            // Save auth data
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('userId', result.data.user.id);
            localStorage.setItem('username', result.data.user.username);
            localStorage.setItem('userRole', result.data.user.role);
            localStorage.setItem('menus', JSON.stringify(result.data.menus));

            // Role-based redirect — only PLAYER and MASTER_AGENT get separate UIs
            const role = result.data.user.role;
            let redirectPath = 'ui/dashboard/index.html'; // default: admin panel

            if (role === 'PLAYER') {
                redirectPath = 'ui/player/index.html';
            } else if (role === 'MASTER_AGENT') {
                redirectPath = 'ui/agent/index.html';
            }
            // All other roles use the main admin dashboard:
            // OWNER, MOTHER_PANEL, WHITE_LABEL, SUPER_ADMIN, ADMIN,
            // B2C_SUB_ADMIN, B2B_SUB_ADMIN, SENIOR_AFFILIATE, AFFILIATE, SUPER_AGENT

            window.location.href = redirectPath;
        } else {
            alert(result.message || 'Login failed');
        }
    } catch (err) {
        alert('Server connection failed!');
        console.error(err);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
        // Always rotate the captcha after an attempt so the same code can't be reused
        genCaptcha();
        const inp = document.getElementById('validation-input');
        if (inp) inp.value = '';
    }
});
