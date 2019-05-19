import 'babel-polyfill'
import chai,{expect} from 'chai'
import moment from 'moment'

import BletchleyCSV from '../../src/bletchley-csv'

describe('bletchleyindexes.com downloads', () => {

  it("august 2018", async () => {
    let subject = new BletchleyCSV(new Date(2018,8,0))
    let entries = await subject.fetch()
    expect(entries).to.be.an('array')
  })

  it("last month", async () => {
    let lastMonth = moment().subtract(1,'month').toDate()
    let subject = new BletchleyCSV(lastMonth)
    let entries = await subject.fetch()
    expect(entries).to.be.an('array')
  })

})
