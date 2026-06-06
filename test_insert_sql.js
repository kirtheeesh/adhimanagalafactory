const pool = require('./backend/db');
async function test() {
    const client = await pool.getConnection();
    try {
        await client.beginTransaction();
        console.log('Testing insert into inventory_finished_product...');
        // Mock data
        const product_id = 1;
        const product_name = 'Test Product';
        const boxes = 1;
        const piecesPerBox = 10;
        const piecesToSubtract = 10;
        const weight = 0.5;
        const batch_number = 'TEST-BATCH-' + Date.now();
        const sticker_id = null;
        const box_size = 'Medium';
        const color_name = 'Red';

        const [res] = await client.query(
            `INSERT INTO inventory_finished_product 
             (product_id, product_name, stock_boxes, pieces_per_box, total_pieces, weight, batch_number, packing_sticker_id, box_size, color) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [product_id, product_name, boxes, piecesPerBox, piecesToSubtract, weight, batch_number, sticker_id, box_size, color_name]
        );
        console.log('Insert success, ID:', res.insertId);
    } catch (err) {
        console.error('SQL ERROR:', err.message);
    } finally {
        await client.rollback();
        client.release();
        process.exit();
    }
}
test();
