# Compare 2 versions of the Quran to ensure the number of boundaries are the same

import json

uth = '../src/assets/qdb_uthmani.json'
oth = '../src/assets/qdb_imlaai.json'

with open(uth, 'r') as f:
    uth_j = json.load(f)
with open(oth, 'r') as f:
    oth_j = json.load(f)

if len(uth_j) != len(oth_j):
    print('Mismatched number of Ayat')
    exit(1)

l = len(uth_j)
for i in range(0, l):
    uth_a = uth_j[i].split(' ')
    oth_a = oth_j[i].split(' ')
    if len(uth_a) != len(oth_a):
        print('Mismatch in Aya words')
        print('  - %s' % uth_j[i])
        print('  - %s' % oth_j[i])
