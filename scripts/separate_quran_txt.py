import json

# Separates the Quran JSON file containing uthmani and imlaa'i text
# Make the imlaa'i text respect the word boundary of the uthmani text

qtxt = '../files/quran-search-original/quran.json'
with open(qtxt, 'r') as f:
    qtxt_j = json.load(f)

iml = []
uthm = []
for qayah in qtxt_j:
    iml.append(qayah[0])
    uthm.append(qayah[1])

uthm_fp = '../src/assets/qdb_uthmani.json'
with open(uthm_fp, 'w') as outf:
    json.dump(uthm, outf, ensure_ascii=False, indent=2)

# Process the imlaa'i text to match word boundaries of the uthmani
for i in range(0, len(iml)):
    a = iml[i]
    u = uthm[i]
    # Sajda
    if u.endswith('۩'):
        a += ' ۩'
    # Guz2
    if u.startswith('۞'):
        a = '۞ %s' % a

    a = a.replace('يا أسفى', 'ياأسفى')
    a = a.replace(' يا أهل', ' ياأهل')
    a = a.replace('يا أبانا', 'ياأبانا')
    a = a.replace('يا أخت', 'ياأخت')
    a = a.replace('يا أبت', 'ياأبت')
    a = a.replace('يا ليت', 'ياليت')
    a = a.replace('يا أيه', 'ياأيه')
    a = a.replace('يا أيتها', 'ياأيتها')
    a = a.replace('يا ليتني', 'ياليتني')
    a = a.replace('يا أولي', 'ياأولي')
    a = a.replace('يا أيها', 'ياأيها')
    a = a.replace('يا قوم', 'ياقوم')
    a = a.replace('يا معشر', 'يامعشر')
    a = a.replace('يا بني', 'يابني')
    a = a.replace('يا مالك', 'يامالك')
    a = a.replace(' يا رب', ' يارب')
    a = a.replace('يا عباد', 'ياعباد')
    a = a.replace('يا ويلنا', 'ياويلنا')
    a = a.replace('يا هامان', 'ياهامان')
    a = a.replace('يا حسرتا', 'ياحسرتا')
    a = a.replace('يا صالح', 'ياصالح')
    a = a.replace('يا إبليس', 'ياإبليس')
    a = a.replace('يا حسرة', 'ياحسرة')
    a = a.replace('يا جبال', 'ياجبال')
    a = a.replace('يا نساء', 'يانساء')
    a = a.replace('يا إبراهيم', 'ياإبراهيم')
    a = a.replace('يا موسى', 'ياموسى')
    a = a.replace('يا نوح', 'يانوح')
    a = a.replace('يا داوود', 'ياداوود')
    a = a.replace('يا نار', 'يانار')
    a = a.replace('يا ويلتى', 'ياويلتى')
    a = a.replace('يا آدم', 'ياآدم')
    a = a.replace('يا هارون', 'ياهارون')
    a = a.replace('يا شعيب', 'ياشعيب')
    a = a.replace('يا مريم', 'يامريم')
    a = a.replace('يا يحيى', 'يايحيى')
    a = a.replace('يا عيسى', 'ياعيسى')
    a = a.replace('يا ذا', 'ياذا')
    a = a.replace('يا سامري', 'ياسامري')
    a = a.replace('يا زكريا', 'يازكريا')
    a = a.replace('يا ابن أم', 'يابنأم')
    a = a.replace('يا ويلتنا', 'ياويلتنا')
    a = a.replace('يا صاحبي', 'ياصاحبي')
    a = a.replace('يا هود', 'ياهود')
    a = a.replace(' يا فرعون', ' يافرعون')
    a = a.replace('يا بشرى', 'يابشرى')
    a = a.replace('يا سماء', 'ياسماء')
    a = a.replace('يا ويلتا', 'ياويلتا')
    a = a.replace('يا حسرتنا', 'ياحسرتنا')
    a = a.replace('يا لوط', 'يالوط')
    a = a.replace('يا أرض', 'ياأرض')

    if a.startswith('يا أهل'):
        a = a.replace('يا أهل', 'ياأهل')

    a = a.replace('وأن لو', 'وألو')
    if a.startswith('ها أنتم'):
        a = a.replace('ها أنتم', 'هاأنتم')

    iml[i] = a

imla_fp = '../src/assets/qdb_imlaai.json'
with open(imla_fp, 'w') as outf:
    json.dump(iml, outf, ensure_ascii=False, indent=2)

if len(iml) != len(uthm):
    print('Mismatched number of Ayat')
    exit(1)

mismatch = 0
l = len(uthm)
for i in range(0, l):
    uth_a = uthm[i].strip()
    iml_a = iml[i].strip()
    uth_arr = uth_a.split(' ')
    iml_arr = iml_a.split(' ')
    if len(uth_arr) != len(iml_arr):
        mismatch += 1
        print('Mismatch in Aya words')
        print('  - %s' % uth_a)
        print('  - %s' % iml_a)

if mismatch > 0:
    print('*** Found %d mismatches' % mismatch)
    exit(1)
