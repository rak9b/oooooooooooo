const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { logAction } = require('../utils/auditLogger');

// ১. নতুন ইউজার তৈরি (Add Mother Panel, Super Admin ইত্যাদি)
exports.createUser = async (req, res) => {
    try {
        const { username, password, role_to_create, commission } = req.body;
        const creatorId = req.user.id; // লগইন করা ইউজারের আইডি
        const creatorName = req.user.username;

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute(
            `INSERT INTO users (username, password, role, parent_id, created_by_name, commission_rate) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [username, hashedPassword, role_to_create, creatorId, creatorName, commission || 0]
        );

        res.json({ success: true, message: `${role_to_create} সফলভাবে তৈরি হয়েছে!` });
    } catch (err) {
        res.status(500).json({ success: false, message: "ইউজার তৈরি হয়নি। নাম চেক করুন।" });
    }
};

// ২. ব্যালেন্স কন্ট্রোল (Deposit/Withdraw)
exports.handleBalance = async (req, res) => {
    await logAction(req.user.id, "Deposit Done", req.ip);
    const { targetId, amount, type } = req.body; // type: 'add' or 'subs'
    const math = type === 'add' ? '+' : '-';
    await pool.execute(`UPDATE users SET balance = balance ${math} ? WHERE id = ?`, [amount, targetId]);
    res.json({ success: true, message: "ব্যালেন্স আপডেট হয়েছে।" });
};

// ৩. পাসওয়ার্ড রিসেট ও স্ট্যাটাস চেঞ্জ
exports.userAction = async (req, res) => {
    const { targetId, action, value } = req.body;
    if (action === 'password') {
        const hash = await bcrypt.hash(value, 10);
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hash, targetId]);
    } else if (action === 'status') {
        await pool.execute('UPDATE users SET status = ? WHERE id = ?', [value, targetId]);
    }
    res.json({ success: true, message: "অ্যাকশন সফল!" });
};



// ১. জেনারেল এবং ইউজার সেটিংস
exports.handleUserAction = async (req, res) => {
    const { action, targetId, value, data } = req.body;
    try {
        switch (action) {
            case 'CHANGE_PASSWORD':
                const hash = await bcrypt.hash(value, 10);
                await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hash, targetId]);
                return res.json({ success: true, message: "পাসওয়ার্ড আপডেট সফল!" });

            case 'DEPOSIT_CHIPS':
                await logAction(req.user.id, "Deposit Done", req.ip);
                await pool.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [value, targetId]);
                return res.json({ success: true, message: "ব্যালেন্স জমা হয়েছে।" });

            case 'SEARCH_USER':
                const [users] = await pool.execute('SELECT * FROM users WHERE username LIKE ?', [`%${value}%`]);
                return res.json({ success: true, data: users });

            case 'UPDATE_STATUS': // In-active, Bet Locked, Deleted
                await pool.execute('UPDATE users SET status = ? WHERE id = ?', [value, targetId]);
                return res.json({ success: true, message: "স্ট্যাটাস আপডেট হয়েছে।" });

            default: return res.status(400).json({ success: false, message: "অ্যাকশন খুঁজে পাওয়া যায়নি।" });
        }
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ২. ওয়েবসাইট এবং মেসেজ সেটিংস
exports.updateSystemSettings = async (req, res) => {
    const { type, settings } = req.body;
    // settings: { site_name, logo, notice, min_bet, max_bet }
    try {
        const jsonSettings = JSON.stringify(settings);
        await pool.execute('UPDATE system_settings SET config_data = ? WHERE setting_type = ?', [jsonSettings, type]);
        res.json({ success: true, message: "সিস্টেম আপডেট সফল!" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ৩. ম্যাচ এবং বেট কন্ট্রোল
exports.handleMatchAction = async (req, res) => {
    const { matchId, action, value } = req.body;
    try {
        if (action === 'TOGGLE_MATCH') {
            await pool.execute('UPDATE matches SET is_active = ? WHERE id = ?', [value, matchId]);
        } else if (action === 'RESULT_SET') {
            await pool.execute('UPDATE matches SET status = "completed", result = ? WHERE id = ?', [value, matchId]);
        }
        res.json({ success: true, message: "ম্যাচ আপডেট সফল!" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};