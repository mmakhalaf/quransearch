
# Now that we have the index file as JSON, we need to convert it to something that's easy for us to process on the
# client-side
#
# We want to output,
# A list of all categories by Id (The Id can be the index in the array)
# Then a list which contains each Ayah, and the categories it belongs to
#
# Notes,
# - We don't need the Ayah text or Surah
# - We can identify the Ayah by the surah number (converted from the name) and the Ayah number (which we already have)
#


import json


class CatEncoderJson(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


class Category:
    g_cat_index = 0

    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.categories = []

    def add_children(self, children):
        if len(children) == 0:
            return
        c = self.find(children[0], recursive=False)
        if c is None:
            c = Category(Category.g_cat_index, children[0])
            self.categories.append(c)
            Category.g_cat_index += 1
        if len(children) > 1:
            c.add_children(children[1:])

    def find(self, name, recursive=False):
        """
        Recursively find this or the category which has the given name
        """
        for c in self.categories:
            f = c.name == name
            if f:
                return c
            if recursive:
                ff = c.find(name, recursive)
                if ff is not None:
                    return ff
        return None

    def get(self, children):
        """
        Recursively get the category by children
        """
        if len(children) == 0:
            return None
        for c in self.categories:
            if c.name == children[0]:
                if len(children) == 1:
                    return c
                else:
                    f = c.get(children[1:])
                    if f is not None:
                        return f
        return None

    def length(self, recursive=False):
        l = len(self.categories)
        if recursive:
            for c in self.categories:
                l += c.length(recursive)
        return l


suwar = [
   [7, "الفاتحة"], [286, "البقرة"], [200, "أل عمران"], [176, "النساء"],
   [120, "المائدة"], [165, "الانعام"], [206, "الأعراف"], [75, "الأنفال"],
   [129, "التوبة"], [109, "يونس"], [123, "هود"], [111, "يوسف"], [43, "الرعد"],
   [52, "ابراهيم"], [99, "الحجر"], [128, "النحل"], [111, "الإسراء"],
   [110, "الكهف"], [98, "مريم"], [135, "طه"], [112, "الأنبياء"], [78, "الحج"],
   [118, "المؤمنون"], [64, "النور"], [77, "الفرقان"], [227, "الشعراء"], [93, "النمل"],
   [88, "القصص"], [69, "العنكبوت"], [60, "الروم"], [34, "لقمان"], [30, "السجدة"],
   [73, "الأحزاب"], [54, "سبأ"], [45, "فاطر"], [83, "يس"], [182, "الصافات"], [88, "ص"],
   [75, "الزمر"], [85, "غافر"], [54, "فصلت"], [53, "الشورى"], [89, "الزخرف"],
   [59, "الدخان"], [37, "الجاثية"], [35, "الأحقاف"], [38, "محمد"], [29, "الفتح"],
   [18, "الحجرات"], [45, "ق"], [60, "الذاريات"], [49, "الطور"], [62, "النجم"],
   [55, "القمر"], [78, "الرحمن"], [96, "الواقعة"], [29, "الحديد"],
   [22, "المجادلة"], [24, "الحشر"], [13, "الممتحنة"], [14, "الصف"],
   [11, "الجمعة"], [11, "المنافقون"], [18, "التغابن"], [12, "الطلاق"],
   [12, "التحريم"], [30, "الملك"], [52, "القلم"], [52, "الحاقة"], [44, "المعارج"],
   [28, "نوح"], [28, "الجن"], [20, "المزمل"], [56, "المدثر"], [40, "القيامة"],
   [31, "الإنسان"], [50, "المرسلات"], [40, "النبأ"], [46, "النازعات"], [42, "عبس"],
   [29, "التكوير"], [19, "الإنفطار"], [36, "المطففين"], [25, "الإنشقاق"],
   [22, "البروج"], [17, "الطارق"], [19, "الأعلى"], [26, "الغاشية"], [30, "الفجر"],
   [20, "البلد"], [15, "الشمس"], [21, "الليل"], [11, "الضحى"], [8, "الشرح"],
   [8, "التين"], [19, "العلق"], [5, "القدر"], [8, "البينة"], [8, "الزلزلة"],
   [11, "العاديات"], [11, "القارعة"], [8, "التكاثر"], [3, "العصر"], [9, "الهمزة"],
   [5, "الفيل"], [4, "قريش"], [7, "الماعون"], [3, "الكوثر"], [6, "الكافرون"],
   [3, "النصر"], [5, "المسد"], [4, "الإخلاص"], [5, "الفلق"], [6, "الناس"]
]


def get_surah_index(surah):
    """
    Get the index of the surah + 1 from the name
    """
    for i in range(0, len(suwar)):
        s = suwar[i]
        if s[1] == surah:
            return i + 1
    raise Exception('Surah "%s" not found' % surah)


def map_categories_to_indices(cats_str, cats):
    """
    Given the category names, and all the categories, return the list as indices into the array of categories
    """
    if len(cats_str) == 0:
        raise Exception('Passed an empty category list')
    cats_idx = set()
    for cat_str in cats_str:
        c = cats.find(cat_str, recursive=True)
        if c is None:
            raise Exception('Category "%s" not found' % cat_str)
        cats_idx.add(c.id)
    arr = [c for c in cats_idx]
    arr.sort()
    return arr


def merge_arrays(arr1, arr2):
    """
    Merge the 2 arrays and return a sorted union array
    """
    s = set(arr1).union(set(arr2))
    arr = [c for c in iter(s)]
    arr.sort()
    return arr


in_file = '../files/quran-index/ar_Topics_Index_of_the_Quran.json'
out_file = '../src/assets/qdb_index.json'

# See 'extract_root.py' for the JSON format
with open(in_file, 'r') as f:
    index_j = json.load(f)

# First run to get all the unique categories in a nested manner
cats = Category(-1, '')
for cat_obj in index_j:
    cats.add_children(cat_obj['categories'])

print('Number of unique categories: %d' % cats.length(True))

ayah_dict = dict()
for cat_obj in index_j:
    ayah_obj = dict()
    # cats_indices = map_categories_to_indices(cat_obj['categories'], cats)
    cat_strs = cat_obj['categories']
    cat = cats.get(cat_strs)
    if cat is None or cat.name != cat_strs[len(cat_strs)-1]:
        raise Exception('Could not find category at %s' % cat_obj['categories'])
    for ayah in cat_obj['ayat']:
        surah_idx = get_surah_index(ayah['surah'])
        ayah_num = ayah['ayah_num']
        ayah_id = '%d:%d' % (surah_idx, ayah_num)
        found_obj = ayah_dict.get(ayah_id)
        if found_obj is None:
            ayah_dict[ayah_id] = {'s': surah_idx, 'a': ayah_num, 'c': [cat.id]}
        else:
            found_obj['c'] = merge_arrays(found_obj['c'], [cat.id])

print('Number of categorised Ayat: %d' % len(ayah_dict))

output_dict = dict()
output_dict['categories'] = cats.categories
ayah_list = []
for k, ayah_obj in ayah_dict.items():
    ayah_list.append(ayah_obj)
output_dict['ayat'] = ayah_list

with open(out_file, 'w') as f:
    json.dump(output_dict, f, cls=CatEncoderJson, ensure_ascii=False)
