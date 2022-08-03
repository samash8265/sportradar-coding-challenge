//Player Pipeline - Provide a Player ID and season year which outputs a CSV file.
//Player ID, Player Name, Current Team, Player Age, Player Number, Player Position,
//If the player is a rookie, Assists, Goals, Games Hits, Points

//Request-Promise requirement, tool for extracting data from API
const rp = require('request-promise');

//creating constants to setup an output file
const { promisify } = require("util");
const fs = require("fs");

//Initialize prompt
const prompt = require("prompt-sync")();


//Initialize Player ID and season variables
var player_id;
var player_season;

//Issue a prompt to the user asking for them to input the player ID
//along with the season in the correct format
player_id = prompt("Enter Player ID (Ex. 8471698): ");
player_season = prompt("Enter the Season of interest (Ex: 20192020): ");


//EXTRACT STEP
//taking information from the API into something I can work with
//Have to create two different Get Functions
//First Collector gets the Player's Stats
const getPlayerStats = () =>
 rp({
    url: "https://statsapi.web.nhl.com/api/v1/people/" + player_id + "/stats",
    method: "GET",
    qs: {       
        stats: "statsSingleSeason",
        season: player_season,
    },
    json: true
  });

  //Second Collector gets the Player's info
  const getPlayerInfo = () =>
 rp({
    url: "https://statsapi.web.nhl.com/api/v1/people/" + player_id,
    method: "GET",
    json: true
  });

// TRANSFORM STEP 
// Transforming the data receieved from the API into the correct format
// Find the information through the different arrays
    function transformPlayerInfo(player) {
        return {
            PlayerID: player.people[0].id, 
            PlayerName: player.people[0].fullName, 
            CurrentTeam: player.people[0].currentTeam.name, 
            PlayerAge: player.people[0].currentAge,
            PlayerNumber: player.people[0].primaryNumber,
            PlayerPosition: player.people[0].primaryPosition.name,
            IsPlayerRookie: player.people[0].rookie,
        };
      };
   
      function transformPlayerStats(player) {
        return {
            Assists: player.stats[0].splits[0].stat.assists,
            Goals: player.stats[0].splits[0].stat.goals,
            Games: player.stats[0].splits[0].stat.games,
            Hits: player.stats[0].splits[0].stat.hits,
            Points: player.stats[0].splits[0].stat.points,
        }
      }
    //Putting the Pipeline together
    async function playerETL() {

        //Letting user know that the ETL Pipeline is starting
        console.log("Starting ETL pipeline");
          
        try {
            // Extract step
            const playerInfo = await getPlayerInfo();
            const playerStats = await getPlayerStats();

            //Let user know the player was succesfully Extracted API
            console.log("Extracted Player");

            //Transform step
            const transformedInfo = transformPlayerInfo(playerInfo);
            const transformedStats = transformPlayerStats(playerStats);

            let info = transformedInfo;
            let stats = transformedStats;

            let transformedPlayer = {
              ...info,
              ...stats
            };


            //Let user know the player info was successfully transformed
            console.log("Transformed Player Stats and Info");
       
            // Load step        
            const csvstr = [Object.keys(transformedPlayer).join(',')].concat(Object.values(transformedPlayer).join(',')).join('\n');
            
            // //Let user know the Player Stats and Info was loaded succesfully
            console.log("Loaded Player Stats and Info Successfully");

            fs.writeFile("./playerdata.csv", csvstr, (err) => {
                 console.log(err || "Completed, View playerdata CSV File");
            });
                
        //Error catcher: If error is found, let user know that there was an error
        } catch (err) {
            console.log("caught error")
          console.error(err);
        }
      };

      //Runs the Player pipeline
      playerETL();
