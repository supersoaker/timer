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
        TimerApp.updateStorage();
    }

    static setListener() {
        $('#finished-editing').on('click', TimerApp.updateTimer);
    }

    static fillDetailPage(id) {
        let timer = TimerApp.timerCollection[id];
        for (let key in timer) {
            $('#edit').find('.' + key).val(timer[key]);
        }
        TimerApp.updateMaterialDesign();
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
        console.log(timer);

        if(timer.id){
            // update
            TimerApp.timerCollection[timer.id] = timer;
        } else {
            // create
            let uniqueId = Math.random().toString(36).substring(7);
            // Create unique id as long as an element exists
            while(TimerApp.timerCollection[uniqueId]) {
                uniqueId = Math.random().toString(36).substring(7);
            }
            timer.id = uniqueId;
            TimerApp.timerCollection[uniqueId] = timer;
        }
        TimerApp.updateStorage();
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
                TimerApp.fillDetailPage(id);
                $collection.find('a').removeClass('active');
                $collection.find('a[data-id="'+ id +'"]').addClass('active');
            });
            $collection.append($newLink);
        }
    }

    static updateMaterialDesign() {
        // Reinitialize material design selects
        $('select').material_select('destroy');
        $('select').material_select();

        // Update layouts of text fields
        Materialize.updateTextFields();
    }
}