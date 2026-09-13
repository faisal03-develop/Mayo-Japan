import urllib.request, re
url = 'https://www.youtube.com/results?search_query=himalayan+salt+lamp+stock+footage'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
video_ids = re.findall(r'"videoId":"([^"]+)"', html)
# filter out standard UI ids
valid_ids = [vid for vid in video_ids if len(vid) == 11]
print('Found IDs:', valid_ids[:5])
