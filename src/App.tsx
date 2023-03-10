import "./App.css";
import useLocalStorageState from "use-local-storage-state";
import superjson from "superjson";
import Upload from "./components/Upload";
import ImageFolder from "./components/ImageFolder";
import AddNewFolder from "./components/AddNewFolder";

function App() {
  const [imageMap, setImageMap] = useLocalStorageState<
    Map<string, string | null>
  >("imageMap", { defaultValue: new Map(), serializer: superjson });

  const [folderList, setFolderList] = useLocalStorageState<Array<string>>(
    "folders",
    { defaultValue: [], serializer: superjson }
  );

  const addInputImage = (imageBase64: string) => {
    const imageMapCopy = new Map(imageMap);
    imageMapCopy.set(imageBase64, null);
    return setImageMap(imageMapCopy);
  };

  const setOutputImage = (
    inputImageBase64: string,
    outputImageBase64: string
  ) => {
    const imageMapCopy = new Map(imageMap);
    imageMapCopy.set(inputImageBase64, outputImageBase64);
    return setImageMap(imageMapCopy);
  };

  const addFolder = (name: string) => {
    const fl = folderList || [];
    return setFolderList([...fl, name]);
  };

  return (
    <div className="App">
      <header>
        <Upload addInputImage={addInputImage} setOutputImage={setOutputImage} />
      </header>
      <ImageFolder name="Untitled Folder" imageMap={imageMap} />
      {(folderList || []).map((folderName, index) => (
        <ImageFolder name={folderName} imageMap={undefined} key={index} />
      ))}
      <AddNewFolder addFolder={addFolder} />
    </div>
  );
}

export default App;
