const pool = require('./backend/db');
async function run() {
    try {
        const [req] = await pool.query("SELECT * FROM sales_requests WHERE invoice_number LIKE '%B004'");
        console.log('Request B004:', req);
        if (req.length > 0) {
            const [items] = await pool.query("SELECT * FROM sales_request_items WHERE sales_request_id = ?", [req[0].id]);
            console.log('Items for B004:', items);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
