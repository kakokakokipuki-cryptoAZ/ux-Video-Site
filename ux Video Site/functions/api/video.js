export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const password = searchParams.get('password');
  const name = searchParams.get('name');

  // パスワード設定（1ichimilu4）
  const CORRECT_PASSWORD = "1ichimilu4";

  // パスワードチェック
  if (password !== CORRECT_PASSWORD || !name) {
    return new Response("認証エラー: アクセス権限がありません", { status: 403 });
  }

  try {
    // 【解説】publicの外側（ルート階層）にある「videos」フォルダから動画を安全に取得します。
    // 外部のユーザーからは絶対に見えない安全なエリアです。
    const videoResponse = await context.assets.fetch(new URL(`/videos/${name}`, context.request.url));

    if (videoResponse.status === 404) {
      return new Response("動画ファイルが見つかりません", { status: 404 });
    }

    // 動画データをブラウザに安全に返す
    return new Response(videoResponse.body, {
      headers: {
        "Content-Type": "video/mp4",
        "Cache-Control": "no-store", // 閲覧者のパソコンに動画ファイルをキャッシュ保存させない設定
      },
    });
  } catch (error) {
    return new Response("サーバーエラーが発生しました", { status: 500 });
  }
}
