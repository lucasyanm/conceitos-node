const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function VerifyID (request, response, next) {
  const { id } = request.params;

  if(!isUuid(id))
    return response.status(400).json({
      "error": "Not valid ID"
    })

  const repositoryIndex = repositories.findIndex(repository => id === repository.id);

  if(repositoryIndex < 0)
    return response.status(400).json({
      "error": "ID not found"
    });

  response.locals.custom = true;
  response.locals.index = repositoryIndex;

  return next();
}

app.use(['/repositories/:id', '/repositories/:id/like'], VerifyID);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };
  
  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;
  const { id } = request.params;
  
  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[response.locals.index].likes
  }

  repositories[response.locals.index] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  repositories.splice(response.locals.index, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  repositories[response.locals.index].likes++;

  return response.json(repositories[response.locals.index]);
});

module.exports = app;
