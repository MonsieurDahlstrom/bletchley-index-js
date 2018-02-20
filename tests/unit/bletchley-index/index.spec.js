import 'babel-polyfill'
import {expect} from 'chai'
import moment from 'moment'

import BletchleyIndex from '../../../src/bletchley-index'
import BletchleyIndexMember from '../../../src/bletchley-index-member'

describe('BletchleyIndex', function() {
  describe('constructor', function() {
    it('without properties', function() {
      expect( () => { new BletchleyIndex() }).to.throw()
    });
    it('with row and date', function() {
      let row = ["", "Bletchley 10", "Bletchley Index 10"]
      let date = new Date()
      expect( () => { new BletchleyIndex(row,date) }).to.not.throw()
    });
    describe('properies set', function() {
      let index
      let row
      let date
      beforeEach(function() {
        row = ["", "Bletchley 10", "Bletchley Index 10"]
        date = new Date()
        index = new BletchleyIndex(row, date)
      })
      it("has a id", function() {
        expect(index.id).to.be.an('string')
      })
      it("has a name", function() {
        expect(index.name).to.be.an('string')
        expect(index.name).to.equal(row[2])
      })
      it("has members", function() {
        expect(index.members).to.be.an('array')
        expect(index.members.length).to.equal(0)
      })
      it("has year", function() {
        expect(index.year).to.be.an('number')
        expect(index.year).to.equal(date.getFullYear())
      })
      it("has month", function() {
        expect(index.month).to.be.an('number')
        expect(index.month).to.equal(date.getMonth())
      })
    })
  });

  describe("#addMember", function () {
    let index
    let row
    beforeEach( () => {
      row = ["", "Bletchley 10", "Bletchley Index 10"]
      let date = new Date()
      index = new BletchleyIndex(row, date)
    })
    it('without a member', function () {
      expect( () => { index.addMember() }).to.throw()
    })
    it('with a member', function () {
      let memberRow = ["BTC", "0.45%", "4.56%"]
      let member = new BletchleyIndexMember(memberRow)
      expect( () => { index.addMember(member) }).to.not.throw()
      expect( member.bletchley_index_id).to.equal(index.id)
    })
  })
})
