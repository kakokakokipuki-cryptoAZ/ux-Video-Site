// パスワード「1ichimilu4」のSHA-256ハッシュ値
const CORRECT_PASSWORD_HASH = "815615d6666ba81ecb0625da651ca995d2c2079a0b12bc129037c784414cb35c";

// パスワードをハッシュ化する関数
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
    try {
        const { password } = await context.request.json();
        
        // パスワードが送られてこない場合は拒否
        if (!password) {
            return new Response("パスワードを入力してください", { status: 400 });
        }

        const inputHash = await sha256(password);

        // 1. パスワードの判定
        if (inputHash !== CORRECT_PASSWORD_HASH) {
            return new Response("パスワードが違います", { status: 403 });
        }

        // 2. サーバーの内部から動画ファイルを取得
        // ※ フォルダ名（ux Video Site）にスペースが含まれていても確実に読み込めるように対策
        const url = new URL(context.request.url);
        const videoUrl = `${url.origin}/videos/secret.mp4`;
        const videoResponse = await context.env.ASSETS.fetch(new Request(videoUrl));

        if (!videoResponse.ok) {
            return new Response("動画ファイル（secret.mp4）が見つかりません", { status: 404 });
        }

        // 3. 動画データをブラウザにストリーミング配信
        return new Response(videoResponse.body, {
            headers: {
                "Content-Type": "video/mp4",
                "Cache-Control": "no-store"
            }
        });

    } catch (err) {
        return new Response("サーバーエラーが発生しました: " + err.message, { status: 500 });
    }
}

// URL直打ち（GETアクセス）は拒否
export async function onRequestGet() {
    return new Response("権限がありません", { status: 403 });
}
