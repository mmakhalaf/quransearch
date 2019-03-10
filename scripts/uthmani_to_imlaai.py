"""
This normalizes the Quran's text to make it more searchable.
TODO:
- convert تاء to تاء مربوطة in رحمت and similar
- ىٰ[^ۤۖ-ۜ \n] (ىٰ in middle of word)
- spelling of some individual words
"""

import re
import json

remove_ranges = [
    [0x064B, 0x065F],
    [0x06D6, 0x06ED],
    [0x08E0, 0x08FF]
]
remove_exclude = [
    0x0654,
    0x0655,
    0x06DE,
    0x06E9
]


def word2unicode(w):
    if len(w) == 0:
        return ''
    if len(w) == 1:
        return ord(w[0])
    s = []
    for c in w:
        sw = f'{hex(ord(c))}'
        s.append(sw[2:])
    return ' '.join(s)


def remove_tashkil(w):
    # Remove tashkil and non-letter symbols
    ow = ''
    for l in w:
        uchar = ord(l)
        add = True
        for r in remove_ranges:
            if r[0] <= uchar <= r[1]:
                if uchar not in remove_exclude:
                    add = False
                    break
        if add:
            ow += l
    return ow


keep_special_cases = [
    # Small Alif
    ['رحمان', 'رحمن'],
    ['إلاه', 'إله'],
    ['لاكن', 'لكن'],
    ['ذالك', 'ذلك'],
    ['أولائك', 'أولئك'],
    ['هاذا', 'هذا'],
    ['هاذه', 'هذه'],
    ['هاؤلاء', 'هؤلاء'],
    # Frequent special cases
    ['أرءيتم', 'أرأيتم'],
    ['هزءو', 'هزئو'],
    ['سيآت', 'سيئات'],   # Caused by the substitution


    # Alif After Waaw

    ['أُولُوا', 'أُولُو'],
    ['يَدْعُوا', 'يَدْعُو'],
    ['نَّدْعُوا', 'نَّدْعُو'],
    ['نَدْعُوا', 'نَدْعُو'],
    ['أَدْعُوا', 'أَدْعُو'],
    ['يَتْلُوا', 'يَتْلُو'],
    ['تَتْلُوا', 'تَتْلُو'],
    ['نَتْلُوا', 'نَتْلُو'],
    ['أَتْلُوا', 'أَتْلُو'],
    ['يَرْجُوا', 'يَرْجُو'],
    ['نَرْجُوا', 'نَرْجُو'],
    ['تَرْجُوا', 'تَرْجُو'],
    ['وَيَعْفُوا', 'وَيَعْفُو'],
    ['مُّلَاقُوا', 'مُّلَاقُو'],
    ['مُرسِلُوا', 'مُرسِلُو'],
    ['كَاشِفُوا', 'كَاشِفُو'],
    ['صَالُوا', 'صَالُو'],
    ['لَذَائِقُوا', 'لَذَائِقُو'],
    ['لَتَارِكُوا', 'لَتَارِكُو'],
    ['نَاكِسُوا', 'نَاكِسُو'],
    ['يَرْبُوا', 'يَرْبُو'],
    ['مُهْلِكُوا', 'مُهْلِكُو'],
    ['يَمْحُوا', 'يَمْحُو'],
    ['أَشْكُوا', 'أَشْكُو'],
    ['بَنُوا', 'بَنُو'],
    ['تَبْلُوا', 'تَبْلُو'],
    ['بَاسِطُوا', 'بَاسِطُو'],
    ['مُرْسِلُوا', 'مُرْسِلُو']
    ]

