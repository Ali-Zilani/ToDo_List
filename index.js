const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1:27017/todoListDB")
.then(()=>{
    console.log("Successfully Connected to Database!");
})
.catch(()=>{
    console.log("Database Connection Failed!");
});

const itemSchema= {
    name:String
}

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name:"Go for a Walk"
})
const item2 = new Item({
    name:"Meditation"
})
const item3 = new Item({
    name:"Read Book"
})

const defaultItems = [item1 ,item2 ,item3]


const listSchema = {
    name : String,
    items :[itemSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/" , function(req,res){

Item.find({})
.then((foundItems)=>{
    if(foundItems.length===0)
    {
        Item.insertMany(defaultItems)
        .then((defaultItems)=>{
        console.log(" Inserted into DB : ");
        }).catch((err)=>{
        console.log("Failed insertion into DB : ",err);
        });
        res.redirect("/")
    }
    else{
        res.render("list" , {listTitle : "Today" , addNewTask : foundItems})
    }
})
.catch((err)=>{
    console.log("Failed to find Items : " ,err)
});
});

app.post("/" , function(req, res){

const itemName = req.body.newTask ;
const listName = req.body.list;

const item = new Item({
    name:itemName
}) ;

if(listName === "Today")
{
    item.save();
    res.redirect("/")
}
else {
    List.findOne({name:listName})
    .then((foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
    })
}
});

app.post("/delete",function(req,res){
    
    const listName = req.body.listName;
  const checkedItemId = req.body.checkbox;

  // Delete the item from the default collection
  if (listName == "Today") {
    deleteCheckedItem();
  } else {
    // Find the custom list and pull the item from the array
    deleteCustomItem();
  }

  async function deleteCheckedItem() {
    try{
        await Item.findByIdAndRemove(checkedItemId);
        console.log("Removed from 'Item' :  ")
        res.redirect("/")
    }catch(err){
        console.log("Failed in Removal from 'Item' : ",err )
    }
  }

  async function deleteCustomItem() {
    try{  
       await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } } ) 
       console.log("Successfully Removed from 'List' Collections")
       res.redirect("/" + listName)
}catch(err){
    console.log("Failed to Remove from 'list' collection :",err)
   }   
 }
});


app.get("/:customListName",function(req ,res){

    const customListName = _.capitalize(req.params.customListName) ;
 
    List.findOne({name:customListName})
    .then((foundList)=>{ 
        if(!foundList){//create a new list
            const list = new List({
                name : customListName,
                items:defaultItems
            })
            list.save();
            res.redirect("/"+customListName);
        }
        else {//this list already exist
           res.render("list",{ listTitle : foundList.name , addNewTask : foundList.items })
        }
})
});

app.listen(3000 , function(){
    console.log("Server is Running at port 3000..")
})

