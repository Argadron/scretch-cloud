import express from 'express'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'

const app = express()

const { PORT, HOST } = process.env

function autoLoadPages(rootPath) {
    const pages = fs.readdirSync(path.join(process.cwd(), `pages`))

    for (let i = 0; i < pages.length; i++) {
        const currentPage = pages[i]

        if (currentPage !== "index.html") {
            app.get(`/${currentPage.split(`.`)[0]}`, (_, res) => {
                res.sendFile(path.join(rootPath, currentPage))
            })
        }
    }
}

autoLoadPages(path.join(process.cwd(), `pages`))

app.use(`/css`, express.static(`${path.join(process.cwd(), `static`, `css`)}`))
app.use(`/js`, express.static(`${path.join(process.cwd(), `static`, `js`)}`))

const indexPage = path.join(process.cwd(), `pages`, `index.html`)

app.get(`/`, (_, res) => {
    res.sendFile(indexPage)
})

app.listen(PORT, HOST, (err) => {
    if (err) {
        console.error(err)
    }

    console.log(`Client started on port ${PORT}`)
})