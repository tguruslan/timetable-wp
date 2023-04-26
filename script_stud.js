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
        var params={
                faculty_id:$("#faculty_id").val(),
                okr:$("#okr").val(),
                speciality_id:$("#speciality_id").val(),
                education_form_id:$("#education_form_id").val(),
                course:$("#course").val(),
                group: $("#group").val(),
            };
        if(params.group){history.pushState({}, null, url + '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&')); setCookie('group', params.group);}

        jQuery('#faculty_id').on('change', function (event) {
            jQuery("#okr,#speciality_id,#education_form_id,#course,#group").val("").trigger("change");
        });
        jQuery('#okr').on('change', function (event) {
            jQuery("#speciality_id,#education_form_id,#course,#group").val("").trigger("change");
        });
        jQuery('#speciality_id').on('change', function (event) {
            jQuery("#education_form_id,#course,#group").val("").trigger("change");
        });
        jQuery('#education_form_id').on('change', function (event) {
            jQuery("#course,#group").val("").trigger("change");
        });
        jQuery('#course').on('change', function (event) {
            jQuery("#group").val("").trigger("change");
        });




        if($('select#faculty_id').length){
                jQuery('#faculty_id').select2({
                    minimumResultsForSearch:-1,
                    placeholder:'Оберіть значення',
                    ajax: {
                        delay: 250,
                        url: api_url+'/filter',
                        dataType: 'json',
                        type: "GET",
                        data: {
                            type: 'faculty_id'
                        },
                        processResults: function (data) {
                            return {
                                results: data
                            };
                        },
                    }
                });
        }

        if($('select#okr').length){
            jQuery('#okr').select2({
                minimumResultsForSearch:-1,
                placeholder:'Оберіть значення',
                ajax: {
                    delay: 250,
                    url: api_url+'/filter',
                    dataType: 'json',
                    type: "GET",
                    data: {
                        type: 'okr',
                        filters: function(params) { return JSON.stringify({
                            faculty_id:$('#faculty_id').val()
                        });}

                    },
                    processResults: function (data) {
                        return {
                            results: data
                        };
                    },
                }
            });
        }

        jQuery('#speciality_id').select2({
            minimumResultsForSearch:-1,
            placeholder:'Оберіть значення',
            ajax: {
                delay: 250,
                url: api_url+'/filter',
                dataType: 'json',
                type: "GET",
                data: {
                    type: 'speciality',
                    filters: function(params) { return JSON.stringify({
                        faculty_id:$("#faculty_id").val(),
                        okr:$("#okr").val()
                    });}

                },
                processResults: function (data) {
                    return {
                        results: data
                    };
                },
            }
        });

        if($('select#education_form_id').length){
            jQuery('#education_form_id').select2({
                minimumResultsForSearch:-1,
                placeholder:'Оберіть значення',
                ajax: {
                    delay: 250,
                    url: api_url+'/filter',
                    dataType: 'json',
                    type: "GET",
                    data: {
                        type: 'education_form_id',
                        filters: function(params) { return JSON.stringify({
                            speciality_id:$("#speciality_id").val()
                        });}

                    },
                    processResults: function (data) {
                        return {
                            results: data
                        };
                    },
                }
            });
        }

        jQuery('#course').select2({
            minimumResultsForSearch:-1,
            placeholder:'Оберіть значення',
            ajax: {
                delay: 250,
                url: api_url+'/filter',
                dataType: 'json',
                type: "GET",
                data: {
                    type: 'course',
                    filters: function(params) { return JSON.stringify({
                        speciality_id:$("#speciality_id").val(),
                        education_form_id:$("#education_form_id").val()
                    });}

                },
                processResults: function (data) {
                    return {
                        results: data
                    };
                },
            }
        });

        jQuery('#group').select2({
            minimumResultsForSearch:-1,
            placeholder:'Оберіть значення',
            ajax: {
                delay: 250,
                url: api_url+'/filter',
                dataType: 'json',
                type: "GET",
                data: {
                    type: 'group',
                    filters: function(params) { return JSON.stringify({
                        speciality_id:$("#speciality_id").val(),
                        course:$("#course").val(),
                        education_form_id:$("#education_form_id").val()
                    });}

                },
                processResults: function (data) {
                    return {
                        results: data
                    };
                },
            }
        });



        $(document).on('click','[type="submit"]', function (e){
            e.preventDefault();
            var url = window.location.href.split('?')[0];
            var params={
                faculty_id:$("#faculty_id").val(),
                okr:$("#okr").val(),
                speciality_id:$("#speciality_id").val(),
                education_form_id:$("#education_form_id").val(),
                course:$("#course").val(),
                group: $("#group").val()
            };
            $.ajax({
            url: api_url+'/days',
            method: "GET",
            async: false,
            data: {
                type: 'student',
                id: params.group
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
                                    colspan:2,
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
                            type: 'student',
                            id: params.group,
                            date: intdate
                        }
                    })
                    .done(function( rozklad ) {
                        $.each( rozklad, function( number, id ) {
                            $.each( id, function(i, lesson) {

                                html+=$(
                                    '<tr>',
                                    {
                                        html: $(
                                            '<td>',
                                            {
                                                html:
                                                    $(
                                                        '<b>',
                                                        {
                                                            text: number+' пара'
                                                        }
                                                    )[0].outerHTML
                                                    + $('<br>')[0].outerHTML
                                                    + lesson.time
                                            }
                                        )[0].outerHTML
                                        + $(
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

                                                + $(
                                                    '<b>',
                                                    {
                                                        text: 'Форма контролю (для обраної групи): '
                                                    }
                                                )[0].outerHTML
                                                + lesson.form_control
                                                + $('<br>')[0].outerHTML

                                                + ( lesson.teacher ? $(
                                                    '<b>',
                                                    {
                                                        text: 'Викладач: '
                                                    }
                                                )[0].outerHTML
                                                + lesson.teacher
                                                + $('<br>')[0].outerHTML : '' )

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
                                        )[0].outerHTML
                                    }
                                )[0].outerHTML;
                            });
                        });
                    });
                });
                html+='</tbody>'+'</table>';
                $(document).find('.table-container').html(html);
            })
            .always(function(){
                history.pushState({}, null, url + '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&'));
                setCookie('group', params.group);
            });
        });

    });
})(jQuery);
