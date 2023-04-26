<?php
/*
Plugin Name: timetable
Plugin URI: https://rozklad.udpu.edu.ua/
Description: [tmtbl_stud faculty_id='' okr='' education_form_id='']   [tmtbl_teacher]
Version: 1.0
Author: Ruslan IOC
Author URI: https://github.com/tguruslan
*/

add_shortcode("tmtbl_stud", function($atts, $content = null){

    $api_url='https://rozklad.udpu.edu.ua/api';
    $type='student';

    extract(shortcode_atts(array("faculty_id" => '',"okr" => '',"education_form_id" => ''), $atts));
    wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.0.12/dist/js/select2.min.js', array( 'jquery' ), null );
    wp_enqueue_style( 'select2', 'https://cdn.jsdelivr.net/npm/select2@4.0.12/dist/css/select2.min.css' );
    wp_enqueue_style('timetable', plugins_url('style.css',__FILE__ ));
    wp_enqueue_script('timetable', plugins_url('script_stud.js',__FILE__ ), array( 'jquery','select2' ), null );

    $data=[];
    $days=[];

    $group=null;
    if($_GET['group']){
        $group=$_GET['group'];
    }else{
        if($_COOKIE['group']){
            $group=$_COOKIE['group'];
        }
    }

    if($group != null){
        $response=wp_remote_get($api_url.'/values',['body'=>['id'=>$group]]);
        if ( wp_remote_retrieve_response_code( $response ) === 200 ){
            $data=json_decode(wp_remote_retrieve_body($response),true);
        }

        $response1=wp_remote_get($api_url.'/days',['body'=>['type'=>$type,'id'=>$group]]);
        if ( wp_remote_retrieve_response_code( $response1 ) === 200 ){
            $days=json_decode(wp_remote_retrieve_body($response1),true);
        }
    }

    $html = '<div class="tmtbl stud">'.
        '<form>'.
        '<div class="tmtbl-row">';

    foreach([
        [
            'key'=>'faculty_id',
            'title'=>'faculty_name',
            'descr'=>'Структурний підрозділ'
        ],
        [
            'key'=>'okr',
            'title'=>'okr_name',
            'descr'=>'Освітній ступінь'
        ],
        [
            'key'=>'speciality_id',
            'title'=>'speciality_name',
            'descr'=>'Розклад/Спеціальність'
        ],
        [
            'key'=>'education_form_id',
            'title'=>'education_form_name',
            'descr'=>'Форма навчання'
        ],
        [
            'key'=>'course',
            'title'=>'course_name',
            'descr'=>'Курс'
        ],
        [
            'key'=>'group',
            'title'=>'group_name',
            'descr'=>'Група'
        ],
    ] as $el){
        if($$el['key']){
            $html .= '<input id="'.$el['key'].'" value="'.$$el['key'].'" style="display:none;" readonly>';
        }else{
            $html .= '<label class="tmtbl-md-6" for="'.$el['key'].'">'.$el['descr'].
                '<select id="'.$el['key'].'">';
            if($data[$el['key']]){
                $html .= '<option selected value="'.$data[$el['key']].'">'.$data[$el['title']].'</option>';
            }
            $html .= '</select>'.
                '</label>';
        }
    }

    $html .= '</div>'.
        '<div class="tmtbl-row">'.
        '<button class="tmtbl-xs-4 tmtbl-sm-2" type="submit">Пошук</button>'.
        '</div>'.
        '</form>'.
        '<div class="table-container tmtbl-row">';


    if(count((array)$days) > 0){
        $html .= '<table>';
        $html .= '<tbody>';
        foreach ($days as $timestamp=>$day){
            $html .= '<tr>'.
                        '<td colspan="2"><b>'.$day.'</b></td>'.
                    '</tr>';

            $response2=wp_remote_get($api_url.'/rozklad',
                [
                    'body'=>[
                        'type'=>$type,
                        'id'=>$group,
                        'date'=>$timestamp
                    ]
                ]
            );
            $day=[];
            if ( wp_remote_retrieve_response_code($response2) === 200 ){
                $day=json_decode(wp_remote_retrieve_body($response2), true);
            }
            foreach ((array) $day as $number => $id){
                foreach ($id as $lesson){
                    $html .= '<tr>'.
                        '<td><b>'.$number.' пара</b><br>'.$lesson['time'].'</td>'.
                        '<td>'.
                            '<b>Предмет:</b> '.$lesson['subject'].'<br>'.
                            '<b>Тип заняття:</b> '.$lesson['works_type'].'<br>'.
                            '<b>Групи:</b> '.$lesson['groups'].'<br>'.
                            '<b>Форма контролю (для обраної групи):</b> '.$lesson['form_control'].'<br>'.
                            ($lesson['teacher']?'<b>Викладач:</b> '.$lesson['teacher'].'<br>':'').
                            ($lesson['classroom']?'<b>Аудиторія:</b> '.$lesson['classroom'].'<br>':'').
                            ($lesson['url']?'<a href="'.$lesson['url'].'" target="_blank">Посилання</a><br>':'').
                            ($lesson['comment']?'<b>Коментар:</b> '.$lesson['comment'].'<br>':'').
                        '</td>'.
                    '</tr>';
                }
            }
        }
        $html .= '</tbody>'.
            '</table>';
    } else {
        if($_GET['group']){
            $html .= '<div style="text-align: center;"><h3>На данний момент нічого не знайдено</h3></div>'.
                '<br>'.
                '<br>';
        }
    }


    $html .= '</div>';
    $html .= '</div>';

    return $html;
});



