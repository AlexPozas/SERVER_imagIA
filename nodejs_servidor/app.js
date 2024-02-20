const express = require('express')
const multer = require('multer');
const url = require('url')
const fs = require('fs');

const app = express()
const port = process.env.PORT || 80

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'))
app.use(express.json());

const httpServer = app.listen(port, async () => {
  console.log(`Listening for HTTP queries on: http://0.0.0.0:${port}`)
})

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  httpServer.close()
  process.exit(0);
}

app.post('/data', upload.single('file'), async (req, res) => {
  const textPost = req.body;
  const uploadedFile = req.file;
  let objPost = {}
  console.log(textPost);
  try {
    objPost = textPost.data
  } catch (error) {
    res.status(400).send('Sol·licitud incorrecta.')
    console.log(error)
    return
  }

  if (objPost.type == 'image') {
    console.log('message received "imatge"')
    try {
      const messageText = objPost.prompt;




      console.log(objPost.image);
      const imageList = objPost.image;


      let url = 'http://192.168.1.14:11434/api/maria/image';
      var data = {
        model: 'llava',
        prompt: messageText,
        images: [imageList],
      };

      const response = await axios.post(apiUrl, requestData);

        const responses = [];
        response.data.split('\n').forEach(line => {
          if (line.trim() !== '') {
            const responseObj = JSON.parse(line);
            responses.push(responseObj);
          }
        });

        // Construir un objeto JSON con la estructura deseada
        const jsonResponse = {
          type: 'respuesta',
          mensaje: responses.map(response => response.response).join(''),
        };
       /*{
          type: 'respuesta',
          mensaje: " In this picture, there is a large elephant with a wide trunk standing in the grass. It appears to be an adult male African elephant. The setting is outdoors with the sky visible above the elephant's head, creating a serene and natural atmosphere."
        }*/
       
        // Enviar la respuesta JSON al cliente
        res.status(200).json(jsonResponse);
        responses.clear;


    } catch (error) {
      console.log(error);
      res.status(500).send('Error processing request.');
    }
  } else {
    console.log('error, type not exists')
    res.status(400).send('Sol·licitud incorrecta.')
  }
})