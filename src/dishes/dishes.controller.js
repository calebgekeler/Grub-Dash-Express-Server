const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
//console.log("NEXT ID", nextId())

// TODO: Implement the /dishes handlers needed to make the tests pass
function doesIdExist(req, res, next){
  const dishId = req.params.dishId;
  //console.log("DISH ID", dishId)
  const foundDish = dishes.find((dish)=> dish.id===dishId);
  //console.log("FOUND DISH", foundDish)
  if(foundDish){
    res.locals.dish = foundDish
    return next()
  }
  next({
    status: 404,
    message: `Not found`
  })
  
}

function read(req, res){
  res.json({data: res.locals.dish})
}


function list(req, res){
  res.json({data: dishes})
}

function doesNameExist(req, res, next){
  const nameProp = req.body.data.name;
  if(nameProp){
    return next();
  }
  next({
    status: 400,
    message: `You need a name for this dish`
  });
}

function postDish(req, res){
  const newDish = {
    id: nextId(),
    name: req.body.data.name,
    description: req.body.data.description,
    price: req.body.data.price,
    image_url: req.body.data.image_url
  }
  //console.log("NEW DISH", newDish);
  dishes.push(newDish)
  res.status(201).json({data: newDish})
}

function doesDescriptionExist(req, res, next){
  const descriptionProp = req.body.data.description;
  if(descriptionProp){
    return next();
  }
  next({
    status: 400,
    message: `You need a description for this dish`
  })
}

function doesUrlExist(req, res, next){
  const urlProp = req.body.data.image_url;
  //console.log("REQ BODY", req.body.data)
  //console.log("URL", urlProp)
  if(urlProp){
    //console.log('DID WE PUSH NEXT?')
    return next();
  }
  next({
    status: 400,
    message: `You need an image_url and price for this dish`
  });
}

function doesPriceExist(req, res, next){
  const priceProp = req.body.data.price;
  //console.log("PRICE PROP",priceProp)
  //console.log(req.body.data)
  if(priceProp && priceProp > 0 && Number(priceProp)===priceProp){
    //console.log('ARE WE PASSING BOOLEAN')
    return next();
  }
  next({
    status: 400,
    message: `You need a price for this dish`
  });
}

function validateIdForUpdate(req, res, next){
  const dishId = req.params.dishId
  if(!dishId){
    return next({
      status: 400,
      message: `Dish does not exist: ${dishId}.`
    })
  }
  if(!req.body.data.id){
    res.locals.id = dishId;
    return next();
  }

  if(req.body.data.id!== dishId){
    return next({status:400, message: `Dish id does not match route id. Dish: ${req.body.data.id}, Route: ${dishId}`})
  }
  return next()
}

function update(req, res, next){
  const data = req.body.data;
  if(res.locals.id){
    res.json({data: {
      id:res.locals.id, 
      name: data.name, 
      description: data.description, 
      price: data.price, 
      image_url: data.image_url}})
  }
  res.json({data: req.body.data})
}

module.exports = {
  list,
  read: [doesIdExist, read],
  post: [doesNameExist, doesDescriptionExist, doesUrlExist, doesPriceExist, postDish],
  update: [doesIdExist, doesNameExist, doesDescriptionExist, doesUrlExist, doesPriceExist, validateIdForUpdate, update]
}