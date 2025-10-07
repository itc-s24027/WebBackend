import http from "node:http"
import pug from "pug"
import url from "node:url"
import fs from "node:fs/promises"

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
console.log('Server start(^o^)')//実行するとコンソールにメッセージが表示される

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
            // Index(トップ)ページにアクセスが来たときの処理
            const content = index_template({
                title: 'Index',
                content: 'これはテンプレートを使ったサンプルページです。'
            })
            res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'})
            res.write(content)
            res.end()
            break
        }

        case '/other': {
            const content = other_template({
                title: 'Other',
                content: 'これは新しく用意したページです。'
            })
            res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'})
            res.write(content)
            res.end()
            break
        }

        default:
            // 想定していないパスへのアクセスが来たときの処理
            res.writeHead(404, {'Content-Type': 'text/plain'})
            res.end('no page...')
            break
    }
}