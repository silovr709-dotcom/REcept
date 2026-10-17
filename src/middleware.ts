import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/admin/session';

/**
 * Охрана админки.
 * Проверка стоит здесь, а не только в layout, по важной причине: Next
 * выполняет страницу и её layout параллельно, поэтому layout, решивший
 * ничего не показывать, уже не может помешать странице отработать и попасть
 * в ответ. Middleware срабатывает раньше рендеринга — и до кода страницы
 * дело просто не доходит.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const isLogin = pathname === '/admin/login';
  const authed = await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value,
    process.env.AUTH_SECRET,
  );

  if (!authed && !isLogin) {
    // Подменяем содержимое на экран входа, не меняя адрес в строке браузера
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.rewrite(url);
  }

  if (authed && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
