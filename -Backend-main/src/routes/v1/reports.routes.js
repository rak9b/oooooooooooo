const router = require("express").Router();
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize");
const { asyncHandler } = require("../../middleware/errorHandler");
const { success, error } = require("../../utils/apiResponse");
const reportEngine = require("../../core/report.engine");
const commissionEngine = require("../../core/commission.engine");
const { Transaction } = require("../../models");
const { isInDownline } = require("../../services/hierarchyService");

// GET /api/v1/reports/my-summary
router.get("/my-summary", authenticate, asyncHandler(async (req, res) => {
    const report = await reportEngine.getUserReport(req.user.id);
    return success(res, report, "My report summary");
}));

// GET /api/v1/reports/my-turnover
router.get("/my-turnover", authenticate, asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await reportEngine.getTurnoverReport(req.user.id, startDate, endDate);
    return success(res, data, "My turnover");
}));

// GET /api/v1/reports/my-commission
router.get("/my-commission", authenticate, asyncHandler(async (req, res) => {
    const total = await commissionEngine.getUserCommissions(req.user.id);
    const { startDate, endDate } = req.query;
    const history = await commissionEngine.getCommissionsByPeriod(req.user.id, startDate, endDate);
    return success(res, { total, history }, "My commissions");
}));

// GET /api/v1/reports/my-profit-loss
router.get("/my-profit-loss", authenticate, asyncHandler(async (req, res) => {
    const report = await reportEngine.getUserReport(req.user.id);
    return success(res, {
        totalStake: report.totalStake,
        totalPayout: report.totalPayout,
        profit: report.profit,
        winRate: report.winRate
    }, "My profit/loss");
}));

// GET /api/v1/reports/my-deposits
router.get("/my-deposits", authenticate, asyncHandler(async (req, res) => {
    const deposits = await Transaction.findAll({
        where: { userId: req.user.id, type: 'DEPOSIT' },
        order: [['createdAt', 'DESC']], limit: 50
    });
    return success(res, deposits, "My deposits");
}));

// GET /api/v1/reports/my-withdrawals
router.get("/my-withdrawals", authenticate, asyncHandler(async (req, res) => {
    const withdrawals = await Transaction.findAll({
        where: { userId: req.user.id, type: 'WITHDRAW' },
        order: [['createdAt', 'DESC']], limit: 50
    });
    return success(res, withdrawals, "My withdrawals");
}));

// GET /api/v1/reports/match/:matchId
router.get("/match/:matchId", authenticate, authorize('REPORT:VIEW'), asyncHandler(async (req, res) => {
    const report = await reportEngine.getMatchReport(req.params.matchId);
    return success(res, report, "Match report");
}));

// GET /api/v1/reports/user/:userId — with downline scope validation
router.get("/user/:userId", authenticate, authorize('REPORT:VIEW'), asyncHandler(async (req, res) => {
    const allowed = await isInDownline(req.user.id, req.params.userId, req.user.role);
    if (!allowed) return error(res, "Access denied — user is not in your downline", 403, "SCOPE_VIOLATION");

    const report = await reportEngine.getUserReport(req.params.userId);
    return success(res, report, "User report");
}));

// GET /api/v1/reports/audit/:userId — with downline scope validation
router.get("/audit/:userId", authenticate, authorize('SURVEILLANCE:VIEW'), asyncHandler(async (req, res) => {
    const allowed = await isInDownline(req.user.id, req.params.userId, req.user.role);
    if (!allowed) return error(res, "Access denied — user is not in your downline", 403, "SCOPE_VIOLATION");

    const trail = await reportEngine.getAuditTrail(req.params.userId);
    return success(res, trail, "Audit trail");
}));

module.exports = router;
