import { Router } from 'express'
import mariadb from 'mariadb'



const router = Router()
const db = await mariadb.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'example',
    database: 'mydb',
})

interface MyData {
    id: number
    name: string
    mail: string
    age: number
}

router.get('/', async (req, res, next) => {
    const result = await db.query<MyData[]>('SELECT * FROM mydata')
    res.render('hello/index', {
        title: 'Hello!',
        content: result,
    })
})

router.get('/add', async (req, res, next) => {
    res.render('hello/add', {
        title: 'Hello/Add!',
        content: '新しいレコードを入力'
    })
})

router.post('/add', async (req, res, next) => {
    const {name, mail, age} = req.body
    await db.query('INSERT INTO mydata (name, mail, age) VALUES (?, ?, ?)', [
        name, mail, age
    ])
    res.redirect('/hello')
})

router.get('/show', async (req, res, next) => {
    const id = Number(req.query.id)
    const result: MyData[] = await db.query(
        'SELECT * FROM mydata WHERE id = ?',[id])
    res.render('hello/show', {
        title: 'Hello!/show',
        content: `id=${id}のレコード`,
        mydata: result[0],
        })
})

export default router