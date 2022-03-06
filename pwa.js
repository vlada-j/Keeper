import EventDispatcher from "./EventDispatcher.js"

class PWA extends EventDispatcher {

	_listeners = {
		ready: [],
		installed: []
	}

	_isReady = false
	_readyEvent = false

	_deferredPrompt = null

	constructor() {
		super()
		window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt.bind(this));

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/sw.js')
				.then(e => this._trigger('installed', e));
		}
	}

	on(type, cb) {
		super.on(type, cb);

		if (typeof type === 'string' && typeof cb === 'function' && type === 'ready' && this._isReady) {
			this._trigger('ready', this._readyEvent);
		}
	}

	onBeforeInstallPrompt(event) {
		event.preventDefault();
		this._deferredPrompt = event;
		this._readyEvent = event;
		if (!this._isReady) {
			this._trigger('ready', event);
			this._isReady = true;
		}
	}

	install() {
		if ( !this._deferredPrompt ) return Promise.resolve();

		return new Promise(resolve => {
			this._deferredPrompt.prompt();
			this._deferredPrompt.userChoice
				.then(choiceResult => {
					resolve(choiceResult.outcome) // 'accepted', 'dismissed'
					this._deferredPrompt = null;
					this._trigger(choiceResult.outcome, choiceResult);
				});
		})
	}
}

export default new PWA();
