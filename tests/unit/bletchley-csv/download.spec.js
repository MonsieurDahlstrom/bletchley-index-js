//
import 'babel-polyfill'
//
import chaiAsPromised from "chai-as-promised"
import chaiDateTime from "chai-datetime"

import chai,{expect} from 'chai'
import sinon from 'sinon'

chai.use(chaiAsPromised)
chai.use(chaiDateTime)

//
import moment from 'moment'
import fs from 'fs';
import path from 'path'
import axios from 'axios'
import axiosAdapter from 'axios-mock-adapter';
import parse from 'csv-parse/lib/sync'

//test subject
import BletchleyCSV from '../../../src/bletchley-csv'

describe('BletchleyCSV', function() {

  let clock

  afterEach(function() {
    if(clock) clock.restore();
  })

  describe("#constructor", function () {

    it("with date", function () {
      let lastMonth = moment().subtract(1,'month').toDate()
      let csv = new BletchleyCSV(lastMonth)
      expect( csv.date ).to.equalDate(moment(lastMonth).startOf('month').toDate())
    })

    it("without date", function () {
      let now = new Date()
      clock = sinon.useFakeTimers();
      clock.tick(now.getTime())
      let csv = new BletchleyCSV()
      expect( csv.date ).to.equalDate( moment(now).startOf('month').toDate() )
    })

  })

  describe("#fetch", function () {

    //Since we are only testing fetching data from the server,
    //stub out the parse method
    let parseStub, axiosMock, subject, csvfile
    beforeEach(function() {
      subject = new BletchleyCSV()
      parseStub = sinon.stub(subject, "findCoinIndexes")
      axiosMock = new axiosAdapter(axios);
      let datapath = path.resolve(__dirname, '../../data/august_2018.csv')
      csvfile = fs.readFileSync(datapath, "utf8");
    })

    afterEach(function() {
      parseStub.restore()
      axiosMock.restore();
    })

    it('with http success', function() {
      axiosMock.onGet(/https:\/\/www.bletchleyindexes.com\/weights\/(january|february|march|april|may|june|july|august|september|october|november|december)_\d{4}.csv/).reply(200,csvfile)
      return expect(subject.fetch()).to.eventually.be.fulfilled
    })

    it('with network error', function() {
      axiosMock.onGet(/https:\/\/www.bletchleyindexes.com\/weights\/(january|february|march|april|may|june|july|august|september|october|november|december)_\d{4}.csv/).networkError()
      return expect(subject.fetch()).to.eventually.be.rejectedWith("Bletchley Indexes unavailable")
    })

    it('without http succss', () => {
      axiosMock.onGet(/https:\/\/www.bletchleyindexes.com\/weights\/(january|february|march|april|may|june|july|august|september|october|november|december)_\d{4}.csv/).reply(404)
      return expect(subject.fetch()).to.eventually.be.rejectedWith("Bletchley Indexes not available for date")
    })
  })

  describe("#parse", () => {

    let csvData
    let subject
    beforeEach( () => {
      let datapath = path.resolve(__dirname, '../../data/august_2018.csv')
      let csvfile = fs.readFileSync(datapath, "utf8");
      subject = new BletchleyCSV()
      csvData = parse(csvfile,{})
    } )

    it("success with valid csv", () => {
        expect(subject.findCoinIndexes(csvData)).not.to.throw
    })

    it("returns set of coin indexes", async () => {
      let result = await subject.findCoinIndexes(csvData)
      expect(result).to.be.an('array')
      expect(result[0]).to.have.keys(['name','turnover','currencies','date'])
      expect(result[0].currencies[0]).to.have.keys(['symbol', 'weight', 'previousWeight', 'turnover'])

    })
  })
})
