const pool = require('./backend/db');
async function check() {
  try {
    console.log('Checking packing_material_report...');
    const [cols] = await pool.query('DESCRIBE packing_material_report');
    console.table(cols);
    console.log('Checking packing_material_report_item...');
    const [colsItems] = await pool.query('DESCRIBE packing_material_report_item');
    console.table(colsItems);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}
check();