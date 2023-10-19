const express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io')(server),
MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://pogjameschamp:pogjameschamp@cluster0.vgagxdh.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(express.static("public"));

const CANVAS_ROWS = 100;
const CANVAS_COLS = 100;
let pixelCollection;
var canvas = [];

for(var row = 0; row < CANVAS_ROWS; row++){
    canvas[row] = [];
    for(var col = 0; col < CANVAS_COLS; col++){
        canvas[row][col] = "#FFF";
    }
}

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
    // populate canvas with pixel data.
    pixels.forEach(pixel => {
        canvas[pixel.row][pixel.col] = pixel.color;
    });
  
    // start the server and listen for socket connections AFTER loading pixels
    io.on("connection", socket => {
      console.log('User connected');
      socket.emit("canvas", canvas);

      // On receiving color and row+col from frontend add info to database and emit the new canvas.
      socket.on("color", data => {
          if(data.row < CANVAS_ROWS && data.row >= 0 && data.col < CANVAS_COLS && data.col >= 0){
              canvas[data.row][data.col] = data.color;
              // emit new canvas to frontend. 
              io.emit("canvas", canvas);
  
              // update data in database
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
    server.listen(3000, () => {
      console.log('Server listening on port 3000');
    });
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
});


