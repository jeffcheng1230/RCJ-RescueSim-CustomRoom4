import React, { useState } from "react";
import { OpenCvProvider, useOpenCv } from "opencv-react";

import './App.css'

function MyComponent() {
  const { loaded, cv } = useOpenCv();
  const [image, setImage] = useState(null);
  const [cont, setCont] = useState(null);
  const [contNum, setContNum] = useState(0);
  const [pixelNum, setPixelNum] = useState(0);
  const [roomWidth, setRoomWidth] = useState(0);
  const [roomHeight, setRoomHeight] = useState(0);
  const [message, setMessage] = useState("Enter room 4 dimensions and input image");
  const tileSize = 0.12;

  function showImg(img) {
    cv.imshow("canvasOutput", img);
  }

  function slowDraw() {
    let color = [255, 0, 0, 255];
    let img = new cv.Mat(image);
    let points = cont.get(contNum).data32S;
    let i = pixelNum * 2;
    let row = points[i+1];
    let col = points[i];
    let pixel = img.ucharPtr(row, col);

    for (let j = 0; j < color.length; j++)
      pixel[j] = color[j];
    showImg(img);
    setImage(img);
    if (pixelNum * 2 == points.length) {
      setContNum(contNum + 1);
      setPixelNum(0);
    }
    else
      setPixelNum(pixelNum + 1);
  }

  function colorContour(img, contour, color) {
      let points = contour.data32S;
      for (let i = 0; i < points.length; i += 2) {
        let row = points[i+1];
        let col = points[i];
        let pixel = img.ucharPtr(row, col);
        for (let j = 0; j < color.length; j++)
          pixel[j] = color[j];
      }
  }

  function has(contPoints, x, y) {
    for (let i = 0; i < contPoints.length; i++) {
      let compX = contPoints[i][0];
      let compY = contPoints[i][1];

      // Complete equality
      /* if (compX == x && compY == y)
        return true; */
      
      // proximity
      let dist = 0.002;
      if (Math.pow(compX - x, 2) + Math.pow(compY - y, 2) < Math.pow(dist, 2))
        return true;

      // single-axis proximity
      /* let dist = 0.0005;
      if (Math.abs(compX - x) < dist || Math.abs(compY - y) < dist)
        return true; */

    }
	  return false;
  }

  const onImageChange = (e) => {
    let imgElement = document.getElementById("imageSrc");
    imgElement.src = URL.createObjectURL(e.target.files[0]);
    showImg(cv.imread(imgElement));
    setImage(imgElement);
  }
  
  function getContours() {
    let src = cv.imread(image);
    let im = new cv.Mat();
    setImage(src);
    cv.cvtColor(src, im, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(im, im, 127, 255, cv.THRESH_BINARY_INV);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(im, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
    setCont(contours);

    // colorContour(src, contours.get(0), [255, 0, 0, 255]);
    // showImg(src);

    let imgWidth = src.size().width;
    let imgHeight = src.size().height;
    let room4Width = roomWidth * tileSize;
    let room4Height = roomHeight * tileSize;
    let shapeHeight = 0.1;
    let roundDigits = 5;
    let outputStr = '#VRML_SIM R2023a utf8 \nEXTERNPROTO "https://raw.githubusercontent.com/cyberbotics/webots/R2023a/projects/objects/backgrounds/protos/TexturedBackground.proto" \nEXTERNPROTO "https://raw.githubusercontent.com/cyberbotics/webots/R2023a/projects/objects/backgrounds/protos/TexturedBackgroundLight.proto" \nEXTERNPROTO "https://raw.githubusercontent.com/cyberbotics/webots/R2023a/projects/objects/floors/protos/RectangleArena.proto" \nWorldInfo { \n} \nViewpoint { \norientation -0.5103783998724162 0.5103789137647246 0.6921179475551923 1.930764481981418 \nposition 0.4521811110827828 -0.3615664819350416 2.778990665282702 \n} \nTexturedBackground { \n} \nTexturedBackgroundLight { \n}';
    if (room4Width / room4Height != imgWidth / imgHeight) {
      setMessage("Inputted width:height ratio is not same as inputted image width:height ratio");
      return;
    }

    for (let i = 0; i < contours.size(); i++) {
      outputStr += "DEF CURVED Shape { \nappearance Appearance { \nmaterial Material { \ndiffuseColor 0.2 0.47 0.52 \n} \n}\ngeometry IndexedFaceSet { \ncoord Coordinate { \npoint [\n";
      let contour = contours.get(i);
      let points = contour.data32S;
      let contPoints = [];

      for (let j = 0; j < points.length; j += 2) {
        let row = points[j+1];
        let col = points[j];
        let x = (col / imgWidth * room4Width).toFixed(roundDigits);
        let y = (row / imgHeight * room4Height).toFixed(roundDigits);

        if (!has(contPoints, x, y)) {
          outputStr += x.toString() + ' ' + y.toString() + ' ' + shapeHeight + ',';
          contPoints.push([x, y]);
        }
      }

      outputStr += "\n]\n}\ncoordIndex [\n";
      for (let j = contPoints.length - 1; j >= 0; j--) 
        outputStr += j.toString() + ',';
      outputStr += "-1,\n]\n}\n}";
    }

    const blob = new Blob([outputStr], { type: "wbt" });
    downloadRef.current.href = URL.createObjectURL(blob);
    downloadRef.current.download = "room4.wbt";
  };

  var downloadRef = React.createRef();

  if (loaded) {

    /* TODO:
        - Fix imshow issue (keep reverting to old code)
        - Export proto instead of wbt
    */

    return (
      <div>
        <h1 className="header">RCJ Rescue Simulation Custom Room 4 Creation</h1>

        <div className="input-row">
          <h3 className="input-heading"><u>Room 4 Inputs</u></h3>
        </div>
        <div className="input-row">
          <div className="input-container">
            Room 4 Width:
            <input className="number-input"
                   type="number"
                   name="roomWidth"
                   value={roomWidth}
                   onChange={(e) => {
                    setRoomWidth(Number(e.target.value));}
                    } />
            Tiles
          </div>
          <div className="input-container">
            Room 4 Height:
            <input className="number-input"
                   type="number"
                   name="roomHeight"
                   value={roomHeight}
                   onChange={(e) => {
                    setRoomHeight(Number(e.target.value));}
                    } />
            Tiles
          </div>
          <div className="input-container">
            Select Image: 
            <input
              className="file-input"
              type="file"
              id="fileInput"
              name="file"
              onChange={(e) => onImageChange(e)}
            />
            <button onClick={getContours}>Go</button>
          </div>
        </div>
        <div className="input-row">
          <a ref={downloadRef}><h3>{message}</h3></a>
        </div>

        <img id="imageSrc" alt="No Image" src="/logo192.png" style={{display: "none"}} />
        <div>
          Select Image: 
          <input
            type="file"
            id="fileInput"
            name="file"
            onChange={(e) => onImageChange(e)}
          />
          </div>
          <div className="input-row">
          <button onClick={getContours}>Go</button>
        </div>
        <div>
          Execute Room 4: 
        </div>
        <div>
          Draw Contour Pixel:
          <input type="checkbox" onChange={slowDraw}></input>
        </div>
        <canvas id="canvasOutput" style={{width: 500}}>
        </canvas>
      </div>
    );
    // return <p>opencv loaded</p>;
  } else {
    return (
      <div>
        <h1>Testing Opencv-React Lib </h1>
      </div>
    );
  }
}

const App = () => {
  const onLoaded = (cv) => {
    console.log("opencv loaded, cv");
  };

  return (
    <OpenCvProvider onLoad={onLoaded} openCvPath="/opencv/opencv.js">
      <MyComponent />
    </OpenCvProvider>
  );
};

export default App;
