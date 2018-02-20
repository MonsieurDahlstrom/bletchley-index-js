//
import 'babel-polyfill'
//
import {expect} from 'chai'
import sinon from 'sinon';
//
import moment from 'moment'
import fs from 'fs';
import path from 'path'
import axios from 'axios'
import axiosAdapter from 'axios-mock-adapter';

//test subject
import BletchleyIndexes from '../../../src/index'

describe('BletchleyIndexes', function() {

  describe('#retriveIndexes()', function() {

    beforeEach(function() {
      this.mock = new axiosAdapter(axios);
    })

    afterEach(function() {
      this.mock.restore();
    })

    describe('network request succeed', function() {
      beforeEach(function() {
        let datapath = path.resolve(__dirname, '../../data/jan.csv')
        let csvfile = fs.readFileSync(datapath, "utf8");
        this.mock.onGet('https://www.bletchleyindexes.com/weights/jan.csv').reply(200,csvfile)
      })
      it('parse results', function(done) {
        BletchleyIndexes.retriveIndexes(new Date(2018, 0 ,1))
        .then( (indexes) => {
          expect(indexes).to.be.an('array')
          expect(indexes.length).to.equal(5)
          done()
        })
        .catch( (err) => done(err) )
      });
      it("has a result", function (done) {
        BletchleyIndexes.retriveIndexes(new Date(2018, 0 ,1))
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
        this.mock.onGet('https://www.bletchleyindexes.com/weights/jan.csv').networkError();
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
