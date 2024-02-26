const express = require('express');
const multer = require('multer');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 80;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());

const httpServer = app.listen(port, async () => {
  console.log(`Listening for HTTP queries on: http://192.168.151.167:${port}`);
});

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  httpServer.close();
  process.exit(0);
}

app.post('/data', upload.single('file'), async (req, res) => {
  const textPost = req.body;
  const uploadedFile = req.file;
  let objPost = {};
  console.log(textPost);
  console.log("texto");
  try {
    objPost = textPost.data;
  } catch (error) {
    res.status(400).send('Solicitud incorrecta.');
    console.log(error);
    return;
  }

  if (objPost.type == 'image') {
    try {
      const messageText = objPost.prompt;
      const imageList = objPost.image;

      const url = 'http://192.168.1.14:11434/api/generate';
      const data = {
        model: 'llava',
        prompt: messageText,
        images: imageList
      };

      axios.post(url, data)
        .then(function (response) {
          const responseData = response.data;
          const responseLines = responseData.split('\n');
          let responseBody = '';

          for (const line of responseLines) {
            if (line.trim() !== '') {
              const responseObject = JSON.parse(line);
              responseBody += responseObject.response;
            }
          }

          console.log('image response:', responseBody);
          res.status(200).send(responseBody);
        })
        .catch(function (error) {
          console.error("Error en la solicitud:", error);
          res.status(500).send('Error procesando la solicitud.');
        });

    } catch (error) {
      console.log(error);
      res.status(500).send('Error procesando la solicitud.');
    }
  } else {
    console.log('error, type not exists');
    res.status(400).send('Solicitud incorrecta.');
  }

  if (objPost.type == 'usuario') {
    try {

      const data = {
        nickname: objPost.nom,
        email: objPost.email,
        phone_number: objPost.tel
      };
      const url = 'http://127.0.0.1:8080/api/user/register';

      await fetch(dbapi_insert_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).then(response => {
        if (!response.ok) {
          console.log('Error: connecting to dbAPI');
        }
        return response;
      }).then(data => {

      })

    } catch (error) {
      console.log(error);
      res.status(500).send('Error procesando la solicitud.');
    }
  } else {
    console.log('error, type not exists');
    res.status(400).send('Solicitud incorrecta.');
  }


});






async function saveRequest(request_body) {
  const dbapi_insert_url = "http://127.0.0.1:8080/api/request/insert";

  if (!('data' in request_body)) {
    return ERROR;
  }

  const data = request_body.data;

  if (!('prompt' in data && 'token' in data && 'images' in data) && Object.keys(data).length === 3) {
    return ERROR;
  }

  if (typeof (data.prompt) !== 'string') {
    return ERROR
  }

  if (typeof (data.token) !== 'string') {
    return ERROR
  }

  if (!(Array.isArray(data.images))) {
    return ERROR
  }

  await fetch(dbapi_insert_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }).then(response => {
    if (!response.ok) {
      console.log('Error: connecting to dbAPI');
    }
    return response;
  }).then(data => {

  })

  return OK;
}
