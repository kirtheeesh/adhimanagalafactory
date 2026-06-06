const pool = require('./backend/db');
async function run() {
    try {
        const [req] = await pool.query("SELECT * FROM sales_requests ORDER BY id DESC LIMIT 5");
        console.log('Latest Requests:', req);
        if (req.length > 0) {
            for (const r of req) {
                const [items] = await pool.query("SELECT * FROM sales_request_items WHERE sales_request_id = ?", [r.id]);
                console.log(`Items for Request ${r.id} (${r.invoice_number}):`, items);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
