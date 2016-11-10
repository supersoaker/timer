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
            'hour-selector': 0,
            'minute-selector': 0,
            'second-selector': 0,
            'end-date' : 0
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
                let diff = timer['end-time'] - currentDate.getTime() / 1000;
                if(timer['end-time'] !== 0 && diff < 0) {
                    new Notification(timer.title, {
                        title: timer.title,
                        body: timer.description,
                        //icon: path.join(__dirname, 'icon.png')
                    });
                    timer['end-time'] = 0;
                    TimerApp.updateTimer(timer);
                    TimerApp.timerCollection[timer.id] = timer;
                    TimerApp.updateStorage();
                }
            }
        }, 1000);
    }

    static setListener() {
        $('#update-timer').on('click', TimerApp.updateTimer);
        $('#delete-timer').on('click', TimerApp.deleteTimer);
        $('#edit-timer').on('click', function() {
            // Get current active timer
            TimerApp.showPage('edit', TimerApp.getCurrentTimerId());
        });
    }

    static fillDetailPage(id) {
        let timer = TimerApp.timerCollection[id];
        for (let key in timer) {
            $('#detail').find('.' + key).html(timer[key]);
            // If the content is empty => don't show the box
            timer[key] == '' ?
                $('#detail').find('.' + key).hide() :
                $('#detail').find('.' + key).show();
        }

        let currentDate = new Date();
        let diff = timer['end-time'] - currentDate.getTime() / 1000;
        if(diff < 0) {
            diff = 0;
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
        }
        for (let key in timer) {
            $('#edit').find('.' + key).val(timer[key]);
        }

        // Selectors have to be selected with ids because of materialize css
        $edit.find('#hour-selector').val(timer['hour-selector']);
        $edit.find('#minute-selector').val(timer['minute-selector']);
        $edit.find('#second-selector').val(timer['second-selector']);
    }

    static getTimerFromEditPage() {
        let timer = TimerApp.defaultTimer;
        let $edit = $('#edit');
        // Iterate all elements and get values from classes
        for (let key in timer) {
            timer[key] = $edit.find('.' + key).val();
        }
        // Selectors have to be selected with ids because of materialize css
        timer['hour-selector'] = $edit.find('#hour-selector').val();
        timer['minute-selector'] = $edit.find('#minute-selector').val();
        timer['second-selector'] = $edit.find('#second-selector').val();
        return timer;
    }

    static getCurrentTimerId() {
        return $('.navigation .collection a.active').data('id');
    }

    static deleteTimer() {
        delete TimerApp.timerCollection[TimerApp.getCurrentTimerId()];
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
        timer['end-time'] = TimerApp.getTimerEnd(timer);

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

    static updateStorage(callback = function() {}) {
        TimerApp.loadDataLayout();
        // Only get the collection when starting the application
        if ($.isEmptyObject(TimerApp.timerCollection)) {
            storage.get(collectionStorageName, function(error, data) {
                if (error) throw error;

                console.log('Got data from storage: ', data);
                TimerApp.timerCollection = data;
                TimerApp.updateLayout();
                callback();
            });
        } else {
            // Otherwise set the new timer collection
            storage.set(collectionStorageName, TimerApp.timerCollection, function(error) {
                if (error) throw error;

                TimerApp.updateLayout();
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
        let $collection = $('.navigation .collection');

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
    }

    static showPage(name, timerId) {
        // Hide all other pages
        $('.content > .page').hide();
        $('.content').find('#'+ name).show();

        // Update active navigation element
        if(name == 'detail'){
            let $collection = $('.navigation .collection');
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