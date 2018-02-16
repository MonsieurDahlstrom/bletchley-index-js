import 'babel-polyfill'
import {expect} from 'chai'
import moment from 'moment'

import BletchleyIndexMember from '../../../src/bletchley-index-member'

describe('BletchleyIndexMember', function() {
  describe('constructor', function() {
    it('without properties', function() {
      expect( () => { new BletchleyIndex() }).to.throw()
    });
    it('with invalid row', function() {
      let row = ["BTC", "nan", '57%']
      expect( () => { let member = new BletchleyIndexMember(row) }).to.throw()
    });
    it('with valid row', function() {
      let row = ["BTC", "56%", '57%']
      expect( () => { let member = new BletchleyIndexMember(row) }).to.not.throw()
    });

    describe('properties', function () {
      let row
      let member
      before(function() {
        row = ["BTC", "56%", '57%']
        member = new BletchleyIndexMember(row)
      })
      it('has a symbol', () => expect(member.symbol).to.be.an('string') )
      it('has a capitalisation', () => expect(member.capitalisation).to.be.an('number') )
      it('has a weight', () => expect(member.weight).to.be.an('number') )
      it('has a bletchley_index_id', () => expect(member.bletchley_index_id).to.be.an('number') )

    })
  })
})
