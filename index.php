<?php
/*
Plugin Name: timetable
Plugin URI: https://rozklad.udpu.edu.ua/
Description: [tmtbl_stud faculty_id='' okr='' education_form_id='' lang='']   [tmtbl_teacher]
Version: 1.1
Author: Ruslan IOC
Author URI: https://github.com/tguruslan
*/

add_shortcode("tmtbl_stud", function($atts, $content = null){
    extract(shortcode_atts(array("faculty_id" => '',"okr" => '',"education_form_id" => '',"lang"=> ''), $atts));  
    wp_enqueue_script('slimselect', '//unpkg.com/slim-select@latest/dist/slimselect.min.js');
    wp_enqueue_style('slimselect', '//unpkg.com/slim-select@latest/dist/slimselect.css');
    wp_enqueue_style('timetable', plugins_url('style.css',__FILE__ ));
    wp_enqueue_script('timetable', plugins_url('script_stud.js',__FILE__ ), array('slimselect'), null );
    $hide=[];
    if($faculty_id){array_push($hide, "faculty_id");}
    if($education_form_id){array_push($hide, "education_form_id");}
    if($okr){array_push($hide, "okr");}    
    $html='<div id="timetable" hide="'.implode(';',$hide).'" faculty_id="'.$faculty_id.'" education_form_id="'.$education_form_id.'" okr="'.$okr.'" lang="'.$lang.'"></div>';
    return $html;
});



add_shortcode("tmtbl_teacher", function($atts, $content = null){
    extract(shortcode_atts(array("lang"=> ''), $atts));
    wp_enqueue_script('slimselect', '//unpkg.com/slim-select@latest/dist/slimselect.min.js');
    wp_enqueue_style('slimselect', '//unpkg.com/slim-select@latest/dist/slimselect.css');
    wp_enqueue_style('timetable', plugins_url('style.css',__FILE__ ));
    wp_enqueue_script('timetable', plugins_url('script_teacher.js',__FILE__ ), array('slimselect'), null );
    $html='<div id="timetable" lang="'.$lang.'"></div>';
    return $html;
});


