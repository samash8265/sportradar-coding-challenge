//Code
//Build an ETL pipeline based on NHL APIs.
//Team Pipeline - Provide a team id and season year which outputs a CSV file.
//Team ID, Team Name, Team Venue Name, Games Played, Wins, Losses,Points
//Goals Per Game, Game Date of First Game of Season,Opponent Name in First Game of Season

//Request-Promise requirement, tool for extracting data from API
const rp = require('request-promise');

//creating constants to setup an output file
const { promisify } = require("util");
const fs = require("fs");
const { deflateSync } = require('zlib');

//Initialize prompt
const prompt = require("prompt-sync")();

//Initialize team ID and season variables
var team_id;
var team_season;

//Issue a prompt to the user asking for them to input the team ID
//along with the season in the correct format
team_id = prompt("Enter Team ID (Ex. 30): ");
team_season = prompt("Enter the Season of interest (Ex: 20182019): ");

//EXTRACT STEP
//taking information from the API into something I can work with
const getTeam = () =>
 rp({
    //URL of the API
    url: "https://statsapi.web.nhl.com/api/v1/teams/" + team_id,
    method: "GET",
    qs: {       
        expand: "team.stats",
        season: team_season
    },
    json: true
  });

  var start_Date;
  var end_Date;

  start_Date = prompt("Enter the Start Date of Season (Ex. 2018-10-03): ")
  end_Date = prompt("Enter the End Date of Season (Ex. 2019-06-06): ")


  const getTeamSchedule = () =>
  rp({
    //URL of the API
    url: "https://statsapi.web.nhl.com/api/v1/schedule?teamId=" + team_id + "&startDate=" + start_Date + "&endDate=" +end_Date,
    method: "GET",
    json: true
  });


//TRANSFORM STEP 

//Transforming the data receieved from the API into the correct format
//Find the information through the different arrays
    function transformTeam(team) {
        return {
            TeamID: team.teams[0].id,
            TeamName: team.teams[0].name,
            TeamVenueName: team.teams[0].venue.name,
            GamesPlayed: team.teams[0].teamStats[0].splits[0].stat.gamesPlayed,
            Wins: team.teams[0].teamStats[0].splits[0].stat.wins, 
            Losses: team.teams[0].teamStats[0].splits[0].stat.losses,
            Points: team.teams[0].teamStats[0].splits[0].stat.pts,
            GoalsPerGame: team.teams[0].teamStats[0].splits[0].stat.goalsPerGame,
        };
      };
   
      //Function that finds the initial game
      function transformSchedule(teamschedule) {

        //if else loop that says for the first game of the season, if the
        awayID = teamschedule.dates[0].games[0].teams.away.team.id;
        homeName = teamschedule.dates[0].games[0].teams.home.team.name;
        awayName = teamschedule.dates[0].games[0].teams.away.team.name;

        teamsID = Number(team_id);

        //away teams ID = the team ID that was entered then the Home Teams
        //Name will be returned as that would be the opponent
        if (awayID == teamsID) {
            opponentName = homeName;
        } else {
            opponentName = awayName;      
          };

          return {
            OpponentNameInFirstGame: opponentName,
          };
        };

      function transformSchedule2(teamschedule) {
        return {
          DateOfFirstGame: teamschedule.dates[0].games[0].gameDate,
        };
      };

    //Putting the Pipeline together
    async function teamETL() {

        //Letting user know that the ETL Pipeline is starting
        console.log("Starting ETL pipeline");
          
        try {
            // Extract step
            const teams = await getTeam();
            const teamschedule = await getTeamSchedule();
  
            //Let user know the team was succesfully Extracted
            console.log("Extracted Team");

            //Transform step
            const transformedTeam = transformTeam(teams);
            const transformedSchedule = transformSchedule(teamschedule);
            const transformedSchedule2 = transformSchedule2(teamschedule);



            //Combine the three different transformations into 1 string
            let team = transformedTeam;
            let schedule = transformedSchedule;
            let schedule2 = transformedSchedule2;

            let transformer = {
              ...team,
              ...schedule,
              ...schedule2,
            };


            //Let user know the team was successfully transformed
            console.log("Transformed Team");
       
            // Load step 
            //Make it into a comma separated list     
            const csvstr = [Object.keys(transformer).join(',')].concat(Object.values(transformer).join(',')).join('\n');
            
            //Let user know the team was loaded to the team succesfully
            console.log("Loaded team successfully");

            fs.writeFile("./teamdata.csv", csvstr, (err) => {
                console.log(err || "Completed, View teamdata.csv in folder for the output");
            });
                
        //Error catcher: If error is found, let user know that there was an error
        } catch (err) {
            console.log("caught error")
          console.error(err);
        }
      };

      //Runs the team pipeline
      teamETL();

