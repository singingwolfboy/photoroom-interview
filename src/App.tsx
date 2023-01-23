import "./App.css";
import createPersistedState from "use-persisted-state";
import Upload from "./components/Upload";
import ImageFolder from "./components/ImageFolder"

const useImageMapState =
  createPersistedState<Map<string, string | null>>("imageMap");

function App() {
  const [imageMap, setImageMap] = useImageMapState(new Map());

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

  return (
    <div className="App">
      <header>
        <Upload addInputImage={addInputImage} setOutputImage={setOutputImage} />
      </header>
      <ImageFolder name="Untitled Folder" imageMap={imageMap} />
    </div>
  );
}

export default App;
