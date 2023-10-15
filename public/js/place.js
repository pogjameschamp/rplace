$(document).ready(() => {
    var socket = io()
  
    var canvas = $("#place")[0]
    var ctx = canvas.getContext("2d")
  
    canvas.width = 1000;
    canvas.height = 1000;
    


    socket.on("canvas", canvasData => {
      canvasData.forEach((row, rowIndex) => {
        // console.log(row)
        row.forEach((col, colIndex) => {
          // console.log(colIndex, rowIndex)
          ctx.fillStyle = col
          const PIXEL_SIZE = canvas.width / 100;
          ctx.fillRect(colIndex * PIXEL_SIZE, rowIndex * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
          
        })
      })
    })
  
    $("#submit").click(() => {
      socket.emit("color", {
        col: parseInt($("#x-coord").val()),
        row: parseInt($("#y-coord").val()),
        color: $("#color").val()
      })
    })
  })

  $(window).resize(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

});