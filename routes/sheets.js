var express = require('express');
var router = express.Router();

const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');

const {
  authorize
} = require('../controllers/authController')
const sheetsController = require('../controllers/sheetsController')

router.get('/', async function (req, res, next) {

  let failedToUpdate = false;

  // console.log(await sheetsController.getResults())
  //set sheet data before pulling to the site
  // sheetsController.writeData()

  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), writeSheet);
  });

  async function writeSheet(auth) {
    let wsj_return = await sheetsController.getResults()
    let values = wsj_return.table_body
    const data = [{
      range: 'A1:G',
      values,
    }];
    // Additional ranges to update ...
    const resource = {
      data,
      valueInputOption: 'USER_ENTERED',
    };
    const sheets = google.sheets({
      version: 'v4',
      auth
    });
    sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: '1Nd9f4lsROwF75NFD5XmpI8LEljh9dnMFAjKxzxjMpV0',
      resource,
    }, (err, result) => {
      if (err) {
        // Handle error
        console.log(err);
      } else {
        //DATA IS SUCCESFULLY UPDATED

        //READ DATA FROM TABLE AND UPDATE SITE
        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) => {
          if (err) return console.log('Error loading client secret file:', err);
          // Authorize a client with credentials, then call the Google Sheets API.
          authorize(JSON.parse(content), getSheet);
        });

        /**
         * Prints the names and majors of students in a sample spreadsheet:
         * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
         * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
         */
        function getSheet(auth) {
          const sheets = google.sheets({
            version: 'v4',
            auth
          });
          sheets.spreadsheets.values.get({
            spreadsheetId: '1Nd9f4lsROwF75NFD5XmpI8LEljh9dnMFAjKxzxjMpV0',
            range: 'Sheet1!A3:G',
          }, (err, sheetData) => {
            if (err) {
              failedToUpdate = true;
              return console.log('The API returned an error: ' + err);
            }

            // row_data = sheetData.data.values
            res.render('index', {row_data: wsj_return.table_body, table_parent_headers: wsj_return.table_parent_headers, table_header: wsj_return.table_headers, failedToUpdate})
          });
        }
      }
    });
  }
})

module.exports = router;