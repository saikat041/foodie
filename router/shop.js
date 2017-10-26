var express=require('express');
var router=express.Router();
var db=null;
var db1=require('../models/user')(function (db1) {
  db=db1;
});

router.get('/',function (req,res) {
  var user=req.session.user;
  if(!user)return res.redirect('/user/login');
  db.collection('users').findOne({email:user.email},function (err,result) {
    res.render('myShop',{items:result.items});
  });
});

router.get('/addItem',function (req,res) {
  if(!req.session.user)
  res.redirect('/user/login');
  else
  res.render('additem');
});

router.post('/addItem',function (req,res) {
     var user=req.session.user;
     if(!user)return res.redirect('/user/login');
     if(!user.items)
     var items=[];
     else
     var items=user.items;
     var item={"name":req.body.name,"price":req.body.price,"description":req.body.description,"image":req.body.image};
     items.push(item);
     db.collection('shops').update({owner:user.email},{$set:{items:items}});
     db.collection('users').update({'email':user.email},{$set:{"items":items}},function (err,result) {
       res.redirect('/myshop');
     });

});

router.get('/editItem',function (req,res) {
  var i=req.query.itemNumber;
  var user=req.session.user;
  if(!req.session.user)
  res.redirect('/user/login');
  else{
  res.render('editItem',{"index":i,"name":user.items[i].name,"description":user.items[i].description,"price":user.items[i].price,"image":user.items[i].image});
  }
});

router.post('/editItem',function (req,res) {
    var user=req.session.user;
    if(!user) return res.redirect('/user/login');
    var item={"name":req.body.name,"description":req.body.description,"price":req.body.price,"image":req.body.image};
    var items=user.items;
    var i=req.body.index;
    items[i]=item;
    db.collection('users').update({'email':user.email},{$set:{"items":items}},function (err,result) {
      res.redirect('/myshop');
    });
});

module.exports=router;
