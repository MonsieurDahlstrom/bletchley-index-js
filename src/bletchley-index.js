export default class BletchleyIndex {

  constructor(row = null, date = null) {
    if(!row || !date) throw Error('BletchleyIndex constructor needs a data and row object')
    this.name = row[0]
    this.year = date.getFullYear()
    this.month = date.getMonth()
    this.members = []
  }

  addMember(memberToAdd = null) {
    if(!memberToAdd) throw Error('BletchleyIndex.addMember called without member')
    let index = this.members.findIndex(member => member.symbol === memberToAdd.symbol)
    if(index === -1) {
      this.members.push(memberToAdd)
    } else {
      this.members.splice(index,1,memberToAdd)
    }
    //sort descending order
    this.members.sort( (memberA, memberB) => {
      let result = memberA.weight - memberB.weight
      if(result < 0) return 1
      else if (result > 0) retun -1
      else return 0
    })
  }

  coins() {
    return this.members.map(member => member.symbol)
  }

  coin(symbol=null) {
    if(!symbol) throw Error('BletchleyIndex.coin called without a currency symbol')
    return this.members.find(member => member.symbol === symbol)
  }
}
