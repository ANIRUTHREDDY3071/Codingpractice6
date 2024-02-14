const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovies = `
    SELECT 
     * 
    From 
    movie 
    ORDER BY 
    movie_id;`;
  const getAllMovies = await database.all(getMovies);
  response.send(
    getAllMovies.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovie = `
  INSERT INTO 
     MOVIE (director_id,movie_name,lead_actor)
  VALUES
    (${directorId},'${movieName}','${leadActor}');`;
  const movie = await database.run(postMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
    * 
    FROM 
    movie 
    WHERE 
    movie_id=${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updatedQuery = `
    UPDATE movie
    SET
    director_id=${directorId},
    movie_name=${movieName},
    lead_actor=${leadActor}
    WHERE 
    movie_id=${movie_id};`;

  await database.run(updatedQuery);
  response.send("Movie Details Updated");
});
