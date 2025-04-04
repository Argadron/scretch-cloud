import express from 'express'
import 'dotenv/config'
import { readdir } from 'fs/promises'
import { join } from 'path'

const app = express()

const { PORT, HOST } = process.env

async function autoLoadPages(rootPath) {
    const pages = await readdir(join(process.cwd(), `pages`))

    for (let i = 0; i < pages.length; i++) {
        const currentPage = pages[i]

        if (currentPage !== "index.html") {
            app.get(`/${currentPage.split(`.`)[0]}.html`, (_, res) => {
                res.sendFile(join(rootPath, currentPage))
            })
        }
    }
}

await autoLoadPages(join(process.cwd(), `pages`))

app.use(`/css`, express.static(`${join(process.cwd(), `static`, `css`)}`))
app.use(`/js`, express.static(`${join(process.cwd(), `static`, `js`)}`))

const indexPage = join(process.cwd(), `pages`, `index.html`)

app.get(`/index.html`, (_, res) => res.sendFile(indexPage))
app.get(`/`, (_, res) => res.redirect(`http://${HOST}:${PORT}/index.html`))

app.listen(PORT, HOST, (err) => {
    if (err) {
        console.error(err)
    }

    console.log(`Client started on port ${PORT}`)
})