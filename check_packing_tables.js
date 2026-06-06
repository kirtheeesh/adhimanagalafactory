const pool = require('./backend/db');
async function check() {
    try {
        const tables = ['inventory_product', 'inventory_finished_product', 'finished_goods_box_records'];
        for (const table of tables) {
            try {
                const [cols] = await pool.query(`DESCRIBE ${table}`);
                console.log(`--- ${table} ---`);
                console.table(cols.map(c => ({ Field: c.Field, Type: c.Type })));
            } catch (e) {
                console.log(`--- ${table} --- MISSING or ERROR: ${e.message}`);
            }
        }
    } catch (err) { console.error(err); }
    finally { process.exit(); }
}
check();
