import { vk } from './site';

/**
 * ВИДЕО ИЗ СООБЩЕСТВА ВКОНТАКТЕ
 * =============================
 * Реальные ролики из vk.com/tverkuhniru. Встраиваются официальным
 * плеером ВКонтакте — без парсинга, без токенов и без перезаливки.
 *
 * Подписи намеренно нейтральные: мы указываем только то, что знаем
 * наверняка (дату публикации и длительность). Как только у роликов
 * появятся осмысленные названия — впишите их в поле `title`,
 * и они заменят подпись по умолчанию.
 */

export type VkVideo = {
  id: string;
  /** TODO: заменить на реальное название ролика */
  title: string | null;
  duration: string;
  published: string;
};

export const vkVideos: VkVideo[] = [
  { id: '456239222', title: null, duration: '0:40', published: '18 сентября' },
  { id: '456239220', title: null, duration: '1:20', published: '14 сентября' },
  { id: '456239216', title: null, duration: '0:36', published: '9 сентября' },
];

export const vkVideoEmbed = (id: string) =>
  `https://vk.com/video_ext.php?oid=-${vk.groupId}&id=${id}&hd=2`;

export const vkVideoLink = (id: string) =>
  `https://vk.com/video-${vk.groupId}_${id}`;
