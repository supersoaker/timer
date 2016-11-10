import TimerApp from './App.js';

export default function init() {
    jQuery(document).ready(function($) {

        TimerApp.init();

        (function addTextAreaTabFix() {
            $(document).delegate('textarea', 'keydown', function(e) {
                var keyCode = e.keyCode || e.which;

                // If tab key was clicked
                if (keyCode == 9) {
                    e.preventDefault();
                    var start = $(this).get(0).selectionStart;
                    var end = $(this).get(0).selectionEnd;

                    // set text are value to: text before caret + tab + text after caret
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


