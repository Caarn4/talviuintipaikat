"""Check indexability and the homepage's static discovery path after build."""
from pathlib import Path
from html.parser import HTMLParser
import re
root=Path(__file__).resolve().parents[1]/'dist'
class Head(HTMLParser):
 def __init__(self):
  super().__init__(); self.titles=0; self.descriptions=[]; self.canonicals=[]; self.h1=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='title':self.titles+=1
  if tag=='h1':self.h1+=1
  if tag=='meta' and a.get('name')=='description':self.descriptions.append(a.get('content',''))
  if tag=='link' and a.get('rel')=='canonical':self.canonicals.append(a.get('href'))
count=0
for host,base in [('https://talviuintipaikat.fi',root),('https://winterswim.fi',root/'en')]:
 for url in re.findall(r'<loc>(.*?)</loc>',(base/'sitemap.xml').read_text()):
  suffix=url.removeprefix(host).lstrip('/'); path=base/suffix
  if not suffix.endswith('.html'):path=path/'index.html'
  html=path.read_text(); h=Head();h.feed(html)
  assert h.titles==1,(url,'title count')
  assert len(h.descriptions)==1 and h.descriptions[0],(url,'description')
  assert h.canonicals==[url],(url,'canonical')
  assert h.h1==1,(url,'H1')
  assert not re.search(r'<meta[^>]+content="[^"]*noindex',html),(url,'noindex')
  count+=1
 for_home=(base/'index.html').read_text()
 assert for_home.count('class="map-introduction"')==1
 assert 'class="map-region-link"' in for_home
 assert 'class="map-preview-link" href="#kartta"' in for_home
 if base==root/'en':
  assert 'Find your winter swimming spot' in for_home
  assert 'Esikatselu Suomen avantokartasta' not in for_home
print(f'PASS: {count} indexable sitemap pages with single title, description, canonical and H1; static FI/EN discovery links present.')
