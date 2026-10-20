import { describe, expect, it } from 'vitest';

import {
  buildCabinetClient,
  buildCabinetComposition,
  buildCabinetDocument,
  buildCabinetPayments,
  buildCabinetProject,
  buildCabinetStages,
  buildCabinetSync,
  cabinetDate,
  cabinetProjectStatus,
} from './cabinetPayload';
import type { ClientOfferDetailKind, ClientOfferRollupRow } from './clientOffer';
import type { ClientProfile, Project } from '../types';

function profile(extra: Partial<ClientProfile> = {}): ClientProfile {
  return {
    id: 'cl-1',
    name: 'Татьяна Д.',
    phones: ['+7 (910) 111-22-33'],
    emails: ['Tatyana@Example.COM'],
    objectAddress: 'Тверь, Калинина 13А',
    tags: [],
    history: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...extra,
  };
}

function project(extra: Partial<Project> = {}): Project {
  return {
    id: 'pr-1',
    name: 'Кухня на Калинина',
    client: 'Татьяна Д.',
    clientId: 'cl-1',
    date: '2026-02-01',
    comment: '',
    status: 'draft',
    pricebookId: 'pb',
    pricebookName: 'Висма',
    lines: [],
    settings: {} as Project['settings'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...extra,
  };
}

function rollupRow(
  label: string,
  names: string[],
  qtyText: string,
  sum: number,
  kind: ClientOfferDetailKind = 'hinge',
): ClientOfferRollupRow {
  return {
    kind,
    label,
    qtyText,
    sum,
    items: names.map((name, index) => ({
      id: `${label}-${index}`,
      kind,
      kindLabel: label,
      name,
      itemId: `item-${index}`,
      lineIds: [],
      qty: 1,
      qtyEffective: 1,
      unit: 'шт',
      priceBasis: 'unit',
      details: [],
      clientSum: sum,
      hasUnpriced: false,
      sort: index,
    })) as ClientOfferRollupRow['items'],
  };
}

describe('ключи связи и клиент', () => {
  it('клиент уходит с ключом калькулятора, почта приводится к нижнему регистру', () => {
    const result = buildCabinetClient(profile());
    expect(result.ref).toBe('calc:cl-1');
    expect(result.display_name).toBe('Татьяна Д.');
    expect(result.phone).toBe('+7 (910) 111-22-33');
    expect(result.email).toBe('tatyana@example.com');
  });

  it('пустые поля не уезжают пустыми строками', () => {
    const result = buildCabinetClient(profile({ phones: [], emails: ['   '] }));
    expect(result.phone).toBeUndefined();
    expect(result.email).toBeUndefined();
  });

  it('проект берёт адрес объекта клиента, если в графике адреса нет', () => {
    const result = buildCabinetProject(project(), profile());
    expect(result.ref).toBe('calc:pr-1');
    expect(result.title).toBe('Кухня на Калинина');
    expect(result.address).toBe('Тверь, Калинина 13А');
  });
});

describe('состояние проекта', () => {
  it('переводит рабочие статусы сделки в состояния кабинета', () => {
    expect(cabinetProjectStatus('offerSent', 'sent')).toBe('design');
    expect(cabinetProjectStatus('approved', 'draft')).toBe('agreed');
    expect(cabinetProjectStatus('production', 'draft')).toBe('production');
    expect(cabinetProjectStatus('delivered', 'draft')).toBe('installation');
    expect(cabinetProjectStatus('rejected', 'draft')).toBe('on_hold');
  });

  it('без статуса сделки опирается на статус проекта', () => {
    expect(cabinetProjectStatus(undefined, 'draft')).toBe('new');
    expect(cabinetProjectStatus(undefined, 'approved')).toBe('agreed');
    expect(cabinetProjectStatus(undefined, 'archived')).toBe('completed');
  });
});

describe('состав заказа', () => {
  const rollup = [
    rollupRow('Петли', ['Blum 110° с доводчиком'], '24 шт', 31200),
    rollupRow('Фасады', ['МДФ ПВХ матовый', 'МДФ ПВХ матовый'], '8,4 м²', 118000, 'facade'),
  ];

  it('показывает состав построчно и одну общую сумму', () => {
    const rows = buildCabinetComposition(rollup, 420000);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({ title: 'Петли', details: '24 шт · Blum 110° с доводчиком' });
    expect(rows[2]).toEqual({ title: 'Итого по заказу', amount: '420000' });
  });

  it('ни в одной строке состава нет цены', () => {
    const rows = buildCabinetComposition(rollup, 420000);
    for (const row of rows.slice(0, -1)) {
      expect(row.amount).toBeUndefined();
    }
  });

  it('повторяющиеся наименования не дублируются', () => {
    const rows = buildCabinetComposition(rollup, null);
    expect(rows[1].details).toBe('8,4 м² · МДФ ПВХ матовый');
  });

  it('без итоговой суммы итоговая строка не выдумывается', () => {
    expect(buildCabinetComposition(rollup, null)).toHaveLength(2);
    expect(buildCabinetComposition(rollup, 0)).toHaveLength(2);
  });
});

describe('оплаты', () => {
  it('переносит только внесённые платежи', () => {
    const rows = buildCabinetPayments({
      status: 'prepaid',
      entries: [
        { id: '1', amount: 150000, at: '2026-03-01T10:00:00.000Z', kind: 'prepay', comment: 'наличными' },
        { id: '2', amount: 90000, at: '2026-04-15', kind: 'final' },
      ],
    });
    expect(rows).toEqual([
      { title: 'Предоплата', amount: '150000', paid_amount: '150000', paid_on: '2026-03-01', status: 'paid', note: 'наличными' },
      { title: 'Доплата', amount: '90000', paid_amount: '90000', paid_on: '2026-04-15', status: 'paid', note: undefined },
    ]);
  });

  it('без платежей не придумывает график', () => {
    expect(buildCabinetPayments(undefined)).toEqual([]);
    expect(buildCabinetPayments({ status: 'none' })).toEqual([]);
  });

  it('старые записи без списка платежей дают одну строку', () => {
    const rows = buildCabinetPayments({ status: 'paid', paidTotal: 240000, paymentDate: '2026-05-20' });
    expect(rows).toEqual([
      { title: 'Оплата по заказу', amount: '240000', paid_amount: '240000', paid_on: '2026-05-20', status: 'paid' },
    ]);
  });
});

describe('этапы', () => {
  it('переносит только те этапы, у которых есть настоящая дата', () => {
    const rows = buildCabinetStages({ measureAt: '2026-03-10', installAt: '2026-06-01' }, '2026-04-01');
    expect(rows).toEqual([
      { name: 'Замер помещения', planned_on: '2026-03-10', status: 'done', completed_on: '2026-03-10' },
      { name: 'Монтаж', planned_on: '2026-06-01', status: 'in_progress', completed_on: undefined },
    ]);
  });

  it('без графика ничего не отправляет', () => {
    expect(buildCabinetStages(undefined)).toEqual([]);
    expect(buildCabinetStages({})).toEqual([]);
  });

  it('названия этапов совпадают с кабинетом слово в слово', () => {
    const rows = buildCabinetStages({ measureAt: '2026-03-10', readyAt: '2026-05-01', deliveryAt: '2026-05-20' });
    expect(rows.map((row) => row.name)).toEqual(['Замер помещения', 'Проверка готовности', 'Доставка']);
  });

  it('кривая дата отбрасывается, а не превращается в сегодня', () => {
    expect(cabinetDate('когда-нибудь')).toBeUndefined();
    expect(buildCabinetStages({ measureAt: 'скоро' })).toEqual([]);
  });
});

describe('документы', () => {
  it('КП и договор уходят на согласование, квитанция — нет', () => {
    const offer = buildCabinetDocument('pr-1', 'offer', 'КП.docx');
    expect(offer).toMatchObject({ ref: 'calc:pr-1:offer', category: 'estimate', needs_approval: true });

    const contract = buildCabinetDocument('pr-1', 'contract', 'Договор.docx');
    expect(contract).toMatchObject({ category: 'contract', needs_approval: true });

    const receipt = buildCabinetDocument('pr-1', 'receipt', 'Квитанция.docx');
    expect(receipt).toMatchObject({ category: 'payment', needs_approval: false });
  });

  it('повторная отправка того же вида документа имеет тот же ключ', () => {
    const first = buildCabinetDocument('pr-1', 'offer', 'КП.docx');
    const second = buildCabinetDocument('pr-1', 'offer', 'КП-2.docx', { comment: 'добавили подсветку' });
    expect(second.ref).toBe(first.ref);
    expect(second.comment).toBe('добавили подсветку');
  });
});

describe('полная выгрузка проекта', () => {
  it('собирает клиента, проект, оплаты и этапы', () => {
    const payload = buildCabinetSync({
      project: project({
        orderWorkflow: { status: 'approved' },
        schedule: { measureAt: '2026-03-10', address: 'Тверь, Советская 1' },
      }),
      profile: profile({
        paymentsByProject: { 'pr-1': { status: 'prepaid', prepayment: 100000, paymentDate: '2026-03-12' } },
      }),
      rollup: [rollupRow('Петли', ['Blum'], '24 шт', 31200)],
      total: 420000,
      today: '2026-04-01',
    });

    expect(payload.client.ref).toBe('calc:cl-1');
    expect(payload.project.status).toBe('agreed');
    expect(payload.project.address).toBe('Тверь, Советская 1');
    expect(payload.costs).toHaveLength(2);
    expect(payload.payments).toHaveLength(1);
    expect(payload.stages).toEqual([
      { name: 'Замер помещения', planned_on: '2026-03-10', status: 'done', completed_on: '2026-03-10' },
    ]);
  });

  it('без посчитанного состава состав не отправляется и в кабинете не стирается', () => {
    const payload = buildCabinetSync({ project: project(), profile: profile() });
    expect(payload.costs).toBeUndefined();
  });

  it('в выгрузке нет ни себестоимости, ни наценки, ни внутренних заметок', () => {
    const payload = buildCabinetSync({
      project: project({
        comment: 'внутренний комментарий, клиенту не показывать',
        orderWorkflow: { status: 'rejected', lostReason: 'дорого', managerComment: 'перезвонить' },
      }),
      profile: profile({ managerComment: 'торгуется', passport: '28 00 123456' }),
      rollup: [rollupRow('Петли', ['Blum'], '24 шт', 31200)],
      total: 420000,
    });

    const text = JSON.stringify(payload);
    for (const secret of ['дорого', 'перезвонить', 'торгуется', '28 00 123456', 'внутренний комментарий']) {
      expect(text).not.toContain(secret);
    }
    expect(text).not.toContain('31200');
  });
});
