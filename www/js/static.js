
// Static content
// https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&format=json&titles=Main%20Page&lllimit=100&llprop=langname
//var languages = [{"lang":"ar","langname":"Arabic","*":""},{"lang":"bg","langname":"Bulgarian","*":""},{"lang":"bs","langname":"Bosnian","*":""},{"lang":"ca","langname":"Catalan","*":""},{"lang":"cs","langname":"Czech","*":""},{"lang":"da","langname":"Danish","*":""},{"lang":"de","langname":"German","*":""},{"lang":"el","langname":"Greek","*":""},{"lang":"eo","langname":"Esperanto","*":""},{"lang":"es","langname":"Spanish","*":""},{"lang":"et","langname":"Estonian","*":""},{"lang":"eu","langname":"Basque","*":""},{"lang":"fa","langname":"Persian","*":""},{"lang":"fi","langname":"Finnish","*":""},{"lang":"fr","langname":"French","*":""},{"lang":"gl","langname":"Galician","*":""},{"lang":"he","langname":"Hebrew","*":""},{"lang":"hr","langname":"Croatian","*":""},{"lang":"hu","langname":"Hungarian","*":""},{"lang":"id","langname":"Indonesian","*":""},{"lang":"it","langname":"Italian","*":""},{"lang":"ja","langname":"Japanese","*":""},{"lang":"ka","langname":"Georgian","*":""},{"lang":"ko","langname":"Korean","*":""},{"lang":"lt","langname":"Lithuanian","*":""},{"lang":"lv","langname":"Latvian","*":""},{"lang":"ms","langname":"Malay","*":""},{"lang":"nl","langname":"Dutch","*":""},{"lang":"nn","langname":"Norwegian Nynorsk","*":""},{"lang":"no","langname":"Norwegian","*":""},{"lang":"pl","langname":"Polish","*":""},{"lang":"pt","langname":"Portuguese","*":""},{"lang":"ro","langname":"Romanian","*":""},{"lang":"ru","langname":"Russian","*":""},{"lang":"sh","langname":"Serbo-Croatian","*":""},{"lang":"simple","langname":"Simple English","*":""},{"lang":"sk","langname":"Slovak","*":""},{"lang":"sl","langname":"Slovenian","*":""},{"lang":"sr","langname":"Serbian","*":""},{"lang":"sv","langname":"Swedish","*":""},{"lang":"th","langname":"Thai","*":""},{"lang":"tr","langname":"Turkish","*":""},{"lang":"uk","langname":"Ukrainian","*":""},{"lang":"vi","langname":"Vietnamese","*":""},{"lang":"zh","langname":"Chinese","*":""}];
var LANGUAGES = {
  "ar":"Arabic",
  "hy":"Armenian",
  "az":"Azerbaijani",
  "eu":"Basque",
  //"bs":"Bosnian",
  "bg":"Bulgarian",
  "ca":"Catalan",
  "ceb": "Cebuano",
  "zh":"Chinese",
  "hr":"Croatian",
  "cs":"Czech",
  "da":"Danish",
  "nl":"Dutch",
  "en":"English",
  "eo":"Esperanto",
  "et":"Estonian",
  "fi":"Finnish",
  "fr":"French",
  "gl":"Galician",
  "ka":"Georgian",
  "de":"German",
  "el":"Greek",
  "he":"Hebrew",
  "hu":"Hungarian",
  "id":"Indonesian",
  "it":"Italian",
  "ja":"Japanese",
  "ko":"Korean",
  //"lv":"Latvian",
  "lt":"Lithuanian",
  "ms":"Malay",
  "no":"Norwegian",
  "nn":"Norwegian Nynorsk",
  "fa":"Persian",
  "pl":"Polish",
  "pt":"Portuguese",
  "ro":"Romanian",
  "ru":"Russian",
  "sr":"Serbian",
  "sh":"Serbo-Croatian",
  "sk":"Slovak",
  "sl":"Slovenian",
  "es":"Spanish",
  "sv":"Swedish",
  //"tt":"Tatar",
  "th":"Thai",
  "tr":"Turkish",
  "uk":"Ukrainian",
  "ur":"Urdu",
  "vi":"Vietnamese",
  "war": "Waray"
};