add_shortcode("tmtbl_teacher", function($atts, $content = null){

    $api_url='https://rozklad.udpu.edu.ua/api';
    $type='teacher';

    wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.0.12/dist/js/select2.min.js', array( 'jquery' ), null );
    wp_enqueue_style( 'select2', 'https://cdn.jsdelivr.net/npm/select2@4.0.12/dist/css/select2.min.css' );


    wp_enqueue_script('moment', 'https://cdn.jsdelivr.net/momentjs/latest/moment.min.js', array( 'jquery' ), null );
    wp_enqueue_script('daterangepicker', 'https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js', array( 'moment' ), null );
    wp_enqueue_style( 'daterangepicker', 'https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css' );

    wp_enqueue_style('timetable', plugins_url('style.css',__FILE__ ));
    wp_enqueue_script('timetable', plugins_url('script_teacher.js',__FILE__ ), array( 'jquery','select2' ), null );

    $data=[];
    $days=[];

    $teacher=null;
    if($_GET['teacher']){
        $teacher=$_GET['teacher'];
    }else{
        if($_COOKIE['teacher']){
            $teacher=$_COOKIE['teacher'];
        }
    }

    if($teacher != null){
        $response=wp_remote_get($api_url.'/filter',[
            'body'=>[
                'type'=>$type,
                'filters'=>json_encode([
                        'personId'=>$teacher
                    ])
                ]
            ]
        );

        if ( wp_remote_retrieve_response_code( $response ) === 200 ){
            $data=json_decode(wp_remote_retrieve_body($response),true);
        }

        $response1=wp_remote_get($api_url.'/days',['body'=>['type'=>$type,'id'=>$teacher]]);
        if ( wp_remote_retrieve_response_code( $response1 ) === 200 ){
            $days=json_decode(wp_remote_retrieve_body($response1),true);
        }
    }

    $html = '<div class="tmtbl teacher">'.
        '<form>'.
        '<div class="tmtbl-row">';


    $html .= '<label class="tmtbl-md-5" for="teacher">П.І.Б. викладача'.
            '<select id="teacher">';
            if($data[0]['id']==$teacher){
                $html .= '<option selected value="'.$data[0]['id'].'">'.$data[0]['text'].'</option>';
            }
    $html .= '</select>'.
            '</label>';

    $html .= '<label class="tmtbl-md-5" for="date_range">Дати'.
            '<input type="text" name="date_range" value="'.$_GET['date_range'].'" />'.
            '</label>';


    $html .= '<div class="tmtbl-md-2">'.
        '<button type="submit">Пошук</button>'.
        '</div>'.
        '</div>'.
        '</form>'.
        '<div class="table-container tmtbl-row">';

    if(count((array)$days) > 0){
        $html .= '<table>';
        $html .= '<tbody>';
        foreach ($days as $timestamp=>$day){
            $html .= '<tr>'.
                        '<td colspan="3"><b>'.$day.'</b></td>'.
                    '</tr>';

            $response2=wp_remote_get($api_url.'/rozklad',
                [
                    'body'=>[
                        'type'=>$type,
                        'id'=>$teacher,
                        'date'=>$timestamp
                    ]
                ]
            );
            $day=[];
            if ( wp_remote_retrieve_response_code($response2) === 200 ){
                $day=json_decode(wp_remote_retrieve_body($response2), true);
            }
            foreach ((array) $day as $number => $id){
                $subrow=0;
                foreach ($id as $lesson){
                    $html .= '<tr>';
                            if($subrow==0){
                                $html .= '<td rowspan="'.count($id).'"><b>'.$number.' пара</b><br>'.$lesson['time'].'</td>';
                            }
                            $subrow++;
                            $html .= '<td>'.
                                '<b>Факультет:</b> '.$lesson['spec_faculty'].'<br>'.
                                '<b>Спеціальність/Розклад:</b> '.$lesson['spec_title'].'<br>'.
                                '<b>ОС:</b> '.$lesson['spec_okr'].'<br>'.
                                '<b>Форма:</b> '.$lesson['sbj_education_form_id'].'<br>'.
                                '<b>Курс:</b> '.$lesson['sbj_course'].'<br>'.
                                ($lesson['sbj_hours'] ? '<b>Години:</b> '.$lesson['sbj_hours'].'<br>':'').
                                ($lesson['sbj_comment'] ? '<b>Коментар:</b> '.$lesson['sbj_comment'].'<br>':'').
                            '</td>'.
                            '<td>'.
                                '<b>Предмет:</b> '.$lesson['subject'].'<br>'.
                                '<b>Тип заняття:</b> '.$lesson['works_type'].'<br>'.
                                '<b>Групи:</b> '.$lesson['groups'].'<br>'.
                                ($lesson['classroom']?'<b>Аудиторія:</b> '.$lesson['classroom'].'<br>':'').
                                ($lesson['url']?'<a href="'.$lesson['url'].'" target="_blank">Посилання</a><br>':'').
                                ($lesson['comment']?'<b>Коментар:</b> '.$lesson['comment'].'<br>':'').
                                '</td>'.
                        '</tr>';
                    }
                }
            }
            $html .= '</tbody>'.
                '</table>';

    } else {
        if($_GET['group']){
            $html .= '<div style="text-align: center;"><h3>На данний момент нічого не знайдено</h3></div>'.
                '<br>'.
                '<br>';
        }
    }


    $html .= '</div>';
    $html .= '</div>';

    return $html;
});


