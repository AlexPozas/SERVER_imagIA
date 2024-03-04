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
        images: imageList,
        user: objPost.user
      };
      let responseBody = '';
      
      axios.post(url, data)
        .then(function (response) {
          const responseData = response.data;
          const responseLines = responseData.split('\n');
    
          for (const line of responseLines) {
            if (line.trim() !== '') {
              const responseObject = JSON.parse(line);
              responseBody += responseObject.response;
            }
          }
    
          console.log('image response:', responseBody);
          res.status(200).send(responseBody);
    
          // Llamada a sendResponseToDBAPI después de que responseBody se haya modificado
          sendResponseToDBAPI(id, responseBody);
        })
        .catch(function (error) {
          console.error("Error en la solicitud:", error);
          res.status(500).send('Error procesando la solicitud11.');
        });
    
    }catch (error) {
      console.log("pepee");
      res.status(500).send('Error procesando la solicitud22.');
    }
  } else if (objPost.type == 'usuario') {
    try {
      const data = {
        nickname: objPost.nom,
        email: objPost.email,
        phone_number: objPost.tel,
        access_key: objPost.access_key


      };
      const url = 'http://127.0.0.1:8080/api/user/register';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      res.status(200).send(responseData); // Enviar la respuesta al servidor
      return responseData; // Devolver la respuesta al servidor
    } catch (error) {
      console.log(error);
      res.status(500).send('Error procesando la solicitud.');
    }
  } else if (objPost.type == 'smsDAPI') {
    try {
      const data = {
        phone_number: objPost.tel,
        access_key: objPost.msg,
      };
      const url = 'http://127.0.0.1:8080/api/user/validate';

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).then(response => {
        if (!response.ok) {
          //console.log('Error: connecting to dbAPI');
        }
        return response;
      }).then(data => {

      })

    } catch (error) {
      console.log(error);
      res.status(500).send('Error procesando la solicitud.');
    }
  } else if (objPost.type == 'smsEnvia') {

    try {
      const url = 'http://192.168.1.16:8000/api/sendsms';

      const params = {
        api_token: 'c6nDH90LLt67ctWQHWry6eJjvNf5JTvtRHmOAX7dBNAg3gwhLJ1p1M3wch9U9IAs',
        username: 'ams27',
        text: objPost.msg,
        receiver: objPost.tel
      };

      axios.get(url, { params })
        .then(response => {
          console.log('Respuesta:', response.data);
        })
        .catch(error => {
          console.error('Error al realizar la solicitud:', error);
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
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

async function sendResponseToDBAPI(idPeticio, resposta) {
  console.log('sending response to DBAPI');
  let url = "http://localhost:8080/api/respostes/insert"
  var data = {
    id_peticio: idPeticio,
    resposta: resposta
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ABCD1234EFGH5678IJKL'
    },
    body: JSON.stringify(data)
  })
    .then(function (response) {
      if (!response.ok) {
        console.log('response DBAPI error')
        throw new Error('Error en la solicitud.');
      }
      return response.json();
    })
    .then(function (textResponse) {
      if (jsonResponse.status == "OK") {
        var id = jsonResponse.data.id;
        console.log('DBAPI response status ok')
        return id
      } else {
        console.log('response DBAPI status not OK')
        return 0
      }
    })
    .catch(function (error) {
      console.log('Fetch error: ' + error)
    });

}



