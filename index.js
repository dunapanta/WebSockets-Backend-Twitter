const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT);

const io = require('socket.io')(server);

let connectedClients = 0;

let tweets = [];

//Evento para manejar las conexiones del cliente
io.on('connection', (socket) => {
    connectedClients++; //Contador de clientes conectados
    let address = socket.handshake.headers;
    console.log("Se ha establecido una conexión con el cliente", socket.handshake.headers);
    console.log("Clientes conectados", connectedClients);
    io.emit('new_connection', {clients: connectedClients});
    io.emit('feed', {tweets: tweets});
    socket.on('disconnect', () => { //Manejador de evento en caso de que un cliente se haya desconectado
        connectedClients--;
        console.log("Se ha desconectado un cliente");
        console.log("Clientes conectados", connectedClients);
        io.emit('new_connection', {clients: connectedClients});
    });
});

//Mensaje de bienvenida
app.get("/", (req, res) => {
    res.json({ message: "Ejemplo usando websockets" });
  });
  
  //Crear el tweet
  app.post("/tweet", (req, res) => {
    tweets.push(req.body.tweet);
    io.emit("feed", { tweets: tweets });
    res.json({ message: "Se ha publicado tu Tweet" });
  });
  
  //Actualizar el tweet por indice
  app.put("/tweet/:id", (req, res) => {
    let id = Number(req.params.id);
    let newTweet = req.body.tweet;
  
    let newA = tweets.map((el, item) => {
      if (id === item) return (tweets[item] = newTweet);
      else return el;
    });
  
    io.emit("feed", { tweets: newA });
    res.json({ message: "Se modificó el tweet.", tweets: newA });
  });
  
  //Borrar el tweet por indice
  app.delete("/tweet/:id", (req, res) => {
    let id = req.params.id;
    try {
      tweets.splice(id, 1);
      io.emit("feed", { tweets: tweets });
      res.json({ message: "Se ha eliminado el Tweet" });
    } catch (error) {
      console.log(error);
    }
  });
  