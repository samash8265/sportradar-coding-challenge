# sportradar-coding-challenge

This is my first time uploading to github, so we'll see if everything works. But, I completeled both ETL Pipelines for the Teams and Players. I approached both Pipelines the same way of:

1. Extracting the Data from the API's through multiple Request-Promise functions
2. Transforming the Data into the correct format through a simple call-return function
3. Finally loading the transformed data into a csv file in a folder. (teamdata.csv and playerdata.csv)

I had a hard time finding Player ID's on NHL Players, so my testing of that was limited. My Team Pipeline was able to pass the several tests I threw at it, could definitely use some more testing though. 

These 3 npm's need to be installed in terminal once the repo is cloned to VS Code.

```
npm install --save request-promise
npm install util
npm install --save prompt-sync-history
```

This chunk of code in the terminal will run the pipeline:

Team Pipeline:
```
node team_etl.js
```
you will then be prompted to enter a Team ID, a Season, and then a Start Date/End Date of a season (might require some research on the start/end dates https://en.wikipedia.org/wiki/List_of_NHL_seasons). You'll see an example of what the input should look like from the example I give.


Player Pipeline:
```
node player_etl.js
```
You will be prompted to enter a Player ID and Season. Gave some examples for that as well. Hope the code works well, please reach out if there's any issues!

