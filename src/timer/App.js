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


}