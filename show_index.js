const pool = require('./backend/db');

async function showIndex() {
    try {
        const [rows] = await pool.query("SHOW INDEX FROM inventory_finished_product");
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

showIndex();
