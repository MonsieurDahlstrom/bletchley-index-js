//HTTP library
import axios from 'axios'
//CSV parsing
import parse from 'csv-parse/lib/sync'
//Date utilities
import moment from 'moment'

/**
Class is used to retrive the cryptocurrencies indexes from bletchleyindexes.com
An Instance is created by passing a date for the month they wich to retrive.
if no date is passed the current motnh is used.
**/
class BletchleyCSV {

  constructor(date= new Date()) {
    this.discoveredCoinIndexes = new Array()
    this.date = moment(date).startOf('month').toDate()
    this.month = moment(date).format("MMMM").toLowerCase()
    this.year = date.getFullYear()
  }

  async fetch() {
    let url = `https://www.bletchleyindexes.com/weights/${this.month}_${this.year}.csv`
    try {
      let httpRequest = await axios.get(url)
      let csvData = parse(httpRequest.data,{})
      return this.findCoinIndexes(csvData)
    }catch(error) {
      if(error.response) {
        throw Error("Bletchley Indexes not available for date");
      } else {
        throw Error("Bletchley Indexes unavailable");
      }
    }
  }

  /**
    The CSV exposed by bletchley indexes contains both header and subheaders
    which makes the parsing slightly custom, the data looks like

    ,New Weight,Old Weight,Turnover
    10,,,0.0008675955384944705
    20,,,0.07191113448980296
    ...
    10,New Weight,Old Weight,Turnover
    ETH,0.1901621772555034,0.18965896054813103,0.0005032167073723837
    ...
    20,New Weight,Old Weight,Turnover

    Where the firt rows after the header indicates the coin indexes available
    in the csv. then a subheadewr row indicates the start of currency listings,
    followed by row for each currency until you hit the next subheader.
  **/
  async findCoinIndexes(csvData) {
    let bletchleyindexes = new Map()
    //Find the different bletchley indexes in the csv file
    csvData.filter( row => row[1] == '' && row[2] == '').forEach( (row, _) => {
      bletchleyindexes.set(row[0], {name:row[0], turnover: row[3], date: this.date})
    })
    let bletchleyNames = Array.from( bletchleyindexes.keys() )
    //find the starting row for each coin index in the csv data
    let coinIndexes = csvData.filter( row => bletchleyNames.includes(row[0]) && row[1] == "New Weight" && row[2] == "Old Weight" && row[3] == "Turnover" )
      .map( row =>  { return {name:row[0], rowIndex: csvData.indexOf(row)}})
    //step through each index and find each currency within an index
    coinIndexes.forEach( (coinIndex, position) => {
      let nextCoinIndex = coinIndexes[position+1] ? coinIndexes[position+1].rowIndex : -1;
      let currencies = csvData.slice(coinIndex.rowIndex+1,  nextCoinIndex).map( (row) => { return {symbol:row[0], weight:row[1], previousWeight: row[2], turnover: row[3]} })
      let bletchley = bletchleyindexes.get( coinIndex.name )
      bletchley.currencies = currencies
      bletchleyindexes.set(bletchley.name, bletchley)
    })
    return Array.from( bletchleyindexes.entries() )
  }
}

export default BletchleyCSV
