import json

# Separates the Quran JSON file containing uthmani and imlaa'i text
# Make the imlaa'i text respect the word boundary of the uthmani text

qtxt = '../files/quran.json'
with open(qtxt, 'r') as f:
    qtxt_j = json.load(f)

iml = []
uthm = []
for qayah in qtxt_j:
    iml.append(qayah[0])
    uthm.append(qayah[1])

imla_fp = '../src/assets/qdb_imlaai.json'
with open(imla_fp, 'w') as outf:
    json.dump(iml, outf, ensure_ascii=False, indent=2)

uthm_fp = '../src/assets/qdb_uthmani.json'
with open(uthm_fp, 'w') as outf:
    json.dump(uthm, outf, ensure_ascii=False, indent=2)
