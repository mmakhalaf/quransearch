// Data
const suwar = [
    [7, "الفاتحة"], [286, "البقرة"], [200, "آل عمران"], [176, "النساء"],
    [120, "المائدة"], [165, "الأنعام"], [206, "الأعراف"], [75, "الأنفال"],
    [129, "التوبة"], [109, "يونس"], [123, "هود"], [111, "يوسف"], [43, "الرعد"],
    [52, "إبراهيم"], [99, "الحجر"], [128, "النحل"], [111, "الإسراء"],
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
    [29, "التكوير"], [19, "الانفطار"], [36, "المطففين"], [25, "الانشقاق"],
    [22, "البروج"], [17, "الطارق"], [19, "الأعلى"], [26, "الغاشية"], [30, "الفجر"],
    [20, "البلد"], [15, "الشمس"], [21, "الليل"], [11, "الضحى"], [8, "الشرح"],
    [8, "التين"], [19, "العلق"], [5, "القدر"], [8, "البينة"], [8, "الزلزلة"],
    [11, "العاديات"], [11, "القارعة"], [8, "التكاثر"], [3, "العصر"], [9, "الهمزة"],
    [5, "الفيل"], [4, "قريش"], [7, "الماعون"], [3, "الكوثر"], [6, "الكافرون"],
    [3, "النصر"], [5, "المسد"], [4, "الإخلاص"], [5, "الفلق"], [6, "الناس"]
];
let quran;
fetch('quran.json', {cache: 'force-cache'}).then(r => r.json()).then(json => {
    quran = json;
});

// Util
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
NodeList.prototype.__proto__ = Array.prototype;
Node.prototype.on = Node.prototype.addEventListener;
NodeList.prototype.on = function() { this.forEach(n => n.on(...arguments)); };
const debounce = (() => {
    let timer = 0;
    return (cb, ms) => {
        clearTimeout(timer);
        timer = setTimeout(cb, ms);
    };
})();
function create_el(html) {
    const d = document.createDocumentFragment();
    const div = d.appendChild(document.createElement('div'));
    div.innerHTML = html;
    return div.firstElementChild;
}
function copy(text) {
    let range = document.createRange();
    getSelection().removeAllRanges();
    $('#copy-text').innerHTML = text;
    range.selectNode($('#copy-text'));
    getSelection().addRange(range);
    document.execCommand('copy');
    getSelection().removeAllRanges();
}
function get_surah_ayah(ayah_id) {
    for (var i = 0; ayah_id > suwar[i][0]; ayah_id -= suwar[i++][0]);
    return {s: i + 1, a: ayah_id};
}
const ar_nums = s => ('' + s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'.substr(+d, 1));

// Consts
const multi_match_map = {ا: 'اأآإى', أ: 'أءؤئ', ء: 'ءأؤئ', ت: 'تة', ة: 'ةته', ه: 'هة', ى: 'ىي'};
const more_btn = create_el('<button class="btn" id="quran-more-results">للمزيد …</button>');
const ayah_tpl = r => `<li data-aid="${r[2]}">
  <div class="ayah-ref" title="${ar_nums(r[0].s)}">[${suwar[r[0].s - 1][1]} ${ar_nums(r[0].a)}]</div>
  <span>${r[1]}</span>
</li>`;

let quran_i = 0;
function q_search(q) {
    const prep_re = new RegExp(`[${Object.keys(multi_match_map).join('')}]`, 'g');
    const re = new RegExp(`(${q.replace(prep_re, m => `[${multi_match_map[m]}]`)})`);

    let count = 0;
    const matches = [];
    for (const l of quran.slice(quran_i)) {
        quran_i++;
        const m = l[0].match(re);
        if (!m)
            continue;

        // Sync the uthmani text to the imlaa'iee text
        let word_i = l[0].slice(0, m.index).split(' ').length - 1;

        if ((quran_i === 2442 && word_i > 2) || quran_i === 5463 && word_i > 0)
            word_i--;

        const remove = l[0].slice(0, m.index).match(/(^| )(ها|و?يا) /g);
        word_i -= remove ? remove.length : 0;
        word_i += l[1].startsWith('۞') ? 1 : 0;

        const ayah_parts = l[1].split(' ');
        ayah_parts[word_i] = `<strong>${ayah_parts[word_i]}</strong>`;
        matches.push([get_surah_ayah(quran_i), ayah_parts.join(' '), quran_i]);
        if (count++ > 50)
            break;
    }
    return matches;
}

$('#quran-search').on('keyup', e => debounce(() => {
    $('#quran-results').innerHTML = '<li id="enter-data-msg">أدخل كلمات آية ما لتظهر نتئاج.</li>';
    let val = e.target.value;
    if (val.length < 2)
        return;
    quran_i = 0;

    $('#quran-results').innerHTML = q_search(val).map(ayah_tpl).join('');
    if (quran_i < 6235)
        $('#quran-results').appendChild(more_btn);
}, 500));

more_btn.on('click', () => {
    $('#quran-results').removeChild(more_btn);
    $('#quran-results').insertAdjacentHTML('beforeEnd', q_search($('#quran-search').value).map(ayah_tpl).join(''));
    if (quran_i < 6235)
        $('#quran-results').appendChild(more_btn);
});

$('#quran-results').on('click', e => {
    let el = e.target;
    if (['SVG', 'USE'].includes(e.target.tagName.toUpperCase()))
        el = e.target.closest('button');
    if (!el.matches('.copy-btn')) // can be quran-results or more-btn
        return;

    const li = el.closest('li');
    copy(`﴿${quran[+li.dataset.aid - 1][1]}﴾ ` + li.querySelector('.ayah-ref').innerText);
    status_msg('نُسخ', 4);
});
