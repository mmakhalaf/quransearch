
# N PN ADJ IMPN PRON DEM REL T LOC



import re
import json

tags = {
    "pos_groups": [
        {"ar": "الأسماء", "en": "Nouns", "ch": [0, 1]},
        {"ar": "الاسماء المشتقة", "en": "Derived Nominals", "ch": [2, 3]},
        {"ar": "الضمائر", "en": "Pronouns", "ch": [4, 5, 6]},
        {"ar": "ظرف حال", "en": "Adverbs", "ch": [7, 8]},
        {"ar": "الأفعال", "en": "Verbs", "ch": [9]},
        {"ar": "الحروف", "en": "Particles", "ch": [x for x in range(10, 43)]},
        {"ar": "الحروف المقطعة", "en": "Disconnected Letters", "ch": [43]}
    ],
    "pos": [
        {"s": "N", "ar": "اسم", "en": "Noun"},
        {"s": "PN", "ar": "اسم علم", "en": "Proper noun"},
        {"s": "ADJ", "ar": "صفة", "en": "Adjective"},
        {"s": "IMPN", "ar": "اسم فعل أمر", "en": "Imperative verbal noun"},
        {"s": "PRON", "ar": "ضمير", "en": "Personal pronoun"},
        {"s": "DEM", "ar": "اسم اشارة", "en": "Demonstrative pronoun"},
        {"s": "REL", "ar": "اسم موصول", "en": "Relative pronoun"},
        {"s": "T", "ar": "ظرف زمان", "en": "Time adverb"},
        {"s": "LOC", "ar": "ظرف مكان", "en": "Location adverb"},

        {"s": "V", "ar": "فعل", "en": "Verb"},

        {"s": "P", "ar": "حرف جر", "en": "Preposition"},

        {"s": "EMPH", "ar": "لام التوكيد", "en": "Emphatic 'lam'"},
        {"s": "IMPV", "ar": "لام الامر", "en": "Imperative 'lam'"},
        {"s": "PRP", "ar": "لام التعليل", "en": "Purpose 'lam'"},

        {"s": "CONJ", "ar": "حرف عطف", "en": "Coordinating conjunction"},
        {"s": "SUB", "ar": "حرف مصدري", "en": "Subordinating conjunction"},

        {"s": "ACC", "ar": "حرف نصب", "en": "Accusative particle"},
        {"s": "AMD", "ar": "حرف استدراك", "en": "Amendment particle"},
        {"s": "ANS", "ar": "حرف جواب", "en": "Answer particle"},
        {"s": "AVR", "ar": "حرف ردع", "en": "Aversion particle"},
        {"s": "CAUS", "ar": "حرف سببية", "en": "Particle of cause"},
        {"s": "CERT", "ar": "حرف تحقيق", "en": "Particle of certainty"},
        {"s": "CIRC", "ar": "حرف حال", "en": "Circumstantial particle"},
        {"s": "COM", "ar": "واو المعية", "en": "Comitative particle"},
        {"s": "COND", "ar": "حرف شرط", "en": "Conditional particle"},
        {"s": "EQ", "ar": "حرف تسوية", "en": "Equalization particle"},
        {"s": "EXH", "ar": "حرف تحضيض", "en": "Exhortation particle"},
        {"s": "EXL", "ar": "حرف تفصيل", "en": "Explanation particle"},
        {"s": "EXP", "ar": "أداة استثناء", "en": "Exceptive particle"},
        {"s": "FUT", "ar": "حرف استقبال", "en": "Future particle"},
        {"s": "INC", "ar": "حرف ابتداء", "en": "Inceptive particle"},
        {"s": "INT", "ar": "حرف تفسير", "en": "Particle of interpretation"},
        {"s": "INTG", "ar": "حرف استفهام", "en": "Interogative particle"},
        {"s": "NEG", "ar": "حرف نفي", "en": "Negative particle"},
        {"s": "PREV", "ar": "حرف كاف", "en": "Preventive particle"},
        {"s": "PRO", "ar": "حرف نهي", "en": "Prohibition particle"},
        {"s": "REM", "ar": "حرف استئنافية", "en": "Resumption particle"},
        {"s": "RES", "ar": "أداة حصر", "en": "Restriction particle"},
        {"s": "RET", "ar": "حرف اضراب", "en": "Retraction particle"},
        {"s": "RSLT", "ar": "حرف واقع في جواب الشرط", "en": "Result particle"},
        {"s": "SUP", "ar": "حرف زائد", "en": "Supplemental particle"},
        {"s": "SUR", "ar": "حرف فجاءة", "en": "Surprise particle"},
        {"s": "VOC", "ar": "حرف نداء", "en": "Vocative particle"},
        {"s": "INL", "ar": "حروف مقطعة", "en": "Quranic initials" }
    ],
    "vf": [
        {"f": 1, "n": "فَعَلَ"},
        {"f": 2, "n": "فَعَّلَ"},
        {"f": 3, "n": "فَاعَلَ"},
        {"f": 4, "n": "أَفْعَلَ"},
        {"f": 5, "n": "تَفَعَّلَ"},
        {"f": 6, "n": "تَفَاعَلَ"},
        {"f": 7, "n": "إِنْفَعَلَ"},
        {"f": 8, "n": "إِفْتَعَلَ"},
        {"f": 9, "n": "إِفْعَلَّ"},
        {"f": 10, "n": "إِسْتَفْعَلَ"}
    ]
}


