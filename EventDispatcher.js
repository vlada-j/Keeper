class EventDispatcher {

	_listeners = {}

	on(type, cb) {
		if (typeof type === 'string' && typeof cb === 'function') {
			type = type.toLowerCase();
			this._listeners[type] = this._listeners[type] || [];
			this._listeners[type].push(cb);
		}
	}

	off(type, cb) {
		type = typeof type === 'string' ? type.toLowerCase() : type;
		if (this._listeners[type] && typeof cb === 'function') {
			this._listeners[type] = this._listeners[type].filter(_cb => _cb !== cb)
		}
	}

	_trigger(type, data) {
		const e = this._listeners[type] || [];
		e.forEach(cb => cb({ type, data }));
	}
}

export default EventDispatcher
