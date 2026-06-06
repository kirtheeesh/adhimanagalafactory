const pool = require('./backend/db');

async function showCreate() {
    try {
        const [rows] = await pool.query("SHOW CREATE TABLE packing_sticker");
        console.log(rows[0]['Create Table']);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

showCreate();
