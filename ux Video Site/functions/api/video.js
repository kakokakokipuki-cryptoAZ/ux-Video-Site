export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  // 前後の余計な空白を自動的に排除してパスワードを読み取る
  const password = searchParams.get('password')?.trim();
  const name = searchParams.get('name');

  // パスワード設定
  const CORRECT_PASSWORD = "1ichimilu4";

  // 1. パスワードチェック
  if (password !== CORRECT_PASSWORD || !name) {
    return new Response("認証エラー: アクセス権限がありません", { status: 403 });
  }

  try {
    // 【修正ポイント】ルートにある /videos/ フォルダを確実に狙い撃ちするためのURL指定に変更
    const originUrl = new URL(context.request.url);
    const videoUrl = `${originUrl.origin}/videos/${name}`;
    
    const videoResponse = await context.assets.fetch(videoUrl);

    if (videoResponse.status === 404) {
      return new Response("動画ファイルが見つかりません。デプロイ構成を確認してください。", { status: 404 });
    }

    // 動画データをブラウザに安全に返す
    return new Response(videoResponse.body, {
      headers: {
        "Content-Type": "video/mp4",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(`サーバーエラーが発生しました: ${error.message}`, { status: 500 });
  }
}
