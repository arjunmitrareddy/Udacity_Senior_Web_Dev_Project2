/**
 * Created by arjunMitraReddy on 7/11/2016.
 */
/*
    Notificaiton Process:
    1) Get Main Container From TransportController
    2) Add <div class="notification"></div> to Main Container in Notifications Constructor
    3) Add Notification Body to above Div in Notification Constructor
 */
import rangeCreator from './../utils/rangeCreator';
import notificationTemplate from './../../../templates/notification.hbs';
import _defaults from 'lodash/object/defaults';
import transition from 'simple-transition';
import closest from 'closest';

function Notification(text, duration, buttons) {

    this.container = rangeCreator(notificationTemplate({ //take the notification template and create fragment and return first child
        text: text,
        buttons: buttons
    })).firstChild;

    this.answer = new Promise((resolve) => {
        this._answerResolver = resolve;
    });

    this.gone = new Promise((resolve) => {
        this._goneResolver = resolve;
    });

    if (duration) {
        this._hideTimeout = setTimeout(() => {
            this.hide();
        }, duration);
    }

    this.container.addEventListener('click', (event) => {
        var button = closest(event.target, 'button', true);
        if (!button) return;
        this._answerResolver(button.textContent);
        this.hide();
    })
}

Notification.prototype.hide = function() {
    clearTimeout(this._hideTimeout);
    this._answerResolver();

    transition(this.container, {
        opacity: 0
    }, 0.3, 'ease-out').then(this._goneResolver);

    return this.gone;
};

export default function Notifications(containerFromOuter) {
    this._container = rangeCreator('<div class="notifications"></div>').firstChild;
    containerFromOuter.appendChild(this._container); //append div to main
}

Notifications.prototype.show = function(message, options) {
    options = _defaults({}, options, {
        duration: 0,
        buttons: ['dismiss']
    });

    var notification = new Notification(message, options.duration, options.buttons);
    this._container.appendChild(notification.container); //add body of notification to div

    transition(notification.container, {
        opacity: 1
    }, 0.5, 'ease-out');

    notification.gone.then(() => {
        notification.container.parentNode.removeChild(notification.container);
    });

    return notification;
};