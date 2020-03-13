const {google} = require('googleapis');
const axios = require("axios");
const siteUrl = "https://www.wsj.com/market-data/currencies/exchangerates?id=%7B%22regions%22%3A%5B%22Americas%22%2C%22Asia-Pacific%22%2C%22Europe%22%2C%22Middle%20East%2FAfrica%22%5D%7D&type=mdc_exchangerates";

const tags = new Set();

const fetchData = async () => {
  let wsjTableData = []
  let previous_region = null
  const result = await axios.get(siteUrl);
  let regions = result.data.data.instruments
  // console.log(result.data)

  let current_day = result.data.data.currentDay
  let previous_day = result.data.data.previousDay
  let timestamp = result.data.data.timestamp

  let table_headers = [current_day, previous_day, '1-DAY', 'YTD', current_day, previous_day]

  //the top headers
  let table_parent_headers = ['', 'In US$', '', 'US$ VS. $CHG', '', 'PER US$', '']
  wsjTableData.push(table_parent_headers)

  //push table headers to excel sheet
  //DEV NOTE: in order to achieve correct structure for Google sheet, I had to manaully add space to
  //modified table headers. Unsure why I can't .shift a value into it or concat.
  let modified_table_headers = ['', current_day, previous_day, '1-DAY', 'YTD', current_day, previous_day]
  wsjTableData.push(modified_table_headers)

  regions.forEach((instrument) => {
    if (!previous_region) {
      previous_region = instrument.region
      wsjTableData.push([previous_region, '', '', '', '', '', ''])
    } else {
      if (previous_region !== instrument.region) {
        wsjTableData.push([instrument.region, '', '', '', '', '', ''])
      }
    }

    wsjTableData.push(
      [
        instrument.currency,
        instrument.currentValueInUSD,
        instrument.previousValueInUSD,
        instrument.percentChangeOneDayValueVsUSD,
        instrument.percentChangeYTDValueVsUSD,
        instrument.currentValuePerUSD,
        instrument.previousValuePerUSD,
      ]
    )

    previous_region = instrument.region
  });

  return {
    timestamp,
    table_headers,
    table_body: wsjTableData,
    table_parent_headers
  }
};

const getResults = async () => {
  return fetchData()
};


module.exports = {
  getResults,
}