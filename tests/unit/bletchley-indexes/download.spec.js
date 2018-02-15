import 'babel-polyfill'
import {expect} from 'chai'
import moment from 'moment'

import BletchleyIndexes from '../../../src/index'

describe('BletchleyIndexes', function() {
  describe('#retriveIndexes(data)', function() {
    it('should parse live server', function(done) {
      BletchleyIndexes.retriveIndexes(new Date(2018, 0 ,1))
      .then( (indexes) => {
        expect(indexes).to.be.an('array')
        done()
      })
      .catch( (err) => done(err) )
    });
    it('should fail future date', function(done) {
      let date = moment().add(1, 'month')
      BletchleyIndexes.retriveIndexes(date)
      .then( (indexes) => {
        done('Expected this to fail')
      })
      .catch( (err) => done() )
    });
  });
})
