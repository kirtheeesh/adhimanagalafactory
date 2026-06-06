const pool = require('./backend/db');
async function check() {
    try {
        const tables = ['packing_sticker'];
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
