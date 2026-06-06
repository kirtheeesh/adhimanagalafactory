const pool = require('./backend/db');
async function run() {
    try {
        const [req] = await pool.query("SELECT id, invoice_number, status FROM sales_requests WHERE invoice_number LIKE '%B004%'");
        console.log('Request Search:', req);
        
        const [hist] = await pool.query("SELECT id, invoice_number, sales_request_id FROM sales_history WHERE invoice_number LIKE '%B004%'");
        console.log('History Search:', hist);

        if (req.length > 0) {
            const [reqItems] = await pool.query("SELECT * FROM sales_request_items WHERE sales_request_id = ?", [req[0].id]);
            console.log('Request Items:', reqItems);
        }

        if (hist.length > 0) {
            const [histItems] = await pool.query("SELECT * FROM sales_history_items WHERE sales_history_id = ?", [hist[0].id]);
            console.log('History Items:', histItems);
        }
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
