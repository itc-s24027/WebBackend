import http from "node:http"
import pug from "pug"

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


//上記の関数を切り分ける　教科書p79
const server = http.createServer(getFromClient)

server.listen(3210) //ポート番号3210でサーバーを待ち受けるように設定
console.log('Server start!')//実行するとコンソールにメッセージが表示される

//createServer の処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const content = pug.renderFile('./index.pug', {
        title: 'Indexページ',
        content: 'これはテンプレートを使ったサンプルページです。'
    })
    res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'})
    res.write(content)
    res.end()
}