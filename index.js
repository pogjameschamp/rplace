const express = require('express'),
      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io')(server),
      MongoClient = require('mongodb').MongoClient;

const CANVAS_ROWS = 100;
const CANVAS_COLS = 100;

const port = process.env.PORT || 3000;

var canvas = [];
for(var row = 0; row < CANVAS_ROWS; row++){
    canvas[row] = [];
    for(var col = 0; col < CANVAS_COLS; col++){
        canvas[row][col] = "#FFF";
    }
}

app.use(express.static("public"));

const uri = "mongodb+srv://poggy1:JFvZZlDjMznnQNcD@pog1.bz4dont.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let pixelCollection;

client.connect()
    .then(() => {
        console.log("Connected to MongoDB");


    // retreieve pixel data and populate grid
    const database = client.db("placeDB");
    pixelCollection = database.collection("pixels");
    
    // Attempt to retrieve pixels right after connecting
    return pixelCollection.find({}).toArray();
})
.then(pixels => {
    console.log("PIXELS BEING RETRIEVED:", pixels.length);
    pixels.forEach(pixel => {
        canvas[pixel.row][pixel.col] = pixel.color;
    });
  


    // start the server and listen for socket connections AFTER loading pixels
    io.on("connection", socket => {
      console.log('User connected');
      
      socket.emit("canvas", canvas);
  
      socket.on("color", data => {
          if(data.row < CANVAS_ROWS && data.row >= 0 && data.col < CANVAS_COLS && data.col >= 0){
              canvas[data.row][data.col] = data.color;
              io.emit("canvas", canvas);
  
              pixelCollection.updateOne(
                  { row: data.row, col: data.col },
                  { $set: { color: data.color } },
                  { upsert: true },
                  (err, result) => {
                      if (err) {
                          console.error("Failed to update pixel in database", err);
                      }
                  }
              );
          }
      });
  
      socket.on('disconnect', () => {
          console.log('User disconnected');
      });
    });
    server.listen(port, () => {
      console.log('Server listening on port 3000');
    });
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
});


