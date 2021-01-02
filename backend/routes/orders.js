const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');
const crypto = require('crypto');

//PAYPAL CONFIGURATION
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Ab8L4RBMbjGFaqCAkYZT06mII-m_nlgoFwaoDRvwHjsMtuziIxQCu0mY7oaTRBuIoBsxTuQJJFp3TeFL',
    'client_secret': 'EJCqso7ec4goLZXAl54vplwc75h13u9yyRu1mQKecCAbS96As1TGDhHYUMjINm1iuqPCQxHQAJSTX2wK'
});

/* GET ALL ORDERS */
router.get('/',(req, res) => {
    database.table('orders_details as od')
        .join([
            {
                table:'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table:'products as p',
                on:'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id= o.user_id'
            }
        ])
        .withFields([
            'o.id',
            'p.title',
            'p.description',
            'p.price',
            'u.username'
        ])
        .sort({id: 1})
        .getAll()
        .then(orders=>{
            if(orders.length>0){
                res.json(orders);
            }else{
                res.json({message:"No orders found"});
            }
        })
        .catch(err => res.json(err));



});
// Get Single Order
router.get('/:id', async (req, res) => {
    let orderId = req.params.id;
    console.log(orderId);

    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'p.image', 'od.quantity as quantityOrdered'])
        .filter({'o.id': orderId})
        .getAll()
        .then(orders => {
            console.log(orders);
            if (orders.length > 0) {
                res.json(orders);
            } else {
                res.json({message: "No orders found"});
            }

        }).catch(err => res.json(err));
});

// Place New Order
router.post('/new', async (req, res) => {
    // let userId = req.body.userId;
    // let data = JSON.parse(req.body);
    let {userId, products} = req.body;
    console.log(userId);
    console.log(products);

    if (userId !== null && userId > 0) {
        database.table('orders')
            .insert({
                user_id: userId
            }).then((newOrderId) => {

            if (newOrderId > 0) {
                products.forEach(async (p) => {

                    let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();



                    let inCart = parseInt(p.incart);

                    // Deduct the number of pieces ordered from the quantity in database

                    if (data.quantity > 0) {
                        data.quantity = data.quantity - inCart;

                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }

                    } else {
                        data.quantity = 0;
                    }

                    // Insert order details w.r.t the newly created order Id
                    database.table('orders_details')
                        .insert({
                            order_id: newOrderId,
                            product_id: p.id,
                            quantity: inCart
                        }).then(newId => {
                        database.table('products')
                            .filter({id: p.id})
                            .update({
                                quantity: data.quantity
                            }).then(successNum => {
                        }).catch(err => console.log(err));
                    }).catch(err => console.log(err));
                });

            } else {
                res.json({message: 'New order failed while adding order details', success: false});
            }
            res.json({
                message: `Order successfully placed with order id ${newOrderId}`,
                success: true,
                order_id: newOrderId,
                products: products
            })
        }).catch(err => res.json(err));
    }

    else {
        res.json({message: 'New order failed', success: false});
    }

});

// Payment Gateway
router.post('/payment', (req, res) => {
    setTimeout(() => {
        res.status(200).json({success: true});
    }, 3000)

    /*const authorize_details = {
        "amount": {
            "currency": "USD",
            "total": "0.80"
        }
    };
    setTimeout(() => {
        res.status(200).json({success: true});
    }, 3000)
    const orderId = "O-20L81840AL4365052";*
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/api/orders/success",
            "cancel_url": "http://localhost:3000/api/orders/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Red Sox Hat",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Hat for the best team ever"
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log(error);
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }

    });
 /*  paypal.order.authorize(orderId, authorize_details, function (error, authorization) {
        if (error) {
            console.log(error.response);
            console.error(error);
        } else {
            console.log(authorization);
        }
    });*/
});
/*paypal.order.get(orderId, function (error, order) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        console.log("Get Order Response");
        console.log(JSON.stringify(order));
    }
});*/


/*router.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "EUR",
                "total": ""
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});*/

//router.get('/cancel', (req, res) => res.send('Cancelled'));







module.exports = router;