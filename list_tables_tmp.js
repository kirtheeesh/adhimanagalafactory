const pool = require('./backend/db');
async function run() {
    try {
        const [tables] = await pool.query("SHOW TABLES");
        console.log(JSON.stringify(tables.rows.map(r => Object.values(r)[0])));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
