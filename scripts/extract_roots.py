
import re
import json

morph = '../files/quran-morphology.txt'
with open(morph, 'r') as f:
    lines = f.readlines()

cur_a = ''
last_a_id = '1:1'
ayat = []
for l in lines:
    m = re.match(r'(\d+)\:(\d+)\:(\d+)\:\d+', l)
    if m is None:
        raise Exception('Line "%s" not match the RE' % l)
    s = m.group(1)
    a = m.group(2)
    w = m.group(3)
    root = None
    m = re.match(r'(\d+)\:(\d+)\:(\d+)\:\d+.*ROOT:([^|]+)', l)
    if m is not None:
        root = m.group(4)
    cur_a_id = '%s:%s' % (s, a)
    if cur_a_id == last_a_id:
        if root is not None:
            cur_a += root + ' '
    else:
        ayat.append(cur_a.strip())
        if root is not None:
            cur_a = root + ' '
        last_a_id = cur_a_id
if len(cur_a) > 0:
    ayat.append(cur_a.strip())

morph_fp = '../src/assets/qdb_morph.json'
with open(morph_fp, 'w') as outf:
    json.dump(ayat, outf, ensure_ascii=False, indent=2)
