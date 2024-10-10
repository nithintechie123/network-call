const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
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

const convertSnakeCaseToCamelCase = (eachPlayer) => ({
  playerName: eachPlayer.player_name,
  playerId: eachPlayer.player_id,
  jerseyNumber: eachPlayer.jersey_number,
  role: eachPlayer.role,
});

//get Players API

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team`;
  const playersArray = await db.all(getPlayersQuery);

  const result = playersArray.map((eachPlayer) => {
    return convertSnakeCaseToCamelCase(eachPlayer);
  });

  response.send(result);
});

//add player API

app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;

  const addPlayerQuery = `
  INSERT INTO cricket_team(player_name,jersey_number,role)
  VALUES('${playerName}','${jerseyNumber}','${role}');
  `;

  await db.run(addPlayerQuery);

  response.send("Player Added to Team");
});

//get Player API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      cricket_team 
    WHERE 
      player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertSnakeCaseToCamelCase(player));
});

module.exports = app;
