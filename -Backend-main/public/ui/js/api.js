/*  ============================================
    ExistingSky — Frontend API Module (v1)
    All API calls to backend /api/v1 endpoints
    ============================================ */

const BASE = window.location.origin + "/api/v1";

function getToken() {
    return localStorage.getItem("token") || "";
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

// Generic API call wrapper
async function api(endpoint, method = "GET", body = null) {
    const options = { method, headers: authHeaders() };
    if (body && method !== "GET") options.body = JSON.stringify(body);

    try {
        const res = await fetch(`${BASE}${endpoint}`, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("API Error:", err);
        return { success: false, message: "Network error" };
    }
}

// ==================== AUTH ====================
const Auth = {
    login: (username, password) => api("/auth/login", "POST", { username, password }),
    me: () => api("/auth/me"),
    changePassword: (oldPassword, newPassword) => api("/auth/change-password", "PATCH", { oldPassword, newPassword }),
    sessions: () => api("/auth/me/sessions")
};

// ==================== USERS / DOWNLINE ====================
const Users = {
    downline: (page = 1, limit = 20, search = "") => api(`/users/downline?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`),
    search: (q) => api(`/users/search?q=${q}`),
    create: (data) => api("/users/create", "POST", data),
    getById: (id) => api(`/users/${id}`),
    getWallet: (id) => api(`/users/${id}/wallet`),
    changeStatus: (id, status) => api(`/users/${id}/status`, "PATCH", { status }),
    setCommission: (id, commissionRate) => api(`/users/${id}/commission`, "PATCH", { commissionRate: Number(commissionRate) }),
    toggleBetLock: (id) => api(`/users/${id}/bet-lock`, "PATCH"),
    restore: (id) => api(`/users/${id}/restore`, "PATCH"),
    remove: (id) => api(`/users/${id}`, "DELETE"),
    changeUserPassword: (id, newPassword) => api(`/users/${id}/change-password`, "POST", { userId: Number(id), newPassword }),
    inactive: () => api("/users/filter/inactive"),
    betLocked: () => api("/users/filter/bet-locked"),
    deleted: () => api("/users/filter/deleted"),
    // Affiliate KYC (downline-scoped)
    affiliatePlayers: (status = "", page = 1, limit = 50, search = "") =>
        api(`/users/affiliate/players?status=${status}&page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`),
    getKyc: (id) => api(`/users/${id}/kyc`),
    updateKyc: (id, data) => api(`/users/${id}/kyc`, "PATCH", data)
};

// ==================== BANKING ====================
const Banking = {
    ledger: (page = 1, limit = 20, type = "") => api(`/banking/ledger?page=${page}&limit=${limit}${type ? `&type=${type}` : ""}`),
    deposits: () => api("/banking/deposits"),
    withdrawals: () => api("/banking/withdrawals"),
    depositManual: (userId, amount, description = "") => api("/banking/deposit/manual", "POST", { userId, amount, description }),
    withdrawManual: (userId, amount, description = "") => api("/banking/withdraw/manual", "POST", { userId, amount, description }),
    transfer: (toUserId, amount, description = "") => api("/banking/transfer", "POST", { toUserId, amount, description }),
    // Deposit requests
    depositRequests: (status = "PENDING") => api(`/banking/deposit-requests?status=${status}`),
    createDepositRequest: (data) => api("/banking/deposit-requests", "POST", data),
    approveDeposit: (id) => api(`/banking/deposit-requests/${id}/approve`, "POST"),
    rejectDeposit: (id, reason = "") => api(`/banking/deposit-requests/${id}/reject`, "POST", { reason }),
    // Withdraw requests
    withdrawRequests: (status = "PENDING") => api(`/banking/withdraw-requests?status=${status}`),
    createWithdrawRequest: (data) => api("/banking/withdraw-requests", "POST", data),
    approveWithdraw: (id) => api(`/banking/withdraw-requests/${id}/approve`, "POST"),
    rejectWithdraw: (id, reason = "") => api(`/banking/withdraw-requests/${id}/reject`, "POST", { reason }),
    holdWithdraw: (id) => api(`/banking/withdraw-requests/${id}/hold`, "POST"),
    // Affiliate-scoped withdraw management (only requests from caller's downline)
    affiliateWithdrawRequests: (status = "PENDING", page = 1, limit = 50, search = "") =>
        api(`/banking/affiliate/withdraw-requests?status=${status}&page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`),
    affiliateWithdrawSummary: () => api(`/banking/affiliate/withdraw-summary`),
    affiliateApproveWithdraw: (id) => api(`/banking/affiliate/withdraw-requests/${id}/approve`, "POST"),
    affiliateRejectWithdraw: (id, reason = "") => api(`/banking/affiliate/withdraw-requests/${id}/reject`, "POST", { reason }),
    affiliateHoldWithdraw: (id) => api(`/banking/affiliate/withdraw-requests/${id}/hold`, "POST"),
    // Methods
    methods: () => api("/banking/methods"),
    createMethod: (data) => api("/banking/methods", "POST", data),
    updateMethod: (id, data) => api(`/banking/methods/${id}`, "PATCH", data),
    deleteMethod: (id) => api(`/banking/methods/${id}`, "DELETE")
};

// ==================== BETS ====================
const Bets = {
    list: (page = 1, limit = 20, status = "") => api(`/bets?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`),
    live: () => api("/bets/live"),
    liveExposure: () => api("/bets/live/exposure"),
    liveRisk: () => api("/bets/live/risk"),
    riskSummary: () => api("/bets/risk-summary"),
    cheat: () => api("/bets/cheat"),
    getById: (id) => api(`/bets/${id}`),
    place: (data) => api("/bets/place", "POST", data),
    reject: (id) => api(`/bets/${id}/reject`, "PATCH"),
    markCheat: (id, reason = "") => api(`/bets/${id}/mark-cheat`, "PATCH", { reason }),
    myBets: (page = 1) => api(`/bets/user/my-bets?page=${page}`)
};

// ==================== MATCHES ====================
const Matches = {
    list: (page = 1, status = "") => api(`/matches?page=${page}${status ? `&status=${status}` : ""}`),
    create: (data) => api("/matches", "POST", data),
    update: (id, data) => api(`/matches/${id}`, "PATCH", data),
    changeStatus: (id, status) => api(`/matches/${id}/status`, "PATCH", { status }),
    markets: () => api("/matches/markets"),
    blockMarket: (id) => api(`/matches/markets/${id}/block`, "PATCH"),
    unblockMarket: (id) => api(`/matches/markets/${id}/unblock`, "PATCH"),
    addMarket: (matchId, data) => api(`/matches/${matchId}/markets`, "POST", data),
    fancy: () => api("/matches/fancy"),
    toggleFancy: (id) => api(`/matches/fancy/${id}/status`, "PATCH"),
    settle: (matchId, winningSelection) => api("/matches/settle", "POST", { matchId, winningSelection }),
    leagues: () => api("/matches/leagues"),
    createLeague: (data) => api("/matches/leagues", "POST", data)
};

// ==================== RESULTS ====================
const Results = {
    pending: () => api("/results/pending"),
    declare: (data) => api("/results/declare", "POST", data),
    fancyDeclare: (data) => api("/results/fancy-declare", "POST", data),
    hold: (id, reason = "") => api(`/results/${id}/hold`, "PATCH", { reason }),
    release: (id) => api(`/results/${id}/release`, "PATCH"),
    rollback: (id) => api(`/results/${id}/rollback`, "PATCH"),
    suspended: () => api("/results/suspended"),
    history: (page = 1) => api(`/results/history?page=${page}`),
    getById: (id) => api(`/results/${id}`)
};

// ==================== REPORTS ====================
const Reports = {
    mySummary: () => api("/reports/my-summary"),
    myTurnover: (startDate, endDate) => api(`/reports/my-turnover?${startDate ? `startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`),
    myCommission: () => api("/reports/my-commission"),
    myProfitLoss: () => api("/reports/my-profit-loss"),
    myDeposits: () => api("/reports/my-deposits"),
    myWithdrawals: () => api("/reports/my-withdrawals"),
    matchReport: (matchId) => api(`/reports/match/${matchId}`),
    userReport: (userId) => api(`/reports/user/${userId}`),
    auditTrail: (userId) => api(`/reports/audit/${userId}`)
};

// ==================== SETTINGS ====================
const Settings = {
    defaults: () => api("/settings/defaults"),
    updateDefaults: (data) => api("/settings/defaults", "PATCH", data),
    riskLimits: () => api("/settings/risk-limits"),
    updateRiskLimits: (data) => api("/settings/risk-limits", "PATCH", data),
    concurrentUsers: () => api("/settings/concurrent-users"),
    updateConcurrentUsers: (max) => api("/settings/concurrent-users", "PATCH", { maxConcurrentSessions: max }),
    p2p: () => api("/settings/p2p"),
    updateP2P: (data) => api("/settings/p2p", "PATCH", data),
    sportsMainMarket: () => api("/settings/sports-main-market"),
    updateSportsMainMarket: (data) => api("/settings/sports-main-market", "PATCH", data),
    all: (category = "") => api(`/settings/all${category ? `?category=${category}` : ""}`)
};

// ==================== MESSAGES ====================
const Messages = {
    all: (type = "") => api(`/messages${type ? `?type=${type}` : ""}`),
    sendUser: (title, content, targetUserId) => api("/messages/user", "POST", { title, content, targetUserId }),
    getUserMessages: () => api("/messages/user"),
    sendHyper: (title, content) => api("/messages/hyper", "POST", { title, content }),
    getHyper: () => api("/messages/hyper"),
    updateHyper: (id, data) => api(`/messages/hyper/${id}`, "PATCH", data),
    sendImportant: (title, content) => api("/messages/important", "POST", { title, content }),
    getImportant: () => api("/messages/important"),
    updateImportant: (id, data) => api(`/messages/important/${id}`, "PATCH", data),
    sendImage: (title, imageUrl, content = "") => api("/messages/image", "POST", { title, imageUrl, content }),
    getImages: () => api("/messages/image"),
    remove: (id) => api(`/messages/${id}`, "DELETE")
};

// ==================== WEBSITE ====================
const Website = {
    settings: () => api("/website/settings"),
    updateSettings: (data) => api("/website/settings", "PATCH", data),
    allSettings: () => api("/website/all-settings"),
    updateAllSettings: (data) => api("/website/all-settings", "PATCH", data),
    banners: () => api("/website/banners"),
    addBanner: (data) => api("/website/banners", "POST", data),
    deleteBanner: (id) => api(`/website/banners/${id}`, "DELETE"),
    dashboardImages: () => api("/website/dashboard-images"),
    addDashboardImage: (data) => api("/website/dashboard-images", "POST", data),
    deleteDashboardImage: (id) => api(`/website/dashboard-images/${id}`, "DELETE"),
    whitelabels: () => api("/website/whitelabels"),
    createWhitelabel: (data) => api("/website/whitelabels", "POST", data),
    updateWhitelabel: (id, data) => api(`/website/whitelabels/${id}`, "PATCH", data),
    whitelabelLimit: () => api("/website/whitelabel-limit"),
    updateWhitelabelLimit: (limit) => api("/website/whitelabel-limit", "PATCH", { limit }),
    // CMS — branding / theme / domains / notice
    branding: () => api("/website/branding"),
    updateBranding: (data) => api("/website/branding", "PATCH", data),
    theme: () => api("/website/theme"),
    updateTheme: (data) => api("/website/theme", "PATCH", data),
    notice: () => api("/website/notice"),
    updateNotice: (data) => api("/website/notice", "PATCH", data),
    domains: () => api("/website/domains"),
    updateDomains: (list) => api("/website/domains", "PATCH", { domains: list }),
    // CMS — collections (games, social-links, mobile-banners)
    games: () => api("/website/games"),
    addGame: (data) => api("/website/games", "POST", data),
    updateGame: (id, data) => api(`/website/games/${id}`, "PATCH", data),
    deleteGame: (id) => api(`/website/games/${id}`, "DELETE"),
    socialLinks: () => api("/website/social-links"),
    addSocialLink: (data) => api("/website/social-links", "POST", data),
    updateSocialLink: (id, data) => api(`/website/social-links/${id}`, "PATCH", data),
    deleteSocialLink: (id) => api(`/website/social-links/${id}`, "DELETE"),
    mobileBanners: () => api("/website/mobile-banners"),
    addMobileBanner: (data) => api("/website/mobile-banners", "POST", data),
    updateMobileBanner: (id, data) => api(`/website/mobile-banners/${id}`, "PATCH", data),
    deleteMobileBanner: (id) => api(`/website/mobile-banners/${id}`, "DELETE")
};

// ==================== PUBLIC (no-auth) ====================
const Public = {
    siteConfig: () => api("/website/public/site-config")
};

// ==================== UPLOAD ====================
async function uploadMultipart(endpoint, file) {
    const fd = new FormData();
    fd.append("file", file);
    try {
        const res = await fetch(`${BASE}${endpoint}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${getToken()}` },
            body: fd
        });
        return await res.json();
    } catch (err) {
        console.error("Upload error:", err);
        return { success: false, message: "Upload failed" };
    }
}
const Upload = {
    image: (file) => uploadMultipart("/upload/image", file)
};

// ==================== PERMISSIONS ====================
const Permissions = {
    roles: () => api("/permissions/roles"),
    modules: () => api("/permissions/modules"),
    matrix: () => api("/permissions/matrix"),
    getRole: (role) => api(`/permissions/${role}`),
    updateRole: (role, permissions) => api(`/permissions/${role}`, "PATCH", { permissions }),
    clone: (sourceRole, targetRole) => api("/permissions/clone", "POST", { sourceRole, targetRole })
};

// ==================== SURVEILLANCE ====================
const Surveillance = {
    logs: (page = 1, userId = "", action = "") => api(`/surveillance/logs?page=${page}${userId ? `&userId=${userId}` : ""}${action ? `&action=${action}` : ""}`),
    multiLogin: () => api("/surveillance/multi-login"),
    abuse: () => api("/surveillance/abuse"),
    cheatBets: () => api("/surveillance/cheat-bets"),
    suspicious: (userId) => api(`/surveillance/suspicious/${userId}`)
};

// ==================== COMPANY PAYMENT ====================
const CompanyPayment = {
    summary: () => api("/company-payment/summary"),
    ledger: (page = 1, type = "") => api(`/company-payment/ledger?page=${page}${type ? `&type=${type}` : ""}`),
    settlement: (data) => api("/company-payment/settlement", "POST", data),
    commissionPayout: (data) => api("/company-payment/commission-payout", "POST", data)
};

// ==================== EXPORT ALL ====================
// Make available globally for inline scripts
// Backend host (without /api/v1) — for resolving /uploads/* image URLs
const HOST = BASE.replace(/\/api\/v1$/, "");
window.API = { Auth, Users, Banking, Bets, Matches, Results, Reports, Settings, Messages, Website, Permissions, Surveillance, CompanyPayment, Public, Upload, BASE, HOST };
