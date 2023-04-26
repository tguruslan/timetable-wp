(function($){
    function setCookie(cName, cValue) {
        let date = new Date();
        date.setTime(date.getTime() + 86400 * 180);
        const expires = "expires=" + date.toUTCString();
        document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
    }
    jQuery(document).ready(function(){
        var api_url='https://rozklad.udpu.edu.ua/api';
        var url = window.location.href.split('?')[0];
        var params={ teacher: $("#teacher").val(), date_range: $("[name='date_range']").val() };
        if(params.teacher){history.pushState({}, null, url + '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&')); setCookie('teacher', params.teacher);}
            
        jQuery('#teacher').select2({
            minimumInputLength:3,
            placeholder:'П.І.Б. викладача',
            ajax: {
                delay: 250,
                url: api_url+'/filter',
                dataType: 'json',
                type: "GET",
                data: function(params){
                    return {
                        type:'teacher',
                        filters: JSON.stringify({
                            q:params.term
                        })
                    }
                },
                processResults: function (data) {
                    return {
                        results: data
                    };
                },
            }
        });


        $('input[name="date_range"]').daterangepicker({
            convertFormat:true,
            autoUpdateInput: false,
            language: 'uk',
            locale:{
                applyLabel:"Застосувати",
                cancelLabel:"Закрити",
                format:'DD-MM-YYYY'
            },
            maxSpan: {
                days:6,
            }
        });

        $('input[name="date_range"]').on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('DD-MM-YYYY') + ' - ' + picker.endDate.format('DD-MM-YYYY'));
        });
      
        $('input[name="date_range"]').on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });


        $(document).on('click','[type="submit"]', function (e){
            e.preventDefault();
            var url = window.location.href.split('?')[0];
            var params={ teacher: $("#teacher").val(), date_range: $("[name='date_range']").val() };
            
            $.ajax({
              url: api_url+'/days',
              method: "GET",
              async: false,
              data: {
                  type: 'teacher',
                  id: params.teacher,
                  dates: params.date_range
              }
            })
            .done(function( data ) {
                if (Object.keys(data).length < 1){
                    $(document).find('.table-container').html(
                        $(
                            '<div>',
                            {
                                style: 'text-align:center;',
                                html:$(
                                        '<h3>',
                                        {
                                            text:'На данний момент нічого не знайдено'
                                        }
                                    )
                            }
                        )[0].outerHTML
                        + $('<br>')[0].outerHTML
                        + $('<br>')[0].outerHTML
                    );
                    return;
                }
                
                let html='<table>'+'<tbody>';
                $.each( data, function( intdate, stringdate ) {
                    html+=$(
                        '<tr>',
                        {
                            html: $(
                                '<td>',
                                {
                                    colspan:3,
                                    html:$(
                                        '<b>',
                                        {
                                            text: stringdate
                                        }
                                    )
                                }
                            )
                        }
                    )[0].outerHTML;
                    $.ajax({
                        url: api_url+'/rozklad',
                        method: "GET",
                        async: false,
                        data: {
                            type: 'teacher',
                            id: params.teacher,
                            date: intdate
                        }
                    })
                    .done(function( rozklad ) {
                        $.each( rozklad, function( number, id ) {
                            let subrow=0;
                            $.each( id, function(i, lesson) {
                                subrow++;
                                html+='<tr>';
                                    html+=(subrow==1 ? $(
                                        '<td>',
                                        {
                                            rowspan: Object.keys(id).length,
                                            html: $(
                                                '<b>',
                                                {
                                                    text: number+' пара'
                                                }
                                            )[0].outerHTML
                                            + $('<br>')[0].outerHTML
                                            + lesson.time
                                        }
                                    )[0].outerHTML : '');
                                
                                    html+=$(
                                        '<td>',
                                        {
                                            html:
                                            $(
                                                '<b>',
                                                {
                                                    text: 'Факультет: '
                                                }
                                            )[0].outerHTML
                                            + lesson.spec_faculty
                                            + $('<br>')[0].outerHTML
                                            
                                            + $(
                                                '<b>',
                                                {
                                                    text: 'Спеціальність/Розклад: '
                                                }
                                            )[0].outerHTML
                                            + lesson.spec_title
                                            + $('<br>')[0].outerHTML
                                            
                                            + $(
                                                '<b>',
                                                {
                                                    text: 'ОС: '
                                                }
                                            )[0].outerHTML
                                            + lesson.spec_okr
                                            + $('<br>')[0].outerHTML
                                            
                                            + $(
                                                '<b>',
                                                {
                                                    text: 'Форма: '
                                                }
                                            )[0].outerHTML
                                            + lesson.sbj_education_form_id
                                            + $('<br>')[0].outerHTML
                                            
                                            + $(
                                                '<b>',
                                                {
                                                    text: 'Курс: '
                                                }
                                            )[0].outerHTML
                                            + lesson.sbj_course
                                            + $('<br>')[0].outerHTML
                                            
                                            + ( lesson.sbj_hours ? $(
                                                '<b>',
                                                {
                                                    text: 'Години: '
                                                }
                                            )[0].outerHTML
                                            + lesson.sbj_hours
                                            + $('<br>')[0].outerHTML : '' )
                                            
                                            + ( lesson.sbj_comment ? $(
                                                '<b>',
                                                {
                                                    text: 'Коментар: '
                                                }
                                            )[0].outerHTML
                                            + lesson.sbj_comment
                                            + $('<br>')[0].outerHTML : '' )
                                        }
                                    )[0].outerHTML
                                        
                                    
                                    html+=$(
                                            '<td>',
                                            {
                                                html:
                                                $(
                                                    '<b>',
                                                    {
                                                        text: 'Предмет: '
                                                    }
                                                )[0].outerHTML
                                                + lesson.subject
                                                + $('<br>')[0].outerHTML
                                                
                                                + $(
                                                    '<b>',
                                                    {
                                                        text: 'Тип заняття: '
                                                    }
                                                )[0].outerHTML
                                                + lesson.works_type
                                                + $('<br>')[0].outerHTML
                                                
                                                + $(
                                                    '<b>',
                                                    {
                                                        text: 'Групи: '
                                                    }
                                                )[0].outerHTML
                                                + lesson.groups
                                                + $('<br>')[0].outerHTML
                                                
                                                + ( lesson.classroom ? $(
                                                    '<b>',
                                                    {
                                                        text: 'Аудиторія: '
                                                    }
                                                )[0].outerHTML
                                                + lesson.classroom
                                                + $('<br>')[0].outerHTML : '' )
                                                
                                                + ( lesson.url ? $(
                                                    '<a>',
                                                    {
                                                        text: 'Посилання',
                                                        href: lesson.url,
                                                        target: '_blank'
                                                    }
                                                )[0].outerHTML
                                                + $('<br>')[0].outerHTML : '' )
                                                
                                                + ( lesson.comment ? $(
                                                    '<b>',
                                                    {
                                                        text: 'Коментар: '
                                                    }
                                                )[0].outerHTML
                                                + lesson.comment
                                                + $('<br>')[0].outerHTML : '' )
                                            }
                                        )[0].outerHTML;
                                        
                                html+='</tr>';
                            });
                        });
                    });                          
                    
                });
                html+='</tbody>'+'</table>';
                
                $(document).find('.table-container').html(html);
            })
            .always(function(){
                history.pushState({}, null, url + '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&'));
                setCookie('teacher', params.teacher);
            });
        });


    });
})(jQuery);
