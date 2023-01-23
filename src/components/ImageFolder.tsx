import React, { useState } from "react";
import { BASE64_IMAGE_HEADER } from "../Constants";

interface ImageFolderProps {
  name: string;
  imageMap: Map<string, string | null> | undefined;
  startOpen?: boolean;
}

const ImageFolder: React.FC<ImageFolderProps> = ({
  name,
  imageMap,
  startOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(startOpen);
  const im = imageMap || new Map();
  const imageTable = (
    <table>
      {Array.from(im).map(([input, output]) => {
        return (
          <tr>
            <td>
              <img
                src={BASE64_IMAGE_HEADER + input}
                width={300}
                alt="original"
              />
            </td>
            <td>
              {output ? (
                <img
                  src={BASE64_IMAGE_HEADER + output}
                  width={300}
                  alt="result from API"
                />
              ) : (
                "loading"
              )}
            </td>
          </tr>
        );
      })}
    </table>
  );

  return (
    <div>
      <span onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "⬇" : "➡️"} {name}
      </span>
      {isOpen ? imageTable : null}
    </div>
  );
};

export default ImageFolder;
