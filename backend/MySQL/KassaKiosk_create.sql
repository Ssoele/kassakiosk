-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2015-11-20 10:04:35.588




-- tables
-- Table categories
CREATE TABLE categories (
    id int  NOT NULL,
    name varchar(255)  NOT NULL,
    visible bool  NOT NULL,
    CONSTRAINT categories_pk PRIMARY KEY (id)
);

-- Table kiosks
CREATE TABLE kiosks (
    id int  NOT NULL,
    name varchar(255)  NOT NULL,
    types_id int  NOT NULL,
    CONSTRAINT kiosks_pk PRIMARY KEY (id)
);

-- Table orders
CREATE TABLE orders (
    id int  NOT NULL,
    date_created timestamp  NOT NULL,
    date_finished timestamp  NULL,
    kiosks_id int  NOT NULL,
    CONSTRAINT orders_pk PRIMARY KEY (id)
);

-- Table orders_products
CREATE TABLE orders_products (
    id int  NOT NULL,
    orders_id int  NOT NULL,
    products_id int  NOT NULL,
    price decimal(6,2)  NOT NULL,
    CONSTRAINT orders_products_pk PRIMARY KEY (id)
);

-- Table products
CREATE TABLE products (
    id int  NOT NULL,
    categories_id int  NOT NULL,
    name varchar(255)  NOT NULL,
    price decimal(6,2)  NOT NULL,
    visible bool  NOT NULL,
    categories_id_sub int  NULL,
    CONSTRAINT products_pk PRIMARY KEY (id)
);

-- Table types
CREATE TABLE types (
    id int  NOT NULL,
    name varchar(255)  NOT NULL,
    CONSTRAINT types_pk PRIMARY KEY (id)
);





-- foreign keys
-- Reference:  kiosks_types (table: kiosks)


ALTER TABLE kiosks ADD CONSTRAINT kiosks_types FOREIGN KEY kiosks_types (types_id)
    REFERENCES types (id);
-- Reference:  orders_kiosks (table: orders)


ALTER TABLE orders ADD CONSTRAINT orders_kiosks FOREIGN KEY orders_kiosks (kiosks_id)
    REFERENCES kiosks (id);
-- Reference:  orders_products_orders (table: orders_products)


ALTER TABLE orders_products ADD CONSTRAINT orders_products_orders FOREIGN KEY orders_products_orders (orders_id)
    REFERENCES orders (id);
-- Reference:  orders_products_products (table: orders_products)


ALTER TABLE orders_products ADD CONSTRAINT orders_products_products FOREIGN KEY orders_products_products (products_id)
    REFERENCES products (id);
-- Reference:  products_categories (table: products)


ALTER TABLE products ADD CONSTRAINT products_categories FOREIGN KEY products_categories (categories_id)
    REFERENCES categories (id);
-- Reference:  products_categories_sub (table: products)


ALTER TABLE products ADD CONSTRAINT products_categories_sub FOREIGN KEY products_categories_sub (categories_id_sub)
    REFERENCES categories (id);



-- End of file.
