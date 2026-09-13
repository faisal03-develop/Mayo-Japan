import urllib.request, re
req = urllib.request.Request('https://coverr.co/s?q=himalayan+salt', headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    mp4s = re.findall(r'https://[^"]+\.mp4', html)
    print("Found MP4s:", list(set(mp4s))[:5])
except Exception as e:
    print(e)
