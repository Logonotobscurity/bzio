
INSERT INTO companies (company_id, company_name) VALUES
('CMP_001', 'SNF'),
('CMP_002', 'Dangote'),
('CMP_003', 'Multipro'),
('CMP_004', 'BUA Foods'),
('CMP_005', 'PZ Wilmar'),
('CMP_006', 'Apple and Pears'),
('CMP_007', 'Crown Flour Mills'),
('CMP_008', 'Mr Chef'),
('CMP_009', 'Sonia'),
('CMP_010', 'TGI');

INSERT INTO categories (category_id, category_name, category_slug, icon_emoji, description) VALUES
('CAT_001', 'Baking & Confectionery', 'baking-confectionery', '🍰', 'Sugar, flour, baking essentials'),
('CAT_002', 'Cooking Oils & Fats', 'cooking-oils-fats', '🍳', 'Cooking oils, spreads, mayonnaise'),
('CAT_003', 'Dairy', 'dairy', '🥛', 'Milk powders, dairy products'),
('CAT_004', 'Pasta, Rice & Grains', 'pasta-rice-grains', '🍝', 'Noodles, flour, grains'),
('CAT_005', 'Seasonings & Flavor', 'seasonings-flavor', '🧂', 'Seasonings, spices, flavor enhancers'),
('CAT_006', 'Beverages & Mixes', 'beverages-mixes', '🥃', 'Beverage mixes, drink powders');

INSERT INTO brands (brand_id, brand_name, brand_slug, company_id) VALUES
('BRA_001', 'Activa', 'activa', 'CMP_001'),
('BRA_002', 'Dangote', 'dangote', 'CMP_002'),
('BRA_003', 'Dano', 'dano', 'CMP_003'),
('BRA_004', 'Irs', 'irs', 'CMP_004'),
('BRA_005', 'Kings', 'kings', 'CMP_005'),
('BRA_006', 'Laziz', 'laziz', 'CMP_006'),
('BRA_007', 'Mamador', 'mamador', 'CMP_005'),
('BRA_008', 'Mamagold', 'mamagold', 'CMP_007'),
('BRA_009', 'Mimee', 'mimee', 'CMP_003'),
('BRA_010', 'Minimie', 'minimie', 'CMP_003'),
('BRA_011', 'Mr Chef', 'mr-chef', 'CMP_008'),
('BRA_012', 'Sonia', 'sonia', 'CMP_009'),
('BRA_013', 'Terra', 'terra', 'CMP_010'),
('BRA_014', 'Whippy', 'whippy', 'CMP_001');

INSERT INTO products (product_id, product_name, product_slug, sku, category_id, brand_id, company_id, cost_price_ngn, bzion_wholesale_price_ngn, bzion_bulk_price_10_ngn, market_retail_price_ngn, profit_per_unit_ngn, savings_vs_retail_pct) VALUES
('laziz_laziz_cooking_oil_1l', 'Laziz Cooking Oil 1L', 'laziz-cooking-oil-1l', 'SKU001', 'CAT_002', 'BRA_006', 'CMP_006', 604.84, 756.10, 733.41, 1000.00, 151.26, 24.4);
