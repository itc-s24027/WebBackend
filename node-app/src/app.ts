import http from "node:http"
import pug from "pug"
import url from "node:url"
import fs from "node:fs/promises"
import qs from 'node:querystring'

// const server = http.createServer(
//     (request, response) => {
        // response.end('<html><body><h1>Hello</h1><p>Welcome to Node.js</p></body></html>')//クライアントへのレスポンスを終了しつつ、文字列を送信します。
        //                                     //もしendを使わないで5分間返信がないとエラーになる
        // response.setHeader('Content-Type', 'text/html')　//Content-typeを設定。
        //                                                             // ここではテキストデータのHTML形式のものであることを示す
        // response.write('<!DOCTYPE html>')
        // response.write('<html lang="ja">')//使用言語が日本語であることを示す
        // response.write('<head><meta charset="UTF-8" />')
        // response.write('<title>Hello</title></head>')
        // response.write('<body><h1>Hello Node.js!</h1>')
        // response.write('<p>This is Node.js sample page.</p>')
        // response.write('<p>これは、Node.jsのサンプルページです。</p>', 'utf-8')//第2引数には 文字コード（エンコーディング）を指定できる
        // response.write('</body></html>')
        // response.end()

//         console.log('before readFile')
//         //上記のように膨大な量のhtmlを書くと大変なことになるので
//         //fsオブジェクトのreadFileメソッドでHTMLファイルを読み込む　教科書p73
//         fs.readFile('./home.html', 'utf8', (error, data) => {
//             response.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'})
//             response.write(data)
//             response.end()
//             console.log('response')
//         })
//         console.log('after readFile')
//     }
// )

const index_template = pug.compileFile('./index.pug')
const other_template = pug.compileFile('./other.pug')

const style_css = await fs.readFile('./style.css', 'utf8')

//上記の関数を切り分ける　教科書p79
const server = http.createServer(getFromClient)

server.listen(3210) //ポート番号3210でサーバーを待ち受けるように設定
console.log('Server start☆ミ')//実行するとコンソールにメッセージが表示される

const data = [
    {id: 1, name: 'Taro', number: '09-999-999'},
    {id: 2, name: 'Hanako', number: '080-888-888'},
    {id: 3, name: 'Sachiko', number: '070-777-777'},
    {id: 4, name: 'Ichiro', number: '060-666-666'},
]

//=================ここまでメインプログラム==========================

//createServer の処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const url_parts = new url.URL(req.url || '', 'http://localhost:3210')
    /*
    第1引数にはパースしたい文字列を渡します。ただし、そのままリクエストオブジェクトの url プロパティを渡そうとすると、TypeScript の型チェックエラーが発生するため、
    or 演算子(||) を使用して、undefined または null への対応をします。
    第2引数には、ベース URL となる文字列を渡します。
    第1引数がスキーマ (http など) やドメイン名を含むフルパス表記であれば省略することが可能です。
     */

    switch (url_parts.pathname) {
        case '/': {
            await response_index(req, res) //中身を直接書かずに関数に置き換えた
            break
        }

        case '/other': {
            await response_other(req, res) //中身を直接書かずに関数に置き換えた
            break
        }

        default:
            // 想定していないパスへのアクセスが来たときの処理
            res.writeHead(404, {'Content-Type': 'text/plain'})
            res.end('no page...')
            break
    }
}

async function response_index(req:http.IncomingMessage, res:http.ServerResponse) {
    const msg = 'これはIndexページです。'
    const content = index_template({
        title: 'Index',
        content: msg,
        data
    })
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    res.write(content)
    res.end()
}

// フォーム送信の処理
async function response_other(req:http.IncomingMessage, res:http.ServerResponse) {
    let msg = 'これはOtherページです。'

    // POST送信されているか確認 POSTされた場合のみ処理
    if (req.method ==='POST') {
        const post_data = await ( new Promise<qs.ParsedUrlQuery>((resolve, reject) => {
            //new Promise((resolve, reject) => {
            //     時間がかかる処理
            //     成功したら resolve(結果)
            //     失敗したら reject(エラー)
            // })

            //<qs.ParsedUrlQuery> は「型注釈」
            // Promise が「どんな型の値を返すか」を TypeScript に伝えています。


            let body = ''
            req.on('data', (chunk) => {
                body += chunk
            })
            req.on('end', () => {
                try {
                    resolve(qs.parse(body))
                } catch (e) {
                    console.error(e)
                    reject(e) //もしエラーが出たら reject(e) でPromiseを失敗させる
                }
            })
        }))
        msg += `あなたは「${post_data.msg}」と書きました。`
        const content = other_template({
            title: 'Other',
            content: msg,
        })
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        res.write(content)
        res.end()
    } else {
        //POST以外のアクセス
        const content = other_template({
            title: 'Other',
            content: 'ページがありません',
        })
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
        res.write(content)
        res.end()
    }
}