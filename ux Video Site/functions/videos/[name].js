export async function onRequest() {
    return new Response("権限がありません (403 Forbidden) - このファイルへ直接アクセスすることはできません。", { status: 403 });
}
