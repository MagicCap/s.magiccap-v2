// Defines express.
const express = require("express")

// Defines RethinkDB.
const r = require("rethinkdb")

// Defines the RethinkDB connection.
let conn
r.connect({
    host: process.env.RETHINKDB_HOSTNAME,
    port: process.env.RETHINKDB_PORT ? Number(process.env.RETHINKDB_PORT) : 28015,
    db: "magiccap",
    user: process.env.RETHINKDB_USER,
    password: process.env.RETHINKDB_PASSWORD,
}).then(async c => {
    conn = c

    // Makes sure the shortened links table exists.
    try {
        await r.db("magiccap").tableCreate("shortened_links").run(conn)
    } catch (_) {
        // Ignore this.
    }
})

// Defines the express app.
const app = express()

// Redirects to magiccap.me.
app.get("/", (_, res) => res.redirect("https://magiccap.me"))

// Creates the link ID.
const createId = () => {
    let res = ""
    while (res.length !== 5) {
        res = Math.random().toString(36).substring(8)
    }
    return res
}

// Handles the adding of links.
app.get("/add", async(req, res) => {
    if (!req.query.url) {
       res.status(404)
       res.end("Link not found.") 
    } else {
        const chars = createId()
        await r.table("shortened_links").insert({
            id: chars,
            url: req.query.url,
        }).run(conn)
        res.end(`https://s.magiccap.me/${chars}`)
    }
})

// Handles the routing of shortened links.
app.get("/:short", async(req, res) => {
    const short = req.params.short
    const result = await r.table("shortened_links").get(short).run(conn)
    if (!result) {
        res.status(404)
        res.end("Link not found.")
    } else {
        res.redirect(result.url)
    }
})

// Starts listening.
app.listen(8000, "0.0.0.0", () => console.log("Listening on port 8000."))