repls = [
    # These two "small zeros" are used to indicate characters
    # that aren't pronounced.
    # TODO: some of the characters before them need to be removed (e.g. وَمَلَإِی۟هِ)
    # (1, r'[۟۠]', ''),

    (0, 'صۜ', 'س'),  # بَصۜۡطَةࣰۖ

    # Remove pause marks and similar
    # Don't remove sajda and hizb to keep the number of words the same as uthmani
    (1, r'[ۚۤۖ-ۣۭٜۜۢ۬\u2060 ]', ''),

    (1, 'َٔا(.+)', r'آ\1'),
    (1, 'ءَا(.+)', r'آ\1'),  # ءَانِیَة,وَءَامَنَهُم,ٱلۡـَٔاخِرَةُ

    # Hamza
    (1, '^ءَ', 'أَ'),  # ءَأَسْلَمْتُمْ, ءَأَقْرَرْتُمْ
    (1, 'ءُو$', 'ءُوا'),  # فَبَاءُو, فَاءُو
    (1, 'ٰؤُا۟$', 'اءُ'),  # ٱلضُّعَفَـٰۤؤُا۟, شُرَكَـٰۤؤُا۟ۚ, جَزَ ٰ⁠ۤؤُا۟
    (1, 'ٰؤࣱا۟$', 'اءٌ'),      # بَلَـٰۤؤࣱا۟
    (1, 'ؤُا۟$', 'أ'),  # نَبَؤُا۟, یَبۡدَؤُا۟
    (1, 'َءَا$', 'أَى'),  # رَءَا

    # Small Alif
    (1, 'َوٰا۟$', 'ا'),  # ٱلرِّبَوٰا۟
    (1, 'ىٰ$', 'ى'),

    #
    (1, '(و|ف)َسۡـَٔ', r'\1َاسۡـَٔ'),   # فَسۡـَٔلُوۤا۟

    (0, 'ٱلَّی', 'اللي'),  # وَٱلَّیۡلِ
    (0, 'ٱلَّـٰ', 'اللا'),  # وَٱلَّـٰتِی
    (0, 'ٱلَّذَ', 'اللذَ'),   # ٱلَّذَیۡنِ

    (0, 'ٱ', 'ا'),
    (0, 'ی', 'ي'),  # Farsi yaa

    (0, 'َا۟', ''),  # لَصَالُوا۟, قَوَارِیرَا۟, سَلَـٰسِلَا۟

    (0, 'وُۥ', 'وو'),   # داوود
    (0, 'ِـۧ', 'ِي'),       # إِبۡرَ ٰ⁠هِـۧمَ

    (0, 'إِۦ', 'إي'),   # إِۦلَـٰفِهِمۡ
    (0, 'ۡـِۧ', 'ي'),    # یُحۡـِۧیَ
    (0, 'حۡيِ', 'حۡييِ'),   # یُحۡیِ
    (0, 'ييِي', 'يِي'),     # Caused by above substitution

    (0, 'ـَٔـٰ', 'آ'),      # ٱلۡـَٔـٰنَ

    # (0, 'ِـِٔ', 'ئ'),  # متكئين
    # (0, 'ِّـَٔ', 'ئ'),  # ٱلسَّیِّـَٔاتِ
    # TODO: ٕٔ

    (0, 'ءِي', 'ئي'),  # إسرائيل
    (0, 'ءُۥ', 'ءو'),   # ٱلۡمَوۡءُۥدَةُ
    (0, 'وٕ', 'ؤ'),
    (0, 'ىٕ', 'ئ'),
    (0, 'ئ', 'يئ'),    # خَطِیۤـَٔـٰتِهِمۡ
    # (0, 'َء', 'أ'),

    (0, 'أَءِ', 'أَإِ'),    # أَءِنَّا, أَءِذَا
    (0, 'أَءُ', 'أَأُ'),    # أَءُلۡقِیَ
    (0, 'ـِٔ', 'ئ'),  # الأفئدة
    (0, 'ـَٔ', 'أ'),   # یُسۡـَٔلُونَ
    (0, 'ـٔ', 'ئ'),  # وَطۡـࣰٔا
    (0, 'َئۡ', 'أ'),    # یَسۡتَـٔۡخِرُونَ
    (0, 'َءَ', 'أ'),    # رَءَا
    (0, 'ُّء', 'ُّؤ'),      # ٱلرُّءۡیَا

    (0, 'ـ', ''),  # أَعۡطَیۡنَـٰكَ, ٱلنَّفَّـٰثَـٰتِ

    # Small alif

    # (1, 'َا$', 'َى'),
    (0, 'ىٰه', 'اه'),  # أشقاها, ألهاكم, بطغواها
    (0, 'ىٰك', 'اك'),  # أشقاها, ألهاكم, بطغواها
    (0, 'وٰ', 'ا'),
    (0, 'ىٰ', 'ا'),     # ٱلتَّوۡرَىٰةَ
    (0, 'ٰ', 'ا'),

    # Use more common sukoon and tanweens
    (0, 'و۟', 'و'),
    (0, 'ا۟', 'ا'),
    (0, 'ۡ', 'ْ'),
    (0, 'ࣰ', 'ً'),
    (0, 'ࣱ', 'ٌ'),
    (0, 'ࣲ', 'ٍ')
]

