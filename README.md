# PhotoRoom interview code

This code is part of an interview project for [PhotoRoom](https://www.photoroom.com). It is a basic front-end for the PhotoRoom API, as well as some design documentation for a proposed backend API.

# Folder API

This is a proposed API for handling file sync between frontend and backend.

## Data

This API represents folders and images as JSON objects. We do not store
photo data in this API; we assume that image data lives in an object
storage service, similar to Amazon S3. Given a key in this object storage
service, the client can download the data for a given image, whether that
data is the original input image (with background), or the resulting image
without a background. We also assume that when images are uploaded
to the PhotoRoom service, we store both the original input image and the
resulting background-less image in this object storage before returning
an API response to the user.


### Image
The "image" JSON object looks like this:

```
{
    name: "IMG123",
    id: "25d9f713-5529-47fd-8481-9f86e2db7f27",
    noBackground: "ba139cb9-48e8-404a-91d0-dfbc13a2e508",
}
```

It is very simple: it has a name (user-assigned, optional), and two
IDs; one for the original image data, and one for the resulting image data
after the background has been removed. Both can be used to download the
relevant image data for the photo when requested.

### Folder
The "folder" JSON object looks like this:

```
{
    name: "folder one",
    id: "2508257b-418b-409e-a299-169065a5e03c",
    createdAt: "2023-01-01T10:10:10Z",
    images: Image[]
}
```

A folder has a name (user-assigned, auto-generated if blank), an ID,
and a representation of a date-time for when the folder was created.
This `createdAt` value is useful for sorting folders by creation date
in the frontend. A folder also has a list of image objects, as described
above.

## Methods

- `GET /api/folders`: This will return a list of all folders that the user
  has created, in the form of a list of `Folder` JSON objects, as described
  above.

- `GET /api/folders/:id`: This will return the data for an individual folder,
  or a "404 Not Found" exception if the ID does not map to a folder that
  the user owns.

- `GET /api/images/:id`: This will return the metadata for an individual image
  in the JSON structure defined above, or a "404 Not Found" exception if the
  ID does not map to an image that the user owns. Note that this API does
  *not* return the actual image data, only the metadata.

- `GET /api/objects/:id`: This is a pass-through API to the object storage
  service. Given an appropriate ID, it will return the image data for a particular
  image. This data is not returned in JSON, but as binary, with appropriate
  Content-Type headers to inform the client how to interpret this binary data.

- `POST /api/folders`: Create a new folder. This requires a "name" argument,
  which is passed via the POST data. Ideally, the server would accept this data
  either as JSON or as form URL-encoded data. The return value is a JSON representation
  of the newly-created folder, including ID.

- `POST /api/images`: Create a new image. This requires passing the actual binary
  data for the image; ideally, it could be accepted either as a "data" part in
  a form-encoded multi-part POST request, or as a JSON object where the key is
  "data_b64" and the value is the base64-encoded binary data.

  Once the server receives this data, it can store it in the object storage
  and return an API response that includes the ID of this newly-created object.
  Optionally, the server can also launch a background task to remove the background
  from this newly-created image, and add the ID of that "noBackground" object
  to this image metadata when the job is finished.

- `PUT /api/folders/:id`: Update the name of a folder. Return the newly-updated
  folder JSON.

- `PUT /api/images/:id`: Update the name of an image, or move the image from one
  folder to another. To move the image to a different folder, provide a "folderId"
  argument, like this: `{folderId: "5648b89f-f216-415e-bbd4-df311ff912e8"}`.
  Return the newly-updated image JSON.

- `DELETE /api/folders/:id`: Delete a folder, and all images inside of it. Returns
  HTTP 204 No Content on success, for HTTP 404 Not Found if the folder does not exist.

- `DELETE /api/images/:id`: Delete an image. It will be automatically removed from
  the folder that holds it. HTTP 204 for success, HTTP 404 if the image does not exist.
