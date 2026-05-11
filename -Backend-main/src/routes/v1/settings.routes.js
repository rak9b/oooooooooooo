const router = require("express").Router();
const { SystemSettings } = require("../../models");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize");
const { asyncHandler } = require("../../middleware/errorHandler");
const { success, error } = require("../../utils/apiResponse");
const AuditLog = require("../../core/audit.engine");

// Helper: get/set setting
async function getSetting(key) {
    const setting = await SystemSettings.findOne({ where: { key } });
    if (!setting) return null;
    try { return JSON.parse(setting.value); } catch { return setting.value; }
}

async function setSetting(key, value, category, userId) {
    const [setting, created] = await SystemSettings.findOrCreate({
        where: { key },
        defaults: { value: JSON.stringify(value), category, updatedBy: userId }
    });
    if (!created) {
        setting.value = JSON.stringify(value);
        setting.updatedBy = userId;
        await setting.save();
    }
    return setting;
}

// GET /api/v1/settings/defaults
router.get("/defaults", authenticate, authorize('SETTINGS:VIEW'), asyncHandler(async (req, res) => {
    const defaults = {
        minBet: await getSetting('min_bet') || 10,
        maxBet: await getSetting('max_bet') || 50000,
        defaultOdds: await getSetting('default_odds') || 1.5,
        commissionBase: await getSetting('commission_base') || 5,
        maxExposure: await getSetting('max_exposure') || 100000,
        maxLiability: await getSetting('max_liability') || 100000
    };
    return success(res, defaults);
}));

// PATCH /api/v1/settings/defaults
router.patch("/defaults", authenticate, authorize('SETTINGS:UPDATE'), asyncHandler(async (req, res) => {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
        await setSetting(key, value, 'defaults', req.user.id);
    }

    await AuditLog.create({
        userId: req.user.id, action: "SETTINGS_UPDATED",
        description: `Updated defaults: ${Object.keys(updates).join(', ')}`, ipAddress: req.ip
    });

    return success(res, null, "Default settings updated");
}));

// GET /api/v1/settings/risk-limits
router.get("/risk-limits", authenticate, authorize('RISK:VIEW'), asyncHandler(async (req, res) => {
    const limits = {
        maxBet: await getSetting('max_bet') || 50000,
        maxLoss: await getSetting('max_loss') || 100000,
        maxExposure: await getSetting('max_exposure') || 100000,
        maxLiability: await getSetting('max_liability') || 100000
    };
    return success(res, limits);
}));

// PATCH /api/v1/settings/risk-limits
router.patch("/risk-limits", authenticate, authorize('RISK:UPDATE'), asyncHandler(async (req, res) => {
    const { maxBet, maxLoss, maxExposure, maxLiability } = req.body;
    if (maxBet) await setSetting('max_bet', maxBet, 'risk', req.user.id);
    if (maxLoss) await setSetting('max_loss', maxLoss, 'risk', req.user.id);
    if (maxExposure) await setSetting('max_exposure', maxExposure, 'risk', req.user.id);
    if (maxLiability) await setSetting('max_liability', maxLiability, 'risk', req.user.id);

    return success(res, null, "Risk limits updated");
}));

// GET /api/v1/settings/concurrent-users
router.get("/concurrent-users", authenticate, authorize('SETTINGS:VIEW'), asyncHandler(async (req, res) => {
    const limit = await getSetting('max_concurrent_sessions') || 3;
    return success(res, { maxConcurrentSessions: limit });
}));

// PATCH /api/v1/settings/concurrent-users
router.patch("/concurrent-users", authenticate, authorize('SETTINGS:UPDATE'), asyncHandler(async (req, res) => {
    await setSetting('max_concurrent_sessions', req.body.maxConcurrentSessions, 'security', req.user.id);
    return success(res, null, "Concurrent users limit updated");
}));

// GET /api/v1/settings/p2p
router.get("/p2p", authenticate, authorize('SETTINGS:VIEW'), asyncHandler(async (req, res) => {
    const data = {
        enabled: await getSetting('p2p_enabled') || false,
        maxTransferAmount: await getSetting('p2p_max_amount') || 10000,
        minTransferAmount: await getSetting('p2p_min_amount') || 100
    };
    return success(res, data);
}));

// PATCH /api/v1/settings/p2p
router.patch("/p2p", authenticate, authorize('SETTINGS:UPDATE'), asyncHandler(async (req, res) => {
    const { enabled, maxTransferAmount, minTransferAmount } = req.body;
    if (enabled !== undefined) await setSetting('p2p_enabled', enabled, 'p2p', req.user.id);
    if (maxTransferAmount) await setSetting('p2p_max_amount', maxTransferAmount, 'p2p', req.user.id);
    if (minTransferAmount) await setSetting('p2p_min_amount', minTransferAmount, 'p2p', req.user.id);

    return success(res, null, "P2P settings updated");
}));

// GET /api/v1/settings/sports-main-market
router.get("/sports-main-market", authenticate, authorize('SETTINGS:VIEW'), asyncHandler(async (req, res) => {
    const config = await getSetting('sports_main_market') || { cricket: true, football: true, tennis: true, basketball: false };
    return success(res, config);
}));

// PATCH /api/v1/settings/sports-main-market
router.patch("/sports-main-market", authenticate, authorize('SETTINGS:UPDATE'), asyncHandler(async (req, res) => {
    await setSetting('sports_main_market', req.body, 'sports', req.user.id);
    return success(res, null, "Sports main market updated");
}));

// GET /api/v1/settings/all
router.get("/all", authenticate, authorize('SETTINGS:VIEW'), asyncHandler(async (req, res) => {
    const { category } = req.query;
    const where = {};
    if (category) where.category = category;

    const settings = await SystemSettings.findAll({ where, order: [['category', 'ASC'], ['key', 'ASC']] });
    const parsed = settings.map(s => ({
        ...s.toJSON(),
        value: (() => { try { return JSON.parse(s.value); } catch { return s.value; } })()
    }));

    return success(res, parsed);
}));

module.exports = router;
