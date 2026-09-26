// Примерные курсы к доллару для фильтра «стоимость до $…» (не для оплаты).
// Точная сумма всегда показывается в валюте вуза. Обновлять раз в полгода.
export const USD_PER_UNIT: Record<string, number> = {
  USD: 1,
  EUR: 1.1,
  GBP: 1.3,
  CHF: 1.18,
  CAD: 0.73,
  AUD: 0.66,
  NZD: 0.6,
  SGD: 0.77,
  HKD: 0.128,
  JPY: 0.0068,
  KRW: 0.00073,
  CNY: 0.14,
  TRY: 0.025,
  AED: 0.272,
  MYR: 0.23,
  SEK: 0.1,
  NOK: 0.095,
  DKK: 0.147,
  PLN: 0.26,
  CZK: 0.044,
  HUF: 0.0029,
  KZT: 0.0019,
  RUB: 0.012,
};

export function toUsd(amount: number | null | undefined, currency: string) {
  if (amount == null) return null;
  const rate = USD_PER_UNIT[currency.toUpperCase()];
  return rate ? Math.round(amount * rate) : null;
}
