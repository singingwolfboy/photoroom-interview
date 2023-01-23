import React, { useState } from "react";

interface AddNewFolderProps {
  addFolder: (name: string) => void;
}

const AddNewFolder: React.FC<AddNewFolderProps> = ({ addFolder }) => {
  const [folderName, setFolderName] = useState("");
  return (
    <form
      className="add-folder-wrapper"
      onSubmit={(event) => {
        event.preventDefault();
        addFolder(folderName);
        setFolderName("");
      }}
    >
      <label className="add-folder-label">
        Name:
        <input type="text" value={folderName} onChange={(e) => {setFolderName(e.target.value)}} />
      </label>
      <button type="submit">Add Folder</button>
    </form>
  );
};

export default AddNewFolder;
