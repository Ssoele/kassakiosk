/**
 * Created by Benjamin on 22/11/2015.
 */

// magic backend line: res.header("Access-Control-Allow-Origin", "*")
// source: http://stackoverflow.com/questions/11181546/how-to-enable-cross-origin-resource-sharing-cors-in-the-express-js-framework-o

var products;
var shoppingcart = new Array();
var rightHand = true;

$(document).ready(function() {
    console.log("ready");

    initiateKiosk();

    $("#cancelOrder").click(confirm);
    $("#checkout").click(checkout);
    $("#flip").click(flipScreen);

    $(".overlayConfirmButton#cancel").click(toggleOverlay);
})

function initiateKiosk() {
    getProducts();
    addShoppingcartHeaders();
}

function getTestData() {
    products = testData[0].products;
    buildProducts(products);
}

function getProducts() {
    products = null;
    getTestData();

    //TODO: connectie met backend fixen
   /* $.ajax({
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
    })*/
}

function flipScreen(e) {
    e.preventDefault();

    var html;
    var target = $("#top");
    target.empty();

    var shoppingcart =
        '<div id="shoppingcart">'+
        '<div id="shoppingTable">'+
        '<table>'+
        '</table>'+
        '</div>'+
        '<div id="shoppingTotal"></div>'+
        '</div>';

    var products =
        '<div id="products">'+
        '</div>';

    if(!rightHand) {
        html = shoppingcart + " " + products;
    } else {
        html = products + " " + shoppingcart;
    }

    rightHand = !rightHand;
    target.html(html);
    initiateKiosk();
}

function buildProducts(data) {
    var html = new Array();

    data.forEach(function(product) {
       if(product.visible) {
           var item =
               '<div class="product" value="' + product.id + '">' +
               '<img class="productImg" src="' + product.image + '">' +
               '<div class="productName">' + checkProductName(product.name) + '</div>' +
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

function checkProductName(name) {
    if (name.length > 25) {
        return name.substring(0,22) + "..";
    } else {
        return name;
    }
}

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
    console.log(shoppingcart);
}

function scrollToBottom(element) {
    var height = element.get(0).scrollHeight;
    element.scrollTop(height);
}

function confirm(e) {
    e.preventDefault();

    if($(this).text() == "Cancel order") {
        if (shoppingcart.length > 0) {
            toggleOverlay();
            $(".overlayMessage").text("Are you sure you want to cancel your order?");
            $(".overlayConfirmButton#confirm").click(cancelOrder);
        }
    }
}

function toggleOverlay() {
    //TODO: toggle bug
    var overlay = $(".overlay");

    if(overlay.attr("hidden") == "hidden") {
        overlay.removeAttr("hidden");
    } else {
        overlay.attr("hidden", "hidden");
    }
}

function cancelOrder(e) {
    e.preventDefault();

    toggleOverlay();
    clearShoppingcart();
    getProducts();
}

function checkout(e) {
    e.preventDefault();

    alert("Thanks for your order!");
    clearShoppingcart();
    getProducts();
}