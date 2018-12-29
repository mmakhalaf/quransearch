# Extract the text of the index book into a JSON file AS IS
#
# Output in the following format,
#
# json = [
#   {
#       "categories" : [ "cat1", "cat2", "..." ],
#       "ayat": [
#           {
#               "ayah": "",
#               "surah": "",
#               "ayah_num": 1,
#               "explanation": ""
#           }
#       ]
#   }
# ]
#

import json
import re
import sys


ayah_re = re.compile(r'^[\d]+\s*-\s*([^\[]+)\[([^\d]+)\s*(\d+)\]$')


def if_contains_text(cat):
    """
    Return whether the array of strings passed in is all empty, or itself is empty
    """
    if len(cat) == 0:
        return False
    for i in cat:
        if i.get('text') is not None and len(i['text']) > 0:
            return True
    return False


def trim_empty_lines(cat):
    """
    Remove any start / end empty entries
    """
    return list(filter(lambda l: l.get('text') is not None and len(l['text']) > 0, cat))


def process_ayah_line(line):
    """
    Process a line. If it's an Ayah, return it and the Surah and the Ayah number
    :param line:
    :return:
    """
    m = ayah_re.fullmatch(line)
    if m is None:
        return None, None, None
    ayah = m.group(1).strip(' ')
    surah = m.group(2).strip(' ')
    ayah_num = m.group(3)
    if len(ayah) == 0 or len(surah) == 0 or len(ayah_num) == 0:
        raise Exception('Returned invalid Ayah match in %s' % line)
    return ayah, surah, int(ayah_num)


in_file = '../files/quran-index/ar_Topics_Index_of_the_Quran.txt'
out_file = '../files/quran-index/ar_Topics_Index_of_the_Quran.json'

with open(in_file, 'r') as f:
    lines = f.readlines()

print('Num of lines in file: %d' % len(lines))

# Skip the title (first 13 lines)
start_lines = 13
lines = lines[13:]

print('Num of lines to process: %d' % len(lines))

# There are 5 lines in between every category
# Extract the start of each category
categories = []
cur_cat = []
num_empty_lines = 0
for line_num in range(0, len(lines)):
    real_line_num = line_num + start_lines + 1
    line = lines[line_num].strip(' ').strip('\n')
    if len(line) == 0:
        cur_cat.append({ 'text': line, 'line': real_line_num})
        num_empty_lines += 1
        continue
    if num_empty_lines == 5:
        if if_contains_text(cur_cat):
            categories.append(trim_empty_lines(cur_cat))
        cur_cat = []
    cur_cat.append({ 'text': line, 'line': real_line_num})
    num_empty_lines = 0

if if_contains_text(cur_cat):
    categories.append(trim_empty_lines(cur_cat))

print('Num of categories: %d' % len(categories))
# print(categories)

index_arr = []
# Go through each category and process them
for cat_entry in categories:
    # Go through storing the initial lines till we hit an Ayah
    # From there on, each Ayah is on a line, and on the following line there is an explanation
    # If that's not the case, this script will throw an exception.
    init_lines = []
    ayat = []
    for line_num in range(0, len(cat_entry)):
        line = cat_entry[line_num]['text']
        real_line_num = cat_entry[line_num]['line']
        ayah, surah, ayah_num = process_ayah_line(line)
        if ayah is None:
            # Not an Ayah, so could be the explanation or a subject
            if len(ayat) == 0:
                # No Ayat yet, so assume a subject
                init_lines.append(line)
            else:
                # Prior Ayat exist, so assume an explanation and add it to it
                last_ayah = ayat[len(ayat) - 1]
                if last_ayah.get('explanation') is None:
                    last_ayah['explanation'] = line
                else:
                    # If you hit this, there are mistakes in the CHM => TXT conversions.
                    # There were 3 or 4 in the version I was using that I fixed manually by putting the new Ayah
                    # on a separate line.
                    raise Exception('Explanation already set. Line Num: %d' % real_line_num)
        else:
            # Found an Ayah, so we add it to the array
            # Hacky: Fix some errors here
            if ayah == "فَلَمَّا جَاء آلَ لُوطٍ الْمُرْسَلُونَ":
                if ayah_num != 60:
                    raise Exception('A previous error was fixed. This can be removed now.')
                else:
                    ayah_num = 61

            ayat.append({ 'ayah': ayah, 'surah': surah, 'ayah_num': ayah_num })
    index_arr.append({ 'categories': init_lines, 'ayat': ayat })

with open(out_file, 'w') as f:
    json.dump(index_arr, f, ensure_ascii=False, indent=2)

# Validate the index
# We want to make sure that each Ayah is referenced in the same way
# So we key on the Surah:Ayah we have and compare their text
#
ayat = dict()
for idx in index_arr:
    for ayah in idx['ayat']:
        ayah_id = '%s:%s' % (ayah['surah'], ayah['ayah_num'])
        ayah_obj = ayat.get(ayah_id)
        ref_ayah = ayah['ayah']
        if ayah_obj is None:
            ayat[ayah_id] = ref_ayah
        else:
            if ayah_obj != ref_ayah:
                print('***\nMismatching Ayat with Id "%s":\n  "%s"\n and\n  "%s"' % (ayah_id, ayah_obj, ref_ayah), file=sys.stderr)

print('Number of unique Ayat: %d' % len(ayat))
