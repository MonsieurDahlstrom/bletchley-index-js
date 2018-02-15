import numeral from 'numeral'

export default class BletchleyIndexMember {

  constructor(data=null) {
    if(!data) throw Error('BletchleyIndexMember cant be created without data')
    if(data[0] === '' || numeral(data[1]).value() === null || numeral(data[2]).value() === null) throw Error('BletchleyIndexMember could not parse row')
    this.symbol = data[0]
    this.capitalisation = numeral(data[1]).value()
    this.weight = numeral(data[2]).value()
  }

}
