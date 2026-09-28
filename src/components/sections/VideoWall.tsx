import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { ButtonLink } from '../ui/Button';
import { getVisibleVideos } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';

/**
 * ЖИВОЕ ВИДЕО С ОБЪЕКТОВ.
 * Фотография показывает результат, видео показывает, что он настоящий:
 * как открываются ящики, как выглядит кухня целиком, как её собирают.
 *
 * Ролики отдаёт официальный плеер ВКонтакте и только когда пользователь
 * доскроллил до блока (loading="lazy") — на скорость первой загрузки
 * это не влияет.
 */
export async function VideoWall({ tone = 'ink' }: { tone?: 'ink' | 'bone' }) {
  const [vkVideos, site] = await Promise.all([getVisibleVideos(), getSiteView()]);
  const groupId = site.vkGroupId;
  if (vkVideos.length === 0 || !groupId || !site.vkUrl) return null;

  const vkVideoEmbed = (id: string) =>
    `https://vk.com/video_ext.php?oid=-${groupId}&id=${id}&hd=2`;
  const vkVideoLink = (id: string) => `https://vk.com/video-${groupId}_${id}`;
  const light = tone === 'ink';

  return (
    <Section tone={tone} aria-labelledby="video-title">
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="video-title"
            tone={light ? 'light' : 'dark'}
            eyebrow="Видео с объектов"
            title="Фотография показывает результат. Видео показывает, что он настоящий"
            lead="Короткие ролики из нашего сообщества: кухни целиком, механизмы, наполнение и мелочи, которые не влезают в один кадр."
          />
          <ButtonLink
            href={site.vkUrl}
            variant={light ? 'light' : 'outline'}
            size="md"
            withArrow
            className="shrink-0 max-lg:w-full"
          >
            Все видео во ВКонтакте
          </ButtonLink>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {vkVideos.map((video, i) => (
            <li key={video.id}>
              <Reveal delay={i * 60}>
                <div
                  className={`relative aspect-9/16 overflow-hidden rounded-lg ${
                    light ? 'bg-coal' : 'bg-sand'
                  }`}
                >
                  <iframe
                    src={vkVideoEmbed(video.id)}
                    title={
                      video.title ??
                      `Видео работы ателье «РЕцепт» от ${video.published}`
                    }
                    loading="lazy"
                    allow="autoplay; encrypted-media; picture-in-picture; screen-wake-lock"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-4">
                  <p
                    className={`text-[0.9375rem] font-medium ${
                      light ? 'text-cream/75' : 'text-ink'
                    }`}
                  >
                    {video.title ?? `Видео от ${video.published}`}
                  </p>
                  <span
                    className={`shrink-0 text-[0.8125rem] ${
                      light ? 'text-cream/60' : 'text-stone'
                    }`}
                  >
                    {video.duration}
                  </span>
                </div>
                <a
                  href={vkVideoLink(video.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-1 inline-block text-[0.8125rem] underline decoration-brass/50 underline-offset-4 ${
                    light ? 'text-cream/60 hover:text-cream' : 'text-stone hover:text-ink'
                  }`}
                >
                  Открыть во ВКонтакте
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
