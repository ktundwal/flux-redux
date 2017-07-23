# My impressions

I get the point about React; its a View library (aka 'V' in 'MVC' paradigm). To fill the void, industry has come up with Redux for state management ('MC' in 'MVC').

I am learning Redux and found a PluralSight course that walks you through implementing the pattern/framework (whatever you want to call it) from scratch. 

As I implemented this myself (code attached), I found huge similarities with _pub-sub_ and _observer patterns_ that is commonly used in user facing apps (regardless of tech stack, web app or native, mobile or desktop). 

Common theme is use of `messaging` (called `actions`) and `callbacks` (similar to `listener` and `dispatcher`) as opposed to holding `direct reference` of the object and doing mutations on them (promotes loose coupling)

# ASKs:

* __Redux or not__: I am curious if Office has a library/agreed upon design patterns to do something similar for apps that use React (primarily for Office UI Fabric). There must be a need since, like I said, React is just a view library. Sure, all of us can take dependencies on Redux. And most likely this is what other teams might be doing. Just want to do due diligence here before we take this dependency. 
* __TypeScript or not__: This course used JavaScript (ES6) and NOT TypeScript. Any learnings from other teams that used TypeScript with React and Redux. Sure we can write code in TypeScript but thats not what I see in top react related posts and tutorials that show up on search engines. Coming from C#, I love TypeScript and rely upon tooling to tell me that I just wrote bad code. In JavaScript all bets are off; bugs will show up at runtime. 

# Course notes

These are my notes from https://app.pluralsight.com/player?course=flux-redux-mastering. Following is covered
* implement a Flux store and dispatcher from scratch without using any libraries (pure JavaScript code)
* implement a simple app that has 2 controls: a text box and 2 radio buttons
    * use actions to desribe state changes (eg: when user adds a text to text box)
    * send all changes to state through dispatcher (no component to component communication)

## Flux components

### Dispatcher
- maintains a list of `listeners`. offers `register()` method to register listeners
- has `dispatch()` method which takes an `action` as input param. When client code calls `dispatch()` all `listeners` will get called with `action` as input param

```javascript
export class Dispatcher {
    constructor() {
        this.__listeners = [];
    }
    dispatch(action) {
        this.__listeners.forEach(listener => listener(action))
    }
    register(listener) {
        this.__listeners.push(listener)
    }
}
```

### Store
* an abstract class that must be extended. Derived classes must implement following
    * `getInitialState()` : self explanatory. `Store` is a base class, doesnt define any state
    * `__onDispatch()` 
* requires a `dispatcher` as input param for its `constructor`
    * registers itself as a `listener` to provided `dispatcher`
    * calls `getInitialState()` (must be implemented by derived classes) and stores it as `__state` (own state)
    * just like `Dispatcher`, maintains a list of `listeners`. offers `addListener()` method to register listeners. All these listenerns will be called from `__emitChange()`
* implementes `__emitChange()` which will be used by derived classes when they change the state.

```javascript
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
```

## An application
This is a user application that uses above components for state management. This application has a 2 controls: a text box and 2 radio buttons

* First thing to do is import classes defined above
* Second, instantiate the `Dispatcher`
* Third, define actions that will be used to notify what changed in this app. These actions are JavaScript objects
* Fourth, find an element in its `html` and do following when user interacts with it
    * get the new value of the control
    * call `Dispatcher.dispatch()` with a `const` string that defines what this action means. In this case it would be `TODO_FONTUPDATEACTION`
* Fifth, create a store by extending `Store` class and instantiate it
    * implement `getInitialState()` as required by the `Store` class
    * implement `__onDispatch()` as required by the store. This is what `Dispatcher.dispatch()` will call when action is received. Do following in this method
        * log to console that it received an action
        * depending upon action type, update the state
        * call `__emitChange` to let all listeners know that state changed. This allows store not to know about what all views needs an update. _Reminder: dont confuse these listeners with `Dispatcher` listeners. They are different_ 
    * offer a `getter` that will return `__state` from base class. _Reminder: Base `Store` class simply holds whatever state derived class defines in `__state`_. In this case its a JavaScript `object` which has 2 keys: `userName` and `fontSize`
* Lastly, implement a `listener` to its own store. This method will update the view using `render` method. _note similarity with React's render method_

```javascript
// This is a user app code that uses flux components. Import them
import  {Dispatcher, Store} from './flux'

// Instantiate a dispatcher for this app
const controlPanelDispatcher = new Dispatcher()

// Define actions that will be used to notify what changed in this app.
// These actions are JavaScript objects
const UPDATE_USERNAME = `UPDATE_USERNAME`
const UPDATE_FONT_SIZE_PREFERENCE = `UPDATE_FONT_SIZE_PREFERENCE`
const userNameUpdateAction = (name) => {
    return {
        type: UPDATE_USERNAME,
        value: name
    }
}

const fontSizePreferenceUpdateAction = (size) => {
    return {
        type: UPDATE_FONT_SIZE_PREFERENCE,
        value: size
    }
}

// Dispatch these actions when view element's state changes
document.getElementById('userNameInput').addEventListener(`input`, ({target}) => {
    const name = target.value
    console.log('Dispatching ...', name)
    controlPanelDispatcher.dispatch(userNameUpdateAction(name))
})

document.forms.fontSizeForm.fontSize.forEach(element => {
    element.addEventListener(`change`, ({target}) => {
        controlPanelDispatcher.dispatch(fontSizePreferenceUpdateAction(target.value))
    })
})

// Implement a store using Flux store and implement required methods
class UserPrefsStore extends Store {
    getInitialState() {
        return {
            userName: "Jim",
            fontSize: "small"
        }
    }

    // This method will be called by Dispatcher.
    // For each action, update the state and emit changes
    __onDispatch(action) {
        console.log('Store received to dispatch', action)
        switch (action.type) {
            case UPDATE_USERNAME:
                this.__state.userName = action.value
                this.__emitChange()
                break
            case UPDATE_FONT_SIZE_PREFERENCE:
                this.__state.fontSize = action.value
                this.__emitChange()
                break
        }
    }

    // a getter to get our app state
    getUserPreferences() {
        return this.__state
    }
}

const userPrefsStore = new UserPrefsStore(controlPanelDispatcher)

// Add a listener to our own store. This will be called when store changes.
// update the view of our app when that happens
userPrefsStore.addListener((state) => {
    console.info('Going to update the view with state ...', state)
    render(state)
})

// this method will update the view. note similarity with React's render method
const render = ({userName, fontSize}) => {
    document.getElementById('userName').innerText = userName
    document.getElementsByClassName('container')[0].style.fontSize = fontSize == 'small' ? '16px' : '24px'
    document.forms.fontSizeForm.fontSize.value = fontSize
}
```

