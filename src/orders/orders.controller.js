const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next){
  res.json({data: orders})
}

function doesIdExist(req, res, next){
  const orderId = req.params.orderId;
  //console.log("DISH ID", dishId)
  const foundOrder = orders.find((order)=> order.id===orderId);
  //console.log("FOUND DISH", foundDish)
  if(foundOrder){
    res.locals.order = foundOrder
    return next()
  }
  next({
    status: 404,
    message: `Not found id ${orderId}`
  })
}

function read(req, res, next){
  res.json({data: res.locals.order})
}

function doesAddressExist(req, res, next){
  const addressProp = req.body.data.deliverTo;
  if(addressProp){
    return next();
  }
  next({
    status: 400,
    message: `You need a deliverTo value`
  })
}

function doesMobileExist(req, res, next){
  const mobileProp = req.body.data.mobileNumber;
  if(mobileProp){
    return next();
  }
  next({
    status: 400,
    message: `You need a mobileNumber value`
  })
}

function doDishesExist(req, res, next){
  const dishesProp = req.body.data.dishes;
  //console.log("DISHES", dishesProp)
  if(dishesProp && dishesProp.length!==0 && Array.isArray(dishesProp)){
    for(let i=0; i < dishesProp.length; i++){
      if(dishesProp[i].quantity===0 || 
        !dishesProp[i].quantity || 
        dishesProp[i].quantity!==Number(dishesProp[i].quantity)){
          //console.log(`index ${i+1} failed`)
        return next({
          status: 400,
          message: `Dish ${i} must have a quantity that is an integer greater than 0`
        });
      }
    }
    return next();
  }
  next({
    status: 400,
    message: `Check dishes array`
  })
  
}

function postOrder(req, res, next){
  const newOrder = {
    id: nextId(),
    deliverTo: req.body.data.deliverTo,
    mobileNumber: req.body.data.mobileNumber,
    status: req.body.data.status,
    dishes: req.body.data.dishes
  }
  //console.log("NEW DISH", newDish);
  orders.push(newOrder)
  res.status(201).json({data: newOrder})
}

function wasOrderDelivered(req, res, next){
  const delivered = req.body.data.status;
  //console.log("DELIVERED", delivered)
  if(delivered==='pending'){
    return next()
  }
  next({
    status: 400,
    message: `Order has already been delivered`
  })
}

function doesStatusExist(req, res, next){
  const status = req.body.data.status;
  //console.log("STATUS", status)
  if(status==='pending' || status==='delivered'){
    return next();
  }
  next({
    status: 400,
    message: `You need a status`
  })
}

function updateOrder(req, res, next){
  const data = req.body.data;
  if(res.locals.id){
    res.json({data: {
      id:res.locals.id, 
      deliverTo: data.deliverTo, 
      mobileNumber: data.mobileNumber, 
      status: data.status, 
      dishes: data.dishes}})
  }
  res.json({data: req.body.data})
}

function validateIdForUpdate(req, res, next){
  const orderId = req.params.orderId
  if(!orderId){
    return next({
      status: 400,
      message: `Dish does not exist: ${orderId}.`
    })
  }
  if(!req.body.data.id){
    res.locals.id = orderId;
    return next();
  }

  if(req.body.data.id!== orderId){
    return next({status:400, message: `Dish id does not match route id. Dish: ${req.body.data.id}, Route: ${orderId}`})
  }
  return next()
}

function checkStatusBeforeDestroy(req, res, next){
  const status = res.locals.order.status;
  //console.log("STATUS", status)
  if(status!=='pending'){
    return next({
      status: 400,
      message: `You can only destroy pending orders.`
    });
  }
  next()  
}

function destroy(req, res, next){
  const orderId = req.params.orderId;
  const index = orders.findIndex((order) => order.id === Number(orderId));
  const deletedOrder = orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [doesIdExist, read],
  create: [doesAddressExist, doesMobileExist, doDishesExist, postOrder],
  update: [doesIdExist, doesAddressExist, doesMobileExist, doDishesExist, doesStatusExist, wasOrderDelivered, validateIdForUpdate, updateOrder],
  delete: [doesIdExist, checkStatusBeforeDestroy, destroy]
}