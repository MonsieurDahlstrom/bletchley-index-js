import axios from 'axios'
import csv from 'csv';
import numeral from 'numeral'

let percentageRegexp = /^(\d+|\d*[.]\d+)%?$/

retriveList(new Date())
