const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketTeam.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      fileName: databasePath,
      driver: sqlite3.database,
    })
    app.listen(3000, () => {
      console.log('Server Running at https://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error : ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_Id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_Number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
  SELECT 
  *
  FROM 
  cricket_team;`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.get('/players/:playersId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `
  SELECT 
  * 
  FROM
  cricket_team
  WHERE
  Player_id = ${playerId};`
  const player = await database.get(getPlayersQuery)
  response.send(convertDbObjectToResponseObject(player))
});

app.post("/players/", async (request,response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
  INSERT INTO
    cricket_team (player_name, jersey_number, role)
  VALUES
    ('${playerName}', ${jerseyNumber}, '${role}');`;
  const player = await database.run(postPlayerQuery);
  response.send("Players Added to Team");
})

app.put("/players/:playerId", async (request,response) =>{
  const {playerName,jerseyNumber,role} = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
  WHERE
    player_id = ${playerId};`;

  await database.run(updatePlayerQuery);
  response.send("players Details Updated");
});

app.delete("/players/:playerId/", async (request,response) => {
  const { playerId } = request.body,
  const deletePlayersQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await database.run(deletePlayersQuery);
  response.send("Player Removed");
});
module.exports = app;
