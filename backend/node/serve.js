"use strict"
var config      = require("../config.json");
var mysql       = require("mysql");
var express     = require("express");
var app         = express();
var server      = require("http").createServer(app);
var bodyParser  = require('body-parser');
//var io      = require("socket.io")(server);


server.listen(config.port);

app.set("case sensitive routing", true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// =====START=====
//      MySQL
// =====START=====
var connection = mysql.createConnection({
    host:       config.host,
    user:       config.user,
    password:   config.pass,
    database:   "kassakiosk"
});
connection.connect();
// ======END======
//      MySQL
// ======END======

/*io.on('connection', function(socket) {

});*/

app.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get("/products/get", function(req, res) {
    connection.query("SELECT categories.id, categories.name, categories.visible, categories.sort FROM categories ORDER BY categories.sort", [], function(err, result) {
        var response = [];
        if(err) {
            console.log(err);
        } else {
            var categoriesId = [];
            result.forEach(function(row) {
                categoriesId.push(row.id);

                response.push({
                    id: row.id,
                    name: row.name,
                    visible: row.visible,
                    sort: row.sort,
                    products: []
                });
            });

            connection.query("SELECT products.id, products.name, products.price, products.visible, products.sort, products.categories_id, products.categories_id_sub FROM products WHERE products.categories_id IN (?) ORDER BY products.sort", [categoriesId], function (err, result) {
                if(err) {
                    console.log(err);
                } else {
                    result.forEach(function(product) {
                        response.forEach(function(category) {
                            if(category.id == product.categories_id) {
                                category.products.push({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    visible: product.visible,
                                    sort: product.sort,
                                    categories_id_sub: product.categories_id_sub,
                                    image: "http://cdn.kassakiosk.be/images/products/"+product.id+"/image.png"
                                });
                            }
                        });
                    });
                    res.json(response);
                }
            });
        }
    });
});

app.post("/products/set/:productId([0-9]+)/visible", function(req, res) {
    var visible;
    if(req.body.visible) {
        visible = 1;
    } else {
        visible = 0;
    }
    connection.query("UPDATE products SET products.visible = ? WHERE products.id = ?", [visible, req.params.productId], function(err, result) {
        var response;
        if(err) {
            console.log(err);
            response = {
                success: false,
                error: err
            };
        } else {
            response = {
                success: true
            };
        }
        res.json(response);
    });
});

app.get("/orders/get/open", function(req, res) {
    connection.query("SELECT orders.id, orders.date_created FROM orders WHERE orders.date_finished IS NULL ORDER BY orders.date_created", [], function(err, result) {
        var response = [];
        if(err) {
            console.log(err);
        } else {
            var ordersId = [];
            result.forEach(function(row) {
                ordersId.push(row.id);

                response.push({
                    id: row.id,
                    date_created: row.date_created,
                    products: []
                });
            });

            connection.query("SELECT orders_products.products_id, orders_products.orders_id FROM orders_products WHERE orders_products.orders_id IN (?)", [ordersId], function (err, result) {
                if(err) {
                    console.log(err);
                } else {
                    result.forEach(function(product) {
                        response.forEach(function(order) {
                            if(order.id == product.orders_id) {
                                order.products.push({
                                    id: product.products_id
                                });
                            }
                        });
                    });
                    res.json(response);
                }
            });
        }
    });
});

app.get("/orders/get/finished", function(req, res) {
    connection.query("SELECT orders.id, orders.date_created FROM orders WHERE orders.date_finished < NOW() ORDER BY orders.date_finished DESC LIMIT 10", [], function(err, result) {
        var response = [];
        if(err) {
            console.log(1+err);
        } else {
            var ordersId = [];
            result.forEach(function(row) {
                ordersId.push(row.id);

                response.push({
                    id: row.id,
                    date_created: row.date_created,
                    date_finished: row.date_finished,
                    products: []
                });
            });

            connection.query("SELECT orders_products.products_id, orders_products.orders_id FROM orders_products WHERE orders_products.orders_id IN (?)", [ordersId], function (err, result) {
                if(err) {
                    console.log(2+err);
                } else {
                    result.forEach(function(product) {
                        response.forEach(function(order) {
                            if(order.id == product.orders_id) {
                                order.products.push({
                                    id: product.products_id
                                });
                            }
                        });
                    });
                    res.json(response);
                }
            });
        }
    });
});

app.post("/orders/set/:orderId([0-9]+)", function(req, res) {

});

app.post("/orders/create", function(req, res) {
    connection.query("", [], function(err, result) {
        if (err) {
            console.log(err);
        } else {

        }
    });
});

app.get("/images/products/:productId([0-9]+)/image.png", function(req, res) {
    res.status(404).end("Images not available yet!");
});

app.use(function (req, res) {
    res.status(404).end("404 Page is choud!");
});

function getProductsByCategory(categoryId) {

}