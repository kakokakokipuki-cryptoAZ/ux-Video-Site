export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const password = searchParams.get('password');
  const name = searchParams.get('name');

  // 新しいパスワードを設定
  const CORRECT_PASSWORD = "1ichimilu4";

  // パスワードが間違っているか、ファイル名が指定されていない場合は403エラー
  if (password !== CORRECT_PASSWORD || !name) {
    return new Response("認証エラー: アクセス権限がありません", { status: 403 });
  }

  // ルートにある「videos/secret.mp4」を安全に取得
  const videoResponse = await context.assets.fetch(new URL(`/videos/${name}`, context.request.url));

  // 動画ファイルが見つからない場合
  if (videoResponse.status === 404) {
    return new Response("動画ファイルが見つかりません", { status: 404 });
  }

  // 動画データをブラウザに返す
  return new Response(videoResponse.body, {
    headers: {
      "Content-Type": "video/mp4",
      "Cache-Control": "no-store", // ブラウザにキャッシュを残さないセキュリティ設定
    },
  });
}
