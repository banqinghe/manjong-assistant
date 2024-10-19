// prettier-ignore
const manjongText = [
    '一万', '二万', '三万', '四万', '五万', '六万', '七万', '八万', '九万',
    '一饼', '二饼', '三饼', '四饼', '五饼', '六饼', '七饼', '八饼', '九饼',
    '一条', '二条', '三条', '四条', '五条', '六条', '七条', '八条', '九条',
    '东风', '西风', '南风', '北风', '白板', '红中', '发财',
];

const manjong = manjongText.map((name, order) => ({ name, order }));

const models = ['gpt-4o', 'gpt-4', 'o1-preview', 'o1-mini'];

export { manjong, models };
