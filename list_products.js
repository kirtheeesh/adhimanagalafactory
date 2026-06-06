const pool = require('./backend/db');
async function check() {
    try {
        const [rows] = await pool.query("SELECT id, product_name FROM inventory_product");
        console.table(rows);
    } catch (err) { console.error(err); }
    finally { process.exit(); }
}
check();