def get_pos_index(s):
    i = 0
    for t in tags["pos"]:
        if t["s"] == s:
            return i
        i = i + 1
    return -1


def get_vf_index(vf):
    i = 0
    for vfo in tags["vf"]:
        if vfo["f"] == vf:
            return i
        i = i + 1
    return -1


class Word:
    def __init__(self, id):
        self.id = id
        self.r = ''
        self.vf = 0
        self.tags = set()

    def merge(self, w):
        if len(w.r) > 0 and len(self.r) > 0:
            print('Word "%s" has 2 roots' % self.id)
            # raise Exception('Word has 2 roots?')
        if w.vf != 0 and self.vf != 0:
            raise Exception('Word has 2 verb forms?')

        if len(w.r) > 0:
            self.r = w.r
        if w.vf != 0:
            self.vf = w.vf
        self.tags = self.tags.union(w.tags)


def serial_word(w):
    d = {}
    if len(w.r) > 0:
        d["r"] = w.r
    if w.vf > 0:
        d["vf"] = w.vf
    if len(w.tags) > 0:
        d["t"] = [x for x in w.tags]
    return d


a_re = re.compile(r'(\d+)\:(\d+)\:(\d+)\:\d+')


def process_line(line):
    line = line.strip(' \n')
    line_parts = line.split('\t')
    if len(line_parts) != 4:
        raise Exception('Line "%s" does not have 4 parts' % line)

    m = a_re.fullmatch(line_parts[0])
    if m is None:
        raise Exception('Line Ayah "%s" does not match RE' % line)

    s = int(m.group(1))
    a = int(m.group(2))
    w = int(m.group(3))

    seg_parts = line_parts[3].split('|')
    seg_parts.append(line_parts[2])

    cur_w_id = '%d:%d:%d' % (s, a, w)
    w = Word(cur_w_id)
    for seg in seg_parts:
        if seg.startswith('ROOT:'):
            if len(w.r) > 0:
                raise Exception('Root occurred twice?')
            w.r = seg[5:]
        elif seg.startswith('VF:'):
            if w.vf != 0:
                raise Exception('VF occurred twice?')
            i = get_vf_index(int(seg[3:]))
            if i == -1:
                print('VF not in list %s' % cur_w_id)
            else:
                w.vf = i
        elif seg.find(':') == -1 and not re.search(r'\d', seg):
            tagi = get_pos_index(seg)
            if tagi != -1:
                w.tags.add(tagi)
            else:
                # print('Can not find pos %s' % seg)
                pass
    return w


with open('../files/quran-morphology.txt', 'r') as f:
    lines = f.readlines()

roots = {}
roots["tags"] = tags
roots["w"] = {}
arr = roots["w"]
for l in lines:
    w = process_line(l)
    cur_w = arr.get(w.id)
    if cur_w is None:
        arr[w.id] = w
    else:
        cur_w.merge(w)

with open('../src/assets/qdb_morph.json', 'w') as outf:
    json.dump(roots, outf, ensure_ascii=False, default=serial_word)
