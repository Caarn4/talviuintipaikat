from pathlib import Path
import re,json
r=Path(__file__).resolve().parents[1]
d=r/'dist'
fi=re.findall(r'<loc>(.*?)</loc>',(d/'sitemap.xml').read_text()); en=re.findall(r'<loc>(.*?)</loc>',(d/'en/sitemap.xml').read_text())
assert len(fi)==42,(len(fi),fi)
assert len(en)==12
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
print('PASS: 42 Finnish and 12 English sitemap URLs; English canonicals/navigation; 481 shared records unchanged; domain route rules; source scripts excluded.')

for slug in ['find','learn','experience']:
 h=(d/'en'/slug/'index.html').read_text()
 assert 'noindex' not in h and 'class="preview"' not in h and 'Version 2' not in h
 assert '/assets/analytics.js' in h
 for link in re.findall(r'(?:href|src)="([^"#]+)"',h):
  if link.startswith('/assets/'): assert (d/link.lstrip('/')).is_file(),link
  elif link.startswith('/'):
   assert (d/'en'/link.lstrip('/')/'index.html').is_file(),link
 assert len(re.findall('<h1',h))==1
 for anchor in re.findall(r'href="#([^" ]+)"',h): assert f'id="{anchor}"' in h,anchor
for slug in ['', 'regions']:
 h=(d/'en'/slug/'index.html').read_text()
 for target in ['find','learn','experience']: assert f'href="/{target}/"' in h
print('PASS: content routes, assets, anchors, navigation, consent script and draft-marker removal.')

for slug in ['find','learn','experience']:
 source=(r/'scripts/content-pages'/f'{slug}.html').read_text()
 built=(d/'en'/slug/'index.html').read_text()
 for url in re.findall(r'href="(https://[^" ]+)"',source): assert url in built,url
print('PASS: external article URLs preserved, including language paths.')
