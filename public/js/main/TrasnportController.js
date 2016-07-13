/**
 * Created by arjunMitraReddy on 7/11/2016.
 */
import idb from 'idb';
import NotificationsView from './NotificationController';
import InfopanelController from './InfopanelController';
export default function TransportController(container) {
    this._container = container;
    this._notificationView = new NotificationsView(this._container); //send main container to NotificationController
    this._registerServiceWorker();
    Promise.all([
        this._dbPromise = setupIDBStores(),
        this._createStopsIDB(),
        this._createStopTimesIDB()
    ]).then(() => {
        this._InfopanelController = new InfopanelController(this._dbPromise);
    });
}
/**************************************************************************************************SERVICE WORKER STUFF *****************************************************************************/
TransportController.prototype._registerServiceWorker = function() {
  if (!navigator.serviceWorker) {
      return;
  }
  navigator.serviceWorker.register('/serviceWorker.js').then((registrationObject) => {
     if (!navigator.serviceWorker.controller) {
         return;
     }
     if (registrationObject.waiting) { //means service worker is ready to be updated
        this._updateView(registrationObject.waiting);
     }
     if (registrationObject.installing) {
         this._trackInstall(registrationObject.installing);
         return;
     }
     registrationObject.addEventListener('updatefound', () => {
         this._trackInstall(registrationObject.installing);
     });
     navigator.serviceWorker.controller.addEventListener('controllerchange', () => {
         window.location.reload();
      });
  });
};
TransportController.prototype._trackInstall = function(worker) {
    worker.addEventListener('statechange', () => {
        if (worker.state == 'installed') {
            this._updateView(worker);
        }
    })
};
TransportController.prototype._updateView = function(worker) {
    var notification = this._notificationView.show("New Version Available", {
        buttons: ['refresh', 'dismiss']
    });
    notification.answer.then((answer) => {
        if (answer != 'refresh') {
            return;
        }
        worker.postMessage({skipWait: true});
    })

};

/**************************************************************************************************IDB CREATIONS *****************************************************************************/
function setupIDBStores() {
    if (!navigator.serviceWorker) {
        return Promise.resolve();
    }

    return idb.open('trains', 1, (upgradeDb) => {
        console.log("Entered");
        var stopsStore = upgradeDb.createObjectStore('stops', {
            keyPath: 'stop_id'
        });
        var stopsTimesStore = upgradeDb.createObjectStore('stop_times', {
            keyPath: 'stop_time_id'
        });
        var tripsStore = upgradeDb.createObjectStore('trips', {
            keyPath: 'trip_id'
        });
    })
}
TransportController.prototype._createStopsIDB = function() {
    $.ajax({
        url: 'gtfs/stops.json',
        success: (data) => {
            var stops = data;
            this._dbPromise.then((db) => {
                if (!db) return;
                var stopsStore = db.transaction('stops', 'readwrite').objectStore('stops');
                stops.forEach((stop) => {
                    stopsStore.put(stop);
                });
            });
        }
    });
};
TransportController.prototype._createStopTimesIDB = function() {
    $.ajax({
        url: 'gtfs/stop_times.json',
        success: (data) => {
            var stops_times = data;
            this._dbPromise.then((db) => {
                if (!db) return;
                var stopsTimesStore = db.transaction('stop_times', 'readwrite').objectStore('stop_times');
                var count = 0;
                stops_times.forEach((stopTime) => {
                    count++;
                    var stopTimeExt = $.extend(true, {stop_time_id: count}, stopTime);
                    stopsTimesStore.put(stopTimeExt);
                });
            });
        }
    });
};