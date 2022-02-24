import * as React from 'react';
import ReactDOM from 'react-dom';
import * as Papa from "papaparse"

function App() {
  const [frameSelected, setFrameSelected] = React.useState(false)

  const [data, setData] = React.useState([])

  const [contentColumnIndex, setContentColumnIndex] = React.useState(0)
  const [tagColumnIndex, setTagColumnIndex] = React.useState(0)
  const [colorColumnIndex, setColorColumnIndex] = React.useState(0)

  const init = async () => {
    // Check to see if Frame is selected
    const selection = await miro.board.getSelection()
    if (selection.length === 1 && selection[0].type === "frame") {
      setFrameSelected(true)
    }

    console.log(selection)
  }

  // Handle selection change
  const handleSelectChange = (event, column) => {
    switch (column){
      case "content":
        setContentColumnIndex(data[0].indexOf(event.target.value))
      case "tag":
        setTagColumnIndex(data[0].indexOf(event.target.value))
      case "color":
        setColorColumnIndex(data[0].indexOf(event.target.value))
      default:
        setContentColumnIndex(0)
        setTagColumnIndex(0)
        setColorColumnIndex(0)
    }
  }

  const handleSync = () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "boardId": "5",
      "frameId": "6",
      "url": "https://people.sc.fsu.edu/~jburkardt/data/csv/homes.csv",
      "mapping": {
        "contentColumn": "Beds"
      }
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
      mode: "no-cors"
    };    

    fetch("http://100.127.5.15:8080/source", requestOptions)
      .then((response) => {
        return reponse.text()
      })
      .then((result) => {
        console.log(result)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const handleRefresh = () => {}
  
  const handleUnlink = () => {
    if(window.confirm("Unlinking will delete any changes you have made")) {
      console.log("Unlinked")
    }
  }

  // Fires on app initialization
  React.useEffect(() => {
    init()
  },[])

  // Read data from file upload
  React.useEffect(() => {
    const inputElement = document.getElementById("csv-file-upload");
    frameSelected && inputElement.addEventListener("change", handleFiles, false);

    async function handleFiles() { 
      const fileList = this.files[0];

      const parseResponse = await Papa.parse(fileList, {
        headers:true,
        complete: (results, file) => {
          console.log("complete", results, file)
          setData([...results.data])
        }
      })
    }
  }, [frameSelected]);

  return (
    <div className="grid wrapper">

    {frameSelected ? 
      <>
        <div className="cs1 ce12">
          <p>Select a Frame on the board, and select a data source below.</p>

          <div className="form-group">
            <label htmlFor="csv-file-upload" className="custom-file-upload button">Upload CSV</label>
            <input type="file" accept=".csv" id="csv-file-upload"/>
          </div>

          <div>
            <label>Content Column</label>
            <select className="select" disabled={data.length == 0} onChange={e => handleSelectChange(e, "content")}>
            <option value="" disabled selected>Upload file</option>
              {data.length !== 0 && data[0].map((option, id) =>{  
                return <option value={option.toString()} key={id}>{option.toString()}</option>
              })} 
            </select>
          </div>

          <div>
            <label>Tag Column</label>
            <select className="select" disabled={data.length == 0} onChange={e => handleSelectChange(e, "tag")} >
            <option value="" disabled selected>Upload file</option>
              {data.length !== 0 && data[0].map((option, id) =>{  
                return <option value={option.toString()} key={id}>{option.toString()}</option>
              })} 
            </select>
          </div>

          <div>
            <label>Color Column</label>
            <select className="select" disabled={data.length == 0} onChange={e => handleSelectChange(e, "color")}>
            <option value="" disabled selected>Upload file</option>
              {data.length !== 0 && data[0].map((option, id) =>{  
                return <option value={option.toString()} key={id}>{option.toString()}</option>
              })} 
            </select>
          </div>
        </div>

        <div className="cs1 ce12">
          <button className="button button-primary" onClick={handleSync}>Sync</button>
        </div>
        <div className="cs1 ce12">
          <button className="button button-secondary-border" onClick={handleRefresh}>Refresh</button>
        </div>
        <div className="cs1 ce12">
          <button className="button button-danger-border" onClick={handleUnlink}>Unlink</button>
        </div>
      </> 
      : 
      <>
        <div className="cs1 ce12 select-frame">
          <p id={"no-frame-text"}>Please select a Frame and relaunch the app.</p>
        </div>
      </>
      }
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
