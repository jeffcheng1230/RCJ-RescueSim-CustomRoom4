import React from 'react'
import { OpenCvProvider, useOpenCv } from 'opencv-react'

var cv;

function OpenCvElement() {
  const data = useOpenCv()
  cv = data.cv;
  return <></>
}

function App() {

  var imgRef = React.createRef();
  var downloadRef = React.createRef();

  async function createWorld(e) {
    if (cv) {
      var img = imgRef.current;
      img.src = URL.createObjectURL(e.target.files[0]);
      var mat = cv.imread(img);

      const blob = new Blob(["hello"], { type: "txt" });
      downloadRef.current.href = URL.createObjectURL(blob);
      downloadRef.current.download = "test.txt";
    }
  }

  return (
    <OpenCvProvider openCvPath='/opencv/opencv.js'>
      <OpenCvElement />
      <h1>RCJ Rescue Simulation Custom Room 4 Creation</h1>
      Select Room 4 Picture: <input type="file" id="fileInput" onChange={createWorld} name="file" />
      <img ref={imgRef} src="logo192.png" style={{display: "none"}}></img>
      <a ref={downloadRef}>Download</a>
    </OpenCvProvider>
  )
}

export default App