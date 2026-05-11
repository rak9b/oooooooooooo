// কমন ফাংশন: ইউজার ইনফো ফেচ (JWT দিয়ে)
async function fetchUserInfo(token) {
    try {
        const res = await fetch('/api/auth/user-info', { // ধরে নেওয়া API endpoint (ব্যাকেন্ডে অ্যাড করো যদি না থাকে)
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('Unauthorized');
        return await res.json();
    } catch (err) {
        console.error(err);
        window.location.href = '/login.html'; // লগইন পেজে রিডিরেক্ট
    }
}

// লগইন ফাংশন (যদি লগইন পেজ থেকে কল হয়)
async function loginUser(username, password) {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('siteTheme', JSON.stringify({ /* থিম ডাটা সেভ */ }));
            window.location.href = '/dashboard/index.html'; // ড্যাশবোর্ডে রিডিরেক্ট
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('লগইন ফেল হয়েছে!');
    }
}

// রেজিস্ট্রেশন ফাংশন
async function registerUser(username, password, referral_code) {
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, referral_code })
        });
        const data = await res.json();
        if (data.success) {
            alert('রেজিস্ট্রেশন সফল!');
            // লগইন করো বা রিডিরেক্ট
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('রেজিস্ট্রেশন ফেল হয়েছে!');
    }
}

// ডাইনামিক থিম অ্যাপ্লাই (পেজ লোডে কল করো)
function applyTheme(theme) {
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.getElementById('site-title').textContent = theme.title || 'প্ল্যাটফর্ম';
    if (theme.logo) {
        document.getElementById('logo-container').innerHTML = `<img src="${theme.logo}" alt="Logo">`;
    }
}

// এজেন্ট পেমেন্ট ইনফো ফেচ (প্লেয়ারের জন্য)
async function fetchAgentPayment(token) {
    try {
        const res = await fetch('/api/player/deposit-info', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (err) {
        console.error(err);
        return null;
    }
}