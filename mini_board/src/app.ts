import http from 'node:http'
import fs from 'node:fs/promises'
import pug from 'pug'
import { URL } from 'node:url'
import qs from 'node:querystring'
import path from 'node:path'

// pugテンプレートをコンパイルして準備しておく
const pugIndex = pug.compileFile(path.join(import.meta.dirname, 'index.pug'))
const pugLogin = pug.compileFile(path.join(import.meta.dirname, "login.pug"));

// メッセージの最大保管数
const MAX_MESSAGE = 10;
// メッセージを保存するファイル名
const DATA_FILENAME = "mydata.txt";

// メーッセージデータを入れておく変数
const messageData: Array<{ id: string; msg: string }> = await readFromFile(
    path.join(import.meta.dirname, DATA_FILENAME),
)

// Server オブジェクト作成
const server = http.createServer(getFromClient);
// 接続待ち受け開始
server.listen(3210);
console.log("Server start!☆ミ");

/* ====↓↓↓↓ここから色々関数の定義↓↓↓↓==== */
async function getFromClient(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const url = URL.parse(req.url || "", "http://localhost:3210");
    switch (url?.pathname) {
        case "/":
            await responseIndex(req, res);
            break;
        case "/login":
            await responseLogin(req, res);
            break;
        default:
            res.writeHead(404, { "content-type": "text/plain" });
            res.end("no found page...");
            break;
    }
}

// /login の処理
async function responseLogin(
    _req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const content = pugLogin();
    res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
    res.write(content);
    res.end();
}

// / の処理
async function responseIndex(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    // POST ではないアクセス時
    if (req.method !== "POST") {
        // テンプレートをレンダリングそて返して終わり
        const content = pugIndex({
            data: messageData,
        })
        res.writeHead(200, {"Content-Type": "text/html; charset=UTF-8"});
        res.write(content);
        res.end();
        return;
    }
    // ここからは POST アクセス時
    const postData = await parseBody(req)
    await addToData(postData.id, postData.msg, DATA_FILENAME);

    // リダイレクトする
    res.writeHead(302, "Found", {
        Location: "/",
    });
    res.end();
}

// リクエストボディをパースする関数
async function parseBody(req: http.IncomingMessage) {
    return new Promise<{ id: string; msg: string }>((resolve, reject) => {
        let body = ""
        req.on("data", chunk => body += chunk)
        req.on("end", () => {
                const parsed = qs.parse(body);
                resolve({ id: String(parsed.id), msg: String(parsed.msg) })
        })
    })
}

// 指定された名前のファイルを読み込んでメッセージデータを取り出す。
async function readFromFile(filename: string) {
    // const filepath = path.join(import.meta.dirname, filename);
    // 関数内で使う変数を準備
    let fd: fs.FileHandle | null = null
    let result: Array<{ id: string; msg: string }> = [] // 読み込んだデータを入れる
    try {
        fd = await fs.open(filename, "a+") //ファイルを開く aは追記モード(a+ 指定したファイルがなければ、作って書き込む) |　rは読み取りモード　| wは書き込みモード(ｗ＋書き込みモードで開くけど中身は消さない けど　ファイルがないとエラーになる)
        result = (await fs.readFile(fd, 'utf8'))
            .split("\n") // 改行して表示されるようにフィルターをかける
            .filter(v => v.length > 0)
            .map<{
                id: string,
                msg: string
            }>(s =>  JSON.parse(s))
    } catch (err) {
        console.error(err)
    } finally {
        await fd?.close() //fs.openしたものは必ずcloseする　　fdがnullだったら何もしない
    }
    return result
}

// データを更新
async function addToData(id: string, msg: string, fileName: string) {
    messageData.unshift({ id, msg })
    if (messageData.length > MAX_MESSAGE) { //メッセージデータのサイズが最大サイズを超えたら
        messageData.pop()
    }
    await saveToFile(fileName)
}

// データを保存
async function saveToFile(filename: string) {
    const filepath = path.join(import.meta.dirname, filename)
    const data = messageData.map(m => JSON.stringify(m)).join("\n")
    try {
        await fs.writeFile(filepath, data)
    } catch (err) {
        console.error(err);
    }
}