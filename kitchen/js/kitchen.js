/**
 * Created by Ssoele on 26/11/2015.
 */
var kitchen = {
    api: "",
    uid: "",
    secret: "",
    run: (function() {
        var categories;
        var orders = {
            open: [],
            closed: []
        }
        var tmpProduct;
        var currentPage;
        var currentStation;
        $('#products').on('scroll', scrollHandler);
        $('#products').css('height', ($(window).height()-50));
        $('.scroll').css('height', ($(window).height()-50));
        $(window).resize(function() {
            $('#products').css('height', ($(window).height()-50));
            $('.scroll').css('height', ($(window).height()-50));
            $('#scroll-products .scroll-bar').css('top', (($('#products').scrollTop()/($('#products')[0].scrollHeight-$('#products').height()))*($('#scroll-products').height()-240))+80);
            $('#scroll-products .scroll-bar').draggable({
                axis: "y",
                containment: [15, 130, 15, ($(window).height()-160)]
            });
            updateImages();
            updateScroll();
        });
        $('#scroll-products .scroll-bar').draggable({
            axis: "y",
            containment: [15, 130, 15, ($(window).height()-160)]
        });

        $('#scroll-products .scroll-bar').on('mousedown', function() {
            $('#products').off('scroll', scrollHandler);
        });
        $(document).on('mouseup', function() {
            $('#products').on('scroll', scrollHandler);
        });

        $('#scroll-products .scroll-bar').on('drag', function() {
            var scrollBarTop = $('#scroll-products .scroll-bar').css('top').slice(0, -2)-80;
            var scrollHeight = ($('#scroll-products').height()-240);
            var categoriesScrollable = $('#products')[0].scrollHeight-$('#products').height();
            $('#products').scrollTop((scrollBarTop/scrollHeight)*categoriesScrollable);
        });

        $('#scroll-products .scroll-up').on('click', function() {
            $('#products').scrollTop($('#products').scrollTop()-100);
        });

        $('#scroll-products .scroll-down').on('click', function() {
            $('#products').scrollTop($('#products').scrollTop()+100);
        });

        $('.nav.navbar-nav').on('click', '.page-link', function () {
            var chunks = $('a', this).attr('href').substring(1).split("/")
            showPage(chunks[0]);
            if(chunks[0] == 'stations') {
                showStation(chunks[1]);
            }
        });


        $('#categories').on('click', 'h3', function() {
            $('#products .row').hide();
            $('#categories h3').removeClass('active');
            $(this).addClass('active');
            $('#row-category-'+$(this).data('category')).show();
            updateImages();
            updateScroll();
        });

        $('#categories').on('click', 'h3.active', function() {
            if($(this).hasClass('not-visible')) {
                $(this).removeClass('not-visible');
                visibleCategory($(this).data('category'), true);
            } else {
                $(this).addClass('not-visible');
                visibleCategory($(this).data('category'), false);
            }
        });

        $('#products').on('click', '.product', function() {
            var product = getProductById($(this).data('product-id'));
            if($('#products-'+product.id).hasClass('not-visible')) {
                $('#products-'+product.id).removeClass('not-visible');
                visibleProduct(product.id, true);
            } else {
                $('#products-'+product.id).addClass('not-visible');
                visibleProduct(product.id, false);
            }
        });

        $('#page-stations').on('click', '.order-ready', function() {
            var orderId = $(this).parent().parent().parent().data('order');
            $.post(kitchen.api+'orders/set/'+orderId+'/done', {
                uid: kitchen.uid,
                secret: kitchen.secret,
                done: 1
            }).done(function(data) {
                $('#order-open-'+orderId).remove();
                updateOrderList();
            });
        });

        $('#page-finished-orders').on('click', '.order-reopen', function() {
            var orderId = $(this).parent().parent().parent().data('order');
            $.post(kitchen.api+'orders/set/'+orderId+'/done', {
                uid: kitchen.uid,
                secret: kitchen.secret,
                done: 0
            }).done(function(data) {
                $('#order-finished-'+orderId).remove();
                updateOrderList();
            });
        });

        $.post(kitchen.api+'products/get', {uid: kitchen.uid, secret: kitchen.secret}).done(function(data) {
            categories = data;
            $('#categories').empty();
            $('.order-list').empty();
            categories.forEach(function(category) {
                if(category.visible) {
                    $('#categories').append('<h3 id="h3-category-'+category.id+'" data-category="'+category.id+'">'+category.name+'</h3>');
                } else {
                    $('#categories').append('<h3 id="h3-category-'+category.id+'" data-category="'+category.id+'" class="not-visible">'+category.name+'</h3>');
                }
                $('#products').append('<div class="row" id="row-category-'+category.id+'" data-category="'+category.id+'"></h3>');
                category.products.forEach(function(product) {
                    if(product.visible) {
                        $('#row-category-'+category.id).append('<div class="col-lg-2 col-md-3 col-sm-3" id="products-'+product.id+'"><div class="thumbnail product" data-product-id="'+product.id+'"><img src="'+product.image+'" alt="'+product.name+'"><div class="caption"><p class="product-info"><span class="product-name">'+product.name+'</span></p></div></div></div>');
                    } else {
                        $('#row-category-'+category.id).append('<div class="col-lg-2 col-md-3 col-sm-3 not-visible" id="products-'+product.id+'"><div class="thumbnail product" data-product-id="'+product.id+'"><img src="'+product.image+'" alt="'+product.name+'"><div class="caption"><p class="product-info"><span class="product-name">'+product.name+'</span></p></div></div></div>');
                    }
                });
            });
            $('#products .row').first().show();
            $('#categories h3').first().addClass('active');
            $('.thumbnail img').each(function() {
                $(this).css('width', '100%')
                $(this).css('height', $(this).css('width'));
            });
            updateImages();
            updateScroll();
            $.post(kitchen.api+'orders/get/open', {
                uid: kitchen.uid,
                secret: kitchen.secret
            }).done(function(data) {
                orders.open = data;
                orders.open.forEach(function(order) {
                    var dateCreated = new Date(order.date_created);

                    $('#page-stations').append('<div class="col-md-3 order-container" id="order-open-'+order.id+'"></div>');
                    $('#order-open-'+order.id).append('<div class="panel panel-default order"></div>');
                    $('#order-open-'+order.id+' .panel').append('<div class="panel-heading"></div>');
                    $('#order-open-'+order.id+' .panel-heading').append('<h3 class="panel-title">Order '+order.id+'</h3>');
                    $('#order-open-'+order.id+' .panel').append('<div class="panel-body"></div>');
                    $('#order-open-'+order.id+' .panel-heading h3').append('<span class="time-created"><span class="time">'+timeSince(dateCreated)+'</span> ago</span>');
                    $('#order-open-'+order.id+' .panel-body').append('<ul class="order-list"></ul>');
                    $('#order-open-'+order.id+' .panel-body').append('<button type="button" class="btn btn-default btn-lg btn-block order-ready">Order is ready!</button>');
                    order.products.forEach(function(orderProduct) {
                        var product = getProductById(orderProduct.id)
                        var id = '#order-'+order.id+'-product-'+product.id+'-sub-'+orderProduct.sub;
                        $('#order-open-'+order.id+' .order-list').append('<li class="product product-id-'+product.id+'" id="order-'+order.id+'-product-'+product.id+'-sub-'+orderProduct.sub+'"></li>');
                        $(id).append('<span class="product-amount">'+orderProduct.amount+'</span>');
                        $(id).append('<span class="product-name">'+product.name+'</span>');
                        if(orderProduct.sub) {
                            $(id).append('<span class="product-sub">'+getProductById(orderProduct.sub).name+'</span>');
                        }
                        $(id).append('<span class="product-clear"></span>');
                    });
                    $('#order-open-'+order.id).data('order', order.id);

                    $('#order-open-'+order.id+' .time-created .time').data('time', order.date_created);

                    showPage('stations');
                    showStation('checkout');
                });
            });
            $.post(kitchen.api+'orders/get/finished', {
                uid: kitchen.uid,
                secret: kitchen.secret
            }).done(function(data) {
                orders.finished = data;
                orders.finished.forEach(function(order) {
                    var dateFinished = new Date(order.date_finished);

                    $('#page-finished-orders').append('<div class="col-md-3 order-container" id="order-finished-'+order.id+'"></div>');
                    $('#order-finished-'+order.id).append('<div class="panel panel-default order"></div>');
                    $('#order-finished-'+order.id+' .panel').append('<div class="panel-heading"></div>');
                    $('#order-finished-'+order.id+' .panel-heading').append('<h3 class="panel-title">Order '+order.id+'</h3>');
                    $('#order-finished-'+order.id+' .panel').append('<div class="panel-body"></div>');
                    $('#order-finished-'+order.id+' .panel-heading h3').append('<span class="time-finished"><span class="time">'+timeSince(dateFinished)+'</span> ago</span>');
                    $('#order-finished-'+order.id+' .panel-body').append('<ul class="order-list"></ul>');
                    $('#order-finished-'+order.id+' .panel-body').append('<button type="button" class="btn btn-default btn-lg btn-block order-reopen">Re-open order!</button>');
                    order.products.forEach(function(orderProduct) {
                        var product = getProductById(orderProduct.id)
                        var id = '#order-'+order.id+'-product-'+product.id+'-sub-'+orderProduct.sub;
                        $('#order-finished-'+order.id+' .order-list').append('<li class="product product-id-'+product.id+'" id="order-'+order.id+'-product-'+product.id+'-sub-'+orderProduct.sub+'"></li>');
                        $(id).append('<span class="product-amount">'+orderProduct.amount+'</span>');
                        $(id).append('<span class="product-name">'+product.name+'</span>');
                        if(orderProduct.sub) {
                            $(id).append('<span class="product-sub">'+getProductById(orderProduct.sub).name+'</span>');
                        }
                        $(id).append('<span class="product-clear"></span>');
                    });
                    $('#order-finished-'+order.id).data('order', order.id);

                    $('#order-finished-'+order.id+' .time-finished .time').data('time', order.date_finished);
                    updateOrderList();
                });
            });
            $.post(kitchen.api+'stations/get', {
                uid: kitchen.uid,
                secret: kitchen.secret
            }).done(function(data) {
                stations = data;
                var style = "";
                stations.forEach(function(station) {
                    $('.stations').append('<li class="page-link page-menu-stations-'+station.id+'"><a href="#stations/'+station.id+'">'+station.name+'</a></li>');
                    style += '.station-color-'+station.id+' { background: #'+station.color+';} ';
                });
                $('head').append('<style>'+style+'</style>');
            });
        });



        setInterval(function() {
            $('.time').each(function() {
                $(this).text(timeSince(new Date($(this).data('time'))));
            });
        }, 1000);

        setInterval(function() {
            $.post(kitchen.api+'products/get', {uid: kitchen.uid, secret: kitchen.secret}).done(function(data) {
                categories = data;
                categories.forEach(function(category) {
                    if(category.visible) {
                        $('#h3-category-'+category.id).removeClass('not-visible');
                    } else {
                        $('#h3-category-'+category.id).addClass('not-visible');
                    }
                    category.products.forEach(function(product) {
                        if(product.visible) {
                            $('#products-'+product.id).removeClass('not-visible');
                        } else {
                            $('#products-'+product.id).addClass('not-visible');
                        }
                    });
                });
            });
            $.post(kitchen.api+'orders/get/open', {
                uid: kitchen.uid,
                secret: kitchen.secret
            }).done(function(data) {
                $('#page-stations').empty();
                orders.open = data;
                orders.open.forEach(function(order) {
                    var dateCreated = new Date(order.date_created);

                    $('#page-stations').append('<div class="col-md-3 order-container" id="order-open-'+order.id+'"></div>');
                    $('#order-open-'+order.id).append('<div class="panel panel-default order"></div>');
                    $('#order-open-'+order.id+' .panel').append('<div class="panel-heading"></div>');
                    $('#order-open-'+order.id+' .panel-heading').append('<h3 class="panel-title">Order '+order.id+'</h3>');
                    $('#order-open-'+order.id+' .panel').append('<div class="panel-body"></div>');
                    $('#order-open-'+order.id+' .panel-heading h3').append('<span class="time-created"><span class="time">'+timeSince(dateCreated)+'</span> ago</span>');
                    $('#order-open-'+order.id+' .panel-body').append('<ul class="order-list"></ul>');
                    $('#order-open-'+order.id+' .panel-body').append('<button type="button" class="btn btn-default btn-lg btn-block order-ready">Order is ready!</button>');
                    order.products.forEach(function(orderProduct) {
                        var product = getProductById(orderProduct.id)
                        var id = '#order-'+order.id+'-product-'+product.id+'-sub-'+orderProduct.sub;
                        $('#order-open-'+order.id+' .order-list').append('<li class="product product-id-'+product.id+'" id="order-'+order.id+'-product-'+product.id+'-sub-'+orderProduct.sub+'"></li>');
                        $(id).append('<span class="product-amount">'+orderProduct.amount+'</span>');
                        $(id).append('<span class="product-name">'+product.name+'</span>');
                        if(orderProduct.sub) {
                            $(id).append('<span class="product-sub">'+getProductById(orderProduct.sub).name+'</span>');
                        }
                        $(id).append('<span class="product-clear"></span>');
                    });
                    $('#order-open-'+order.id).data('order', order.id);

                    $('#order-open-'+order.id+' .time-created .time').data('time', order.date_created);
                    updateOrderList();
                    if(currentPage == 'stations') {
                        showStation(currentStation);
                    }
                });
                /*data.forEach(function(order) {
                 var listed = false;
                 orders.open.forEach(function(oldOrders) {
                 if(order.id == oldOrders.id) {

                 listed = true;
                 }
                 });
                 if(!listed) {
                 var dateCreated = new Date(order.date_created);

                 $('#page-stations').append('<div class="col-md-3 order-container" id="order-open-'+order.id+'"></div>');
                 $('#order-open-'+order.id).append('<div class="panel panel-default order"></div>');
                 $('#order-open-'+order.id+' .panel').append('<div class="panel-heading"></div>');
                 $('#order-open-'+order.id+' .panel-heading').append('<h3 class="panel-title">Order '+order.id+'</h3>');
                 $('#order-open-'+order.id+' .panel').append('<div class="panel-body"></div>');
                 $('#order-open-'+order.id+' .panel-heading h3').append('<span class="time-created"><span class="time">'+timeSince(dateCreated)+'</span> ago</span>');
                 $('#order-open-'+order.id+' .panel-body').append('<ul class="order-list"></ul>');
                 $('#order-open-'+order.id+' .panel-body').append('<button type="button" class="btn btn-default btn-lg btn-block order-ready">Order is ready!</button>');
                 order.products.forEach(function(orderProduct) {
                 var product = getProductById(orderProduct.id)
                 var id = '#order-'+order.id+'-product-'+product.id+'-sub-'+orderProduct.sub;
                 $('#order-open-'+order.id+' .order-list').append('<li class="product product-id-'+product.id+'" id="order-'+order.id+'-product-'+product.id+'-sub-'+orderProduct.sub+'"></li>');
                 $(id).append('<span class="product-amount">'+orderProduct.amount+'</span>');
                 $(id).append('<span class="product-name">'+product.name+'</span>');
                 if(orderProduct.sub) {
                 $(id).append('<span class="product-sub">'+getProductById(orderProduct.sub).name+'</span>');
                 }
                 $(id).append('<span class="product-clear"></span>');
                 });
                 $('#order-open-'+order.id).data('order', order.id);

                 $('#order-open-'+order.id+' .time-created .time').data('time', order.date_created);
                 }
                 });
                 orders.open = data;*/
            });
            $.post(kitchen.api+'orders/get/finished', {
                uid: kitchen.uid,
                secret: kitchen.secret
            }).done(function(data) {
                $('#page-finished-orders').empty();
                orders.finished = data;
                orders.finished.forEach(function(order) {
                    var dateFinished = new Date(order.date_finished);

                    $('#page-finished-orders').append('<div class="col-md-3 order-container" id="order-finished-'+order.id+'"></div>');
                    $('#order-finished-'+order.id).append('<div class="panel panel-default order"></div>');
                    $('#order-finished-'+order.id+' .panel').append('<div class="panel-heading"></div>');
                    $('#order-finished-'+order.id+' .panel-heading').append('<h3 class="panel-title">Order '+order.id+'</h3>');
                    $('#order-finished-'+order.id+' .panel').append('<div class="panel-body"></div>');
                    $('#order-finished-'+order.id+' .panel-heading h3').append('<span class="time-finished"><span class="time">'+timeSince(dateFinished)+'</span> ago</span>');
                    $('#order-finished-'+order.id+' .panel-body').append('<ul class="order-list"></ul>');
                    $('#order-finished-'+order.id+' .panel-body').append('<button type="button" class="btn btn-default btn-lg btn-block order-reopen">Re-open order!</button>');
                    order.products.forEach(function(orderProduct) {
                        var product = getProductById(orderProduct.id)
                        var id = '#order-'+order.id+'-product-'+product.id+'-sub-'+orderProduct.sub;
                        $('#order-finished-'+order.id+' .order-list').append('<li class="product product-id-'+product.id+'" id="order-'+order.id+'-product-'+product.id+'-sub-'+orderProduct.sub+'"></li>');
                        $(id).append('<span class="product-amount">'+orderProduct.amount+'</span>');
                        $(id).append('<span class="product-name">'+product.name+'</span>');
                        if(orderProduct.sub) {
                            $(id).append('<span class="product-sub">'+getProductById(orderProduct.sub).name+'</span>');
                        }
                        $(id).append('<span class="product-clear"></span>');
                    });
                    $('#order-finished-'+order.id).data('order', order.id);

                    $('#order-finished-'+order.id+' .time-finished .time').data('time', order.date_finished);
                    updateOrderList();
                });
            });
        }, 5000);

        function getProductById(id) {
            var returnVar;
            categories.forEach(function(category) {
                category.products.forEach(function(product) {
                    if(product.id == id) {
                        returnVar = product;
                    }
                });
            });
            return returnVar;
        }

        function getCategoryById(id) {
            var returnVar;
            categories.forEach(function(category) {
                if(category.id == id) {
                    returnVar = category;
                }
            });
            return returnVar;
        }

        function isEmpty(input) {
            if(!isNaN(input) && input) {
                return false;
            } else {
                return true;
            }
        };

        function scrollHandler() {
            $('#scroll-products .scroll-bar').css('top', (($(this).scrollTop()/($(this)[0].scrollHeight-$(this).height()))*($('#scroll-products').height()-240))+80);
        }

        function updateScroll() {
            if($('#products').height() < ($('#products')[0].scrollHeight-20)) {
                $('#scroll-products').show();
            } else {
                $('#scroll-products').hide();
            }
        }

        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function visibleCategory(id, visible) {
            if(visible) {
                visible = 1;
            } else {
                visible = 0;
            }
            $.post(kitchen.api+'categories/set/'+id+'/visible', {
                uid: kitchen.uid,
                secret: kitchen.secret,
                visible: visible
            }).fail(function() {

            });
        }

        function visibleProduct(id, visible) {
            if(visible) {
                visible = 1;
            } else {
                visible = 0;
            }
            $.post(kitchen.api+'products/set/'+id+'/visible', {
                uid: kitchen.uid,
                secret: kitchen.secret,
                visible: visible
            }).fail(function() {

            });
        }

        function showPage(page) {
            $('.page').hide();
            $('.nav.navbar-nav li').removeClass('active');
            $('#page-'+page).show();
            $('.page-menu-'+page).addClass('active');
            currentPage = page;
            updateImages();
        }

        function showStation(id) {
            $('.order-list .product').removeClass('even');
            $('.page-menu-stations').addClass('active');
            $('.page-menu-stations-'+id).addClass('active');
            $('#page-stations .order-container').show();
            $('#page-stations .order .product').show();
            $('#page-stations .order .order-ready').show();
            if(id != 'checkout' && id != 'all') {
                $('#page-stations .order .product').hide();
                $('#page-stations .order .order-ready').hide();
                getStationById(id).products.forEach(function(product) {
                    $('#page-stations .order .product-id-'+product.id).show();
                });
                $('#page-stations .order-container').each(function() {
                    var visible = false;
                    $('.product:visible', this).each(function() {
                        visible = true;
                    });
                    if(visible) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            } else if(id == 'all') {
                $('#page-stations .order .order-ready').hide();
            }
            currentStation = id;
            updateOrderList();
        }

        function updateOrderList() {
            $('.order-list').each(function() {
                $('.product:visible:odd', this).addClass('even');
            });
            var i = 0;
            $('#page-stations .order-container').each(function() {
                i++;
                if(i%4 == 1) {
                    $(this).css('clear', 'left');
                }
            });
            i = 0;
            $('#page-finished-orders .order-container').each(function() {
                i++;
                if(i%4 == 1) {
                    $(this).css('clear', 'left');
                }
            });
        }

        function getStationById(id) {
            var returnVar;
            stations.forEach(function(station) {
                if(station.id == id) {
                    returnVar = station;
                }
            });
            return returnVar;
        }

        function timeSince(date) {
            var time = secondsToTime(Math.floor((new Date() - date) / 1000))
            var response = "";
            if(time.m >= 1) {
                response += zeroFill(time.m, 2)+"m ";
            }
            if(time.s >= 1) {
                response += zeroFill(time.s, 2)+"s";
            }
            return response;
        }

        function secondsToTime(secs) {
            var minutes = Math.floor(secs / 60);

            var divisor_for_seconds = secs % 60;
            var seconds = Math.ceil(divisor_for_seconds);

            var obj = {
                "m": minutes,
                "s": seconds
            };
            return obj;
        }

        function zeroFill(number, width) {
            width -= number.toString().length;
            if ( width > 0 )
            {
                return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
            }
            return number + ""; // always return a string
        }

        function updateImages() {
            $('.thumbnail img').each(function() {
                $(this).css('width', '100%')
                $(this).css('height', $(this).css('width'));
                console.log('1');
            });
        }
    }),
    setup: (function() {
        $(document).ready(function() {
            if(!localStorage.kitchen) {
                $('#main').addClass('blurable');
                $('#main-overlay').show();
            } else {
                var setup = JSON.parse(localStorage.kitchen);
                kitchen.api = setup.api;
                kitchen.uid = setup.uid;
                kitchen.secret = setup.secret;
                kitchen.run();
            }

            $('.setup-submit').click(function() {
                $('.setup-error').remove();
                kitchen.api = $('#setup-api').val();
                kitchen.uid = $('#setup-uid').val();
                kitchen.secret = $('#setup-secret').val();
                $.post(kitchen.api+'check', {uid: kitchen.uid, secret: kitchen.secret}, function(data) {
                    if(data.success) {
                        localStorage.kitchen = JSON.stringify({
                            api: kitchen.api,
                            uid: kitchen.uid,
                            secret: kitchen.secret
                        });
                        $('#main').removeClass('blurable');
                        $('#main-overlay').hide();
                        kitchen.run();
                    } else {
                        $('#main-overlay .panel-body').prepend('<div class="alert alert-danger setup-error" role="alert">Login failed!</div>');
                    }
                }).fail(function () {
                    $('#main-overlay .panel-body').prepend('<div class="alert alert-danger setup-error" role="alert">Login failed!</div>');
                });
            });
        });
    })
};
kitchen.setup();