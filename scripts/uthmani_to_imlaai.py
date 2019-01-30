
import json
import sys

def allowAlefWaslStart(w):
    return len(w) > 0

def allowAlefWasl(w):
    return not w.endswith('رحم')

def allowAlefWasl2(w):
    return w != 'ذ'

conversion_map = {
    1600: { 'r': 'ا', 'fn': allowAlefWasl},
    # 1648: { 'r': 'ا', 'fn': allowAlefWaslStart},
    1649: { 'r': 'ا'},
    1740: { 'r': 'ي'},
    8202: { 'r': 'ا', 'fn': allowAlefWasl2}
    # # 8288: { 'r': 'ا' }
}


def get_word(w):
    o = '['
    for c in w:
        o += f' {ord(c)}'
    o += f'] = {w}'
    return o


def convert_uthmani(i, uth, iml):
    """Convert the uthmani 'u' to imlaai"""
    uth_arr = u.split(' ')
    targ_arr = []

    # Remove diacritics
    for uth_word in uth_arr:
        targ_word = ''
        for uth_letter in uth_word:
            uchar = ord(uth_letter)
            # If character is a letter, add it
            if (uchar >= 1569 and uchar <= 1594) or (uchar >= 1601 and uchar <= 1610):
                targ_word += uth_letter
            else:
                # Otherwise, check our conversion table.
                # If it's a letter to be replaced, replace it. Otherwise, it's probably tashkil so it's not added.
                cc = conversion_map.get(uchar)
                if cc is not None:
                    if cc.get('fn') is None or cc.get('fn')(targ_word):
                        targ_word += cc["r"]
        targ_arr.append(targ_word)
    
    targ = ' '.join(targ_arr)

    # Compare to incoming imlaai and exit on error
    if targ != iml:
        print(uth)
        iml_arr = iml.split(' ')
        for i in range(0, len(iml_arr)):
            if iml_arr[i] != targ_arr[i]:
                print(f"Uthmani: {get_word(uth_arr[i])}")
                print(f"Imlaai : {get_word(iml_arr[i])}")
                print(f"Result : {get_word(targ_arr[i])}")
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

targ = []
for idx in range(0, len(uth_j)):
    u = uth_j[idx]
    i = iml_j[idx]
    t = convert_uthmani(idx, u, i)
    targ.append(t)

iml_out = '../src/assets/qdb_imlaai_output.json'
with open(iml_out, 'w') as f:
    json.dump(targ, f)
