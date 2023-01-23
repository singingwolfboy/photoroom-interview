import React from "react";
import { BASE64_IMAGE_HEADER } from "../Constants";

interface ImageFolderProps {
  name: string;
  imageMap: Map<string, string | null>;
}

const ImageFolder: React.FC<ImageFolderProps> = ({ name, imageMap }) => {
  const imageTable = (
    <table>
      {Array.from(imageMap).map(([input, output]) => {
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
      <span>{name}</span>
      {imageTable}
    </div>
  );
};

export default ImageFolder;
