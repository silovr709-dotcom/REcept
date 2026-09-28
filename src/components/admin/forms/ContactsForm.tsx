'use client';

import { saveSiteAction } from '@/app/admin/actions';
import { AdminForm, Card, Field, Input, TextArea } from '../ui';
import { ListEditor } from '../ListEditor';
import type { SiteContent } from '@/lib/content/types';

export function ContactsForm({ site }: { site: SiteContent }) {
  return (
    <AdminForm action={saveSiteAction}>
      <div className="grid gap-6">
        <Card
          title="Телефоны"
          description="Первый номер в списке — основной: он показывается в шапке, в мобильной панели и в форме. Подпись необязательна, но помогает клиенту понять, кому он звонит."
        >
          <ListEditor
            name="phones"
            initial={site.phones as unknown as Record<string, unknown>[]}
            collapsible={false}
            addLabel="Добавить номер"
            itemTitle={(item) => String(item.display || 'Новый номер')}
            newItem={() => ({ display: '', raw: '', who: '' })}
            fields={[
              {
                key: 'display',
                label: 'Как показывать',
                type: 'text',
                placeholder: '+7 (910) 000-00-00',
              },
              {
                key: 'raw',
                label: 'Для кнопки «позвонить»',
                type: 'text',
                placeholder: '+79100000000',
                hint: 'Можно вписать как угодно — лишние символы уберутся сами',
              },
              {
                key: 'who',
                label: 'Чей номер (необязательно)',
                type: 'text',
                placeholder: 'Роберт Шилов',
              },
            ]}
          />
        </Card>

        <Card title="Остальные каналы связи">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Почта" hint="Показывается в подвале и на контактах">
              <Input name="email" defaultValue={site.email ?? ''} type="email" />
            </Field>
            <Field label="Адрес">
              <Input
                name="address"
                defaultValue={site.address ?? ''}
                placeholder="Тверь, проспект Калинина, 13А"
              />
            </Field>
            <Field
              label="Ссылка на карту"
              hint="Короткая ссылка из Яндекс Карт — по ней строится маршрут"
            >
              <Input name="addressMapUrl" defaultValue={site.addressMapUrl ?? ''} />
            </Field>
            <Field
              label="Часы работы"
              hint="Оставьте пустым — тогда сайт покажет актуальные часы из карточки на карте"
            >
              <Input name="workingHours" defaultValue={site.workingHours ?? ''} />
            </Field>
            <Field label="ВКонтакте">
              <Input name="vkUrl" defaultValue={site.vkUrl ?? ''} />
            </Field>
            <Field
              label="Номер сообщества ВК"
              hint="Нужен, чтобы показывать видео. Цифры из адреса вида vk.com/video-87927252_456239222"
            >
              <Input name="vkGroupId" defaultValue={site.vkGroupId ?? ''} />
            </Field>
            <Field label="Instagram">
              <Input name="instagramUrl" defaultValue={site.instagramUrl ?? ''} />
            </Field>
            <Field label="Telegram" hint="Без символа @. Появится кнопкой на сайте">
              <Input
                name="telegramUsername"
                defaultValue={site.telegramUsername ?? ''}
                placeholder="recept_tver"
              />
            </Field>
            <Field label="WhatsApp" hint="Номер цифрами, например 79100000000">
              <Input name="whatsappRaw" defaultValue={site.whatsappRaw ?? ''} />
            </Field>
          </div>
        </Card>

        <Card
          title="Карточка на Яндекс Картах"
          description="По номеру карточки сайт показывает рейтинг, живые отзывы и карту. Номер видно в адресе карточки после названия организации."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Номер организации">
              <Input name="yandexOrgId" defaultValue={site.yandexOrgId ?? ''} />
            </Field>
            <Field label="Название в карточке">
              <Input name="yandexOrgName" defaultValue={site.yandexOrgName ?? ''} />
            </Field>
          </div>
        </Card>

        <Card
          title="Аналитика"
          description="Без счётчика невозможно понять, какие блоки и кнопки приносят заявки. Заведите счётчик в Яндекс.Метрике и впишите его номер — цели «заявка отправлена», «клик по телефону» и «открыл форму» настроятся сами."
        >
          <Field
            label="Номер счётчика Яндекс.Метрики"
            hint="Только цифры. Пусто — аналитика не подключается и ни один сторонний скрипт не грузится"
          >
            <Input
              name="metrikaId"
              inputMode="numeric"
              defaultValue={site.metrikaId ?? ''}
              placeholder="12345678"
            />
          </Field>
        </Card>

        <Card
          title="Условия работы"
          description="Эти цифры показываются на первом экране, в блоке цены и в микроразметке."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Гарантия, месяцев">
              <Input
                name="warrantyMonths"
                type="number"
                min={0}
                defaultValue={site.warrantyMonths}
              />
            </Field>
            <Field label="Порядок оплаты">
              <Input name="payment" defaultValue={site.payment} />
            </Field>
            <Field label="Занимаемся мебелью с (год)">
              <Input
                name="furnitureSince"
                type="number"
                defaultValue={site.furnitureSince ?? ''}
              />
            </Field>
            <Field label="Кухнями на заказ с (год)">
              <Input
                name="kitchensSince"
                type="number"
                defaultValue={site.kitchensSince ?? ''}
              />
            </Field>
          </div>
        </Card>

        <Card
          title="Адрес сайта и описание для поиска"
          description="Заголовок и описание видны в результатах поиска и при отправке ссылки в мессенджер."
        >
          <div className="grid gap-5">
            <Field
              label="Адрес сайта"
              hint="С https:// и без косой черты в конце. Влияет на ссылки в карте сайта."
            >
              <Input name="url" defaultValue={site.url} />
            </Field>
            <Field label="Заголовок в поиске">
              <Input name="metaTitle" defaultValue={site.metaTitle} />
            </Field>
            <Field
              label="Описание в поиске"
              hint="Оптимально 150–180 символов"
            >
              <TextArea
                name="metaDescription"
                rows={3}
                defaultValue={site.metaDescription}
              />
            </Field>
          </div>
        </Card>
      </div>
    </AdminForm>
  );
}
