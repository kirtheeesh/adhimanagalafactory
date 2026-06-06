const pool = require('./backend/db');
async function run() {
    try {
        const [rows] = await pool.query("SELECT id, invoice_number, total_amount, status FROM sales_requests");
        console.log('All Sales Requests:', rows);
        const [history] = await pool.query("SELECT id, invoice_number, total_amount, status FROM sales_history");
        console.log('All Sales History:', history);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
