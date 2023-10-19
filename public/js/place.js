$(document).ready(() => {
  var socket = io()
  var canvas = $("#place")[0]
  var ctx = canvas.getContext("2d")
  let canvasData = [];  // Store this so we can reference it for hover redraws
  canvas.width = 1000;
  canvas.height = 1000;
  let currentColor = 'black';
  const PIXEL_SIZE = canvas.width / 100;
  let hoveredPixel = {col: null, row: null};  // Track the currently hovered pixel

    // retrieve canvas data for pixel placement and draw the pixels.
    socket.on("canvas", data => {
        canvasData = data;
        data.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                drawPixel(colIndex, rowIndex, col);
            })
        })
    });

    // change the current color to the color user presses
    $('.color-btn').click(function() {
        currentColor = $(this).data('color');
    });

  // Redraw a specific pixel based on its data
    function drawPixel(col, row, color) {
        ctx.fillStyle = color;
        ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }

    // Change color of pixel that mouse hovers above to light grey.
  canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const col = Math.floor(x / PIXEL_SIZE);
      const row = Math.floor(y / PIXEL_SIZE);


      if (hoveredPixel.col !== col || hoveredPixel.row !== row) {
          if (hoveredPixel.col !== null && hoveredPixel.row !== null) {
              // Redraw the previous hovered pixel using its original color
              drawPixel(hoveredPixel.col, hoveredPixel.row, canvasData[hoveredPixel.row][hoveredPixel.col]);
          }
          
          ctx.fillStyle = 'rgba(150,150,150,0.5)';  
          ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
          
          hoveredPixel = {col: col, row: row};
      }
  });


  // On click event send the color and row to server.
  canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const col = Math.floor(x / PIXEL_SIZE);
      const row = Math.floor(y / PIXEL_SIZE);

      socket.emit("color", {
          col: col,
          row: row,
          color: currentColor
      });
  });
});
