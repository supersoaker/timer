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
            'title': 't',
            'description': 'e',
            'hour-selector': 0,
            'minute-selector': 0,
            'second-selector': 0
        };
    }

    static timerCollection = {};

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

    static fillDetailPage() {
        for (let key in TimerApp.defaultTimer) {
            $('#edit').find('#' + key).val(TimerApp.defaultTimer[key]);
            console.log('#' + key, '=>', TimerApp.defaultTimer[key]);
        }

        TimerApp.updateMaterialSelects();
    }

    static getTimerFromEditPage() {
        let timer = TimerApp.defaultTimer;
        for (let key in timer) {
            timer[key] = $('#edit').find('#' + key).val();
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
            TimerApp.timerCollection.push(timer);
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
    }

    static updateMaterialSelects() {
        // Reinitialize material design selects
        $('select').material_select('destroy');
        $('select').material_select();
    }
}