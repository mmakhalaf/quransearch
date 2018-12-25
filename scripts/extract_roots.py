
import re
import json

with open('../files/quran-morphology.txt', 'r') as f:
    lines = f.readlines()

roots = {}
for l in lines:
    m = re.match(r'(\d+)\:(\d+)\:(\d+)\:\d+', l)
    if m is None:
        raise Exception('Line "%s" not match the RE' % l)
    s = int(m.group(1)) - 1
    a = int(m.group(2)) - 1
    w = int(m.group(3)) - 1
    root = '_'
    m = re.match(r'(\d+)\:(\d+)\:(\d+)\:\d+.*ROOT:([^|]+)', l)
    if m is not None:
        root = m.group(4)

    cur_w_id = '%d:%d:%d' % (s, a, w)
    cur_root = roots.get(cur_w_id)
    if cur_root is None or cur_root == '_':
        roots[cur_w_id] = root

with open('../src/assets/qdb_morph.json', 'w') as outf:
    json.dump(roots, outf, ensure_ascii=False, indent=2)
