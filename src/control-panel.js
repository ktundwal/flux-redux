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