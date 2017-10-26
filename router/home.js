var express=require('express');
var router=express.Router();
var db=null;
var db1=require('../models/user')(function (db1) {
  db=db1;
});

module.exports=function (io)
 {

io.on('connection',function (socket) {

                                                                                //            ON        ADD TO CART

  socket.on('addToCart',function (data) {
    db.collection('users').findOne({"email":data.buyer},function (err,result) {
      if(!result.carts)result.carts=[];
      var carts=result.carts;
      var cart=carts.find(function (cart) {return cart.seller==data.seller;});
      if(cart){
        var i=carts.indexOf(cart);
        if(!carts[i].items)carts[i].items=[];
        carts[i].items.push(data.items[0]);
      }
      else
      carts.push(data);
      db.collection('users').update({"email":data.buyer},{$set:{"carts":carts}});
    });
  });

                                                                               //                       ON        BUY
  socket.on('buy',function (data) {
  //  console.log(data);
    db.collection('users').findOne({'email':data.buyer},function (err,result) {
      if(result.buyer_orders)
      var buyer_orders=result.buyer_orders;
      else
      var buyer_orders=[];
      var order={date:Date(),shop:data.shop,seller:data.seller,items:data.items}
      buyer_orders.push(order);
      db.collection('users').update({"email":data.buyer},{$set:{"buyer_orders":buyer_orders}});
    });

    db.collection('users').findOne({'email':data.seller.replace('_','.')},function (err,result) {
      if(result.seller_orders)
      var seller_orders=result.seller_orders;
      else
      var seller_orders=[];
      var order={date:Date(),buyer:data.buyer,name:data.name,items:data.items}
      seller_orders.push(order);
      db.collection('users').update({"email":data.seller.replace('_','.')},{$set:{"seller_orders":seller_orders}});
    });
  });

  socket.on('remove',function (data) {
   db.collection('users').findOne({email:data.buyer},function(err,result){
     var carts=result.carts.splice(1,data.index);
     db.collection('users').update({email:data.buyer},{$set:{carts:carts}},function (err,result) {
       socket.emit('removed');
     });
    // console.log(carts);
   });

  });

});

                                                                           //                 GET        HOME

/*  router.get('/',function (req,res) {
    if(!req.session.user)return res.redirect('user/login');
    res.reder('home');

  });*/
                                                                                //                   GET     SHOPS

  router.get('/',function (req,res) {
    if(!req.session.user) return res.redirect('/user/login');
    db.collection('shops').find({}).toArray(function (err,result) {
      if(req.query.shopNumber==null){
        res.render('shops',{shops:result});
      }
      else{
        var i=req.query.shopNumber;
        res.render('shop',{shop:result[i]});
      }
    });

  });
                                                                                //                        GET  CART
router.get('/cart',function (req,res) {
  var user=req.session.user;
   if(!user)return res.redirect('user/login');
   db.collection('users').findOne({email:user.email},function (err,result) {
     res.render('cart',{carts:result.carts});
   });

});
                                                                                //                 GET   MY ORDERS
router.get('/myorders',function (req,res) {
  var user=req.session.user;
   if(!user)
   return res.redirect('user/login');
   db.collection('users').findOne({"email":user.email},function (err,result) {
     if(result)
     return  res.render('buyerOrders',{orders:result.buyer_orders});
   });

});
                                                                                //                  GET  ORDERS
router.get('/orders',function (req,res) {
  var user=req.session.user;
   if(!user)
   return res.redirect('user/login');
   db.collection('users').findOne({"email":user.email},function (err,result) {
     if(result)
     return  res.render('orders',{orders:result.seller_orders});
   });

});
                                                                                //                 GET    PROFILE
  router.get('/profile',function (req,res) {
    if(req.session.user)
    res.render('profile');
    else
    res.redirect('/user/login');
  });

                                                                                //              UPDATE PROFILE

  router.post('/profile',function (req,res) {
    var user=req.session.user;
    if(!user)
    return res.redirect('/user/login');
    db.collection('users').update({"email":user.email},{$set:{"shop":req.body.shop,"name":req.body.name,"description":req.body.description,"image":req.body.image}},function (err,res1) {
        user.shop=req.body.shop;
        user.name=req.body.name;
        req.session.user=user;
        res.locals.user=user;
        req.session.save();
    });
  db.collection('shops').findOne({"owner":user.email},function (err,res1) {
    if(res1==null)
    db.collection('shops').insert({"name":req.body.shop,"owner":user.email,"ownerName":req.body.name,"items":user.items,"image":req.body.image,"description":req.body.description});
    else
      db.collection('shops').update({"owner":user.email},{$set:{"name":req.body.shop,"ownerName":req.body.name,"image":req.body.image,"description":req.body.description}});
  });
    res.redirect('/');
  });



  return router;
}
