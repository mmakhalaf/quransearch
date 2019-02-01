
import json
import sys


def remove_wasl(w):
    """Remove alef wasl without replace in Ra7man"""
    if w.startswith('ذ'):
        return True
    if 'رحم' in w:
        return True
    if 'كن' in w:
        return True
    if 'ذا' in w:
        return True
    if 'ذه' in w:
        return True
    return False


def replace_wasl_with_alef(w):
    return True


def keep_hamza(w):
    return w.endswith('ء')


def replace_hamza(w):
    return w.startswith('ء')


def keep_alef_maksura(w):
    return ord(w[len(w)-1]) ==  0x670


def replace_alef_maksura_with_alef(w):
    return True



cmap_readable = {
    '0x648 0x6df 0x644 0x64e 0x640 0x670 0x6e4 0x649 0x655 0x650 0x643': [{ 'r': '0x648 0x644 0x626 0x643' }],
    '0x645 0x64e 0x644 0x64e 0x640 0x670 0x6e4 0x649 0x655 0x650 0x643': [{ 'r': '0x645 0x644 0x627 0x626 0x643' }],
    '0x64e 0x200a 0x670 0x2060 0x6e4 0x621 0x650': [{ 'r': '0x627 0x626' }],
    '0x6cc 0x64e 0x640 0x670 0x6e4': [{ 'r': '0x64a 0x627' }],
    #
    '0x640 0x654 0x64e 0x627': [{ 'r': '0x622' }],
    '0x64e 0x640 0x670 0x6e4': [{ 'r': ''}],
    #
    '0x6e1 0x6cc 0x650 0x6e6': [{ 'r': '0x64a 0x64a' }],
    '0x200a 0x670 0x2060': [
        { 'r': '',      'fn': remove_wasl },
        { 'r': '0x627', 'fn': replace_wasl_with_alef }
    ],
    '0x621 0x64e 0x627': [{ 'r': '0x622' }],
    '0x640 0x654 0x64f': [{ 'r': '0x626' }],
    '0x649 0x655 0x650': [{ 'r': '0x626' }],
    #
    '0x640 0x670': [
        { 'r': '',      'fn': remove_wasl },
        { 'r': '0x627', 'fn': replace_wasl_with_alef }
        ],
    '0x648 0x670': [{ 'r': '0x627' }],
    '0x649 0x670': [
        { 'r': '0x649', 'fn': keep_alef_maksura },
        { 'r': '0x627', 'fn': replace_alef_maksura_with_alef }
    ],     # ى
    # '0x649 0x655': [{ 'r': '0x626' }],     # ى
    '0x650 0x621': [{ 'r': '0x626' }],
    #
    '0x621': [
        { 'r': '0x621', 'fn': keep_hamza },
        { 'r': '0x623', 'fn': replace_hamza }
        ],            # ء
    '0x671': [{ 'r': '0x627' }],           # ٱ
    '0x6cc': [{ 'r': '0x64a' }],           # ی farsi
}

conversion_map = {}
for k,v in cmap_readable.items():
    ks_arr = k.split(' ')
    ks = ''
    for ks_item in ks_arr:
        ks += chr(int(ks_item,0))

    for vi in v:
        vs_arr = vi['r'].split(' ')
        vs = ''
        for vs_item in vs_arr:
            if vs_item == '':
                continue
            vs += chr(int(vs_item,0))
        vi['r'] = vs
    conversion_map[ks] = v

def serial_cmap(o):
    return o.__name__

print(json.dumps(conversion_map, ensure_ascii=False, default=serial_cmap))


def get_word(w):
    if len(w) == 0:
        return ''
    if len(w) == 1:
        return ord(w[0])
    s = []
    for c in w:
        s.append(f'{hex(ord(c))}')
    return ' '.join(s)


def remove_tashkil(w):
    # Remove tashkil and non-letter symbols
    ow = ''
    for l in w:
        uchar = ord(l)
        if uchar == 0x06DE or uchar == 0x06E9:
            ow += l
            continue
        if 0x064B <= uchar <= 0x065F or 0x06D6 <= uchar <= 0x06ED or 0x08E0 <= uchar <= 0x08FF:
            continue
        ow += l
    return ow


def convert_uthmani(i, uth, iml):
    """Convert the uthmani 'u' to imlaai"""
    uth_arr = uth.split(' ')
    targ_arr = []

    # Remove diacritics
    for uth_word in uth_arr:
        targ_word = uth_word
        uth_no_tashkil = remove_tashkil(uth_word)
        for k,v in conversion_map.items():
            idx = targ_word.find(k)
            if idx == -1:
                continue
            for vi in v:
                fn = vi.get('fn')
                if fn is None:
                    targ_word = targ_word.replace(k, vi['r'])
                    break
                else:
                    if fn(uth_no_tashkil):
                        targ_word = targ_word.replace(k, vi['r'])
                        break

        targ_word = remove_tashkil(targ_word)
        targ_arr.append(targ_word)
    
    targ = ' '.join(targ_arr)

    # Compare to incoming imlaai and exit on error
    if targ != iml:
        print(f'= Imlaai Mismatch => {i} -> {uth}')
        iml_arr = iml.split(' ')
        for i in range(0, len(iml_arr)):
            if iml_arr[i] != targ_arr[i]:
                print(f"Uthmani: [ {get_word(uth_arr[i])} ] = {uth_arr[i]}")
                print(f"Imlaai : [ {get_word(iml_arr[i])} ] = {iml_arr[i]}")
                print(f"Result : [ {get_word(targ_arr[i])} ] = {targ_arr[i]}")
                print('')
        exit(1)

    # Compare number of words
    if len(uth_arr) != len(targ_arr):
        print('= Length Mismatch')
        print(uth_arr)
        print(targ_arr)
        print('')
        exit(1)

    return targ


uth = '../src/assets/qdb_uthmani.json'
iml = '../src/assets/qdb_imlaai.json'

with open(uth, 'r') as f:
    uth_j = json.load(f)
with open(iml, 'r') as f:
    iml_j = json.load(f)

if len(uth_j) != len(iml_j):
    print('Mismatched number of Ayat')
    exit(1)

n_errors = 0
targ = []
for idx in range(0, len(uth_j)):
    u = uth_j[idx]
    i = iml_j[idx]
    t = convert_uthmani(idx, u, i)
    targ.append(t)

if n_errors > 0:
    print(f'Errors: {n_errors}')
    exit(1)
iml_out = '../src/assets/qdb_imlaai_output.json'
with open(iml_out, 'w') as f:
    json.dump(targ, f, ensure_ascii=False, indent=2)
