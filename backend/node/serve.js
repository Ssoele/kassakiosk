"use strict"
var config  = require("../config.json");
var mysql   = require("mysql");
var express = require('express');
var app     = express();
var server  = require("http").createServer(app);
var io      = require("socket.io")(server);

server.listen(80);

app.set("case sensitive routing", true);


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

io.on('connection', function(socket) {

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
                                    categories_id_sub: product.categories_id_sub
                                });
                            }
                        });
                    });
                    res.json(response);
                }
            });



            /*result.forEach(function(row) {

                connection.query("SELECT products.id, products.name, products.price, products.visible, products.sort, products.categories_id_sub FROM products WHERE products.categories_id = ? ORDER BY products.sort", [row.id], function(err, result) {

                });
                console.log(category);
            });*/
        }
    });
});

app.post("/products/set/:productId([0-9]+)/visible", function(req, res) {
    connection.query("UPDATE products SET products.visible = ?", [req.param("productId")], function(err, result) {
        var response;
        if(err) {

        } else {

        }
        res.json(response);
    });
});

app.get("/orders/get/:limit([0-9]+)", function(req, res) {

});

app.post("/orders/set/:orderId([0-9]+)", function(req, res) {

});

app.put("/orders/create", function(req, res) {
    connection.query("", [], function(err, result) {
        if (err) {
            console.log(err);
        } else {

        }
    });
});

app.use(function (req, res) {
    res.status(404).end("404 Page is choud!");
});

function getProductsByCategory(categoryId) {

}