line_repls = {
    2442: [
        (0, 'یَبۡنَؤُمَّ', ''),  # TODO
    ],
    2571: [
        (0, 'ۨ', 'ن'),  # ننجي
    ]
}


def reverse_small_alef(word):
    # Revert small alef in some cases
    word_nodia = remove_tashkil(word)
    for rv in keep_special_cases:
        if rv[0] in word:
            return word.replace(rv[0], rv[1])
        if rv[0] in word_nodia:
            return word_nodia.replace(rv[0], rv[1])
    return word


def apply_repls_to_word(word, repls):
    # if word == 'سَوۡءَ ٰ⁠ تِكُمۡ':
    #     i = 0
    for r in repls:
        if r[0]:
            word = re.sub(r[1], r[2], word)
        else:
            word = word.replace(r[1], r[2])

    return reverse_small_alef(word)


def apply_repls_to_line(line, repls):
    words = map(lambda w: apply_repls_to_word(w, repls), line.split(' '))
    return ' '.join(words)


def apply_repls(lines, repls):
    return [apply_repls_to_line(l, repls) for l in lines]


with open('../src/assets/qdb_imlaai.json') as f:
    ref_lines = json.load(f)

with open('../src/assets/qdb_uthmani.json') as f:
    uth_lines = json.load(f)

lines = uth_lines.copy()
lines = apply_repls(lines, repls)
for line_no in line_repls:
    lines[line_no - 1] = apply_repls_to_line(lines[line_no - 1], line_repls[line_no])

print('++ Finished --')

# Perform some error validation on the imlaai reference
# We gather the list of words that mismatch
errs = {}
for i in range(len(lines)):
    pline = lines[i]
    uth_line = uth_lines[i]
    ref_line = ref_lines[i]

    pline_arr = pline.split(' ')
    uth_line_arr = uth_line.split(' ')
    ref_line_arr = ref_line.split(' ')
    if len(pline_arr) != len(ref_line_arr) or len(ref_line_arr) != len(pline_arr):
        print(f'Mismatched Length; Id={i}')
        print(f'Uthmani = {uth_line}')
        print(f'Process = {pline}')
        print(f'Imlaai  = {ref_line}')
        exit(1)

    for wi in range(len(pline_arr)):
        pline_word = pline_arr[wi]
        pline_word_nodia = remove_tashkil(pline_word)
        ref_word = ref_line_arr[wi]
        uth_word = uth_line_arr[wi]
        if ref_word != pline_word_nodia:
            err = errs.get(ref_word)
            occ = []
            if err is not None:
                occ = err
            occ.append({
                'U': uth_word,
                'U[uni]': word2unicode(uth_word),
                'R': pline_word,
                'R[uni]': word2unicode(pline_word),
                'RD': pline_word_nodia,
                'RD[uni]': word2unicode(pline_word_nodia),
                'id': f'{i}->{wi}'
            })
            errs[ref_word] = occ

if len(errs) > 0:
    total_errors = 0
    klist = errs.keys()
    klist = sorted(klist, key=lambda e: len(errs[e]))
    for k in klist:
        err = errs[k]
        print(f'Ref = {k}')
        for e in err:
            total_errors += 1
            for ek,ev in e.items():
                print(f'  "{ek}"\t=\t{ev}')
            print('-')
        print('---')

    for k in klist:
        print(f'{k} ({errs[k][0]["U"]}) <= ({errs[k][0]["R"]}) {errs[k][0]["RD"]} [{len(errs[k])}]')

    print(f'Errors: {len(errs)}')
    print(f'Total: {total_errors}')
    exit(1)

with open('../src/assets/qdb_imlaai_output.json', 'w') as f:
    json.dump(lines, f, ensure_ascii=False, indent=2)
