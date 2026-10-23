# Полноценный сайт: форма заявок, админка, оптимизация картинок.
# Разворачивается одной командой на любом хостинге с Docker.
#
#   docker build -t recept .
#   docker run -d --name recept -p 3000:3000 --env-file .env.local \
#     -v recept-content:/app/content \
#     -v recept-uploads:/app/public/uploads \
#     -v recept-leads:/app/.leads \
#     recept
#
# Три тома обязательны: в них живут правки из админки, загруженные
# фотографии и журнал заявок. Без них данные исчезнут при обновлении.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Самодостаточный сервер: всё нужное складывается в .next/standalone
ENV STANDALONE=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Работаем не от root: если сайт взломают, ущерб будет меньше
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Каталоги под данные: содержимое подменяется томами при запуске
RUN mkdir -p content public/uploads .leads && chown -R nextjs:nodejs content public/uploads .leads

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
