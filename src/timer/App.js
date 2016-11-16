let TimerAppInstance = null;
const storage = require('electron-json-storage');
const collectionStorageName = 'timer-collection';


export default class TimerApp {
    /**
     * Get timer object
     */
    static get defaultTimer() {
        return {
            'id': 0,
            'title': '',
            'description': '',
            'type': 'timer',
            'hour-selector': 0,
            'minute-selector': 0,
            'second-selector': 0,
            'end-time-stamp' : 0,
            'is-active': 0
        };
    }

    /**
     * initialize the application
     */
    static init() {
        TimerApp.setListener();
        TimerApp.initializeTimerOptions();
        TimerApp.updateStorage();
        TimerApp.showPage('edit');
        TimerApp.startNotificationChecker();
    }

    static initializeTimerOptions() {
        let html = '';
        let i = 0;

        // Iterate the options for minutes and second from 0 to 59
        for(i; i<60; i++)
            html += '<option value="'+i+'">'+i+'</option>';

        $('#minute-selector, #second-selector').html(html);

        // Iterate the options for hours from 0 to 23
        for(i = 0, html = ''; i<25; i++)
            html += '<option value="'+i+'">'+i+'</option>';

        $('#hour-selector').html(html);
    };

    static startNotificationChecker() {
        setInterval(function() {
            for (let id in TimerApp.timerCollection) {
                let timer = TimerApp.timerCollection[id];
                let currentDate = new Date();
                let diff = timer['end-time-stamp'] - currentDate.getTime() / 1000;
                if(timer['end-time-stamp'] !== 0 && diff <= 0) {
                    if(timer.type == 'timer') {
                        if(timer.type == 'interval') {
                            timer['end-time-stamp'] = TimerApp.getTimerEnd(timer);
                        } else
                        // Update view of current detail timer, if it is an interval
                        timer['end-time-stamp'] = 0;
                    } else {
                        return;
                    }
                    new Notification(timer.title, {
                        title: timer.title,
                        body: timer.description
                    });
                    TimerApp.timerCollection[timer.id] = timer;
                    TimerApp.fillDetailPage();
                    TimerApp.updateStorage(() => {}, false);
                }
            }
        }, 1000);
    }

    static setListener() {
        $('#create-timer').on('click', () => { TimerApp.showPage('edit') });
        $('#update-timer').on('click', TimerApp.updateTimer);
        $('#delete-timer').on('click', TimerApp.deleteTimer);
        $('#activate').on('click', TimerApp.activateTimer);
        $('#edit-timer').on('click', function() {
            // Get current active timer
            TimerApp.showPage('edit', TimerApp.getCurrentTimerId());
        });
    }

    static fillDetailPage(id = TimerApp.getCurrentTimerId(), newEndTime = false) {
        let timer = TimerApp.timerCollection[id];
        let $detail = $('#detail');
        for (let key in timer) {
            $detail.find('.' + key).html(timer[key]);
            // If the content is empty => don't show the box
            timer[key] == '' ?
                $detail.find('.' + key).hide() :
                $detail.find('.' + key).show();
        }
        let endTimeStamp = newEndTime ? newEndTime : timer['end-time-stamp'];
        let currentDate = new Date();
        let diff = endTimeStamp - currentDate.getTime() / 1000;
        if(diff <= 0) {
            diff = 0;
            $('#activate').prop('checked', false);
        } else {
            $('#activate').prop('checked', true);
        }
        let clock = $('#clock-container').FlipClock(diff, {
            countdown: true
        });
    }

    static fillEditPage(id) {
        let timer = TimerApp.defaultTimer;
        let $deleteBtn = $('#delete-timer');
        let $edit = $('#edit');

        // If id is set => load content for given timer
        if(id) {
            timer = TimerApp.timerCollection[id];
            $deleteBtn.show();
        } else {
            // If it is create new page
            $deleteBtn.hide();
            let $collection = $('#timer-navigation');
            $collection.find('a').removeClass('active');
        }
        for (let key in timer) {
            $edit.find('#' + key).val(timer[key]);
        }
    }

    static activateTimer() {
        let timer = TimerApp.timerCollection[ TimerApp.getCurrentTimerId() ];
        let timerEnd = 0;
        if($('#activate').is(':checked')) {
            // activate the timer
            timerEnd = TimerApp.getTimerEnd(timer);
        }
        timer['end-time-stamp'] = timerEnd;
        TimerApp.fillDetailPage(TimerApp.getCurrentTimerId(), timerEnd);
        TimerApp.timerCollection[ TimerApp.getCurrentTimerId() ] = timer;
    }

