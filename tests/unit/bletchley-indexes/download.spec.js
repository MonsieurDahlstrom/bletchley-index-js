//
import 'babel-polyfill'
//
import chaiAsPromised from "chai-as-promised";
import chai,{expect} from 'chai'
import sinon from 'sinon';

chai.use(chaiAsPromised);

//
import moment from 'moment'
import fs from 'fs';
import path from 'path'
import axios from 'axios'
import axiosAdapter from 'axios-mock-adapter';

//test subject
import BletchleyIndexes from '../../../src/index'

describe('BletchleyIndexes', function() {

  let clock
  let mock
  beforeEach(function() {
    mock = new axiosAdapter(axios);
  })
  afterEach(function() {
    if(clock)
      clock.restore();
    if(mock)
      mock.restore();
  })

  describe("#thirdWednesdayOfMonth", function () {
    let day
    beforeEach(function() {
      day = Math.floor(Math.random() * (28 - 1 + 1)) + 1;
    })
    it("September 2028", function () {
      let date = moment("2028-09-" + day, "YYYY-MM-DD").toDate()
      let result = BletchleyIndexes.thirdWednesdayOfMonth(date).format("YYYY-MM-DD")
      expect(result).to.equal("2028-09-20")
    })
    it("April 2018", function() {
      let date = moment("2018-04-" + day, "YYYY-MM-DD").toDate()
      let result = BletchleyIndexes.thirdWednesdayOfMonth(date).format("YYYY-MM-DD")
      expect(result).to.equal("2018-04-18")
    })
    it("October 2017", function () {
      let date = moment("2017-10-" + day, "YYYY-MM-DD").toDate()
      let result = BletchleyIndexes.thirdWednesdayOfMonth(date).format("YYYY-MM-DD")
      expect(result).to.equal("2017-10-18")
    })
    it("January 1996", function() {
      let date = moment("1996-01-" + day, "YYYY-MM-DD").toDate()
      let result = BletchleyIndexes.thirdWednesdayOfMonth(date).format("YYYY-MM-DD")
      expect(result).to.equal("1996-01-17")
    })
    it("July 1945", function () {
      let date = moment("1945-07-" + day, "YYYY-MM-DD").toDate()
      let result = BletchleyIndexes.thirdWednesdayOfMonth(date).format("YYYY-MM-DD")
      expect(result).to.equal("1945-07-18")
    })
  })

  describe("#retriveMonthForDate", function () {
    it("wont return month for dates older then 13 months", function () {
      let yearAgo = moment().subtract(13,"month").toDate()
      expect(BletchleyIndexes.retriveMonthForDate(yearAgo)).to.equal(null)
    })
    it("return month 12 months ago if bletchley index has not been refreshed", function () {
      let date = moment().subtract(12,"months").startOf("month").toDate()
      let bletchleyIndexDate = BletchleyIndexes.thirdWednesdayOfMonth(new Date())
      let clock = sinon.useFakeTimers();
      clock.tick( bletchleyIndexDate.subtract(1,"day").toDate().getTime() )
      expect(BletchleyIndexes.retriveMonthForDate(date)).to.be.an("string")
    })
    it("wont month 12 months ago if bletchley index has been reached", function () {
      let date = moment().subtract(12,"m").endOf("month").toDate()
      expect(BletchleyIndexes.retriveMonthForDate(date)).to.equal(null)
    })
  })

  describe.only('#retriveIndexes()', function() {

    describe("different dates", function() {

        let now
        let futureDate
        let monthsAgo13
        let monthsAgo12Start
        let monthsAgo12End
        let thisMonthBeforeDate
        let thisMonthAfterDate
        let sixMonthsAgo
        beforeEach(function () {
          now = new Date()
          futureDate = moment().add(1,'month').toDate()
          monthsAgo13 = moment().subtract(1,'year').subtract(1,"month").toDate()
          monthsAgo12Start = moment().subtract(1,'year').startOf('month').toDate()
          monthsAgo12End = moment().subtract(1,'year').endOf('month').toDate()
          thisMonthBeforeDate = BletchleyIndexes.thirdWednesdayOfMonth(now).subtract(2,"days").toDate()
          thisMonthAfterDate = BletchleyIndexes.thirdWednesdayOfMonth(now).add(2,"days").toDate()
          sixMonthsAgo = moment().subtract(6, "months").toDate()
          clock = sinon.useFakeTimers();
          let datapath = path.resolve(__dirname, '../../data/jan.csv')
          let csvfile = fs.readFileSync(datapath, "utf8");
          mock.onGet(/https:\/\/www.bletchleyindexes.com\/weights\/[a-zA-Z]{3}.csv/).reply(200,csvfile)
        })

        it("should fail for future date", async () => {
          clock.tick( now.getTime() )
          return expect(BletchleyIndexes.retriveIndexes(futureDate)).to.eventually.be.rejectedWith("BletchleyIndexes.retriveIndexesDate could not be matched to bletchley indexes");
        })
        it('13 months ago fails', async () => {
          clock.tick( now.getTime() )
          return expect(BletchleyIndexes.retriveIndexes(monthsAgo13)).to.eventually.be.rejectedWith("BletchleyIndexes.retriveIndexesDate could not be matched to bletchley indexes");
        }),
        it('12 months ago before bletchley index date', async () => {
          clock.tick( moment(now).startOf("month").toDate().getTime() )
          return expect(BletchleyIndexes.retriveIndexes(monthsAgo12Start)).to.eventually.be.fulfilled;
        })
        it('12 months ago after bletchley index date', async () =>{
          let dateForEnd = moment(now).endOf("month").subtract(1,"day").toDate()
          clock.tick( dateForEnd.getTime() )
          return expect(BletchleyIndexes.retriveIndexes(monthsAgo12End)).to.eventually.be.rejectedWith("BletchleyIndexes.retriveIndexesDate could not be matched to bletchley indexes");
        })
        it('this month before third Wednesday', function() {
          clock.tick(thisMonthBeforeDate.getTime())
          return expect(BletchleyIndexes.retriveIndexes(thisMonthAfterDate)).to.eventually.be.rejectedWith("BletchleyIndexes.retriveIndexesDate could not be matched to bletchley indexes");
        })
        it('this month after third Wednesday', function() {
          clock.tick(thisMonthAfterDate.getTime())
          return expect(BletchleyIndexes.retriveIndexes(thisMonthBeforeDate)).to.eventually.be.fulfilled;
        })
        it('a month in the last year', function () {
          clock.tick(now.getTime())
          return expect(BletchleyIndexes.retriveIndexes(sixMonthsAgo)).to.eventually.be.fulfilled;
        })
    })

    describe('network request succeed', function() {
      beforeEach(function() {
        let datapath = path.resolve(__dirname, '../../data/jan.csv')
        let csvfile = fs.readFileSync(datapath, "utf8");
        mock.onGet(/https:\/\/www.bletchleyindexes.com\/weights\/[a-zA-Z]{3}.csv/).reply(200,csvfile)
      })
      it('parse results', function(done) {
        BletchleyIndexes.retriveIndexes(new Date(2018, 1 ,1))
        .then( (indexes) => {
          expect(indexes).to.be.an('array')
          expect(indexes.length).to.equal(5)
          done()
        })
        .catch( (err) => done(err) )
      });
      it("has a result", function (done) {
        BletchleyIndexes.retriveIndexes(new Date(2018, 1 ,1))
        .then( (indexes) => {
          let bletchleyIndex = indexes[0]
          expect(bletchleyIndex.name).to.equal("10 Even Index")
          expect(bletchleyIndex.members).to.be.an('array')
          expect(bletchleyIndex.members.length).to.equal(10)
          done()
        })
        .catch( (err) => done(err) )
      })
    })

    describe('network request failed', function() {
      beforeEach(function() {
        mock.onGet(/https:\/\/www.bletchleyindexes.com\/weights\/[a-zA-Z]{3}.csv/).networkError()
      })
      it('parse results', function(done) {
        let date = moment().add(1, 'month')
        BletchleyIndexes.retriveIndexes(date)
        .then( (indexes) => {
          done('Expected this to fail')
        })
        .catch( (err) => {
          done()
        } )
      });
    })

  });
})
