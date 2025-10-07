import http from 'node:http'
import fs from 'node:fs/promises'

const server = http.createServer(
    //async を付けることで、その関数は 非同期処理 を返す関数になる
    async (request, response) : Promise<void> => { //voidは何もオブジェクトを返さない
        const data = await fs.readFile('./home.html', 'utf8')
        /*
        await をつけることで、読み込みが終わるまで処理を一時停止し、結果を data に代入します。
        */
        response.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'})
        /*
        ステータスコード 200（成功） を返し、
        ヘッダーで「これは HTML 文書で UTF-8 エンコードだよ」とブラウザに伝えています。
         */
        response.write(data)//data（読み込んだ HTML ファイルの内容）をクライアントに送信します。
        response.end()
    }
)