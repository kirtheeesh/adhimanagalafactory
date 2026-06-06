const pool = require('./backend/db');
async function run() {
    try {
        const [req] = await pool.query("SELECT * FROM sales_requests WHERE total_amount LIKE '%35400%'");
        console.log('Requests with 35400:', req);
        const [hist] = await pool.query("SELECT * FROM sales_history WHERE total_amount LIKE '%35400%'");
        console.log('History with 35400:', hist);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
