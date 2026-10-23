from pathlib import Path
import re,json
r=Path(__file__).resolve().parents[1]
d=r/'dist'
fi=re.findall(r'<loc>(.*?)</loc>',(d/'sitemap.xml').read_text()); en=re.findall(r'<loc>(.*?)</loc>',(d/'en/sitemap.xml').read_text())
assert len(fi)==42,(len(fi),fi)
assert len(en)==9
for u in en:
 p=u.removeprefix('https://winterswim.fi'); h=(d/'en'/p.lstrip('/')/'index.html').read_text()
 assert f'rel="canonical" href="{u}"' in h,u
 assert 'data-site="winterswim"' in h
 assert not re.search(r'href="/en/',h),u
 assert 'https://talviuintipaikat.fi/' in h,u
assert (d/'talviuintipaikat_enriched.geojson').read_bytes()==(r/'talviuintipaikat_enriched.geojson').read_bytes()
assert len(json.loads((d/'talviuintipaikat_enriched.geojson').read_text())['features'])==481
assert not (d/'scripts').exists()
rules=(d/'_redirects').read_text()
for u in en: assert u+' /en'+u.removeprefix('https://winterswim.fi')+'index.html 200!' in rules
assert 'https://winterswim.fi/* /en/404.html 404!' in rules
assert 'https://www.winterswim.fi/* https://winterswim.fi/:splat 301!' in rules
print('PASS: 42 Finnish and 9 English sitemap URLs; English canonicals/navigation; 481 shared records unchanged; domain route rules; source scripts excluded.')