var DISAMBIGUATIONS = {
  "ar":"توضيح", //+
  "hy": "Բազմիմաստության փարատման", //+
  "az":"Dəqiqləşdirm", //+
  "eu":"argipen orriak", //+
  "bs":"Čvor članci", //+
  "bg":"Пояснителни", //+*
  "ca":"desambiguació", //+
  "ceb": "Pagklaro paghimo", //+
  "zh":"消歧义", //+
  "hr":"Razdvojba", //+
  "cs":"Rozcestníky", //+
  "da":"Flertydig", //+
  "nl":"Doorverwijspagina", //+
  "en":"Disambiguation", //+
  "eo":"Apartigiloj", //+
  "et":"Täpsustusleheküljed", //+*
  "fi":"Täsmennyssivut", //+ Täsmennyssivu
  "fr":"Homonymie", //+
  "gl":"Homónimos", //+
  "ka":"მრავალმნიშვნელოვანი", //+
  "de":"Begriffsklärung", //+
  "el":"Αποσαφήνιση", //+ αποσαφήνισης
  "he":"פירושונים", //+
  "hu":"Egyértelműsítő", //+
  "id":"Disambiguasi", //+
  "it":"disambiguazione", //+
  "ja":"曖昧さ回避", //+
  "ko":"동음이의어", //+
  "lv":"Nozīmju atdalīšana", //+
  "lt":"Nuorodiniai", //+
  "ms":"Laman nyahkekaburan", //+
  "no":"Pekere", //+* Flertydige
  "nn":"Fleirtydingssider", //+
  "fa":"ابهام‌زدایی", //+
  "pl":"ujednoznaczniające", //+*
  "pt":"Desambiguação", //+
  "ro":"Dezambiguizare", //+
  "ru":"неоднозначностей", //+*
  "sr":"Вишезначна", //+
  "sh":"Razvrstavanje", //+
  "sk":"Rozlišovacie", //+*
  "sl":"Razločitev", //+
  "es":"Desambiguación", //+
  "sv":"Förgreningssidor", //+ Förgreningssida, Särskiljning
  "tt":"мәкаләләр", //+
  "th":"การแก้ความกำกวม", //+
  "tr":"Anlam ayrımı", //+
  "uk":"неоднозначності", //+ Неоднозначність
  "ur": "ضد ابہام", //+
  "vi":"Trang định hướng", //+
  "war": "Pansayod", //+
  // Extended (not in languages)
  "als": "Begriffsklärung", //+
  "az": "Dəqiqləşdirmə", //+
  "bn": "দ্ব্যর্থতা", //+
  "is": "Aðgreiningarsíður", //+
  "si": "වක්‍රෝත්තිහරණ", //+
  "wuu": "消歧义", //+
  "zh-yue": "搞清楚", //+
  "br": "Lec'hanvadurezh c'hallek", //+
  "cy": "Gwahaniaethu", //+
  "hi": "बहुविकल्पी", //+
  "sw": "zinazotofautisha", //+
  "lb": "Homonymie", //+
  "ml": "വിവക്ഷകൾ", //+
  "pa": "ਗੁੰਝਲ ਖੋਲ੍ਹ ਸਫ਼ੇ", //+* Disambiguation
  "sco": "disambiguation", //+
  "vo": "Telplänovapads", //+ Telplänov"
  "yi": "באדייטן", //+*
  "ht": "Menm non" //+
};

/* // Parse language codes
var x = {};
var z = {};
var keys = [];
for(var i=0; i<LANGUAGES.length; i++){
x[LANGUAGES[i].lang] = LANGUAGES[i].langname;
z[LANGUAGES[i].langname] = LANGUAGES[i].lang;
keys.push(LANGUAGES[i].langname);
}
keys.sort();
var y = {};
for(var i=0; i<LANGUAGES.length; i++){
y[z[keys[i]]] = x[z[keys[i]]];
}
y['en'] = 'English';
console.log(JSON.stringify(y));
*/
