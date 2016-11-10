let TimerAppInstance = null;

export default class TimerApp {

    /**
     * enable singleton pattern
     */
    static getInstance() {
        if(!TimerAppInstance) {
            TimerAppInstance = new TimerApp();
        }
        return TimerAppInstance;
    }

    get defaultTimer () {
        return {
            'title': 't',
            'description': 'e',
            'hour-selector': 0,
            'minute-selector': 0,
            'second-selector': 0
        };
    };

    fillDetailPage() {
        for (var key in this.defaultTimer) {
            $('#edit').find('#' + key).val(this.defaultTimer[key]);
            console.log('#' + key, '=>', this.defaultTimer[key]);
        }

        this.updateMaterialSelects();
    }

    updateMaterialSelects() {
        // Reinitialize material design selects
        $('select').material_select('destroy');
        $('select').material_select();
    }
}