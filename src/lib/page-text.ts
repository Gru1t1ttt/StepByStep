// Загрузка веб-страницы и превращение её в чистый текст для ИИ (разбор программ вузов,
// поиск возможностей). Только сервер.

export function htmlToText(html: string) {
  return html
    .replace(/<(script|style|noscript|svg|nav|footer|header|form)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<a [^>]*href="(https?:[^"]+)"[^>]*>/gi, " [$1] ") // ссылки сохраняем — ИИ берёт из них адрес
    .replace(/<(br|\/p|\/div|\/li|\/h\d|\/tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

export function safeUrl(raw: string | undefined) {
  const u = new URL(raw ?? "");
  if (!/^https?:$/.test(u.protocol) || /^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) throw new Error("bad url");
  return u;
}

export async function fetchHtml(url: URL | string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; UnilightBot/1.0; +https://unilight.kz)", Accept: "text/html" },
    signal: AbortSignal.timeout(15_000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Сайт ответил ${res.status}`);
  return res.text();
}

// Открытый Telegram-канал: веб-версия t.me/s/<канал> отдаёт последние ~20 постов.
export async function telegramPosts(channelUrl: string) {
  const name = channelUrl.replace(/^https?:\/\/(t\.me|telegram\.me)\/(s\/)?/, "").split(/[/?#]/)[0];
  const html = await fetchHtml(`https://t.me/s/${name}`);
  const posts: string[] = [];
  const blocks = html.split('class="tgme_widget_message_wrap').slice(1);
  for (const b of blocks) {
    const text = b.match(/class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    const date = b.match(/<time datetime="([^"]+)"/)?.[1]?.slice(0, 10);
    const link = b.match(/data-post="([^"]+)"/)?.[1];
    if (text) posts.push(`[${date ?? ""}] ${link ? `https://t.me/${link} ` : ""}${htmlToText(text)}`);
  }
  return posts.join("\n\n---\n\n");
}
