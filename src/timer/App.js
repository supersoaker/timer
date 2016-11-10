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
            'start-date' : 0
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
    }

    static initializeTimerOptions() {
        let html = '';
        let i = 0;

        // Iterate the options for minutes and second from 0 to 59
        for(i; i<60; i++)
            html += '<option value="'+i+'">'+i+'</option>';

        $('.minute-selector, .second-selector').html(html);

        // Iterate the options for hours from 0 to 23
        for(i = 0, html = ''; i<25; i++)
            html += '<option value="'+i+'">'+i+'</option>';

        $('.hour-selector').html(html);
    };


    static setListener() {
        $('#finished-editing').on('click', TimerApp.updateTimer);
        $('#edit-timer').on('click', function() {
            // Get current active timer
            TimerApp.showPage('edit', $('.navigation .collection a.active').data('id'));
        });
    }

    static fillDetailPage(id) {
        let timer = TimerApp.timerCollection[id];
        for (let key in timer) {
            $('#detail').find('.' + key).html(timer[key]);
        }
    }

    static fillEditPage(id) {
        let timer = TimerApp.defaultTimer;

        // If id is set => load content for given timer
        if(id) {
            timer = TimerApp.timerCollection[id];
        }
        for (let key in timer) {
            $('#edit').find('.' + key).val(timer[key]);
        }
    }

    static getTimerFromEditPage() {
        let timer = TimerApp.defaultTimer;
        for (let key in timer) {
            timer[key] = $('#edit').find('.' + key).val();
        }
        return timer;
    }

    static updateTimer() {
        let timer = TimerApp.getTimerFromEditPage();

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
        TimerApp.updateStorage();
        TimerApp.showPage('detail', timer.id);
    }

    static updateStorage() {
        TimerApp.loadDataLayout();
        // Only get the collection when starting the application
        if ($.isEmptyObject(TimerApp.timerCollection)) {
            storage.get(collectionStorageName, function(error, data) {
                if (error) throw error;

                console.log('Got data from storage: ', data);
                TimerApp.timerCollection = data;
                TimerApp.updateLayout();
            });
        } else {
            // Otherwise set the new timer collection
            storage.set(collectionStorageName, TimerApp.timerCollection, function(error) {
                if (error) throw error;

                TimerApp.updateLayout();
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
                $collection.find('a').removeClass('active');
                $collection.find('a[data-id="'+ id +'"]').addClass('active');
            });
            $collection.append($newLink);
        }
    }

    static showPage(name, timerId) {
        // Hide all other pages
        $('.content .card-panel').hide();
        $('.content').find('#'+ name).show();

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