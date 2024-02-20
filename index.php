<?php
/*
Plugin Name: timetable
Plugin URI: https://rozklad.udpu.edu.ua/
Description: вставте шорткод на сторінку [tmtbl_stud faculty_id='' okr='' education_form_id='' lang='']
Version: 1.1
Author: Ruslan IOC
Author URI: https://github.com/tguruslan
*/

add_shortcode("tmtbl_stud", function($atts, $content = null){
    extract(shortcode_atts(array("faculty_id" => '',"okr" => '',"education_form_id" => '',"lang"=> ''), $atts));  
    wp_enqueue_script('slimselect', '//unpkg.com/slim-select@latest/dist/slimselect.min.js');
    wp_enqueue_style('slimselect', '//unpkg.com/slim-select@latest/dist/slimselect.css');
    wp_enqueue_style('timetable', '//rozklad.udpu.edu.ua/css/stud.css');
    wp_enqueue_script('timetable', '//rozklad.udpu.edu.ua/js/stud.js', array('slimselect'), null );
    $hide=[];
    if($faculty_id){array_push($hide, "faculty_id");}
    if($education_form_id){array_push($hide, "education_form_id");}
    if($okr){array_push($hide, "okr");}    
    $html='<div id="timetable" hide="'.implode(';',$hide).'" faculty_id="'.$faculty_id.'" education_form_id="'.$education_form_id.'" okr="'.$okr.'" lang="'.$lang.'"></div>';
    return $html;
});
