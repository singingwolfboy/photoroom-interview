# PhotoRoom interview code

This code is part of an interview project for [PhotoRoom](https://www.photoroom.com). It is a basic front-end for the PhotoRoom API, as well as some design documentation for a proposed backend API.

# Running this code

First, install the dependencies:

```
npm install
```

Then run the development server. Note that this documentation uses a fake key,
but you will need a real API key for your API requests to succeed!

```
REACT_APP_API_KEY="fake-key" npm run start
```

Finally, visit http://localhost:3000 to view the frontend. Try adding some images,
and notice how the result appears in the browser! You can also refresh the page,
and the data will not be lost; it is stored using the browser's
[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
system.

# Folder API

This is a proposed API for handling file sync between frontend and backend.

## Data

This API represents folders and images as JSON objects. We do not store
photo data in this API; we assume that image data lives in an object
storage service, similar to Amazon S3. Given a key in this object storage
service, the client can download the data for a given image, whether that
data is the original input image (with background), or the resulting image
without a background. We also assume that when images are uploaded
to the PhotoRoom service, we store the original input image in this
object storage before returning an API response to the user. In the background,
the image will be processed to have its background removed, and the resulting
background-less image will also be stored in the object storage,
without modifying the original image.

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
  _not_ return the actual image data, only the metadata.

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

# Implementation

If I were implementing this API, I would probably build it in Python, since that is
the backend language that I'm most familiar with. Data would be stored in a
[PostgreSQL](https://www.postgresql.org) database, and I would use
[Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html)
for the object storage. (Backblaze B2 is S3-compatible, and much cheaper.)

I would use [FastAPI](https://fastapi.tiangolo.com) as the web framework; it is
easy to read & write, asychronous, and extremely efficient. I would use
[SQLAlchemy](https://www.sqlalchemy.org) as my ORM (object relational mapper),
in order to write SQL queries effectively and avoid performance problems.
For a task queue, I would probably start with
[Procrastinate](https://procrastinate.readthedocs.io/), and see how well that would
scale for orchestrating tasks using the Postgres LISTEN/NOTIFY system.
If that produced too much load on the database, I could switch to
[Celery](https://docs.celeryq.dev) running on [RabbitMQ](https://www.rabbitmq.com).

In terms of deployment, it should be able to run on any of the major cloud systems
(AWS, Azure, etc). I would also try running it on [Fly.io](https://fly.io),
which could result in major performance improvements due to the system automatically
distributing application globally when requested.

# Enabling Live Collaboration

In order to enable live collaboration with this API, we could assign state IDs
every time a user performed an action that would change the state on the server.
For example, adding a new folder with the `POST /api/folders` method would return
the information about the newly-created folder, _and_ a new state ID. Any time
a user attempts to change the state on the server, they must provide the latest
state ID; if they provide an out-of-date state ID, the change is rejected.

We would also need to add a new endpoint to allow users to receive deltas: representations
of the changes that other users make. A delta object might look like this:

```
{
    stateId: "abc123",
    action: "FOLDER_ADDED",
    actor: "user-987",
    data: {
        name: "folder two",
        createdAt: "2023-01-03T10:10:10Z"
    }
}
```

As you can see, this provides the latest state ID, along with all the relevant information
about the change itself. This allows frontend clients to update their state by applying
deltas as they are received.

The best way to receive these deltas would be using a websocket connection, which would
allow the server to push deltas to clients. If the connection is disrupted, the client
can use the `GET /api/folders` API method to resync.

Depending on how important live collaboration is, we could also restructure this API
to use [CRDTs](https://crdt.tech) (conflict-free replicated data types) to represent
all data changes. This would not only allow for robust collaboration without every user
needing to stay constantly in sync, but would also open up possibilities for
decentralized operations; syncing without even needing the server to be running constantly!
