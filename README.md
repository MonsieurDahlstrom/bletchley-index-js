# bletchley-index-js
A small JS library that fetches the CSV updates from [Bletchley Indexes](bletchleyindexes.com) for a given date.

```
import BletchleyCSV from 'bletchley-indexes'

//...

//This month, most likely wont be published and throw an exception
let bletchleyDownloader = new BletchleyCSV()
let entries = await bletchleyDownloader.fetch()

//for august 2018
let august = new Date(2018,8,0)
let bletchleyDownloader = new BletchleyCSV(august)
let entries = await bletchleyDownloader.fetch()
```
