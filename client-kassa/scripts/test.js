/**
 * Created by Benjamin on 22/11/2015.
 */

// magic backend line: res.header("Access-Control-Allow-Origin", "*")
// source: http://stackoverflow.com/questions/11181546/how-to-enable-cross-origin-resource-sharing-cors-in-the-express-js-framework-o

var products;
var shoppingcart = new Array();

$(document).ready(function() {
    console.log("ready");

    getProducts();
    addShoppingcartHeaders();

    $("#cancel").click(cancelOrder);
    $("#checkout").click(checkout);
})

function getProducts() {
    products = null;

    $.ajax({
        type: "GET",
        url: "http://localhost:80/products/get",
        dataType: "json",
        success: function(data) {
            products = data[0].products;
            buildProducts(data[0].products);
        },
        error: function(xhr, message, error) {
            console.log(message, error);
        }
    })
}

/*
 <div class="product">
 <img class="productImg" src="http://www.lutosa.com/files/produits/catalogue/assiettes/large/11-11-rb-copy-large.jpg">
 <div class="productName">Kleine friet</div>
 <div class="productPrice">1.10</div>
 </div>
*/

function buildProducts(data) {
    var html = new Array();

    data.forEach(function(product) {
       if(product.visible) {
           var item =
               '<div class="product" value="' + product.id + '">' +
               '<img class="productImg" src="http://www.lutosa.com/files/produits/catalogue/assiettes/large/11-11-rb-copy-large.jpg">' +
               '<div class="productName">' + product.name + '</div>' +
               '<div class="productPrice">' + product.price + '</div>' +
               '</div>';

           html.push(item);
       }
    })

    $("div#products").empty();
    $("div#products").append(html);

    addProductClickHandler();
}

function addProductClickHandler() {
    $("div.product").click(function() {
        var id = $(this).attr("value");
        addProductToShoppingCart(getProduct(id));
    })
}

/*<tr>
 <td class="shoppingNum">1</td>
 <td class="shoppingDescr">Een product</td>
 <td class="shoppingPrice">0</td>
 </tr>
*/

function getProduct(id) {
    var product;

    products.forEach(function(p) {
        if(p.id == id) {
            product = p;
        }
    })

    return product;
}

function addShoppingcartHeaders() {
    var html =
        '<tr>'+
        '<th class="shoppingtNum">#</th>'+
        '<th class="shoppingDescr">Description</th>'+
        '<th class="shoppingPrice">Price</th>'+
        '</tr>';

    $("#shoppingTable table").append(html);
}

function addProductToShoppingCart(product) {
    shoppingcart.push(product);

    var amount = 1; //hardcorded voor de mo mo
    var html =
        '<tr>' +
        '<td class="shoppingNum">' + amount + '</td>' +
        '<td class="shoppingDescr">' + product.name + '</td>' +
        '<td class="shoppingPrice">' + product.price + '</td>' +
        '</tr>';

    $("#shoppingTable table").append(html);
    updateShoppingcart();
}

function updateShoppingcart() {
    var total = 0;

    shoppingcart.forEach(function(p) {
        total += parseInt(p.price);
    })

    $("#shoppingTotal").text(total);

   scrollToBottom($("#shoppingTable"));
}

function clearShoppingcart() {
    shoppingcart = new Array();
    $("#shoppingTable table").empty();
    addShoppingcartHeaders();
    $("#shoppingTotal").empty()
}

function scrollToBottom(element) {
    var height = element.get(0).scrollHeight;
    element.scrollTop(height);
}

function cancelOrder(e) {
    e.preventDefault();

    clearShoppingcart();
    getProducts();
}

function checkout(e) {
    e.preventDefault();

    alert("Thanks for your order!");
    clearShoppingcart();
    getProducts();
}