const allowed = await checkLimit(userId, stake);

if (!allowed) {
    return res.status(400).json({ error: "Exposure Limit Crossed" });
}