    static getTimerFromEditPage() {
        let timer = TimerApp.defaultTimer;
        let $edit = $('#edit');
        // Iterate all elements and get values from classes
        for (let key in timer) {
            timer[key] = $edit.find('#' + key).val();
        }
        return timer;
    }

    static getCurrentTimerId() {
        return $('#timer-navigation a.active').data('id');
    }

    static deleteTimer() {
        console.log(TimerApp.timerCollection);
        delete TimerApp.timerCollection[TimerApp.getCurrentTimerId()];
        console.log(TimerApp.timerCollection);
        TimerApp.updateStorage();
        TimerApp.showPage('edit');
    }

    static getTimerEnd(timer) {
        var current = new Date ();
        var endTime = new Date ( current );
        endTime.setHours( current.getHours() + parseInt(timer['hour-selector']) );
        endTime.setMinutes( current.getMinutes() + parseInt(timer['minute-selector']) );
        endTime.setSeconds( current.getSeconds() + parseInt(timer['second-selector']) );
        return Math.floor(endTime.getTime() / 1000);
    }

    static updateTimer() {
        let timer = TimerApp.getTimerFromEditPage();

        // If no title is set exit
        if(!timer.title) {
            TimerApp.showPage('edit');
            return;
        }

        // Recalculate the end time
        timer['end-time-stamp'] = TimerApp.getTimerEnd(timer);

        if(!timer.id || timer.id == '0'){
            // create
            let uniqueId = Math.random().toString(36).substring(7);
            // Create unique id as long as an element exists
            while(TimerApp.timerCollection[uniqueId]) {
                uniqueId = Math.random().toString(36).substring(7);
            }
            timer.id = uniqueId;
            TimerApp.timerCollection[uniqueId] = timer;
        } else {
            // update
            TimerApp.timerCollection[timer.id] = timer;
        }
        TimerApp.updateStorage(() => {
            TimerApp.showPage('detail', timer.id);
        });
    }

    static updateStorage(callback = function() {}, updateLayout = true) {
        TimerApp.loadDataLayout();
        // Only get the collection when starting the application
        if (typeof TimerApp.timerCollection == 'undefined') {
            storage.get(collectionStorageName, function(error, data) {
                if (error) throw error;

                console.log('Got data from storage: ', data);
                TimerApp.timerCollection = data;
                if(updateLayout){
                    TimerApp.updateLayout();
                }
                callback();
            });
        } else {
            // Otherwise set the new timer collection
            storage.set(collectionStorageName, TimerApp.timerCollection, function(error) {
                if (error) throw error;

                if(updateLayout){
                    TimerApp.updateLayout();
                }
                callback();
            });
        }
    }

    static loadDataLayout() { /* Maybe for ajax spinner or something. */ }

    static updateLayout() {
        // here goes the layout.
        console.log('Updating layout with following timers:', TimerApp.timerCollection);

        // Update timer navigation
        let navigationList = '';
        let $collection = $('#timer-navigation');

        // Clear all elements in navigation
        $collection.empty();
        for (var id in TimerApp.timerCollection) {
            let timer = TimerApp.timerCollection[id];
            let $newLink = $('<a href="#!" data-id="'+ timer.id +'" class="collection-item">'+ timer.title +'</a>');

            // Add on click listener on each detail link
            $newLink.on('click', function() {
                let id = this.getAttribute('data-id');
                TimerApp.showPage('detail', id);
            });
            $collection.append($newLink);
        }
        if($.isEmptyObject(TimerApp.timerCollection)) {
            $collection.hide();
        } else {
            $collection.show();
        }
    }

    static showPage(name, timerId) {
        // Hide all other pages
        $('.content > .page').hide();
        $('.content').find('#'+ name).show();

        // Update active navigation element
        if(name == 'detail'){
            let $collection = $('#timer-navigation');
            $collection.find('a').removeClass('active');
            $collection.find('a[data-id="'+ timerId +'"]').addClass('active');
        }

        // Capitalize and execute fill page method
        name = name[0].toUpperCase() + name.slice(1);
        TimerApp[`fill${name}Page`](timerId);

        // Update all changing material design elements
        TimerApp.updateMaterialDesign();
    }

    static updateMaterialDesign() {
        // Reinitialize material design selects
        $('select').material_select('destroy');
        $('select').material_select();

        // Update layouts of text fields
        Materialize.updateTextFields();
    }
}