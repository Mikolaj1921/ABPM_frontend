export const fillTemplate = (templateContent, data) => {
  let filledContent = templateContent;
  Object.entries(data || {}).forEach(([key, value]) => {
    if (key !== 'products') {
      const placeholder = `{{${key}}}`;
      filledContent = filledContent.replace(
        new RegExp(placeholder, 'g'),
        value || '-',
      );
    }
  });

  if (data?.products?.length) {
    const productRows = data.products
      .map(
        (product) => `
          <tr>
            <td>${product.nazwa_uslugi_towaru || '-'}</td>
            <td>${product.ilosc || '-'}</td>
            <td>${product.cena_netto || '-'}</td>
            <td>${product.wartosc_netto || '-'}</td>
          </tr>`,
      )
      .join('');
    filledContent = filledContent.replace(
      '<tr>\n        <td>{{nazwa_uslugi_towaru}}</td><td>{{ilosc}}</td><td>{{cena_netto}}</td><td>{{wartosc_netto}}</td>\n      </tr>',
      productRows,
    );
  } else {
    filledContent = filledContent.replace(
      '<tr>\n        <td>{{nazwa_uslugi_towaru}}</td><td>{{ilosc}}</td><td>{{cena_netto}}</td><td>{{wartosc_netto}}</td>\n      </tr>',
      '<tr><td colspan="4">Brak produktów</td></tr>',
    );
  }

  return filledContent;
};
