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
  console.log(`Listening for HTTP queries on: http://0.0.0.0:${port}`);
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
  //console.log(textPost);
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
});
