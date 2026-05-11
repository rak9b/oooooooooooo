const db = require('../../config/db');

async function updateBalance(userId, amount, type) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const query = type === 'DEPOSIT'
      ? 'UPDATE wallets SET balance = balance + ? WHERE user_id = ?'
      : 'UPDATE wallets SET balance = balance - ? WHERE user_id = ?';

    await conn.execute(query, [amount, userId]);
    await conn.execute('INSERT INTO transaction_ledger (user_id, amount, type) VALUES (?, ?, ?)', [userId, amount, type]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally { conn.release(); }
}
module.exports = { updateBalance };