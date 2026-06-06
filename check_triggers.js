const pool = require('./backend/db');

async function checkTriggers() {
    try {
        const [rows] = await pool.query("SHOW TRIGGERS");
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkTriggers();
