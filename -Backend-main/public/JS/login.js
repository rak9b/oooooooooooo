import { API_V1 } from './serverConfig.js';

// ===== Toast Notification System =====
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 12px 24px; border-radius: 12px;
        color: white; font-weight: 600; z-index: 10000; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        transform: translateX(120%); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.style.transform = 'translateX(0)', 10);
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

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

    const username = e.target.querySelector('input[type="text"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    const btn = e.target.querySelector('button[type="submit"]');

    // Verify captcha
    const typed = (document.getElementById('validation-input')?.value || '').trim();
    if (!typed || typed !== window.__captchaCode) {
        showToast('Invalid validation code', 'error');
        genCaptcha();
        const inp = document.getElementById('validation-input');
        if (inp) { inp.value = ''; inp.focus(); }
        return;
    }

    if (btn) { 
        btn.disabled = true; 
        btn.textContent = 'Verifying Credentials...'; 
    }

    try {
        const response = await fetch(`${API_V1}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            showToast('Login successful! Redirecting...', 'success');
            
            // Save auth data
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('userId', result.data.user.id);
            localStorage.setItem('username', result.data.user.username);
            localStorage.setItem('userRole', result.data.user.role);
            localStorage.setItem('menus', JSON.stringify(result.data.menus));

            // Role-based redirect
            const role = result.data.user.role;
            let redirectPath = 'ui/dashboard/index.html'; 

            if (role === 'PLAYER') {
                redirectPath = 'ui/player/index.html';
            } else if (role === 'MASTER_AGENT') {
                redirectPath = 'ui/agent/index.html';
            }

            setTimeout(() => {
                window.location.href = redirectPath;
            }, 800);
        } else {
            showToast(result.message || 'Login failed', 'error');
            genCaptcha();
        }
    } catch (err) {
        showToast('Server connection failed!', 'error');
        console.error(err);
    } finally {
        if (btn) { 
            btn.disabled = false; 
            btn.textContent = 'Login to Dashboard'; 
        }
        const inp = document.getElementById('validation-input');
        if (inp) inp.value = '';
    }
});
