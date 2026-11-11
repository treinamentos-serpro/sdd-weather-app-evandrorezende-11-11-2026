import { expect, test } from '@playwright/test';

const cities = [
  {
    id: 1,
    name: 'São Paulo',
    country: 'Brasil',
    admin1: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
  },
  { id: 2, name: 'São Paulo', country: 'Portugal', latitude: 38.7, longitude: -9.1 },
];
const forecast = {
  current: {
    time: '2026-11-11T12:00',
    temperature_2m: 25,
    weather_code: 1,
    relative_humidity_2m: 70,
    wind_speed_10m: 12,
    surface_pressure: 1010,
    precipitation: 0,
  },
  daily: {
    time: ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
    weather_code: [1, 2, 3, 61, 0],
    temperature_2m_max: [27, 28, 29, 30, 31],
    temperature_2m_min: [17, 18, 19, 20, 21],
    precipitation_probability_max: [0, 10, 20, 30, 40],
  },
};

test('busca, seleção e conversão de unidade', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: { results: cities } }),
  );
  await page.route('https://api.open-meteo.com/**', (route) => {
    forecastRequests += 1;
    return route.fulfill({ json: forecast });
  });
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name: /São Paulo.*Brasil/ })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão diária' })).toBeVisible();
  await expect(
    page.getByRole('list', { name: 'Previsão para os próximos cinco dias' }).getByRole('listitem'),
  ).toHaveCount(5);
  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByText('77°', { exact: false }).first()).toBeVisible();
  expect(forecastRequests).toBe(1);
  await page.getByRole('button', { name: /São Paulo.*Portugal/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('searchbox', { name: 'Buscar cidade' })).toBeFocused();
  await expect(page.getByRole('heading', { name: /São Paulo.*Portugal/ })).toBeVisible();
  expect(forecastRequests).toBe(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('apresenta busca vazia e permite repetir uma falha', async ({ page }) => {
  let searches = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    searches += 1;
    if (searches === 1) return route.fulfill({ json: {} });
    if (searches === 2) return route.fulfill({ status: 500 });
    return route.fulfill({ json: { results: cities } });
  });
  await page.route('https://api.open-meteo.com/**', (route) => route.fulfill({ json: forecast }));
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByText('Nenhuma cidade encontrada para “São Paulo”.')).toBeVisible();
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar');
  await expect(page.getByRole('region', { name: 'Não foi possível carregar' })).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('searchbox', { name: 'Buscar cidade' })).toBeFocused();
  await expect(page.getByRole('heading', { name: /São Paulo.*Brasil/ })).toBeVisible();
});

test('consulta clima no celular em 375 por 812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: { results: cities } }),
  );
  await page.route('https://api.open-meteo.com/**', (route) => route.fulfill({ json: forecast }));
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
  await search.fill('São Paulo');
  await search.press('Enter');
  const current = page.getByRole('region', { name: /São Paulo.*Brasil/ });
  await expect(current).toBeVisible();
  await expect(current.getByText('25°', { exact: false })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão diária' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
