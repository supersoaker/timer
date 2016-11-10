import TimerApp from './App.js';

export default function init() {
    jQuery(document).ready(function($) {

        console.log(TimerApp.getInstance());

        (function initializeTimerOptions() {
            var html = '';
            var i = 0;
            // Iterate the options for minutes and second from 0 to 59
            for(i; i<60; i++)
                html += '<option value="'+i+'">'+i+'</option>';

            $('#minute-selector, #second-selector').html(html);

            // Iterate the options for hours from 0 to 23
            for(i = 0, html = ''; i<25; i++)
                html += '<option value="'+i+'">'+i+'</option>';

            $('#hour-selector').html(html);

            // Initialize material design
            $('select').material_select();
        }());

        (function addTextAreaTabFix() {
            $(document).delegate('textarea', 'keydown', function(e) {
                var keyCode = e.keyCode || e.which;

                // If tab key was clicked
                if (keyCode == 9) {
                    e.preventDefault();
                    var start = $(this).get(0).selectionStart;
                    var end = $(this).get(0).selectionEnd;

                    // set textarea value to: text before caret + tab + text after caret
                    $(this).val($(this).val().substring(0, start)
                        + "\t"
                        + $(this).val().substring(end));

                    // put caret at right position again
                    $(this).get(0).selectionStart =
                        $(this).get(0).selectionEnd = start + 1;
                }
            });
        }());

    });
}


