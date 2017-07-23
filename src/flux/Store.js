export class Store {
    constructor(dispatcher) {
        this.__listeners = []
        this.__state = this.getInitialState()
        dispatcher.register(this.__onDispatch.bind(this))
    }

    __onDispatch() {
        throw new Error ('Subclass must override __onDispatch method of a Flux store')
    }

    getInitialState() {
        throw new Error ('Subclass must override getInitialState method of a Flux store')
    }

    addListener(listener) {
        this.__listeners.push(listener)
    }

    __emitChange() {
        this.__listeners.forEach(listener => listener(this.__state))
    }
}