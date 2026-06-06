SELECT p.id as pid, p.product_name, p.closing_stock as p_stock, sf.id as sfid, sf.product_name as sf_name, sf.closing_stock as sf_stock, sf.semi_product_type as type 
FROM inventory_product p 
JOIN product_semi_finished_map m ON p.id = m.product_id 
JOIN inventory_semi_finished sf ON m.semi_finished_product_id = sf.id 
WHERE sf.id = 13 OR p.product_name = 'TEST';