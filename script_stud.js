var searchParams = new URLSearchParams(window.location.search);
var main = document.querySelector('#timetable');
main.appendChild(document.createElement('form'));
main.appendChild(document.createElement('div')).className = 'rozklad_container';
var container = document.querySelector('.rozklad_container');

var education_form_id=main.getAttribute("education_form_id");
var okr=main.getAttribute("okr");
var faculty_id=main.getAttribute("faculty_id");
var hide=main.getAttribute("hide");
var lang=main.getAttribute("lang");

if (lang == 'en'){
    var api_url = 'https://rozklad.udpu.edu.ua/en/api';
}else{
    lang='uk';
    var api_url = 'https://rozklad.udpu.edu.ua/api';
}

var texts = {
    uk:{
        search:'Пошук',
        lesson:'пара',
        subject:'Предмет',
        works_type:'Тип заняття',
        groups:'Групи',
        subgroups:'Підгрупи',
        form_control:'Форма контролю (для обраної групи)',
        teacher:'Викладач',
        classroom:'Авдиторія',
        url:'Посилання',
        comment:'Коментар',
        enter_2_or_more:'Будь ласка, введіть 2 або більше літер',
        searchText: 'На данний момент нічого не знайдено',
        searchPlaceholder: 'Введіть назву групи',
        placeholderText: 'Введіть назву групи',
    },
    en:{
        search:'Find',
        lesson:'lesson',
        subject:'Subject',
        works_type:'Lesson type',
        groups:'Groups',
        subgroups:'Subgroups',
        form_control:'Control form (for the selected group)',
        teacher:'Teacher',
        classroom:'Classroom',
        url:'Link',
        comment:'Comment',
        enter_2_or_more:'Please enter 2 or more characters',
        searchText: 'Nothing found at the moment',
        searchPlaceholder: 'Enter a group name',
        placeholderText: 'Enter a group name',
    }
}

var text = texts[lang];

main.querySelector('form').appendChild(document.createElement('select')).id="timetableSearch";
main.querySelector('form').appendChild(document.createElement('button')).textContent = text.search;

function getCookieValue(cookieName) {
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var cookieParts = cookies[i].split("=");
        var name = cookieParts[0].trim();
        var value = cookieParts[1];
        if (name === cookieName) {
            return value;
        }
    }
    return null;
}

function setCookie(cookieName, cookieValue, expirationDays) {
    var d = new Date();
    d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

function getData(){
    var select_data=null;
    var data_group=null;
    if(searchParams.has('group')){
        data_group=searchParams.get('group')
    }else if(getCookieValue("group")){
        data_group=getCookieValue("group")
    }
    if(data_group){
        var params = {
            filters: JSON.stringify({
                group:data_group,
                education_form_id: education_form_id,
                okr: okr,
                faculty_id: faculty_id,
                hide: hide,
            })
        };

        var xhr = new XMLHttpRequest();
        xhr.open("GET", api_url + '/search?' + new URLSearchParams(params).toString(), false);
        xhr.send();
        select_data=JSON.parse(xhr.responseText).map((el) => {return {text: el.text,value: el.id}})
    }
    return select_data;
}

function craateDay(date,text){
    table=document.createElement('table')
    table.className='day d'+date
    tbody=document.createElement('tbody')
    tr=document.createElement('tr')
    td=document.createElement('td')

    td.className='day_title'
    td.colSpan='2'
    td.textContent=text.replaceAll('-','.')

    container.appendChild(table)
    table.appendChild(tbody)
    tbody.appendChild(tr)
    tr.appendChild(td)
}

function createLessons(date,lessons){
    var day = document.querySelector('.d'+date+' tbody');
    for (const [number, ids] of Object.entries(lessons)) {
        for (const [id,lesson] of Object.entries(ids)) {
            var lesson_tr = document.createElement('tr')
            lesson_tr.className='lesson'
            day.appendChild(lesson_tr)

            lesson_tr.appendChild(document.createElement('td')).innerHTML = (lesson.time.includes('-')?'<b>'+number+' '+text.lesson+'</b><br>':'')+lesson.time

            var lesson_detail='<b>'+text.subject+':</b> '+lesson.subject+'<br>'+
                              '<b>'+text.works_type+':</b> '+lesson.works_type+'<br>'+
                              '<b>'+text.groups+':</b> '+lesson.groups+'<br>'+
                              (lesson.subgroups?'<b>'+text.subgroups+':</b> '+lesson.subgroups+'<br>':'')+
                              '<b>'+text.form_control+':</b> '+lesson.form_control+'<br>'+

                              (lesson.teacher?'<b>'+text.teacher+':</b> '+lesson.teacher+'<br>':'')+
                              (lesson.classroom?'<b>'+text.classroom+':</b> '+lesson.classroom+'<br>':'')+
                              (lesson.url?'<a href="'+lesson.url+'" target="_blank">'+text.url+'</a><br>':'')+
                              (lesson.comment?'<b>'+text.comment+':</b> '+lesson.comment+'<br>':'');
            lesson_tr.appendChild(document.createElement('td')).innerHTML=lesson_detail;
        }
    }
}

function getRozklad(group){
    var params={}
    if(group){params["group"]=group;}

    var url = window.location.href.split('?')[0];
    history.pushState({}, null, url + '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&'));

    setCookie("group", group, 30);
    document.querySelector('.rozklad_container').innerHTML=''
    var data={
        type: 'student',
        id: group
    }

    fetch(api_url + '/days?' + new URLSearchParams(data).toString(), {
        method: 'GET',
    })
    .then((response) => response.json())
    .then((data) => {
        for (const [key, value] of Object.entries(data)) {
            craateDay(key,value);
            var data={
                    type: 'student',
                    id: group,
                    date: key
                }

            fetch(api_url + '/rozklad?' + new URLSearchParams(data).toString(), {
                method: 'GET',
            })
            .then((response) => response.json())
            .then((data) => {
                createLessons(key,data);
            })
        }
    })
}


var slim = new SlimSelect({
    select: '#timetableSearch',
    data: getData(),
    events: {
        search: (search, currentData) => {
            return new Promise((resolve, reject) => {
                if (search.length < 2) {
                    return reject(text.enter_2_or_more)
                }
                var params = {
                    q: search,
                    filters: JSON.stringify({
                        education_form_id: education_form_id,
                        okr: okr,
                        faculty_id: faculty_id,
                        hide: hide,
                    })
                };
                fetch(api_url + '/search?' + new URLSearchParams(params).toString(), {
                method: 'GET',
                })
                .then((response) => response.json())
                .then((data) => {
                    const options = data
                    .map((el) => {
                        return {
                        text: el.text,
                        value: el.id,
                        }
                    })
                    resolve(options)
                })
            })
        }
    },
    settings: {
        searchText: text.searchText,
        searchPlaceholder: text.searchPlaceholder,
        placeholderText: text.placeholderText,
    }
});

slim.enable()

document.querySelector('button').addEventListener('click', function (e) {
    e.preventDefault();
    getRozklad(document.querySelector('#timetableSearch').value);
});

if(searchParams.has('group')){
    getRozklad(searchParams.get("group"));
}else if(group=getCookieValue("group")){
    getRozklad(group);
}
