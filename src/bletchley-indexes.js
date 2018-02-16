import axios from 'axios'
import parse from 'csv-parse/lib/sync'

import BletchleyIndex from './bletchley-index'
import BletchleyIndexMember from './bletchley-index-member'

let currentlyParsedIndex = null

class BletchleyIndexContainer {

  constructor() {
    this.members = new Map()
  }

  async retriveIndexes(date) {
    let locale = 'en-US'
    let month = date.toLocaleString(locale, { month: "short" }).toLowerCase()
    let url = "https://www.bletchleyindexes.com/weights/" + month + ".csv"
    let result = await axios.get(url)
    if(result.status === 200) await this.parseIndexData(result.data,date)
    return Array.from(this.members)
  }

  async parseIndexData(data,date) {
    let rows = parse(data,{})
    for(let row of rows) {
      this.parseRow(row, date);
    }
    if(currentlyParsedIndex && !this.members.has(currentlyParsedIndex.name)) {
      this.members.set(currentlyParsedIndex.name,currentlyParsedIndex)
    }
    currentlyParsedIndex = false
  }

  parseRow(row, date) {
    if ( row[0] === '') {
      if(currentlyParsedIndex) {
        this.members.set(currentlyParsedIndex.name,currentlyParsedIndex)
      }
      currentlyParsedIndex = new BletchleyIndex(row,date)
    } else {
      let member = new BletchleyIndexMember(row,currentlyParsedIndex)
      currentlyParsedIndex.addMember(member)
    }
  }

}

const Container = new BletchleyIndexContainer()

export default Container
