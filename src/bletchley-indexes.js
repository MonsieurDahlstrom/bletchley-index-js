import axios from 'axios'
import parse from 'csv-parse/lib/sync'
import moment from 'moment'
import { extendMoment } from 'moment-range';

extendMoment(moment)

import BletchleyIndex from './bletchley-index'
import BletchleyIndexMember from './bletchley-index-member'

let currentlyParsedIndex = null

class BletchleyIndexContainer {

  constructor() {
    this.members = new Map()
  }

  async retriveIndexes(date) {
    let month = this.retriveMonthForDate(date)
    let url = "https://www.bletchleyindexes.com/weights/" + month + ".csv"
    let result = await axios.get(url)
    if(result.status === 200) await this.parseIndexData(result.data,date)
    let list = Array.from(this.members.values())
    return list
  }

  retriveMonthForDate(date) {
    let result = null
    let locale = 'en-US'
    //
    let startOfMonth = moment().startOf("month")
    let endOfMonth = moment().endOf("month")
    let thisMonthRange = moment.range(startOfMonth,this.thirdWednesdayOfMonth(date))
    let previousMonthsThisYear = moment.range(moment().startOf("year"), startOfMonth)
    let lastYearMonths = moment.range(moment().subtract(12,"month").startOf("month"), moment().startOf("year"))
    if(lastYearMonths.contains(date)) {
      result = date.toLocaleString(locale, { month: "short" }).toLowerCase()
    } else if(previousMonthsThisYear.contains(date)) {
      result = date.toLocaleString(locale, { month: "short" }).toLowerCase()
    } else if( thisMonthRange.contains(date) ) {
      result = date.toLocaleString(locale, { month: "short" }).toLowerCase()
    }
    return result
  }

  thirdWednesdayOfMonth(date) {
    let startOfMonth = moment(date).startOf("month").startOf('isoweek');
    let threeWeeksInMonth = moment(startOfMonth).add(3,"w")
    let thirdThursday = moment(threeWeeksInMonth).add(2, 'd');
    return startOfMonth.month() === thirdThursday.month() ? moment(thirdThursday).subtract(1,"w") : thirdThursday
  }

  /*
  retriveMonthAbbrivation(date) {
    let dateNow = moment()
    let desiredDate = moment(date)
    let locale = 'en-US'
    let abbrivation = null
    if(desiredDate > dateNow) {
      throw Error("BletchleyIndexes.retriveMonthAbbrivation future date provided")
    }
    if(desiredDate.year() === dateNow.year()) {
      if( desiredDate.month() > this.getThirdThursday(dateNow) ) {
        throw Error("BletchleyIndexes.retriveMonthAbbrivation future date provided")
      }
    }
    let oneYearAgo = moment(dateNow).subtract(1,"year")
    if( desiredDate.year() === oneYearAgo.year() ) {
      if( desiredDate.month() < dateNow.month() ) {
        throw Error("BletchleyIndexes.retriveMonthAbbrivation date provided is to old")
      }
      else if(desiredDate.month() === dateNow.month() && dateNow >= this.getThirdThursday(dateNow) ) {
        throw Error("BletchleyIndexes.retriveMonthAbbrivation date provided is to old")
      }
    }
    if (desiredDate.year() < oneYearAgo.year() ) {
      throw Error("BletchleyIndexes.retriveMonthAbbrivation date provided is to old")
    }
    abbrivation = desiredDate.toDate().toLocaleString(locale, { month: "short" }).toLowerCase()
    return abbrivation
  }

  getThirdThursday(startDate) {
    var startOfMonth = moment(startDate).startOf('month').startOf('isoweek');
    var thirdThursday = moment(startDate).startOf('month').startOf('isoweek').add(3, 'w').add(4, 'd');
    if (thirdThursday.month() == startOfMonth.month()) {
      thirdThursday.subtract(1, 'w');
    }
    return thirdThursday.startOf("day");
  }
*/
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
    if ( row[0].length === 0) {
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
