// 【修正済】パスワード「1ichimilu4」の正しいSHA-256ハッシュ値
const CORRECT_PASSWORD_HASH = "56832dbb9ea979a4da9b736b00b06fe1d1e43477174db7667d4fef5ba83c27e0";

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
        const inputHash = await sha256(password);

        // 1. パスワードの判定
        if (inputHash !== CORRECT_PASSWORD_HASH) {
            return new Response("権限がありません (403 Forbidden)", { status: 403 });
        }

        // 2. パスワードが正しい場合、サーバーの内部ルートから動画ファイルを取得
        // ※「videos/secret.mp4」を読み込みます。
        const videoUrl = new URL('/videos/secret.mp4', context.request.url);
        const videoResponse = await context.env.ASSETS.fetch(videoUrl);

        if (!videoResponse.ok) {
            return new Response("動画ファイルが見つかりません", { status: 404 });
        }

        // 3. 動画データをブラウザにストリーミング配信（キャッシュはさせない）
        return new Response(videoResponse.body, {
            headers: {
                "Content-Type": "video/mp4",
                "Cache-Control": "no-store"
            }
        });

    } catch (err) {
        return new Response("サーバーエラーが発生しました", { status: 500 });
    }
}

// URLをブラウザに直打ち（GETアクセス）された場合は即座に拒否
export async function onRequestGet() {
    return new Response("権限がありません (403 Forbidden)", { status: 403 });
}
