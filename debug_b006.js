const pool = require('./backend/db');
async function debug() {
  try {
    const [h] = await pool.query('SELECT * FROM sales_history WHERE invoice_number = "26-27/AMI/B006"');
    console.log('History:', JSON.stringify(h, null, 2));
    if (h.length > 0) {
      const [items] = await pool.query('SELECT * FROM sales_history_items WHERE sales_history_id = ?', [h[0].id]);
      console.log('Items:', JSON.stringify(items, null, 2));
    } else {
      console.log('Invoice B006 not found in sales_history');
      const [r] = await pool.query('SELECT * FROM sales_requests WHERE invoice_number = "26-27/AMI/B006"');
      console.log('Requests:', JSON.stringify(r, null, 2));
      if (r.length > 0) {
        const [rItems] = await pool.query('SELECT * FROM sales_request_items WHERE sales_request_id = ?', [r[0].id]);
        console.log('Request Items:', JSON.stringify(rItems, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
debug();
